#!/usr/bin/env python3
"""Local speech-to-text for the video teardown - no API key, no network.

Runs faster-whisper (CTranslate2) on this machine and emits the SAME segment
shape the watch plugin's whisper.py emits, so either transcriber can feed the
teardown:

    {"backend": "...", "model": "...", "device": "...", "segments":
     [{"start": 0.0, "end": 2.4, "text": "..."}]}

Why local matters for a teardown specifically: Hard Rule 6 says timestamps come
from tools, not vibes. Whisper returns measured segment boundaries. Asking a
multimodal chat model to "transcribe with timestamps" returns *estimated* ones,
which is exactly the failure the rule exists to prevent.

Word-level timestamps (--words) are what let you check whether a burned-in
karaoke caption is in sync with the audio, or running ahead of it.
"""
from __future__ import annotations

import argparse
import json
import os
import shutil
import subprocess
import sys
import tempfile
import time
from pathlib import Path

# Model weights MUST live on the SSD. Measured on this machine, same model
# (small, 466 MB), same code: loading from D: (WD10SPZX, spinning disk) took
# 327 s; from C: (NVMe) it took 2.0 s. The venv can live on the slow disk --
# the weights are what gets re-read on every single run.
DEFAULT_MODEL_ROOT = Path.home() / ".cache" / "whisper-local" / "models"
AUDIO_EXTS = {".wav", ".mp3", ".m4a", ".flac", ".ogg", ".opus", ".aac", ".wma"}


def _winget_candidates(name):
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


def extract_audio(src: Path, dest: Path) -> Path:
    """16 kHz mono WAV - what Whisper wants, and lossless at that rate."""
    ffmpeg = resolve("ffmpeg")
    if not ffmpeg:
        raise SystemExit("missing binary: ffmpeg")
    dest.parent.mkdir(parents=True, exist_ok=True)
    cmd = [ffmpeg, "-hide_banner", "-loglevel", "error", "-y",
           "-i", str(src), "-vn", "-ac", "1", "-ar", "16000",
           "-c:a", "pcm_s16le", str(dest)]
    proc = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
    if proc.returncode != 0 or not dest.is_file():
        raise SystemExit(
            "ffmpeg failed to extract audio:\n"
            + proc.stdout.decode("utf-8", "replace").strip()[-1500:]
        )
    return dest


def register_nvidia_dlls() -> list:
    """Windows: the pip-installed CUDA runtime (nvidia-cublas-cu12,
    nvidia-cudnn-cu12) drops its DLLs inside site-packages, which is NOT on the
    DLL search path. Without this, CTranslate2 reports a CUDA device and then
    dies at encode() with 'cublas64_12.dll is not found'. Registering the dirs
    up front is what makes the GPU path actually usable."""
    if not hasattr(os, "add_dll_directory"):
        return []
    registered = []
    for site_dir in sys.path:
        nvidia = Path(site_dir) / "nvidia"
        if not nvidia.is_dir():
            continue
        for sub in sorted(nvidia.glob("*/bin")):
            try:
                os.add_dll_directory(str(sub))
                registered.append(str(sub))
            except OSError:
                pass
    return registered


def device_plan(requested: str) -> list:
    """Ordered (device, compute_type) attempts.

    A GTX 1650 has 4 GB of VRAM: large-v3 in float16 is ~3.1 GB and fits, but
    barely, so int8_float16 sits right behind it as the OOM catch. CPU int8 is
    the floor that always works."""
    cpu = ("cpu", "int8")
    cuda = [("cuda", "float16"), ("cuda", "int8_float16")]
    if requested == "cpu":
        return [cpu]
    try:
        import ctranslate2

        has_cuda = ctranslate2.get_cuda_device_count() > 0
    except Exception:
        has_cuda = False
    if requested == "cuda":
        # explicit request: still keep CPU as the last resort rather than crash
        return cuda + [cpu] if has_cuda else [cpu]
    return (cuda + [cpu]) if has_cuda else [cpu]


