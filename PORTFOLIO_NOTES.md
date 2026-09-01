# Portfolio content and delivery notes

## Hosting decision

Use the repository's existing GitHub Pages workflow for the first release.

Why:

- the portfolio is a static HTML/CSS/JavaScript site with no server runtime;
- the repository already validates resume PDFs, assembles `site/`, and deploys Pages from `main`;
- deployment stays versioned with the source material and requires no additional account or SDK;
- the implementation keeps the homepage hand-authored while the generated résumé and PDF downloads remain available at `/resume.html`.

Cloudflare Pages remains the preferred next move if a custom domain, branch previews, edge functions, or Web Analytics become release requirements. The current site has no platform lock-in.

## Information boundary

Portfolio claims are limited to resume-backed work and public product surfaces.

### Resume-backed metrics and responsibilities

Source: `source/resume.md`

- 10+ years shipping production iOS products.
- Crypto.com Onchain: approximately 20K DAU; iOS Earn ownership across multiple protocols; staking, rewards, position management, Buy & Swap.
- SportyBet: approximately 100K DAU; live odds, open bets, betting history, WebSocket update deduplication.
- KINTO: vehicle usage tracking, vehicle status, and in-app guidance delivered during a three-month contract.

### Public product links

- Crypto.com Onchain: https://crypto.com/onchain
- SportyBet: https://www.sportybet.com/
- KINTO Unlimited: https://www.kinto-mobility.com/unlimited

Product names are used nominatively. No proprietary screenshots, logos, internal analytics, or non-public product URLs are included.

## AI-native project narrative

The selected-work copy is derived from current project READMEs and deliberately focuses on system boundaries rather than model hype.

- Moment: intent-to-structure, durable preparation, truthful next action, local/user/external evidence boundaries.
- ProductDev ("Auto Product"): local-first observability, guarded automation, explicit authority, immutable receipts, recovery.
- Tim Work:
  - https://github.com/timyeou1234/context-handoff
  - https://github.com/timyeou1234/task-eta-tracker
  - https://github.com/timyeou1234/MomentMonitor

The unifying AI-native position is: models interpret and propose; products own validation, persistence, mutation authority, evidence, and recovery.

## Interaction stack

No runtime dependencies are required.

- semantic HTML and bilingual content attributes;
- CSS Grid, custom properties, gradients, container-friendly responsive layouts, and CSS product mockups;
- Web Animations API for scroll reveals;
- Canvas 2D for the ambient particle network;
- IntersectionObserver for reveal and navigation state;
- pointer-driven tilt, magnetic links, and cursor illumination;
- `prefers-reduced-motion` support, keyboard focus styles, a skip link, and progressive enhancement.

The deliberate dependency-free stack keeps the first paint and deployment path simple. React, GSAP, Three.js, or Rive should only be introduced when a future case study needs stateful components, authored timelines, or 3D assets that the platform APIs cannot express cleanly.
