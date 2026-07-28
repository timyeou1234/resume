#!/usr/bin/env bash
set -euo pipefail

variant="${1:-}"
company="${2:-}"
repo_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

case "$variant" in
  us-tech|web3|taiwan) ;;
  *)
    echo "Unknown variant: $variant" >&2
    exit 2
    ;;
esac

if [[ -n "$company" && ! "$company" =~ ^[a-z0-9][a-z0-9-]*$ ]]; then
  echo "COMPANY must contain only lowercase letters, numbers, and hyphens." >&2
  exit 2
fi

mkdir -p "$repo_dir/build/$variant" "$repo_dir/dist"

tex_input="\\input{resumes/$variant.tex}"
output_name="$variant"
if [[ -n "$company" ]]; then
  tex_input="\\def\\CompanyOverlay{$company}$tex_input"
  output_name="$variant-$company"
fi

latexmk \
  -pdf \
  -interaction=nonstopmode \
  -halt-on-error \
  -file-line-error \
  -output-directory="$repo_dir/build/$variant" \
  -jobname="$output_name" \
  "$tex_input"

cp "$repo_dir/build/$variant/$output_name.pdf" "$repo_dir/dist/$output_name.pdf"
echo "Built dist/$output_name.pdf"
