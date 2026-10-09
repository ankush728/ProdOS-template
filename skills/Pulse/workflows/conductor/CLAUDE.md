# Conductor — Final Assembly

## Role

You are the **Pulse Conductor's assembly phase**. After all scouts have completed, you review the prior Watch List, write the Executive Summary, enforce the Watch List cap, and assemble the final output document.

---

## Execution Steps

### Step 0: Watch List Accountability Review

Before assembling the current run, review what was flagged for monitoring in the prior Pulse.

**Determine prior month file:**
- Target month: YYYY-MM → Prior month: one calendar month earlier
- Prior Pulse file: `output/pulse/Pulse_[prior-YYYY-MM].md`

**If prior Pulse file exists:**
1. Read its `## WATCH LIST` section.
2. For each Watch List item, assess its status using **only the current run's scout outputs** (do not do additional research — scouts have already gathered this month's data):
   - ✅ **Resolved** — The signal addressed itself, the action was taken, or it's no longer a concern
   - ⚠️ **Escalated** — The signal appeared again and grew stronger; must appear in this month's Executive Summary or Watch List
   - 🔄 **Still Open** — No new data; item persists unchanged and warrants carry-forward
   - ❓ **Inconclusive** — Relevant data wasn't gathered this run (scout was DATA UNAVAILABLE for that domain)

3. Write a `## WATCH LIST REVIEW` section to be placed **between the frontmatter block and the Executive Summary** in the assembled document:

```markdown
## WATCH LIST REVIEW (from [prior-YYYY-MM])

| Item | Status | Update |
|------|--------|--------|
| [Item name] | ✅ Resolved | [One sentence: what resolved it] |
| [Item name] | ⚠️ Escalated | [One sentence: how it escalated — carry to Watch List] |
| [Item name] | 🔄 Still Open | [One sentence: why it persists] |
| [Item name] | ❓ Inconclusive | [Which scout was unavailable] |
```

**Escalation rule:** Any item marked ⚠️ Escalated MUST appear in either this month's Executive Summary or Watch List with updated context. It cannot be silently dropped.

**If no prior Pulse file exists (first run):** Skip this step entirely and omit the section from the output.

---

### Step 1: Collect All Scout Outputs

Gather the output from each scout. For each, extract:
- Frontmatter block (machine-readable metadata)
- Section body (the narrative content with tags and action layers)

Count: how many scouts completed successfully vs. returned `[DATA UNAVAILABLE]`?

### Step 1b: Merge Scout 9 into Sections 03 and 04

Scout 9 (Local Government & Publications) returns its findings in destination blocks (`→ §03`, `→ §04`, `→ Competitor Signal Matrix candidates`). Splice them into the canonical sections:

- **Section 03 (Market & Procurement):** combine Scout 3A's web findings with Scout 9's §03 block. If the same buying-trigger or competitor move appears in both (e.g. a metro fleet refresh that 3A found via press and Scout 9 found in meetings_scan), state it **once** and note the dual sourcing — convergence raises confidence, it does not earn a second entry.
- **Section 04 (Regulatory & Standards):** combine Scout 3B's web findings with Scout 9's §04 block, same dedup discipline.
- **Competitor Signal Matrix:** hold Scout 9's matrix candidates for Step 2c.

If Scout 9 returned `[NO NEW LOCAL SIGNAL]`, `[NO HOT/WARM SIGNAL]`, or `[DATA UNAVAILABLE]`, §03/§04 render from their web scouts alone — do not add an empty Scout-9 note to the body.

**Weekly runs:** there is no §03/§04 — write Scout 9's combined hot/warm signals into the `## MARKET & FIELD SIGNALS` section instead (see weekly template in `skills/Pulse/CLAUDE.md`).

### Step 2: Write Section 09 — Churn & Retention Intelligence

Scout 7 is now active in **Limited Mode** using the HubSpot Cancel/Downgrade pipelines. Read Scout 7's output from the current run and use it for Section 09.

**If Scout 7 returned data:** Use Scout 7's output as the section body. Include the "⚠️ Limited Mode" caveat from Scout 7's Step 5 at the end of the section.

**If Scout 7 returned `[DATA UNAVAILABLE]`:** Write:
```markdown
## 09. CHURN & RETENTION INTELLIGENCE
[DATA UNAVAILABLE — HubSpot Cancel/Downgrade pipeline unreachable or returned no data for YYYY-MM. Check HubSpot MCP connection and retry, or ask the RevOps manager if cancel pipeline is populated.]
```

**Do NOT write `[TO BE BUILT]`** — Scout 7 Limited Mode is active. `[TO BE BUILT]` is retired.

### Step 2b: Write Section 11 — Valuation & Strategic Optionality

Read Scout 8's output and use it for Section 11. Scout 8 does NOT go dark when there's no new round — if its frontmatter `alerts` says "no in-month delta," it has carried standing valuation context forward from `output/pulse/competitor_health_tracker.md`; use that. Only write `[DATA UNAVAILABLE]` if Scout 8 itself returned it (network down AND empty tracker).

### Step 2c: Build the Competitor Signal Matrix

Assemble ONE scannable table that collapses every scout's competitor signals into an at-a-glance grid. This is placed directly **after the Executive Summary** (before Section 01).

- Source the rows from each scout's frontmatter `top_signal` + `alerts` and the canonical section bodies (including Scout 9's matrix candidates from Step 1b) — do NOT re-narrate; the matrix is a pointer/summary layer (each fact still lives in full only in its canonical section).
- Columns: `Company | Signal Type | Date | Summary | Impact on PSTrax`.
- Signal Type ∈ Funding / M&A / Product / Hiring / Org-Health / Review / Win-Loss / Regulatory / Transcript / Procurement / Publication.
- Impact = HIGH / MED / LOW, append "(favorable)" when it helps PSTrax.
- Primary-competitor rows first. Include a PSTrax row when an internal data point (win-rate, expansion) belongs at-a-glance.
- Standing context outside the month may appear with a `*` footnote.
- Cap ~12 rows; force-rank and drop the lowest if longer.

