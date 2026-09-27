#!/usr/bin/env python3
"""Machine setup for the ugc video skills (watch, video-teardown, video-prompt,
video-method, video-workflow).

setup/windows.ps1 and setup/macos.sh install the system tools (git, node,
python, ffmpeg, yt-dlp) and then hand over to this script, which does the
cross-platform part. Idempotent: re-running it only fills what is missing, and
on a machine that already has a working local Whisper it reuses that one.

  1. checks the system tools the skills shell out to
  2. creates a dedicated venv with faster-whisper (local transcription)
  3. pre-downloads the Whisper weights the skills default to
  4. wires ~/.config/watch/.env so /watch and /video-teardown find that venv
  5. smoke-tests: watch preflight, whisper import, video-workflow server

Usage:
  python setup/bootstrap.py              full setup
  python setup/bootstrap.py --check      only steps 1 and 5, changes nothing
  python setup/bootstrap.py --skip-model don't pre-download the weights
"""
from __future__ import annotations

import argparse
import json
import os
import platform
import re
import shutil
import socket
import subprocess
import sys
import time
import urllib.request
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
SKILLS = REPO / ".claude" / "skills"
WATCH_SETUP = SKILLS / "watch" / "scripts" / "setup.py"
TRANSCRIBE_SCRIPT = SKILLS / "video-teardown" / "scripts" / "transcribe_local.py"
SERVER = SKILLS / "video-workflow" / "server.mjs"
WATCH_ENV = Path.home() / ".config" / "watch" / ".env"
# Same default as transcribe_local.py: weights live on the system disk (SSD).
MODEL_ROOT = Path.home() / ".cache" / "whisper-local" / "models"
FASTER_WHISPER = "faster-whisper==1.2.1"
MIN_NODE = 22
IS_WINDOWS = platform.system() == "Windows"

results: list[tuple[bool, str, str]] = []


def say(msg: str) -> None:
    print(f"[setup] {msg}", flush=True)


def record(ok: bool, name: str, detail: str = "") -> bool:
    results.append((ok, name, detail))
    return ok


def default_venv() -> Path:
    if IS_WINDOWS:
        base = Path(os.environ.get("LOCALAPPDATA") or Path.home() / "AppData" / "Local")
        return base / "whisper-local" / "venv"
    return Path.home() / ".local" / "share" / "whisper-local" / "venv"


def venv_python(venv: Path) -> Path:
    return venv / ("Scripts/python.exe" if IS_WINDOWS else "bin/python")


def which(name: str) -> str | None:
    """PATH first, then winget's package folder (same fallback the skills use)."""
    found = shutil.which(name)
    if found or not IS_WINDOWS:
        return found
    pkgs = Path(os.environ.get("LOCALAPPDATA", "")) / "Microsoft" / "WinGet" / "Packages"
    if pkgs.is_dir():
        for cand in sorted(pkgs.glob(f"**/{name}.exe")):
            return str(cand)
    return None


def run(cmd: list[str], **kw) -> subprocess.CompletedProcess:
    kw.setdefault("capture_output", True)
    kw.setdefault("text", True)
    kw.setdefault("encoding", "utf-8")
    kw.setdefault("errors", "replace")
    return subprocess.run(cmd, **kw)


# --------------------------------------------------------------------------- env file

def read_env() -> dict[str, str]:
    values: dict[str, str] = {}
    if not WATCH_ENV.exists():
        return values
    for line in WATCH_ENV.read_text(encoding="utf-8").splitlines():
        raw = line.strip()
        if raw and not raw.startswith("#") and "=" in raw:
            key, _, value = raw.partition("=")
            values[key.strip()] = value.strip()
    return values


def upsert_env(updates: dict[str, str]) -> None:
    """Set KEY=value on its own line, replacing an active line or appending."""
    lines = WATCH_ENV.read_text(encoding="utf-8").splitlines() if WATCH_ENV.exists() else []
    pending = dict(updates)
    for i, line in enumerate(lines):
        m = re.match(r"\s*([A-Z_]+)\s*=", line)
        if m and m.group(1) in pending:
            lines[i] = f"{m.group(1)}={pending.pop(m.group(1))}"
    if pending:
        lines += ["", "# written by ugc setup/bootstrap.py"]
        lines += [f"{k}={v}" for k, v in pending.items()]
    WATCH_ENV.parent.mkdir(parents=True, exist_ok=True)
    WATCH_ENV.write_text("\n".join(lines) + "\n", encoding="utf-8", newline="\n")
    try:
        WATCH_ENV.chmod(0o600)
    except OSError:
        pass


