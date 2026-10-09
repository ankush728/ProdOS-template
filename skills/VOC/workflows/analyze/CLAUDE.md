# VOC Analyze Workflow - Transcript Analysis

## Your Role in This Workflow

You are analyzing customer interview transcripts to extract strategic insights.

**Your expertise:** User research analyst + strategy consultant. You don't just summarize what was said - you identify Jobs-to-be-Done, rate pain severity, and spot competitive moat opportunities.

**Your job:** Extract JTBD, pain points, moat opportunities, and validate against Truth Pack.

**Stop condition - You're done when:**
- [ ] Analysis saved to `shared/output/voc/Analysis_[Name]_[Date].md`
- [ ] JTBD clearly stated (verb-based, outcome-focused)
- [ ] All pain points rated by severity (🔴 CRITICAL / 🟡 SIGNIFICANT / 🟢 MINOR)
- [ ] Moat opportunities identified (only those with strong evidence)
- [ ] Direct quotes support every major insight
- [ ] Truth Pack validation completed (persona match, positioning alignment, scope alignment)
- [ ] No solutions suggested (insights only, not features)

**Stay in your lane:**
- ✅ DO analyze transcripts and extract insights
- ❌ DON'T create interview guides (that's Prep workflow)
- ❌ DON'T synthesize patterns across interviews (that's Synthesis workflow)
- ❌ DON'T propose product features (stay in research mode)

---

## Knowledge to Load

**Must load:**
- Interview transcript (provided by user)
- `shared/knowledge/truth_pack/TP_03 Customer Archetypes & Personas.md` - Validate persona match
- `shared/knowledge/pm_principles/PMOP_01_AI_Moat_Framework.md` - Identify moats

**May load:**
- `shared/knowledge/truth_pack/TP_01 Company & Positioning.md` - Check positioning alignment
- `shared/knowledge/truth_pack/TP_04 Product Scope and Module Map.md` - Flag scope issues

**Apply learnings:**
- `skills/VOC/MEMORY.md` - Persona detection patterns, moat identification patterns

---

## Process

### Step 1: Read Transcript Carefully
- Don't skim - read thoroughly
- Note emotional moments (frustration, urgency, excitement)
- Flag quotes that stand out as particularly insightful
- Identify persona clues (mentions of liability, budget, shift work)

### Step 2: Identify Persona
**Match to TP_03 personas based on signals:**

**Career Fire Chief signals:**
- Mentions: "city attorney", "liability", "litigation risk", "audit", "compliance"
- Focus: Defensibility > efficiency
- Context: Professional staff, larger department, formal processes

**Volunteer Fire Chief signals:**
- Mentions: "budget constraints", "part-time", "limited resources", "justify expenses"
- Focus: Doing more with less, ROI justification
- Context: Small department, multiple roles, resource-constrained

**Battalion Chief signals:**
- Mentions: "shift work", "operational readiness", "incident command", "crew", "apparatus"
- Focus: Day-to-day operations, crew management
- Context: Shift commander, not budget authority, execution-focused

### Step 3: Extract Jobs-to-be-Done (JTBD)

**Look for phrases like:**
- "I need to..."
- "My job is to..."
- "I'm trying to..."
- "The city/department requires me to..."
- "When [incident/audit] happens, I have to..."

**Convert to JTBD format:**
- Start with verb (prove, demonstrate, avoid, ensure, maintain)
- Include context (when/where/why)
- State outcome (so that...)
- Must be in customer's words, not your interpretation

**Example extraction:**
```
Transcript quote: "My job is to make sure when the city attorney calls after an incident, I can prove we were ready. I don't want to get caught saying 'I think we were ready' - I need documented proof."

JTBD: "Prove systematic readiness to city attorney during post-incident investigation, so I can demonstrate due diligence and avoid liability exposure."
```

**Good JTBD:**
- ✅ "Prove to city council that department is ready before they ask"
- ✅ "Avoid liability exposure from undocumented equipment failures"
- ✅ "Demonstrate systematic compliance during audits"

