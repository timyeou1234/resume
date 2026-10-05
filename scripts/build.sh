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

output_name="$variant"
if [[ -n "$company" ]]; then
  output_name="$variant-$company"
  [[ -f "$repo_dir/companies/$company.tex" ]] || {
    echo "Unknown company overlay: $company" >&2
    exit 2
  }
fi
build_dir="$repo_dir/build/$output_name"
mkdir -p "$build_dir" "$repo_dir/dist"
entrypoint="$build_dir/entry.tex"
cd "$repo_dir"
if [[ -n "$company" ]]; then
  printf '\\def\\CompanyOverlay{%s}\\input{resumes/%s.tex}\n' \
    "$company" "$variant" > "$entrypoint"
else
  printf '\\input{resumes/%s.tex}\n' "$variant" > "$entrypoint"
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
  -output-directory="$build_dir" \
  -jobname="$output_name" \
  "$entrypoint"

cp "$build_dir/$output_name.pdf" "$repo_dir/dist/$output_name.pdf"
echo "Built dist/$output_name.pdf"