# --------------------------------------------------------------------------- steps

def check_tools() -> bool:
    ok = True
    for name in ("git", "ffmpeg", "ffprobe", "yt-dlp"):
        path = which(name)
        ok &= record(bool(path), name, path or "not found")
    node = which("node")
    if node:
        out = run([node, "--version"]).stdout.strip()
        major = int(re.match(r"v?(\d+)", out).group(1)) if re.match(r"v?(\d+)", out) else 0
        ok &= record(major >= MIN_NODE, "node", f"{out} (needs >= {MIN_NODE})")
    else:
        ok &= record(False, "node", "not found")
    record(True, "python", f"{sys.version.split()[0]} at {sys.executable}")
    claude = which("claude")
    record(True, "claude", claude or "not found yet - install Claude Code (see README)")
    return ok


def whisper_ok(python_exe: str | Path) -> bool:
    if not python_exe or not Path(python_exe).is_file():
        return False
    return run([str(python_exe), "-c", "import faster_whisper"]).returncode == 0


def ensure_venv(venv: Path) -> Path | None:
    configured = read_env().get("WATCH_LOCAL_WHISPER_PYTHON")
    if configured and whisper_ok(configured):
        say(f"local Whisper already configured, reusing: {configured}")
        return Path(configured)

    py = venv_python(venv)
    if not py.is_file():
        say(f"creating venv: {venv}")
        venv.parent.mkdir(parents=True, exist_ok=True)
        r = run([sys.executable, "-m", "venv", str(venv)], capture_output=False)
        if r.returncode != 0 or not py.is_file():
            record(False, "whisper venv", f"python -m venv failed ({venv})")
            return None
    if not whisper_ok(py):
        say(f"installing {FASTER_WHISPER} (a few minutes on the first run)")
        run([str(py), "-m", "pip", "install", "--upgrade", "pip"], capture_output=False)
        r = run([str(py), "-m", "pip", "install", FASTER_WHISPER], capture_output=False)
        if r.returncode != 0 or not whisper_ok(py):
            record(False, "whisper venv", "pip install faster-whisper failed")
            return None
    return py


def ensure_model(py: Path, model: str) -> bool:
    cached = MODEL_ROOT / f"models--Systran--faster-whisper-{model}" / "snapshots"
    if cached.is_dir() and any(cached.iterdir()):
        return record(True, f"whisper model {model}", f"cached in {MODEL_ROOT}")
    say(f"downloading Whisper '{model}' weights to {MODEL_ROOT} (~1.5 GB for medium)")
    MODEL_ROOT.mkdir(parents=True, exist_ok=True)
    code = (
        "from faster_whisper import WhisperModel;"
        f"WhisperModel({model!r}, device='cpu', compute_type='int8', download_root={str(MODEL_ROOT)!r})"
    )
    env = dict(os.environ, HF_HUB_DISABLE_SYMLINKS_WARNING="1")
    r = run([str(py), "-c", code], capture_output=False, env=env)
    return record(r.returncode == 0, f"whisper model {model}",
                  f"downloaded to {MODEL_ROOT}" if r.returncode == 0 else "download failed")


def wire_watch(py: Path, model: str) -> None:
    # Let watch's own installer scaffold its .env template (no-op if it exists).
    if not WATCH_ENV.exists():
        run([sys.executable, str(WATCH_SETUP)])
    env = read_env()
    updates: dict[str, str] = {}
    if env.get("WATCH_LOCAL_WHISPER_PYTHON") != py.as_posix() and not whisper_ok(env.get("WATCH_LOCAL_WHISPER_PYTHON", "")):
        updates["WATCH_LOCAL_WHISPER_PYTHON"] = py.as_posix()
    if not Path(env.get("WATCH_LOCAL_WHISPER_SCRIPT", "")).is_file() or not env.get("WATCH_LOCAL_WHISPER_SCRIPT"):
        updates["WATCH_LOCAL_WHISPER_SCRIPT"] = TRANSCRIBE_SCRIPT.as_posix()
    if not env.get("WATCH_LOCAL_WHISPER_MODEL"):
        updates["WATCH_LOCAL_WHISPER_MODEL"] = model
    if not env.get("WATCH_DETAIL"):
        updates["WATCH_DETAIL"] = "balanced"
    if updates:
        upsert_env(updates)
        say(f"updated {WATCH_ENV}: {', '.join(updates)}")
    # Second pass: watch's installer now sees local Whisper and marks SETUP_COMPLETE.
    run([sys.executable, str(WATCH_SETUP)])


