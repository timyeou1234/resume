# Binance Futures application profile

Target: Senior iOS Engineer, Futures (Engineering - Mobile).
Reviewed on 2026-09-16 against the employer's listing:
https://jobs.lever.co/binance/fcde5d37-6ed1-4205-9bb2-34c6476eb872

## Build

```sh
make us-tech COMPANY=binance-futures
./scripts/validate.sh us-tech-binance-futures
```

Output: `dist/us-tech-binance-futures.pdf`. Use the US Tech entrypoint for this
overlay. The five default variants keep their original content. CI builds and
validates this sixth PDF as an additional artifact; the existing site publish
script still publishes only the five standard PDFs. Do not replace `ai.pdf` or
`us-tech.pdf` with the tailored output.

## Positioning and evidence

This is a one-page native-iOS application, not a general application to every
Binance role. The headline, summary and skill ordering prioritize Swift/UIKit,
real-time client updates, wallet delivery and diagnostics. The employment and
education sections are shared with the reviewed source, not copied or rewritten.

| Employer requirement | Candidate evidence retained |
| --- | --- |
| Swift, UIKit, iOS UI architecture and maintainable code | Swift/UIKit, Swift Concurrency, RxSwift/MVVM and the existing native-iOS work |
| Cross-functional feature delivery | Crypto.com Earn and Buy & Swap, scope/API/release collaboration, KINTO delivery |
| Responsive and stable client behavior | SportyBet WebSocket updates, subscription handling, mock server and production diagnostics |
| Finance/crypto experience | Onchain Earn and Buy & Swap; pre-launch Cronos signing and Morpho flows |
| Cross-platform experience as a plus | React Native/TypeScript with Fabric and TurboModules; no invented Flutter/KMP experience |

Facts are bounded by `source/resume.md`, `source/production-tooling.md` and
`RESUME_GUIDELINES.md`. The 10+ years statement is the mobile career, not 10+
years of React Native or blockchain specialization. Approximate DAU stays
approximate. The Crypto.com AI-assisted development bullet is retained; the
three AI side projects are not copied into this native-iOS application.

The JD also names memory management, multithreading and app launch flow. Do not
invent incidents, optimization metrics or claimed launch-time improvements to
fill these requirements. Swift Concurrency is confirmed; a concrete memory or
launch-flow case would need candidate confirmation. Do not recast betting as
Futures trading, or add order-book, matching-engine or quant experience.

The location line includes Asia / Taiwan, Taipei but says Onsite or Remote;
work-from-home is team-dependent. Confirm the actual remote arrangement with
recruiting. This profile does not assert work authorization, relocation or
permanent worldwide remote eligibility, and does not submit an application.

## Review

Check the one-page output, readable contact URLs, company/date pairs, pre-launch
label, font embedding and text extraction. Compare default variants against
their baseline after changing the optional summary/skills hooks. A successful
PDF parser check is not evidence that a specific ATS will accept or rank the
application. Record exact-build validation in the PR, not as a timeless claim
here.
