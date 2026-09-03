#!/usr/bin/env bash
set -euo pipefail

repo_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

node --check "$repo_dir/site/app.js"

RESUME_REPO_DIR="$repo_dir" node <<'NODE'
const fs = require("fs");
const path = require("path");

const repo = process.env.RESUME_REPO_DIR;
const site = path.join(repo, "site");
const html = fs.readFileSync(path.join(site, "index.html"), "utf8");
const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]);
const uniqueIds = new Set(ids);
const errors = [];

if (ids.length !== uniqueIds.size) errors.push("Duplicate HTML ids found");

for (const match of html.matchAll(/href="#([^"]+)"/g)) {
  if (!uniqueIds.has(match[1])) errors.push(`Missing anchor target: #${match[1]}`);
}

const generatedPaths = new Set(["resume.html"]);
for (const match of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
  const value = match[1];
  if (/^(?:https?:|mailto:|tel:|#)/.test(value)) continue;
  const relative = decodeURIComponent(value.split(/[?#]/)[0].replace(/^\.\//, ""));
  if (!relative || generatedPaths.has(relative)) continue;
  if (!fs.existsSync(path.join(site, relative))) errors.push(`Missing local target: ${value}`);
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

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log(`Validated portfolio: ${ids.length} ids and all local targets resolved.`);
NODE
