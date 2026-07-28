# Senior iOS Resume Repository

An ATS-friendly, one-to-two-page LaTeX resume system with focused variants for US
technology companies, Web3 teams, and the Taiwan market. Facts are shared;
positioning changes by audience.

> The included experience, metrics, links, and education are realistic
> placeholders. Replace every example with truthful information before use.

## Repository layout

```text
config/       Shared LaTeX setup, identity, metadata, and overlay loading
resumes/      Small entrypoints that compose each audience variant
sections/     Shared and audience-specific resume content
companies/    Optional, tracked company-specific overlays
scripts/      Build and page-count/ATS smoke-test scripts
dist/         Generated PDFs
```

The three entrypoints deliberately contain almost no content. Common facts live
in `sections/experience.tex` and `sections/education.tex`; summaries, skill
ordering, and selected work vary because recruiters in each market scan for
different signals.

The Taiwan variant is English-first for maximum ATS portability. If a role
requires Traditional Chinese, switch that entrypoint to XeLaTeX and configure a
CJK font available both locally and in CI; do not add CJK text to the current
pdfLaTeX build without doing so.

## Prerequisites

- TeX Live 2024 or newer with `latexmk`
- GNU Make
- Poppler (`pdfinfo` and `pdftotext`) for validation

On macOS:

```sh
brew install --cask mactex-no-gui
brew install poppler
```

After installing MacTeX, start a new shell so `latexmk` is on `PATH`.

## Build workflow

```sh
make all              # all three PDFs
make us-tech          # dist/us-tech.pdf
make web3             # dist/web3.pdf
make taiwan           # dist/taiwan.pdf
make validate         # build, enforce 1–2 pages, verify extractable headings
make clean
```

GitHub Actions runs `make validate` for pushes and pull requests, then uploads
the three PDFs as a workflow artifact. Generated PDFs are intentionally ignored
by Git; source remains the reviewable artifact of record.

## Customize your resume

1. Replace identity values in `config/commands.tex`.
2. Replace all example employers, metrics, projects, and education.
3. Keep achievements in the pattern **action + technical scope + result**.
4. Build all variants after shared-content changes.
5. Open each PDF and perform a final visual and factual review.

Use `config/company.local.tex` for private details you do not want committed:

```tex
\renewcommand{\ResumeEmail}{name@example.com}
```

That file is ignored by Git and is loaded for every variant.

## Tailor for a company

Copy `companies/example.tex` to a lowercase slug such as
`companies/coinbase.tex`, then override only the relevant commands:

```tex
\renewcommand{\ResumeTagline}{Senior iOS Engineer | Wallet Infrastructure}
```

Build the overlay:

```sh
make web3 COMPANY=coinbase
```

The result is `dist/web3-coinbase.pdf`. For deeper tailoring, add a narrowly
scoped command to `config/commands.tex` and use it in a section; avoid copying a
whole resume or experience section. Keep claims truthful and retain keywords
only when they match actual experience.

## ATS and page-count guidance

- The template uses a single reading order, conventional headings, text links,
  and no icons, sidebars, graphics, or skill-rating charts.
- `glyphtounicode` and embedded Latin Modern fonts improve text extraction.
- Validation checks page count and required extractable headings. It cannot
  guarantee performance in every ATS, so test the final PDF by copying its text
  into a plain-text editor.
- Validation allows one or two pages. Prefer removing weak bullets over shrinking
  below 10 pt or tightening margins further.
- Use US Letter for US/Web3 applications. If a Taiwan employer explicitly
  requests A4, add a separate paper-size override rather than silently changing
  every variant.

## Release checklist

- All names, dates, numbers, and links are accurate.
- The most relevant keywords appear naturally and are defensible in interview.
- Every bullet communicates an outcome, not only a responsibility.
- `make validate` passes.
- PDF text copies in the expected order.
- Filename is professional, for example `First_Last_iOS_Resume.pdf`.

## License

MIT. The template may be reused; your personal resume content remains yours.
