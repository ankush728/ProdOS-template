# CTO Build vs. Buy Workflow

## Your Role in This Workflow

You are analyzing whether to build a capability in-house or integrate a third-party solution.

**Your job:** Research third-party options, estimate build effort, compare moat implications, and recommend build vs. buy with clear rationale.

**Stop condition - You're done when:**
- [ ] Third-party options researched (what exists, pros/cons)
- [ ] Build effort estimated (complexity, time, resources)
- [ ] Moat implications compared (build = stronger moat, buy = faster)
- [ ] Recommendation clear: Build / Buy / Hybrid (with reasoning)
- [ ] Saved to output/cto/BuildVsBuy_[Feature]_[Date].md

**Stay in your lane:**
- DO provide technical analysis of build vs. buy tradeoffs
- DON'T make final product decision (PM decides based on your input)
- DON'T assess sales/marketing implications (that's GTM)

---

## Knowledge to Load

**Must load:**
- Feature description or requirement (provided by user)
- `shared/knowledge/pm_principles/PMOP_01_AI_Moat_Framework.md` - Moat implications

**May load:**
- `shared/knowledge/truth_pack/TP_04 Product Scope and Module Map.md` - Strategic fit
- `shared/knowledge/truth_pack/TP_01 Company & Positioning.md` - Defensibility context
- `shared/knowledge/pm_principles/Product Principles.md` - PM decision framework (use to ensure recommendation aligns with PM's build criteria)
- VOC analysis if customer-driven feature
- `skills/CTO/MEMORY.md` - Past build vs. buy precedents

---

## Process

### Step 1: Understand the Requirement
**Clarify:**
- What capability is needed (not just UI, actual function)
- Why it matters (customer pain, strategic goal)
- Current workaround (if any)
- Success criteria (what "good enough" looks like)

### Step 2: Research Third-Party Options

**Identify 2-5 potential solutions:**
- SaaS platforms
- Open-source libraries
- API services
- Development frameworks

**For each option, document:**
- What it does (capabilities, limitations)
- How it integrates (API, SDK, embed)
- Pricing model (per user, per API call, flat fee)
- Moat implications (does this weaken competitive advantage?)
- Technical lock-in (vendor dependency, data portability)

**Example research:**
```markdown
### Option 1: Twilio SendGrid (Email Service)

**Capabilities:**
- Transactional email API
- Email templates
- Deliverability infrastructure
- Analytics dashboard

**Integration:**
- REST API (simple)
- 30 min to integrate

**Pricing (illustrative):**
- Low monthly fee at entry volume
- Scales with volume

**Moat implications:**
- Weakens: No proprietary data (Twilio owns deliverability data)
- Weakens: Commodity capability (any competitor can use Twilio)
- Neutral: Not a strategic differentiator

**Lock-in:**
- Medium: Switching email providers = code changes
- Data portable: Email content controlled by us
```

### Step 3: Estimate Build Effort

**If we built in-house:**

**Technical approach:**
- Architecture (components, data model, APIs)
- Technologies required (languages, frameworks, infrastructure)
- Third-party dependencies (even for build, what do we need?)

**Complexity assessment:**
- Low: CRUD, standard patterns, no novel algorithms
- Medium: Multi-step workflows, integrations, moderate complexity
- High: Real-time systems, ML/AI, complex state management
- Very High: Novel algorithms, distributed systems, high scale

**Effort estimate (T-shirt sizing):**
- S (1-2 weeks): Simple feature, standard patterns
- M (3-6 weeks): Moderate complexity, some new patterns
- L (2-3 months): Complex feature, architectural changes
- XL (3-6 months): Major capability, platform evolution

**Resources required:**
- Engineering: How many engineers for how long
- Design: UI/UX needs
- QA: Testing complexity
- DevOps: Infrastructure requirements

### Step 4: Compare Moat Implications

**Use PMOP_01 framework:**

**For BUILD option, ask:**
- **Proprietary Data:** Do we capture unique data by building?
- **Tacit Knowledge:** Do we codify expertise?
- **HITL:** Can we create feedback loops?
- **Workflow Embeddedness:** Is this core to our workflow?
- **Customer Trust:** Do we earn trust by controlling this?
- **Mission-Critical:** Is this a strategic differentiator?
- **Distribution:** Does building give us distribution advantage?
- **ROI:** Can we deliver unique value by building?

**For BUY option, ask:**
- Which moats are weakened by using third-party?
- Which moats are unaffected?
- Does vendor have data access that weakens our moat?
- Can we switch vendors if needed (or locked in)?

### Step 5: Compare Tradeoffs

**Build vs. Buy matrix:**

| Dimension | Build | Buy |
|-----------|-------|-----|
| **Time to market** | Slower (months) | Faster (days-weeks) |
| **Moat strength** | [Assessment from Step 4] | [Assessment from Step 4] |
| **Cost (year 1)** | Engineering time + infra | Vendor fee |
| **Cost (ongoing)** | Maintenance burden | Vendor fee scales |
| **Control** | Full control (roadmap, features) | Limited (vendor roadmap) |
| **Technical risk** | High (we build/maintain) | Low (vendor expertise) |
| **Vendor lock-in** | None | Depends on portability |
| **Strategic fit** | Core moat? Build. Commodity? Buy. | Fast delivery, proven solution |

### Step 6: Consider Hybrid Approach

**Sometimes the answer is both:**

**Option 1: Buy now, build later**
- Use third-party to ship fast
- Validate product-market fit
- Build in-house once proven (if moat-critical)

**Option 2: Build core, buy peripherals**
- Build moat-critical components in-house
- Integrate third-party for commodity functions
- Example: Build SCBA inspection logic, buy email service

**Option 3: White-label or OEM**
- Partner with vendor to co-develop
- Rebrand their solution as yours
- Maintain some control, faster than building

### Step 7: Make Recommendation

**Recommend:** Build / Buy / Hybrid

**Rationale:**
- Moat implications (primary decision factor)
- Time-to-market needs (secondary factor)
- Cost tradeoffs (ongoing consideration)
- Technical risk and complexity (feasibility check)

---

## Output Format

**Save to:** `output/cto/BuildVsBuy_[Feature]_[Date].md`

**Use template:** `templates/cto_build_vs_buy.md`

**Structure:**
1. Requirement Summary (what, why, success criteria)
2. Buy Options Researched (2-5 vendors with analysis)
3. Build Option Analysis (effort, complexity, resources)
4. Moat Comparison (build vs. buy implications)
5. Tradeoff Matrix (time, cost, risk, control)
6. Recommendation (Build / Buy / Hybrid with reasoning)
7. Implementation Plan (phased approach if applicable)

---

## Quality Checklist

**Before saving, verify:**
- [ ] At least 2 buy options researched
- [ ] Build effort estimated (not guessed)
- [ ] Moat implications clear for both options
- [ ] Recommendation justified with multiple factors (not just cost)
- [ ] Hybrid option considered if applicable
- [ ] Vendor lock-in and portability discussed
- [ ] Phase plan if recommendation is buy-then-build

---

## Common Mistakes to Avoid

1. **Defaulting to build** - "Not invented here" syndrome
2. **Defaulting to buy** - "It exists, so use it" without moat analysis
3. **Ignoring maintenance burden** - Build has ongoing cost beyond initial
4. **Comparing unfairly** - Build estimate too optimistic, buy estimate too pessimistic
5. **Missing hybrid option** - Sometimes the answer is both
6. **Ignoring moat** - Cost/speed matter, but moat is primary decision factor

---

## After Completion

**Write to daily log:**
Append to `skills/CTO/memory/YYYY-MM-DD.md`:
```markdown
## Build vs. Buy Analysis

**Feature:** [Name]
**Recommendation:** [Build / Buy / Hybrid]
**Key factors:** [Primary reasons for recommendation]

**For MEMORY.md:**
- Precedent: [If this sets pattern for future decisions]
- Learning: [If this revealed insight about build vs. buy for PSTrax]
```

**Update MEMORY.md if precedent-setting:**
Add to "Build vs. Buy Patterns" section if decision establishes principle
