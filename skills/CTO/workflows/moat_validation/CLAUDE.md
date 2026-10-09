# CTO Moat Validation Workflow

## Your Role in This Workflow

You are validating moat claims from an engineering perspective.

**Your job:** Take a feature proposal or PRD and challenge each claimed moat with technical reasoning. Rate moat strength (None / Weak / Moderate / Strong) and explain how to strengthen weak moats.

**Stop condition - You're done when:**
- [ ] Each of 8 moat dimensions assessed
- [ ] Technical reasoning provided for each rating
- [ ] Weak moats have strengthening strategies
- [ ] Overall verdict clear (Build? Strengthen first? Reconsider?)
- [ ] Saved to output/cto/MoatValidation_[Feature]_[Date].md

**Stay in your lane:**
- DO validate technical defensibility of moats
- DON'T make product decisions (provide technical input for PM to decide)
- DON'T assess market positioning (that's Strategy skill)

---

## Knowledge to Load

**Must load:**
- Feature proposal or PRD (provided by user)
- `shared/knowledge/pm_principles/PMOP_01_AI_Moat_Framework.md` - 8 moats

**May load:**
- `shared/knowledge/truth_pack/TP_04 Product Scope and Module Map.md` - Technical boundaries
- `shared/knowledge/pm_principles/Product Principles.md` - PM decision framework (use to frame strengthening recommendations in terms PM will act on)
- VOC analysis if feature is customer-driven
- `skills/CTO/MEMORY.md` - Past technical patterns

---

## Process

### Step 1: Understand the Feature
**Read the proposal and identify:**
- What is being built (capability, not just UI)
- Why it matters (customer pain, strategic goal)
- What moats are claimed (explicit or implicit)

### Step 2: Load Moat Framework
**Read PMOP_01 to understand 8 moat dimensions:**
1. Proprietary Data Assets
2. Tacit Knowledge
3. Human-in-the-Loop (HITL)
4. Workflow Embeddedness
5. Customer Trust & Permission
6. Mission-Critical / High-Stakes
7. Distribution Leverage
8. Demonstrable ROI

### Step 3: Assess Each Moat (Technical Lens)

For each moat, ask technical validation questions:

**Proprietary Data:**
- What unique data does this capture?
- Does data compound over time (network effect)?
- How long would competitor need to replicate dataset?
- Is data legally defensible (not scraped)?
- Technical infrastructure: Collection pipeline? Storage? Analysis?

**Rating guide:**
- Strong: Unique dataset, years to replicate, network effects, legal
- Moderate: Valuable data, months to replicate, some uniqueness
- Weak: Data available elsewhere, weeks to replicate
- None: No unique data captured

---

**Tacit Knowledge:**
- What expert judgment is codified?
- Training data: How is expertise captured? Pipeline?
- Model: How does it learn from experts?
- Is knowledge scarce (few people have it)?
- Could competitor hire experts or access public knowledge?

**Rating guide:**
- Strong: Scarce expertise, active learning pipeline, proprietary training data
- Moderate: Some expertise codified, manual knowledge capture
- Weak: Knowledge available publicly or easily hired
- None: No expertise captured

---

**Human-in-the-Loop:**
- Does human validation create feedback loops?
- Do corrections improve AI over time?
- Training data pipeline: Is feedback captured, labeled, retrained?
- Is there a path from HITL -> automation?

**Rating guide:**
- Strong: Active feedback loop, retraining pipeline, improving over time
- Moderate: Human validation present, feedback captured but not retrained
- Weak: Human override exists but no learning loop
- None: No human validation, pure automation

---

**Workflow Embeddedness:**
- Integration depth: API call vs. core workflow dependency?
- Switching cost: What breaks if they remove this?
- Data flow: Upstream/downstream dependencies?
- How many touchpoints in daily operations?

**Rating guide:**
- Strong: Core workflow dependency, high switching cost, multiple integrations
- Moderate: Some integrations, moderate switching cost
- Weak: Standalone tool, low switching cost
- None: No integration, easy to replace

---

**Customer Trust:**
- What trust is required to use/automate this?
- Explainability: Can system show its reasoning?
- Human override: Can user reject AI decision?
- Gradual automation: Path from suggest -> automate?

**Rating guide:**
- Strong: Earns automation permission through transparency + gradual trust building
- Moderate: Some trust required, explainability present
- Weak: Black box, no explanation, full automation from day 1
- None: No trust required (commodity function)

---

**Mission-Critical Stakes:**
- Consequences of failure: Litigation? Safety? Compliance?
- Audit trail: Immutable? Timestamped? Attributed?
- Regulatory complexity: Barrier to entry?
- Domain expertise required: How much?

