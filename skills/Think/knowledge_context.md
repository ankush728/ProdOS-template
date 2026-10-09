# Think Skill — Knowledge Context

This file explains which knowledge bases the Think skill references and why, based on session domain.

---

## Always Load (Every Session)

**GOALS.md** — Current objectives and priorities
- **Why:** Every thinking session must connect to strategic context — goals, ownership areas, success criteria
- **Key content:** Q1/Q2 goals, ownership areas, company metrics, operating principles
- **Used in:** Step 2 (context loading), Step 3 (reference during questioning), Step 5 (action item alignment)

**tasks/active.md** — Current execution reality
- **Why:** Thinking must account for what's already in flight — focus, blockers (never as an engineering-capacity constraint)
- **Key content:** Active work items, deadlines, waiting-on-others
- **Used in:** Step 3 (reality-check thinking against current load), Step 5 (avoid duplicating existing actions)

---

## Domain-Specific Loading

Context loading is determined by the domain answer in Step 1 (Question 2). Prefer precision over comprehensiveness — load what's relevant, not everything.

### Product Domain Reference

**shared/knowledge/reference/pstrax-module-functionality.md** — Sandbox-validated functional reference (paired companion to TP_04)
- **Why:** Product-domain pressure-testing must distinguish "the product already does X" from "we want to do X." Without this, thinking sessions drift toward proposing already-shipped features.
- **When:** Domain answer in Step 1 includes `product` OR session touches a specific module (Vehicles, SCBA, PPE, Assets, Supplies, CS, Blood Products, Procurement)
- **Key content:** All 11 modules with URLs, workflows, fields, reports table, search-modal preconditions, report data preconditions

### People Domain

**meetings/1on1s/[Person]/PROFILE.md** — Person profile and relationship context
- **Why:** People-domain thinking requires understanding the individual — communication style, hot buttons, history
- **When:** Always when the session is about a specific person or relationship
- **Key content:** Working style, preferences, relationship history, recent meeting notes

**Recent 1:1 notes for the person** — Latest meeting context
- **Why:** Recent interactions surface what's top of mind and unresolved
- **When:** When session involves a specific person

**knowledge/reference/team.md** — Org structure and team context
- **Why:** People problems exist in organizational context — reporting lines, cross-functional dynamics
- **Key content:** Team structure, roles, relationships

**The VP of Product's mandate from GOALS.md** — Leadership context
- **Why:** People decisions must align with VP-level mandate and operating principles
- **Already loaded:** Via the always-load rule above

### Product Domain

**shared/knowledge/truth_pack/TP_01A Company Strategy.md** — Strategy on a page
- **Why:** Product thinking must align with S1/S2/S3 strategy pillars
- **Key content:** Business goals, strategy pillars, sub-levers, enablers, lint questions

**shared/knowledge/truth_pack/TP_04 Product Scope and Module Map.md** — Product boundaries
- **Why:** Product decisions require understanding what's in scope vs. out of scope
- **Key content:** SCBA, Apparatus, Inventory, Controlled Substances, Station Ops modules

**shared/knowledge/pm_principles/PMOP_01_AI_Moat_Framework.md** — Moat analysis framework
- **Why:** Product thinking should always consider defensibility — which moats does this strengthen?
- **Key content:** 8 moat dimensions with criteria and validation methods

**Recent PRD or strategy outputs (if relevant)**
- **Why:** Avoid rethinking what's already been decided or analyzed
- **Where:** `output/prds/`, `output/strategy/`

### Process Domain

**shared/knowledge/truth_pack/TP_01A Company Strategy.md** — Strategy on a page
- **Why:** Process design must serve strategic objectives, not exist for its own sake
- **Key content:** Strategy pillars, enablers, organizational context

**Any existing process docs relevant to the problem**
- **Why:** Don't redesign from scratch — understand what exists
- **When:** Ask the user if unclear which docs are relevant

### Strategy Domain

**Full canonical knowledge base:**
- `shared/knowledge/truth_pack/TP_01 Company & Positioning.md` — Strategic positioning ("defensibility beats efficiency")
- `shared/knowledge/truth_pack/TP_01A Company Strategy.md` — Strategy pillars (S1/S2/S3)
- `shared/knowledge/truth_pack/TP_02 Market & Customer Facts.md` — Industry context, market dynamics
- `shared/knowledge/truth_pack/TP_04 Product Scope and Module Map.md` — Product boundaries and scope
- `knowledge/_personal/TP_06 Decision Log.md` — Past strategic decisions and rationale
- `shared/knowledge/truth_pack/TP_07 Competitive Intelligence Registry.md` — Tracked competitors, threat tiers
- **Why:** Strategy-domain thinking requires the full strategic picture — positioning, market, competition, past decisions
- **Key content:** Competitive dynamics, moat portfolio, decision precedent

**shared/knowledge/pm_principles/PMOP_01_AI_Moat_Framework.md** — Moat analysis framework
- **Why:** Strategy sessions should pressure-test ideas through the moat lens
- **Key content:** 8 defensible moat dimensions

**Recent strategy artifacts from output/strategy/**
- **Why:** Build on prior strategic thinking; maintain consistency
- **Key content:** Past recommendations, analyses, decisions

**Board learnings from output/board/**
- **Why:** Board context shapes strategic framing — PE expectations, growth targets
- **Key content:** investor priorities, strategic direction

### Combination Domain

**Union of relevant files across the indicated domains.**
- **When:** User says the problem touches multiple domains (e.g., "people and process")
- **How:** Ask which domains to clarify loading scope, then load the union of those domain-specific files
- **Principle:** Still prefer precision — don't load everything just because it's a combination

---

## How Context Is Used During a Session

### At Session Start (Step 2)
1. Read this file (knowledge_context.md) to know what to load
2. Read MEMORY.md for thinking session patterns and preferences
3. Read today's daily log if exists (session continuity)
4. Load domain-specific files per the table above
5. Summarize what was loaded (2-3 lines max) — do not dump file contents

### During Thinking Loop (Step 3)
- Reference loaded context when it challenges or supports the user's thinking
- Example: "That seems to conflict with the S2 pillar — how do you reconcile that?"
- Example: "The decision log shows you already settled this in [date] — has something changed?"
- Do not re-read files during the session; work from what was loaded

### During Output Production (Step 4)
- Ground the output in loaded context — cite specific sources where relevant
- Ensure recommendations align with GOALS.md priorities

### During Action Commitment (Step 5)
- Cross-reference proposed actions against tasks/active.md to avoid duplication
- Ensure actions connect to strategic goals

---

## Knowledge Loading Best Practices

**Precision over comprehensiveness.** The Think skill is intentionally broad — it works across any domain. But that doesn't mean it loads everything. Load what the domain requires, nothing more.

**Context should be referenced, not forgotten.** If you load a file, it should influence the conversation. If you're not going to reference it, don't load it.

**Ask when unclear.** For combination domains or ambiguous problems, ask which specific files would be most relevant rather than guessing.

**At session end:**
- Save session state to `skills/Think/sessions/[session-slug].md`
- Append session summary to daily log (`skills/Think/memory/YYYY-MM-DD.md`)
- Update MEMORY.md if a significant pattern emerged

---

## Notes

- Think skill loads LESS context than Strategy skill — this is by design
- Think is a thinking partner, not a strategic analyst; it loads enough to pressure-test, not to produce exhaustive analysis
- The domain answer in Step 1 is the primary driver of what gets loaded
- If a session reveals the problem is actually a strategy question, suggest `/strategy` instead
- If a session reveals the problem is clearly a PRD, suggest `/prd` instead
- Session state files record which context was loaded, enabling seamless resume
