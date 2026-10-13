# Resume routes and public-copy source

Candidate based on website commit `1271907c97c3a81cd9ee675bd2d2a9090fb922cb`.
This document does not authorize publication.

## Routes and audience

- `/` and `/en/`: existing consulting home, services, work examples and project-contact CTA.
- `/resume/` and `/en/resume/`: dedicated recruiter resume; contact about a role,
  print/save PDF, resume section links, language switch and return to consulting.
- `/resume` and `/en/resume` redirect to the corresponding trailing-slash route.
  Cloudflare's `auto-trailing-slash` serves each directory's `index.html`; this is
  a static multi-page site, with no SPA fallback or new Worker handler.
- Existing `#native`, `#method`, `#scale` and project anchors remain available.
- No new service, subdomain, paid dependency, live application form or private
  project data is added. The two new paths returned 404 before this candidate.

## Single public-copy source

`source/resume-public.json` holds the English and Traditional Chinese public
copy, including shared employers, roles and dates. `scripts/render-resume.py`
uses the same semantic sections to generate:

1. `.portfolio-dist/resume/index.html` and `en/resume/index.html`.
2. Markdown for the existing GitHub Pages `resume.html`, through
   `scripts/build-site.sh` calling `render-resume.py --markdown`.

Do not hand-edit generated HTML or `site/resume.md`. Do not copy resume paragraphs
into either template. Change the JSON, review both translations, rebuild and run
`bash scripts/validate-site.sh`. Both pages embed a source SHA-256, and the tests
check every rendered content block against the same Markdown output.
`source/resume.md` remains the detailed evidence record; shortening public copy
must not erase supporting facts needed by application-specific resumes.

Public section order is Summary, Professional Experience, Technical Skills,
Selected Projects (two), AI-Assisted Engineering (one paragraph), Education.
The three recent employers remain Crypto.com, San Orange Technology (client
KINTO), and OpenNet. All recorded dates are preserved, including Royal ending
August 2020. The candidate confirmed on 2026-10-13 that Royal used enterprise
internal distribution and Lion's formal title was iOS Developer. Team leadership
remains a responsibility. No signing, certification, or operational details are inferred.

## Existing website / main branch split

The live Cloudflare site was built from a newer website branch; GitHub `main`
(`3724357edce0600c06cfd9c8a8e91be464112635` at review) has newer resume facts but
older portfolio files. This candidate imports the current factual record for
reference. Do not merge the entire website branch into main or build/deploy
main's old portfolio. Do not publish PDFs from the legacy website branch.

The separate main-based synchronization candidate includes the public-copy
JSON, renderer, one line in `build-site.sh`, and content-source guidance. The
2026-10-13 factual correction also updates Royal's distribution wording in the
main-based source, shared LaTeX sections, and affected company overlays/brief.
Apply/review those together so
GitHub Pages and the Cloudflare resume use identical public content. Rebuild
Markdown from both candidates and compare it byte for byte before release.
GitHub Pages keeps its existing five-PDF allowlist and workflow. The factual
correction requires the existing PDF build/review gates for every affected variant
before a main merge. The website's `resume` routes and print layout do not ship
those PDF files. Use the main-based checkout for corrected PDFs; the legacy
website branch is not the PDF release source.

## Preview and publication

Build and test:

```sh
bash scripts/validate-site.sh
python3 scripts/test-portfolio-manifest.py
node scripts/test-portfolio-showcases.cjs
node scripts/test-line-film.cjs
wrangler dev --local --config cloudflare/wrangler.jsonc
```

Check direct requests to `/resume`, `/resume/`, `/en/resume`, `/en/resume/`,
refresh, query/hash preservation, browser back, language switching, home return,
mail link and print. Both routes must work without JavaScript; only the print
button enhancement and cross-language hash retention require it. Browser print
also remains available without JavaScript. The sitemap lists all four pages,
with self canonicals and reciprocal hreflang for each audience.

This candidate requires a new publication confirmation. After approval, publish
reviewed main-based resume changes through the existing GitHub Pages process and
the reviewed website bundle through the existing Cloudflare configuration.
Verify the content source hash and readable resume text agree. Record the active
Cloudflare version before deployment for rollback; keep the prior local commit
and source patch as well. A failed Pages build must not be called synchronized.
