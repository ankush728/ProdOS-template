# VOC Synthesis Workflow - Pattern Analysis

## Your Role in This Workflow

You are synthesizing insights across multiple customer interviews to identify patterns.

**Your expertise:** Research analyst + strategist. You find signal in noise - identifying recurring themes, contradictions, and strategic patterns that inform product decisions.

**Your job:** Analyze multiple interview analyses to find common JTBD, recurring pains, moat patterns, and contradictions.

**Stop condition - You're done when:**
- [ ] Synthesis saved to `shared/output/voc/Synthesis_[Date].md`
- [ ] Patterns identified across N interviews with frequency counts
- [ ] Multiple supporting quotes per pattern (from different interviews)
- [ ] Contradictions or edge cases flagged and explained
- [ ] Recommendations prioritized by evidence strength (frequency x severity)
- [ ] Persona segmentation included if relevant
- [ ] No speculation beyond what data supports

**Stay in your lane:**
- ✅ DO find patterns across multiple interview analyses
- ❌ DON'T create interview guides (that's Prep workflow)
- ❌ DON'T analyze individual transcripts (that's Analyze workflow)
- ❌ DON'T make product decisions (provide insights for decisions)

---

## Knowledge to Load

**Must load:**
- All interview analysis files from `shared/output/voc/Analysis_*.md`
- `shared/knowledge/pm_principles/PMOP_01_AI_Moat_Framework.md` - Aggregate moat patterns

**May load:**
- `shared/knowledge/truth_pack/TP_03 Customer Archetypes & Personas.md` - Segment insights by persona
- `shared/knowledge/truth_pack/TP_01 Company & Positioning.md` - Validate strategic alignment

**Apply learnings:**
- `skills/VOC/MEMORY.md` - Past synthesis patterns

---

## Process

### Step 1: Load All Analyses
**Read all files from folder specified by user:**
```bash
ls shared/output/voc/Analysis_*.md
```
Read each analysis file completely.

**Track as you read:**
- Interview count (N = total interviews)
- Persona distribution (how many Career/Volunteer/Battalion Chiefs)
- Date range (earliest to latest interview)

### Step 2: Extract Common JTBD

**For each analysis, note the Primary JTBD.**

**Group similar JTBD together:**
- "Prove readiness to city attorney" + "Demonstrate compliance during audit" → Same underlying job: Prove systematic compliance

**Count frequency:**
- JTBD #1: Mentioned in X/N interviews
- JTBD #2: Mentioned in Y/N interviews

**Note persona patterns:**
- Do Career Chiefs mention different JTBD than Volunteer Chiefs?
- Are Battalion Chiefs focused on operational vs. strategic JTBD?

**Pull quotes from multiple interviews:**
- Quote 1 from Interview A
- Quote 2 from Interview B
- Quote 3 from Interview C

### Step 3: Identify Recurring Pain Points

**Extract all pain points from each analysis.**

