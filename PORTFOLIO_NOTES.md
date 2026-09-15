# Portfolio content and delivery notes

## Current direction (2026-09-15)

The owner wants timyeou.com to support freelance development and technical consulting conversations, not to market a collection of named software products or a generic AI philosophy.

Lead with what a client can ask Timothy to do: clarify requirements and technical options, develop or improve a mobile app, or connect LINE and existing tools to a specific workflow. Keep the contact action primary. Do not add unsupported consulting clients, testimonials, prices, availability dates, performance promises, or claims that personal tools are established commercial products.

The bilingual hero is: “Define the problem. Build the right tool.” / “把需求釐清，把工具做出來。”

## Work examples, not a product catalogue

| Internal media key (unchanged) | English display title | Traditional Chinese display title | Context |
| --- | --- | --- | --- |
| `moment` | Life & travel planning | 生活事項與行程整理 | Personal tool in development; design preview |
| `line-family-translator` | Family LINE Translator | 家庭 LINE 翻譯 Bot | Family trial, not public signup; scripted video demonstration |
| `productdev` | Development task monitoring | 開發任務監控 | Personal development tool; workflow illustration |
| `timwork` | Project tasks & handover | 跨專案任務與交接管理 | Personal project organization; workflow illustration |

Use the purpose-based titles for headings, video captions, accessible names, and full-film dialog titles in both languages. Internal data keys, media filenames, and the asset manifest remain stable. Explain the problem, what the tool does, and Timothy's role in plain language. These are not client commissions or products for sale.

The LINE bot was built for actual family communication; the film itself is a scripted illustration. Do not call the working bot merely a concept, and do not imply public access, guaranteed availability, perfect translation, or LINE endorsement.

The existing video and poster bytes are unchanged in this copy/layout revision. Older working names remain baked into those assets. Removing them from footage requires a separately versioned media edit, not CSS masking, file renaming, or an unsupported claim that this page rewrite changed the films.

## Company experience and evidence

The company-work section describes Timothy's contributions within teams, not product ownership. Its content, assets, and links are preserved. Resume facts remain bounded by `source/resume.md`; the existing ten-plus years of mobile experience can support the biography but not invented consulting outcomes.

The website should not lead with slogans about intelligence, contracts, authority, checkpoints, or AI implementation. Technical concepts may appear only when needed to explain a concrete job or documented contribution, not as standalone manifesto sections.

## Delivery

The portfolio remains dependency-free HTML/CSS/JavaScript with the existing bilingual media controller. `site/consulting.css` contains scoped layout adjustments for longer descriptive titles. Keep the existing `#native` and `#method` anchors for incoming links; they now contain services and practical collaboration steps.

Cloudflare Workers Static Assets serves the portfolio from `.portfolio-dist`, built by `scripts/build-portfolio.sh`. The GitHub Pages workflow separately publishes resume pages. Do not assume a merged PR or successful Pages deployment updates timyeou.com.

Publish only the explicit build allowlist. Media sources, these notes, private URLs, PDFs, and QA evidence must not enter the Cloudflare bundle. Run `bash scripts/validate-site.sh` and verify bilingual layouts and media switching before release. Do not deploy as part of a content review without explicit authorization.
