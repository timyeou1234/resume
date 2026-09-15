# Resume Writing Guidelines

## Positioning

The resume should present Timothy Yu as a Senior iOS Engineer who can independently own complex mobile product work from feature planning and API discussion through architecture, implementation, testing, and production delivery.

The strongest themes are:

- End-to-end feature ownership
- Production iOS engineering
- Blockchain wallet implementation
- Real-time WebSocket systems
- Cross-functional product and API collaboration
- Experience as a sole or lead iOS engineer

The AI / Mobile Product variant is the default English application baseline: production iOS and React Native experience first, with evidenced AI projects as differentiation. It does not position the candidate as a senior model-training or AI-infrastructure specialist.

## Factual boundaries

- Use only facts recorded in `source/resume.md`, `source/production-tooling.md`, or subsequently confirmed by the candidate.
- Approximate DAU values must remain clearly approximate.
- Cronos App work is pre-launch; do not describe it as a released production feature.
- The Cronos App phase used React Native and TypeScript throughout, including
  Fabric and TurboModules; approximately six months of hands-on React Native
  experience is confirmed.
- Crypto.com employment ended in July 2026.
- At Crypto.com, confirmed production tooling includes Firebase Crashlytics, Firebase Performance for page or screen rendering and API response latency, Datadog, and Segment for product analytics and A/B testing.
- At OpenNet, confirmed production tooling includes Firebase and Elasticsearch-based logs for production issue investigation.
- Slack alerts, the in-house feature-flag system, and Firebase Remote Config are confirmed cross-role experience but remain unattributed to a named employer until the candidate confirms that mapping.
- The AI-company variant may describe the user-provided AI-assisted engineering workflow at Crypto.com: Jira review and task decomposition, optional architecture notes from ticket and Figma context, AI-assisted implementation, manual QA, AI-assisted commit and PR preparation, multi-model review, manual comment adjudication, code-owner approval, and weekly release CI.
- Moment is an in-development native Swift/SwiftUI iOS product. TypeScript supports schema validation and evaluation tooling; do not describe the current app as React Native/Expo. Keep bounded private-prototype evidence distinct from the current end-to-end target and public release. Describe concrete user behavior rather than listing design principles as standalone core skills.
- Use purpose-based headings for personal tools; keep the Moment product name. The public Context Handoff, Task ETA Tracker, and Moment Monitor tools are distinct from the newer local ticket platform, which must not inherit an unqualified Open Source label.
- The local ticket platform supports CLI/HTTP/MCP content operations, recoverable deletion/restoration, revision and digest guards, idempotency, and audit history in a sandbox. Do not claim completed production authority cutover or production worker control.
- The LINE family translator is a private pilot with verified Chinese-Indonesian private-message E2E and a first family-group translation. Its 100-case development set and separate 40-case holdout do not establish human-validated accuracy; native-speaker acceptance and always-on operation remain pending. Local Mac/model/tunnel dependency must not be presented as a continuously available public service.
- ProductDev is an in-development, local-first macOS workbench built with AI-assisted development and Swift 6. It observes existing repository automation; GitHub Issues and the existing scheduler retain authority. Guarded actions, exact dry-runs, permanent receipts, and recovery views may be described in plain language.
- Separate production expertise, AI-assisted engineering capabilities, and side-project technologies. Do not list unfamiliar architecture terms or side-project technologies as unqualified core skills.
- Objective-C is intentionally omitted from every current resume variant. The AI-company variant uses the fuller, historically verified experience wording; other variants retain their concise experience rendering.
- Crypto.com Onchain is an existing production product.
- San Orange Technology is the employer; KINTO is the client/product context.
- Do not imply direct employment by Toyota or KINTO.
- JSON-RPC was handled through SDK abstractions and should not be listed as a skill.
- Do not list TCP Socket, Account Abstraction, or DeFi in the skills section.
- Variant-specific summaries and skill ordering must use only facts already
  present in the accepted source files.

## Bullet style

Each bullet should communicate one primary idea.

Prefer direct verbs such as:

- Built
- Owned
- Led
- Improved
- Migrated
- Delivered
- Managed
- Implemented

Avoid unsupported or inflated language such as:

- World-class
- Revolutionary
- Best-in-class
- Dramatically improved
- Transformed
- Architected, unless the candidate actually owned the architecture decision

Avoid generic phrases when a concrete description is available:

- Responsible for
- Participated in
- Helped with
- Worked on

## Concrete wording and readable links

- Prefer named features, user actions, technical problems, and verified results over generic claims about reliability or end-to-end delivery.
- Explain what a validation or recovery mechanism does. Keep useful terms such as idempotency and MCP, but do not stack internal design phrases without context.
- Preserve pre-launch, private-pilot, and sandbox limits. Editing for natural language must not turn planned work into completed or production work.
- In every PDF variant and the readable Markdown resume, show the actual LinkedIn, GitHub, and portfolio addresses as text as well as clickable links. Keep shared PDF defaults in `config/commands.tex`; do not rely on annotations alone.
- Review for clarity and factual support, not an AI-detector score. Do not introduce mistakes, remove useful keywords, or hide AI experience to make the prose appear human-written.

## Cross-variant consistency

- Employer names, employment dates, education, approximate scale, technology ownership, and pre-launch status must agree across every version.
- The 10+ years statement describes the mobile career, not 10+ years of React Native or blockchain specialization. Keep the pre-launch Cronos experience distinct from production Onchain work.
- Apply confirmed production diagnostics and analytics experience to the non-AI variants as relevant mobile experience; do not imply that every listed tool serves the same purpose.
- Keep headlines, summary emphasis, skill ordering, AI workflow detail, and project selection audience-specific. Do not copy the entire AI projects section into every version.
- Lead the AI variant's employer section with delivered product work, not with the use of AI tools. Keep shared development methods distinct from individual product phases.
- Treat `source/resume.md` as published copy too: synchronize project names, readable links, and corrections there, while retaining additional factual detail.

## Metrics

Metrics are optional, not mandatory.

Use a number only when it is accurate enough to defend in an interview. Never fabricate performance improvements, revenue impact, user growth, time savings, or percentages.

Current approximate scale references:

- Crypto.com Onchain: approximately 20K DAU
- SportyBet: approximately 100K DAU

## Skills

Only list technologies with meaningful hands-on experience.

Keep product or protocol names such as Morpho in experience unless there is a clear reason to target a role requiring those terms.

## Review checklist

Before publishing, confirm:

- Every statement is factually correct.
- Every bullet can be explained with concrete implementation details.
- Past-tense verbs are used for the completed Crypto.com role and all earlier roles.
- Onchain and Cronos are not incorrectly merged into a single project phase.
- No placeholder employer, metric, link, or education detail remains.
- The PDF text extracts in the expected reading order.
- The layout remains readable at normal zoom.
- A two-page version uses both pages meaningfully and does not orphan Education
  or another short section on page two.
