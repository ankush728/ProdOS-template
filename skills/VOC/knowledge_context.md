# VOC Skill - Knowledge Context

This file explains which knowledge bases the VOC skill references and why.

---

## Truth Pack (PSTrax-Specific)

### Always Load

**TP_03 Customer Archetypes & Personas.md** - Customer personas
- **Why:** Need to understand who we're interviewing and their context
- **Used in:**
  - Prep workflow: Generate persona-specific questions
  - Analyze workflow: Validate persona match, tailor insights
  - Synthesis workflow: Segment patterns by persona type
- **Key content:** Career Fire Chief, Volunteer Fire Chief, Battalion Chief, City Manager

**TP_04 Product Scope and Module Map.md** - PSTrax modules and boundaries
- **Why:** Understand what's in scope vs. out of scope
- **Used in:**
  - Prep workflow: Avoid questions about out-of-scope features
  - Analyze workflow: Flag scope creep or new opportunity areas
  - Synthesis workflow: Connect insights to existing modules
- **Key content:** SCBA, Apparatus, Inventory, Controlled Substances, Station Ops

**shared/knowledge/reference/pstrax-module-functionality.md** - Sandbox-validated functional reference (paired companion to TP_04)
- **Why:** Distinguishes customer asks for existing-but-unknown features from genuinely new requests. Without this, a customer saying "I wish I could see all my hose-testing costs" can look like a new feature request when it's already supported (Asset Cost Report with Hose Testing cost field). Sharpens interview questions and analysis tagging.
- **Used in:**
  - Prep workflow: Build feature-aware questions ("you currently use [existing surface] — what would you change?" vs. "is there an unmet need around [topic]?")
  - Analyze workflow: Tag customer mentions as "existing feature feedback" vs. "new feature ask"
  - Synthesis workflow: Distinguish UX/polish patterns (existing-feature critique) from genuine capability gaps
- **Key content:** All 11 modules with URLs, workflows, field structures, reports table, search-modal preconditions, report data preconditions
- **When:** Interview or transcript topic touches a specific module

### Sometimes Load

**TP_01 Company & Positioning.md** - PSTrax value propositions
- **Why:** Understand strategic positioning (defensibility, not efficiency)
- **Used in:**
  - Analyze workflow: Validate if insights align with positioning
  - Synthesis workflow: Frame recommendations in terms of positioning
- **Key content:** "Defensibility beats efficiency", "Survive litigation", "Prove compliance"

**TP_02 Market & Customer Facts.md** - Industry context
- **Why:** Understand fire/EMS market dynamics
- **Used in:**
  - Synthesis workflow: Connect insights to market trends
  - Analyze workflow: Contextualize customer pains in industry landscape

**TP_05 Security, Privacy & Data Guardrails.md** - Security considerations
- **Why:** Identify if customer mentions sensitive data handling
- **Used in:**
  - Analyze workflow: Flag security/compliance requirements
- **When:** Only if interview touches on data, PHI, PII

**TP_07 Competitive Intelligence Registry.md** - Tracked competitors
- **Why:** VOC interviews often surface competitor mentions; knowing tracked competitors prevents missing signals
- **Used in:**
  - Analyze workflow: Flag competitive signals when the customer mentions any tracked competitor
  - Synthesis workflow: Aggregate competitive signals across interviews
- **When:** Synthesis workflow (always), Analyze workflow (when customer mentions competitors)

---

## PM Principles (Universal Craft)

### Always Load

**PMOP_01_AI_Moat_Framework.md** - 8 defensible AI moats
- **Why:** Every VOC workflow must probe for moat opportunities
- **Used in:**
  - Prep workflow: Generate moat-probing questions for relevant dimensions
  - Analyze workflow: Identify which moats customer reveals
  - Synthesis workflow: Aggregate moat patterns across interviews

**Product Principles.md** - Product decision framework
- **Why:** VOC research should validate the criteria used to evaluate product decisions
- **Used in:**
  - Prep workflow: Probe for Problem Validation signals (how they solve it today, workaround cost, why now)
  - Analyze workflow: Tag insights against decision criteria (problem evidence, strategic fit, differentiation)
  - Synthesis workflow: Surface patterns relevant to "Build for Compounding Value" and "Outcomes Over Output"
- **Key content:** Problem Validation checklist, anti-pattern flags, pressure-test questions
- **Key content:**
  1. Proprietary Data Assets
  2. Tacit Knowledge
  3. Human-in-the-Loop (HITL)
  4. Workflow Embeddedness
  5. Customer Trust & Permission
  6. Mission-Critical / High-Stakes Industry
  7. Distribution Leverage
  8. Demonstrable ROI

### Future

**PMOP_02_VOC_Best_Practices.md** (to be created after 10+ VOC cycles)
- **Why:** Capture learnings about what makes great VOC
- **Used in:** All workflows for quality standards, question patterns
- **Status:** Not yet created - will build from MEMORY.md learnings

---

## Reference (Stable Facts)

### Rarely Load

**reference/company.md** - PSTrax company info
- **When:** Interview topic requires company context
- **Example:** If discussing company history, funding, market position

**reference/product.md** - Product overview
- **When:** Interview requires product architecture context
- **Example:** If discussing technical integrations, system architecture

**reference/team.md** - Team structure
- **When:** Need to understand internal stakeholders
- **Example:** Rarely needed for VOC, more for internal planning

---

## How Context is Used by Workflow

### Prep Workflow
1. Load `TP_03 Customer Archetypes & Personas.md` → Identify which persona to interview
2. Load `TP_04 Product Scope and Module Map.md` → Understand product boundaries
3. Load PMOP_01 (Moat Framework) → Generate moat-probing questions
4. Use template from `templates/voc_guide.md`
5. **Output:** Interview guide with standard + moat questions

### Analyze Workflow
1. Load `TP_03 Customer Archetypes & Personas.md` → Validate persona match
2. Load PMOP_01 (Moat Framework) → Identify moat opportunities
3. Sometimes load `TP_01 Company & Positioning.md` → Check alignment
4. Extract JTBD, pains, quotes
5. **Output:** Structured analysis saved to `shared/output/voc/Analysis_*.md`

### Synthesis Workflow
1. Load all transcript analyses from `shared/output/voc/Analysis_*.md`
2. Load PMOP_01 (Moat Framework) → Aggregate moat patterns
3. Sometimes load `TP_02 Market & Customer Facts.md` → Contextualize patterns
4. Identify cross-interview themes
5. **Output:** Pattern analysis saved to `shared/output/voc/Synthesis_*.md`

---

## Knowledge Loading Best Practices

**At workflow start:**
1. Read this file (knowledge_context.md) to know what to load
2. Read MEMORY.md to apply past learnings
3. Read today's daily log if exists (session continuity)
4. Load required knowledge files from Truth Pack / PM Principles
5. Load template if applicable

**During workflow execution:**
- Reference loaded knowledge, don't re-read files
- If you need additional context, explicitly load new files
- Document which files influenced your output

**At workflow end:**
- Save output to appropriate location
- Append learnings to daily log
- Update MEMORY.md if significant pattern emerged
