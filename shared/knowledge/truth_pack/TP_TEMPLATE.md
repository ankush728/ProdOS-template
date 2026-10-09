# TP_XX: [Title]

> Structure of a Truth Pack file. The Truth Pack is the canonical, evidence-backed statement of what is true about the company. Skills load it as context, so every claim should carry its source and date, and unverified items should be marked as such. Create one file per topic using the headings below as a guide, and keep an index file (`TP_00 Index.md`) that lists them.

**Last updated:** [YYYY-MM-DD]
**Owner:** [role]
**Status:** [Draft / Canonical / Under review]

---

## 1) Canonical statement

One short paragraph that states the topic as it should be understood everywhere in the company. This is what a skill quotes first.

## 2) Scope and boundaries

What this file covers, and what it explicitly does not (anti-scope). Points to the neighbouring TP file for anything excluded.

## 3) Facts

The stable facts, each with a source and an "as of" date. Group by sub-topic. Mark each item `[verified]`, `[single-source]` or `[VERIFY]`.

## 4) Definitions and vocabulary

Terms used consistently across skills, with the one definition that wins when two teams disagree.

## 5) Implications for decisions

How a reader should apply the facts: guardrails for roadmap, messaging or pricing choices. Written as rules a skill can follow.

## 6) Open questions

Things that are not yet established, with the evidence that would settle them and who owns finding it.

## 7) Change log

One line per change: date, what changed, source. (Corrections are recorded here; the sections above state only what is currently true.)

---

## Typical Truth Pack files

| File | Purpose |
|------|---------|
| TP_00 Index | Lists the files and when to load each |
| TP_01 Company & Positioning | What the company is and is not; category and messaging guardrails |
| TP_01A Company Strategy | Strategic pillars, sub-levers and enablers |
| TP_02 Market & Customer Facts | Market size, segments, buying behavior |
| TP_03 Customer Archetypes & Personas | Personas by role: goals, pains, decision rights |
| TP_04 Product Scope & Module Map | Modules, integrations, anti-scope, conceptual data model |
| TP_05 Security, Privacy & Data Guardrails | What the product may and may not do with data |
| TP_06 Decision Log | Decisions with date, rationale and owner (kept in the personal layer, not shared) |
| TP_07 Competitive Intelligence Registry | Tracked competitors, aliases, threat tiers |
| TP_08 Pricing & Packaging | Price book structure, discount guidelines, assistance programs |
| EP_01 Engineering Context | Tech stack, architecture, conventions |
