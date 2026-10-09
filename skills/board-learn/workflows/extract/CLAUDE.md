# Board-Learn — Extract Workflow

## Your Role in This Workflow

You are processing a board deck PDF through all four extraction phases to produce structured board intelligence.

**Your expertise:** Semantic section detection and structured extraction from board meeting materials. You identify financial performance, customer metrics, product updates, roadmap signals, GTM data, team changes, strategic initiatives, board decisions, and risk flags — all with page-level citations.

**Your job:** Read the board deck, detect and confirm sections, extract structured intelligence across 5 sub-components per section, and generate a comprehensive learnings document.

**Stop condition — You're done when:**
- [ ] `output/board/BM_learnings_[YYYYQQ].md` saved
- [ ] Every metric has a page citation or `NOT CITED` marker
- [ ] Decisions match TP_06 template format exactly
- [ ] No fabricated data — only what appears in the deck
- [ ] Sparse/unreadable pages flagged
- [ ] Consultant Check executed (or skipped if no domain matches)
- [ ] Completion confirmation displayed

---

## Knowledge to Load

**Must load:**
- Board deck PDF (provided by user)
- `skills/board-learn/MEMORY.md` — Past learnings
- `shared/knowledge/truth_pack/TP_01 Company & Positioning.md` — Strategic framing
- `shared/knowledge/truth_pack/TP_01A Company Strategy.md` — Strategy pillars
- `knowledge/_personal/TP_06 Decision Log.md` — Decision template (lines 20-37)
- `shared/knowledge/pm_principles/Product Principles.md` — Decision philosophy

**Load if 2+ prior learnings exist:**
- Prior `output/board/BM_learnings_*.md` files — Cross-deck pattern detection

---

## Phase 1: Read & Parse

### Step 1: Determine Quarter Label
- Ask the user which quarter this deck covers, OR derive from deck content
- Format: `YYYYQQ` (e.g., `2026Q1`, `2025Q4`)
- This label is used in the output filename

### Step 2: Read the Board Deck PDF
- Use the Read tool with `pages` parameter to read in batches
- **Batch 1:** Pages 1-20
- **Batch 2:** Pages 21-40 (if deck is longer)
- **Batch 3:** Pages 41-60 (if deck is longer)
- Continue until all pages are read
- Do not skim — read every page

### Step 3: Flag Sparse/Unreadable Pages
- Identify pages where PDF parsing produced sparse or garbled text
- These are often chart-heavy slides where text extraction fails
- Track these page numbers for the extraction gaps section

### Step 4: Semantic Section Detection
Scan all content and map to the 9 canonical sections by **content patterns**, not slide titles. A single slide may map to multiple sections. A section may span multiple slides.

**9 Canonical Sections:**

| # | Section | Detection Patterns |
|---|---------|-------------------|
| 1 | `financial_performance` | ARR, MRR, revenue, churn, burn, runway, gross margin, EBITDA, cash, bookings, billings |
| 2 | `customer_metrics` | NPS, logos, retention, expansion, DAU, churn rate, CSAT, activation, seats, accounts |
| 3 | `product_update` | shipped, released, milestones, uptime, velocity, sprint, deployment, features launched |
| 4 | `roadmap_forward` | roadmap, upcoming, planned, next quarter, priorities, H2, FY27, future, investment areas |
| 5 | `go_to_market` | pipeline, sales, CAC, LTV, partnerships, win rate, ACV, deal size, channel, marketing |
| 6 | `team_org` | headcount, hiring, attrition, open roles, org changes, promotions, departures, culture |
| 7 | `strategic_initiatives` | initiative, bet, pilot, expansion, investment, M&A, new market, platform play |
| 8 | `asks_decisions` | ask, decision, approval, vote, resolution, board action, authorization, request |
| 9 | `risks_concerns` | risk, concern, blocker, issue, watch item, threat, vulnerability, dependency |

**For each detected section, record:**
- Section name
- Page range (e.g., pages 5-8)
- Brief content preview (1 sentence)
- Confidence: High / Medium / Low

---

## Phase 2: Section Confirmation (Interactive)

### Present Detected Sections

