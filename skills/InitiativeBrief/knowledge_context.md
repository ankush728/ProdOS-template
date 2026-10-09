# Initiative Brief — Knowledge Context

What to load and why when drafting Initiative Briefs.

## Roadmap source (live Google Sheet)

- **File ID:** `<ROADMAP_SHEET_ID>`  *(the single source of truth roadmap sheet; set to your own)*
- **URL:** <google-doc-url>
- **Read via:** Google Drive MCP `read_file_content` with the `fileId` above. Returns CSV-like text.
- **Columns:** `Title | Sequence | Status | Goal (Theme) | Confidence | Description | Dependencies | Sizing Brief | Notes` (`Sequence` = Now/Next/Later horizon)
- **`Goal` column = roadmap bucket.** Buckets are defined by your own roadmap, for example:
  Advanced tier · AI features · Purchasing platform · New vertical · Self-service/PLG ·
  Enabler integrations · Feature functionality
- Sheet fields are **seed** evidence — the brief is enriched from the corpora below.
- If the read fails (auth/format): report the gap, ask the VP of Product to paste the relevant rows.
  **Never fabricate roadmap items.**

## Evidence corpora to mine (treat like VOC — search for related/supporting signals)

| Corpus | Path | Yields | Cite as |
|---|---|---|---|
| Ideas DB | `output/ideas/ideas_db.md` | Related/supporting ideas by theme, module, customer | `IDEA-NNN` / `CMT-NN` / `RMP-NN` |
| VOC | `shared/output/voc/**` (syntheses, signals, analyses, scans) | Customer quotes, pain, JTBD, frequency (N=) | `<Customer> <date>` |
| Truth Pack | `shared/knowledge/truth_pack/` | Positioning (TP_01), personas (TP_03), scope (TP_04), decisions (TP_06), competitive (TP_07) | `TP_07 <competitor>` |
| Transcripts | `output/transcripts/**` | Recent decisions, competitive angle, strategic fit | `<meeting> <date>` |
| Goals | `GOALS.md` | Strategic alignment, rocks | `GOALS Rock N` |

**Mining posture:** treat `ideas_db.md` the way VOC analysis treats transcripts — search for
ideas that *relate to or support* the roadmap item (by theme, module, customer source), not a
1:1 title match. A roadmap item is usually supported by several ideas + VOC signals.

## Template

`templates/Initiative_Brief_and_Sizing.md` — fill **Part A only** (sections 1–7). Leave Part B
(Engineering Sizing) blank for the dev anchors.

## Output

- Working copy (repo): `shared/output/briefs/Brief_<item-slug>.md` — frontmatter + Part A + blank Part B
  + internal `## Evidence & Citations` section.
- Index: `shared/output/briefs/INDEX.md`
- **Shareable copy (Google Drive):** clean version (no frontmatter, no Evidence & Citations) saved
  to Drive folder `<BRIEFS_DRIVE_FOLDER_ID>`
  (<google-drive-url>). Publishing is
  outward-facing — confirm with the VP of Product first.
