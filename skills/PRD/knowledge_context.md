# PRD Skill - Knowledge Context

This file explains which knowledge bases the PRD Coach references and why.

---

## Truth Pack (PSTrax-Specific)

### Always Load

**TP_01 Company & Positioning.md** - Positioning principles
- **Why:** PRD must align with "defensibility beats efficiency"
- **Used in:** Strategic Context section, Moat Assessment
- **Key content:** Value propositions, differentiation strategy

**TP_03 Customer Archetypes & Personas.md** - Customer personas
- **Why:** User stories must reference specific personas, not generic "user"
- **Used in:** Requirements section, Problem & Evidence
- **Key content:** Career Fire Chief, Volunteer Fire Chief, Battalion Chief

**TP_04 Product Scope and Module Map.md** - Product boundaries
- **Why:** PRD must stay within product scope or explicitly justify expansion
- **Used in:** Out of Scope section, Build Contract
- **Key content:** SCBA, Apparatus, Inventory, Controlled Substances, Station Ops

**shared/knowledge/reference/pstrax-module-functionality.md** - Sandbox-validated functional reference (paired companion to TP_04)
- **Why:** TP_04 defines scope/intent; this doc captures the actual product surface (URLs, workflows, field structures, reports per module). PRD work needs both — TP_04 for "what we own," this doc for "what already exists today."
- **Used in:** Problem & Evidence (verify customer ask isn't an existing feature), Out of Scope (cite existing surfaces by URL), User Stories (reference real workflows), Technical Notes & Handoff (know affected URLs/fields)
- **Key content:** All 11 modules with URLs, check-logging workflows, field structures, reports table, cross-module patterns, search-modal preconditions, report data preconditions

**TP_06 Decision Log.md** - Past strategic decisions
- **Why:** PRD should not contradict previous decisions without justification
- **Used in:** Strategic Context, all sections for consistency check
- **Key content:** Past build/buy decisions, strategic bets

### Sometimes Load

**TP_02 Market & Customer Facts.md** - Industry context
- **Why:** Market sizing informs business case
- **Used in:** Problem & Evidence (severity), Success Metrics (benchmarks)

**TP_05 Security, Privacy & Data Guardrails.md** - Security requirements
- **Why:** If feature handles sensitive data
- **Used in:** Technical Notes & Handoff section
- **When:** Only if feature involves data, PHI, PII, or compliance

**EP_01 — Engineering Context.md** - Engineering stack and architecture
- **Why:** Technical Notes & Handoff section requires accurate stack knowledge to ask grounded questions
- **Used in:** Technical Notes & Handoff section — validate approach against real stack, flag integration constraints
- **When:** Any PRD reaching the Technical Notes & Handoff section

---

## PM Principles (Universal Craft)

### Always Load

**PMOP_01_AI_Moat_Framework.md** - 8 defensible AI moats
- **Why:** Every PRD must identify which moats it builds
- **Used in:** Strategic Context, Moat Assessment, User Stories (moat per story)
- **Key content:** Proprietary Data, Tacit Knowledge, HITL, Workflow Embeddedness, Mission-Critical Stakes, Customer Trust, Distribution Leverage, Demonstrable ROI

**Product Principles.md** - Product decision framework
- **Why:** PRD coaching questions should align with VP's product philosophy
- **Used in:**
  - Problem & Evidence: Apply Problem Validation checklist (evidence of workaround, multiple customers, why now)
  - Strategic Context: Apply Strategic Fit and Vision & Differentiation criteria
  - User Stories: Apply "Don't Make Them Use Extra Brain Cells" simplicity lens
  - Out of Scope: Apply "Ruthless Prioritization" — surface tradeoffs explicitly
  - Success Metrics: Apply "Outcomes Over Output" — measure behavior change, not shipping
- **Key content:** 11 principles, decision checklist, pressure-test questions, anti-pattern flags

---

## ProdOS Outputs (Dynamic Context)

### Search at Session Start

**VOC outputs (shared/output/voc/)**
- **Search for:** Feature/topic mentions in syntheses and analyses
- **Extract:** Customer quotes, pain points, JTBD, moat opportunities
- **Purpose:** Ground Problem & Evidence and User Stories in evidence
- **Note:** May not exist for new features

**CTO outputs (output/cto/)**
- **Search for:** Moat validations, feasibility assessments, build vs buy for this feature
- **Extract:** Technical complexity, effort estimates, risks, moat ratings
- **Purpose:** Inform Technical Notes & Handoff, validate feasibility
- **Note:** May not exist (feature not yet reviewed by CTO)

**Strategy outputs (output/strategy/)**
- **Search for:** Strategic decisions about feature or related area
- **Extract:** Strategic context, moat focus, competitive positioning
- **Purpose:** Align PRD with strategic direction

### Always Load

**GOALS.md**
- **Extract:** Current quarter goals, weekly priorities
- **Purpose:** Connect feature to goal achievement in Strategic Context

**templates/prd.md**
- **Purpose:** Section structure reference for 8-section PRD
- **Used in:** Guide section-by-section progression

---

## How Context is Used

### At /prd Start
1. Load TP_01, TP_03, TP_04, TP_06
2. Load PMOP_01
3. Load GOALS.md
4. Search shared/output/voc/ for feature mentions → extract quotes, pains
5. Search output/cto/ for feature assessments → extract complexity, moats
6. Search output/strategy/ for strategic context
7. Load templates/prd.md for section structure
8. Present context summary to user before asking first question

### During Coaching
- Reference loaded context in questions
- Don't ask what context already answers — use it to probe deeper
- If context contradicts user's answer, flag it ("VOC shows X, but you said Y — can you reconcile?")

### At /prd continue
- Don't reload context (session state captures it)
- Use session state to restore Q&A history and progress

---

## Knowledge Loading Best Practices

**At session start:**
1. Read this file (knowledge_context.md)
2. Read MEMORY.md for past coaching patterns
3. Read today's daily log if exists
4. Load required knowledge files
5. Search dynamic outputs for feature mentions
6. Load PRD template for section reference

**During coaching:**
- Reference loaded context in questions
- Don't re-read files unless user requests
- Document which context influenced each section

**At session end:**
- Save session state and WIP PRD
- Append learnings to daily log
- Update MEMORY.md if coaching pattern emerged
