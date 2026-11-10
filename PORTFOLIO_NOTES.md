# Portfolio content and delivery notes

## Current LINE film — V12 (2026-10-06)

The owner rejected V10's simplified two-phrase LINE illustration. The current LINE section uses the five-chapter, 36-second film documented in `docs/line-film-v12-acceptance.md`: actual worker responses for language settings and bidirectional translation, rendered as a disclosed interface demonstration with synthetic test conversations. Four editions cover desktop/portrait and Chinese/English captions. The original avatar and all historical assets are preserved. The other three product walkthroughs are unchanged.

Run `node scripts/test-line-film.cjs` in addition to the validation commands below. The public bundle adds exactly four films and four posters to the existing fourteen product images; the build-time Remotion project and source response fixture are excluded. Earlier V9/V10 sections below remain historical context, not the current LINE implementation.


## Current direction — 2026-10-05

The owner's current requirement is real products with copy tailored to each
product, without filler, **including animated product showcases**. The initial static V9 revision missed the animation requirement; V10 restores it using original material. This supersedes the former V8 media selection and hero
wording. The portfolio still supports freelance development and technical
consulting; it does not invent clients, testimonials, prices, release dates,
signup links, uptime guarantees, or performance outcomes.

The hero now names the services directly: mobile apps, LINE integrations, and
workflow tools. Each case explains the use, implemented features, and Timothy's
contribution. Removed material includes repeated promotional slogans, rebuilt
product interfaces, scripted chat videos, duplicate availability copy, and the
inactive film player. Company experience stays grounded in `source/resume.md`;
DAU labels explicitly refer to the period of employment.

## Crawlable locales and external quality checks — V11

The portfolio now serves Traditional Chinese at `/` and English at `/en/`.
`scripts/render-locales.py` renders both from the same bilingual source; visible
copy, metadata, alt text, and localized image links exist before JavaScript runs.
Language links retain the current section when JavaScript is available. Each
locale has a self canonical and reciprocal hreflang links, with both URLs in the
sitemap. `robots.txt` points crawlers to that sitemap. Language follows the URL,
so saved client preferences no longer override a shared page's language.

The primary Taiwanese search phrase is “App 開發”. The title, description, hero,
service heading, and relevant project context name the actual service. Product
claims and original image bytes are unchanged. Do not manufacture claims,
keyword-only domains, invisible text, or ranking guarantees to improve a score.

The external baseline was measured using Google PageSpeed Insights and Seobility
Keyword Checker, guided by Addy Osmani's `web-quality-skills` at commit
`afa8da942115f2961fdbfa80807ea0b232ff6c00`. Raw reports, screenshots, repeated
measurements and release records live in sibling `portfolio-quality-v11-qa/`;
none is included in the public bundle. Lighthouse SEO checks technical
eligibility, while Seobility's keyword score checks on-page usage of a selected
phrase. Neither measures actual search rankings. No CrUX field data was available
for the baseline. Report observed scores without implying legal certification.

The standard validator additionally runs `scripts/test-portfolio-locales.py`,
which checks both static documents, exact translations, metadata, language links,
all local links, 11 showcase scenes, robots and sitemap without executing JS.

## Selected product material

`media/portfolio-real-v9/media-manifest.json` records the six selected originals,
their source, dimensions, bytes, and SHA-256. `media/portfolio-motion-v10/media-manifest.json` adds eight original captures and the authored LINE phrasebook examples. No source image was redrawn, translated, or retouched. Responsive presentation may clip a desktop capture; every capture links to its full original. Animation and bilingual copy live in HTML/CSS/JS.

| Media key | Display title | Current material | Evidence boundary |
| --- | --- | --- | --- |
| `moment` | Moment | Three original iOS simulator captures from the app's September 21 visual-parity evidence | Test fixtures; Chinese UI preserved in both site languages; not a released App Store product |
| `line-family-translator` | Family LINE Translator / 家庭 LINE 翻譯 Bot | Original product avatar with an animated two-way translation flow using authored phrasebook examples | Artwork, not a conversation capture; personal-chat and family-group trial claims are supported by the repository's trial record |
| `productdev` | Development task monitoring / 開發任務監控 | Original macOS icon and three captures of actual compiled SwiftUI views with synthetic fixture data | Original native views, not a live run recording; observer and adapter disabled in a separate temporary copy; capture harness patch is retained |
| `timwork` | Project tasks & handover / 跨專案任務與交接管理 | English and Chinese captures of the running `/portfolio`, `/knowledge`, and `/decisions` routes | Bundled mock fixtures in isolated mode; does not demonstrate production authority replacement or live project progress |

