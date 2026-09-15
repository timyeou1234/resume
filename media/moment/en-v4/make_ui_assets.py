#!/usr/bin/env python3
"""Generate English Moment UI PNGs from the Figma-derived local structure."""
from __future__ import annotations

import base64
from pathlib import Path

from playwright.sync_api import sync_playwright

BASE = Path(__file__).resolve().parent
ASSETS = BASE / "assets"


def document() -> str:
    icon = base64.b64encode((ASSETS / "travel-icon.svg").read_bytes()).decode("ascii")
    return f"""<!doctype html><html lang="en"><head><meta charset="utf-8"><style>
*{{box-sizing:border-box}}html,body{{margin:0;background:transparent;font-family:-apple-system,BlinkMacSystemFont,"Helvetica Neue","Segoe UI",sans-serif;color:#20201e}}
body{{width:430px;min-height:1200px;padding:0}}p,h1{{margin:0}}.overview{{width:390px;height:496px;overflow:hidden;background:#f6f4ef}}
.nav{{height:88px;position:relative;background:#f6f4ef}}.nav h1{{position:absolute;top:14px;left:55px;width:280px;text-align:center;font-size:28px;line-height:34px;font-weight:700}}
.subtitle{{position:absolute;top:52px;left:55px;width:280px;text-align:center;color:#6d6b66;font-size:13px;line-height:18px}}.more{{position:absolute;top:20px;right:20px;font-size:17px;font-weight:600;letter-spacing:2px}}
.body{{height:408px;padding:12px 20px;background:#f6f4ef}}.search{{width:350px;height:44px;display:flex;align-items:center;gap:10px;padding:0 12px;border:1px solid #d7d2c8;border-radius:12px;color:#a8a59e;font-size:17px}}
.search b{{width:20px;text-align:center;font-weight:600}}.filter{{display:grid;grid-template-columns:repeat(5,1fr);width:350px;height:44px;margin-top:10px;border-radius:12px;background:#ece9e1;color:#6d6b66;font-size:12px;font-weight:600}}
.filter span{{display:grid;place-items:center;min-width:0}}.filter .selected{{border-radius:12px;background:#e8ebf5;color:#3e4b78}}.heading{{display:flex;align-items:center;width:350px;height:22px;margin-top:10px;font-size:17px;font-weight:600}}
.heading span:last-child{{margin-left:auto;width:30px;text-align:right;color:#6d6b66;font-size:13px;font-weight:400}}.card{{width:350px;height:248px;display:flex;flex-direction:column;gap:8px;padding:16px;margin-top:10px;border:1px solid #3e4b78;border-radius:16px;background:#fff}}
.card-header{{height:40px;display:flex;align-items:center;gap:10px;min-width:0}}.icon-tile{{width:40px;height:40px;flex:0 0 40px;display:grid;place-items:center;border-radius:10px;background:#fbfaf7}}.icon-tile img{{display:block;width:28px;height:28px}}
.identity{{flex:1;min-width:0}}.identity .title{{overflow:hidden;font-size:16px;line-height:21px;font-weight:600;white-space:nowrap}}.identity .meta{{overflow:hidden;color:#6d6b66;font-size:12px;line-height:17px;white-space:nowrap}}
.state{{flex:0 0 auto;color:#3e4b78;font-size:12px;line-height:16px;font-weight:600;white-space:nowrap}}.prep{{height:40px}}.caption{{color:#6d6b66;font-size:11px;line-height:14px;font-weight:500}}
.summary-row{{height:22px;display:grid;grid-template-columns:1.12fr 1fr .8fr;align-items:center;gap:6px;margin-top:4px;color:#6d6b66;font-size:10px;line-height:11px;font-weight:500}}.summary-row span{{display:flex;align-items:center;gap:4px;min-width:0}}
.dot{{width:7px;height:7px;flex:0 0 7px;border-radius:50%;background:#2e9873}}.dot.pending{{background:#a86725}}.confirmed{{height:34px}}.confirmed .fact{{overflow:hidden;font-size:12px;line-height:17px;font-weight:600;white-space:nowrap}}
.action{{width:318px;height:60px;display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:12px;background:#e8ebf5}}.action-copy{{flex:1;min-width:0}}.action .label{{color:#3e4b78;font-size:11px;line-height:14px;font-weight:600}}.action .next{{overflow:hidden;font-size:14px;line-height:19px;font-weight:600;white-space:nowrap}}.chevron{{color:#3e4b78;font-size:22px;font-weight:600}}
.asset{{margin-top:20px}}#travel-asset{{width:350px;height:248px}}#travel-asset .card{{margin:0}}#preparation-asset{{width:318px;height:42px;padding:3px 0;background:#fff}}#confirmed-asset{{width:318px;height:46px;padding:3px 0;background:#fff}}#next-step-asset{{width:318px;height:66px;background:#e8ebf5}}#next-step-asset .action{{height:66px}}
</style></head><body>
<section id="overview" class="overview"><header class="nav"><h1>Moments</h1><p class="subtitle">Your life events</p><p class="more">•••</p></header><div class="body"><div class="search"><b>⌕</b><span>Search Moments</span></div><div class="filter"><span class="selected">All</span><span>Now</span><span>Waiting</span><span>Done</span><span>Paused</span></div><div class="heading"><span>Now</span><span>2</span></div>
<article class="card"><div class="card-header"><span class="icon-tile"><img src="data:image/svg+xml;base64,{icon}" alt=""></span><div class="identity"><p class="title" data-fit>Family trip to Okinawa</p><p class="meta" data-fit>Oct 1–4 · Family trip</p></div><p class="state">• Now</p></div><div class="prep"><p class="caption">Preparation</p><div class="summary-row"><span><i class="dot pending"></i>1 item to plan</span><span><i class="dot"></i>Transport ready</span><span><i class="dot"></i>Stay ready</span></div></div><div class="confirmed"><p class="caption">Confirmed</p><p class="fact" data-fit>Flight, pickup and check-in details saved.</p></div><div class="action"><div class="action-copy"><p class="label">Next step</p><p class="next" data-fit>Plan what comes after arrival.</p></div><span class="chevron">›</span></div></article></div></section>
<section id="travel-asset" class="asset"><article class="card"><div class="card-header"><span class="icon-tile"><img src="data:image/svg+xml;base64,{icon}" alt=""></span><div class="identity"><p class="title" data-fit>Family trip to Okinawa</p><p class="meta" data-fit>Oct 1–4 · Family trip</p></div><p class="state">• Now</p></div><div class="prep"><p class="caption">Preparation</p><div class="summary-row"><span><i class="dot pending"></i>1 item to plan</span><span><i class="dot"></i>Transport ready</span><span><i class="dot"></i>Stay ready</span></div></div><div class="confirmed"><p class="caption">Confirmed</p><p class="fact" data-fit>Flight, pickup and check-in details saved.</p></div><div class="action"><div class="action-copy"><p class="label">Next step</p><p class="next" data-fit>Plan what comes after arrival.</p></div><span class="chevron">›</span></div></article></section>
<section id="preparation-asset" class="asset"><p class="caption">Preparation</p><div class="summary-row"><span><i class="dot pending"></i>1 item to plan</span><span><i class="dot"></i>Transport ready</span><span><i class="dot"></i>Stay ready</span></div></section>
<section id="confirmed-asset" class="asset"><p class="caption">Confirmed</p><p class="fact" data-fit>Flight, pickup and check-in details saved.</p></section>
<section id="next-step-asset" class="asset"><div class="action"><div class="action-copy"><p class="label">Next step</p><p class="next" data-fit>Plan what comes after arrival.</p></div><span class="chevron">›</span></div></section>
</body></html>"""


