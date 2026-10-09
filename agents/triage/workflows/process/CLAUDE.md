# Triage Agent — Process Workflow

## Your Role in This Workflow

You are the orchestrating coordinator processing the Drop Zone queue. You read, classify, route, summarize, and clear.

**Your job:** Process every item in the Drop Zone through classification → routing → summary generation → archival.

**Stop condition — You're done when:**
- [ ] All Drop Zone files processed
- [ ] Signals auto-propagated to all relevant knowledge base files
- [ ] Triage summary written/appended
- [ ] Held items filed (if any)
- [ ] User warned about pre-existing held items (if any)
- [ ] Processed files archived
- [ ] Completion confirmation displayed (with propagation summary)
- [ ] Inbox watch verified running (started if not)

---

## Knowledge to Load

Follow the two-pass loading strategy from `agents/triage/knowledge_context.md`.

**Pass 1 — Load immediately (minimal scan context):**
- `agents/triage/MEMORY.md`
- `knowledge/reference/team.md`
- List all directories in `meetings/1on1s/` to know tracked people

**Pass 2 — Load after scanning Drop Zone content (conditional):**
- `shared/knowledge/truth_pack/TP_07 Competitive Intelligence Registry.md` → only if competitor names, win/loss language, or pricing comparisons detected
- `shared/knowledge/truth_pack/TP_03 Customer Archetypes & Personas.md` → only if customer pain points, feature requests, or VOC patterns detected

Do not load TP_07 or TP_03 before scanning. Many runs contain only internal notes or emails with no competitive or VOC content.

---

## Phase 1: Pre-Flight Check

### Step 1: Check for Held Items

Scan `drop-zone/` for any `holding_*.md` files with content.

**If held items exist:**
Display warning:
```
⚠ HELD ITEMS PENDING REVIEW

There are [N] items in the holding area from previous runs:
- holding_2026-03-05.md: [N] items
- holding_2026-03-06.md: [N] items

These require manual review before they can be processed.
Proceeding with current Drop Zone queue...
```

**If no held items:** Continue silently.

### Step 2: Scan for Drop Zone Files

Look for all files matching `drop-zone/dropzone_*.md` that have content (non-empty, not just whitespace).

**If no files found or all empty:**
```
Drop Zone is empty. Nothing to process.

To add items, create or edit: drop-zone/dropzone_YYYY-MM-DD.md
Format:
DATE: YYYY-MM-DD
SOURCE: transcript | email | notes | slack
RAW:
[paste content here]
```
Create today's file if it doesn't exist, then stop.

**If files found:** List them and record the start time (wall clock), then continue.

```
Found [N] Drop Zone file(s) to process:
- dropzone_2026-03-06.md ([N] items)
- dropzone_2026-03-07.md ([N] items)

Starting triage...
```

---

## Phase 2: Parse & Classify

### Step 3: Parse Items

For each Drop Zone file, split content on `---` (triple-dash) separator.

For each item, extract:
- `DATE` field (from `DATE:` line)
- `SOURCE` field (from `SOURCE:` line)
- `RAW` content (everything after `RAW:` until next separator or end of file)

### Step 4: Validate Fields

For each parsed item, check:

