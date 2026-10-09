# Triage Agent — Knowledge Context

## Purpose
This file defines what the Triage Agent loads and when. The agent needs context for two purposes: (1) classifying incoming items, and (2) detecting contradictions with existing knowledge.

---

## Pass 1: Always Load (Scan Context — Minimal)

| File | Why |
|------|-----|
| `agents/triage/MEMORY.md` | Past classification patterns and preferences |
| `knowledge/reference/team.md` | Identify PSTrax team members in content (for call type classification) |
| `meetings/1on1s/` | List of known people with profiles (for 1:1 call detection) |

**Do NOT load TP_07 or TP_03 yet.** Scan Drop Zone content first, then load only what the content signals require.

---

## Pass 2: Load Conditionally (Based on Content Signals)

Scan all Drop Zone items before loading any of the following. Load only what the content requires.

| Signal Detected In Content | Load |
|----------------------------|------|
| Competitor names, win/loss language, pricing comparison | `shared/knowledge/truth_pack/TP_07 Competitive Intelligence Registry.md` |
| Customer pain points, feature requests, "wish it could", VOC patterns | `shared/knowledge/truth_pack/TP_03 Customer Archetypes & Personas.md` |

---

## Load Per Item (Based on Classification)

### If SOURCE = transcript
- Load `skills/transcript-intel/CLAUDE.md` — For routing to transcript-intel skill
- If call type = 1:1, load relevant person's `PROFILE.md` from `meetings/1on1s/`

### If SOURCE = email / notes / slack
- Load `agents/triage/workflows/extract-general/CLAUDE.md` — For general extraction workflow

### For Contradiction Detection (Best-Effort)
- Load the specific Truth Pack file(s) that the item's signals will be routed to
- Compare key facts/metrics in new content against existing Truth Pack content
- Flag contradictions in the triage summary — do not resolve them

---

## Context Loading Order

1. **First:** Pass 1 files (MEMORY.md, team.md, 1on1s directory listing)
2. **Second:** Scan all Drop Zone items — read content, detect signals
3. **Third:** Load Pass 2 files based on signals found (TP_07 if competitive, TP_03 if VOC)
4. **Fourth:** Classify items using loaded context
5. **Fifth:** Load per-item context based on classification results
6. **Sixth:** Process items through appropriate skills/workflows

---

## Best Practices

- Load Pass 1 (minimal) context, then SCAN content before loading Pass 2
- TP_07 and TP_03 are large files — do not load them for runs with no competitive or VOC content
- Don't load all Truth Pack files upfront — only load what's needed per item
- For contradiction detection, focus on factual claims (numbers, dates, names) not opinions
- When in doubt about which Truth Pack to check, skip contradiction detection for that item
