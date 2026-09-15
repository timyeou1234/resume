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

The separately delivered Portfolio-Media-v8 bundle restores the original Moment V5 media byte-for-byte and retains the V7 purpose-led media for the other three entries. The bundle version is not a claim that every film was newly rendered or renamed to V8. All paths, versions, sizes, and hashes are explicit in its manifest. Import that bundle only after reviewing its local manifest; no binary media import or deployment is implied by this documentation change.

This branch correction updates website positioning and validation, not video bytes. Until the separate media import is completed, the two personal-tool films in the repo still contain their old working names. Do not describe the new bundle as already deployed. Do not apply the old `apply-media-v7.py` script, which would put the debranded Moment film back.

## Company experience and evidence

The company-work section describes Timothy's contributions within teams, not product ownership. Its content, assets, and links are preserved. Resume facts remain bounded by `source/resume.md`; the existing ten-plus years of mobile experience can support the biography but not invented consulting outcomes.

The website should not lead with slogans about intelligence, contracts, authority, checkpoints, or AI implementation. Technical concepts may appear only when needed to explain a concrete job or documented contribution, not as standalone manifesto sections. Keeping the Moment brand does not restore the removed generic AI manifesto.

## Delivery

The portfolio remains dependency-free HTML/CSS/JavaScript with the existing bilingual media controller. `site/consulting.css` contains scoped layout adjustments for longer descriptive titles. Keep the existing `#native` and `#method` anchors for incoming links; they contain services and practical collaboration steps.

Cloudflare Workers Static Assets serves the portfolio from `.portfolio-dist`, built by `scripts/build-portfolio.sh`. The GitHub Pages workflow separately publishes resume pages. Do not assume a merged PR or successful Pages deployment updates timyeou.com.

Publish only the explicit build allowlist. Media sources, these notes, private URLs, PDFs, and QA evidence must not enter the Cloudflare bundle. Run `bash scripts/validate-site.sh` and verify bilingual layouts and media switching before release. Do not deploy as part of a content review without explicit authorization.