```
SECTION DETECTION — [filename] ([YYYYQQ])

The following sections were detected. Confirm the ones you want extracted.
Press Enter to approve all, or specify numbers to exclude (e.g., "3 6"):

[1] FINANCIAL PERFORMANCE     → pages [X-Y]
    Preview: [brief description of what was found]

[2] CUSTOMER METRICS          → pages [X-Y]
    Preview: [brief description]

[3] PRODUCT UPDATE            → pages [X-Y]
    Preview: [brief description]

[4] ROADMAP (FORWARD-LOOKING) → pages [X-Y]
    Preview: [brief description]

[5] GO-TO-MARKET              → pages [X-Y]
    Preview: [brief description]

[6] TEAM & ORG                → pages [X-Y]
    Preview: [brief description]

[7] STRATEGIC INITIATIVES     → pages [X-Y]
    Preview: [brief description]

[8] ASKS & DECISIONS          → pages [X-Y]
    Preview: [brief description]

[9] RISKS & CONCERNS          → pages [X-Y]
    Preview: [brief description]

NOT DETECTED: [list sections not found in the deck]

Sparse/unreadable pages: [list page numbers, if any]

Your selection (Enter = approve all):
```

**Important:**
- User can confirm all (Enter), exclude by number, or add sections not detected
- Flag sections NOT PRESENT — this is valuable metadata
- Batch all questions together — don't ask one at a time

---

## Phase 3: Deep Extraction

### For Each Confirmed Section, Extract 5 Sub-Components:

#### Sub-Component 1: Summary
- 2-4 sentence summary of the section content
- Include page references: `(p. 5)` or `(pp. 5-8)`
- Frame through PSTrax strategic lens (TP_01/TP_01A context)

#### Sub-Component 2: Key Metrics
Extract every quantitative metric found in the section:

| Metric | Value | Trend | Page |
|--------|-------|-------|------|
| [metric name] | [value] | [up/down/flat/new] | p. [N] |

**Rules:**
- Every metric MUST have a page citation
- If a metric is referenced but the value is not explicitly stated, mark: `NOT CITED — referenced on p. [N] but value not shown`
- Never fabricate values — only extract what is explicitly in the deck
- Use `MEMORY.md` metric naming conventions for consistency across decks

#### Sub-Component 3: Commitments
Forward-looking statements — things the company has committed to or signaled intent on:

| Commitment | Owner/Presenter | Timeline | Page |
|------------|-----------------|----------|------|
| [what was committed] | [who presented it] | [when, if stated] | p. [N] |

#### Sub-Component 4: Risks/Concerns
Issues, blockers, or watch items flagged in this section:

| Risk/Concern | Severity | Context | Page |
|--------------|----------|---------|------|
| [the risk] | [high/medium/low — based on framing] | [brief context] | p. [N] |

#### Sub-Component 5: Decisions
Board-level decisions detected in this section. Format each using the TP_06 Decision Log template exactly:

```
### [Decision Title]

**Date:** [quarter being reported, or specific date if stated]
**Context:** [what prompted this decision — from deck context]
**Alternatives Considered:**
1. [Option A] — [if mentioned]
2. [Option B] — [if mentioned]

**Decision:** [what was decided]
**Rationale:** [why — from deck context]
**Source:** Board Deck: [filename], p. [N]
**Status:** Active
**Review Date:** [if mentioned, otherwise omit]
```

**Rules for decisions:**
- Only extract actual decisions — not proposals or asks still pending
- If it says "approved" or "resolved" or "decided" — it's a decision
- If it says "requested" or "proposed" or "to be discussed" — it's an ask, not a decision
- Asks go in the Commitments sub-component with appropriate framing

### Cross-Deck Analysis (Conditional)

**Only if 2+ prior `BM_learnings_*.md` files exist:**

Compare current deck against prior quarters:

**Metric Trajectories:**
| Metric | Prior Quarter(s) | Current Quarter | Trend |
|--------|-----------------|-----------------|-------|
| [metric] | [prior value(s)] | [current value] | [improving/declining/flat] |

**Open Loops:**
- Commitments from prior quarters — are they addressed in this deck?
- Flag unresolved items

**New Themes:**
- Topics appearing for the first time this quarter
- Topics that disappeared from prior quarters

---

## Phase 4: Output Generation

### Write: `output/board/BM_learnings_[YYYYQQ].md`