```markdown
## COMPETITOR SIGNAL MATRIX

| Company | Signal Type | Date | Summary | Impact on PSTrax |
|---|---|---|---|---|
| [Primary Competitor] | Funding | [Mon YYYY]* | [Illustrative: growth round earmarked for AI and scale] | HIGH |
| ... | | | | |

*\*outside the month: standing context still load-bearing.*
```

### Step 3: Write the Executive Summary (LAST)

**This is written LAST, after all sections are assembled.** The Executive Summary is NOT a table of contents — it is 3 bullets a CEO can act on.

**Assembly convention:** During document assembly (Steps 1-2, 4-5), write the Executive Summary section as a temporary placeholder:
```markdown
## EXECUTIVE SUMMARY
[PLACEHOLDER — TO BE WRITTEN AFTER ALL SECTIONS ASSEMBLED]
```
Only replace this placeholder with the actual 3-bullet summary as the **final writing step** after all numbered sections (01-10) and the Watch List are complete. This prevents premature synthesis before all scout data is available.

Rules:
- Maximum 3 bullets
- Each bullet tagged with strategic goal
- Written as if the VP of Product is saying this to the CEO in a hallway
- Lead with the most important signal across ALL scouts
- Include one forward-looking statement

Read all scout frontmatter `top_signal` fields. Read the Scout 6 cross-signal connections. Synthesize into 3 bullets.

**Format:**
```markdown
## EXECUTIVE SUMMARY

- **[Most important signal across all scouts]** `[Tag]` — [One sentence interpretation + recommended response]
- **[Second most important signal]** `[Tag]` — [One sentence interpretation + recommended response]
- **[Forward-looking signal or cross-signal connection]** `[Tag]` — [One sentence interpretation + what to watch]
```

### Step 4: Write the Watch List

**2-3 items maximum. Forward-looking, not a recap.**

Each item must:
- Name a specific thing to monitor next month
- Provide enough context that a reader knows exactly what signal to look for
- Be tagged with strategic goal
- NOT repeat what was already said in sections above — point forward

**Format:**
```markdown
## WATCH LIST

1. **[Thing to watch]** `[Tag]` — [What signal to look for, and what it would mean if found]
2. **[Thing to watch]** `[Tag]` — [What signal to look for, and what it would mean if found]
3. **[Thing to watch]** `[Tag]` — [What signal to look for, and what it would mean if found]
```

### Step 5: Assemble Final Document

Combine all sections into the fixed output structure per the template in `skills/Pulse/CLAUDE.md`:

**Monthly:** Write to `output/pulse/Pulse_YYYY-MM.md`
**Weekly:** Write to `output/pulse/Pulse_Check_YYYY-MM-DD.md`

Include the document-level frontmatter:
```yaml
---
generated: YYYY-MM-DD
month: YYYY-MM
scouts_completed: [N of 10]
scouts_unavailable: [list any that returned DATA UNAVAILABLE]
---
```

**Document assembly order:**
1. Frontmatter block
2. `## WATCH LIST REVIEW` (from Step 0 — omit if first run)
3. `## EXECUTIVE SUMMARY` (placeholder during assembly, replaced last)
4. `## COMPETITOR SIGNAL MATRIX` (Step 2c — directly after Exec Summary)
5. Sections 01–11 (scout outputs in order; §11 = Valuation & Strategic Optionality from Scout 8)
6. `## WATCH LIST` (Step 4 output — 2-3 items maximum)

**Watch List cap: 2-3 items only.** If more than 3 items seem worth flagging, force-rank them and drop the lowest. Anything cut can live in the relevant scout section. A bloated Watch List defeats its purpose.

#### Redundancy & Altitude Pass (required before finalizing)

Before writing the file, do one pass for the two failure modes the VP of Product flagged (recorded in the skill's MEMORY.md):

1. **Each fact stated once.** Scan for any competitor fact (a funding round, a hiring signal, a win-rate number, a review theme, a product launch, a procurement award/deployment) narrated in full in more than one section. Keep it in its **canonical section** (funding → §03, procurement award/competitor deployment → §03, hiring → §05, win rate → §01, reviews → §06, regulatory → §04) and reduce every other appearance to a pointer clause ("[Primary Competitor], see §01 scoreboard"). Watch specifically for a signal Scout 9 surfaced from a local scan that a web scout (3A/3B) also reported — collapse to one entry. **Scout 6 collapses the convergence into one insight — it must not re-narrate facts the sections already stated in full.** If Scout 6's connection is just a restatement, cut it or sharpen it into a genuinely new conclusion.
2. **Lead with net-new.** Confirm the Executive Summary and the emphasis lead with what the VP of Product could NOT already know — external signals (funding/M&A/hiring/regulatory/reviews) and quantified patterns first, convergence second, conversational evidence compressed and last. If §02 (sales conversations) ran in Delta mode but still reads as a rehash of calls the VP of Product ran, trim it to the aggregate/new delta.

A Pulse that states each insight once and leads with the non-obvious is worth more than a complete-but-repetitive one.

Also append one trend note to `output/pulse/competitive_tracker.md`:
```markdown
**YYYY-MM:** [One sentence describing the month's most notable competitive win rate movement]
```

### Step 6: Log Session

Append to `skills/Pulse/memory/YYYY-MM-DD.md`:
- Which scouts ran successfully
- Which returned DATA UNAVAILABLE
- Data quality issues encountered
- Unmapped competitor names found
- Output file path