1. **DATE field present?** If missing → ask user (don't assume)
2. **SOURCE field present?** If missing → ask user (don't assume)
3. **SOURCE value recognized?** Must be one of: `transcript`, `email`, `notes`, `slack`. If unrecognized → ask user
4. **RAW content present?** If empty → skip with note in summary

**Asking format (batch all questions together):**
```
ITEMS NEEDING CLARIFICATION

Item [N] from dropzone_2026-03-06.md:
- Missing SOURCE field
- Content preview: "[first 100 chars of RAW]"
- What is the source type? (transcript / email / notes / slack)

Item [M] from dropzone_2026-03-07.md:
- Unrecognized SOURCE: "teams"
- Content preview: "[first 100 chars of RAW]"
- What is the correct source type? (transcript / email / notes / slack)
```

Wait for user response before continuing.

### Step 5: Classify Call Type (Transcripts Only)

For items where SOURCE = `transcript`, infer the call type from the raw content:

**Classification logic:**

1. **Scan for participant patterns:**
   - Two speakers, one is the VP of Product → likely 1:1
   - Customer/external name + product discussion → likely VOC
   - Competitor names from TP_07 → likely competitive
   - All PSTrax team members → likely internal

2. **Scan for content patterns:**
   - Pain points, feature requests, "wish it could" → VOC signal
   - Win/loss, pricing comparison, competitor features → competitive signal
   - Action items between two people, career/personal topics → 1:1 signal
   - Project updates, sprint, roadmap, engineering → internal signal

3. **Apply classification:**
   - If clear signal: assign call type
   - If mixed/unclear: classify as `unclear` → route to holding area

**For non-transcript sources (email, notes, slack):** Call type is `N/A` — these go through the extract-general workflow instead.

---

## Phase 3: Route & Process

### Step 6: Process Each Item

Process items sequentially. For each classified item:

#### Route A: Transcript Items

**If call type = VOC, 1:1, competitive, or internal:**

1. The transcript content needs to go through the transcript-intel skill
2. However, within triage context, use a streamlined approach:
   - Run the 7-lens extraction directly (same lenses as transcript-intel)
   - Skip the interactive speaker disambiguation and lens approval (process all qualifying lenses automatically)
   - Save output as ONE sectioned file at `output/transcripts/<quarter>/<date>_<slug>.md` (e.g. `output/transcripts/2026Q2/2026-05-26_pm-1on1.md`), with a sibling `<date>_<slug>.raw.md` when the raw transcript is retained
   - Append a row to `output/transcripts/INDEX.md` (create if missing)

   > **Design note:** Triage intentionally bypasses transcript-intel's interactive steps (speaker disambiguation, lens approval) to enable batch processing. The triage summary serves as the review checkpoint instead. Users should spot-check extraction quality in the output file.

3. **After extraction, route downstream based on call type:**

   **VOC call:**
   - Note in summary: "VOC signals extracted — run `/update-knowledge` to propagate to Truth Pack"
   - If competitive intel also detected: note for TP_07 update

   **1:1 call:**
   - Note in summary: "Relationship notes extracted — review and update PROFILE.md for [person]"
   - If the person has a profile in `meetings/1on1s/[Person]/PROFILE.md`, note the profile path

   **Competitive call:**
   - Note in summary: "Competitive intel extracted — run `/update-knowledge` to propagate to TP_07"

   **Internal meeting:**
   - Note in summary: "Meeting processed — review action items and decisions"
   - If strategic signals detected: note for TP_01A consideration

#### Route B: Non-Transcript Items (email / notes / slack)

**Before routing, assess content richness to determine extraction mode:**

**LIGHT EXTRACTION (single-file)** — use when ALL of the following are true:
  - RAW content is under ~500 words (approximately 1 printed page)
  - Source is email, notes, or slack (not transcript)
  - Content covers a single topic or thread (not a multi-topic dump)
  - Quick scan does NOT detect competitive intel, VOC signals, or strategic decisions

**FULL EXTRACTION (multi-lens)** — use when ANY of the following are true:
  - RAW content exceeds ~500 words
  - Content covers multiple distinct topics
  - Content contains competitive intel, VOC signals, or strategic decisions (detected during quick scan)
  - Item is explicitly flagged as rich by the user

**Routing:**
1. Route to the extract-general workflow (`agents/triage/workflows/extract-general/CLAUDE.md`)
2. Pass the extraction mode: `light` or `full`
3. Light mode produces a single `00_summary_and_actions.md` file
4. Full mode applies the standard 7 lenses with threshold filtering
5. Save outputs to `output/triage/[YYYY-MM-DD]_[source]-[item-N]/`

#### Route C: Uncertain Items

1. Write the item to `drop-zone/holding_YYYY-MM-DD.md` (use today's date)
2. Include the raw content and the reason for uncertainty
3. Format in holding file:
```markdown
## Held Item [N] — [timestamp]

**Original File:** dropzone_YYYY-MM-DD.md
**Reason:** [Could not determine source type / Call type unclear / Mixed signals]
**Content Preview:** [first 200 chars]

**Full Content:**
[complete raw content]

---
```

### Step 7: Auto-Propagation to Knowledge Base

**After extraction is complete for all items, automatically propagate signals to relevant files.** This is NOT optional — every triage run must propagate. Do not ask the user to run `/update-knowledge` manually.

**Propagation targets (check each, update if signals warrant):**

| Signal Type | Target Files | What to Update |
|-------------|-------------|----------------|
| Action items | `tasks/active.md` | Add new action items to appropriate section |
| Action items | `tasks/backlog.md` | Add WATCH items, future tasks — **🔴 under the hard cap in "Writing the backlog section" below** |
| Decisions | `knowledge/_personal/TP_06 Decision Log.md` | New decision entries |
| Competitive intel | `shared/knowledge/truth_pack/TP_07 Competitive Intelligence Registry.md` | Update competitor entries, add new competitors |
| Strategic learnings (product) | `shared/knowledge/truth_pack/TP_04 Product Scope and Module Map.md` | New integrations, scope changes |
| Strategic learnings (engineering) | `shared/knowledge/truth_pack/EP_01 — Engineering Context.md` | Infrastructure updates, blockers |
| Strategic learnings (strategy) | `shared/knowledge/truth_pack/TP_01A Company Strategy.md` | Strategy shifts, new priorities |
| Strategic learnings (market) | `shared/knowledge/truth_pack/TP_02 Market & Customer Facts.md` | New metrics, market data |
| Relationship notes | `meetings/1on1s/[Person]/PROFILE.md` | Log meeting, update persistent topics |
| Relationship notes | `knowledge/reference/team.md` | New people, role updates, background details |
| Pricing / billing intel | `shared/knowledge/reference/company.md` | Pricing changes, billing data |

#### 🔴 Writing the backlog section — actions plus pointers, NOT analysis

Triage is the single largest contributor to `tasks/backlog.md`, which **loads as a project instruction on every turn of every session**, so its size is a direct tax on all ProdOS work. Pruning the file only buys time; the lasting lever is how much each triage run writes into it.

**The cause is this step.** A backlog entry should carry the action plus a pointer. Triage must not append full analysis to `backlog.md` when that analysis already lives in the extraction file.

🔴 **The cap is denominated in BYTES, not lines.** A markdown line is unbounded, so a line-count cap constrains nothing: sections can comply with a bullet count and still be enormous.

**Hard rules:**
- **🔴 ~2,500 bytes per run, 4,000 hard ceiling — measure the section, do not eyeball it.** Whatever the item count. If it does not fit, **cut items**; do not trim adjectives out of every item to squeeze past.
  - ⚠️ **Treat 2,500 as the number to hit, not 4,000 as the number to stay under.** A section that lands near the ceiling is over budget even though it passes. At 3–4 runs a day, the difference compounds across a 14-day window of standing context.
- **≤15 items, ~120 bytes each — ONE sentence.** Format: `- [ ] **[action]** — [one sentence of why it needs the VP of Product]. → \`<extraction path>\` §[section]` **If an item needs a second sentence, the second sentence is in the extraction.**
- **At most one short verbatim quote per item, and only when the quote *is* the finding.** Do not stack quotes to build a case; the extraction already did that.
- **`Reinforces` is ONE line naming the threads**, with a pointer. `- **Reinforces:** [thread] N+[n] · [thread] · [thread] → see extraction §Notes`
- **`TP candidates` are numbered one-liners** — TP file, the claim in a clause, the source. Nothing more. **They are the second-largest consumer after the item list: keep each under ~150 bytes and never restate the evidence, which is what `/update-knowledge` reads the extraction for.**
- **`Do NOT propagate` is ONE line**, same shape as `Reinforces` — the ASR corrections and name cautions, comma-separated, no sub-bullets.
- **`Visibility (others-owned)` is one line per item, or cut entirely.** If it is not the VP of Product's and needs no decision from them, the extraction is enough.
- **Contradictions and held items go in the triage summary, not the backlog.** They already have a home in `triage-summaries/triage_YYYY-MM-DD.md`.

**The test before you write a line: is this sentence already in the extraction?** If yes, replace it with the pointer. **The extraction is the record; the backlog is the queue.**

**Propagation rules:**
1. **Read each target file before editing** — match existing format and style
2. **Append, never overwrite** — add new information, don't replace existing content
3. **Include source attribution** — every update must cite the source (e.g., "Source: The product manager 1:1, 2026-03-10")
4. **Skip files with no relevant signals** — don't touch files that have nothing new to add
5. **Use the Edit tool** — targeted edits, not full file rewrites
6. **Log all propagation** — include a "Propagation Summary" in the triage output showing which files were updated and what was added

**Output:** After propagation, create or update `output/triage/[date]_[slug]/propagation_log.md`:
```markdown
# Propagation Log

| File | Section Updated | What Was Added |
|------|----------------|----------------|
| [path] | [section] | [brief description] |
```

---

### Step 8: Contradiction Detection (Best-Effort)

> Note: Steps 8-11 were renumbered after adding Step 7 (Auto-Propagation).

For each processed item, check extracted signals against relevant Truth Pack content:

- **Factual claims** (numbers, dates, metrics) — compare against TP_02 Market Facts
- **Competitive claims** — compare against TP_07 Competitive Intel
- **Strategic statements** — compare against TP_01A Strategy

If a contradiction is found:
- Do NOT resolve it
- Add to the "Contradictions Flagged" section of the triage summary
- Format: "[Source item] claims [X] but [Truth Pack file] states [Y]"

---

## Phase 4: Summarize & Archive

### Step 9: Generate/Append Triage Summary

**File:** `triage-summaries/triage_YYYY-MM-DD.md` (use today's date)

**If file doesn't exist:** Create with header:
```markdown
# Triage Summary — YYYY-MM-DD
```

**Append a new run section:**

```markdown
---

## Run at [HH:MM]

**Items Processed:** [count]
**Run Duration:** [start time → end time]
**Queue Cleared:** Yes / No (with reason)
**Files Processed:** [list of dropzone filenames]

---

### Items Processed

#### Item 1: [brief descriptor from content]
- **Source:** [transcript / email / notes / slack]
- **Call Type:** [VOC / 1:1 / competitive / internal / N/A]
- **Skill(s) Called:** [transcript-intel / extract-general / none (held)]
- **Knowledge Updated:** [list paths, or "Flagged for update via /update-knowledge"]
- **Output Location:** [path to output files]
- **Status:** Processed / Held
- **Notes:** [observations, caveats, contradictions]

[repeat for each item]

---

### Held for Review
[List with reasons, or "None"]

---

### Contradictions Flagged
[List with details, or "None"]
```

### Step 10: Archive Processed Files

For each Drop Zone file that was fully processed:

1. Copy content to `drop-zone/archive/dropzone_YYYY-MM-DD_archived.md`
   - If the archive file already exists (from a previous run), append with a separator
2. Replace the original Drop Zone file content with a blank template so the user can immediately add new items without re-typing headers:
```
DATE:
SOURCE:
RAW:

```

### Step 11: Completion Confirmation

```
TRIAGE COMPLETE

Processed: [N] items from [M] files
  - [N] routed to skills
  - [N] held for review
  - [N] files updated via auto-propagation
Contradictions: [N] flagged

Summary: triage-summaries/triage_YYYY-MM-DD.md
Outputs: [list output directories created]
Propagation: [list files updated]

Recommended follow-ups:
- [ ] Review triage summary
- [ ] Review held items in drop-zone/holding_YYYY-MM-DD.md (if any)
- [ ] Spot-check propagated updates for accuracy

Available actions on these results:
- `/pptx [Topic]` — Create a presentation from triage findings
- `/strategy [question]` — Run strategic analysis on extracted signals
- `/prd [Feature]` — Start a PRD informed by triage insights
```

### Step 12: User-Requested Downstream Skills

**If the user asks to create a presentation, run strategic analysis, or start a PRD from the triage output:**

1. **Read the requested skill's `CLAUDE.md`** — e.g., `skills/PowerPoint/CLAUDE.md` for presentations
2. **Execute that skill's full workflow** — follow every step (context loading, user preferences, session logging)
3. **Pass triage extraction outputs as additional context** — the output files from this triage run are the primary input
4. **Do NOT bypass the skill** — the skill's process exists for quality standards, context loading, and session memory. Building the output directly without the skill's workflow is incorrect.

**Example: User says "create a presentation from this"**
→ Read `skills/PowerPoint/CLAUDE.md`
→ Execute `/pptx [Topic]` workflow (Step 1: Load Core Context, Step 2: Load Preferences, Step 3: Present Summary + ask for extras, Step 4: additional context = triage outputs, Step 5: hand off for creation)
→ After creation: execute `/pptx save` workflow (save file, update MEMORY.md, log session)

---

## Step 13: Verify Inbox Watch Running

After triage processing is complete, check if the inbox watch agent is running. This is a fallback — standup starts it each morning, but sessions can close mid-day.

1. Run `CronList` to check for existing inbox-watch cron jobs
2. **If cron jobs exist:** Do nothing (already running)
3. **If no cron jobs exist:** Start inbox watch by creating the 4 cron jobs defined in `agents/inbox-watch/CLAUDE.md` (hourly scan + 3 summaries). Report: "Inbox watch was not running — started."

This step is silent when inbox watch is already active.

---

## Quality Checklist (Self-Review Before Completing)

Before generating final summary, verify:
- [ ] Every Drop Zone item was either processed or held (none silently skipped)
- [ ] Every processed item has a clear routing decision documented
- [ ] **All signals propagated to relevant knowledge base files (Step 7)**
- [ ] **Propagation log created/updated in output directory**
- [ ] Uncertain items are in the holding area with reasons
- [ ] Triage summary follows the exact structure from this workflow
- [ ] Drop Zone files are archived before being cleared
- [ ] Contradictions (if any) are flagged, not resolved
- [ ] No editorial judgments made about content
- [ ] User was warned about pre-existing held items (if applicable)
- [ ] Inbox watch verified running (Step 13)
