# Board-Learn — Propagate Workflow

## Your Role in This Workflow

You are propagating structured board learnings into the PSTrax knowledge base. You read a completed `BM_learnings_[YYYYQQ].md` file, classify signals by destination, generate precise diffs, and apply approved patches.

**Your expertise:** Knowledge base maintenance and strategic signal routing. You understand which board-level signals belong in which Truth Pack file and how to format updates that integrate cleanly with existing content.

**Your job:** Detect signals, generate diffs, present patches for approval, and apply approved changes.

**Stop condition — You're done when:**
- [ ] All signals classified by destination
- [ ] Diffs generated for each target file
- [ ] Consultant Check executed (or skipped if no domain matches)
- [ ] Patches presented to user for approval
- [ ] Approved patches applied
- [ ] `output/board/BM_patches_pending_[YYYYQQ].md` saved (full proposal set)
- [ ] Completion summary displayed

---

## Knowledge to Load

**Must load:**
- The specific `output/board/BM_learnings_[YYYYQQ].md` being propagated
- `shared/knowledge/truth_pack/TP_01 Company & Positioning.md` — Positioning target
- `shared/knowledge/truth_pack/TP_01A Company Strategy.md` — Strategy pillar target
- `shared/knowledge/truth_pack/TP_02 Market & Customer Facts.md` — Market metric target
- `shared/knowledge/truth_pack/TP_04 Product Scope and Module Map.md` — Scope change target
- `knowledge/_personal/TP_06 Decision Log.md` — Decision log target (always receives patches)
- `GOALS.md` — Goal alignment check
- Recent `output/strategy/*.md` — Strategy consistency (most recent 3-5)
- `skills/board-learn/MEMORY.md` — Past propagation learnings

---

## Phase 1: Signal Detection

### Read the Learnings Document

Read `output/board/BM_learnings_[YYYYQQ].md` completely. Focus on:
- The **Downstream Propagation Candidates** table (pre-identified signals)
- All **Decisions** sub-components across all sections
- All **Commitments** that imply strategic shifts
- All **Key Metrics** that update or contradict existing Truth Pack data

### Classify Signals by Destination

| Signal Type | Target File | Detection Source |
|-------------|------------|------------------|
| Positioning or narrative shift | `TP_01 Company & Positioning.md` | Strategic Initiatives section, Executive Summary |
| Strategy pillar update | `TP_01A Company Strategy.md` | Roadmap section, Strategic Initiatives section |
| New market metric or update | `TP_02 Market & Customer Facts.md` | Financial Performance, Customer Metrics, Go-to-Market |
| Product scope change | `TP_04 Product Scope and Module Map.md` | Product Update, Roadmap section |
| Board decision (always) | `TP_06 Decision Log.md` | Asks & Decisions section, any section with extracted decisions |

**Rules:**
- Decisions ALWAYS propagate to TP_06 — this is not optional
- Other signals only propagate if they represent a meaningful change from current Truth Pack content
- Read each target file's current content before proposing changes
- Don't propose changes that duplicate existing content

---

## Phase 2: Diff Generation

### For Each Target File

Generate a structured diff proposal:

```
PATCH [N]: [Target filename]

SIGNAL: [Brief description of what triggered this patch]
SOURCE: BM_learnings_[YYYYQQ].md, Section [N]: [section name], p. [page ref]

CURRENT CONTENT:
> [Show the relevant section of the target file as it exists today]
> [Include enough surrounding context for the user to understand placement]

PROPOSED CONTENT:
> [Show the same section with the proposed changes applied]
> [Use clear markers for additions]

REASON: [Why this change is warranted — cite the learnings doc]
IMPACT: [What other skills or files reference this content]
```

### Diff Generation Rules

**For TP_06 (Decision Log):**
- Append new decisions to the `## Decisions` section
- Use the exact TP_06 template format (from lines 20-37 of TP_06)
- Set Source to: `Board Deck: [filename], p. [page ref]`
- Do not modify existing decisions unless explicitly superseded

**For TP_01 (Positioning):**
- Only propose changes if the board deck signals a genuine positioning shift
- Show exact text to add or modify
- Preserve existing structure and tone

**For TP_01A (Strategy):**
- Map to existing S1/S2/S3 pillar structure
- Only propose changes if strategy pillars have evolved
- Flag if a new pillar or sub-lever is implied

**For TP_02 (Market Facts):**
- Update metrics with board-reported values
- Cite board deck as source
- Note previous value if overwriting

**For TP_04 (Product Scope):**
- Only propose changes if scope has explicitly changed
- "In discussion" items don't change scope — only "decided" items do

---

## Phase 2.5: Consultant Check

