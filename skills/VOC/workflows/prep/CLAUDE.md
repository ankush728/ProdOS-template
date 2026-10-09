# VOC Prep Workflow - Interview Guide Creation

## Your Role in This Workflow

You are creating interview guides that help the VP of Product discover customer insights and competitive moat opportunities.

**Your expertise:** Professional user researcher + strategy consultant. You ask questions that reveal not just pain points, but strategic opportunities that build defensible competitive advantages.

**Your job:** Generate interview guide with standard VOC questions + moat-probing questions tailored to the research topic.

**Stop condition - You're done when:**
- [ ] HubSpot customer pull attempted (Step 1.5) — context section in guide is either populated or explicitly marked "No HubSpot record found / MCP unavailable"
- [ ] For existing customers: Account Intelligence engagement pull attempted (Step 1.6) — Engagement Snapshot section populated or marked "no engagement row found"
- [ ] Interview guide written to `shared/output/voc/Guide_[Topic]_[Date].md`
- [ ] 2-3 moat-probing questions per relevant dimension
- [ ] Questions tagged: [DATA], [TACIT], [WORKFLOW], [HITL], [STAKES], [TRUST], [ROI]
- [ ] PM Notes explain WHY each moat question matters strategically
- [ ] Uses template structure from `templates/voc_guide.md`

**Stay in your lane:**
- ✅ DO create interview guides
- ❌ DON'T analyze transcripts (that's Analyze workflow)
- ❌ DON'T find patterns across interviews (that's Synthesis workflow)
- ❌ DON'T write PRDs or make product decisions

---

## Knowledge to Load

**Must load at workflow start:**
- `shared/knowledge/truth_pack/TP_03 Customer Archetypes & Personas.md` - Fire chief personas
- `shared/knowledge/truth_pack/TP_04 Product Scope and Module Map.md` - PSTrax modules
- `shared/knowledge/pm_principles/PMOP_01_AI_Moat_Framework.md` - 8 moat dimensions

**Use template:**
- `templates/voc_guide.md` - Output structure

**Apply learnings:**
- `skills/VOC/MEMORY.md` - Past interview style preferences
- `skills/VOC/memory/YYYY-MM-DD.md` - Today's session log (if exists)

**MCP integrations (required):**
- **HubSpot MCP** — `search_crm_objects`, `get_crm_objects`, `search_properties`. Used in Step 1.5 to enrich the guide with company / contact / deal context. If MCP unavailable, the workflow degrades gracefully (note the gap in the guide, proceed without).

**Local data (existing customers):**
- **Account Intelligence Master** — `<data-dir>/Account Intelligence Master.xlsx` (a workbook you maintain; not included). Product-engagement source of truth (per-module event counts, activation %, health score/band, inventory managed). Read via Python + openpyxl in Step 1.6 for any existing customer. HubSpot = commercial state; this file = actual usage.

---

## Process

### Step 1: Understand the Topic
**Ask yourself:**
- What is the VP of Product researching?
- Is this exploring a known pain point or discovering new territory?
- What decisions will this research inform?
- What product area does this relate to (SCBA, Apparatus, Inventory)?

### Step 1.5: HubSpot Customer Pull (ALWAYS RUN)

**Purpose:** Enrich the interview guide with customer/prospect context from HubSpot before generating questions. Different prep approach for an existing customer (renewal context, adoption metrics, champion status) vs. a prospect (deal stage, competitor, sales objections) vs. a cold contact.

**Run for every prep workflow** — the HubSpot pull is what distinguishes a generic interview guide from a context-aware one.

#### Step 1.5.1 — Verify HubSpot MCP availability

Use `ToolSearch` to confirm `mcp__claude_ai_HubSpot__search_crm_objects` and `mcp__claude_ai_HubSpot__get_crm_objects` are loaded.

- **MCP available:** Proceed to 1.5.2.
- **MCP not loaded:** Skip the pull gracefully. Mark the Customer Context section in the guide as: *"⚠️ HubSpot MCP not loaded this session — customer context unavailable. Verify CRM data manually before call OR re-run prep with HubSpot MCP connected."* Do NOT abort the prep workflow.

