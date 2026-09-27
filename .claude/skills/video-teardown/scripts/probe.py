#!/usr/bin/env python3
"""Forensic probe for video teardown.

Measures - never guesses:
  * container/stream metadata (ffprobe)
  * hard cuts + weak cut candidates (ffmpeg scene score)
  * silence intervals (silencedetect)
  * integrated loudness / LRA / true peak (ebur128)
  * momentary-loudness profile (ebur128 metadata), to locate music entries

Emits one JSON document on stdout. Every field that could not be measured is
null or carries an `error` string. Nothing is inferred.
"""
from __future__ import annotations

import argparse
import json
import os
import re
import shutil
import subprocess
import sys
from pathlib import Path

# ---------------------------------------------------------------- binaries


def _winget_candidates(name):
    """Windows: winget drops binaries under LOCALAPPDATA without touching the
    PATH of already-running shells. Look there before giving up."""
    root = os.environ.get("LOCALAPPDATA")
    if not root:
        return []
    pkgs = Path(root) / "Microsoft" / "WinGet" / "Packages"
    if not pkgs.is_dir():
        return []
    return sorted(pkgs.glob("**/" + name + ".exe"))


def resolve(name):
    found = shutil.which(name)
    if found:
        return found
    for cand in _winget_candidates(name):
        return str(cand)
    return None


def run(cmd, timeout=1800):
    """Run a command, merging stderr into stdout (ffmpeg filters log to stderr)."""
    proc = subprocess.run(
        cmd, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, timeout=timeout
    )
    return proc.returncode, proc.stdout.decode("utf-8", "replace")


# ---------------------------------------------------------------- probes


def probe_metadata(ffprobe, src):
    code, out = run(
        [ffprobe, "-v", "error", "-print_format", "json",
         "-show_format", "-show_streams", src]
    )
    if code != 0:
        return {"error": out.strip()[:2000]}
    try:
        raw = json.loads(out)
    except json.JSONDecodeError as exc:
        return {"error": "unparseable ffprobe json: " + str(exc)}

    fmt = raw.get("format", {})
    streams = []
    for s in raw.get("streams", []):
        entry = {
            "index": s.get("index"),
            "type": s.get("codec_type"),
            "codec": s.get("codec_name"),
            "profile": s.get("profile"),
        }
        if s.get("codec_type") == "video":
            entry.update(
                width=s.get("width"),
                height=s.get("height"),
                r_frame_rate=s.get("r_frame_rate"),
                avg_frame_rate=s.get("avg_frame_rate"),
                pix_fmt=s.get("pix_fmt"),
                nb_frames=s.get("nb_frames"),
            )
        elif s.get("codec_type") == "audio":
            entry.update(
                sample_rate=s.get("sample_rate"),
                channels=s.get("channels"),
                channel_layout=s.get("channel_layout"),
            )
        elif s.get("codec_type") == "subtitle":
            entry.update(language=(s.get("tags") or {}).get("language"))
        streams.append(entry)

    duration = fmt.get("duration")
    aspect = None
    vid = None
    for s in streams:
        if s["type"] == "video":
            vid = s
            break
    if vid and vid.get("width") and vid.get("height"):
        aspect = round(vid["width"] / vid["height"], 4)

    return {
        "path": src,
        "duration_s": float(duration) if duration else None,
        "size_bytes": int(fmt["size"]) if fmt.get("size") else None,
        "bit_rate": int(fmt["bit_rate"]) if fmt.get("bit_rate") else None,
        "format_name": fmt.get("format_name"),
        "aspect_ratio": aspect,
        "is_vertical": (aspect is not None and aspect < 1),
        "streams": streams,
        "has_embedded_subtitle_stream": any(s["type"] == "subtitle" for s in streams),
        "tags": fmt.get("tags", {}),
    }


_PTS = re.compile(r"pts_time:([0-9.]+)")
_SCORE = re.compile(r"lavfi\.scene_score=([0-9.]+)")


def probe_cuts(ffmpeg, src, threshold):
    """Scene-change detection. Returns every frame whose scene score exceeds
    `threshold`, with its score, so the caller separates hard cuts from weak
    candidates without re-running ffmpeg."""
    expr = "select='gt(scene," + str(threshold) + ")',metadata=print:file=-"
    code, out = run(
        [ffmpeg, "-hide_banner", "-nostats", "-i", src,
         "-filter:v", expr, "-an", "-f", "null", "-"]
    )
    if code != 0:
        return {"error": out.strip()[-2000:]}

    events = []
    pending_t = None
    for line in out.splitlines():
        m = _PTS.search(line)
        if m:
            pending_t = float(m.group(1))
            continue
        m = _SCORE.search(line)
        if m and pending_t is not None:
            events.append({"t": round(pending_t, 3), "score": round(float(m.group(1)), 4)})
            pending_t = None
    return {"threshold": threshold, "events": events}


_SIL_START = re.compile(r"silence_start:\s*(-?[0-9.]+)")
_SIL_END = re.compile(r"silence_end:\s*(-?[0-9.]+)\s*\|\s*silence_duration:\s*([0-9.]+)")


def probe_silence(ffmpeg, src, noise_db, min_dur):
    flt = "silencedetect=noise=" + str(noise_db) + "dB:d=" + str(min_dur)
    code, out = run(
        [ffmpeg, "-hide_banner", "-nostats", "-i", src, "-af", flt, "-f", "null", "-"]
    )
    if code != 0:
        return {"error": out.strip()[-2000:]}

    intervals = []
    start = None
    for line in out.splitlines():
        m = _SIL_START.search(line)
        if m:
            start = float(m.group(1))
            continue
        m = _SIL_END.search(line)
        if m:
            end = float(m.group(1))
            dur = float(m.group(2))
            intervals.append({
                "start": round(start if start is not None else end - dur, 3),
                "end": round(end, 3),
                "duration": round(dur, 3),
            })
            start = None
    if start is not None:
        intervals.append({"start": round(start, 3), "end": None, "duration": None})
    return {"noise_db": noise_db, "min_duration": min_dur, "intervals": intervals}


