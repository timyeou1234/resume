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
cp "$source_dir/consulting.css" "$output_dir/consulting.css"
cp "$source_dir/app.js" "$output_dir/app.js"
cp "$source_dir/_headers" "$output_dir/_headers"
portfolio_assets=(
  "products/moment/moments-runtime-zh-v9.png"
  "products/moment/actions-runtime-zh-v9.png"
  "products/line-family-translator/avatar-v9.png"
  "products/productdev/app-icon-v9.png"
  "products/timwork/portfolio-zh-v9.jpg"
  "products/timwork/portfolio-en-v9.jpg"
  "products/moment/saved-runtime-zh-v10.png"
  "products/productdev/monitor-native-v10.jpg"
  "products/productdev/run-detail-native-v10.jpg"
  "products/productdev/runs-native-v10.jpg"
  "products/timwork/decisions-en-v10.jpg"
  "products/timwork/decisions-zh-v10.jpg"
  "products/timwork/knowledge-en-v10.jpg"
  "products/timwork/knowledge-zh-v10.jpg"
)

for asset in "${portfolio_assets[@]}"; do
  mkdir -p "$(dirname "$output_dir/assets/$asset")"
  cp "$source_dir/assets/$asset" "$output_dir/assets/$asset"
done

echo "Prepared Cloudflare portfolio assets in .portfolio-dist/"
