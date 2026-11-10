# LINE film V12 acceptance

The rejected two-phrase V10 illustration is replaced by a 36-second, five-chapter product workflow: open settings, choose Chinese/Indonesian, confirm the shared setting, translate a two-part household request, translate the reply. Four silent films cover desktop/portrait and Chinese/English explanatory copy. The actual product response language is retained.

The source worker, migrations and phrasebook run offline against signed synthetic events and an isolated database. `media/line-showcase-v12/src/capture.json` pins source commit/file hashes and exact replies; the transport cannot contact LINE or a model. Every frame discloses the recreated interface and test conversation. This is not live/native LINE capture, and does not expand claims about the family trial or unavailable language pairs.

The original avatar is unchanged. Historical V7/V8 and V9/V10 assets/manifests remain intact. Only the eight new film/poster assets join the existing public allowlist. Remotion is build-time only; no React/Remotion runtime, capture transcript, source repository, QA data or dependency enters deployment.

Verified locally:

- All four 36-second H264 films fully decode; zero audio tracks; full-range 8-bit 4:2:0.
- All 30 chapter selections (five × Chinese/English × 320/390/1280 px) reach 3.2/10.2/17.2/23.2/31.2 seconds, paused, with the correct localized desktop/portrait source and no horizontal overflow.
- Browser playback succeeds; the homepage initially has no assigned MP4 source.
- Production-controller tests cover lazy load, direct chapters, replay, native/manual pause, visibility/offscreen pause, reduced motion, save-data, failed autoplay and the no-observer fallback.
- Original three product controllers retain their lifecycle tests. Both static locale pages retain metadata, canonical/hreflang, links, transcript and crawler discovery.
- All 20 existing negative manifest checks plus six new LINE checks pass. The new cases reject missing portrait output, altered media, a false native-recording claim, audio, missing settings chapters, and altered render source.

Evidence: sibling `portfolio-line-v12-qa/` (rendered frames, capture summary, browser-chapters.json, render logs and release verification). Deployment identity and public PageSpeed rechecks are recorded there after publishing. Prior release rollback: `8a2adc9d-c9eb-4aff-8d29-03c9bb7cf0a1`.

Rendering dependency audit: npm reports the unpatched braces stack-exhaustion advisory through the ESLint development chain. It is not shipped to visitors. The rendering input is repository-authored, without external glob input.

## Production host correction

Live verification found Cloudflare's static asset response returned HTTP 200 to Range requests, leaving native seeking at `[0, 0]`. The controller now fetches the selected ~1 MB film only when playback or a chapter is requested (automatic playback counts when visible and motion/data preferences permit), then supplies a local Blob URL to the native player. That provides a verified `[0, 36]` seek range without a Worker routing change. The buffer is reused for the document lifetime; loading/error states, retry, late offscreen completion, and latest-chapter selection are tested. Manual motion/data preferences do not fetch until interaction. The four film bytes are unchanged.
