<!-- Standalone reference template for manual use or ad-hoc moat assessments.
     CTO skill uses templates/cto_moat_validation.md for its workflow output. -->

# Moat Assessment: [FEATURE/PRODUCT NAME]

**Date:** [Assessment date]
**Author:** [Your name]
**Status:** [Draft / Final]
**Reviewed by:** [CTO, PM lead, etc.]

---

## Feature Overview

**What:** [Brief description of feature/product]
**Why:** [Strategic rationale]
**For whom:** [Target persona from TP_03]
**Strategic context:** [How this fits into company strategy]

---

## Moat Assessment (8 Dimensions)

**Reference:** `knowledge/pm_principles/PMOP_01_AI_Moat_Framework.md`

For each moat dimension, assess: ❌ None / ⚠️ Weak / ✅ Moderate / ✅✅ Strong

---

### 🎯 1. Proprietary Data Assets

**Moat Strength:** [❌ / ⚠️ / ✅ / ✅✅]

**Analysis:**
- Does this feature generate unique data? [Yes/No]
- What data is captured that competitors can't easily access? [Describe]
- How long would it take competitor to replicate this dataset? [Timeframe]
- Is the data legally defensible (not scraped, properly licensed)? [Yes/No]
- Does the data improve with scale/time? [Yes/No]

**Verdict:**
[Explain moat strength assessment - why strong/moderate/weak/none]

**Strengthening opportunities:**
[If moat is weak, what could make it stronger?]

---

### 🧠 2. Tacit Knowledge

**Moat Strength:** [❌ / ⚠️ / ✅ / ✅✅]

**Analysis:**
- Does this codify expert judgment or domain expertise? [Yes/No]
- What specific knowledge is embedded that's hard to replicate? [Describe]
- Could competitor learn this from public sources/documentation? [Yes/No]
- Is the knowledge scarce (few people have it)? [Yes/No]

**Verdict:**
[Explain moat strength]

**Strengthening opportunities:**
[How to capture more tacit knowledge]

---

### 🤝 3. Human-in-the-Loop (HITL)

**Moat Strength:** [❌ / ⚠️ / ✅ / ✅✅]

**Analysis:**
- Does this create feedback loops with human validation? [Yes/No]
- Do human corrections improve the AI over time? [Yes/No]
- Does this generate training data competitors lack? [Yes/No]
- Is there a clear path from human validation → automation? [Yes/No]

**Verdict:**
[Explain moat strength]

**Strengthening opportunities:**
[How to design better HITL loops - confidence thresholds, feedback capture, retraining pipeline]

---

### 🔗 4. Workflow Embeddedness

**Moat Strength:** [❌ / ⚠️ / ✅ / ✅✅]

**Analysis:**
- Does this integrate deeply into critical workflows? [Yes/No]
- What switching costs does this create? [Describe]
- Does removing this break other systems or processes? [Yes/No]
- Is this a separate tool or embedded in existing workflow? [Separate/Embedded]

**Verdict:**
[Explain moat strength]

**Strengthening opportunities:**
[Integration points to increase embeddedness - CAD integration, IC tools, API hub strategy]

---

### 🛡️ 5. Customer Trust & Permission

**Moat Strength:** [❌ / ⚠️ / ✅ / ✅✅]

**Analysis:**
- Does this require trust to use/automate? [Yes/No]
- Do we have permission competitors don't? [Yes/No]
- Does this handle mission-critical decisions? [Yes/No]
- What builds trust in our implementation specifically? [Describe]

**Verdict:**
[Explain moat strength]

**Strengthening opportunities:**
[How to earn automation permission - transparency, explainability, human override]

---

### ⚖️ 6. Mission-Critical / High-Stakes Industry

**Moat Strength:** [❌ / ⚠️ / ✅ / ✅✅]

**Analysis:**
- Does this operate in high-stakes environment? [Yes/No]
- What are consequences of failure? [Litigation, safety, compliance]
- Does regulatory complexity create barrier to entry? [Yes/No]
- Is domain expertise required to build this properly? [Yes/No]

**Verdict:**
[Explain moat strength]

**Strengthening opportunities:**
[How to increase mission-critical positioning - compliance features, audit trails, defensibility]

---

### 📡 7. Distribution Leverage

**Moat Strength:** [❌ / ⚠️ / ✅ / ✅✅]

**Analysis:**
- Does this leverage unique distribution advantages? [Yes/No]
- Can we deploy to massive installed base competitors lack? [Yes/No]
- Do we have ecosystem advantages (partnerships, integrations)? [Yes/No]

**Verdict:**
[Explain moat strength]

**Strengthening opportunities:**
[Partnership strategies, integration opportunities]

---

### 📊 8. Demonstrable ROI

**Moat Strength:** [❌ / ⚠️ / ✅ / ✅✅]

**Analysis:**
- Can we measure clear value delivery? [Yes/No]
- What specific productivity gains or risk reduction is quantifiable? [Metrics]
- Can customer easily prove ROI to their CFO/City Council? [Yes/No]
- Time to value: [Days/Weeks/Months]

**Verdict:**
[Explain moat strength]

**Strengthening opportunities:**
[How to make ROI more measurable and compelling]

---

## Overall Moat Assessment

**Summary:**

**Moats with STRONG evidence (✅✅):**
- [Moat name]: [Brief reason]

**Moats with MODERATE evidence (✅):**
- [Moat name]: [Brief reason]

**Moats with WEAK/NO evidence (⚠️ / ❌):**
- [Moat name]: [Why weak]

**Overall Strength:** [❌ Weak / ⚠️ Moderate / ✅ Strong / ✅✅ Very Strong]

**Justification:**
[1-2 paragraphs explaining overall assessment]

---

## Replicability Test

**Could well-funded competitor replicate this in 6 months?**
[Yes / No / Partially]

**Timeline to replicate:** [Estimate: X months to Y years]

**What makes this defensible:**
1. [Factor 1 that creates barrier]
2. [Factor 2]
3. [Factor 3]

**What competitor would need:**
- Resources: [Time, money, people]
- Data: [What data would they need to acquire]
- Expertise: [What domain knowledge required]
- Trust: [What customer relationships needed]

---

## Recommendations

### To Strengthen Moat

**High Priority (do now):**
1. [Specific architectural or design change]
   - **Why:** [How this strengthens which moat]
   - **Effort:** [Estimate]

2. [Another recommendation]

**Medium Priority (consider):**
1. [Secondary recommendation]

**Low Priority (future):**
1. [Nice-to-have enhancement]

---

## Competitive Analysis

**If competitor tried to build this:**

**What would they need?**
- [Resource requirement 1]
- [Resource requirement 2]
- [Resource requirement 3]

**What can't they easily access?**
- [PSTrax advantage 1 - e.g., customer relationships, proprietary data]
- [PSTrax advantage 2]

**How long would it realistically take?**
- [Timeline estimate with reasoning]

**Biggest barrier to replication:**
- [Single biggest competitive advantage]

---

## Build vs. Buy Implications

[If this assessment is for build vs. buy decision]

**Building in-house:**
- ✅ Pros: [Moat benefits]
- ❌ Cons: [Time, resources, risk]

**Using third-party solution:**
- ✅ Pros: [Faster, proven]
- ❌ Cons: [Weakens moat how?]

**Recommendation:** [Build / Buy / Hybrid - with rationale]

---

## Conclusion

**Final assessment:**
[2-3 sentences: Is this feature defensible enough to invest in? Why or why not? What's the strategic value beyond just solving customer pain?]

**Strategic recommendation:**
[Proceed / Strengthen before proceeding / Reconsider - with reasoning]
