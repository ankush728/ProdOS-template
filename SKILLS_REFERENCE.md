# ProdOS Skills Reference

Full command syntax, sub-command options, and routing examples.

**Load this file when:** A user asks about how to use a specific skill, needs to see all sub-commands, or wants examples of how to invoke a workflow.

**Do NOT load this at session start.** The main `CLAUDE.md` has the L1 menu. Load this on demand.

---

## Detailed Command Reference

### Strategy Skill (`skills/Strategy/`)

Two commands:

1. **/strategy command** — Strategic thinking and analysis
   - `/strategy [question]`
   - `"Strategy: [question]"`
   - `"Ask strategy skill: [question]"`
   - Routes to Strategy skill for moat-focused strategic analysis

2. **/update-knowledge command** — Truth Pack maintenance
   - `/update-knowledge`
   - `"Update knowledge base"`
   - `"Refresh Truth Pack from recent decisions"`
   - `/update-knowledge from last [N] days/weeks`
   - Routes to Strategy skill knowledge maintenance workflow

**CTO Auto-Invocation:** When `/strategy` detects a build/product decision (e.g., "should we build X," "build vs buy," capability evaluation) and no relevant CTO output exists in `output/cto/BuildVsBuy_*.md` or `output/cto/Feasibility_*.md`, it automatically invokes the CTO `build_vs_buy` workflow before completing its strategic analysis. This ensures build decisions always have technical validation.

---

### PRD Skill (`skills/PRD/`)

Four commands:

1. **/prd [Feature Name]** — Start new PRD
   - `/prd SCBA Real-Time Dashboard`
   - `"Start PRD for [Feature Name]"`
   - Begins Socratic coaching process
   - One question at a time, section by section (8 sections)
   - Context-aware (loads VOC, CTO, Strategy, Truth Pack)

2. **/prd continue [Feature Name]** — Resume PRD
   - `/prd continue SCBA Dashboard`
   - `"Resume PRD for [Feature Name]"`
   - Loads session state, shows progress
   - Resumes from current section

3. **/prd list** — List all PRD sessions
   - Shows active and completed sessions
   - Progress (N/8), status, last updated

4. **/prototype** — Generate prototype requirements
   - Reviews current/selected PRD
   - Asks dynamic prototype decision questions
   - Generates Claude Code build instructions
   - Saves to output/prds/Prototype_*.md

---

### PowerPoint Skill (`skills/PowerPoint/`)

Five commands:

1. **/pptx [Topic]** — Create presentation with auto-loaded context
   - `/pptx the investor Q2 Update`
   - `"Create presentation on [Topic]"`
   - Always loads core context (Strategy, GOALS, VOC, CTO, TP_01, TP_01A, TP_02, TP_03)
   - Asks for additional context, then Claude creates

2. **/pptx save** — Save final presentation
   - Saves .pptx to output/presentations/
   - Updates MEMORY.md with session patterns
   - Logs session

3. **/pptx pause** — Pause and save progress
   - Saves session state for later resume
   - `/pptx pause`

4. **/pptx resume** — Resume paused presentation
   - Lists paused sessions
   - User selects, context reloaded fresh
   - `/pptx resume`

5. **/pptx-prompt [Topic]** — Build a portable prompt file to paste into Claude.ai
   - `/pptx-prompt the investor Q2 Update`
   - `"Generate presentation prompt for [Topic]"`
   - `"Build a prompt I can paste into Claude for [Topic] deck"`
   - Asks: audience, purpose, additional context
   - Loads full content of all relevant ProdOS files (not summaries)
   - Saves self-contained markdown to `output/presentations/prompts/`
   - Copy-paste the file into Claude.ai to create the deck there

---

### 1:1 Skill (`skills/1on1/`)

Manages executive relationships with living person profiles.

**Commands:**

**1. `/1on1 add [Person Name]`** - Create new person profile
- Setup: Role, background, meeting frequency, relationship type
- Creates: meetings/1on1s/[Person]/PROFILE.md
- Initializes: Profile template with basic info

**2. `/1on1 prep [Person Name]`** - Generate intelligent 1:1 prep
- Loads: Person profile, last 1:1 notes, relevant work context
- Auto-loads: tasks/active.md, GOALS.md, recent outputs (Strategy, VOC, CTO)
- Generates: Personalized agenda, communication tips, talking points
- Based on: Their role, priorities, communication style

