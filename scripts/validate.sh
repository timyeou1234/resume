#!/usr/bin/env bash
set -euo pipefail

repo_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
expected=(us-tech web3 taiwan)
max_pages=2

command -v pdfinfo >/dev/null || {
  echo "pdfinfo is required for validation." >&2
  exit 1
}
command -v pdftotext >/dev/null || {
  echo "pdftotext is required for validation." >&2
  exit 1
}

for variant in "${expected[@]}"; do
  pdf="$repo_dir/dist/$variant.pdf"
  [[ -s "$pdf" ]] || {
    echo "Missing or empty PDF: $pdf" >&2
    exit 1
  }

  pages="$(pdfinfo "$pdf" | awk '/^Pages:/ {print $2}')"
  [[ "$pages" =~ ^[0-9]+$ && "$pages" -ge 1 && "$pages" -le "$max_pages" ]] || {
    echo "$variant.pdf has $pages pages; expected between 1 and $max_pages." >&2
    exit 1
  }

  text="$(pdftotext "$pdf" -)"
  for heading in "Summary" "Technical Skills" "Experience" "Education"; do
    grep -Fq "$heading" <<<"$text" || {
      echo "$variant.pdf is missing extractable heading: $heading" >&2
      exit 1
    }
  done
  echo "Validated dist/$variant.pdf: $pages page(s) with extractable text"
done
