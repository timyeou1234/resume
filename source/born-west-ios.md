# Born West Senior iOS Engineer: application profile and evidence

Target: https://www.bornwest.com/careers/senior-ios-engineer
Reviewed on 2026-09-29. The official page describes a worldwide remote contract
role covering architecture, delivery, maintenance, client communication,
persistence, performance, and AI integration. The web extraction is cached;
this is not a live application-status or employer-verification guarantee.

## Build and scope

```sh
make ai COMPANY=born-west-ios
./scripts/validate.sh ai-born-west-ios
```

Output: `dist/ai-born-west-ios.pdf`.
Recipient filename: `Timothy-Yu-Born-West-iOS-Resume.pdf`.

This company-specific projection uses the existing AI content hook, identity,
typography, and education. It does not replace the default AI resume or change
any of the five standard PDFs, the Wand content, or the site publication list.
It emphasizes production native iOS work, not a generic FDE or AI-engineer title.

The base is PR #24 at `c17addb4e7bae81f1cc08c9a102488dc4f0e56a6`, which includes
confirmed WeWork co-founder facts. This PR is stacked on that branch; after #24
merges, retarget to main and reconcile additive build/validation targets without
dropping Binance, Wand, or Cresta changes. Do not modify those other branches.

## Employment and identity

Baseline facts come from `source/resume.md` at the base commit (blob
`33c60a29f2c77e549066730b82b2042eb33c2b06`) and the already reviewed resume PDFs.
All eight employer names, roles, dates and education are retained. Approximate
DAU values remain approximate. Crypto.com employment ended in July 2026;
Cronos work is pre-launch. WeWork Technology is a separate employer from Royal
Technology; its title is Co-Founder / iOS Developer, Jan-Jul 2017.

The candidate is based in Taiwan (UTC+8). This resume does not promise US/EU
working hours, relocation, hiring eligibility, or any particular contract terms.

## New candidate-confirmed details used in this profile

These were supplied during the Born West application-answer discussion in this
chat, not inferred from a job description or a hypothetical sample.

### SportyBet architecture

- MVVM and RxSwift separated UI state from networking and persistence concerns.
- A shared HTTP abstraction over AFNetworking handled backend-specific signature
  logic and response/model parsing. This is not the WebSocket transport library.
- Incoming WebSocket data was queued and decoded in order, then passed through
  the data layer before RxSwift propagated model changes to the UI.
- Core Data persisted betting history and reflected record changes in table views.
- The exact WebSocket client, queue implementation, Core Data context setup and
  use of NSFetchedResultsController were not confirmed. None is named in the PDF.
- Queue-based processing is not a claim that sockets ran indefinitely while the
  application was backgrounded. No invented performance improvement is added.

### Crypto.com Buy & Swap

- The candidate owned Buy on iOS, in addition to the recorded Earn work.
- Buy & Swap connected fiat purchase of a supported token to a user-initiated
  swap after the purchased asset arrived in the wallet.
- Product/backend collaboration included arrival-status detection, evaluating
  WebSocket versus polling/backoff, notification-service integration, quote
  timing, clearer user states, fewer steps, and conversion/error logging.
- Final transport selection, automatic swaps, conversion uplift and error-rate
  improvement were not provided and are not claimed.

### WeWork client example

- The candidate directly discussed requirements for a food-barcode lookup app.
- The revision removed two unnecessary intermediate screens, navigated directly
  to product details after scanning, preserved native back navigation, and added
  visual scanning guidance.
- Scanning time was not measured. The barcode library remains unconfirmed;
  merely browsing a suggested Pod is not confirmation that it was used.

### Performance and recovery answer

The candidate discussed how they would diagnose extended-session slowdowns and
why recoverable workflows matter. A proposed diagnostic plan is not a completed
performance project. The PDF uses actual Firebase/Datadog/Elasticsearch work
and Moment's recovery tests, not invented Instruments results or memory metrics.

## Moment and the public Swift sample

The Moment project remains private and in development. Earlier inspected Swift
files establish feature-based UI, separate navigation/services, MomentCore,
protocol-based async clients, validation/compilation, stale-result protection,
cancellation tests, and input preservation. No full-app coverage or released
product capability is claimed.

Public code sample:
https://github.com/timyeou1234/swift-llm-output-validation

The GitHub connector confirmed public visibility and default branch main on
2026-09-29. README and docs/VERIFICATION.md describe the standalone adaptation,
34 deterministic XCTest cases, local demos, and Debug/Release checks on Linux
and macOS. Latest inspected main was `b645095c8be4786c2449e519faaea8c973fcf6b7`;
run https://github.com/timyeou1234/swift-llm-output-validation/actions/runs/36519568597
reported completed/success. This resume task did not rerun that package or
modify it. Its public status is not an open-source license grant.

The sample validates a reviewable proposal; it does not accept user decisions,
persist application state, execute tools, call an LLM, or verify factual truth.
Its test count is not coverage of the full Moment application.

## Claims deliberately not added

Do not fill JD keywords with unconfirmed Core ML/MLX inference inside the iOS
app, Core Location, push-provider integrations, a specific payment gateway,
Core Animation, or on-device model deployment. Server-side/local-Mac inference
and Swift validation are different from on-device iOS inference. Do not infer
scan-time savings, production-memory reductions, or business growth metrics.

## Verification and maintenance

Validate the new PDF and the existing five standard PDFs plus Wand. Keep the
native-iOS headline, the original employer/date associations, public sample
URL, Core Data/AFNetworking distinction, two-screen result and project status.
Check actual rendered pages and text extraction. A PDF parser check is not a
real ATS field-mapping or hiring-screening test. Exact-run results belong in
the PR; no merge, deployment, code publication or job submission is authorized
by creating this resume.
