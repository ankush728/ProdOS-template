# PowerPoint Skill - Context Loading Guide

This file defines what context to load for presentations.

---

## Core Context (Always Load)

Every `/pptx` invocation loads these files regardless of topic:

### 1. Strategy Moat Portfolio
- **Path:** `output/strategy/MoatPortfolio_*.md` (most recent by date)
- **Extract:** Moat ratings by dimension (8 moats with ✅✅ / ✅ / ⚠️ / ❌)
- **Fallback:** If no file exists, note "Strategy moat portfolio not available yet"

### 2. GOALS.md
- **Path:** `GOALS.md`
- **Extract:** Current quarter objectives, progress percentage, weekly priorities
- **Always available**

### 3. VOC Outputs
- **Path:** `shared/output/voc/`
- **Extract:** File count, latest synthesis (`Synthesis_*.md` most recent)
- **Fallback:** If no files, note "No VOC outputs yet"

### 4. CTO Outputs
- **Path:** `output/cto/`
- **Extract:** File count, recent moat validations (`MoatValidation_*.md`)
- **Fallback:** If no files, note "No CTO outputs yet"

### 5. TP_01 — Positioning
- **Path:** `shared/knowledge/truth_pack/TP_01 Company & Positioning.md`
- **Extract:** Core positioning statement, value propositions
- **Always available**

### 6. TP_01A — Strategy
- **Path:** `shared/knowledge/truth_pack/TP_01A Company Strategy.md`
- **Extract:** Strategy pillars (S1/S2/S3), strategic framework
- **Always available**

### 7. TP_02 — Market Facts
- **Path:** `shared/knowledge/truth_pack/TP_02 Market & Customer Facts.md`
- **Extract:** Market sizing, customer segments, industry dynamics
- **Always available**

### 8. TP_03 — Personas
- **Path:** `shared/knowledge/truth_pack/TP_03 Customer Archetypes & Personas.md`
- **Extract:** Career Chief, Volunteer Chief, Battalion Chief profiles
- **Always available**

### 9. Product Principles
- **Path:** `shared/knowledge/pm_principles/Product Principles.md`
- **Extract:** Core decision criteria, 11 principles, pressure-test questions, anti-pattern flags
- **Use for:** Pressure-testing slide claims against product philosophy; flagging if presentation framing conflicts with principles

---

## Situational Context (Load Based on Topic)

### Product-Surface Presentations (feature pitch, roadmap, module deep-dive)

**Module functionality reference**
- **Path:** `shared/knowledge/reference/pstrax-module-functionality.md`
- **When:** Topic involves a specific PSTrax module, feature pitch, roadmap slide, capability claim ("PSTrax tracks X"), or competitive comparison slide
- **Extract:** Module URLs, workflows, field structures, reports per module, cross-module patterns
- **Why:** Slide claims like "PSTrax tracks blood product temperature" or "the Procurement module supports a distributor catalog" must be grounded against the actual product surface — not aspirational scope. Companion to TP_04.

### AI Strategy Presentations (investor topics involving AI)

**AI_02 — AI Value Narratives**
- **Path:** `shared/knowledge/pm_principles/AI_02_SECTION_II_AI_NARRATIVES.md`
- **When:** Presentation topic involves AI strategy, AI narrative for the investor, or positioning PSTrax's AI moats to investors
- **Extract:** AI positioning archetypes (Stored Data, Tacit Knowledge, HITL, Workflow Embeddedness, Trust, Distribution, ROI) with example language

**AI_01 — Importance of AI (Investment Context)**
- **Path:** `shared/knowledge/pm_principles/AI_01_SECTION_I_IMPORTANCE_OF_AI.md`
- **When:** Presentation needs to frame AI investment urgency for the investor — why AI matters now
- **Extract:** PE investment context, incumbent vs. AI-native dynamics, SaaS disruption framing

---

## Additional Context (On User Request)

After presenting core context, ask user if they need additional files loaded:

### PRDs
- **Path:** `output/prds/PRD_*_Final_*.md` or `PRD_*_WIP.md`
- **When:** User mentions a specific feature or says "load the PRD"
- **Extract:** Problem statement, executive summary, user stories, success metrics

### Specific VOC Analyses
- **Path:** `shared/output/voc/Analysis_*.md`
- **When:** User wants specific customer evidence
- **Extract:** Customer quotes, pain points, JTBD

### Strategy Artifacts
- **Path:** `output/strategy/*.md`
- **When:** User wants specific strategic analysis
- **Extract:** Strategic decisions, moat analysis, recommendations

### Any User-Specified File
- User can point to any file in the repo
- Or paste content directly

---

## Context Resurfacing (Mid-Creation)

During presentation creation, user may request context at any time:

| User Says | Action |
|-----------|--------|
| "Show me the VOC quotes" | Re-read shared/output/voc/ files, present relevant quotes |
| "What did CTO say about [feature]?" | Re-read output/cto/ files, present assessment |
| "Pull up the moat portfolio" | Re-read Strategy moat portfolio, present ratings |
| "What are the personas?" | Re-present TP_03 summary |
| "Show me the PRD for [feature]" | Read specific PRD, present key sections |

No formal command needed — natural language triggers resurfacing.

---

## Context Presentation Best Practices

**Efficiency:**
- Load only what's relevant (but always load core 8 files)
- Use most recent files when multiple versions exist
- Extract key information, don't dump entire file contents

**Presentation format:**
- Summarize context concisely (total summary under 500 words)
- Highlight key numbers (moat ratings, percentages, counts)
- Include specific evidence (quotes, assessments, decisions)
- Format for readability (bullets, clear structure)

**Fallback:**
- If file missing, note absence gracefully ("Strategy moat portfolio not available yet")
- Never fail or crash on missing file — continue with available context
- On `/pptx resume`, reload fresh data (files may have been updated since pause)

---

## Notes

- Context loading should take <30 seconds
- Present context summary, not raw file dumps
- Let Claude determine how to use context for slides (don't prescribe structure)
- If files missing, gracefully handle and continue
