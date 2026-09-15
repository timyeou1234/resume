# Moment A V4 — English localization source

This is the editable, local-only English localization of the approved Moment A V4 film. It preserves the original 24-second storyboard, 12-second loop timing, dark composition, camera geometry, transitions, music, and sound-effect timing. It does not modify Figma or the Moment app repository, and it does not claim that an English app build exists.

`make_ui_assets.py` rebuilds the visible product UI in English from the Figma node structure and tokens recorded in `source-manifest.json`. The exact Figma travel glyph is retained as `assets/travel-icon.svg`; no Chinese screenshot is covered or renamed. `localization.json` is the reviewable zh-Hant → English string map.

## Render

Use Python 3.10+, Playwright 1.57, Google Chrome/Chromium, and FFmpeg with libx264:

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python render_all.py \
  --audio-from /absolute/path/to/approved/film-zh-v4.mp4 \
  --output-dir ./output
```

The generated files are `Moment-A-Web-Loop-en-v4.mp4`, `Moment-A-Film-en-v4.mp4`, and `Moment-A-Poster-en-v4.jpg`. UI PNGs, render frames, the WAV fallback, and outputs are ignored because they are reproducible intermediates or deliverables copied into `site/assets/moment/`.

For a fast editorial check without encoding both films:

```bash
python make_ui_assets.py
python render.py --version main --stills --out ./qa-render/main
python render.py --version loop --stills --out ./qa-render/loop
```
