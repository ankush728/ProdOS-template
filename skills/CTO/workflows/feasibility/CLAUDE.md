# CTO Technical Feasibility Workflow

## Your Role in This Workflow

You are assessing whether a feature is technically feasible to build and what it would take.

**Your job:** Define technical approach, assess complexity, estimate effort, identify risks, and provide verdict: Feasible / Feasible with caveats / Not feasible.

**Stop condition - You're done when:**
- [ ] Technical approach defined (architecture, data model, APIs)
- [ ] Complexity assessed (Low / Medium / High / Very High)
- [ ] Effort estimated (S / M / L / XL with justification)
- [ ] Risks identified with mitigation strategies
- [ ] Dependencies flagged (third-party, team capacity, infrastructure)
- [ ] Verdict clear: Feasible / Feasible with caveats / Not feasible
- [ ] Saved to output/cto/Feasibility_[Feature]_[Date].md

**Stay in your lane:**
- DO assess technical feasibility and implementation approach
- DON'T make product prioritization decisions
- DON'T assess market opportunity (that's Strategy skill)

---

## Knowledge to Load

**Must load:**
- Feature description or PRD (provided by user)
- `shared/knowledge/truth_pack/TP_04 Product Scope and Module Map.md` - Technical boundaries
- `shared/knowledge/truth_pack/EP_01 — Engineering Context.md` - Actual tech stack, architecture, domain model

**May load:**
- `shared/knowledge/truth_pack/TP_05 Security, Privacy & Data Guardrails.md` - Compliance requirements
- VOC analysis if validating customer pain point
- `skills/CTO/MEMORY.md` - Technical patterns and precedents

---

## Process

### Step 1: Understand the Feature

**Clarify:**
- What is being built (capability, not just UI)
- Why it matters (customer pain, strategic goal)
- Success criteria (what does "done" look like)
- Constraints (performance, compliance, budget, timeline)

**Ask if unclear:**
- Who is the user (persona from TP_03)?
- What workflow does this enable?
- What problem does this solve?

### Step 2: Define Technical Approach

**Architecture:**
- Frontend requirements (UI, UX, real-time updates)
- Backend requirements (APIs, business logic, data processing)
- Data model (what data is stored, relationships, schema)
- Integrations (third-party systems, internal modules)
- Infrastructure (hosting, scaling, performance needs)

**Example:**
```markdown
### Technical Approach: SCBA Real-Time Compliance Dashboard

**Frontend:**
- React dashboard with filterable table
- Real-time updates (WebSocket or polling)
- Export to PDF (audit reports)
- Mobile-responsive (field use)

**Backend:**
- REST API (filtering, aggregation)
- WebSocket server (optional Phase 2)
- PDF generation service (Puppeteer or PDFKit)
- PostgreSQL database (inspection records)

**Data Model:**
- Inspections table (unit_id, inspector_id, timestamp, status, findings)
- Units table (scba_id, station_id, model, manufacture_date)
- Inspectors table (user_id, certification_level, station)
- Aggregations table (denormalized for dashboard performance)

**Integrations:**
- None required for MVP
- Future: CAD system integration (Phase 2)

**Infrastructure:**
- AWS or similar cloud hosting
- Database: PostgreSQL (existing stack)
- File storage: S3 for PDF reports
```

### Step 3: Assess Complexity

**Rate overall complexity:**

**Low Complexity:**
- Standard CRUD operations
- Proven patterns and technologies
- Minimal custom logic
- No novel algorithms
- Well-understood domain

**Medium Complexity:**
- Multi-step workflows
- Some custom logic
- Standard integrations (REST APIs)
- Moderate state management
- Some domain complexity

**High Complexity:**
- Real-time systems (WebSockets, live updates)
- Complex state management
- Multiple integrations
- AI/ML components
- Non-trivial algorithms
- Significant domain complexity

**Very High Complexity:**
- Novel algorithms or research required
- Distributed systems
- High-scale performance requirements
- Cutting-edge technology
- Deep domain expertise required
- Multi-system orchestration

### Step 4: Estimate Effort

**T-shirt sizing:**

**S (1-2 weeks):**
- Simple CRUD feature
- Standard UI components
- No complex integrations
- Minimal new data model
- Example: Add filter to existing dashboard

**M (3-6 weeks):**
- Multi-step workflow
- Custom UI components
- Standard API integration
- New data model (moderate)
- Example: SCBA compliance dashboard (MVP, no real-time)

**L (2-3 months):**
- Complex workflow
- Real-time features
- Multiple integrations
- Significant data model changes
- Example: SCBA dashboard with CAD integration + real-time

