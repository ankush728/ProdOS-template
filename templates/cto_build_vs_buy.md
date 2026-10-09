# Build vs. Buy Analysis: [CAPABILITY NAME]

**Date:** [Analysis date]
**Analyst:** [CTO/VP of Product]
**Status:** [Draft / Final]

---

## Requirement Summary

**Capability Needed:** [What function is required]
**Why:** [Customer pain or strategic goal]
**Current Workaround:** [What happens today]
**Success Criteria:** [What does "good enough" look like]

---

## Buy Options Researched

### Option 1: [Vendor Name]

**Capabilities:**
- [Feature 1]
- [Feature 2]
- [Feature 3]
- [Limitations]

**Integration:**
- **Method:** [REST API / SDK / Embed / Other]
- **Effort:** [Time to integrate]
- **Complexity:** [Low / Medium / High]

**Pricing:**
- **Model:** [Per user / Per API call / Flat fee]
- **Cost:** [Monthly/Annual]
- **Scales how:** [With usage, users, volume]

**Moat Implications:**
- **Strengthens:** [Which moats if any]
- **Neutral:** [Moats unaffected]
- **Weakens:** [Which moats weakened - data ownership, control]

**Vendor Lock-In:**
- **Severity:** [Low / Medium / High]
- **Data portability:** [Can we export/migrate?]
- **Switching cost:** [Effort to change vendors]

**Pros:**
- [Advantage 1]
- [Advantage 2]

**Cons:**
- [Disadvantage 1]
- [Disadvantage 2]

---

### Option 2: [Second Vendor]

[Same structure as Option 1]

---

### Option 3: [Third Vendor or Open Source]

[Same structure]

---

## Build Option Analysis

**If we built in-house:**

### Technical Approach

**Architecture:**
- [Frontend components needed]
- [Backend services needed]
- [Data model]
- [Integrations required]
- [Infrastructure]

**Technologies:**
- [Languages, frameworks, libraries]
- [Why these choices]

**Third-party dependencies:**
- [Even for build, what do we need from vendors?]

---

### Complexity Assessment

**Overall Complexity:** [Low / Medium / High / Very High]

**Frontend:** [Low/Med/High + why]
**Backend:** [Low/Med/High + why]
**Data Model:** [Low/Med/High + why]
**Infrastructure:** [Low/Med/High + why]

**Why this rating:**
[Specific technical reasons]

---

### Effort Estimate

**T-shirt Size:** [S / M / L / XL]
**Timeline:** [Weeks/Months]

**Breakdown:**
- **Backend:** [Time] - [Engineer count]
- **Frontend:** [Time] - [Engineer count]
- **Design:** [Time]
- **QA:** [Time]
- **DevOps:** [Time]

**Total:** [Time with team composition]

**Ongoing Maintenance:**
- [% of engineer time ongoing]
- [Infrastructure costs]

---

### Technical Risks

**High Risk:**
- [Risk]: [Mitigation]

**Medium Risk:**
- [Risk]: [Mitigation]

**Low Risk:**
- [Risk]: [Mitigation]

---

## Moat Comparison

### BUILD Moats

**Proprietary Data:** [None / Weak / Moderate / Strong]
[Do we capture unique data by building?]

**Tacit Knowledge:** [None / Weak / Moderate / Strong]
[Do we codify expertise?]

**HITL:** [None / Weak / Moderate / Strong]
[Can we create feedback loops?]

**Workflow Embeddedness:** [None / Weak / Moderate / Strong]
[Is this core to our workflow?]

**Trust:** [None / Weak / Moderate / Strong]
[Do we earn trust by controlling this?]

**Mission-Critical:** [None / Weak / Moderate / Strong]
[Is this a strategic differentiator?]

**Distribution:** [None / Weak / Moderate / Strong]
[Does building give us distribution advantage?]

**ROI:** [None / Weak / Moderate / Strong]
[Can we deliver unique value by building?]

**Overall BUILD moat strength:** [Weak / Moderate / Strong / Very Strong]

---

### BUY Moats

[Same 8 moats assessed for buy option]

**Overall BUY moat strength:** [Weak / Moderate / Strong / Very Strong]

---

### Moat Comparison Summary

**BUILD advantages:**
- [Moat 1]: [Why stronger when we build]

**BUY advantages:**
- [None or list if any]

**Verdict:** [Moat strength: Build >> Buy / Build > Buy / Build = Buy / Buy > Build]

---

## Tradeoff Matrix

| Dimension | Build | Buy | Winner |
|-----------|-------|-----|--------|
| **Time to market** | [Months] | [Days/Weeks] | Buy |
| **Moat strength** | [Strong/Weak] | [Strong/Weak] | [Build/Buy] |
| **Year 1 cost** | $[Eng time + infra] | $[Vendor fee] | [Build/Buy] |
| **Ongoing cost** | $[Maintenance] | $[Annual fee] | [Build/Buy] |
| **Control** | Full | Limited | Build |
| **Technical risk** | [High/Med/Low] | [High/Med/Low] | [Build/Buy] |
| **Vendor lock-in** | None | [Low/Med/High] | Build |
| **Scalability** | [Ours to manage] | [Vendor handles] | [Build/Buy] |

---

## Hybrid Options

**Option A: Buy now, build later**
- Use vendor to ship fast
- Validate product-market fit
- Build in-house once proven (if moat-critical)
- **Timeline:** Buy (Month 1), Build (Month 6-12)

**Option B: Build core, buy peripherals**
- Build moat-critical components
- Integrate vendor for commodity
- **Example:** Build [X], buy [Y]

**Option C: White-label partnership**
- Partner with vendor to co-develop
- Rebrand their solution
- **Pros:** [List]
- **Cons:** [List]

---

## Recommendation

**Decision:** [BUILD / BUY / HYBRID]

**Primary Rationale:**
1. **Moat:** [How this decision affects competitive advantage]
2. **Time:** [Speed to market implications]
3. **Cost:** [Financial tradeoff]
4. **Risk:** [Technical risk assessment]
5. **Strategic fit:** [Alignment with PSTrax positioning]

**Phase Plan:**

**Phase 1 ([Timeframe]):**
- [Action 1]
- [Action 2]

**Phase 2 ([Timeframe]):**
- [Action 1]
- [Action 2]

**Phase 3 (Optional):**
- [Future consideration]

---

## Implementation Notes

**If BUILD:**
- Team needs: [Engineers, designers, resources]
- Timeline: [When can start, when shipped]
- Dependencies: [What's blocking or required]

**If BUY:**
- Vendor selection: [Recommended vendor + why]
- Integration plan: [How to integrate]
- Portability strategy: [How to avoid lock-in]
- Monitoring: [What to track to decide if working]

**If HYBRID:**
- [Detailed phase breakdown]

---

## Risks & Mitigation

**Key Risk 1:** [Description]
- **Mitigation:** [Strategy]

**Key Risk 2:** [Description]
- **Mitigation:** [Strategy]

---

## Success Criteria

**We'll know this was the right decision if:**
- [Metric 1] within [timeframe]
- [Metric 2] within [timeframe]
- [Outcome 3]

**We'll know we need to pivot if:**
- [Signal 1]
- [Signal 2]

---

## Next Steps

1. [ ] [Immediate action]
2. [ ] [Second step]
3. [ ] [Third step]
