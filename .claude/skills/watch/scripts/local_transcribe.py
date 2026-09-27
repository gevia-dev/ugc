#!/usr/bin/env python3
"""Client for a machine-local faster-whisper transcription script.

The cloud fallback (whisper.py) needs an API key and a network call. On a
machine that already has a local faster-whisper install — built for the
video-teardown skill, see WATCH_LOCAL_WHISPER_PYTHON/SCRIPT in
~/.config/watch/.env — this is free and needs neither. /watch tries it first
when configured; the segment shape ({start, end, text}) is identical to
whisper.py's, so nothing downstream (filter_range, format_transcript) needs
to know which one ran.

This module is a thin client: it shells out to the configured script under
its own dedicated Python interpreter (the venv where faster-whisper is
installed — NOT the interpreter running /watch itself) and parses its JSON
output. It does not reimplement any faster-whisper logic.
"""
from __future__ import annotations

import json
import os
import subprocess
from pathlib import Path


def find_local_whisper(config: dict) -> dict | None:
    """Return {'python', 'script', 'model'} if a local Whisper install is
    configured AND both paths exist on disk right now, else None.

    Checked on every call (not cached) since the venv/script could move or
    a session on a different machine has no local install at all — this is
    per-machine config, not something to assume is universal.
    """
    python_exe = config.get("local_whisper_python")
    script = config.get("local_whisper_script")
    if not python_exe or not script:
        return None
    if not Path(python_exe).is_file() or not Path(script).is_file():
        return None
    return {
        "python": python_exe,
        "script": script,
        "model": config.get("local_whisper_model") or "medium",
    }


def transcribe_local_video(
    video_path: str,
    out_json: Path,
    python_exe: str,
    script_path: str,
    model: str,
    language: str | None = None,
) -> tuple[list[dict], dict]:
    """Run the local transcriber and return (segments, meta).

    Raises SystemExit on any failure (non-zero exit, missing/unreadable
    output, zero segments) so the caller's existing SystemExit-based fallback
    handling (cloud Whisper, then frames-only) applies unchanged.
    """
    out_json.parent.mkdir(parents=True, exist_ok=True)
    cmd = [python_exe, script_path, video_path, "--model", model, "--out", str(out_json)]
    if language:
        cmd += ["--language", language]

    env = dict(os.environ)
    # Silences a huggingface_hub warning about symlinks needing Windows Dev
    # Mode/admin rights — cosmetic, but noisy enough on a cache-cold run to
    # bury a real error underneath it.
    env.setdefault("HF_HUB_DISABLE_SYMLINKS_WARNING", "1")

    result = subprocess.run(
        cmd, capture_output=True, text=True, encoding="utf-8", errors="replace", env=env,
    )
    if result.returncode != 0 or not out_json.is_file():
        tail = [ln for ln in (result.stderr or result.stdout or "").strip().splitlines() if ln][-8:]
        detail = " | ".join(tail) if tail else f"exit {result.returncode}, no output"
        raise SystemExit(f"local whisper failed: {detail}")

    try:
        data = json.loads(out_json.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        raise SystemExit(f"local whisper produced unreadable output: {exc}")

    segments = [
        {"start": seg["start"], "end": seg["end"], "text": seg["text"]}
        for seg in data.get("segments") or []
        if seg.get("text")
    ]
    if not segments:
        raise SystemExit("local whisper returned no transcript segments")

    meta = {
        "model": data.get("model", model),
        "device": data.get("device"),
        "compute_type": data.get("compute_type"),
        "language": data.get("language"),
        "realtime_factor": data.get("realtime_factor"),
    }
    return segments, meta