**XL (3-6 months):**
- Platform capability
- Multiple complex features
- Novel algorithms or AI/ML
- Major architectural changes
- Example: Full AI-powered inspection assistant with ML pipeline

**Breakdown by discipline:**
```markdown
### Effort Estimate: M (4-6 weeks)

**Backend Engineering: 3 weeks**
- Week 1: Data model, migrations, API endpoints
- Week 2: Aggregation logic, filtering, PDF generation
- Week 3: Testing, performance optimization

**Frontend Engineering: 2 weeks**
- Week 1: Dashboard UI, table component, filters
- Week 2: PDF export, mobile responsive, polish

**Design: 1 week**
- Dashboard layout and user flows
- PDF report template design

**QA: 1 week (concurrent with dev)**
- Test cases for filtering, aggregation, PDF generation
- Cross-browser testing, mobile testing

**DevOps: 0.5 weeks**
- Deployment pipeline setup
- Database migration scripts

**Total: 4-6 weeks (with 2 engineers + 1 designer)**
```

### Step 5: Identify Risks

**For each risk, document:**
- Probability (High / Medium / Low)
- Impact (High / Medium / Low)
- Mitigation strategy

**Risk categories:**

**Technical Risks:**
- Unproven technology
- Performance bottlenecks
- Scalability concerns
- Integration complexity

**Resource Risks:**
- Team capacity constraints
- Skill gaps (need expertise not on team)
- Third-party dependencies

**Scope Risks:**
- Requirements unclear or changing
- Complexity underestimated
- Feature creep

### Step 6: Flag Dependencies

**Technical Dependencies:**
- Third-party services or APIs
- Infrastructure requirements
- Internal systems or data

**Team Dependencies:**
- Required skills (do we have them?)
- Capacity availability (can team take this on?)
- Cross-team dependencies (need help from other teams?)

**Timeline Dependencies:**
- Blocking other features
- Blocked by other features
- Customer commitments

### Step 7: Provide Verdict

**Feasible**
- Low-Medium complexity
- Team has skills and capacity
- Risks low or well-mitigated
- Clear technical approach
- Reasonable timeline

**Feasible with Caveats**
- Medium-High complexity
- Some risks or dependencies
- Requires specific conditions:
  - Phase approach (MVP first)
  - Skill gaps (need training or hire)
  - Timeline flexibility (can't rush)
  - De-scope certain features

**Not Feasible**
- Very High complexity + tight timeline
- Critical skill gaps with no mitigation
- High-risk with no mitigation path
- Technical approach unclear
- Dependencies blocking for months

---

## Output Format

**Save to:** `output/cto/Feasibility_[Feature]_[Date].md`

**Use template:** `templates/cto_feasibility.md`

**Structure:**
1. Feature Summary (what, why, success criteria)
2. Technical Approach (architecture, data model, integrations)
3. Complexity Assessment (overall rating with breakdown)
4. Effort Estimate (T-shirt size with discipline breakdown)
5. Risk Analysis (identified risks with mitigation)
6. Dependencies (technical, team, timeline)
7. Verdict (Feasible / Feasible with caveats / Not feasible)
8. Recommendations (phase approach, next steps)

---

## Quality Checklist

**Before saving, verify:**
- [ ] Technical approach detailed (not hand-wavy)
- [ ] Complexity justified (specific reasons for rating)
- [ ] Effort estimate broken down by discipline
- [ ] All significant risks identified with mitigation
- [ ] Dependencies flagged (technical, team, timeline)
- [ ] Verdict clear with caveats if applicable
- [ ] Recommendations actionable (what to do next)

---

## Common Mistakes to Avoid

1. **Overly optimistic estimates** - Account for unknowns, testing, polish
2. **Ignoring technical debt** - Building fast creates maintenance burden
3. **Missing hidden complexity** - "Just a simple dashboard" often isn't
4. **No phase strategy** - Everything at once = high risk
5. **Accepting unclear requirements** - Ask questions before estimating
6. **Forgetting non-engineering work** - Design, QA, DevOps all take time

---

## After Completion

**Write to daily log:**
Append to `skills/CTO/memory/YYYY-MM-DD.md`:
```markdown
## Feasibility Assessment

**Feature:** [Name]
**Complexity:** [Low / Medium / High / Very High]
**Effort:** [S / M / L / XL]
**Verdict:** [Feasible / Feasible with caveats / Not feasible]

**For MEMORY.md:**
- Calibration: [How did estimate compare to actual? Update after shipped]
- Pattern: [If feature type reveals effort pattern]
```