**3. `/1on1 profile [Person Name]`** - View/edit person profile
- Shows: Current PROFILE.md
- Suggests: Updates based on recent 1:1 notes
- Allows: Manual profile edits

**4. `/1on1 list`** - Show all tracked relationships
- Lists: All people with last meeting date
- Highlights: Overdue follow-ups, long gaps
- Summary: By relationship type

---

### Transcript Intelligence Skill (`skills/transcript-intel/`)

One command:

1. **/transcript [file path]** — Extract multi-lens intelligence from any transcript
   - `/transcript inputs/transcripts/zoom-call-<date>.txt`
   - `"Analyze this transcript"`
   - `"Process transcript @[file]"`
   - `"Extract intelligence from [file]"`
   - `"What happened in this meeting?" (with transcript)`
   - Routes to transcript-intel extract workflow
   - Interactive at two points: speaker disambiguation + lens approval
   - Outputs to `output/transcripts/[YYYY-MM-DD]_[slug]/`

---

### Board-Learn Skill (`skills/board-learn/`)

Board deck PDF extraction and knowledge propagation.

**Commands:**

1. **/board-learn [file]** — Extract structured learnings from a board deck PDF
   - `/board-learn inputs/board-decks/Q1-2026-board-deck.pdf`
   - `"Process this board deck"`
   - `"Extract learnings from board deck"`
   - `"Analyze board deck @[file]"`
   - Routes to board-learn extract workflow
   - Interactive at one point: section confirmation
   - Outputs to `output/board/BM_learnings_[YYYYQQ].md`

2. **/board-propagate [YYYYQQ]** — Propagate board learnings to Truth Pack
   - `/board-propagate 2026Q1`
   - `"Update knowledge from board deck"`
   - `"Propagate board learnings from [quarter]"`
   - Routes to board-learn propagate workflow
   - Interactive at one point: patch approval
   - Proposes patches to TP_01, TP_01A, TP_02, TP_04, TP_06

---

### Project Kickstart Skill (`skills/ProjectKickstart/`)

Manages project workspaces with conversational intake and central registry.

**Commands:**

1. **/project start [Name]** - Kick off a new project
   - `/project start Voice AI Dashboard`
   - `"Start a project for [topic]"`
   - `"Kick off a project for [topic]"`
   - Conversational intake (4 questions), creates workspace + registry entry

2. **/project list** - View all projects
   - `/project list`
   - `"Show my projects"`
   - `"What's in flight?"`
   - Reads PROJECT_REGISTRY.md, groups by status

3. **/project update [Name]** - Log update or decision
   - `/project update Voice AI`
   - `"Log an update on [project]"`
   - `"Update the [project] project"`
   - Appends to RUNNING_LOG.md, updates registry

4. **/project close [Name]** - Close a project
   - `/project close [Name]`
   - `"Close out [project]"`
   - `"[Project] is done"`
   - Captures close-out note, marks complete in registry

---

### Triage Agent (`agents/triage/`)

One command:

1. **/triage** — Process the Drop Zone queue
   - `/triage`
   - `"Process the drop zone"`
   - `"Triage my inputs"`
   - `"Run triage"`
   - `"What's in the drop zone?"`
   - Routes to Triage Agent process workflow
   - Reads all unprocessed Drop Zone files
   - Classifies, routes to skills, generates summary
   - Archives processed files

---

## Routing Examples

**Example 1:**
```
User: "Create interview guide for apparatus daily checks"
Claude: [Routes to VOC prep workflow automatically]
```

**Example 2:**
```
User: "/standup"
Claude: [Routes to Morning Standup skill]
```

**Example 3:**
```
User: "Is real-time dashboard technically feasible?"
Claude: [Routes to CTO feasibility workflow]
```

**Example 4:**
```
User: "Validate moat for SCBA predictive maintenance"
Claude: [Routes to CTO moat validation workflow]
```

**Example 5:**
```
User: "/strategy Should we build predictive maintenance for SCBA?"
Claude: [Routes to Strategy skill /strategy command]
```

**Example 6:**
```
User: "Strategy: How should I position PSTrax moats to the investor?"
Claude: [Routes to Strategy skill /strategy command]
```

**Example 7 (CTO Auto-Invocation):**
```
User: "/strategy Should we build predictive maintenance in-house or buy?"
Claude: [Routes to Strategy skill → detects build decision → no CTO output exists →
        auto-invokes CTO build_vs_buy workflow → saves CTO output →
        resumes strategy analysis citing fresh CTO assessment]
```

