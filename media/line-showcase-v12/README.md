# LINE product film V12

36-second silent walkthrough, five chapters at 0, 7, 14, 20 and 28 seconds. Desktop (1920×1080) and portrait (1080×1440) editions each have Traditional Chinese and English explanatory copy. The product's actual Chinese interface text remains unchanged in both editions.

## Evidence boundary

`src/capture.json` records real `createWorker` output from the separate LINE Bot repository at the recorded source commit and file hashes. The harness uses signed synthetic webhook events, an in-memory SQLite database and the source phrasebook. It forbids external network/model requests and intercepts the LINE reply transport. No live settings or private conversations are read or modified. Translation examples are authored phrasebook test data, not native-speaker certification.

The film is a recreated interface driven by these exact responses, not a native LINE recording. That boundary appears in every frame and on the website. The administrator-only DM language setting is shared across enabled chats; the film moves to the approved family group for translations. It does not imply group-specific settings or activation of the unavailable Indonesian/Thai pair.

Original avatar bytes are unchanged. Five source-driven scenes demonstrate the language menu, two-step pair choice, persistence confirmation, a two-part household request, and a reply in the reverse direction. The previous V7 and V10 evidence/assets remain untouched.

## Reproduce

Node 22.16+, npm, macOS PingFang TC and Arial, FFmpeg/ffprobe. Rendering uses Remotion 4.0.533 pinned in package-lock.json.

```sh
npm ci
node scripts/capture.mjs '/absolute/path/to/Line Bot'
npm run lint
npx remotion studio --no-open
bash scripts/render.sh
python3 scripts/manifest.py
```

The capture requires the explicitly supplied source checkout; it never reads credentials. `scripts/manifest.py` fully decodes every MP4, checks the absence of audio, records dimensions/duration and hashes both the media and render sources. H264 uses full-range 8-bit 4:2:0 (`yuvj420p` as reported by ffprobe).

From the portfolio root:

```sh
bash scripts/validate-site.sh
node scripts/test-line-film.cjs
node scripts/test-portfolio-showcases.cjs
python3 scripts/test-portfolio-manifest.py
git diff --check
```

Only the four MP4s/four posters and the original avatar ship to the website. Remotion, React, tooling, capture JSON, and the source repository are excluded by the deployment allowlist. npm audit currently reports an unpatched braces advisory in the ESLint development chain; none of that code is shipped or accepts user glob patterns here.
