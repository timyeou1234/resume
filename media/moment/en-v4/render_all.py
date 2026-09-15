#!/usr/bin/env python3
"""Render the localized 24-second film and 12-second loop without network access."""
from __future__ import annotations

import argparse
from pathlib import Path
import shutil
import subprocess
import sys

BASE = Path(__file__).resolve().parent


def checked(command: list[str]) -> None:
    subprocess.run(command, check=True)


def render_all(output_dir: Path, audio_from: Path | None) -> None:
    if shutil.which("ffmpeg") is None:
        raise RuntimeError("FFmpeg must be installed and available on PATH.")
    output_dir = output_dir.resolve()
    output_dir.mkdir(parents=True, exist_ok=True)
    work = BASE / "renders"
    work.mkdir(exist_ok=True)

    checked([sys.executable, str(BASE / "make_ui_assets.py")])
    if audio_from is None and not (BASE / "score.wav").is_file():
        checked([sys.executable, str(BASE / "make_audio.py")])
    if audio_from is not None:
        audio_from = audio_from.resolve()
        if not audio_from.is_file():
            raise FileNotFoundError(f"Approved audio source not found: {audio_from}")

    jobs = []
    try:
        for name, start, end in [("main-1", 0, 360), ("main-2", 360, 720)]:
            log = (work / f"{name}.log").open("w")
            process = subprocess.Popen([
                sys.executable,
                str(BASE / "render.py"),
                "--version", "main",
                "--start", str(start),
                "--end", str(end),
                "--out", str(work / f"{name}.mp4"),
            ], stdout=log, stderr=subprocess.STDOUT)
            jobs.append((process, log))
        for process, _ in jobs:
            if process.wait() != 0:
                raise RuntimeError("Frame rendering failed; see renders/main-*.log.")
    finally:
        for process, log in jobs:
            if process.poll() is None:
                process.terminate()
                process.wait()
            log.close()

    (work / "concat.txt").write_text("file 'main-1.mp4'\nfile 'main-2.mp4'\n")
    silent = output_dir / "Moment-A-Film-en-v4-Silent.mp4"
    film = output_dir / "Moment-A-Film-en-v4.mp4"
    loop = output_dir / "Moment-A-Web-Loop-en-v4.mp4"
    checked([
        "ffmpeg", "-y", "-hide_banner", "-loglevel", "error", "-f", "concat", "-safe", "0",
        "-i", str(work / "concat.txt"), "-c", "copy", "-movflags", "+faststart", str(silent),
    ])
    if audio_from is not None:
        checked([
            "ffmpeg", "-y", "-hide_banner", "-loglevel", "error",
            "-i", str(silent), "-i", str(audio_from),
            "-map", "0:v:0", "-map", "1:a:0", "-c:v", "copy", "-c:a", "copy",
            "-shortest", "-movflags", "+faststart", str(film),
        ])
    else:
        checked([
            "ffmpeg", "-y", "-hide_banner", "-loglevel", "error",
            "-i", str(silent), "-i", str(BASE / "score.wav"),
            "-map", "0:v:0", "-map", "1:a:0", "-c:v", "copy",
            "-c:a", "aac", "-b:a", "192k", "-af", "loudnorm=I=-22:TP=-2:LRA=8", "-ar", "48000",
            "-shortest", "-movflags", "+faststart", str(film),
        ])
    checked([sys.executable, str(BASE / "render.py"), "--version", "loop", "--out", str(loop)])
    poster = output_dir / "Moment-A-Poster-en-v4.jpg"
    checked([
        "ffmpeg", "-y", "-hide_banner", "-loglevel", "error", "-ss", "2", "-i", str(loop),
        "-frames:v", "1", "-q:v", "2", str(poster),
    ])
    print(f"ALL_RENDER_COMPLETE: {output_dir}", flush=True)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output-dir", type=Path, default=BASE / "output")
    parser.add_argument(
        "--audio-from",
        type=Path,
        help="Approved zh-Hant A V4 film whose audio stream is copied unchanged.",
    )
    args = parser.parse_args()
    render_all(args.output_dir, args.audio_from)
