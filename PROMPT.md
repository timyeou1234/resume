# Codex Resume Implementation Instructions

## Source of truth

Use `source/resume.md` as the factual content source.

Audience-specific sections may condense or reorder facts, but must not introduce
claims that are absent from the source. Preserve the distinction between
`Crypto.com Onchain` and `Cronos App`; they are separate phases of the
candidate's Crypto.com experience.

## Objective

Convert the approved Markdown content into a clean, ATS-compatible resume for Senior iOS Engineer roles. Reuse the repository's existing build system where practical.

## Content rules

- Do not invent achievements, metrics, employers, dates, technologies, or responsibilities.
- Do not turn approximate DAU figures into exact figures.
- Do not add TCP Socket, Account Abstraction, or DeFi to the skills section.
- Account Abstraction-related implementation may be described only through the factual Cronos experience already present, such as smart contract wallets and UserOperation construction.
- Keep Morpho in experience, not in skills.
- Preserve current-tense verbs for the current Crypto.com role and past tense for previous roles.
- Prefer direct, natural engineering language over marketing language or generic AI-style phrasing.
- Do not force an impact statement or percentage where none is documented.
- Every claim must be explainable in an interview.

## Editorial priorities

1. Ownership
2. Technical complexity
3. Product scope and scale
4. Cross-functional collaboration
5. Factual accuracy

## Layout requirements

- Keep the resume to no more than two readable pages; prefer one page when the complete relevant history fits without excessive compression.
- If two pages are used, both pages must contain substantive content; never leave only Education or one short section on page two.
- Keep a single-column reading order.
- Use conventional headings and text-based links.
- Avoid icons, skill bars, charts, sidebars, photographs, and text boxes.
- Maintain reliable PDF text extraction.
- Keep bullets concise, preferably no more than two rendered lines.
- Use US Letter for the US-focused version.

## Repository work

1. Inspect the existing LaTeX structure and build scripts before changing them.
2. Keep identity, experience, skills, metrics, links, and education synchronized with the factual source.
3. Keep `source/resume.md` as the human-reviewable content record.
4. Update the LaTeX source so it accurately represents the Markdown.
5. Build and validate every existing resume variant.
6. Fix build, page-count, and text-extraction failures without changing facts.
7. Do not delete the Markdown source after generating LaTeX.

## Expected output

- Updated LaTeX/configuration files
- Successfully generated PDFs in `dist/`
- Passing `make validate`
- A concise summary of content and layout decisions
- A list of any unresolved placeholders, ambiguities, or facts requiring candidate confirmation
