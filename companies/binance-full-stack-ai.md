# Binance Full Stack AI application profile

## Exact target

Job ID: `ab26c3f8-3728-4750-a07b-88adb962e3bc`
Candidate-selected application URL:
https://jobs.lever.co/binance/ab26c3f8-3728-4750-a07b-88adb962e3bc/apply

Reviewed 2026-09-16. The latest indexed official job description and official
Binance job lists call this **Pioneer Talent Program - Full Stack AI Engineer,
Fronted Oriented (Top Talent Program)**. The description values depth in one
stack (explicitly including Swift/iOS), cross-layer implementation, AI/LLM
work, and product ownership.

Retrieval caveat: direct opens of the bare description and application URL
returned **Full Stack Engineer, BigPay (Fully Remote)** in a view marked crawled
last month. The exact same job ID in the official search result marked crawled
today, the official jobs list, and the application URL with its source query
parameter returned Pioneer. Do not mix the two requirement sets or assert a
verified title-change date. This profile follows the newer Pioneer description
for the candidate's exact ID, not the Futures or Backend Oriented job IDs.
Confirm the displayed title and description before submitting.

## Build and scope

```sh
make ai COMPANY=binance-full-stack-ai
./scripts/validate.sh ai-binance-full-stack-ai
```

Output: `dist/ai-binance-full-stack-ai.pdf`, two pages. The optional AI content
hook reorders sections for this profile: summary, skills and cross-stack
projects on page one; shared professional experience and education on page two.
Default AI content is unchanged when no overlay is selected. The other four
standard PDFs are unchanged. CI builds the five standard PDFs plus this profile.
The existing publishing script still publishes only the five standard PDFs.

This replaces the mistaken Futures-only scope in PR #23; the old commit remains
in history, but Futures overlay files, the US Tech hook and the Futures CI
validation target are removed from the final diff. No application is submitted.

## Evidence mapping

- **Depth:** professional native-iOS work, Crypto.com Earn/Buy & Swap and
  SportyBet real-time updates; 10+ years describes mobile development only.
- **Cross-layer implementation:** professional React Native/TypeScript at
  pre-launch Cronos; personal React web workspace, Node.js HTTP services and
  Cloudflare Workers/D1. React Native is not relabeled as React web experience.
- **AI implementation:** local-LLM integration, 100-case development and separate
  40-case holdout evaluation, and MCP ticket operations. Personal/sandbox/pilot
  status remains explicit; no invented RAG or commercial agent-platform claim.
- **Ownership:** existing delivery, API collaboration, diagnostics, manual QA
  and code-owner approval; all eight employers, dates and education retained.

## Additional project facts verified for this profile

The matching factual additions are recorded in `source/resume.md`. Evidence was
read from the candidate's project repositories; no project tests or live model
requests were rerun during this resume change.

| Source | Inspected material | Blob SHA |
| --- | --- | --- |
| tim-work-os | package.json: React/react-dom, Node MCP commands | ec247e2c560b33801f083a090a9ab35b9f8bf8f9 |
| tim-work-os | src/main.jsx, lines 1-65: React hooks, DOM root, routing, work/run/knowledge/decision navigation | 933e4b0964267630dd70f2ce270b15f903b5bc63 |
| tim-work-os | scripts/replacement/TICKET_CRUD.md, lines 1-34: shared command boundary, sandbox-only lifecycle | 8aafc620aa95dda7a6ab74056ba5d88b1c89009f |
| line-family-translator | package.json: JavaScript Worker, Node.js gateway and evaluation scripts | 5ddb398e6bf4df427b2d47ba61e65b6b98ac5a7a |
| line-family-translator | README.md, lines 1-45: private trial, D1, evaluation and availability limitations | 94acaf450b26f625fcbbfabece5c11dfc5cddc94 |
| MomentAIBackendService | package.json: TypeScript/Node.js service and deterministic verification scripts | 999840107b7987a4107c88af99daef9e4974b8ac |
| MomentAIBackendService | README.md, lines 1-135: HTTP/SDK boundary, SQLite state, replay/restart tests and private-preview limits | b6aaac775fa934aec0157cffcbfa71dc52782979 |

Do not add Java/Spring Boot, Kotlin, Next.js, RAG, commercial React-web years,
model training or production-scale agent orchestration merely to match the JD.
The newer Pioneer description does not require equal depth in every stack;
retain the actual professional-versus-project distinction.
