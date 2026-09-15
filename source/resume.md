# Timothy Yu

**Senior iOS Engineer**  
Taiwan · [+886 929070110](tel:+886929070110) · [timyeou1234@hotmail.com](mailto:timyeou1234@hotmail.com) · [GitHub: github.com/timyeou1234](https://github.com/timyeou1234) · [LinkedIn: linkedin.com/in/timothy-yeou-0134a9117](https://www.linkedin.com/in/timothy-yeou-0134a9117) · [Portfolio: timyeou.com](https://timyeou.com/)

## Summary

Senior iOS engineer with 10+ years in mobile development. Built self-custodial wallet, real-time betting, and connected vehicle features from product and API discussions through production support. Additional React Native experience on the pre-launch Cronos App.

## Technical Skills

**Languages:** Swift, TypeScript\
**Frameworks:** UIKit, SwiftUI, RxSwift, Combine  
**React Native:** TypeScript, Fabric, TurboModules\
**Architecture:** MVVM  
**Concurrency:** Swift Concurrency  
**Networking:** REST APIs, WebSocket  
**Blockchain:** EOA & Smart Contract Wallets, Transaction Signing, Wallet SDK Integration, Staking & Vault Integrations\
**Tools:** Xcode, Git, GitHub Actions

## AI-Assisted Engineering

- At Crypto.com, used AI tooling to review open Jira work, decompose features into subtasks under the relevant Epic, and turn ticket and Figma context into architecture notes when needed.
- Used AI for codebase exploration, implementation support, refactoring, debugging, and edge-case discovery, followed by manual validation of UI/UX, parameters, network behavior, failure states, and edge cases.
- Used AI to prepare commits and pull requests, then reviewed changes personally and with GitHub Copilot and Claude. Evaluated every review comment manually, replied with the decision and reasoning, resolved all discussions, and requested code-owner approval before merge and the weekly CI release.

## Selected Side Projects

### Moment — AI-Powered Planning App (In Development)

- Building a native Swift/SwiftUI iOS application that turns natural-language requests, such as planning a birthday, into editable preparation plans. TypeScript supports schema validation and evaluation tooling.
- Built a private prototype that saves the original request locally and shows AI output for review. Users can still save their input when AI is unavailable.
- Developing schema validation and scenario-based checks for ambiguous requests, user confirmation, retry, and recovery before release. The app owns validation, rendering, persistence, and recovery; the full product remains in development.

### LINE-Based Family Translator — Chinese-Indonesian Translation (Private Pilot)

- Built a family translation bot using LINE, Cloudflare Workers, D1, and a local LLM gateway. Both translation directions were verified in live private messages, and a first family-group translation was confirmed.
- Added webhook signature verification, source allowlisting, persistent message deduplication, and daily request limits.
- Evaluated prompts on 100 development cases and a separate 40-case holdout. The holdout run produced 37 translations and 3 clarification responses with no service failures; this is runtime evidence, not a human-validated translation accuracy score.
- Native-speaker acceptance and always-on operation remain pending. The private pilot depends on a local Mac, its model, and a tunnel.

### Development Task & Handoff Tools (Personal Tooling / Local Sandbox)

- Built a shared CLI, HTTP, and Model Context Protocol (MCP) interface for creating, editing, soft-deleting, restoring, and inspecting local work tickets.
- Added revision and digest checks to reject stale edits, idempotency keys to prevent duplicate writes, and an audit history for recovering earlier ticket content. Content writes require explicit opt-in; ticket editing does not start or control production workers.
- Created companion context-handoff, task-estimation, and read-only run-monitoring tools. The companion tools are public; the sandbox task platform remains personal tooling.
- The in-development Swift 6/macOS workbench observes existing repository automation and provides health and recovery views. Run monitoring and sandbox ticket editing remain separate responsibilities.

## Professional Experience

### Crypto.com

**Senior iOS Developer**  
Sep 2024 – Jul 2026

#### Crypto.com Onchain

- Owned iOS development for the Earn module, including feature delivery, maintenance, and refactoring across multiple blockchain protocols.
- Delivered Buy & Swap by extending the existing fiat purchase journey with a user-initiated on-chain swap after the purchased asset reached the wallet.
- Built and maintained staking flows across major EVM-compatible protocols, covering staking, unstaking, reward claiming, and position management.
- Worked with Product Managers and Backend Engineers throughout feature planning, API discussions, implementation, and production delivery for a self-custodial wallet serving approximately 20K daily active users.

- Investigated crashes, screen rendering delays, and API latency with Firebase Crashlytics, Firebase Performance, and Datadog; used Segment for analytics and A/B testing.

#### Cronos App (Pre-launch)

- Worked exclusively in React Native and TypeScript during the Cronos App phase, building the Earn tab with Fabric and TurboModules in the New Architecture.
- Implemented smart contract wallet features, including transaction signing and UserOperation construction.
- Built Morpho vault flows for deposits, withdrawals, and position tracking.
- Worked with Backend Engineers on API discussions and multi-step blockchain transaction flows, and validated vault features on Cronos Testnet with mocked Morpho vaults.

### San Orange Technology

**Senior iOS Developer (Contract)**  
Jun 2024 – Aug 2024

**Client:** KINTO

- Delivered production iOS features for KINTO's connected vehicle application during a three-month contract.
- Implemented vehicle usage tracking, vehicle status, and in-app guidance features while collaborating with Product, Design, and Backend teams on a short delivery cycle.

### OpenNet

**Senior iOS Developer**  
Oct 2020 – Apr 2024

**Product:** SportyBet

- Built real-time betting features for SportyBet, a sports betting platform serving approximately 100K daily active users.
- Implemented WebSocket synchronization for live odds, open bets, and betting history, and improved subscription management to prevent duplicated updates across multiple betting slips.
- Investigated production issues using Firebase and Elasticsearch logs.
- Adapted Android-first product requirements into native iOS flows instead of directly copying the Android implementation.
- Migrated legacy modules to RxSwift and MVVM to improve maintainability and support ongoing feature development.
- Built an internal mock server for UI development and automated testing, reviewed pull requests, and mentored junior iOS engineers.

### Royal Technology

**Project Manager / iOS Developer**  
Apr 2019 – Aug 2020

- Served as the primary iOS developer while managing client projects from planning through App Store release.
- Delivered production iOS applications and coordinated Product, Backend, and Android development across project teams.

### Awesome Limited

**iOS Developer**  
Apr 2018 – Jan 2019

- Developed video streaming applications for the China market, including encrypted HLS (m3u8) playlist playback.

### Lion Travel Information

**iOS Developer**  
Aug 2017 – Apr 2018

- Led a three-engineer iOS team responsible for enterprise applications, internal distribution, and release coordination.

### WeWork Technology

**iOS Developer**  
Jan 2017 – Jul 2017

- Independently delivered iOS applications involving barcode and QR-code scanning, vehicle rental services, Bluetooth accessories, and media playback.

### IdeaBus Technology

**iOS Developer**  
Aug 2016 – Jan 2017

- Independently built logistics tracking and packaging-monitoring applications using Swift and SOAP APIs.

## Education

### National Taipei University

**Bachelor of Business Administration**
