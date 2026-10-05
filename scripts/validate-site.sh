#!/usr/bin/env bash
set -euo pipefail

repo_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

node --check "$repo_dir/site/app.js"
bash "$repo_dir/scripts/build-portfolio.sh"

RESUME_REPO_DIR="$repo_dir" node <<'NODE'
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const repo = process.env.RESUME_REPO_DIR;
const site = path.join(repo, "site");
const portfolio = path.join(repo, ".portfolio-dist");
const html = fs.readFileSync(path.join(site, "index.html"), "utf8");
const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]);
const uniqueIds = new Set(ids);
const errors = [];

if (ids.length !== uniqueIds.size) errors.push("Duplicate HTML ids found");

for (const match of html.matchAll(/href="#([^"]+)"/g)) {
  if (!uniqueIds.has(match[1])) errors.push(`Missing anchor target: #${match[1]}`);
}

const generatedPaths = new Set(["resume.html"]);
const localReferences = [];
for (const match of html.matchAll(/\s(?:href|src|poster|data-(?:src|poster|href|image)-(?:en|zh))="([^"]+)"/g)) {
  const value = match[1];
  if (/^(?:https?:|mailto:|tel:|#)/.test(value)) continue;
  const relative = decodeURIComponent(value.split(/[?#]/)[0].replace(/^\.\//, ""));
  if (!relative || generatedPaths.has(relative)) continue;
  localReferences.push(relative);
  if (!fs.existsSync(path.join(site, relative))) errors.push(`Missing source target: ${value}`);
  if (!fs.existsSync(path.join(portfolio, relative))) errors.push(`Missing deployment target: ${value}`);
}

const requiredText = [
  "App Development &amp; Software Consulting | Timothy Yu",
  "軟體開發與技術顧問",
  "Scope &amp; technical assessment",
  "App development &amp; improvements",
  "LINE bots &amp; workflow integration",
  "Independent app · Preparing for launch",
  "自有 App · 準備推出",
  "Family LINE Translator",
  "Development task monitoring",
  "開發任務監控",
  "Project tasks &amp; handover",
  "跨專案任務與交接管理",
  "個人自用工具",
  "Family trial",
  "依約定條件驗收"
];
for (const text of requiredText) {
  if (!html.includes(text)) errors.push(`Missing current portfolio text: ${text}`);
}

const retiredText = ["AI-Native Product Engineer", "Senior product engineer", "Objective-C", "Wealth OS"];
for (const text of retiredText) {
  if (html.includes(text)) errors.push(`Retired portfolio text remains: ${text}`);
}

// Keep media keys stable. Moment is a branded launch-bound app, not a self-use tool.
const displayCopy = [
  ...[...html.matchAll(/>([^<>]+)</g)].map((match) => match[1]),
  ...[...html.matchAll(/\s(?:data-(?:en|zh|aria-en|aria-zh|project-title(?:-en|-zh)?)|aria-label)="([^"]*)"/g)].map((match) => match[1])
].join("\n");
for (const text of ["Moment OS", "ProductDev", "Tim Work", "Context Handoff", "Task ETA Tracker", "Moment Monitor",
  "intelligence is infrastructure", "AI is not a feature", "AI proposes.", "AI, STRUCTURALLY", "AI ASSISTED",
  "Product clarity before model cleverness", "A bilingual LINE bot concept"]) {
  if (displayCopy.includes(text)) errors.push(`Retired marketing copy remains: ${text}`);
}
const momentArticle = html.match(/<article[^>]*data-case="moment"[^>]*>([\s\S]*?)<\/article>/);
if (!momentArticle || !/<h3\b[^>]*>Moment<\/h3>/.test(momentArticle[1])) {
  errors.push("Moment must retain its app brand as the project heading");
}
if (!momentArticle?.[1].includes('data-en="Independent app · Preparing for launch"') ||
    !momentArticle?.[1].includes('data-zh="自有 App · 準備推出"')) errors.push("Moment article must retain its localized launch status");
if (momentArticle && /Personal tool|個人自用工具|not a public service|非公開服務|not for sale|非對外販售/i.test(momentArticle[1])) {
  errors.push("Moment must not be classified as a personal-only tool or a non-public-service project");
}
for (const text of ["not client commissions or products for sale", "不是客戶委託案，也不是對外販售的產品"]) {
  if (displayCopy.includes(text)) errors.push("Do not apply a personal-only or not-for-sale disclaimer to every project");
}
for (const project of ["productdev", "timwork"]) {
  const article = html.match(new RegExp(`<article[^>]*data-case="${project}"[^>]*>([\\s\\S]*?)<\\/article>`));
  if (!article || !article[1].includes("Personal tool") || !article[1].includes("個人自用工具")) {
    errors.push(`Personal-use status is missing for ${project}`);
  }
}
if ((html.match(/class="service-card"/g) || []).length !== 3) errors.push("Expected three concrete consulting services");
if (html.includes('class="hero-system"') || html.includes('class="native-contract section"')) {
  errors.push("Retired AI diagram or manifesto is still present");
}
if (!/class="hero-actions"[^>]*>\s*<a[^>]*href="#contact"/.test(html)) errors.push("The primary CTA must lead to project contact");

if (!html.includes('class="site-nav"')) errors.push("Primary navigation is missing the site-nav hook");
if (!html.includes('<link rel="canonical" href="https://timyeou.com/">')) errors.push("Canonical domain metadata is missing");
if (!html.includes('<meta property="og:url" content="https://timyeou.com/">')) errors.push("Open Graph domain metadata is missing");
if (!html.includes('href="https://timyeou1234.github.io/resume/resume.html"')) errors.push("GitHub Pages resume link is missing");
if (html.includes("figma.com/")) errors.push("Portfolio must not contain Figma links");
const mediaManifestPath = path.join(repo, "media", "portfolio-media-v8", "media-manifest.json");
if (!fs.existsSync(mediaManifestPath)) errors.push("Side-project media manifest is missing");
const mediaManifest = JSON.parse(fs.readFileSync(mediaManifestPath, "utf8"));
const versions = { moment: "v5", "line-family-translator": "v7", productdev: "v7", timwork: "v7" };
const names = {
  moment: { en: "Moment", zh: "Moment" },
  "line-family-translator": { en: "Family LINE Translator", zh: "家庭 LINE 翻譯 Bot" },
  productdev: { en: "Development task monitoring", zh: "開發任務監控" },
  timwork: { en: "Project tasks & handover", zh: "跨專案任務與交接管理" }
};
const sameKeys = (object, keys) => JSON.stringify(Object.keys(object || {}).sort()) === JSON.stringify(keys.slice().sort());
if (mediaManifest.version !== "v8" || !sameKeys(mediaManifest.products, Object.keys(versions)) ||
    JSON.stringify(mediaManifest.languages) !== JSON.stringify(["zh", "en"])) {
  errors.push("Expected the V8 collection with exactly four selected products and two languages");
}
for (const field of ["display_titles", "displayNames"]) {
  if (!sameKeys(mediaManifest[field], Object.keys(names))) errors.push(`Invalid name metadata keys: ${field}`);
  for (const [product, localized] of Object.entries(names)) {
    if (!sameKeys(mediaManifest[field]?.[product], ["en", "zh"])) errors.push(`Invalid localized names: ${field}/${product}`);
    for (const language of ["en", "zh"]) {
      if (mediaManifest[field]?.[product]?.[language] !== localized[language]) {
        errors.push(`Conflicting or incorrect name metadata: ${field}/${product}/${language}`);
      }
    }
  }
}
const momentPosition = mediaManifest.positioning?.moment;
if (momentPosition?.type !== "launch-bound-app" || momentPosition?.brandPreserved !== true ||
    momentPosition?.status?.en !== "Independent app · Preparing for launch" ||
    momentPosition?.status?.zh !== "自有 App · 準備推出") errors.push("Moment metadata must preserve the branded app preparing for launch");
for (const product of ["productdev", "timwork"]) {
  if (mediaManifest.positioning?.[product]?.type !== "personal-development-tool") errors.push(`Invalid personal-tool classification: ${product}`);
}
// V8 remains an immutable historical package; it is not shipped or referenced.
const archivedMediaAssets = [];
for (const [product, languages] of Object.entries(mediaManifest.products)) {
  if (!sameKeys(languages, ["en", "zh"])) errors.push(`Expected exactly two media languages: ${product}`);
  for (const [language, media] of Object.entries(languages)) {
    if (!sameKeys(media, ["film", "loop", "poster"])) errors.push(`Expected film, loop and poster: ${product}/${language}`);
    for (const [kind, expected] of Object.entries(media)) {
      const asset = expected.path;
      archivedMediaAssets.push(asset);
      if (!asset.startsWith(`assets/products/${product}/`)) {
        errors.push(`Unexpected media path for ${product}/${language}/${kind}: ${asset}`);
      }
      const exactPath = `assets/products/${product}/${kind}-${language}-${versions[product]}${kind === "film" ? "-silent" : ""}.${kind === "poster" ? "jpg" : "mp4"}`;
      if (asset !== exactPath) {
        errors.push(`Unexpected media version for ${product}/${language}/${kind}: ${asset}`);
      }
      if (!Number.isInteger(expected.bytes) || expected.bytes <= 0 || !/^[a-f0-9]{64}$/.test(expected.sha256 || "")) {
        errors.push(`Missing required bytes or SHA-256: ${asset}`);
      }
      if (kind !== "poster" && expected.audioTracks !== 0) errors.push(`Selected videos must be silent: ${asset}`);
      if (kind === "film") {
        const source = expected.source;
        const sourcePath = `assets/products/${product}/film-${language}-${versions[product]}.mp4`;
        if (source?.path !== sourcePath || source?.audioTracks !== 1 ||
            !Number.isInteger(source?.bytes) || !/^[a-f0-9]{64}$/.test(source?.sha256 || "")) {
          errors.push(`Missing original film provenance: ${asset}`);
        } else {
          const original = path.join(site, sourcePath);
          if (!fs.existsSync(original) || fs.statSync(original).size !== source.bytes ||
              crypto.createHash("sha256").update(fs.readFileSync(original)).digest("hex") !== source.sha256) {
            errors.push(`Original film differs from recorded source: ${sourcePath}`);
          }
        }
      }
      for (const root of [site]) {
        const target = path.join(root, asset);
        if (!fs.existsSync(target) || fs.statSync(target).size === 0) {
          errors.push(`Missing or empty side-project asset: ${path.relative(repo, target)}`);
          continue;
        }
        if (fs.statSync(target).size !== expected.bytes) {
          errors.push(`Media byte count differs from manifest: ${path.relative(repo, target)}`);
        }
        if (expected.sha256) {
          const digest = crypto.createHash("sha256").update(fs.readFileSync(target)).digest("hex");
          if (digest !== expected.sha256) errors.push(`Media hash differs from manifest: ${path.relative(repo, target)}`);
        }
      }
    }
  }
}
if (archivedMediaAssets.filter((asset) => asset.endsWith(".mp4")).length !== 16 ||
    archivedMediaAssets.filter((asset) => asset.endsWith(".jpg")).length !== 8) {
  errors.push("Side-project media manifest must contain 16 MP4 files and 8 posters");
}
if (new Set(archivedMediaAssets).size !== archivedMediaAssets.length) errors.push("Duplicate paths found in side-project media manifest");
if (mediaManifest.company_apps_included !== false) errors.push("Company products must remain outside the side-project media package");
for (const retiredAsset of ["moments-demo.png", "productdev-figma.svg", "timwork-figma.svg", "assets/moment/"]) {
  if (html.includes(retiredAsset)) errors.push(`Retired static or V4 project media remains referenced: ${retiredAsset}`);
}
// The current page uses only original captures and product artwork.
const current = JSON.parse(fs.readFileSync(path.join(repo, "media/portfolio-real-v9/media-manifest.json"), "utf8"));
const expectedPaths = [
  "assets/products/moment/moments-runtime-zh-v9.png",
  "assets/products/moment/actions-runtime-zh-v9.png",
  "assets/products/line-family-translator/avatar-v9.png",
  "assets/products/productdev/app-icon-v9.png",
  "assets/products/timwork/portfolio-zh-v9.jpg",
  "assets/products/timwork/portfolio-en-v9.jpg"
];
const mediaAssets = current.assets.map(asset => asset.path);
if (current.version !== "v9" || JSON.stringify(current.products) !== JSON.stringify(Object.keys(versions)) ||
    JSON.stringify(mediaAssets.slice().sort()) !== JSON.stringify(expectedPaths.slice().sort())) {
  errors.push("Expected exactly the six sourced V9 product assets");
}
for (const asset of current.assets) {
  if (!expectedPaths.includes(asset.path)) continue;
  const expectedKind = ["moment", "timwork"].includes(asset.product) ? "runtime-screenshot" : "product-artwork";
  if (asset.kind !== expectedKind || asset.transformation !== "none" || !asset.source?.repository ||
      !(asset.source.path || asset.source.route) || asset.source.sha256 !== asset.sha256 ||
      (expectedKind === "runtime-screenshot" && (!asset.source.capturedAt || !asset.source.data))) {
    errors.push(`Missing original asset provenance: ${asset.path}`);
  }
  if (!Number.isInteger(asset.width) || !Number.isInteger(asset.height) || asset.width <= 0 || asset.height <= 0 ||
      !Number.isInteger(asset.bytes) || asset.bytes <= 0 || !/^[a-f0-9]{64}$/.test(asset.sha256 || "")) {
    errors.push(`Missing current asset dimensions, bytes or SHA-256: ${asset.path}`);
  }
  for (const root of [site, portfolio]) {
    const target = path.join(root, asset.path);
    if (!fs.existsSync(target)) { errors.push(`Missing current asset: ${asset.path}`); continue; }
    const raw = fs.readFileSync(target);
    if (raw.length !== asset.bytes || crypto.createHash("sha256").update(raw).digest("hex") !== asset.sha256) {
      errors.push(`Current asset differs from recorded original: ${asset.path}`);
    }
  }
  if (!localReferences.includes(asset.path)) errors.push(`Unreferenced current asset: ${asset.path}`);
}
const motion = JSON.parse(fs.readFileSync(path.join(repo, "media/portfolio-motion-v10/media-manifest.json"), "utf8"));
const motionPaths = [
  "assets/products/moment/saved-runtime-zh-v10.png",
  "assets/products/productdev/monitor-native-v10.jpg",
  "assets/products/productdev/runs-native-v10.jpg",
  "assets/products/productdev/run-detail-native-v10.jpg",
  ...["knowledge", "decisions"].flatMap(route => ["en", "zh"].map(lang => `assets/products/timwork/${route}-${lang}-v10.jpg`))
];
if (motion.version !== "v10" || JSON.stringify(motion.assets.map(asset => asset.path).sort()) !== JSON.stringify(motionPaths.sort())) {
  errors.push("Expected exactly eight sourced V10 captures");
}
if (motion.lineExamples?.classification !== "authored synthetic examples; ai_draft phrasebook, not private conversations or native-speaker certification" ||
    JSON.stringify(motion.lineExamples?.pairs) !== JSON.stringify([["早安", "Selamat pagi"], ["謝謝", "Terima kasih"]])) {
  errors.push("LINE flow must retain its authored-example evidence boundary");
}
for (const asset of motion.assets) {
  if (!motionPaths.includes(asset.path)) continue;
  mediaAssets.push(asset.path);
  if (asset.kind !== "runtime-screenshot" || asset.transformation !== "none" ||
      !asset.source?.repository || !(asset.source.path || asset.source.route) || !asset.source.data ||
      !asset.source.capturedAt || asset.source.sha256 !== asset.sha256 ||
      !Number.isInteger(asset.width) || !Number.isInteger(asset.height) || !asset.bytes ||
      (asset.product === "productdev" && (!asset.source.harness || !asset.source.appBinarySha256))) {
    errors.push(`Missing V10 original capture provenance: ${asset.path}`);
  }
  for (const root of [site, portfolio]) {
    const target = path.join(root, asset.path);
    if (!fs.existsSync(target)) { errors.push(`Missing V10 capture: ${asset.path}`); continue; }
    const raw = fs.readFileSync(target);
    if (raw.length !== asset.bytes || crypto.createHash("sha256").update(raw).digest("hex") !== asset.sha256) {
      errors.push(`V10 capture differs from recorded original: ${asset.path}`);
    }
  }
  if (!localReferences.includes(asset.path)) errors.push(`Unreferenced V10 capture: ${asset.path}`);
}
for (const project of Object.keys(versions)) {
  const article = html.match(new RegExp(`<article[^>]*data-case="${project}"[^>]*>([\\s\\S]*?)<\\/article>`));
  if (!article || !article[1].includes('class="case-role"') || !article[1].includes('alt="')) {
    errors.push(`Missing product, contribution or image description: ${project}`);
  }
  const count = project === "line-family-translator" ? 2 : 3;
  if (!article || !article[1].includes(`data-product-showcase="${project}"`) ||
      (article[1].match(/data-scene="/g) || []).length !== count ||
      (article[1].match(/data-showcase-step="/g) || []).length !== count ||
      !article[1].includes("data-showcase-toggle") || motion.scenes[project] !== count) {
    errors.push(`Missing animated walkthrough or playback controls: ${project}`);
  }
}
if (/<video\b|data-project-video=|project-film-dialog|(?:film|loop|poster)-(?:en|zh)-v[457]/.test(html)) {
  errors.push("Retired promotional media or inactive player controls remain on the page");
}
for (const caption of ["Chinese UI with test data", "iOS 模擬器原始截圖", "Isolated test data", "隔離測試資料", "Product avatar", "macOS App 圖示", "not a LINE chat recording", "非 LINE 聊天錄影"]) {
  if (!html.includes(caption)) errors.push(`Missing source context: ${caption}`);
}
const imgs = [...html.matchAll(/<img\b[^>]*>/g)].map(match => match[0]);
for (const img of imgs) {
  if (!/\balt="[^"]+"/.test(img) || !/\bwidth="\d+"/.test(img) || !/\bheight="\d+"/.test(img)) {
    errors.push(`Image needs descriptive alt text and reserved dimensions: ${img}`);
  }
}
if (!html.includes("Production apps I helped build.")) errors.push("Company-product ownership wording is missing");

const portfolioFiles = fs.readdirSync(portfolio, { recursive: true, withFileTypes: true })
  .filter((entry) => entry.isFile())
  .map((entry) => path.relative(portfolio, path.join(entry.parentPath || entry.path, entry.name)))
  .sort();
if (portfolioFiles.some((file) => file.endsWith(".pdf") || file.endsWith("resume.md") || file.endsWith("resume.html"))) {
  errors.push("Cloudflare portfolio bundle must not contain resume documents");
}
const headers = fs.readFileSync(path.join(site, "_headers"), "utf8");
if (!headers.includes("/assets/products/*") ||
    !headers.includes("Cache-Control: public, max-age=31556952, immutable")) {
  errors.push("Versioned product media must use an explicit immutable cache policy");
}
if (fs.readFileSync(path.join(portfolio, "_headers"), "utf8") !== headers) {
  errors.push("Cloudflare portfolio bundle has a different _headers policy");
}
const allowedPortfolioFiles = ["_headers", "app.js", "consulting.css", "index.html", "en/index.html", "robots.txt", "sitemap.xml", "styles.css", ...mediaAssets].sort();
if (JSON.stringify(portfolioFiles) !== JSON.stringify(allowedPortfolioFiles)) {
  errors.push(`Cloudflare portfolio bundle differs from the explicit allowlist: ${portfolioFiles.join(", ")}`);
}
if (portfolioFiles.some((file) => /(?:source-notes|qa\/|viewer|\.zip$)/i.test(file))) {
  errors.push("Cloudflare portfolio bundle contains source notes, QA, a viewer, or a ZIP archive");
}
if (fs.readFileSync(path.join(site, "consulting.css"), "utf8") !== fs.readFileSync(path.join(portfolio, "consulting.css"), "utf8")) {
  errors.push("Purpose-first layout stylesheet differs in deployment output");
}

const app = fs.readFileSync(path.join(site, "app.js"), "utf8");
for (const behavior of ["IntersectionObserver", "data-image-en", "data-alt-en", "updateLanguageLinks"]) {
  if (!app.includes(behavior)) errors.push(`Current page behavior is missing: ${behavior}`);
}

const englishSource = path.join(repo, "media", "moment", "en-v4");
for (const source of ["README.md", "localization.json", "source-manifest.json", "storyboard.json", "stage.html", "make_ui_assets.py", "render.py", "render_all.py"]) {
  if (!fs.existsSync(path.join(englishSource, source))) errors.push(`Missing reproducible English source: ${source}`);
}
if (/[\u3400-\u9fff]/.test(fs.readFileSync(path.join(englishSource, "stage.html"), "utf8"))) {
  errors.push("English film stage still contains CJK copy");
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log(`Validated portfolio: ${ids.length} ids and all local targets resolved.`);
NODE

python3 "$repo_dir/scripts/test-portfolio-locales.py"
