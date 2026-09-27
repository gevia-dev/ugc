#!/usr/bin/env bash
# One-shot setup for the ugc video skills on macOS.
#
#   bash setup/macos.sh              (from the repo root)
#
# Installs via Homebrew only what is missing: git, node (>= 22), python@3.13,
# ffmpeg, yt-dlp. Then runs setup/bootstrap.py (Whisper venv + weights + /watch
# config + smoke tests). Extra arguments go to bootstrap.py, e.g. --skip-model.
# Safe to re-run.
set -euo pipefail

REPO="$(cd "$(dirname "$0")/.." && pwd)"
echo "[setup] repo: $REPO"

if ! command -v brew >/dev/null 2>&1; then
  for b in /opt/homebrew/bin/brew /usr/local/bin/brew; do
    [ -x "$b" ] && eval "$("$b" shellenv)" && break
  done
fi
if ! command -v brew >/dev/null 2>&1; then
  echo "[setup] Homebrew is required. Install it with:" >&2
  echo '  /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"' >&2
  echo "then open a new terminal and re-run: bash setup/macos.sh" >&2
  exit 1
fi

node_major() { node --version 2>/dev/null | sed -E 's/^v([0-9]+).*/\1/'; }

need=()
command -v git >/dev/null 2>&1 || need+=(git)
if ! command -v node >/dev/null 2>&1 || [ "$(node_major)" -lt 22 ]; then need+=(node); fi
brew list python@3.13 >/dev/null 2>&1 || need+=(python@3.13)
{ command -v ffmpeg >/dev/null 2>&1 && command -v ffprobe >/dev/null 2>&1; } || need+=(ffmpeg)
command -v yt-dlp >/dev/null 2>&1 || need+=(yt-dlp)

# bash 3.2 (macOS default) treats an empty array as unset under `set -u`.
if [ "${#need[@]}" -gt 0 ]; then
  echo "[setup] brew install ${need[*]}"
  brew install "${need[@]}"
  if [[ " ${need[*]} " == *" node "* ]] && [ "$(node_major)" -lt 22 ]; then brew upgrade node || true; fi
fi

PY="$(brew --prefix python@3.13)/bin/python3.13"
if [ ! -x "$PY" ]; then
  echo "[setup] python3.13 not found at $PY" >&2
  exit 1
fi

set +e
"$PY" "$REPO/setup/bootstrap.py" ${1+"$@"}
code=$?
set -e

if ! command -v claude >/dev/null 2>&1; then
  echo
  echo "[setup] Claude Code not found. Install it with:"
  echo "        curl -fsSL https://claude.ai/install.sh | bash"
fi
exit $code
