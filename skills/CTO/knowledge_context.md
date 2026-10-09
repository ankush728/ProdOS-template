# CTO Skill - Knowledge Context

This file explains which knowledge bases the CTO skill references and why.

---

## PM Principles (Universal Craft)

### Always Load

**PMOP_01_AI_Moat_Framework.md** - 8 moat dimensions
- **Why:** Core of moat validation workflow
- **Used in:**
  - Moat Validation: Assess each moat from engineering perspective
  - Build vs Buy: Evaluate moat implications
  - Feasibility: Identify which moats feature builds
- **Key content:** 8 moats with technical validation criteria

### Sometimes Load

**Product Principles.md** - Product decision framework
- **Why:** Technical decisions should align with VP's product philosophy
- **Used in:**
  - Build vs Buy: Apply "Build for Compounding Value" — does building create compounding data/workflow advantage?
  - Feasibility: Apply "Don't Make Them Use Extra Brain Cells" — technical complexity shouldn't leak to UX
  - Moat Validation: Flag anti-patterns (over-engineering, competitor copying, shortcut framing)
- **When:** Major build/buy decisions, architecture choices that affect user experience

---

## Truth Pack (PSTrax-Specific)

### Always Load

**TP_04 Product Scope and Module Map.md** - Product boundaries
- **Why:** Understand what's in vs. out of scope
- **Used in:**
  - Feasibility: Confirm feature aligns with scope
  - Build vs Buy: Validate if integration fits strategy
- **Key content:** SCBA, Apparatus, Inventory, Controlled Substances, Station Ops

**shared/knowledge/reference/pstrax-module-functionality.md** - Sandbox-validated functional reference (paired companion to TP_04)
- **Why:** Technical reviews need to ground "build vs. extend" decisions in actual existing surfaces. Knowing that the Asset Cost Report already exists (and its data preconditions) changes a build-from-scratch recommendation into an extension recommendation.
- **Used in:**
  - Feasibility: Identify existing URLs/workflows the feature would touch or extend
  - Build vs Buy: Validate whether building extends existing surfaces or duplicates them
  - Moat Validation: Confirm the moat is in the actual product, not just the conceptual scope
- **Key content:** All 11 modules with URLs, workflows, field structures, reports table, search-modal preconditions, report data preconditions
- **When:** Any technical review touching a specific module surface

**EP_01 — Engineering Context.md** - Engineering stack and architecture
- **Why:** Technical reviews must be grounded in actual PSTrax tech constraints
- **Used in:**
  - Feasibility: Validate technical approach against real stack (PHP/Laravel, React, MySQL, AWS/K8s)
  - Build vs Buy: Assess integration complexity given existing architecture
  - Moat Validation: Ground "Engineering Reality" assessments in actual capabilities
- **Key content:** Tech stack, architecture diagram, domain model, tenancy, NFRs, integrations

### Sometimes Load

**TP_01 Company & Positioning.md** - Strategic positioning
- **Why:** Validate if technical approach aligns with "defensibility beats efficiency"
- **Used in:**
  - Moat Validation: Ensure moats reinforce positioning
  - Build vs Buy: Favor build if strengthens positioning
- **When:** Complex strategic decisions, build vs buy

**TP_05 Security, Privacy & Data Guardrails.md** - Security requirements
- **Why:** Compliance and audit requirements affect architecture
- **Used in:**
  - Feasibility: Flag security/compliance work
  - Moat Validation: Mission-Critical Stakes moat requirements
- **When:** Feature handles PHI, PII, or mission-critical data

**TP_02 Market & Customer Facts.md** - Industry context
- **Why:** Understand fire/EMS regulations, standards (NFPA)
- **Used in:**
  - Feasibility: Regulatory requirements affect scope
  - Moat Validation: Industry expertise as Tacit Knowledge moat
- **When:** Feature involves industry standards

**TP_07 Competitive Intelligence Registry.md** - Tracked competitors
- **Why:** Build vs. buy decisions should account for what competitors have already built
- **Used in:**
  - Build vs Buy: Assess competitive implications of building vs. using commodity solutions
  - Moat Validation: Replicability test — what can competitors already do?
- **When:** Feature is in a space where tracked competitors are active

---

## VOC Outputs (Customer Context)

### Sometimes Load

**shared/output/voc/Analysis_*.md** - Customer insights
- **Why:** Validate if customer pain has technical solution
- **Used in:**
  - Feasibility: Confirm pain point is solvable
  - Moat Validation: Customer language reveals moat opportunities
- **When:** Validating feature based on VOC research

**shared/output/voc/Synthesis_*.md** - Pattern analysis
- **Why:** Cross-customer patterns strengthen moat validation
- **Used in:**
  - Moat Validation: Multiple customers = stronger signal
  - Build vs Buy: Unique customer needs favor build
- **When:** Strategic features affecting multiple personas

---

## Reference (Stable Facts)

### Rarely Load

**reference/product.md** - Technical stack
- **Why:** Understand current architecture constraints
- **Used in:**
  - Feasibility: Technology choices, integration points
- **When:** Feature requires new technology or major architecture change

**reference/team.md** - Engineering capacity
- **Why:** Effort estimates need to consider team size/skills
- **Used in:**
  - Feasibility: Can current team build this?
- **When:** Large features requiring capacity planning

---

## How Context is Used by Workflow

### Moat Validation Workflow
1. Load PMOP_01 (Moat Framework) -> 8 dimensions to validate
2. Load feature proposal or PRD -> Claims to challenge
3. Sometimes load VOC analysis -> Customer evidence for moat
4. Assess each moat: None / Weak / Moderate / Strong
5. Provide technical reasoning for ratings
6. **Output:** Moat validation saved to `output/cto/MoatValidation_*.md`

### Build vs. Buy Workflow
1. Load PMOP_01 (Moat Framework) -> Evaluate moat implications
2. Load TP_04 (Product Scope) -> Confirm strategic fit
3. Research third-party options -> What exists?
4. Estimate build effort -> Complexity, time, resources
5. Compare moats: Build (stronger moat, slower) vs. Buy (weaker moat, faster)
6. **Output:** Analysis saved to `output/cto/BuildVsBuy_*.md`

### Feasibility Workflow
1. Load TP_04 (Product Scope) -> Validate alignment
2. Sometimes load TP_05 (Security/Privacy) -> Compliance requirements
3. Sometimes load VOC analysis -> Validate customer need
4. Define technical approach -> Architecture, data model, APIs
5. Assess complexity, effort, risks
6. **Output:** Feasibility assessment saved to `output/cto/Feasibility_*.md`

---

## Knowledge Loading Best Practices

**At workflow start:**
1. Read knowledge_context.md (this file) to know what to load
2. Read MEMORY.md for technical learnings
3. Load required Truth Pack / PM Principles files
4. Load VOC context if validating customer-driven feature

**During workflow execution:**
- Reference loaded knowledge, don't re-read files
- If need additional context (security, market facts), load then
- Document which knowledge influenced technical assessment

**At workflow end:**
- Save output to appropriate location
- Append review summary to daily log
- Update MEMORY.md if technical pattern emerged

---

## Notes

- CTO skill focuses on technical validation, not product strategy
- Always challenge moat claims with engineering evidence
- Favor build for moat-critical features, buy for commodities
- Complexity estimates must account for PSTrax tech stack (when known)