def main() -> None:
    ASSETS.mkdir(parents=True, exist_ok=True)
    with sync_playwright() as playwright:
        chrome = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
        browser = playwright.chromium.launch(executable_path=chrome, headless=True)
        context = browser.new_context(viewport={"width": 430, "height": 1300}, device_scale_factor=1)
        page = context.new_page()
        page.set_content(document(), wait_until="load")
        page.wait_for_function("document.fonts.status === 'loaded'")
        overflow = page.locator("[data-fit]").evaluate_all(
            "nodes => nodes.filter(n => n.scrollWidth > n.clientWidth + 1 || n.scrollHeight > n.clientHeight + 1).map(n => n.textContent)"
        )
        if overflow:
            raise RuntimeError(f"English UI text overflow: {overflow}")
        for selector, name in [
            ("#overview", "overview-detail.png"),
            ("#travel-asset", "travel-card.png"),
            ("#preparation-asset", "preparation.png"),
            ("#confirmed-asset", "confirmed.png"),
        ]:
            page.locator(selector).screenshot(path=str(ASSETS / name), animations="disabled")
        context.close()

        context3 = browser.new_context(viewport={"width": 430, "height": 200}, device_scale_factor=3)
        page3 = context3.new_page()
        page3.set_content(document(), wait_until="load")
        page3.locator("#next-step-asset").screenshot(path=str(ASSETS / "next-step.png"), animations="disabled")
        context3.close()
        browser.close()
    print("ENGLISH_UI_ASSETS_OK")


if __name__ == "__main__":
    main()
