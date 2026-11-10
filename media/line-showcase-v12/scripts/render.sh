#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
asset_dir=../../site/assets/products/line-family-translator
for edition in Desktop Mobile; do
  edition_lower=$(echo "$edition" | tr '[:upper:]' '[:lower:]')
  for language in zh en; do
    language_upper=$(echo "$language" | tr '[:lower:]' '[:upper:]')
    composition="Line${edition}${language_upper}"
    npx remotion render "$composition" "$asset_dir/film-$edition_lower-$language-v12.mp4" --codec=h264 --crf=23 --pixel-format=yuv420p --concurrency=4 --log=error
    npx remotion still "$composition" "$asset_dir/poster-$edition_lower-$language-v12.jpg" --frame=120 --image-format=jpeg --jpeg-quality=85 --log=error
  done
done
