#!/usr/bin/env bash
# Collapse output/transcripts multi-file folders + legacy single-files into
# one sectioned file per meeting under output/transcripts/<quarter>/.
# Emits output/transcripts/_migration_map.tsv (old_path<TAB>new_path_or_anchor<TAB>raw_or_dash).
# Idempotent for re-runs into a fresh <quarter>/. Never touches output/voc or state/voc.
set -euo pipefail
cd "$(dirname "$0")/.."

SRC="output/transcripts"
QUARTER="${QUARTER:-2026Q2}"
DEST="$SRC/$QUARTER"
MAP="$SRC/_migration_map.tsv"
mkdir -p "$DEST"
: > "$MAP"

ORDER=(00_summary 01_action_items 02_decisions 03_voc_signals 04_competitive_intel 05_strategic_learnings 06_relationship_notes 07_personal_insights)
declare -A SECTION=(
  [00_summary]="Summary"
  [01_action_items]="Action Items"
  [02_decisions]="Decisions"
  [03_voc_signals]="VOC Signals"
  [04_competitive_intel]="Competitive Intel"
  [05_strategic_learnings]="Strategic Learnings"
  [06_relationship_notes]="Relationship Notes"
  [07_personal_insights]="Personal Insights"
)

strip_h1() { awk 'NR==1 && /^#{1,2} /{next} {print}' "$1"; }
anchor_of() { echo "$1" | tr '[:upper:]' '[:lower:]' | tr ' ' '-'; }
detect_source() {
  if grep -rqi "GONG_CALL_ID\|gong\.io" "$1" 2>/dev/null; then echo gong
  elif grep -rqi "ZOOM_UUID" "$1" 2>/dev/null; then echo zoom
  else echo notes; fi
}
frontmatter() { printf -- "---\ndate: %s\nmeeting: %s\npeople: []\nthemes: []\nsource: %s\n---\n" "$1" "$2" "$3"; }

# 1) Multi-file folders
for d in "$SRC"/*/; do
  base=$(basename "$d")
  case "$base" in archive|"$QUARTER"|digests) continue;; esac
  date=${base%%_*}; slug=${base#*_}
  out="$DEST/$base.md"
  src=$(detect_source "$d")
  { frontmatter "$date" "$slug" "$src"
    printf "# %s — %s\n" "$slug" "$date"
    for key in "${ORDER[@]}"; do
      printf "\n## %s\n\n" "${SECTION[$key]}"
      if [[ -f "$d/$key.md" ]]; then strip_h1 "$d/$key.md"; else printf "_None._\n"; fi
    done
  } > "$out"
  if [[ -f "$d/raw_transcript.md" ]]; then
    cp "$d/raw_transcript.md" "$DEST/$base.raw.md"
    printf "%s\t%s\t%s\n" "${d%/}" "$out" "$DEST/$base.raw.md" >> "$MAP"
  else
    printf "%s\t%s\t-\n" "${d%/}" "$out" >> "$MAP"
  fi
  for key in "${ORDER[@]}"; do
    [[ -f "$d/$key.md" ]] || continue
    a=$(anchor_of "${SECTION[$key]}")
    printf "%s/%s.md\t%s#%s\t-\n" "${d%/}" "$key" "$out" "$a" >> "$MAP"
  done
done

# 2) Legacy single-file meetings (summary-shaped; keep body verbatim, no fabricated sections)
shopt -s nullglob
for f in "$SRC"/*.md; do
  [[ "$(basename "$f")" == "INDEX.md" ]] && continue
  base=$(basename "$f" .md)
  date=${base%%_*}; slug=${base#*_}
  out="$DEST/$base.md"
  src=$(detect_source "$f")
  { frontmatter "$date" "$slug" "$src"; strip_h1 "$f"; } > "$out"
  printf "%s\t%s\t-\n" "$f" "$out" >> "$MAP"
done

echo "Migrated $(ls -1 "$DEST"/*.md | grep -vc '\.raw\.md') meeting files; map rows: $(wc -l < "$MAP")"
