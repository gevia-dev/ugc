# One-shot setup for the ugc video skills on Windows.
#
# Run from the repo root, in a normal (non-admin) PowerShell:
#   powershell -ExecutionPolicy Bypass -File setup\windows.ps1
#
# Installs via winget only what is missing: Git, Node.js LTS (>= 22), Python 3.13,
# FFmpeg, yt-dlp. Then runs setup\bootstrap.py (Whisper venv + weights + /watch
# config + smoke tests). Extra arguments go to bootstrap.py, e.g. --skip-model.
# Safe to re-run.

$ErrorActionPreference = 'Stop'
$repo = Split-Path -Parent $PSScriptRoot
$passthrough = $args

function Refresh-Path {
    $env:Path = [Environment]::GetEnvironmentVariable('Path', 'Machine') + ';' +
                [Environment]::GetEnvironmentVariable('Path', 'User')
}

function Test-Cmd($name) {
    [bool](Get-Command $name -ErrorAction SilentlyContinue)
}

function Install-Pkg($id, $label) {
    Write-Host "[setup] installing $label ($id) via winget..."
    winget install --id $id -e --silent --accept-source-agreements --accept-package-agreements
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[setup] winget returned $LASTEXITCODE for $id - the final check will say if it matters." -ForegroundColor Yellow
    }
    Refresh-Path
}

function Get-RealPython {
    # 'python' can be the Microsoft Store stub, which runs nothing. Ask each
    # candidate for its own path; only a real interpreter answers.
    $candidates = @(
        @{ cmd = 'python'; pre = @() },
        @{ cmd = 'py'; pre = @('-3') }
    )
    foreach ($c in $candidates) {
        if (-not (Test-Cmd $c.cmd)) { continue }
        try {
            $exe = & $c.cmd @($c.pre + @('-c', 'import sys; print(sys.executable)')) 2>$null
            if ($LASTEXITCODE -eq 0 -and $exe) { return "$exe".Trim() }
        } catch { }
    }
    $default = Join-Path $env:LOCALAPPDATA 'Programs\Python\Python313\python.exe'
    if (Test-Path $default) { return $default }
    return $null
}

function Get-NodeMajor {
    if (-not (Test-Cmd 'node')) { return 0 }
    $v = (& node --version) -replace '^v', ''
    return [int]($v.Split('.')[0])
}

if (-not (Test-Cmd 'winget')) {
    Write-Host "[setup] winget not found. Install 'App Installer' from the Microsoft Store, then re-run." -ForegroundColor Red
    exit 1
}

Write-Host "[setup] repo: $repo"

if (-not (Test-Cmd 'git')) { Install-Pkg 'Git.Git' 'Git' }
if ((Get-NodeMajor) -lt 22) { Install-Pkg 'OpenJS.NodeJS.LTS' 'Node.js LTS' }
if (-not (Get-RealPython)) { Install-Pkg 'Python.Python.3.13' 'Python 3.13' }
if (-not ((Test-Cmd 'ffmpeg') -and (Test-Cmd 'ffprobe'))) { Install-Pkg 'Gyan.FFmpeg' 'FFmpeg' }
if (-not (Test-Cmd 'yt-dlp')) { Install-Pkg 'yt-dlp.yt-dlp' 'yt-dlp' }

$python = Get-RealPython
if (-not $python) {
    Write-Host "[setup] Python is still not runnable. Open a new PowerShell and re-run this script." -ForegroundColor Red
    exit 1
}

# The skills call plain 'python'. If that name still resolves to the Store stub
# (or to nothing), put the real interpreter first on the user PATH.
$pyDir = Split-Path -Parent $python
$plain = $null
try { $plain = & python -c 'import sys; print(sys.executable)' 2>$null } catch { }
if (-not $plain) {
    $userPath = [Environment]::GetEnvironmentVariable('Path', 'User')
    [Environment]::SetEnvironmentVariable('Path', "$pyDir;$pyDir\Scripts;$userPath", 'User')
    Refresh-Path
    Write-Host "[setup] added $pyDir to your user PATH so 'python' runs the real interpreter."
    Write-Host "        If it still opens the Microsoft Store: Settings > Apps > Advanced app settings >"
    Write-Host "        App execution aliases > turn off python.exe and python3.exe."
}

& $python (Join-Path $repo 'setup\bootstrap.py') @passthrough
$code = $LASTEXITCODE

if (-not (Test-Cmd 'claude')) {
    Write-Host ""
    Write-Host "[setup] Claude Code not found. Install it with:" -ForegroundColor Yellow
    Write-Host "        irm https://claude.ai/install.ps1 | iex"
}
if ($code -eq 0) {
    Write-Host ""
    Write-Host "[setup] Open a NEW terminal before using Claude Code, so it sees the updated PATH."
}
exit $code
