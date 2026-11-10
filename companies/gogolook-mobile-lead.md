# Gogolook - Mobile Tech Lead (referral; leads a junior Android developer)

Job URL: https://www.gogolook.com/ (company homepage; no public JD for this role)
Record created: 2026-11-10; this date is not proof of a live JD check.
Candidate approved publishing this brief in the public repo (2026-11-10).

## JD snapshot

No written JD. Candidate's summary of the referral (2026-11-10): the team wants a
tech lead who will lead one junior Android developer. Candidate instruction: focus
on existing resume content; do not add new claims.

## Requirement to evidence mapping

| Inferred requirement | Confirmed fact and source | Resume change |
| --- | --- | --- |
| Lead / mentor a junior developer | OpenNet: reviewed pull requests and mentored junior iOS engineers (source/resume.md:96) | Summary leads with it; "Team practices" skills line |
| Work with Android | OpenNet: adapted Android-first requirements into native iOS (:94); Royal: coordinated Product, Backend and Android (:104) | Summary mentions Android-first; Royal stays in Experience |
| Team tooling / quality | OpenNet: internal mock server for UI and automated testing (:96) | Skills "Team practices" |
| Cross-platform | Cronos App React Native/TypeScript, pre-launch (:69) | Skills "Cross-platform" |
| Production scale | SportyBet about 100K DAU (:92); Crypto.com Onchain about 20K DAU (:63) | Summary |

## Gaps and pending candidate confirmation

- No native Android / Kotlin experience in the source record. Not claimed.
- No formal "Tech Lead" title. Lion Travel team leadership is a responsibility, not
  a title (2026-10-13 confirmation); candidate asked not to emphasize Lion Travel
  (too old), so it stays only in the standard experience line.
- Hiring/people-management scope beyond mentoring is not recorded.

## Editorial choices

- English, one page, ai base with full ResumeContent override.
- Tagline "Senior iOS Engineer | Mobile Team Leadership"; avoids a Tech Lead title.
- Summary (two lines to fit one page): mentoring, PR review and Android-first requirements at OpenNet first, then scale (DAU).
- Skills: drops the Blockchain line; adds Cross-platform and Team practices.
- Experience and education reuse sections/experience.tex and education.tex unchanged.

## Verification

Local: `make check-profiles`, `make test`. PDF build, one-page check and rendered-page
review use the CI artifact for the PR head; results are recorded in the PR.