def main():
    ap = argparse.ArgumentParser(
        description="Local faster-whisper transcription (no API key)")
    ap.add_argument("source", help="Video OR audio file")
    # medium is what is actually cached on this machine (1.5 GB on the SSD).
    # It is the smallest model measured to get the test clip right: `small`
    # returned "one of the elephants" (p=0.91 on the wrong word) where the
    # official captions say "in front of the elephants". large-v3 would be
    # better still but needs ~3.1 GB, which this C: does not have.
    ap.add_argument("--model", default="medium",
                    help="faster-whisper model: tiny|base|small|medium|large-v3|"
                         "distil-large-v3. Anything not cached is downloaded on "
                         "first use (medium ~48 s, large-v3 several minutes)")
    ap.add_argument("--language", default=None,
                    help="Force a language code (pt, en...). Default: auto-detect")
    # Default is CPU on purpose. On this machine (GTX 1650, driver 581.57)
    # CTranslate2 initialises a CUDA context, allocates 341 MiB, and then HANGS
    # at 0% GPU utilisation - reproduced with tiny/small, with cuBLAS 12.9 +
    # cuDNN 9.25 and with the pinned 12.4.5.8 + 9.1.0.70 pair. A hang is worse
    # than slow: the fallback below catches exceptions, and a hang throws none.
    # Pass --device cuda explicitly to retry the GPU after a driver/library change.
    ap.add_argument("--device", default="cpu", choices=["auto", "cpu", "cuda"])
    ap.add_argument("--model-root", default=str(DEFAULT_MODEL_ROOT),
                    help="Where model weights are cached (kept off C: by default)")
    ap.add_argument("--words", action="store_true",
                    help="Also emit word-level timestamps (caption sync checks)")
    ap.add_argument("--no-vad", action="store_true",
                    help="Disable the VAD filter. Use when the audio is music-heavy "
                         "and VAD is swallowing speech")
    ap.add_argument("--keep-audio", action="store_true",
                    help="Keep the extracted WAV next to the source")
    ap.add_argument("--out", help="Also write the JSON here")
    args = ap.parse_args()

    src = Path(args.source).resolve()
    if not src.is_file():
        print(json.dumps({"error": "not a file: " + str(src)}), file=sys.stderr)
        return 2

    try:
        from faster_whisper import WhisperModel
    except ImportError:
        print(json.dumps({
            "error": "faster-whisper not installed in this interpreter",
            "hint": "run with the venv interpreter in WATCH_LOCAL_WHISPER_PYTHON "
                    "(~/.config/watch/.env); the repo's setup/ creates it",
        }), file=sys.stderr)
        return 2

    # audio in, video gets stripped first
    if src.suffix.lower() in AUDIO_EXTS:
        audio = src
        temp_audio = None
    else:
        audio = (src.parent / (src.stem + ".teardown.wav")) if args.keep_audio \
            else Path(tempfile.gettempdir()) / (src.stem + ".teardown.wav")
        extract_audio(src, audio)
        temp_audio = None if args.keep_audio else audio

    model_root = Path(args.model_root)
    model_root.mkdir(parents=True, exist_ok=True)

    def transcribe_with(device, compute_type):
        """Run one full attempt. Segments are materialised HERE, inside the try:
        faster-whisper returns a lazy generator, so a broken CUDA install does
        not fail at WhisperModel() or at transcribe() - it fails later, when the
        first segment is pulled. Catching only construction would let the crash
        escape the fallback."""
        t0 = time.time()
        model = WhisperModel(args.model, device=device, compute_type=compute_type,
                             download_root=str(model_root))
        load_s = round(time.time() - t0, 1)

        t0 = time.time()
        segments_iter, info = model.transcribe(
            str(audio),
            language=args.language,
            vad_filter=not args.no_vad,
            word_timestamps=args.words,
            beam_size=5,
        )

        out = []
        for seg in segments_iter:
            text = (seg.text or "").strip()
            if not text:
                continue
            entry = {
                "start": round(float(seg.start), 2),
                "end": round(float(seg.end), 2),
                "text": text,
            }
            # avg_logprob is the model's own confidence - surfaced so the teardown's
            # uncertainty ledger has something measured to point at, not a hunch
            if seg.avg_logprob is not None:
                entry["avg_logprob"] = round(float(seg.avg_logprob), 3)
            if seg.no_speech_prob is not None:
                entry["no_speech_prob"] = round(float(seg.no_speech_prob), 3)
            if args.words and seg.words:
                entry["words"] = [
                    {"start": round(float(w.start), 2),
                     "end": round(float(w.end), 2),
                     "word": w.word,
                     "probability": round(float(w.probability), 3)}
                    for w in seg.words
                ]
            out.append(entry)
        return out, info, load_s, round(time.time() - t0, 1)

    dll_dirs = register_nvidia_dlls()
    attempts = device_plan(args.device)
    fallbacks = []
    segments = info = None
    device = compute_type = None
    load_s = transcribe_s = None

    for idx, (dev, ctype) in enumerate(attempts):
        try:
            segments, info, load_s, transcribe_s = transcribe_with(dev, ctype)
            device, compute_type = dev, ctype
            break
        except Exception as exc:
            reason = str(exc).strip().splitlines()[-1][:300] if str(exc).strip() else repr(exc)
            fallbacks.append({"device": dev, "compute_type": ctype, "error": reason})
            print("[local-whisper] " + dev + "/" + ctype + " failed: " + reason,
                  file=sys.stderr)
            if idx == len(attempts) - 1:
                print(json.dumps({"error": "every backend failed",
                                  "attempts": fallbacks}), file=sys.stderr)
                return 1

    if temp_audio is not None:
        try:
            temp_audio.unlink()
        except OSError:
            pass

    result = {
        "backend": "local:faster-whisper",
        "model": args.model,
        "device": device,
        "compute_type": compute_type,
        "fell_back_from": fallbacks or None,
        "cuda_dll_dirs_registered": len(dll_dirs),
        "language": info.language,
        "language_probability": round(float(info.language_probability), 3)
        if info.language_probability is not None else None,
        "audio_duration_s": round(float(info.duration), 2),
        "model_load_s": load_s,
        "transcribe_s": transcribe_s,
        "realtime_factor": round(float(info.duration) / transcribe_s, 2)
        if transcribe_s > 0 else None,
        "segments": segments,
    }

    text = json.dumps(result, indent=2, ensure_ascii=False)
    if args.out:
        Path(args.out).parent.mkdir(parents=True, exist_ok=True)
        Path(args.out).write_text(text, encoding="utf-8")
    print(text)
    return 0


if __name__ == "__main__":
    sys.exit(main())
