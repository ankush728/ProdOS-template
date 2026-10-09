# Board-Learn Skill - Knowledge Context

This file explains which knowledge bases the board-learn skill references and why.

---

## Always Load

**`skills/board-learn/MEMORY.md`** — Own long-term memory
- **Why:** Apply past learnings about section detection, metric naming, cross-deck patterns
- **Used in:** All phases
- **Key content:** Section detection patterns, metric conventions, quality feedback

**`shared/knowledge/truth_pack/TP_01 Company & Positioning.md`** — Company positioning
- **Why:** Frame board learnings within PSTrax strategic positioning
- **Used in:** Phase 3 (strategic framing of extracted content), Phase 5 (propagation targeting)
- **Key content:** Positioning principles, value props, differentiation

**`shared/knowledge/truth_pack/TP_01A Company Strategy.md`** — Strategy pillars
- **Why:** Map board content to S1/S2/S3 strategy pillars
- **Used in:** Phase 3 (strategic initiative mapping), Phase 5 (strategy pillar updates)
- **Key content:** Strategy pillars, sub-levers, enablers

**`knowledge/_personal/TP_06 Decision Log.md`** — Decision template and history
- **Why:** Format board decisions to match TP_06 template exactly; check for existing decisions
- **Used in:** Phase 3 (decision extraction formatting), Phase 5 (decision propagation)
- **Key content:** Decision template (lines 20-37), existing decisions

**`shared/knowledge/reference/pstrax-module-functionality.md`** — Sandbox-validated functional reference (paired companion to TP_04)
- **Why:** Board content describing product progress (product_update + roadmap_forward sections) needs grounding in actual product surfaces. A board claim like "module X now supports capability Y" can be cross-checked against the real product surface. Prevents propagating aspirational language into TP_04 as if shipped.
- **Used in:** Phase 3 (product_update + roadmap_forward sections — sanity-check claims), Phase 5 (TP_04 propagation — distinguish "scope adds" from "ship updates")
- **Key content:** All 11 modules with URLs, workflows, fields, reports table

**`shared/knowledge/pm_principles/Product Principles.md`** — Product decision philosophy
- **Why:** Apply the VP of Product's decision framework when interpreting board-level decisions
- **Used in:** Phase 3 (decision context enrichment), Phase 5 (principle alignment)
- **Key content:** 11 principles, decision checklist, anti-pattern flags

---

## Load for Extract (Stage 1)

**Prior `output/board/BM_learnings_*.md` files** — Previous board learnings
- **Why:** Enable cross-deck pattern detection (metric trajectories, open loops, theme evolution)
- **Used in:** Phase 3 (cross-deck analysis — only if 2+ prior learnings exist)
- **Note:** Load all available prior learnings for cross-quarter comparison

---

## Load for Propagate (Stage 2)

**The specific `output/board/BM_learnings_[YYYYQQ].md`** — Learnings being propagated
- **Why:** This is the source document for all propagation signals
- **Used in:** Phase 5 (signal detection and diff generation)

**`shared/knowledge/truth_pack/TP_02 Market & Customer Facts.md`** — Market facts
- **Why:** Compare board metrics against existing market data; detect updates needed
- **Used in:** Phase 5 (market metric propagation)
- **Key content:** Market sizing, customer metrics, industry trends

**`shared/knowledge/truth_pack/TP_04 Product Scope and Module Map.md`** — Product scope
- **Why:** Detect product scope changes from board roadmap discussions
- **Used in:** Phase 5 (scope change propagation)
- **Key content:** Module definitions, in-scope/out-of-scope boundaries

**`shared/knowledge/reference/pstrax-module-functionality.md`** — Sandbox-validated functional reference (paired companion to TP_04)
- **Why:** Board decks report product status by module (e.g. "Module X beta launch," "Integration Y shipped," "Feature Z gap"). When propagating these signals, ground them against the actual product surface — does the module exist? At what maturity? Which URL/workflow does the claim refer to? Prevents propagating an aspirational board-deck claim into TP_04 as if it were shipped.
- **Used in:** Phase 3 (product update / roadmap / strategic initiative extraction — verify what's actually shipped vs. asserted), Phase 5 (scope change propagation to TP_04 — propose against real surface, not assumed scope)
- **Key content:** All 11 modules with URLs, workflows, fields, reports table, status markers (GA / Beta / module-dependent)

**`GOALS.md`** — Current objectives and priorities
- **Why:** Align board commitments with stated goals; detect goal updates needed
- **Used in:** Phase 5 (goal alignment check)

**Recent `output/strategy/*.md`** — Strategy artifacts
- **Why:** Cross-reference board signals against recent strategic analyses
- **Used in:** Phase 5 (strategy consistency check)
- **Note:** Load most recent 3-5 strategy artifacts

---

## How Context Is Used by Phase

### Phase 1: Read & Parse
1. Load board deck PDF (provided by user)
2. Determine quarter label (ask user or derive from content)
3. Load `MEMORY.md` — apply section detection and metric naming learnings
4. Read PDF in page batches (1-20, 21-40, etc.)

### Phase 2: Section Confirmation (Interactive)
1. Use `MEMORY.md` section detection patterns to improve accuracy
2. Present detected sections with page ranges
3. User confirms, adds, or excludes sections

### Phase 3: Deep Extraction
1. Load `TP_01 Company & Positioning.md` — strategic framing context
2. Load `TP_01A Company Strategy.md` — strategy pillar mapping
3. Load `TP_06 Decision Log.md` — decision template format (lines 20-37)
4. Load `Product Principles.md` — decision philosophy
5. If 2+ prior `BM_learnings_*.md` exist, load them for cross-deck analysis
6. Extract 5 sub-components per confirmed section

### Phase 4: Output Generation
1. Generate `BM_learnings_[YYYYQQ].md` with all extracted content
2. Include cross-deck patterns (if applicable)
3. Flag downstream propagation candidates

### Phase 5: Propagate (Stage 2 — separate command)
1. Load the specific learnings doc being propagated
2. Load `TP_02 Market & Customer Facts.md` — market metric targets
3. Load `TP_04 Product Scope and Module Map.md` — scope change targets
4. Load `GOALS.md` — goal alignment targets
5. Load recent `output/strategy/*.md` — strategy consistency
6. Classify signals by destination file
7. Generate diffs and present for approval

---

## Knowledge Loading Best Practices

**At workflow start:**
1. Read this file (knowledge_context.md) to know what to load
2. Read MEMORY.md to apply past learnings
3. Load always-load context files
4. Scan deck content before loading conditional files

**During extraction:**
- Reference loaded knowledge, don't re-read files
- Use TP_06 template for decision formatting
- Use TP_01/TP_01A for strategic framing
- Use Product Principles for decision interpretation

**At workflow end:**
- Save outputs to appropriate location
- Append learnings to daily log
- Update MEMORY.md if significant pattern emerged (e.g., new section detection cue, metric alias)