Moment retains its brand and “Independent app · Preparing for launch” /
“自有 App · 準備推出” status. Its tested screenshots match the hashes in the
source evidence and include the source app binary hash in the selected manifest.
Do not relabel Moment a personal-only tool or invent a launch date.

The LINE bot keeps its identity and family-trial status. The existing avatar is
used instead of a fabricated LINE conversation or private family messages. Do not
claim public signup, universal language support, perfect translation, or
continuous availability from a bounded trial.

As of 2026-11-10 the two personal tools are presented as one case,
`devtools` (Development task & handoff tools / 開發任務與交接工具), with a
four-scene walkthrough: workspace overview → decisions → native monitor → run
detail. The V10 runs and knowledge captures remain in the immutable manifest and
`site/assets` but are no longer shipped. Public copy uses no private platform
name. Historically, the two personal tools retained purpose-based public names. The web
workspace is a private personal tool, separate from the open-source skills described in the
resume; the macOS monitor is also personal tooling. Capturing private live
telemetry is unnecessary for either case; the selected assets contain no live
run records or private messages.

## What was retired

The V5/V7 promotional films used in the V8 release are historical source assets.
Their originals, silent derivatives, manifests, and provenance are preserved
unchanged. They are no longer referenced or shipped. The old acceptance record
at `docs/portfolio-media-v8-acceptance.md` describes that earlier candidate only.

V10 has four silent browser-native animated walkthroughs: Moment overview → edit → saved list; LINE Chinese → Indonesian and Indonesian → Chinese; native monitor → task graph → run detail; workspace overview → knowledge → decisions. Scenes advance every 5.5 seconds using elapsed time. These are animations of source captures (LINE is an explicit flow illustration), not screen recordings.

Each walkthrough includes pause/play and direct step selection. Step selection pauses playback; inactive scenes leave the accessibility tree and keyboard order. Focusing an original-image link pauses its walkthrough. Offscreen and hidden-document playback stops. Reduced-motion and data-saver preferences default to manual playback. Without JavaScript the first scene remains readable. Web workspace screenshots and links switch with the page language; Moment and the native macOS UI preserve their original language.

## Validation and delivery

Run:

```sh
bash scripts/validate-site.sh
python3 scripts/test-portfolio-manifest.py
node scripts/test-portfolio-showcases.cjs
git diff --check
```

The validator checks local anchors and assets, product identity and status,
original-media provenance and hashes, bilingual source context, accessible image
labels and dimensions, and the explicit deployment allowlist. It still verifies
the historical V8 package and all nine existing rejection paths. Six additional
rejection cases cover the current captures, their classification, dimensions,
and source context. Five V10 cases additionally reject missing/altered captures, absent native fixture provenance, a flow mislabeled as chat recording, and loss of walkthrough scenes. Historical source-integrity and deployment-boundary checks remain intact.

Browser verification for this candidate covers English and Traditional Chinese
at 320px, 390px, and 1280px, all four cases, company experience, contact, image/link
language agreement, no page-level horizontal overflow, reduced motion, and
all 11 scenes at each language/width combination (66 views), actual autoplay for each product, manual step selection, keyboard selection, and reduced motion. The production-controller harness verifies throttled timing, wrap, offscreen/hidden-document pause, focus, localization, reduced motion, and save-data. V10 evidence is in the sibling `portfolio-motion-v10-qa/` folder; V9 evidence remains in `portfolio-real-v9-qa/`. Neither enters the deployment bundle.

Cloudflare still serves the output of `scripts/build-portfolio.sh` from
`.portfolio-dist`. Its allowlist contains only the site files and fourteen selected
product images. No source notes, QA evidence, private paths, resume files, or
historical films enter that bundle. Resume/PDF publication remains separate on
GitHub Pages. Keep `#native` and `#method` anchors for existing incoming links.

The owner approved publishing this candidate on 2026-10-05 (「可以，發佈」).
The release uses the existing Cloudflare configuration and a clean checkout of
the approved source commit. Prior active version:
`12dac115-02ef-4119-9dc1-e84b455f90b1` at 100% traffic. Release output, deployed
version, remote asset hashes, and live browser evidence are recorded under the
sibling `portfolio-motion-v10-qa/release/` directory. GitHub Pages resumes have a
separate release workflow. Preserve both generations' immutable source assets.
