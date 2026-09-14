#!/usr/bin/env bash
set -euo pipefail

repo_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

node --check "$repo_dir/site/app.js"
bash "$repo_dir/scripts/build-portfolio.sh"

RESUME_REPO_DIR="$repo_dir" node <<'NODE'
const fs = require("fs");
const path = require("path");

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
  "Timothy Yu — Senior iOS Engineer",
  "Senior iOS Engineer · Taiwan",
  "React Native, Expo, and TypeScript",
  "ProductDev",
  "Tim Work"
];
for (const text of requiredText) {
  if (!html.includes(text)) errors.push(`Missing current portfolio text: ${text}`);
}

const retiredText = ["AI-Native Product Engineer", "Senior product engineer", "Objective-C", "Wealth OS"];
for (const text of retiredText) {
  if (html.includes(text)) errors.push(`Retired portfolio text remains: ${text}`);
}

if (!html.includes('class="site-nav"')) errors.push("Primary navigation is missing the site-nav hook");
if (!html.includes('<link rel="canonical" href="https://timyeou.com/">')) errors.push("Canonical domain metadata is missing");
if (!html.includes('<meta property="og:url" content="https://timyeou.com/">')) errors.push("Open Graph domain metadata is missing");
if (!html.includes('href="https://timyeou1234.github.io/resume/resume.html"')) errors.push("GitHub Pages resume link is missing");
if (html.includes("figma.com/")) errors.push("Portfolio must not contain Figma links");
const momentAssets = [
  "assets/moment/loop-zh-v4.mp4",
  "assets/moment/film-zh-v4.mp4",
  "assets/moment/poster-zh-v4.jpg",
  "assets/moment/loop-en-v4.mp4",
  "assets/moment/film-en-v4.mp4",
  "assets/moment/poster-en-v4.jpg"
];
for (const asset of momentAssets) {
  for (const root of [site, portfolio]) {
    const target = path.join(root, asset);
    if (!fs.existsSync(target) || fs.statSync(target).size === 0) {
      errors.push(`Missing or empty Moment asset: ${path.relative(repo, target)}`);
    }
  }
  if (!localReferences.includes(asset)) errors.push(`Moment asset is not referenced by the page: ${asset}`);
}
if (html.includes("moments-demo.png")) errors.push("Retired static Moment screenshot remains referenced");
if (!html.includes('id="moment-loop"') || !html.includes('id="moment-film-dialog"')) {
  errors.push("Moment video player hooks are missing");
}
if (!/<video id="moment-loop"[^>]*\bmuted\b[^>]*\bloop\b[^>]*\bplaysinline\b[^>]*preload="none"/.test(html)) {
  errors.push("Moment loop must be muted, looping, inline, and initially unloaded");
}
if (!/<video id="moment-film"[^>]*\bcontrols\b[^>]*preload="none"[^>]*data-src-en=/.test(html)) {
  errors.push("Moment full film must expose native controls and remain unloaded before interaction");
}
if (/<video id="moment-film"[^>]*\ssrc=/.test(html)) {
  errors.push("Moment full film must not have an eager src");
}
if (!html.includes("Products I contributed to in production.")) errors.push("Company-product ownership wording is missing");

const css = fs.readFileSync(path.join(site, "styles.css"), "utf8");
if (/\.project-shot\s*\{[^}]*content-visibility\s*:\s*auto/s.test(css)) {
  errors.push("Project media must not use unstable offscreen height placeholders");
}
if (!/\.moment-video-frame\s*\{[^}]*aspect-ratio\s*:\s*16\s*\/\s*9/s.test(css) ||
    !/\.moment-loop-video[^}]*\{[^}]*width\s*:\s*100%[^}]*height\s*:\s*100%[^}]*object-fit\s*:\s*contain/s.test(css)) {
  errors.push("Moment video must reserve a 16:9 frame and contain the complete image");
}

const portfolioFiles = fs.readdirSync(portfolio, { recursive: true, withFileTypes: true })
  .filter((entry) => entry.isFile())
  .map((entry) => path.relative(portfolio, path.join(entry.parentPath || entry.path, entry.name)))
  .sort();
if (portfolioFiles.some((file) => file.endsWith(".pdf") || file.endsWith("resume.md") || file.endsWith("resume.html"))) {
  errors.push("Cloudflare portfolio bundle must not contain resume documents");
}
const allowedPortfolioFiles = [
  "app.js",
  "assets/moment/film-en-v4.mp4",
  "assets/moment/film-zh-v4.mp4",
  "assets/moment/loop-en-v4.mp4",
  "assets/moment/loop-zh-v4.mp4",
  "assets/moment/poster-en-v4.jpg",
  "assets/moment/poster-zh-v4.jpg",
  "assets/productdev-figma.svg",
  "assets/timwork-figma.svg",
  "index.html",
  "styles.css"
].sort();
if (JSON.stringify(portfolioFiles) !== JSON.stringify(allowedPortfolioFiles)) {
  errors.push(`Cloudflare portfolio bundle differs from the explicit allowlist: ${portfolioFiles.join(", ")}`);
}

const app = fs.readFileSync(path.join(site, "app.js"), "utf8");
for (const behavior of ["IntersectionObserver", "visibilitychange", "saveData", "showModal", "mediaPath"]) {
  if (!app.includes(behavior)) errors.push(`Moment media behavior is missing: ${behavior}`);
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
