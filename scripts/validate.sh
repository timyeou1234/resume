#!/usr/bin/env bash
set -euo pipefail

repo_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
expected=(us-tech web3 taiwan chinese ai)
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
  headings=("Summary" "Technical Skills" "Experience" "Education")
  if [[ "$variant" == "chinese" ]]; then
    headings=("專業摘要" "技術能力" "工作經歷" "學歷")
  fi
  for heading in "${headings[@]}"; do
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

  # Every variant needs readable links, not only PDF link annotations.
  visible_links=(
    "linkedin.com/in/timothy-yeou-0134a9117"
    "github.com/timyeou1234"
    "timyeou.com"
  )
  for link in "${visible_links[@]}"; do
    grep -Fq "$link" <<<"$text" || {
      echo "$variant.pdf is missing visible link text: $link" >&2
      exit 1
    }
  done

  required_facts=(
    "Crypto.com" "San Orange Technology" "OpenNet" "Royal Technology"
    "Awesome Limited" "Lion Travel Information" "WeWork Technology" "IdeaBus Technology"
    "Firebase Crashlytics" "Firebase Performance" "Datadog" "Segment" "Elasticsearch"
  )
  if [[ "$variant" == "chinese" ]]; then
    required_facts+=(
      "Cronos App（上線前開發）" "國立臺北大學" "企業管理學士"
      "2024 年 9 月 - 2026 年 7 月" "2024 年 6 月 - 2024 年 8 月"
      "2020 年 10 月 - 2024 年 4 月" "2019 年 4 月 - 2020 年 8 月"
      "2018 年 4 月 - 2019 年 1 月" "2017 年 8 月 - 2018 年 4 月"
      "2017 年 1 月 - 2017 年 7 月" "2016 年 8 月 - 2017 年 1 月"
    )
  else
    required_facts+=(
      "Cronos App (Pre-launch)" "National Taipei University" "Bachelor of Business Administration"
      "Sep 2024 - Jul 2026" "Jun 2024 - Aug 2024" "Oct 2020 - Apr 2024"
      "Apr 2019 - Aug 2020" "Apr 2018 - Jan 2019" "Aug 2017 - Apr 2018"
      "Jan 2017 - Jul 2017" "Aug 2016 - Jan 2017"
    )
  fi
  for fact in "${required_facts[@]}"; do
    grep -Fq "$fact" <<<"$text" || {
      echo "$variant.pdf is missing reviewed fact: $fact" >&2
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