After generating diffs and before presenting patches, cross-reference proposed patches against the Consultant knowledge base.

**Step 1 — Read the index**
Read `skills/Consultant/index.md`.
If missing or unreadable: append "⚠ Consultant Check skipped — index not found" to output and proceed to Phase 3.

**Step 2 — Filter by domains**
Filter index rows where Domains column contains at least one of: `strategy`, `metrics`, `growth`, `competitive`, `pricing`.
If no rows match: skip — proceed to Phase 3 without annotations.

**Step 3 — Retrieve and evaluate**
For each matched topic:
  a. Read the topic file at the path in the File Path column (relative to `skills/Consultant/`). If missing: log "⚠ [Display Name] — file not found, skipped" and continue.
  b. If Has PSTrax Application = Yes: compare PSTrax Application section against each proposed patch. Identify if any patch contradicts consultant knowledge.
  c. If Has PSTrax Application = No: evaluate whether the proposed patches reflect the framework's core principles.

**Skill-specific guidance:**
- Validate patches don't contradict consultant KB conclusions. Focus on metrics consistency and strategy/moat architecture alignment.
- Tension annotations don't block patches — the user decides.

**Step 4 — Annotate patches with tension**
For each proposed patch where tension is found, add an annotation:
`⚠ Tension with Consultant KB: [topic] — [conflict description]`

These annotations appear in the Phase 3 patch presentation so the user sees them before approving.

**Behavioral rule:** Default posture is concise. Only annotate genuine tension. Do not annotate alignment — that is noise in a patch review.

---

## Phase 3: Patch Presentation (Interactive)

### Present All Patches

```
PROPAGATION PATCHES — [YYYYQQ]

[N] patches generated from board learnings.
Review each patch. Approve all (Enter), specific patches by number (e.g., "1 3 5"), or reject all ("none"):

PATCH 1: TP_06 Decision Log — Add [decision title]
  Signal: [brief]
  Impact: Decision log grows by [N] entries

PATCH 2: TP_02 Market Facts — Update [metric name]
  Signal: [brief]
  Impact: [metric] changes from [old] to [new]

PATCH 3: TP_01A Strategy — Add sub-lever to S2
  Signal: [brief]
  Impact: Strategy pillar S2 gains new sub-lever

[etc.]

---

To see full diff for any patch, say "show [N]" (e.g., "show 2").

Your selection (Enter = approve all):
```

**Important:**
- Present summary view first — don't overwhelm with full diffs
- "show [N]" displays the full diff for a specific patch
- User can approve all (Enter), approve specific patches by number, or reject all ("none")
- Batch approval — don't ask one at a time

---

## Phase 4: Apply & Confirm

### Apply Approved Patches

For each approved patch:
1. Read the target file (fresh read, not cached)
2. Apply the proposed change using Edit tool
3. Verify the edit was applied correctly

### Save Full Proposal Set

Regardless of which patches were approved, save the complete proposal to:

`output/board/BM_patches_pending_[YYYYQQ].md`

```markdown
# Board Propagation Patches — [YYYYQQ]

**Source:** output/board/BM_learnings_[YYYYQQ].md
**Generated:** [today's date]
**Patches proposed:** [N]
**Patches approved:** [N]
**Patches rejected:** [N]

---

## Patch Summary

| # | Target | Signal | Status |
|---|--------|--------|--------|
| 1 | [filename] | [brief signal] | Approved / Rejected |
| 2 | [filename] | [brief signal] | Approved / Rejected |

---

## Full Patches

[Include full diff proposals for ALL patches — both approved and rejected]
[Mark each with its approval status]
```

### Completion Summary

```
PROPAGATION COMPLETE — [YYYYQQ]

Source:     output/board/BM_learnings_[YYYYQQ].md
Patches:   [N] proposed, [N] approved, [N] rejected

Applied:
  - [filename]: [brief description of change]
  - [filename]: [brief description of change]

Rejected (saved for reference):
  - [filename]: [brief description]

Full proposal saved: output/board/BM_patches_pending_[YYYYQQ].md

Knowledge base is now current through [YYYYQQ] board meeting.
```

---

## Quality Checklist (Self-Review Before Applying)

Before applying any patches, verify:
- [ ] All decisions from learnings doc are included in TP_06 patches
- [ ] Decision format matches TP_06 template exactly
- [ ] No patches duplicate content already in target files
- [ ] Market metric updates cite board deck as source
- [ ] Scope changes are based on decisions, not proposals
- [ ] Strategy pillar updates map to existing S1/S2/S3 structure
- [ ] Positioning changes reflect genuine shifts, not routine updates
- [ ] Full proposal set saved regardless of approval outcome
- [ ] Each patch cites the specific learnings doc section and page reference
