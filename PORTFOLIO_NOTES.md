# Portfolio content and delivery notes

## Current direction (2026-09-15, corrected)

The owner wants timyeou.com to support freelance development and technical consulting conversations, not a generic AI philosophy. Moment is an explicit exception to debranding: it is the owner's app being prepared for public release and must retain the Moment brand. The LINE bot also keeps its identity. Only the two personal development tools use purpose-based display names.

Lead with what a client can ask Timothy to do: clarify requirements and technical options, develop or improve a mobile app, or connect LINE and existing tools to a specific workflow. Keep the contact action primary. Do not add unsupported consulting clients, testimonials, prices, release dates, availability guarantees, or performance promises.

The bilingual hero remains: “Define the problem. Build the right tool.” / “把需求釐清，把工具做出來。”

## App, bot, and personal tools

| Internal media key (unchanged) | English display title | Traditional Chinese display title | Context |
| --- | --- | --- | --- |
| `moment` | Moment | Moment | Independent app preparing for launch; design preview |
| `line-family-translator` | Family LINE Translator | 家庭 LINE 翻譯 Bot | Family trial, not public signup; scripted video demonstration |
| `productdev` | Development task monitoring | 開發任務監控 | Personal development tool; workflow illustration |
| `timwork` | Project tasks & handover | 跨專案任務與交接管理 | Personal project organization; workflow illustration |

Moment must retain its brand in the project heading, film opening/closing, existing product UI identity, posters, captions, accessible names, and full-film dialog titles in both languages. Explain its life-planning use in the description, not by replacing the brand. Its status is “Independent app · Preparing for launch” / “自有 App · 準備推出”. Do not label Moment personal-only, not for sale, or a non-public-service project. Do not invent a launch date, App Store availability, pricing, or a signup link. Preparing for launch is not the same as having launched.

Use purpose-based titles only for `productdev` and `timwork`. Keep opaque data keys and media filenames stable. Explain the problem, what the software does, and Timothy's role in plain language. These examples are not client commissions, but do not apply a blanket “personal tools / not for sale” disclaimer to the whole collection.

The LINE bot was built for actual family communication; the film itself is a scripted illustration. Do not call the working bot merely a concept, and do not imply public access, guaranteed availability, perfect translation, or LINE endorsement.

## Media correction

The checked-in Moment V5 film/loop/poster assets are the approved branded media and remain appropriate. Do not replace them with the debranded life-planning V7 assets. The earlier blanket V7 debranding instructions are superseded for Moment.

The local Portfolio-Media-v8.zip has now been imported after ZIP path/CRC and all 24 source byte-count/SHA-256 checks. Moment's six V5 originals were already identical and retained. Eighteen V7 originals were added for the other entries; no old immutable resources were overwritten.

The owner subsequently requested removal of all music. Eight full films now use new `film-<language>-v5-silent.mp4` / `film-<language>-v7-silent.mp4` paths. FFmpeg removed only the audio stream with `-c:v copy -an`; the encoded video-stream hashes match the originals. All loops and posters retain their exact approved bytes. The deployment contains only the selected 16 silent MP4 and 8 JPEG, not the original films with music. Both original source hashes and silent derivative hashes are recorded in `media/portfolio-media-v8/media-manifest.json`.

No runtime consumer reads `display_titles` or `displayNames`; website names use the existing HTML bilingual attributes. Both manifest name fields are retained and normalized, including Moment in both languages. The validator rejects conflicts in either field and incorrect classification/version/hash/provenance/audio metadata. `python3 scripts/test-portfolio-manifest.py` exercises nine rejection paths in an isolated temporary fixture.

See [this integration's acceptance record](docs/portfolio-media-v8-acceptance.md) for browser coverage, limitations, and release/recovery instructions. This branch is reviewable and awaits approval for release; no production deployment has run.

## Company experience and evidence

The company-work section describes Timothy's contributions within teams, not product ownership. Its content, assets, and links are preserved. Resume facts remain bounded by `source/resume.md`; the existing ten-plus years of mobile experience can support the biography but not invented consulting outcomes.

The website should not lead with slogans about intelligence, contracts, authority, checkpoints, or AI implementation. Technical concepts may appear only when needed to explain a concrete job or documented contribution, not as standalone manifesto sections. Keeping the Moment brand does not restore the removed generic AI manifesto.

## Delivery

The portfolio remains dependency-free HTML/CSS/JavaScript with the existing bilingual media controller. `site/consulting.css` contains scoped layout adjustments for longer descriptive titles. Keep the existing `#native` and `#method` anchors for incoming links; they contain services and practical collaboration steps.

Cloudflare Workers Static Assets serves the portfolio from `.portfolio-dist`, built by `scripts/build-portfolio.sh`. The GitHub Pages workflow separately publishes resume pages. Do not assume a merged PR or successful Pages deployment updates timyeou.com.

Publish only the explicit build allowlist. Media sources, these notes, private URLs, PDFs, and QA evidence must not enter the Cloudflare bundle. Run `bash scripts/validate-site.sh` and verify bilingual layouts and media switching before release. Do not deploy as part of a content review without explicit authorization.
