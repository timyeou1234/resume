# Resume development and application workflow

This repository keeps one reviewed factual baseline, five audience variants,
and registered application profiles. Start with `make profiles` to see the
existing Binance, Wand, Cresta and Born West versions.

## Layout

```text
source/                  Factual baseline and dated supplemental evidence
RESUME_GUIDELINES.md      Shared writing preferences and factual boundaries
applications/<slug>.json Job identity, base, sources and acceptance checks
companies/<slug>.tex     Company-specific presentation
companies/<slug>.md      JD snapshot, requirement mapping, choices and gaps
config/validation.json   Shared PDF checks
resumes/                 Five standard LaTeX entrypoints
sections/                Shared and audience-specific content
scripts/resume.py        Registration, discovery, build and validation CLI
dist/                    Generated PDFs (not committed)
dist/applications/<slug>/ Automated receipt and brief snapshot (not committed)
```

Born West's existing brief and confirmed supplemental facts remain together in
`source/born-west-ios.md`; the profile points there without duplicating them.
Historical briefs retain their original dates and verification caveats. A
stored job URL or `ready` status does not assert the role is still open.

## Prerequisites

- TeX Live 2024 or newer with `latexmk` (pdfLaTeX and XeLaTeX)
- Noto Serif CJK TC and Latin Modern Roman fonts
- GNU Make, Bash, Python 3.9 or newer (standard library only)
- Poppler: `pdfinfo`, `pdftotext`, and `pdftoppm` for visual review
- Git for the source revision and file digests in application receipts

On macOS, install MacTeX and Poppler with Homebrew, and install the Noto Serif
CJK TC font. Ensure `/Library/TeX/texbin` is on PATH. CI uses the pinned TeX Live
container, Python and Noto CJK fonts. If LaTeX is unavailable locally, use the
actual CI artifact from the candidate commit for PDF validation and visual QA;
do not report a local compilation that did not occur.

## One application, end to end

```sh
make profiles
python3 scripts/resume.py init example-ios \
  --company "Example" --role "Senior iOS Engineer" \
  --url "https://example.com/jobs/ios" --jd /path/to/captured-jd.txt
```

Initialization creates three files without overwriting existing work:
`applications/example-ios.json`, `companies/example-ios.tex`, and
`companies/example-ios.md`. The new profile is a **draft**, excluded from the
release build. Omit `--jd` to fill in the snapshot later; `--base` selects a
standard variant and defaults to `ai`.

1. Complete the brief: exact JD and date, requirement-to-evidence mapping,
   gaps, editorial choices, and factual review. Never turn missing requirements
   into invented skills or change a historical job title to match the target.
2. Edit the overlay. Simple positioning uses `ResumeTagline`; the AI base also
   exposes `ResumeContent` to reorder summaries, skills, projects and shared
   sections. Reuse `sections/experience-ai-primary`,
   `sections/experience-ai-additional` and `sections/education` when applicable.
   Use `RESUME_GUIDELINES.md` for evidence limits and readability.
3. Add `validation.required_text` that distinguishes this profile from the
   default PDF and protects project status and any important specific claims.
   `forbidden_text` adds profile-specific exclusions. `exact_pages` is `1`, `2`,
   or `null` for the shared 1-2-page rule. Set `reviewed_on` to the actual review
   date and list every supplemental factual source in `sources`.
4. Preview a draft with `make ai COMPANY=example-ios`. Finish the brief's TODOs
   (record visual review as pending until it occurs), then set `status` to
   `ready` to enable the acceptance path:

```sh
make tailor COMPANY=example-ios
```

This builds `dist/ai-example-ios.pdf`, validates **that exact output**, and saves
`dist/applications/example-ios/validation.json` plus a copy of the brief. The
receipt includes the PDF digest, source digests, commit, dirty-worktree flag,
page counts and per-page word counts. It records visual review as pending and
submission as false; automated checks do not certify factual truth or layout.

5. Render every page using `pdftoppm -png -scale-to 1400`, inspect for clipping,
   overlap and balance, and check text reading order and claims. Record the
   visual result alongside the exact commit and PDF digest in the PR.
6. Provide the PDF, a concise account of changes and any candidate questions.
   Sending an application is a separate action requiring user authorization.

The existing `make ai COMPANY=wand-fde` and
`./scripts/validate.sh ai-wand-fde` commands remain valid. A new company requires
only its three profile/content/brief files; CI and the validator discover ready
profiles automatically. Unregistered overlays other than `companies/example.tex`
are rejected so a forgotten application cannot silently miss validation.

## Shared maintenance

- `source/resume.md` is the human-readable factual record and published resume
  copy. `source/production-tooling.md` and listed supplemental records retain
  evidence too detailed for the published copy.
- Synchronize confirmed employer names, dates, roles, approximate scale and
  product status across affected standard and company versions. Preserve the
  difference between production Onchain and pre-launch Cronos.
- Keep general writing preferences in `RESUME_GUIDELINES.md`; keep company
  emphasis and project order in its profile/overlay. Do not put every company's
  preferences into the shared defaults.
- Shared changes require rebuilding and reviewing all affected PDFs. Do not
  shrink fonts or remove factual limitations merely to fit a page.
- `config/company.local.tex` remains an ignored local override for private
  contact details. CI cannot reproduce this file; local receipts include its
  digest when present. Shared contact checks must still pass for acceptance.

## Commands and release checks

```sh
make all                         # five standard PDFs
make ai                          # default English baseline
make chinese                     # Traditional Chinese, XeLaTeX
make profiles                    # registered jobs and draft/ready status
make check-profiles              # paths, schema, sources, completed briefs
make test                        # workflow success and failure cases
make tailor COMPANY=born-west-ios # one PDF plus validation receipt
make validate                    # build and check ALL ready + standard PDFs
./scripts/validate.sh ai-wand-fde  # validate an existing output only
bash scripts/validate-site.sh    # existing portfolio checks
make site                        # validate, then prepare the public resume site
```

Do not pass `COMPANY` to `make validate`; use `make tailor` for a single job.
Build directories are isolated by full output name. Five public PDFs are
allowlisted by `scripts/build-site.sh`; company PDFs and application receipts
are uploaded as CI artifacts only. Artifacts are retained for 90 days. Successful
`main` CI continues the existing GitHub Pages publication workflow.

Before merge: complete profile checks, workflow tests, all PDF validation,
site checks, factual/visual review, and a fresh independent review of the final
candidate. Keep exact-commit CI and review evidence. A standard PDF cannot stand
in for a company PDF merely because the file was renamed.

`make clean` retains its historical behavior of deleting generated build/site
assets; it also removes `site/assets`, which includes tracked portfolio media.
Use it only when that removal is intended. Normal validation does not require it.
