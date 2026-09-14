#!/usr/bin/env bash
set -euo pipefail

repo_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
source_dir="$repo_dir/site"
output_dir="$repo_dir/.portfolio-dist"

mkdir -p "$output_dir"
find "$output_dir" -mindepth 1 -delete
mkdir -p "$output_dir/assets"

cp "$source_dir/index.html" "$output_dir/index.html"
cp "$source_dir/styles.css" "$output_dir/styles.css"
cp "$source_dir/app.js" "$output_dir/app.js"
portfolio_assets=(
  "productdev-figma.svg"
  "timwork-figma.svg"
  "moment/loop-zh-v4.mp4"
  "moment/film-zh-v4.mp4"
  "moment/poster-zh-v4.jpg"
  "moment/loop-en-v4.mp4"
  "moment/film-en-v4.mp4"
  "moment/poster-en-v4.jpg"
)

for asset in "${portfolio_assets[@]}"; do
  mkdir -p "$(dirname "$output_dir/assets/$asset")"
  cp "$source_dir/assets/$asset" "$output_dir/assets/$asset"
done

echo "Prepared Cloudflare portfolio assets in .portfolio-dist/"
