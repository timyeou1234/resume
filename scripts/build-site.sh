#!/usr/bin/env bash
set -euo pipefail

repo_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
site_dir="$repo_dir/site"
assets_dir="$site_dir/assets"

required_pdfs=(us-tech web3 taiwan chinese)

mkdir -p "$assets_dir"

for variant in "${required_pdfs[@]}"; do
  source_pdf="$repo_dir/dist/$variant.pdf"
  [[ -s "$source_pdf" ]] || {
    echo "Missing or empty PDF: $source_pdf" >&2
    exit 1
  }
  cp "$source_pdf" "$assets_dir/$variant.pdf"
done

{
  printf '%s\n' '---' 'layout: default' 'title: Timothy Yu - Senior iOS Engineer' '---' ''
  printf '%s\n' '[Download US Tech PDF](./assets/us-tech.pdf) · [Download Web3 PDF](./assets/web3.pdf) · [Download Taiwan PDF](./assets/taiwan.pdf) · [下載繁體中文 PDF](./assets/chinese.pdf)' ''
  sed -n '1,$p' "$repo_dir/source/resume.md"
  if [[ -n "${GITHUB_SHA:-}" && -n "${GITHUB_REPOSITORY:-}" ]]; then
    printf '\n---\n\n_Last updated from commit [`%s`](https://github.com/%s/commit/%s)._\n' \
      "$GITHUB_SHA" "$GITHUB_REPOSITORY" "$GITHUB_SHA"
  else
    printf '%s\n' '' '---' '' '_Generated locally._'
  fi
} > "$site_dir/index.md"

echo "Prepared Markdown site in site/"