**Example 8:**
```
User: "/update-knowledge"
Claude: [Routes to Strategy skill /update-knowledge command]
```

**Example 9:**
```
User: "Update knowledge base from recent decisions"
Claude: [Routes to Strategy skill /update-knowledge command]
```

**Example 10 - PRD:**
```
User: "/prd Predictive Maintenance for SCBA"
Claude: [Routes to PRD skill /prd command — Socratic coaching]
```

**Example 11 - Ambiguous:**
```
User: "Review this feature"
Claude: "What type of review?
- CTO technical feasibility?
- CTO moat validation?
- Strategy strategic analysis?
- PRD coaching? (/prd [Feature Name])"
```

**Example 12 - 1:1 Add:**
```
User: "/1on1 add the CEO"
Claude: [Routes to 1:1 skill /1on1 add command — setup questions]
```

**Example 13 - 1:1 Prep:**
```
User: "/1on1 prep the CEO"
Claude: [Routes to 1:1 skill — generates intelligent prep with profile + context]
```

**Example 14 - 1:1 Natural Language:**
```
User: "Prep for my 1:1 with the CEO"
Claude: [Routes to 1:1 skill /1on1 prep command]
```

**Example 15 - 1:1 List:**
```
User: "/1on1 list"
Claude: [Routes to 1:1 skill — shows all relationships with status]
```

**Example 16 - Transcript:**
```
User: "/transcript inputs/transcripts/zoom-call-<date>.txt"
Claude: [Routes to transcript-intel skill — speaker disambiguation → lens proposal → output generation]
```

**Example 17 - Transcript Natural Language:**
```
User: "Analyze this transcript" (with file reference)
Claude: [Routes to transcript-intel skill extract workflow]
```

**Example 18 - Project Start:**
```
User: "Start a project for competitive intelligence on a named competitor"
Claude: [Routes to Project Kickstart skill /project start command]
```

**Example 19 - Project List:**
```
User: "What projects are in flight?"
Claude: [Routes to Project Kickstart skill /project list command]
```

**Example 20 - Project Update:**
```
User: "Log an update on Voice AI"
Claude: [Routes to Project Kickstart skill /project update command]
```

**Example 21 - Project Close:**
```
User: "Close out the competitive intel project"
Claude: [Routes to Project Kickstart skill /project close command]
```

**Example 22 - Board Learn:**
```
User: "/board-learn inputs/board-decks/Q1-2026-board-deck.pdf"
Claude: [Routes to board-learn skill — section detection → section confirmation → deep extraction → output generation]
```

**Example 23 - Board Learn Natural Language:**
```
User: "Process this board deck" (with file reference)
Claude: [Routes to board-learn skill extract workflow]
```

**Example 24 - Board Propagate:**
```
User: "/board-propagate 2026Q1"
Claude: [Routes to board-learn skill — signal detection → diff generation → patch presentation → apply after approval]
```

**Example 25 - PowerPoint Prompt File:**
```
User: "/pptx-prompt the investor Q2 Update"
Claude: [Routes to PowerPoint skill /pptx-prompt command — asks audience/purpose/extras → loads full file contents → saves portable prompt to output/presentations/prompts/]
```

**Example 26 - PowerPoint Prompt Natural Language:**
```
User: "Build a prompt I can paste into Claude for a board deck"
Claude: [Routes to PowerPoint skill /pptx-prompt command]
```

**Example 27 - Triage:**
```
User: "/triage"
Claude: [Routes to Triage Agent — scans drop zone → classifies items → routes to skills → generates summary → archives]
```

**Example 28 - Triage Natural Language:**
```
User: "Process the drop zone"
Claude: [Routes to Triage Agent process workflow]
```

---

### Pulse Skill (`skills/Pulse/`)

Two commands:

1. **/pulse run** — Monthly full intelligence report
   - `/pulse run --month 2026-03`
   - `"Run pulse for March"`
   - `"Monthly pulse for 2026-03"`
   - Dispatches 8 scouts (7 active + 1 placeholder) in parallel, then cross-signal analysis
   - Requires `--month YYYY-MM` parameter (never inferred from system date)
   - First run automatically processes two months to establish trend baseline
   - Output: `output/pulse/Pulse_YYYY-MM.md`

