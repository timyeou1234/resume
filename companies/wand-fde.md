# Wand Forward Deployed Engineer application profile

Target: Wand Synthesis AI Inc — Forward Deployed Engineer.
Location in the employer listing: Remote, Asia Timezone. Department: Sales.
Exact job ID: `9da2cf5f-38e6-4aa7-942e-6bd0e15cdbe8`.
Employer listing: https://jobs.ashbyhq.com/wand-ai/9da2cf5f-38e6-4aa7-942e-6bd0e15cdbe8

Reviewed on 2026-09-17 using the employer's indexed posting (the search tool
reported a last-week crawl; direct page fetch failed). This is not a live Ashby
API or application-form test. Do not substitute the separate US-timezone role.

## Build and scope

```sh
make ai COMPANY=wand-fde
./scripts/validate.sh ai-wand-fde
```

Output: `dist/ai-wand-fde.pdf`; recipient filename:
`Timothy-Yu-Wand-FDE-Resume.pdf`.

The profile reuses the AI entrypoint's optional content hook and existing
employment/education sections. It does not change the five standard PDFs,
shared typography, margins or publication list. CI builds the company profile
as an additional artifact; it does not publish it over the standard `ai.pdf`.

## Editorial choices

- Headline: Software Engineer | Client Solutions & AI Applications. This is a
  positioning headline, not a claim of having held a formal FDE position.
- Put client project delivery before the skills list. The named Royal Technology
  and Crypto.com highlights summarize entries in the chronological history on
  page two; they do not represent additional jobs or extra years of experience.
- Lead projects with the family LINE translator, then task/handoff tools and the
  Moment backend: user need, API integration, evaluation, and failure handling.
- Keep technical scope concrete. MCP tool interfaces are not evidence of having
  deployed an enterprise multi-agent platform. Production mobile work and
  independent AI projects remain separate evidence classes.
- The first page presents the reason to consider a client-facing transition;
  the second retains the full reviewed employment chronology and education.

## Evidence used

The employment and client-delivery claims come from `source/resume.md` at main
`16902192d016ce3ddfaedd48cf981c95597af7fb`, especially Royal Technology
(Apr 2019–Aug 2020) and Crypto.com (Sep 2024–Jul 2026).
No new employer, consulting-company name, date, customer identity, revenue,
productivity metric, executive-sales experience or AI deployment is invented.
The separate business's dates and relationship to Royal Technology remain
unspecified and are not assigned to a job entry.

Project evidence re-read on 2026-09-17:

| Repository / file | Read scope | Blob SHA |
| --- | --- | --- |
| line-family-translator / README.md | lines 1–26: private pilot, evaluation and integration scope | `94acaf450b26f625fcbbfabece5c11dfc5cddc94` |
| line-family-translator / package.json | full file: Node.js gateway and JavaScript tooling | `5ddb398e6bf4df427b2d47ba61e65b6b98ac5a7a` |
| MomentAIBackendService / README.md | lines 1–70: private HTTP service, SQLite, replay/restart test description | `b6aaac775fa934aec0157cffcbfa71dc52782979` |
| MomentAIBackendService / package.json | full file: TypeScript/Node.js runtime and tests | `999840107b7987a4107c88af99daef9e4974b8ac` |
| tim-work-os / scripts/replacement/TICKET_CRUD.md | lines 1–65: sandbox CRUD, MCP/HTTP, revision and idempotency guards | `8aafc620aa95dda7a6ab74056ba5d88b1c89009f` |

The source resume adds only the two Node.js/backend facts used here, with the
same wording already reviewed for the Binance profile. No product tests, model
inference, LINE calls or MCP mutations are executed as part of this resume task.
Test descriptions are existing repository evidence, not a new product test run.

## Requirements not claimed

The employer asks for customer-facing implementation and agent engineering.
The resume does not invent RAG, LangGraph, LangChain, CrewAI, production
multi-agent orchestration, enterprise AI go-live, presales ownership or executive
demos. It also does not claim Python, OAuth/JWT/mTLS, VPC/on-prem deployment or
enterprise compliance experience without candidate-specific evidence.

Royal Technology supports client planning and hands-on software delivery, not a
claim of US enterprise AI consulting. LINE remains a private pilot with native-
speaker review and always-on operation pending. Moment remains in development,
and the task platform remains a local sandbox. No translation accuracy score is
inferred from development cases or runtime success.

Before applying, verify Taiwan hiring eligibility, customer-call overlap with
US time zones, travel expectations and the sales/implementation responsibility
split. No availability commitment, relocation promise or application submission
is made by this profile.

## Validation

Use the repository checks plus rendered-page review. Verify readable URLs,
company/date associations and project status. Compare the untouched default
PDFs and page-two employment text against the baseline. Record exact-head
results in the PR; parser checks are not ATS screening guarantees or AI-authorship
detection. This branch is independent of Binance PR #23; neither its branch nor
company profile is modified. Both PRs extend the validator/workflow, so preserve
both company targets when reconciling them for merge.