**Rating guide:**
- Strong: Life-safety or litigation risk, immutable audit trail, high domain expertise
- Moderate: Compliance requirement, basic audit trail
- Weak: Low stakes, minimal domain expertise
- None: No special stakes

---

**Distribution Leverage:**
- Unique distribution access: Partnerships? Installed base?
- Ecosystem advantage: Integrations competitors lack?
- Network effects: More users = more value?

**Rating guide:**
- Strong: Unique distribution, large installed base, strong network effects
- Moderate: Some partnerships, growing installed base
- Weak: Standard distribution, no ecosystem
- None: No distribution advantage

---

**Demonstrable ROI:**
- Measurable value: Time saved? Risk reduced? Cost avoided?
- Quantifiable: Can customer prove ROI to CFO/City Council?
- Time to value: Days? Weeks? Months?
- Proof mechanism: Reports? Metrics? Case studies?

**Rating guide:**
- Strong: Clear quantifiable ROI, fast time to value, easy to prove
- Moderate: Some measurable value, moderate time to value
- Weak: Vague benefits, long time to value
- None: No measurable ROI

---

### Step 4: Provide Technical Reasoning

**For each moat rating, explain:**
- Engineering reality (what actually exists vs. claimed)
- Why rated this way (technical evidence)
- What would strengthen it (specific technical capabilities)

**Example:**
```markdown
### Proprietary Data: MODERATE

**Claim:** "Longitudinal inspection data creates unique insights"

**Engineering reality:**
- Data accumulates with every inspection (network effect exists)
- Competitors would need months-years to replicate dataset
- No analysis pipeline yet (data exists but not leveraged)
- No legal moat (data schema could be copied)

**Verdict:** Moderate moat. Data is valuable but not yet weaponized.

**To strengthen to STRONG:**
- Build analysis pipeline (trend detection, failure prediction)
- Add proprietary data enrichment (e.g., failure correlations)
- Create feedback loop (predictions -> outcomes -> retraining)
- Time investment: +4 weeks engineering
```

### Step 5: Overall Assessment

**Summarize:**
- Moats with STRONG evidence
- Moats with MODERATE evidence
- Moats with WEAK/NO evidence
- Overall moat strength: Weak / Moderate / Strong / Very Strong

### Step 6: Replicability Test

**Ask:**
- Could well-funded competitor replicate in 6 months? Yes/No/Partially
- Timeline to replicate: X months to Y years
- What makes this defensible: [Key technical factors]
- What competitor would need: [Resources, data, expertise, trust]

### Step 7: Strategic Recommendation

**Final verdict:**
- **BUILD** - Strong moats justify investment
- **STRENGTHEN FIRST** - Weak moats, improve before building
- **RECONSIDER** - No defensible moats, high replicability risk

**Reasoning:**
- Technical complexity vs. moat strength tradeoff
- Build effort vs. competitive advantage gained
- Risk of building commodity that competitors easily match

---

## Output Format

**Save to:** `output/cto/MoatValidation_[Feature]_[Date].md`

**Use template:** `templates/cto_moat_validation.md`

**Structure:**
1. Feature Overview (what, why, for whom)
2. Moat Assessment (8 dimensions, each rated with reasoning)
3. Overall Moat Assessment (summary, replicability test)
4. Recommendations to Strengthen (prioritized)
5. Competitive Analysis (what competitor needs to replicate)
6. Build vs. Buy Implications (if applicable)
7. Final Verdict (Build / Strengthen / Reconsider)

---

## Quality Checklist

**Before saving, verify:**
- [ ] All 8 moats assessed (not just claimed ones)
- [ ] Each rating has technical reasoning (not just opinion)
- [ ] Weak moats have specific strengthening strategies
- [ ] Replicability test completed (timeline to replicate)
- [ ] Final verdict clear with rationale
- [ ] No product decisions made (technical input only)
- [ ] Challenge moat claims constructively (not destructively)

---

## Common Mistakes to Avoid

1. **Accepting moat claims without scrutiny** - Always demand technical evidence
2. **Rating all moats as strong** - Be honest about weaknesses
3. **Vague strengthening strategies** - Be specific ("add API" not "integrate better")
4. **Ignoring implementation complexity** - Strong moat + impossible build = bad decision
5. **Making product decisions** - Provide technical input, let PM decide
6. **Pessimism bias** - Challenge weak moats but recognize strong ones

---

## After Completion

**Write to daily log:**
Append to `skills/CTO/memory/YYYY-MM-DD.md`:
```markdown
## Moat Validation Session

**Feature validated:** [Name]
**Strongest moats:** [List with ratings]
**Weakest moats:** [List with ratings]
**Overall verdict:** [Build / Strengthen / Reconsider]

**Technical learnings:**
- [Pattern observed about this feature type]
- [Moat strength insight]

**For MEMORY.md:**
- [If pattern worth remembering long-term]
```
