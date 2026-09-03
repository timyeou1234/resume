#!/usr/bin/env bash
set -euo pipefail

variant="${1:-}"
company="${2:-}"
repo_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

case "$variant" in
  us-tech|web3|taiwan|chinese|ai) ;;
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

output_name="$variant"
entrypoint="$repo_dir/build/$variant/entry.tex"
if [[ -n "$company" ]]; then
  output_name="$variant-$company"
  printf '\\def\\CompanyOverlay{%s}\\input{resumes/%s.tex}\\n' \
    "$company" "$variant" > "$entrypoint"
else
  printf '\\input{resumes/%s.tex}\\n' "$variant" > "$entrypoint"
fi

engine="-pdf"
if [[ "$variant" == "chinese" ]]; then
  engine="-xelatex"
fi

latexmk \
  "$engine" \
  -interaction=nonstopmode \
  -halt-on-error \
  -file-line-error \
  -output-directory="$repo_dir/build/$variant" \
  -jobname="$output_name" \
  "$entrypoint"

cp "$repo_dir/build/$variant/$output_name.pdf" "$repo_dir/dist/$output_name.pdf"
echo "Built dist/$output_name.pdf"
