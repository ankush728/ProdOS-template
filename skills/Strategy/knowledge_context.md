# Strategy Skill — Knowledge Context

This file explains which knowledge bases the Strategy Skill references and why, for each command.

---

## For `/strategy` Command

### Always Load (Strategic Context)

**GOALS.md** — Current objectives and priorities
- **Why:** Strategic alignment — every recommendation must connect to Q1 goals
- **Key content:** Ownership areas, quarterly goals, success criteria

**shared/knowledge/truth_pack/TP_01 Company & Positioning.md** — Strategic positioning
- **Why:** Core strategic lens — "defensibility beats efficiency"
- **Key content:** What PSTrax is/isn't, core narratives, messaging guardrails

**shared/knowledge/truth_pack/TP_01A Company Strategy.md** — Strategy on a page
- **Why:** Strategy pillars (S1/S2/S3) and sub-levers for alignment
- **Key content:** Business goals, strategy pillars, enablers, lint questions

**shared/knowledge/truth_pack/TP_02 Market & Customer Facts.md** — Industry context
- **Why:** Market sizing, regulatory landscape, competitive dynamics
- **Key content:** Fire department landscape, staffing trends, ISO/PPC framing

**shared/knowledge/truth_pack/TP_03 Customer Archetypes & Personas.md** — Customer understanding
- **Why:** Persona-specific strategy — different personas = different moat levers
- **Key content:** Volunteer Chief, Career Chief, Battalion Chief, City Manager personas

**shared/knowledge/reference/pstrax-module-functionality.md** — Sandbox-validated functional reference (paired companion to TP_04)
- **Why:** Strategy work that touches product moves must distinguish "exists in production today" from "in scope but not built" — the moat is in the actual product surface, not the conceptual map. Build-vs-extend recommendations are wrong without this distinction.
- **Used in:** Strategic analysis touching specific modules, build-vs-buy reasoning, competitive moat assessment, positioning ("we already do X" claims)
- **Key content:** All 11 modules with URLs, workflows, fields, reports table, search-modal preconditions, report data preconditions

**shared/knowledge/truth_pack/TP_04 Product Scope and Module Map.md** — Product boundaries
- **Why:** Scope decisions affect moat strategy — what we own vs. integrate
- **Key content:** SCBA, Apparatus, Inventory, Controlled Substances, Station Ops

**shared/knowledge/truth_pack/TP_05 Security, Privacy & Data Guardrails.md** — Compliance constraints
- **Why:** Security/compliance requirements constrain strategic options
- **Key content:** Data classification, AI guardrails, audit requirements

**knowledge/_personal/TP_06 Decision Log.md** — Past strategic decisions
- **Why:** Avoid revisiting settled decisions; build on precedent
- **Key content:** Major decisions, rationale, alternatives considered

**shared/knowledge/truth_pack/TP_07 Competitive Intelligence Registry.md** — Tracked competitors
- **Why:** Competitive dynamics are core to strategic positioning analysis
- **Key content:** Tracked competitors with threat tiers, aliases, known capabilities

**shared/knowledge/pm_principles/PMOP_01_AI_Moat_Framework.md** — Moat analysis framework
- **Why:** Primary analytical lens — 8 defensible moat dimensions
- **Key content:** 8 moats with criteria, validation methods

**shared/knowledge/pm_principles/Product Principles.md** — Product decision framework
- **Why:** Strategic recommendations must align with VP's product philosophy
- **Key content:** 11 principles, decision checklist, pressure-test questions, anti-pattern flags
- **Used in:**
  - Step 3B: Apply Strategic Fit and Vision & Differentiation criteria
  - Step 3E: Use pressure-test questions to stress-test recommendations
  - Flag anti-patterns: shortcut framing, competitor copying, unvalidated context transfer

### Sometimes Load (PE / Narrative Framing)

**shared/knowledge/pm_principles/AI_02_SECTION_II_AI_NARRATIVES.md** — investor AI value narrative frameworks
- **Why:** When framing AI strategy for the investor audience, this provides the narrative archetypes the investor uses (Stored Data, Tacit Knowledge, HITL, Workflow Embeddedness, etc.)
- **When:** Preparing investor communication, positioning AI narrative, `/strategy` questions about how to frame AI story externally
- **Key content:** 7 AI positioning narrative archetypes with examples, incumbent vs. startup dynamics, PE due diligence lens