2. **/pulse check** — Weekly signal check
   - `/pulse check --week 2026-03-20`
   - `"Weekly pulse check"`
   - Runs Scout 1 (pipeline movement), Scout 4 (customer voice), Scout 6 (cross-signal)
   - Requires `--week YYYY-MM-DD` parameter
   - Output: `output/pulse/Pulse_Check_YYYY-MM-DD.md`

**Data preparation:**
- Drop Gong transcript exports into `pulse-data/[YYYY-MM]/transcripts/` before monthly run
- Drop CSV/Excel data files into `pulse-data/[YYYY-MM]/` before monthly run
- Empty directories are handled gracefully — scouts mark sections as `[DATA UNAVAILABLE]`

**Scouts:**
| Scout | Source | Runs In |
|-------|--------|---------|
| 1. Revenue & Pipeline | HubSpot MCP | Monthly + Weekly |
| 2. Sales Conversations | pulse-data transcripts → VOC skill | Monthly only |
| 3A. Market & Procurement | Web search | Monthly only |
| 3B. Regulatory & Standards | Web search | Monthly only |
| 3C. Competitor Hiring | Web search | Monthly only |
| 4. Customer Voice | Web search (Reddit, G2, Capterra) | Monthly + Weekly |
| 5. Product Signal | pulse-data CSV/Excel | Monthly only |
| 6. Cross-Signal Analysis | All scout outputs | Monthly + Weekly |
| 7. Churn & Retention | TBD | [TO BE BUILT] |

---

### Weekly Recall (`skills/WeeklyRecall/`)

One command:

1. **/weekly-recall** — Friday accountability ritual
   - `/weekly-recall`
   - `"Friday recall"` / `"End of week review"`
   - Conversational — four movements with pause for user response between each
   - Output: `output/recall/YYYY-MM-DD.md`

**Four Movements:**
| # | Movement | Purpose |
|---|----------|---------|
| 1 | Accountability | Review last week's commitments against artifact evidence |
| 2 | So-What Synthesis | Surface 3-5 most consequential signals, connect to 90-day goals |
| 3 | Next Week's Plan | State goals → gap check → sharpness check → delegation check |
| 4 | Horizon Scan | Look 2-4 weeks ahead, flag preparation gaps |

**Key behaviors:**
- Challenges vague goals ruthlessly ("work on positioning" → "what artifact exists by Friday?")
- Maintains Running Patterns section that compounds across weeks
- Connects everything to 90-day goals (Roadmap, Vision, Product Marketing, Partnerships)
- Flags "built backwards" pattern when engineering proceeds without product definition

---

### Initiative Brief Skill (`skills/InitiativeBrief/`)

Drafts **Initiative Brief (Part A — Product Request)** documents for long-term-roadmap items by
mining repo knowledge. The fast, evidence-drafting counterpart to the PRD skill; the
estimation-grade handoff to engineering (dev anchors complete Part B). Reads the roadmap live
from a Google Sheet (`<roadmap-sheet-id>`).

Three commands:

1. **/brief [item]** — interactive single brief
   - `/brief [item]` / `"Draft an initiative brief for [item]"`
   - Resolves the item against the Sheet (confirms if fuzzy), mines evidence, drafts Part A,
     asks ≤3 targeted questions only where evidence is thin, finalizes.
   - Output: `output/briefs/Brief_<item-slug>.md`

2. **/brief all** — batch draft every roadmap item
   - `/brief all` / `/brief batch` / `"Create initiative briefs for the roadmap"`
   - Runs a **parallel-subagent Workflow** (one mining+draft agent per item). No live Q&A —
     open questions written into each brief's §7 as `⟶ NEEDS INPUT:` for the product manager review.
   - Output: all briefs + `output/briefs/INDEX.md`

3. **/brief list** — status index
   - `/brief list` / `"Which roadmap items have briefs?"`
   - Renders `output/briefs/INDEX.md`: item × bucket × status (none/draft/enriched) × open-Q
     count × last generated.

**Key behaviors:**
- Cites every non-obvious claim inline (`IDEA-NNN`, `<Customer> <date>`, `TP_07 <Competitor>`); marks
  single-source signals *directional*.
- Fills **Part A only** — never Part B (engineering sizing).
- Proposed solution describes WHAT (capability/outcome), not HOW.
- Overwrite-safe: never silently clobbers a brief a product manager already enriched.
- Distinct from PRD (deep Socratic single-feature → `output/prds/`); this is fast roadmap-wide
  drafting → `output/briefs/`.
