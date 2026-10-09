# Initiative Estimation Brief — Template

**Purpose:** The product-side one-pager the product team sends to engineering to request a t-shirt-size estimate. It feeds the **swag → refine** pipeline: Phase 1 = ship captain returns a "swag" t-shirt size in 1–2 days; Phase 2 = winners expand into a full PRD (Spec Factory) → tickets. It also feeds the financial model (estimate → cost → revenue − cost = margin).

**How to use:**
- Fill §1–§7 (product). Keep it to **one page** for the swag request — discipline beats completeness here; the Phase-2 PRD is where it grows.
- Send to the ship captain (the delivery manager or a principal engineer). They fill §8.
- The "At a glance" header carries the monetization/segment fields for the financial model — clearly walled off from the engineering section so there's one artifact, no double entry. **Engineering does not estimate the header.**
- Dovetails with the SVP of Engineering's estimation-side swag/refine rubric — align §8 + the t-shirt rubric with it.

---

## Template (copy below this line)

```markdown
# Initiative Brief: <name>
PM owner: <name>   |   Date: <YYYY-MM-DD>   |   Version: <n>
Status: ☐ swag requested  ☐ swag returned  ☐ refined to PRD

## At a glance  (product/finance — eng does NOT estimate this)
- Module(s):            <Vehicles / Supplies / CS / Assets / SCBA / PPE / platform>
- Priority:             <Now / Next / Later>   (or P0/P1/P2)
- Strategic tie:        <revenue | retention | defensibility>  — one line on the mechanism
- Monetization:         <$ / $$ / $$$>   |   Target segment: <e.g. 3–5 station RCP / enterprise / PLG>
- Customer evidence:    <N customers / who asked / source>

## 1. Problem & why now  (2–3 sentences)
The job-to-be-done and the cost of not doing it. Name the mechanism, not just the metric.

## 2. Proposed solution — the WHAT, not the HOW  (bullets)
- Capability 1
- Capability 2
(Product defines what; engineering owns how.)

## 3. Acceptance criteria  ← the spec that gets estimated
- [ ] Given <context>, when <action>, then <result>
- [ ] …
("Done when" — concrete, testable. This is what the estimate and the eventual tickets key on.)

## 4. Explicitly OUT of scope / non-goals
- Not doing X (deferred / never)
(Bounds the estimate. Prevents ballooning.)

## 5. Phasing  (if the thing is big)
- Phase 1 (ship first): <subset>
- Phase 2 (later): <the complex/edge-case part>

## 6. Dependencies & constraints
- Multi-tenancy gating? <Y/N + which part>
- Data-model touchpoints: <tables/objects affected>
- Integrations: <distributor / fleet-maintenance / ePCR / ERP / none>
- Permissions/roles, timezone, other in-flight work it collides with

## 7. Open questions & complexity drivers  (for the estimator)
- What's uncertain / where a spike may be needed
- What could make this unexpectedly large

────────────  ENGINEERING FILLS BELOW  ────────────
## 8. Estimate  (ship captain)
- T-shirt size: <XS / S / M / L / XL / XXL>   |   Confidence: <Low/Med/High>
- Rough effort: <# engineers × duration>
- Splittable? <Y/N — read-vs-write? parallelizable? phase boundary?>
- Spike needed first? <Y/N — what to learn>
- If XL/XXL: **why** (2–3 drivers) + proposed split
- Key risks / assumptions / dependencies eng sees
```

---

## T-shirt rubric (so sizes mean the same thing across estimators)

| Size | Rough effort | Rule of thumb |
|------|--------------|---------------|
| XS | < 1 day | config / copy / flag |
| S | 1–3 days | one surface, no schema change |
| M | ~1 week | new surface or light schema change |
| L | 2–3 weeks | multi-surface or new data model |
| XL | ~1 month | cross-module / migration / new integration |
| XXL | multi-month | **must be split** — return a Phase-1 carve-out + reasons |

> **Calibration note:** AI-assisted sizing tends to *over*-estimate. Swags are directional; refine in Phase 2.

## Design principles baked into this format
1. **One page, scope-bounded.** The #1 estimate-killer is unbounded scope — hence explicit non-goals (§4) and phasing (§5).
2. **Acceptance criteria lead** (§3, above solution detail) — the most important artifact for estimators and AI coding agents.
3. **Legible, challengeable estimates** (§7 + §8) — the estimator must name *why* something is XL/XXL and whether it splits, so a size can be pressure-tested rather than taken on faith.
