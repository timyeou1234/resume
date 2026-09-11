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
cp "$source_dir/assets/moments-demo.png" "$output_dir/assets/moments-demo.png"
cp "$source_dir/assets/productdev-figma.svg" "$output_dir/assets/productdev-figma.svg"
cp "$source_dir/assets/timwork-figma.svg" "$output_dir/assets/timwork-figma.svg"

echo "Prepared Cloudflare portfolio assets in .portfolio-dist/"