_LOUD = {
    "integrated_lufs": re.compile(r"I:\s*(-?[0-9.]+)\s*LUFS"),
    "loudness_range_lu": re.compile(r"LRA:\s*(-?[0-9.]+)\s*LU"),
    "true_peak_dbfs": re.compile(r"Peak:\s*(-?[0-9.]+)\s*dBFS"),
}
_MOMENTARY = re.compile(r"lavfi\.r128\.M=(-?[0-9.]+)")


def probe_loudness(ffmpeg, src, sample_every):
    flt = "ebur128=metadata=1:peak=true,ametadata=print:key=lavfi.r128.M"
    code, out = run(
        [ffmpeg, "-hide_banner", "-nostats", "-i", src, "-af", flt, "-f", "null", "-"]
    )
    if code != 0:
        return {"error": out.strip()[-2000:]}

    summary = {}
    tail = out[-4000:]
    for key, rx in _LOUD.items():
        m = rx.search(tail)
        summary[key] = float(m.group(1)) if m else None

    profile = []
    pending_t = None
    last_kept = -1e9
    for line in out.splitlines():
        m = _PTS.search(line)
        if m:
            pending_t = float(m.group(1))
            continue
        m = _MOMENTARY.search(line)
        if m and pending_t is not None:
            t = pending_t
            pending_t = None
            if t - last_kept >= sample_every:
                profile.append({"t": round(t, 2), "M_lufs": round(float(m.group(1)), 1)})
                last_kept = t
    summary["momentary_profile"] = profile
    summary["momentary_sample_every_s"] = sample_every
    return summary


def cut_stats(events, duration, hard_threshold):
    hard = [e for e in events if e["score"] >= hard_threshold]
    times = [e["t"] for e in hard]
    shots = []
    prev = 0.0
    for t in times:
        shots.append(round(t - prev, 3))
        prev = t
    if duration:
        shots.append(round(duration - prev, 3))
    stats = {
        "hard_cut_threshold": hard_threshold,
        "hard_cut_count": len(hard),
        "hard_cut_times": times,
        "shot_count": len(shots),
        "shot_durations_s": shots,
    }
    if shots:
        stats["shot_duration_mean_s"] = round(sum(shots) / len(shots), 3)
        stats["shot_duration_min_s"] = min(shots)
        stats["shot_duration_max_s"] = max(shots)
    if duration and duration > 0:
        stats["cuts_per_minute"] = round(len(hard) / (duration / 60), 2)
    stats["single_take"] = len(hard) == 0
    return stats


def main():
    ap = argparse.ArgumentParser(description="Forensic probe for video teardown")
    ap.add_argument("source", help="Local video file (download first; this does not fetch URLs)")
    ap.add_argument("--scene-floor", type=float, default=0.08,
                    help="Report every scene score above this (default 0.08) so weak "
                         "match-cut candidates surface instead of being silently dropped")
    ap.add_argument("--hard-cut", type=float, default=0.25,
                    help="Score at or above which an event counts as a hard cut (default 0.25)")
    ap.add_argument("--silence-db", type=float, default=-32.0)
    ap.add_argument("--silence-dur", type=float, default=0.35)
    ap.add_argument("--loudness-every", type=float, default=0.5,
                    help="Seconds between momentary-loudness samples (default 0.5)")
    ap.add_argument("--skip-audio", action="store_true",
                    help="Skip silence + loudness probes")
    ap.add_argument("--out", help="Also write the JSON to this path")
    args = ap.parse_args()

    src = str(Path(args.source).resolve())
    if not Path(src).is_file():
        print(json.dumps({"error": "not a file: " + src}), file=sys.stderr)
        return 2

    ffmpeg = resolve("ffmpeg")
    ffprobe = resolve("ffprobe")
    missing = [n for n, p in (("ffmpeg", ffmpeg), ("ffprobe", ffprobe)) if not p]
    if missing:
        print(json.dumps({"error": "missing binaries: " + ", ".join(missing)}), file=sys.stderr)
        return 2

    report = {"tool": "video-teardown/probe.py", "source": src}
    report["metadata"] = probe_metadata(ffprobe, src)
    duration = report["metadata"].get("duration_s")
    has_audio = any(s.get("type") == "audio" for s in report["metadata"].get("streams", []))
    report["has_audio_stream"] = has_audio

    cuts = probe_cuts(ffmpeg, src, args.scene_floor)
    report["scene_events"] = cuts
    if "events" in cuts:
        report["cut_stats"] = cut_stats(cuts["events"], duration, args.hard_cut)
        report["weak_cut_candidates"] = [e for e in cuts["events"] if e["score"] < args.hard_cut]

    if has_audio and not args.skip_audio:
        report["silence"] = probe_silence(ffmpeg, src, args.silence_db, args.silence_dur)
        report["loudness"] = probe_loudness(ffmpeg, src, args.loudness_every)
    else:
        report["silence"] = None
        report["loudness"] = None

    text = json.dumps(report, indent=2, ensure_ascii=False)
    if args.out:
        Path(args.out).parent.mkdir(parents=True, exist_ok=True)
        Path(args.out).write_text(text, encoding="utf-8")
    print(text)
    return 0


if __name__ == "__main__":
    sys.exit(main())
