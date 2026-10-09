# Design Spec Generator — Knowledge Context

What to load, when, and why.

---

## Always Load

**The PRD being spec'd** — `output/prds/PRD_[Feature]_*.md`
- **Why:** The entire AC structure for the story being spec'd must be in working memory. AC numbers, cross-references, and out-of-scope statements all matter.
- **Used in:** Functions 1, 2, 3
- **Strategy:** Read the full PRD. Don't try to spec from an excerpt.

**Prior specs in the same PRD** — `output/design-specs/PRD-[PRD-ID]/`
- **Why:** Pattern inheritance and sample-data continuity. Reading prior specs prevents drift across the PRD.
- **Used in:** Function 2 (generate), Function 3 (triage)
- **Strategy:** Glob the directory at session start. If empty, this is the first spec in the PRD; declare the canonical sample data.

---

## Sometimes Load

**`skills/PRD/sessions/[feature-slug].md`** — Session state for the PRD
- **Why:** Top of the file contains the version-by-version change log. Critical for Function 3 (triage).
- **When:** Function 3 always. Function 1 if the PRD has been revised since the last spec session.

**`shared/knowledge/reference/pstrax-module-functionality.md`** — Sandbox-validated functional reference
- **Why:** When the story extends an existing production surface, this doc captures the real URLs, fields, and workflows. Grounds the spec in production reality rather than PRD assumption.
- **When:** Any story where the diagnostic D (existing-surface coverage) triggers and the user hasn't yet provided a screenshot. Use as the fallback when a screenshot would be ideal but isn't available.

**`shared/knowledge/truth_pack/TP_04 Product Scope and Module Map.md`** — Product scope
- **Why:** Confirms which module owns the surface being spec'd. Surfaces inheritance constraints (e.g., "Supplies module patterns should not appear in CS module specs without explicit cross-module PRD scope").
- **When:** First spec in a PRD or when the story spans modules.

---

## Conditionally Load (Function 3 — Triage)

**PRD diff or version history**
- **Why:** Triage depends on knowing what changed. The session file's version log is the primary source. If not available, ask the VP of Product for a diff.
- **When:** Always during triage. Don't infer changes from the current PRD alone.

---

## Knowledge NOT Loaded by Default

- **VOC outputs** — Spec generation is a downstream activity. VOC justification belongs in the PRD; specs assume the PRD has done that work.
- **CTO outputs** — Feasibility belongs upstream. Specs design the surface; engineering judges feasibility on the spec.
- **GOALS.md / Truth Pack TP_01 / PMOP_01** — Strategic context belongs in the PRD. Specs are downstream of strategy.
- **Other skill MEMORY files** — Only this skill's MEMORY.md is loaded.

If a downstream consumer (engineering, sales enablement) asks "why this design choice?" the answer is in the PRD, not the spec. Specs are translation layers, not justification layers.
