#!/usr/bin/env python3
"""Extract full-resolution frames at exact timestamps, for READING on-screen text.

The teardown's frame contact sheet (from /watch) is downscaled to ~512px -- fine
for seeing what a shot contains, useless for transcribing a prompt, a chart
label, or an app screen. This grabs the same moments at native resolution, with
optional lanczos upscale so small type survives the model's vision encoder.

Usage:
  python grab.py VIDEO --at 7 12.5 1:03 --out-dir ./read
  python grab.py VIDEO --at 0:14 --upscale 2 --crop 0.5,0.6,1.0,1.0
"""
from __future__ import annotations

import argparse
import json
import os
import shutil
import subprocess
import sys
from pathlib import Path


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


def parse_ts(value):
    """Accept SS, SS.mmm, MM:SS, MM:SS.mmm, HH:MM:SS(.mmm)."""
    parts = str(value).strip().split(":")
    try:
        nums = [float(p) for p in parts]
    except ValueError:
        raise argparse.ArgumentTypeError("bad timestamp: " + str(value))
    if len(nums) == 1:
        return nums[0]
    if len(nums) == 2:
        return nums[0] * 60 + nums[1]
    if len(nums) == 3:
        return nums[0] * 3600 + nums[1] * 60 + nums[2]
    raise argparse.ArgumentTypeError("bad timestamp: " + str(value))


def label(seconds):
    total = int(seconds)
    ms = int(round((seconds - total) * 1000))
    h, rem = divmod(total, 3600)
    m, s = divmod(rem, 60)
    base = ("%02d-%02d-%02d" % (h, m, s)) if h else ("%02d-%02d" % (m, s))
    return base + ("-%03d" % ms if ms else "")


def build_filters(upscale, crop):
    filters = []
    if crop:
        x0, y0, x1, y1 = crop
        w = "iw*" + repr(round(x1 - x0, 6))
        h = "ih*" + repr(round(y1 - y0, 6))
        x = "iw*" + repr(round(x0, 6))
        y = "ih*" + repr(round(y0, 6))
        filters.append("crop=" + w + ":" + h + ":" + x + ":" + y)
    if upscale and upscale != 1:
        filters.append("scale=iw*" + str(upscale) + ":ih*" + str(upscale) + ":flags=lanczos")
    return ",".join(filters)


def parse_crop(value):
    try:
        nums = [float(p) for p in value.split(",")]
    except ValueError:
        raise argparse.ArgumentTypeError("crop must be x0,y0,x1,y1 as 0..1 fractions")
    if len(nums) != 4:
        raise argparse.ArgumentTypeError("crop must be x0,y0,x1,y1 as 0..1 fractions")
    x0, y0, x1, y1 = nums
    if not (0 <= x0 < x1 <= 1 and 0 <= y0 < y1 <= 1):
        raise argparse.ArgumentTypeError("crop fractions must satisfy 0 <= a < b <= 1")
    return (x0, y0, x1, y1)


def main():
    ap = argparse.ArgumentParser(description="Full-resolution frame grabs at exact timestamps")
    ap.add_argument("source", help="Local video file")
    ap.add_argument("--at", nargs="+", required=True, type=parse_ts,
                    help="Timestamps: SS, MM:SS or HH:MM:SS (space separated)")
    ap.add_argument("--out-dir", default="./teardown-reads")
    ap.add_argument("--upscale", type=int, default=1,
                    help="Integer lanczos upscale for small on-screen type (try 2)")
    ap.add_argument("--crop", type=parse_crop, default=None,
                    help="Crop to a region as x0,y0,x1,y1 fractions of the frame, "
                         "e.g. 0,0.7,1,1 for the lower-third caption band")
    ap.add_argument("--precise", action="store_true",
                    help="Decode from the start instead of seeking (slower, frame-exact "
                         "on containers where fast seek lands on the wrong frame)")
    ap.add_argument("--format", choices=["png", "jpg"], default="png",
                    help="png (default, lossless -- text stays crisp) or jpg")
    args = ap.parse_args()

    src = str(Path(args.source).resolve())
    if not Path(src).is_file():
        print("not a file: " + src, file=sys.stderr)
        return 2

    ffmpeg = resolve("ffmpeg")
    if not ffmpeg:
        print("missing binary: ffmpeg", file=sys.stderr)
        return 2

    out_dir = Path(args.out_dir).resolve()
    out_dir.mkdir(parents=True, exist_ok=True)
    vf = build_filters(args.upscale, args.crop)

    results = []
    for ts in args.at:
        name = "read_" + label(ts) + "." + args.format
        dest = out_dir / name
        cmd = [ffmpeg, "-hide_banner", "-loglevel", "error", "-y"]
        if args.precise:
            cmd += ["-i", src, "-ss", "%.3f" % ts]
        else:
            cmd += ["-ss", "%.3f" % ts, "-i", src]
        if vf:
            cmd += ["-vf", vf]
        if args.format == "jpg":
            cmd += ["-q:v", "1"]
        cmd += ["-frames:v", "1", str(dest)]

        proc = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
        ok = proc.returncode == 0 and dest.is_file() and dest.stat().st_size > 0
        results.append({
            "t": round(ts, 3),
            "path": str(dest) if ok else None,
            "ok": ok,
            "error": None if ok else proc.stdout.decode("utf-8", "replace").strip()[-500:],
        })

    print(json.dumps({"out_dir": str(out_dir), "upscale": args.upscale,
                      "crop": args.crop, "frames": results},
                     indent=2, ensure_ascii=False))
    return 0 if all(r["ok"] for r in results) else 1


if __name__ == "__main__":
    sys.exit(main())
