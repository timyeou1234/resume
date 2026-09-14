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
  "products/moment/film-en-v5.mp4"
  "products/moment/film-zh-v5.mp4"
  "products/moment/loop-en-v5.mp4"
  "products/moment/loop-zh-v5.mp4"
  "products/moment/poster-en-v5.jpg"
  "products/moment/poster-zh-v5.jpg"
  "products/line-family-translator/film-en-v6.mp4"
  "products/line-family-translator/film-zh-v6.mp4"
  "products/line-family-translator/loop-en-v6.mp4"
  "products/line-family-translator/loop-zh-v6.mp4"
  "products/line-family-translator/poster-en-v6.jpg"
  "products/line-family-translator/poster-zh-v6.jpg"
  "products/productdev/film-en-v5.mp4"
  "products/productdev/film-zh-v5.mp4"
  "products/productdev/loop-en-v5.mp4"
  "products/productdev/loop-zh-v5.mp4"
  "products/productdev/poster-en-v5.jpg"
  "products/productdev/poster-zh-v5.jpg"
  "products/timwork/film-en-v5.mp4"
  "products/timwork/film-zh-v5.mp4"
  "products/timwork/loop-en-v5.mp4"
  "products/timwork/loop-zh-v5.mp4"
  "products/timwork/poster-en-v5.jpg"
  "products/timwork/poster-zh-v5.jpg"
)

for asset in "${portfolio_assets[@]}"; do
  mkdir -p "$(dirname "$output_dir/assets/$asset")"
  cp "$source_dir/assets/$asset" "$output_dir/assets/$asset"
done

echo "Prepared Cloudflare portfolio assets in .portfolio-dist/"
