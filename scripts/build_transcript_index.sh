#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
QUARTER="${QUARTER:-2026Q2}"   # override: QUARTER=2026Q3 ./scripts/build_transcript_index.sh
DEST="output/transcripts/$QUARTER"
OUT="output/transcripts/INDEX.md"
{
  echo "# Transcript Index"
  echo
  echo "_Retrieval spine. One row per meeting. Scan here to trace a topic or locate a citation, then open only the meetings you need._"
  echo
  echo "| Date | Meeting | People | Themes | Source | Link |"
  echo "|------|---------|--------|--------|--------|------|"
  for f in "$DEST"/*.md; do
    [[ "$f" == *.raw.md ]] && continue
    fm() { awk -v k="$1" '/^---$/{n++; next} n==1 && $0 ~ "^"k":"{sub("^"k": *",""); print; exit}' "$f"; }
    d=$(fm date); m=$(fm meeting); p=$(fm people); t=$(fm themes); s=$(fm source)
    rel="$QUARTER/$(basename "$f")"
    printf "| %s | %s | %s | %s | %s | [↗](%s) |\n" "$d" "$m" "${p//[\[\]]/}" "${t//[\[\]]/}" "$s" "$rel"
  done | sort
} > "$OUT"
echo "Index rows: $(grep -cE '^\| [0-9]{4}' "$OUT")"
