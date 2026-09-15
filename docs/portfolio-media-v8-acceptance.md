# Portfolio V8 integration acceptance — 2026-09-15

Continues open PR #21 from `31a69e41711ed7e2226aa5de9e6f0664278d9577`, based on main `b7d121439272bf08da89c37c0bbbf032f477b375`. The latest owner instruction removes all music. No merge or production deployment was performed.

## Selected media and positioning

| Product | Position | Video image version | Film audio |
| --- | --- | --- | --- |
| Moment | Independent app · Preparing for launch / 自有 App · 準備推出 | V5 brand, UI, opening, closing and covers preserved | Removed |
| Family LINE Translator / 家庭 LINE 翻譯 Bot | Family trial; no public signup | V7 LINE chat identity, Chinese ↔ Indonesian demo retained | Removed |
| Development task monitoring / 開發任務監控 | Personal development tool | V7 purpose-based title | Removed |
| Project tasks & handover / 跨專案任務與交接管理 | Personal project organization | V7 purpose-based title | Removed |

The ZIP was found in Downloads, checked for traversal/absolute/symlink entries and CRC, then extracted outside the repository. All 24 original source sizes and SHA-256 values matched the supplied manifest before copying. Six Moment V5 originals already matched and were reused. The other eighteen V7 originals were added; old paths were retained without destructive cleanup.

Eight new full-film derivatives use `film-{en,zh}-v{5,7}-silent.mp4`. Audio removal used `ffmpeg -i INPUT -map 0:v:0 -c:v copy -an -movflags +faststart OUTPUT`; no image stream was re-encoded, resized, cropped or translated. Each derivative's encoded video-stream SHA-256 equals its source stream. The source film path, size and file SHA-256 remain in `products.*.*.film.source`; the selected path/bytes/hash refer to the silent derivative. This is the explicit exception to the original keep-bytes requirement authorized by the owner's later request.

The V8 manifest's stale `display_titles.moment` was corrected to Moment in both languages. Both `display_titles` and `displayNames` remain and must match all four approved localized names. No existing runtime consumer uses either field; HTML bilingual attributes still supply display names. The metadata correction itself does not alter media; the separate audio-removal records explain the later path/hash changes.

## Checks executed

- Baseline and final `bash scripts/validate-site.sh` passed, including JavaScript syntax, build, IDs, anchors, localized player hooks/references, exact product/language/kind/version matrix, source/output sizes and hashes, 16:9 contain layout, lazy loading and the deployment allowlist.
- `python3 scripts/test-portfolio-manifest.py` passed the valid baseline and nine rejection cases: conflicts in either name field, Moment misclassification, wrong media version, missing localized poster, wrong/missing media SHA-256, restored audio metadata and wrong source provenance. These rejection tests ran locally; the existing CI site-check runs the updated full validator. Wiring the extra command into workflow was omitted because the current OAuth credential lacks workflow write scope.
- FFprobe verified 1920×1080, 30 fps, 720 frames / 24 seconds per full film, 360 frames / 12 seconds per loop, and zero audio tracks for all 16 selected MP4. FFmpeg fully decoded all 16 selected MP4 and eight JPEG. Eight original-to-silent encoded-video hashes matched. Original 24 source files were also decoded before the later audio removal.
- The actual Cloudflare output `.portfolio-dist` was served over HTTP at localhost:8765. In-app browser CSS viewports 1440×1000 and 390×844 each ran English and Traditional Chinese. All four products in every round played both loop and full film with advancing currentTime and decoded 1920px videoWidth; all localized poster paths loaded. A desktop scrollbar reduces clientWidth to 375 in the 390px viewport; CSS innerWidth remained 390.
- Initial English and persisted Traditional Chinese page loads requested no MP4; switching language while unloaded also requested none. This proves no eager full film or opposite-language video request at entry.
- Per-product preview pause survived scrolling away/back and dialog close; opening a film paused every loop, closing unloaded the film and returned focus to its trigger. Preview frames stayed 16:9 with object-fit contain and no measured horizontal overflow in all four rounds.
- Playing, unloaded, manually paused and dialog-open language switching passed. Full films remained paused at time zero after language switching. Six rapid preview/dialog switches and rapid product switching selected the correct final language/product, with no observed unhandled Promise rejections. A 10ms playback monitor observed at most one preview playing.
- Escape closed the dialog and restored trigger focus. Native click and keyboard Escape flows were exercised; no custom player or language storage scheme was introduced.
- Reduced-motion emulation requested posters but no MP4 before manual playback, including after language switching. Manual playback succeeded.
- Save-Data and rejected play() were exercised using test-only response overlays at localhost:8766. These overlays served the same built output with only a pre-app preference/play-rejection injection; they were never written into or shipped with the site. Save-Data requested no MP4 until manual playback. Rejected play() retained covers and usable links, with no unhandled rejection.
- Network-blocked Moment preview retained its cover and direct full-film entry; a separate LINE preview still played. A blocked full film retained its poster and direct entry. The discovered play-rejection/load-error status race was repaired and retested: the load-error message now remains visible.
- Visibility handler simulation paused all previews and the playing film; the film remained paused on return. The film background pause is a necessary fix to the existing controller.
- Company experience, contact, collaboration and services sections are byte-for-byte unchanged from the PR starting head. Resume sources, contact addresses and product repositories were not modified. Navigation/resume/contact URLs remained present in both languages.

## Visual evidence and limitations

Local evidence is retained in the sibling `portfolio-media-v8-qa` directory outside the repository and public deployment. `matrix.json`, lifecycle/preference/failure/repair results, FFprobe/decode results, and desktop/mobile screenshots are included there. Representative images include `desktop-en-line-family-translator.png`, `mobile-zh-moment.png`, `mobile-en-productdev.png`, and `mobile-zh-timwork.png`.

Visual inspection confirmed Moment branding, LINE's blue chat background and green/white bubbles, and the purpose-based tool films without stretching or cropping. These are design/scripted workflow demonstrations, not live product/client execution evidence. Moment's unchanged V5 image clarity limitations remain, and small video text is naturally small at phone width.

Not verified: iPhone Safari or physical mobile devices, full keyboard traversal of every native browser video control, production CDN playback, and reliable native background-tab visibility transitions. Both the in-app and automated Chrome environment reported document.hidden=false even after a native tab change, so those attempts cannot establish real hidden-tab behavior; the handler simulation is separately identified above. The supplied bundle validation-summary was only a source reference and is not this website's acceptance evidence. PDF source was unaffected; the existing PDF CI build remains a required check on the pushed head.

## Release and recovery — instructions only

After owner approval, independently review the approved PR head and ensure all required head-specific CI checks pass. Merge only under that approval; main's GitHub Pages workflow publishes resumes, which is separate from the Cloudflare portfolio.

For the separately approved Cloudflare release, check out the exact approved commit in a clean release checkout, run `bash scripts/validate-site.sh` and `python3 scripts/test-portfolio-manifest.py`, then use the existing Wrangler installation with `wrangler deploy --config cloudflare/wrangler.jsonc`. Its assets.directory is `../.portfolio-dist`; confirm the bundle contains only HTML, app.js, both CSS files, _headers, and the selected 24 media. Record the prior active Cloudflare deployment/version before publishing, then verify both domain names, bilingual media and resume/contact links.

For recovery, restore the recorded prior Cloudflare deployment/version through the established release process. If the prior deployment cannot be restored directly, build and deploy the previously released commit from a separate clean checkout. Do not force-push or overwrite versioned media. Reverting the website PR on main alone does not roll back Cloudflare. No release or rollback commands were run in this task.
