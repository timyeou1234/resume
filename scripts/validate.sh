#!/usr/bin/env bash
set -euo pipefail

repo_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
expected=(us-tech web3 taiwan)
max_pages=2
min_words_per_page=100
required_contact=(
  "+886 929070110"
  "timyeou1234@hotmail.com"
  "LinkedIn"
  "GitHub"
)
forbidden_output=(
  "you@example.com"
  "your-handle"
  "Example Technology"
  "Non-custodial Wallet Prototype"
  "80% of new iOS surfaces"
  "JSON-RPC"
)

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

  for contact in "${required_contact[@]}"; do
    grep -Fq "$contact" <<<"$text" || {
      echo "$variant.pdf is missing contact detail: $contact" >&2
      exit 1
    }
  done

  for forbidden in "${forbidden_output[@]}"; do
    if grep -Fq "$forbidden" <<<"$text"; then
      echo "$variant.pdf contains forbidden placeholder or unverified text: $forbidden" >&2
      exit 1
    fi
  done

  if [[ "$pages" -eq 2 ]]; then
    for page_number in 1 2; do
      page_words="$(
        pdftotext -f "$page_number" -l "$page_number" "$pdf" - |
          wc -w |
          tr -d '[:space:]'
      )"
      [[ "$page_words" -ge "$min_words_per_page" ]] || {
        echo "$variant.pdf page $page_number has only $page_words words; rebalance the layout or use one page." >&2
        exit 1
      }
    done
  fi

  echo "Validated dist/$variant.pdf: $pages page(s) with extractable text"
done
