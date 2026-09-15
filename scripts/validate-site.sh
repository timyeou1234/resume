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
for (const match of html.matchAll(/\s(?:href|src|poster|data-(?:src|poster|href)-(?:en|zh))="([^"]+)"/g)) {
  const value = match[1];
  if (/^(?:https?:|mailto:|tel:|#)/.test(value)) continue;
  const relative = decodeURIComponent(value.split(/[?#]/)[0].replace(/^\.\//, ""));
  if (!relative || generatedPaths.has(relative)) continue;
  localReferences.push(relative);
  if (!fs.existsSync(path.join(site, relative))) errors.push(`Missing source target: ${value}`);
  if (!fs.existsSync(path.join(portfolio, relative))) errors.push(`Missing deployment target: ${value}`);
}

const requiredText = [
  "Timothy Yu — Software Consulting &amp; Development",
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
  "not client commissions",
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
for (const language of ["en", "zh"]) {
  if (!momentArticle || !momentArticle[1].includes(`data-project-title-${language}="Moment"`)) {
    errors.push(`Moment must retain its brand in the ${language} player title`);
  }
}
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
  for (const language of ["en", "zh"]) {
    if (!article || !article[1].includes(`data-project-title-${language}=`)) {
      errors.push(`Localized purpose-based player title is missing for ${project}/${language}`);
    }
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
const mediaManifestPath = path.join(repo, "media", "side-projects-a-v6", "media-manifest.json");
if (!fs.existsSync(mediaManifestPath)) errors.push("Side-project media manifest is missing");
const mediaManifest = JSON.parse(fs.readFileSync(mediaManifestPath, "utf8"));
const mediaAssets = [];
for (const [product, languages] of Object.entries(mediaManifest.products)) {
  for (const [language, media] of Object.entries(languages)) {
    for (const [kind, expected] of Object.entries(media)) {
      const asset = expected.path;
      mediaAssets.push(asset);
      if (!asset.startsWith(`assets/products/${product}/`)) {
        errors.push(`Unexpected media path for ${product}/${language}/${kind}: ${asset}`);
      }
      if (product === "line-family-translator" ? !asset.includes("-v6.") : !asset.includes("-v5.")) {
        errors.push(`Unexpected media version for ${product}/${language}/${kind}: ${asset}`);
      }
      for (const root of [site, portfolio]) {
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
      if (!localReferences.includes(asset)) errors.push(`Side-project asset is not referenced by the page: ${asset}`);
    }
  }
}
if (mediaAssets.filter((asset) => asset.endsWith(".mp4")).length !== 16 ||
    mediaAssets.filter((asset) => asset.endsWith(".jpg")).length !== 8) {
  errors.push("Side-project media manifest must contain 16 MP4 files and 8 posters");
}
if (new Set(mediaAssets).size !== mediaAssets.length) errors.push("Duplicate paths found in side-project media manifest");
if (mediaManifest.company_apps_included !== false) errors.push("Company products must remain outside the side-project media package");
for (const retiredAsset of ["moments-demo.png", "productdev-figma.svg", "timwork-figma.svg", "assets/moment/"]) {
  if (html.includes(retiredAsset)) errors.push(`Retired static or V4 project media remains referenced: ${retiredAsset}`);
}
const projectHooks = ["moment", "line-family-translator", "productdev", "timwork"];
for (const project of projectHooks) {
  if (!html.includes(`data-project-video="${project}"`) || !html.includes(`id="${project}-loop"`) || !html.includes(`id="${project}-film-open"`)) {
    errors.push(`Video player hooks are missing for ${project}`);
  }
}
const loopTags = [...html.matchAll(/<video\b[^>]*class="[^"]*project-loop-video[^"]*"[^>]*>/g)].map((match) => match[0]);
if (loopTags.length !== 4) errors.push(`Expected four side-project loop players, found ${loopTags.length}`);
for (const tag of loopTags) {
  for (const attribute of ["muted", "loop", "playsinline", 'preload="none"', "data-src-en", "data-src-zh", "data-poster-en", "data-poster-zh"]) {
    if (!tag.includes(attribute)) errors.push(`Side-project loop is missing ${attribute}: ${tag}`);
  }
}
if (!/<video id="project-film"[^>]*\bcontrols\b[^>]*preload="none"/.test(html)) {
  errors.push("Shared full-film player must expose native controls and remain initially unloaded");
}
if (/<video id="project-film"[^>]*\ssrc=/.test(html)) {
  errors.push("Shared full-film player must not have an eager src");
}
if (!html.includes("Products I contributed to in production.")) errors.push("Company-product ownership wording is missing");

const css = fs.readFileSync(path.join(site, "styles.css"), "utf8");
if (/\.project-shot\s*\{[^}]*content-visibility\s*:\s*auto/s.test(css)) {
  errors.push("Project media must not use unstable offscreen height placeholders");
}
if (!/\.project-video-frame\s*\{[^}]*aspect-ratio\s*:\s*16\s*\/\s*9/s.test(css) ||
    !/\.project-loop-video[^}]*\{[^}]*width\s*:\s*100%[^}]*height\s*:\s*100%[^}]*object-fit\s*:\s*contain/s.test(css)) {
  errors.push("Side-project videos must reserve 16:9 frames and contain the complete image");
}

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
const allowedPortfolioFiles = ["_headers", "app.js", "consulting.css", "index.html", "styles.css", ...mediaAssets].sort();
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
for (const behavior of ["IntersectionObserver", "visibilitychange", "saveData", "showModal", "mediaPath", "loadPoster"]) {
  if (!app.includes(behavior)) errors.push(`Side-project media behavior is missing: ${behavior}`);
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
