# PRD: [FEATURE NAME]

**Author:** [Name] | **Date:** [Date] | **Status:** [Draft / In Review / Approved] | **Version:** [X.X]

> **How to read this:** everything above the `--- CONTEXT ---` fold is what you need to build the
> feature. Everything below it is why we are building it. Engineering can stop at the fold.

---

## Build Contract

*Required. Never omitted, never longer than 150 words. This is the first thing an engineer reads and
it must let them answer "what am I building and where" without scrolling.*

| | |
|---|---|
| **What** | [One sentence. The capability, in the user's terms.] |
| **Who for** | [Specific persona from TP_03.] |
| **Surfaces** | [Actual page/screen names. Mark the primary one.] |
| **Data touched** | [Tables, fields, reports. Name real ones, not hypothetical ones.] |
| **Depends on** | [Work that must land first, or "nothing".] |
| **Hard nos** | [The 2-4 things this must never do. Each one testable.] |
| **Size** | [# stories / # ACs / modules touched] |

**What changes for the user:** Before this, [persona] could not [X]. After, they can [Y].

---

## Requirements

*One story per capability. Stories are numbered US-NNN; acceptance criteria AC-NNN. Numbering gaps
are intentional — retired IDs are not reused.*

**An acceptance criterion is:**
- **One assertion.** One thing that is either true or false.
- **≤25 words.**
- **Self-contained.** Readable alone. It may point at another AC for extra detail, but it must state
  its own requirement without the reader going there.
- **Outcome-observable.** What the persona can see and verify. Response times, payload shapes, and
  query structure belong in `design.md`.

### US-001: [Title]

**As a** [persona] **I want to** [capability] **so that** [outcome].

*[Optional: one line of clarifying scope. Rationale goes below the fold, not here.]*

- **AC-001:** [Given X, when Y, then Z.]
- **AC-002:** [One assertion.]
- **AC-003:** [One assertion.]

**Done when:** [What proves this story shipped. One line.]

### US-002: [Title]

[Same shape.]

---

## Out of Scope

*Hard nos, so nobody re-litigates them in design review. One line each, with the reason only where
the reason prevents the argument recurring.*

**Not in this release:**
- [Thing] — [why not now]

**Considered and rejected:**
- [Thing] — [why rejected]

---

## Technical Notes & Handoff

*Inputs for `design.md` / `tasks.md`. Facts and flags, not prose.*

**Dependencies:** [systems, modules, third parties]

**Risks:** [Risk] → [mitigation]

**Non-functional:** Performance [budget] · Scale [largest footprint to support] · Availability [only
if it changes the existing target]

**Compliance & defensibility** (per TP_05) — answer each, one line:
| Check | Answer |
|---|---|
| Chain-of-custody touched? | [Y/N — if Y, TP_05 P0 Gate applies] |
| Roles or permissions changed? | [Y/N — list affected roles] |
| Audit logs affected? | [Y/N — which events] |
| New exports or bulk data access? | [Y/N] |
| NFPA / NFIRS / accreditation implications? | [describe or "none"] |
| Data classification | [Public / Internal / Customer Confidential / Restricted] |
| HITL approval required? | [Y/N — for what actions] |
| Defensibility artifact produced? | [what the customer can show in an audit, or "none"] |

**Tenant isolation impact:** [any effect on how data is scoped per tenant]

**Regression-sensitive areas touched:** [categories from the project's regression-protection doc
— controlled substances, blood products, audit trails, multi-tenant isolation, NFPA workflows]

**Files / modules likely touched:** [preview, not exhaustive]

**Open questions `design.md` must resolve:**
1. [Thing the tech lead must investigate before tasks can be sequenced]

---
--- CONTEXT — not required to build ---
---

*Include a section below only when it would change a build decision or a prioritization decision.
Drop the rest. A tightly-scoped technical feature may have no context sections at all.*

## Problem & Evidence

*≤200 words.*

**Problem:** [The customer pain. What breaks today.]

**JTBD:** When [situation], I want to [motivation], so I can [outcome].

**Evidence:** [VOC quotes, data, customer examples. If none: "Internal hypothesis — not yet validated"
and say why we are proceeding anyway.]

## Strategic Context

*≤150 words.*

**Pillar:** [company strategy this supports] · **Goal:** [from GOALS.md]

**Moat** (PMOP_01): [Moat] — [how this builds it]

**Constraints the solution must respect** (architecture constraints belong in `design.md`):
- *Customer / business:* [set by customer behavior, business model, product strategy]
- *Compliance / regulatory:* [NFPA, NFIRS, NERIS, CFAI, retention, chain-of-custody — at policy
  level, not implementation level]
- *Strategic:* [scope boundaries from TP_04, guardrails from TP_01A, what this must NOT become]

## Success Metrics

**Leading** (weekly/monthly): [Metric] — target [X], baseline [Y]
**Lagging** (quarterly): [Metric] — target [X], baseline [Y]
**Kill signal:** [Metric] below [threshold] after [timeframe]

## Moat Assessment

*Only when the moat argument is contested or load-bearing for prioritization. See
`templates/moat_assessment.md` for the full framework.*

Strong: [moats] · Moderate: [moats] · Weak: [moats]
Replicable by a competitor in 6 months? [Y/N — what makes it defensible]

## Appendix

**Related:** VOC [link] · Competitive analysis [link] · Design mocks [link]

**Change log:** [Date] v0.1 initial draft · [Date] v0.2 [what changed and why]