def smoke_watch() -> bool:
    r = run([sys.executable, str(WATCH_SETUP), "--json"])
    try:
        s = json.loads(r.stdout)
    except json.JSONDecodeError:
        return record(False, "watch preflight", (r.stderr or r.stdout).strip()[-200:])
    detail = f"can_proceed={s['can_proceed']} local_whisper={s['has_local_whisper']} detail={s['watch_detail']}"
    if s["missing_binaries"]:
        detail += f" missing={','.join(s['missing_binaries'])}"
    return record(s["can_proceed"] and s["has_local_whisper"], "watch preflight", detail)


def smoke_whisper() -> bool:
    py = read_env().get("WATCH_LOCAL_WHISPER_PYTHON", "")
    if not whisper_ok(py):
        return record(False, "faster-whisper", f"not importable from {py or '(unset)'}")
    v = run([py, "-c", "import faster_whisper; print(faster_whisper.__version__)"]).stdout.strip()
    return record(True, "faster-whisper", f"{v} in {py}")


def smoke_server() -> bool:
    node = which("node")
    if not node:
        return record(False, "video-workflow UI", "node not found")
    with socket.socket() as s:
        s.bind(("127.0.0.1", 0))
        port = s.getsockname()[1]
    proc = subprocess.Popen([node, str(SERVER), "--port", str(port), "--host", "127.0.0.1"],
                            cwd=REPO, stdout=subprocess.DEVNULL, stderr=subprocess.PIPE)
    try:
        for path in ("/ui.html", "/assets.html", "/api/assets"):
            deadline = time.time() + 15
            while True:
                try:
                    with urllib.request.urlopen(f"http://127.0.0.1:{port}{path}", timeout=3) as resp:
                        if resp.status != 200:
                            return record(False, "video-workflow UI", f"{path} -> HTTP {resp.status}")
                        break
                except OSError:
                    if proc.poll() is not None or time.time() > deadline:
                        err = proc.stderr.read().decode(errors="replace").strip()[-200:] if proc.stderr else ""
                        return record(False, "video-workflow UI", f"{path} unreachable {err}")
                    time.sleep(0.3)
        return record(True, "video-workflow UI", "server boots, /ui.html /assets.html /api/assets -> 200")
    finally:
        proc.terminate()
        try:
            proc.wait(timeout=5)
        except subprocess.TimeoutExpired:
            proc.kill()


# --------------------------------------------------------------------------- main

def main() -> int:
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(errors="replace")
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--check", action="store_true", help="only verify, change nothing")
    ap.add_argument("--venv", type=Path, default=default_venv(), help="where to create the Whisper venv")
    ap.add_argument("--model", default="medium", help="Whisper weights to pre-download (default: medium)")
    ap.add_argument("--skip-model", action="store_true", help="don't pre-download the weights")
    args = ap.parse_args()

    say(f"repo: {REPO}")
    tools_ok = check_tools()

    if not args.check:
        if not tools_ok:
            say("system tools missing - run setup/windows.ps1 or setup/macos.sh first")
        else:
            py = ensure_venv(args.venv)
            if py:
                if not args.skip_model:
                    ensure_model(py, args.model)
                wire_watch(py, args.model)

    if which("node"):
        smoke_server()
    smoke_watch()
    smoke_whisper()

    print()
    for ok, name, detail in results:
        print(f"  [{'ok' if ok else '!!'}] {name:<22} {detail}")
    failed = [name for ok, name, _ in results if not ok]
    print()
    if failed:
        say(f"NOT READY - fix: {', '.join(failed)}")
        return 1
    say("ready. Next: open Claude Code in this folder and follow README 'Primeiro uso'.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