#### Step 1.5.2 — Resolve the company

Search HubSpot Companies by the agency name passed in (e.g., "[Agency Name] Fire Department"). Use `search_crm_objects` with `objectType: companies`.

**Disambiguation:**
- **0 matches:** Treat as cold contact / brand-new prospect. Note in guide. Proceed.
- **1 match:** Use it. Proceed to 1.5.3.
- **2+ matches:** Surface all matches to the VP of Product briefly (name + city/state + lifecycle stage) and ask which one. Don't guess on ambiguous agency names, since many agencies share the same name nationally (per the FEMA registry).

#### Step 1.5.3 — Pull company-level enrichment

Use `get_crm_objects` on the resolved company ID. Request these properties (at minimum):
- `name`, `domain`, `lifecyclestage`, `hs_lead_status`
- `state`, `city`, `country`
- `annualrevenue`, `numberofemployees` (proxies for department size)
- `industry`, `description`
- `createdate`, `hs_lastmodifieddate`
- **PSTrax-custom properties** (use `search_properties` if unsure what's available): ARR, modules subscribed, station count, contract start date, renewal date, build status, NPS score, champion flag, integration status

If standard properties don't surface ARR/modules/stations, run `search_properties` with `objectType: companies` once to discover PSTrax-specific custom fields, then re-pull with those property names.

#### Step 1.5.4 — Pull associated contacts

Use `get_crm_objects` to traverse the company → contacts association. For each contact, capture: name, title, email, phone, last activity date.

**Highlight in the guide:**
- The contact the VP of Product is meeting (if name provided) — confirm role, title, tenure
- Other contacts at the same agency who may be relevant (champion candidates, additional decision-makers)
- Recently-active contacts (last 30 days) — indicates engagement signal

#### Step 1.5.5 — Pull associated deals (if any)

Use `get_crm_objects` to traverse company → deals. For each deal: stage, amount, close date, deal owner, recent activity.

**Interpretation:**
- **Closed-won deals:** Existing customer. Surface ARR, contract dates, modules sold.
- **Open deals:** Active prospect. Surface stage, owner, expected close, blockers if noted.
- **Closed-lost deals:** Historical context. Surface lost-reason, competitor, date — useful for win-back conversations.
- **No deals:** Brand-new prospect. Confirm via lifecycle stage.

#### Step 1.5.6 — Populate the Customer Context section in the guide

Insert a dedicated section near the top of the guide (after Interview Metadata, before Pre-Call Context):

```markdown
## Customer Context (HubSpot)

**HubSpot record:** [Company Name] — [HubSpot URL or company ID]
**Lifecycle stage:** [Customer / Opportunity / Lead / etc.]
**PSTrax status:** [Active customer since YYYY-MM-DD / Open deal Stage X / Prospect / Closed-lost YYYY-MM-DD]

**If existing customer:**
- ARR: $[N]
- Modules subscribed: [list]
- Station count (HubSpot): [N]
- Build status: [In build / Live / Renewing]
- Contract end / Renewal: [date]
- Account owner (CSM): [name]
- NPS / health score: [if available]

**If active prospect:**
- Deal stage: [name + amount + expected close]
- Deal owner (AE): [name]
- Competitor (if noted): [name]
- Last activity: [date + summary]
- Notes from sales team: [recent activity log snippets]

**If closed-lost:**
- Date lost: [date]
- Reason: [from HubSpot]
- Competitor (if noted): [name]
- Win-back potential: [Hot / Warm / Cold based on time-since-loss + reason]

**Contacts at this agency:**
| Name | Title | Last Activity |
|---|---|---|
| [Contact name] (today's call) | [if title in HubSpot] | [date] |
| [Other contact] | [title] | [date] |

**Recent CX/Sales activity (last 90 days):**
- [Date]: [Activity summary]
- [Date]: [Activity summary]

**Implications for the call:**
- [1-2 sentences: what the HubSpot context changes about how to run the call]
```

#### Step 1.5.7 — Adapt the rest of the prep workflow

The HubSpot pull should reshape downstream steps:

| HubSpot Finding | Adapt the Prep Guide |
|---|---|
| Existing customer, high adoption | Skip "Current Process" warm-up depth — they know it. Pivot to depth-of-use questions, champion-cultivation questions, expansion-readiness questions. |
| Existing customer, low adoption | Add adoption-blocker questions to Current Process section. Don't probe expansion; probe friction. |
| Existing customer, near renewal | Add renewal-context questions ("What would make you renew without thinking about it?"). Surface to the chief experience officer/CS pre-call. |
| Open prospect, late stage | Skip discovery-style questions. Focus on objection-handling + specific use-case validation. |
| Open prospect, early stage | Full discovery-style guide. Probe pain + budget + decision authority. |
| Closed-lost | Win-back framing. Lead with "what changed" + "what would need to be different." Avoid pitching what they already rejected. |
| Brand-new prospect / no HubSpot match | Cold discovery — full standard prep guide, treat as Tier 4 first-contact. |

### Step 1.6: Account Intelligence Engagement Pull (EXISTING CUSTOMERS ONLY)

**Trigger:** Run this whenever Step 1.5 resolves the agency to an existing **customer** (HubSpot `lifecyclestage = customer`, or a closed-won deal). Skip for prospects / cold contacts / closed-lost (no product usage to pull).

**Why:** HubSpot tells you the commercial state (ARR, modules sold, renewal, CSM). It does NOT tell you whether the customer is *actually using* the product. The **Account Intelligence Master** workbook holds the real product-engagement picture — per-module event counts, activation %, health score/band, and what inventory they manage. An existing-customer VOC call shaped without it can walk into an "expansion" framing when the account is actually at-risk on adoption (or vice versa).

**Source file:** `<data-dir>/Account Intelligence Master.xlsx` (a workbook you maintain; not included) (binary — read with Python + openpyxl, `read_only=True, data_only=True`; do NOT try to Read it directly). Key sheets:
- **`Current`** (dept-level snapshot, one row per department) — the rich engagement row: `active_user_count` / `total_user_count`, `station_count`, `vehicle_count`, per-module inventory counts (`asset_count`, `controlled_substance_vial_count_Total`, `supplies_sku_count`, etc.), `module_*_provisioned` (Yes/No), per-module `*_events_t30d`, and `*_last_event_at` recency stamps.
- **`History`** (per-snapshot health trend) — `health_score`, `health_band`, and the four component scores (`score_activation`, `score_breadth`, `score_recency`, `score_depth`), `activation_pct`, `modules_active_t30d_n`, `whitespace_n`. Pull all snapshots for the dept to show trend if >1 exists.
- **`Data Dictionary`** — column definitions if a field is unclear.

**How to resolve the account:** match on `hubspot_company_id` (most reliable — you have it from Step 1.5) OR `account_name` / `dept_id`. Watch for national-name collisions (many agencies share a name); the HubSpot company ID disambiguates.

**Populate an `## Engagement Snapshot (Account Intelligence Master — snapshot [date])` section** in the guide, right after Customer Context. Include:
- Health score + band (🟢 Healthy / 🟡 Watch / 🟠 At Risk) with the 4-component breakdown
- Activation (active/total users), modules provisioned vs. modules active-in-30d, whitespace count
- Per-module event counts + recency — call out **which modules are live vs. stale** (the single most useful thing for shaping the call)
- Inventory under management (assets/CS vials/supply SKUs/vehicles)

**Interpretation rules:**
- **Health score = product-engagement diagnostic, NOT a churn/renewal predictor**. Never present it as "they're about to churn." Present it as "how deeply are they using what they bought."
- Figures are **WIP/directional** — flag known caveats: `total_user_count` can include all-time/inactive provisioned users (understates activation %); snapshots can be weeks stale; station counts sometimes disagree with HubSpot; some accounts have no HubSpot match.
- **Reshape the guide by the usage pattern, not just the commercial stage:**

| Engagement finding | Adapt the guide |
|---|---|
| High activation + most modules live | Expansion + champion-cultivation + whitespace-module probes |
| Low activation OR modules provisioned-but-stale | **Adoption-blocker diagnosis** — why isn't it sticking? Do NOT pitch whitespace |
| One module hot, another dormant despite big inventory | Lead with the contrast ("X is humming, Y isn't — why?"); often reveals double-entry / workflow-fit gaps |
| At-Risk band + near renewal | Flag to CSM pre-call; add retention-context questions |

**Graceful degradation:** if the file is missing or the dept isn't found, note *"⚠️ No Account Intelligence engagement row found for this dept — verify usage with CSM"* and proceed. Don't block the guide.

### Step 2: Identify Target Persona
**From TP_03, match to:**
- **Career Fire Chief** - Liability-focused, professional staff, large department
- **Volunteer Fire Chief** - Budget-constrained, part-time, wear multiple hats
- **Battalion Chief** - Operational focus, shift commander, incident command
- **City Manager** - Budget authority, multiple departments, risk-averse

**Selection criteria:**
- Who owns this workflow at the fire department?
- Who feels the pain most acutely?
- Who has budget authority for solving this?

### Step 3: Generate Standard VOC Questions

**Current Process (5-7 questions):**
- "Walk me through how you [do this task] today, from start to finish"
- "What tools or systems do you currently use?"
- "How often do you [perform this task]?"
- "Who else is involved in this process?"
- "What happens after [this step]?"

**Pain Points (3-5 questions):**
- "What frustrates you most about [this process]?"
- "What errors or issues occur most frequently?"
- "What workarounds have you developed?"
- "What would happen if you stopped doing [this task]? What are the consequences?"

### Step 4: Select Relevant Moat Dimensions

**Don't probe all 8 moats** - choose 3-5 most relevant to topic:

**Always include:**
- ⚖️ Mission-Critical Stakes (PSTrax = high-stakes industry)
- 🔗 Workflow Embeddedness (integration opportunities)

**Choose 1-3 more based on topic:**

| Topic Type | Likely Moats |
|------------|--------------|
| Equipment inspection (SCBA, apparatus) | Tacit Knowledge, Proprietary Data, HITL |
| Documentation/compliance | Mission-Critical Stakes, Customer Trust, HITL |
| New capability/feature | Workflow Embeddedness, Demonstrable ROI |
| Integration/automation | HITL, Customer Trust, Workflow Embeddedness |

### Step 5: Generate Moat-Probing Questions

**For each selected moat, create 2-3 questions:**

**🎯 Proprietary Data template:**
- "[DATA] How do you track [X] over time?"
- "[DATA] What patterns have you noticed across repeated [activities]?"
- "[DATA] If you could see trends across all [your units/stations], what insights would be valuable?"

**🧠 Tacit Knowledge template:**
- "[TACIT] When an experienced [role] looks at [equipment/situation], what do they notice that a rookie would miss?"
- "[TACIT] What 'gut feelings' or intuition guide your decisions about [X]?"
- "[TACIT] What unwritten rules exist for [this task]?"

**🔗 Workflow Embeddedness template:**
- "[WORKFLOW] What other systems or tools do you use during [this task]?"
- "[WORKFLOW] How does [this data/information] flow to other departments?"
- "[WORKFLOW] What downstream decisions depend on [this information]?"

**🤝 Human-in-the-Loop template:**
- "[HITL] What parts of [this task] could NEVER be automated? Why?"
- "[HITL] What would make you trust an AI recommendation about [X]?"
- "[HITL] Who needs to verify or approve [this outcome]?"

**⚖️ Mission-Critical Stakes template:**
- "[STAKES] What happens if [this task] is missed or done incorrectly?"
- "[STAKES] Has your department faced scrutiny (audit, investigation, lawsuit) over [this area]?"
- "[STAKES] What documentation is required to prove [compliance/readiness] during an investigation?"

**🛡️ Customer Trust template:**
- "[TRUST] What would you need to see before allowing automation of [X]?"
- "[TRUST] How do you currently verify [critical information]?"
- "[TRUST] What would make you confident in an AI decision here?"

**📊 Demonstrable ROI template:**
- "[ROI] How much time does [this task] take per week?"
- "[ROI] What does [this problem] cost you in time, money, or risk?"
- "[ROI] If this were solved, what would you be able to do that you can't do now?"

### Step 6: Write PM Notes

**For each moat section, explain:**
1. What moat opportunity this probes for
2. Why it matters strategically (not just tactically)
3. What PSTrax gains if we build this moat

**Template:**
"Probing for [MOAT NAME] opportunity. [What we'd learn] becomes defensible because [competitive dynamic]. [Specific example of how this builds moat]."

**Example PM Note:**
"Probing for Tacit Knowledge moat. If we can codify what experienced fire chiefs notice intuitively during SCBA inspections, we create expertise that competitors can't replicate by just using generic AI models. This becomes defensible if we capture it before NFPA standardizes inspection criteria into public checklists."

### Step 7: Format Using Template

Use structure from `templates/voc_guide.md`:
1. Interview Metadata (persona, topic, duration)
2. Introduction (thank you, confidentiality, recording permission)
3. Warm-up questions
4. Standard VOC sections (Current Process, Pain Points)
5. Moat-probing sections (with emoji icons: 🎯 🧠 🔗 🤝 ⚖️ 🛡️ 📊)
6. PM Notes after each moat section
7. Wrap-up questions

### Step 8: Quality Check

**Before saving, verify:**
- [ ] Persona is specific (not just "fire chief")
- [ ] 2-3 questions per moat dimension
- [ ] All questions properly tagged
- [ ] PM Notes explain strategic opportunity (not just repeat question)
- [ ] Questions are conversational, not academic
- [ ] No leading questions or solution suggestions
- [ ] Uses template structure

---

## Question Quality Standards

**Excellent moat-probing questions:**
- ✅ Open-ended (not yes/no)
- ✅ Ask for examples and specifics
- ✅ Probe for patterns or trends over time
- ✅ Conversational tone ("walk me through" not "describe")
- ✅ Help PM discover, don't validate assumptions

**Poor moat-probing questions:**
- ❌ Leading ("Wouldn't it be great if...")
- ❌ Assume solutions ("How would you use a dashboard...")
- ❌ Too abstract ("What does readiness mean to you?")
- ❌ Academic jargon ("How would you characterize...")
- ❌ Yes/no questions without follow-ups

**Example - Excellent:**
"When an experienced fire chief inspects SCBA gear, what do they notice that a rookie would miss?"
→ Open-ended, asks for specifics, probes tacit knowledge, conversational

**Example - Poor:**
"Do you think AI could help with inspections?"
→ Yes/no question, assumes solution (AI), too vague

---

## Output

**Save to:** `shared/output/voc/Guide_[Topic]_[Date].md`

**Example filename:** `shared/output/voc/Guide_SCBA_Inspections_2026-02-13.md`

**File should contain:**
- Complete interview guide using template structure
- Standard VOC questions (Current Process, Pain Points)
- 3-5 moat-probing sections (2-3 questions each)
- PM Notes explaining strategic opportunity for each moat
- All questions properly tagged with moat labels

---

## After Completion

**Write to daily log:**
Append to `skills/VOC/memory/YYYY-MM-DD.md`:
```markdown
## Prep Workflow Session

**Topic:** [Research topic]
**Persona:** [Target persona]
**Moats probed:** [List of moat dimensions included]

**Decisions made:**
- [Why chose this persona]
- [Why selected these moat dimensions]
- [Any questions about approach]

**For MEMORY.md:**
- [Any patterns worth remembering]
```

---

## Common Mistakes to Avoid

1. **Forcing all 8 moats into every guide** - Choose 3-5 most relevant
2. **Generic personas** - "Fire chief" is too vague; specify Career/Volunteer/Battalion
3. **Leading questions** - Don't ask "Wouldn't it be great if..." or "How would you use..."
4. **Academic language** - Keep it conversational and natural
5. **Missing PM Notes** - Every moat section needs strategic explanation
6. **Solution suggestions** - Stay in research mode, don't propose features