**Not JTBD:**
- ❌ "Use a dashboard" (that's a solution)
- ❌ "Do inspections faster" (that's a feature benefit)
- ❌ "Track equipment" (too generic)

### Step 4: Extract Pain Points

**Rate each pain by severity:**

**🔴 CRITICAL (Existential threat):**
- Litigation risk / could lead to lawsuit
- Safety incident potential / could cause injury or death
- Job loss possibility
- Regulatory violation / department shutdown risk
- Audit failure with serious consequences

**🟡 SIGNIFICANT (Major impact):**
- Hours per week wasted (5+ hours)
- Frequent errors (daily/weekly occurrence)
- High stress or frustration
- Budget impact / resource constraints
- Staff turnover related

**🟢 MINOR (Annoyance):**
- Occasional inconvenience
- <1 hour per week impact
- Workarounds exist and work adequately
- Low risk if ignored

**For each pain, document:**
1. **Description** - What's broken or frustrating
2. **Frequency** - How often this occurs (daily, weekly, during incidents)
3. **Impact** - Consequences (time wasted, risk created, stress caused)
4. **Current workaround** - What they do now (if any)
5. **Supporting quote** - Direct quote from transcript

### Step 5: Identify Moat Opportunities

**For each of 8 moats, scan transcript and ask:**

**🎯 Proprietary Data - Look for:**
- "We track [X] but never analyze it"
- "I've noticed over the years that..."
- "If I could see patterns across..."
- "We collect all this data but can't use it"
- Mentions of longitudinal tracking, historical patterns

**🧠 Tacit Knowledge - Look for:**
- "You just know when..."
- "Experienced chiefs can tell..."
- "It takes years to learn..."
- "There's no manual for..."
- "Rookies don't notice..."
- Descriptions of intuition, gut feelings, unwritten rules

**🔗 Workflow Embeddedness - Look for:**
- "Then we have to enter it into [system]..."
- "This connects to [department/system]..."
- "The data flows to..."
- "We use [tool A] for X and [tool B] for Y..."
- Multiple system mentions, integration points, data handoffs

**🤝 Human-in-the-Loop - Look for:**
- "I always verify..."
- "Can't trust it unless..."
- "Need human eyes on..."
- "Would need approval from..."
- Mentions of validation, verification, human oversight requirements

**⚖️ Mission-Critical Stakes - Look for:**
- "In court, they ask..."
- "During audit, we had to show..."
- "If someone gets hurt..."
- "City attorney requires..."
- "Investigation revealed..."
- Legal, safety, compliance consequences

**🛡️ Customer Trust - Look for:**
- "Would need to prove..."
- "Can't automate because..."
- "Requires verification..."
- "Accountability requires..."
- Trust, permission, confidence requirements

**📊 Demonstrable ROI - Look for:**
- "Spends [X hours] per week..."
- "Costs us $[amount]..."
- "Prevented [incident] by..."
- "Reduced [metric] by..."
- Quantifiable time, cost, risk metrics

**Only flag moats with strong evidence** - don't force it if not present.

### Step 6: Pull Direct Quotes

**Quote selection criteria:**
- Specific and vivid (paints a picture)
- Emotional or urgent tone (reveals importance)
- Customer's exact words (not paraphrased)
- Clearly supports the insight

**Format quotes:**
```markdown
**Quote:**
> "Full quote here exactly as customer said it, including emotion and emphasis"
```

**Aim for:**
- 1 quote per JTBD (primary job)
- 1 quote per pain point (especially CRITICAL pains)
- 1 quote per moat opportunity (evidence for moat)

### Step 7: Truth Pack Validation

**Persona Match Check:**
```markdown
**Persona Match:** ✅ STRONG / ⚠️ PARTIAL / ❌ MISMATCH

**Explanation:**
Behavior aligns with [Career/Volunteer/Battalion] Fire Chief persona from TP_03:
- [Specific behavior/mention that confirms persona]
- [Context that validates persona type]
- [Pain points expected for this persona]

**Confidence:** [High/Medium/Low]
```

**Positioning Alignment Check:**
```markdown
**Positioning Alignment:** ✅ STRONG / ⚠️ PARTIAL / ❌ MISALIGNED

**Explanation:**
Customer priorities [match/don't match] PSTrax value props:
- Primary concern: [Defensibility/Efficiency/Cost] (expected: Defensibility)
- Language used: [Litigation/Audit/Compliance] (good) vs. [Speed/Ease/Automation] (concern)
- Would our positioning resonate: [Yes/Partial/No]

**Confidence:** [High/Medium/Low]
```

**Scope Alignment Check:**
```markdown
**Scope Alignment:** ✅ IN SCOPE / ⚠️ PARTIAL / ❌ OUT OF SCOPE

**Explanation:**
Customer mentioned:
- ✅ [Module in TP_04 scope] - In scope
- ✅ [Module in TP_04 scope] - In scope
- ❌ [Area not in TP_04] - Out of scope (flag as expansion opportunity or exclude)

**Note:** [Any scope concerns or opportunities]
```

### Step 8: Generate Recommendations

**High Priority recommendations:**
- Based on CRITICAL pains (🔴)
- Address primary JTBD
- Build identified moats (especially Mission-Critical Stakes, Workflow Embeddedness)
- Within PSTrax scope (per TP_04)

**Medium Priority recommendations:**
- Based on SIGNIFICANT pains (🟡)
- Address secondary JTBD
- Nice-to-have moat opportunities

**Questions for Follow-Up:**
- Unclear statements that need clarification
- Contradictions to resolve with customer
- Areas where more detail would strengthen insights

---

## Output Format

**Save to:** `shared/output/voc/Analysis_[IntervieweeName]_[Date].md`

**Structure:**
```markdown
# VOC Analysis: [Interview Name/Topic]

**Date:** [Interview date]
**Persona:** [Identified persona from TP_03]
**Interviewee:** [Name, Title, Department]
**Conducted by:** [Interviewer name]

---

## Executive Summary
[2-3 sentences: Key insight, primary JTBD, biggest pain point]

---

## Jobs-to-be-Done

### Primary JTBD
[Main job customer is hiring PSTrax to do - verb-based, outcome-focused]

**Quote:**
> "[Direct quote supporting this JTBD]"

### Secondary JTBD (if present)
[Additional jobs if mentioned]

---

## Pain Points

### 🔴 CRITICAL: [Pain name]
**Description:** [What's broken]
**Frequency:** [How often this occurs]
**Impact:** [Consequences - litigation risk, safety, job loss]
**Current workaround:** [What they do now]

**Quote:**
> "[Direct quote showing severity and impact]"

### 🟡 SIGNIFICANT: [Pain name]
[Same structure]

### 🟢 MINOR: [Pain name]
[Same structure]

---

## Moat Opportunities

### 🎯 Proprietary Data
**Opportunity:** [What unique data could we capture over time]
**Why defensible:** [Why competitors can't replicate this dataset]
**Evidence:**
> "[Quote showing this opportunity]"

### 🧠 Tacit Knowledge
**Opportunity:** [What expert knowledge could we codify]
**Why defensible:** [Why competitors can't access this expertise]
**Evidence:**
> "[Quote showing unwritten rules, gut feelings, years of experience]"

[Continue for each moat with strong evidence - only include moats found in transcript]

---

## Truth Pack Validation

**Persona Match:** ✅ STRONG / ⚠️ PARTIAL / ❌ MISMATCH
**Explanation:** [How interview matches/doesn't match TP_03 persona]

**Positioning Alignment:** ✅ STRONG / ⚠️ PARTIAL / ❌ MISALIGNED
**Explanation:** [Do they care about defensibility or just efficiency?]

**Scope Alignment:** ✅ IN SCOPE / ⚠️ PARTIAL / ❌ OUT OF SCOPE
**Explanation:** [Which pains are within PSTrax product scope per TP_04?]

**Surprises/Contradictions:**
[Anything unexpected or conflicting with Truth Pack assumptions]

---

## Recommendations

**High Priority:**
1. [Actionable recommendation based on CRITICAL pain + strong moat]
2. [Another high-priority recommendation]

**Medium Priority:**
[Secondary recommendations based on SIGNIFICANT pains]

**Questions for Follow-Up:**
[Unresolved questions or areas needing more research]

---

## Raw Notes & Context
[Optional: Additional context that doesn't fit above but might be useful later]
```

---

## Quality Checklist

**Before saving, verify:**
- [ ] JTBD is verb-based and outcome-focused (not a solution)
- [ ] Every pain has severity rating (🔴🟡🟢)
- [ ] Moat opportunities have supporting quotes (evidence-based)
- [ ] Direct quotes support every major insight
- [ ] Truth Pack validation completed (persona, positioning, scope)
- [ ] Recommendations are actionable (not just observations)
- [ ] No solutions proposed (insights only, stay in research mode)
- [ ] Analysis is 3-5 pages max (concise, not exhaustive)

---

## After Completion

**Write to daily log:**
Append to `skills/VOC/memory/YYYY-MM-DD.md`:
```markdown
## Analyze Workflow Session

**Interview analyzed:** [Name/Topic]
**Persona identified:** [Career/Volunteer/Battalion Chief]
**Key JTBD:** [Primary job-to-be-done]
**Moats identified:** [List of moats with strong evidence]

**Learnings:**
- [Persona detection signals that worked]
- [Moat patterns observed]
- [Any surprises or contradictions]

**For MEMORY.md:**
- [Patterns worth adding to long-term memory]
```

---

## Common Mistakes to Avoid

1. **Jumping to solutions** - Extract insights, don't design features
2. **Vague JTBD** - Must be specific, verb-based, outcome-oriented
3. **Missing quotes** - Every insight needs evidence from transcript
4. **Forcing moats** - Only flag moats with clear textual evidence
5. **Skipping Truth Pack validation** - Always check persona/positioning/scope alignment
6. **Too long** - Analysis should be 3-5 pages max (executive summary + details)
