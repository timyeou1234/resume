# Cresta FDE application profile

Target: **Senior Forward Deployed Engineer (AI Agent)**, **Taiwan (Remote)**.
Exact job ID: `5205398008`.
Official listing: https://job-boards.greenhouse.io/cresta/jobs/5205398008

Selected from the first FDE entry in the user's 2026-09-23 Remote job briefing,
not from the earlier Wand or Binance shortlist. The official listing and job
board were re-read on 2026-09-23; web extraction reports cached content, not a
live Greenhouse API or a verified application submission.

## Build

```sh
make ai COMPANY=cresta-fde
./scripts/validate.sh ai-cresta-fde
```

Output: `dist/ai-cresta-fde.pdf`.
Recipient filename: `Timothy-Yu-Cresta-FDE-Resume.pdf`.

This is a two-page profile using the established 10pt, Letter, single-column
layout. It does not replace a standard PDF or change the public site's five-PDF
publication list. The candidate remains based in Taiwan (UTC+8); this is not a
promise to relocate or an assertion about local work authorization.

## Role alignment and factual limits

Cresta emphasizes customer requirements, agent integration, prompt iteration,
proof-of-concepts, technical troubleshooting, and project coordination. Its
requirements include Python and Go, agent/function-calling/RAG understanding,
cloud/DevOps experience, and a relevant technical degree. The posting describes
an initial CoderPad assessment after resume review.

| Profile emphasis | Confirmed candidate evidence |
| --- | --- |
| Customer requirements | WeWork Technology Co-Founder / iOS Developer: business development and client requirements interviews |
| Coordinated technical delivery | Royal Technology: primary developer and project manager from client planning to App Store release; Crypto.com: feature scope, APIs, and releases |
| Integration and evaluation | LINE private pilot: webhooks, Node.js gateway, Workers/D1, signature checks, deduplication, 100 development cases and a separate 40-case holdout |
| Safe tool interfaces | Local CLI/HTTP/MCP ticket operations, revision/digest guards, idempotency and audit history |
| Request recovery | Moment private TypeScript/Node.js service, SQLite state, replay and restart tests; input remains savable when AI is unavailable |
| Production investigation and analytics | Crypto.com Firebase/Datadog and Segment; OpenNet Firebase/Elasticsearch |

The source of candidate facts is `source/resume.md` at
`c17addb4e7bae81f1cc08c9a102488dc4f0e56a6` (blob
`33c60a29f2c77e549066730b82b2042eb33c2b06`) plus the previously reviewed shared
employment sections. The user's WeWork co-founder correction is preserved;
Royal is a separate employer. Page-one highlights summarize the same jobs on
page two and must not be counted as additional employment.

Do not add unverified Python/Go proficiency, RAG deployments, CRM connectors,
AWS/GCP/Azure operations, container orchestration, enterprise agent go-lives,
call-center experience, customer ROI, executive demos or formal FDE titles.
Keep the actual Bachelor of Business Administration degree. MCP server work
is not equivalent to a complete autonomous agent or RAG platform. LLM prompt
iteration is not model-weight fine-tuning.

The LINE system remains a private family pilot, not a deployed contact-center
solution. The local tool platform is a sandbox, and Moment remains in
development. The holdout result does not establish human-validated translation
accuracy. This resume work reuses accepted evidence; it does not rerun product
E2E, make model calls, or change production systems.

## Content and maintenance

- Lead with customer requirements, then coordination and production diagnostics.
- Prioritize API/webhook integration, prompt evaluation, state recovery and
  guarded writes in the project descriptions; do not add unsupported keywords
  merely to match the posting.
- Reuse `sections/experience-ai-primary.tex`,
  `sections/experience-ai-additional.tex`, and `sections/education.tex` unchanged.
- Use the optional AI content hook introduced in PR #24. This PR is stacked on
  `chat/wand-fde-resume-20260917` so the confirmed co-founder facts are inherited
  without opening another conflicting copy of those edits.
- After #24 reaches main, retarget this PR to main and check that only the Cresta
  overlay, these notes, and additive CI/validation changes remain. Preserve the
  Wand and Binance build targets if their PRs are reconciled in a different order.
- The PDF is usable independently of the Git merge order. No merge, deployment,
  email, assessment execution, or job application is authorized by generation.

The application asks for customer-solution and cross-functional delivery
examples. Use a real engagement with verified scope, tools and outcome; do not
invent a client story from the generic WeWork role description. Never claim a
family pilot was a paid enterprise engagement.

## Validation

Keep exact-build results in the PR. Check both rendered pages, employer/date
associations, project states, readable links, and text extraction. Validate the
five standard PDFs plus Wand as regressions and Cresta as the new target.
Expected page counts: one each for US/Web3/Taiwan/Chinese; two each for AI,
Wand, and Cresta. Parser checks do not guarantee ATS field mapping or screening.