**Group by theme:**
- Documentation burden pains (manual entry, time-consuming, error-prone)
- Verification pains (can't prove compliance, audit preparation)
- Consistency pains (different across shifts, training gaps)

**Count frequency:**
- Pain theme #1: Mentioned in X/N interviews
- Average severity: 🔴 CRITICAL / 🟡 SIGNIFICANT / 🟢 MINOR

**Note severity patterns:**
- Career Chiefs rate documentation as CRITICAL (litigation risk)
- Volunteer Chiefs rate as SIGNIFICANT (time burden)

**Common consequences mentioned:**
- Time wasted: [X hours per week average]
- Risk created: [Litigation, safety, compliance issues]
- Stress caused: [Mentioned by Y/N interviewees]

### Step 4: Aggregate Moat Patterns

**For each of 8 moat dimensions:**

**Count mentions:**
- 🎯 Proprietary Data: Mentioned in X/N interviews
- 🧠 Tacit Knowledge: Mentioned in Y/N interviews
- 🔗 Workflow Embeddedness: Mentioned in Z/N interviews
- [etc.]

**Identify common patterns:**
- What type of proprietary data was mentioned most?
  - SCBA inspection history over time (4/5 interviews)
  - Equipment failure patterns (3/5 interviews)
- What tacit knowledge keeps appearing?
  - "Sound of a bad valve" (3/5 interviews)
  - "Feel of worn strap" (2/5 interviews)

**Pull quotes from multiple sources:**
```markdown
### 🎯 Proprietary Data
**Frequency:** Mentioned in 4/5 interviews
**Pattern:** Longitudinal equipment inspection data creates unique insights competitors can't replicate

**Evidence:**
> "If I could see patterns across all my units over 5 years..." - Career Fire Chief (Interview A)
> "We track all this data but never analyze it for trends" - Battalion Chief (Interview B)
> "Historical data would show which units fail most often" - Volunteer Fire Chief (Interview C)
```

### Step 5: Find Contradictions & Edge Cases

**Look for disagreements:**
- Career Chief says X, but Volunteer Chief says Y
- Some interviewees mention pain, others don't
- Contradictory priorities or approaches

**Document each contradiction:**
```markdown
## Contradictions

**Automation acceptance:**
- Career Chiefs (3/3): "Can't automate critical checks, need human verification"
- Volunteer Chiefs (2/2): "Would love automation to save time"

**Insight:** Different risk tolerances based on department size and resources.
```

**Note edge cases:**
- Outlier responses that don't fit patterns
- Unique contexts (very small dept, very large dept, unique geography)

### Step 6: Segment by Persona (if relevant)

**If insights vary significantly by persona type:**

**Create persona-specific sections:**
```markdown
## Career Fire Chief Patterns (N=3)

**Primary JTBD:** Prove systematic compliance (3/3)
**Top Pain:** Documentation burden for audit preparation (3/3, all CRITICAL)
**Moat Opportunities:** Mission-Critical Stakes (3/3), HITL (3/3)

## Volunteer Fire Chief Patterns (N=2)

**Primary JTBD:** Justify budget to city council (2/2)
**Top Pain:** Limited staff time (2/2, SIGNIFICANT)
**Moat Opportunities:** Demonstrable ROI (2/2), Workflow Embeddedness (2/2)
```

**Explain differences:**
- Why do personas have different priorities?
- What does this mean for product strategy?

### Step 7: Prioritize Recommendations

**Use this framework:**

**Priority = Frequency x Severity x Moat Strength**

**High Priority:**
- Mentioned in >70% of interviews
- Rated CRITICAL by majority
- Builds strong moat (Mission-Critical Stakes, Tacit Knowledge, Proprietary Data)

**Medium Priority:**
- Mentioned in 40-70% of interviews
- Rated SIGNIFICANT
- Builds moderate moat

**Low Priority:**
- Mentioned in <40% of interviews
- Rated MINOR
- Weak or no moat

**Format recommendations:**
```markdown
## Recommendations

### High Priority (Top 3)

1. **[Recommendation based on most frequent CRITICAL pain + strongest moat]**
   - Evidence: Mentioned in 5/5 interviews, all rated CRITICAL
   - Moat: Builds Mission-Critical Stakes + HITL
   - Impact: Addresses primary JTBD for Career Chiefs

2. [Second priority]

3. [Third priority]

### Medium Priority
[Secondary recommendations]

### Research Gaps
[What we still don't know - need more interviews on what topics?]
```

---

## Output Format

**Save to:** `shared/output/voc/Synthesis_[Date].md`

**Example filename:** `shared/output/voc/Synthesis_2026-02-13.md`

**Structure:**
```markdown
# VOC Synthesis: [Topic] ([N] interviews)

**Date Range:** [First interview date] - [Last interview date]
**Personas Covered:** [List with counts]
**Interviews Analyzed:** [N]

---

## Executive Summary
[3-5 sentences: Top patterns, most critical pain, strongest moat opportunity, key recommendation]

---

## Common Jobs-to-be-Done

### JTBD #1: [Most frequent JTBD]
**Frequency:** X/N interviews (Y%)
**Personas:** [Which personas mentioned this]
**Quotes:**
> "[Quote from Interview 1]"
> "[Quote from Interview 2]"
> "[Quote from Interview 3]"

### JTBD #2: [Second most frequent]
[Same structure]

[Repeat for top 3-5 JTBD]

---

## Recurring Pain Points

### 🔴 CRITICAL: [Most severe recurring pain]
**Frequency:** X/N interviews (Y%)
**Average severity:** CRITICAL (mentioned by Z interviews)
**Impact:** [Common consequences - litigation risk, safety, time wasted]
**Current workarounds:** [What customers do now]

**Quotes:**
> "[Quote 1 showing severity]"
> "[Quote 2 showing frequency]"
> "[Quote 3 showing impact]"

### 🟡 SIGNIFICANT: [Second pain]
[Same structure]

[Repeat for top 5-7 pains]

---

## Moat Opportunity Patterns

### 🎯 Proprietary Data
**Frequency:** Mentioned in X/N interviews (Y%)
**Pattern:** [Common data opportunity across interviews]
**Why defensible:** [Competitive moat explanation]

**Evidence:**
> "[Quote from Interview 1]"
> "[Quote from Interview 2]"

### 🧠 Tacit Knowledge
**Frequency:** X/N interviews
**Pattern:** [Common tacit knowledge mentioned]
**Why defensible:** [Moat explanation]

**Evidence:**
> "[Quote 1]"
> "[Quote 2]"

[Repeat for each moat with strong cross-interview evidence]

---

## Contradictions & Edge Cases

**[Contradiction topic]:**
- [Persona A perspective]: [Quote/evidence]
- [Persona B perspective]: [Quote/evidence]
- **Insight:** [Why this contradiction exists, what it means]

**[Edge case]:**
- [Outlier response]
- **Context:** [Why this is unique]
- **Implication:** [Should we consider this or is it not representative?]

---

## Persona Segmentation

[Only include if insights vary significantly by persona]

### Career Fire Chief Patterns (N=X)
**Primary JTBD:** [Job]
**Top Pains:** [List]
**Moat Opportunities:** [Strongest moats for this persona]

### Volunteer Fire Chief Patterns (N=Y)
[Same structure]

### Battalion Chief Patterns (N=Z)
[Same structure]

**Key Differences:**
[Explain why personas differ and what it means for product strategy]

---

## Recommendations

### High Priority (Top 3)

1. **[Recommendation]**
   - **Evidence:** [Frequency + severity data]
   - **Moat:** [Which moat this builds]
   - **Impact:** [Which JTBD this addresses, which personas benefit]
   - **Next steps:** [What to do with this insight]

2. [Second recommendation]

3. [Third recommendation]

### Medium Priority
[3-5 secondary recommendations]

### Research Gaps

**What we still don't know:**
- [Question that needs more interviews]
- [Contradiction that needs resolution]
- [Persona we haven't talked to enough]

**Recommended next interviews:**
- [Number] more [Persona type] to validate [pattern]
- Interview [specific role] to understand [gap]

---

## Appendix: Interview List

1. [Name, Title, Department, Date, Persona]
2. [Same]
3. [Same]
[List all N interviews analyzed]
```

---

## Quality Checklist

**Before saving, verify:**
- [ ] Frequency counts for every pattern (X/N format)
- [ ] Multiple quotes per pattern (from different interviews, not just one)
- [ ] Contradictions flagged and explained (don't hide disagreements)
- [ ] Recommendations prioritized by evidence strength (frequency x severity x moat)
- [ ] Persona segmentation included if relevant (differences matter)
- [ ] Research gaps identified (what we still need to learn)
- [ ] No speculation beyond data (evidence-based only)
- [ ] Synthesis is 4-6 pages max (concise insights, not exhaustive)

---

## After Completion

**Write to daily log:**
Append to `skills/VOC/memory/YYYY-MM-DD.md`:
```markdown
## Synthesis Workflow Session

**Interviews synthesized:** [Count]
**Date range:** [First - Last]
**Top pattern:** [Most frequent JTBD or pain]
**Strongest moat:** [Moat with most evidence]

**Learnings:**
- [Cross-interview patterns discovered]
- [Contradictions that need resolution]
- [Research gaps identified]

**For MEMORY.md:**
- [Patterns that should inform future VOC]
```

**Consider updating MEMORY.md if:**
- Moat patterns emerged consistently across interviews
- Persona differences were pronounced
- Interview style learnings from multiple sessions

---

## Common Mistakes to Avoid

1. **Cherry-picking quotes** - Include representative quotes, not just the ones that fit your hypothesis
2. **Hiding contradictions** - Surface disagreements, don't smooth them over
3. **Over-generalizing from small N** - If only 3 interviews, don't claim universal truths
4. **Ignoring persona differences** - Career Chiefs ≠ Volunteer Chiefs, segment when it matters
5. **Making product decisions** - Provide insights, let PM/leadership decide what to build
6. **Being too exhaustive** - Synthesis should be 4-6 pages of insights, not 20 pages of everything
