# Consultant Skill — Knowledge Context

This file explains which knowledge bases the Consultant Skill references and why.

---

## For `/ingest` Command

### Always Load

**skills/Consultant/index.md** — Master topic index
- **Why:** Required to check for duplicate/merge candidates before creating new topic files
- **Key content:** All indexed topics with slugs, domains, source journals, PSTrax application status

**skills/Consultant/MEMORY.md** — Long-term learnings
- **Why:** Extraction patterns, domain coverage, ingestion history
- **Key content:** What works well for topic extraction, any user preferences on granularity

### Load on Demand

**skills/Consultant/journals/*.md** — Raw journal files
- **Why:** The source material for ingestion. Read the specific journal being ingested.
- **Key content:** Learning frameworks, PSTrax-applied conclusions, decision rules

**skills/Consultant/topics/*.md** — Existing topic files
- **Why:** When a merge candidate is detected, read the existing topic file to understand what content already exists before appending
- **Key content:** General Framework and PSTrax Application sections for the matched topic

---

## Knowledge Loading Best Practices

**At command start:**
1. Read this file (knowledge_context.md) to know what to load
2. Read MEMORY.md for ingestion history and extraction patterns
3. Read index.md to know all existing topics (for duplicate detection)

**During ingestion:**
- Read the target journal file fully before proposing topics
- Read existing topic files only when a merge candidate is detected
- Do not load Truth Pack, GOALS.md, or other skill contexts — Consultant does not evaluate or recommend, it extracts and indexes

**At command end:**
- Update index.md with new/updated rows
- Append session summary to daily log (memory/YYYY-MM-DD.md)
- Update MEMORY.md if extraction pattern emerged

---

## Notes

- Consultant loads minimal context compared to other skills — by design
- Its job is extraction and indexing, not strategic analysis
- Other skills query the index at runtime via the retrieval protocol (Phase 2)