```markdown
# Board Meeting Learnings — [YYYYQQ]

**Source:** [filename]
**Quarter:** [YYYYQQ]
**Extracted:** [today's date]
**Sections Processed:** [N] of 9
**Sparse Pages:** [list, or "None"]

---

## Executive Summary

[3-5 sentence summary of the most important signals from this board deck. What are the key takeaways a VP of Product should remember? Frame through PSTrax strategic lens.]

---

## Section Extracts

### 1. Financial Performance
[If confirmed section — include all 5 sub-components]
[If not present — note: "Not present in this deck."]

### 2. Customer Metrics
[same pattern]

### 3. Product Update
[same pattern]

### 4. Roadmap (Forward-Looking)
[same pattern]

### 5. Go-to-Market
[same pattern]

### 6. Team & Org
[same pattern]

### 7. Strategic Initiatives
[same pattern]

### 8. Asks & Decisions
[same pattern]

### 9. Risks & Concerns
[same pattern]

---

## Cross-Deck Patterns
[If 2+ prior learnings exist — include Metric Trajectories, Open Loops, New Themes]
[If this is the first deck — note: "First deck processed. Cross-deck analysis will be available after 2+ decks."]

---

## Downstream Propagation Candidates

Signals that should be reviewed for propagation to Truth Pack and knowledge files:

| Signal | Target File | Reason |
|--------|------------|--------|
| [signal description] | [TP_01/TP_01A/TP_02/TP_04/TP_06] | [why this should be propagated] |

---

## Extraction Gaps

- **Sparse pages:** [list pages where text extraction was poor]
- **Sections not present:** [list sections not found in deck]
- **Metrics without values:** [list any NOT CITED metrics]
- **Ambiguous content:** [flag anything that needs human clarification]
```

### Consultant Check (Post-Extraction)

After writing the learnings file and before displaying the completion confirmation, cross-reference extracted learnings against the Consultant knowledge base.

**Step 1 — Read the index**
Read `skills/Consultant/index.md`.
If missing or unreadable: append "⚠ Consultant Check skipped — index not found" to output and proceed to completion confirmation.

**Step 2 — Filter by domains**
Filter index rows where Domains column contains at least one of: `strategy`, `metrics`, `growth`, `competitive`, `pricing`.
If no rows match: skip — do not add a Consultant Check section.

**Step 3 — Retrieve and evaluate**
For each matched topic:
  a. Read the topic file at the path in the File Path column (relative to `skills/Consultant/`). If missing: log "⚠ [Display Name] — file not found, skipped" and continue.
  b. If Has PSTrax Application = Yes: compare PSTrax Application section against the extracted learnings. Identify tension, gap, or enrichment.
  c. If Has PSTrax Application = No: evaluate whether the extracted learnings reflect the framework's core principles. Flag briefly if not.

**Skill-specific guidance:**
- Compare extracted learnings against indexed topics. Focus on metrics consistency (do board metrics contradict consultant conclusions?) and strategy/moat architecture alignment (do board signals challenge or reinforce journal-derived positioning conclusions?).

**Step 4 — Append Consultant Check to output**
If matches found, append a `## Consultant Check` section to the end of the `BM_learnings_[YYYYQQ].md` file:

---
## Consultant Check

**Topics retrieved:** [comma-separated Display Names]

[For each topic with Has PSTrax Application = Yes:]
**[Display Name] — PSTrax Application**
- Alignment: "Consistent with [extracted learning]. No additions." OR
- Enrichment: [Additional nuance. 2-4 sentences.] OR
- Tension: [Extracted learning vs. journal's divergent conclusion, side by side. Do not revise the extraction — surface the conflict for the user to decide.]

[For each topic with Has PSTrax Application = No:]
**[Display Name] — Framework Check**
- Applied: "Framework was applied in the extraction above." OR
- Not applied: "[Framework name] was not explicitly applied. [Brief note.]"
---

**Behavioral rule:** Default posture is concise. Alignment = one sentence. Expand only on genuine tension or enrichment. Validation-only checks are noise.

Also display the Consultant Check findings in the completion confirmation below.

### Completion Confirmation

After the learnings file is written, display:

```
EXTRACTION COMPLETE

Source:   [filename]
Quarter:  [YYYYQQ]
Output:   output/board/BM_learnings_[YYYYQQ].md

Sections extracted: [N] of 9
Key metrics found:  [N]
Decisions logged:   [N]
Commitments found:  [N]
Risks flagged:      [N]

Propagation candidates: [N] signals ready for downstream routing

> Run /board-propagate [YYYYQQ] when ready to generate patches.
```

---

## Quality Checklist (Self-Review Before Output)

Before generating final output, verify:
- [ ] Every metric has a page citation or `NOT CITED` marker
- [ ] Every decision matches TP_06 template format exactly
- [ ] No fabricated data — every value is directly from the deck
- [ ] Sparse/unreadable pages are flagged in Extraction Gaps
- [ ] Asks vs. decisions are correctly classified (asks = commitments, not decisions)
- [ ] Section numbering is consistent (1-9)
- [ ] Executive summary frames through PSTrax strategic lens
- [ ] Cross-deck analysis included if 2+ prior learnings exist
- [ ] Downstream propagation candidates identified
- [ ] Quarter label format is correct (YYYYQQ)