**shared/knowledge/pm_principles/AI_01_SECTION_I_IMPORTANCE_OF_AI.md** — AI investment context
- **Why:** Provides PE-lens context on AI M&A dynamics — useful when framing PSTrax's AI strategy for the investor
- **When:** Preparing investor communication about AI strategy or competitive positioning vs. AI-native entrants
- **Key content:** AI investment trends, incumbent vs. AI-native dynamics, SaaS disruption narratives

**meetings/1on1s/[CEO]/PROFILE.md** — CEO communication reference
- **Why:** When strategy output is destined for the CEO, their communication preferences and hot buttons shape how to frame the recommendation
- **When:** Strategy question is being prepared for the CEO specifically, or recommendation needs to be communicated upward
- **Key content:** Communication & Working Style section — PE framing preferences, hot buttons, best practices for presenting to the CEO

### Always Load (Execution Context)

**shared/output/voc/*.md** (latest 10) — Customer insights and pain points
- **Why:** Strategic decisions must be grounded in customer evidence
- **Key content:** JTBD, pain points, moat opportunities, quotes

**output/cto/MoatValidation_*.md** (all) — Technical moat assessments
- **Why:** Engineering validation of moat claims
- **Key content:** Moat ratings, technical reasoning, strengthening strategies

**output/cto/Feasibility_*.md** (recent) — Technical complexity and effort
- **Why:** Strategy must account for execution reality
- **Key content:** Effort estimates, risks, dependencies

**tasks/active.md** — Current execution reality
- **Why:** Strategic advice must account for current focus and in-flight work (never as an engineering-capacity constraint; see Principle 8 in `CLAUDE.md`)
- **Key content:** Active work items, blockers, priorities

### Always Load (Historical Context)

**output/strategy/*.md** (all) — Past strategic analyses
- **Why:** Build on prior strategic thinking; maintain consistency
- **Key content:** Past recommendations, moat analyses, decisions

**skills/*/MEMORY.md** (all) — Cross-skill learnings
- **Why:** Patterns from VOC, CTO, Standup inform strategic thinking
- **Key content:** Distilled insights, preferences, calibration data

**skills/Strategy/MEMORY.md** — Own strategic patterns
- **Why:** Accumulated strategic preferences, frameworks, decision principles
- **Key content:** Patterns learned, successful frameworks, communication preferences

### Why Deep Context Loading

- Strategic decisions require complete picture
- Can't assess moat portfolio without all CTO validations
- Can't recommend direction without VOC customer insights
- Can't evaluate ideas without knowing past decisions
- Better to load everything than miss critical context

---

## For `/update-knowledge` Command

### Scan Sources

**output/strategy/*.md** (last 30 days or user-specified period)
- **Why:** Recent strategic decisions that should be reflected in Truth Pack
- **Looking for:** Positioning changes, strategic bets, moat evolution

**skills/Strategy/memory/*.md** (last 30 days or user-specified period)
- **Why:** Session-level decisions and insights not yet in artifacts
- **Looking for:** Ad-hoc decisions, preference shifts, new information

**output/cto/BuildVsBuy_*.md** (recent)
- **Why:** Major build decisions worth logging in TP_06
- **Looking for:** Build vs. buy outcomes, strategic rationale

### Signal-to-File Mapping

| Signal Detected | Truth Pack File to Update |
|----------------|--------------------------|
| Positioning, value prop, differentiation | TP_01 Company & Positioning.md |
| "Decided to", build vs buy, strategic bet | TP_06 Decision Log.md |
| Market shift, NFPA, regulation, competitor | TP_02 Market & Customer Facts.md |
| Persona insight, customer segment deepening | TP_03 Customer Archetypes & Personas.md |
| "In scope", "out of scope", product boundaries | TP_04 Product Scope and Module Map.md |

---

## Knowledge Loading Best Practices

**At command start:**
1. Read this file (knowledge_context.md) to know what to load
2. Read MEMORY.md for strategic learnings and preferences
3. Load required files per command type above
4. Prioritize recent files over old when context window is concern

**During execution:**
- Reference loaded knowledge, don't re-read files
- If additional context needed, load on demand
- Document which knowledge influenced the analysis

**At command end:**
- Save output to appropriate location
- Append session summary to daily log (memory/YYYY-MM-DD.md)
- Update MEMORY.md if strategic pattern emerged

---

## Notes

- Strategy Skill loads MORE context than any other skill — this is by design
- Deep context enables connecting dots across VOC, CTO, tasks, and past decisions
- Context loading order: strategic → execution → historical
- If context window is limited, prioritize: GOALS.md, TP_01, PMOP_01, recent VOC, recent strategy artifacts
