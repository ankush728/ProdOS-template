# ProdOS - Product Management Operating System

System entry point. Claude reads this at conversation start.

# Identity

I am the **VP of Product** at **PSTrax** (fire/EMS compliance software). Replace this section with your own role, company and one-line product description when you adopt the template.

------------------------------------------------------------------------

# System Structure

## 1. Identity & Focus

-   Goals, ownership areas and strategic priorities → `@GOALS.md`
-   Weekly priorities and quarterly objectives → `@GOALS.md` (updated weekly)

------------------------------------------------------------------------

## 2. Work Capture

-   Quick tasks → `@tasks/backlog.md`
-   Active work (keep it short, see the cap in the file header) → `@tasks/active.md`
-   Completed work → `@tasks/archive/`
-   Larger initiatives → `@projects/`

------------------------------------------------------------------------

## 2a. Projects

-   Project registry → `@projects/PROJECT_REGISTRY.md`
-   Project workspaces → `@projects/[project-slug]/`
-   Managed by → `@skills/ProjectKickstart/`

------------------------------------------------------------------------

## 3. Product Work (Skills)

Each skill lives in `skills/<Name>/` with a `CLAUDE.md` (role, principles, routing), optional `workflows/`, and a `MEMORY.md` that grows with use.

### VOC (Voice of Customer)

`@skills/VOC/` - Interview preparation, transcript analysis, pattern synthesis.

### PRD (Product Requirements)

`@skills/PRD/` - Socratic PRD coaching, section by section.

### CTO (Technical Review)

`@skills/CTO/` - Moat validation, build vs buy, technical feasibility.

### Strategy (Chief Strategy Officer)

`@skills/Strategy/` - Strategic thinking partner with two commands: `/strategy` (moat-focused analysis) and `/update-knowledge` (Truth Pack maintenance).

### 1:1 (Executive Relationship Management)

`@skills/1on1/` - Living person profiles and 1:1 prep. Commands: `/1on1 add`, `/1on1 prep`, `/1on1 profile`, `/1on1 list`.

### Transcript Intelligence

`@skills/transcript-intel/` - Multi-lens transcript extraction: action items, decisions, VOC signals, competitive intel, strategic learnings, relationship notes, personal insights. Command: `/transcript [file]`.

### Board-Learn (Board Deck Intelligence)

`@skills/board-learn/` - Board deck extraction across canonical sections with citation rigor, then proposed patches to Truth Pack files. Commands: `/board-learn [file]` (extract) and `/board-propagate [YYYYQQ]` (propagate).

### Project Kickstart (Workspace Management)

`@skills/ProjectKickstart/` - Persistent project workspaces with conversational intake and a central registry. Commands: `/project start`, `/project list`, `/project update`, `/project close`.

### Think (Structured Thinking Partner)

`@skills/Think/` - Socratic partner that pressure-tests a problem one question at a time and pushes toward a committed next action. Supports pause and resume. Command: `/think`.

### Diagram (Code and System Diagrams)

`@skills/Diagram/` - Traces a flow in a code repository (read-only) or takes a description, then renders an interactive HTML diagram through a third-party diagram package (not included in this template). Command: `/diagram <flow>`.

### Consultant (Learning Knowledge Base)

`@skills/Consultant/` - Ingests learning journals, extracts frameworks into indexed topic files that other skills query at runtime. Command: `/ingest [journal]`.

### Boot (Session Bring-Up)

`@skills/boot/` - Brings the session up and reports posture: probes the MCP connections, checks `CronList`, and starts any background agent that is down by invoking that agent's own start command. It specifies nothing itself; cron schedules and prompt bodies live only in each agent's `CLAUDE.md`. Command: `/boot`.

### 🪟 The three-window pattern

Session crons fire into the session that created them, and MCP payloads are the real context cost. Work is placed by where its cost can be ignored, not by subject:

| Window | Command | Absorbs | Lifetime |
|---|---|---|---|
| **A: agents** | `/boot` | all cron firings, transcript pulls, triage processing | open all day, never read |
| **B: working** | `/standup`, then real work | the brief, the inbox scan, `/catchup` drains | your focus |
| **C: research** | `/demos` | call enumeration and transcripts (very large payloads) | opened, read once, closed |

**Placement test:** send a step to window A only if it has high payload, low surviving output, and no interactive decision. **Coordination is files, never memory:** a gitignored state file records which session owns the crons, and a catchup marker records how far findings have been drained.

### Demo Calls (Call-Recording Research Session)

`@skills/demo-calls/` - Owns call-recording research end to end: enumerates the previous business day's external calls above a duration threshold, presents a picker, extracts what the user names via transcript-intel, then propagates the results. Commands: `/demos`, `/demos YYYY-MM-DD`, `/demos <n>`, `/demos all`. Run it in its own disposable window; the knowledge persists as files, so every other activity inherits it for free.

### Catchup (Agent Findings → Working Window)

`@skills/catchup/` - Drains what the background agents produced since you last looked and surfaces only what needs a decision. Small local files only, no MCP. Incremental via `state/catchup.md`. Commands: `/catchup`, `/catchup watch`, `/catchup watch stop`, `/catchup --all`.

### Triage Agent

`@agents/triage/` - Coordinator that processes the Drop Zone, classifies items, routes them to downstream skills and writes triage summaries. Commands: `/triage`, `/triage-watch`, `/triage-watch stop`.

### Inbox Watch Agent

`@agents/inbox-watch/` - Session-bound Gmail monitor that scans on a schedule, surfaces attention-worthy emails with suggested actions, and ingests emails into ProdOS on request. Command: `/inbox-watch`.

### Zoom Watch Agent

`@agents/zoom-watch/` - Recurring Zoom transcript fetcher. Pulls transcripts on demand or on a schedule and appends them to the drop zone as `SOURCE: transcript` blocks. It does not classify or extract; triage does that downstream. Commands: `/zoom-watch`, `/zoom-watch pull`, `/zoom-watch pull <reference>`, `/zoom-watch stop`.

### Pulse (Business Intelligence)

`@skills/Pulse/` - Monthly and weekly business-intelligence reports with a Conductor + Scout architecture. Scouts query the CRM, web search, data files and the VOC skill; the conductor synthesizes cross-signal patterns. Commands: `/pulse run --month YYYY-MM`, `/pulse check --week YYYY-MM-DD`.

### Weekly Recall (Operating Rhythm)

`@skills/WeeklyRecall/` - Accountability ritual with four movements: accountability check, so-what synthesis, next week's plan, horizon scan. Conversational, not a report. Command: `/weekly-recall`.

### IdeasSync (Ideas Intelligence)

`@skills/IdeasSync/` - Syncs an idea-management project in Jira Product Discovery, classifies ideas and supports a kill pass. Commands: `/ideas sync`, `/ideas triage`.

### JiraStatus (Epic Delivery Status)

`@skills/JiraStatus/` - Read-only delivery report for one Jira epic: what shipped, what is in review and for how long, linked pull-request state, unstarted scope. The data pull runs in a subagent. Command: `/jira-status <EPIC-KEY | feature name> [--quick]`.

### Blood Program Tracker (Segment GTM Census)

`@skills/BloodProgramTracker/` - Periodic cross-reference of an external agency roster against the CRM, producing a bucketed census in a single living file. Command: `/blood-tracker`.

### Initiative Brief (Roadmap → Engineering Estimation)

`@skills/InitiativeBrief/` - Drafts the product half of an initiative brief for each roadmap item by mining VOC, ideas, Truth Pack and transcripts. Commands: `/brief [item]`, `/brief all`, `/brief list`.

### Quarterly Compaction (Cold-Tier Digest & Archival)

`@skills/QuarterlyCompaction/` - At quarter close, distills a quarter of transcripts and triage summaries into theme digests, then archives the granular files to a reversible staging folder. Command: `/compact-quarter [YYYYQQ]`.

### Design Spec Generator

`@skills/design-spec-generator/` - Turns a user story into a design specification for a prototyping tool.

### Sync Shared (Canonical Team-Repo Git)

`@skills/sync-shared/` - The only thing that runs git against the shared team repository mounted at `shared/` (gitignored from the personal repo). Canonical team context (Truth Pack, competitive intel, VOC, roadmap) lives there. Sensitive content stays in `knowledge/_personal/`, never in shared. Commands: `/sync-shared pull`, `/sync-shared publish`.

------------------------------------------------------------------------

## 4. Knowledge Bases

### Company Context (Truth Pack)

`@shared/knowledge/truth_pack/`. See `TP_TEMPLATE.md` for the structure of a Truth Pack file.

-   **TP_01** Positioning
-   **TP_01A** Company Strategy
-   **TP_02** Market Facts
-   **TP_03** Personas
-   **TP_04** Product Scope
-   **TP_05** Security & Privacy
-   **TP_07** Competitive Intelligence Registry
-   **TP_08** Pricing & Packaging
-   **EP_01** Engineering Context

### PM Craft Frameworks

`@shared/knowledge/pm_principles/` (AI moat framework, VOC best practices, AI strategy series, product principles).

### Stable Reference Facts

`@knowledge/reference/` (`company.md`, `product.md`, `team.md`, `ext_stakeholders/`).

### Personal-Sensitive Layer (never synced to shared)

`@knowledge/_personal/` holds board and personnel-confidential canonical material, including the decision log. It lives only in the personal repository and is excluded from the shared team repository and from `sync-shared`.

------------------------------------------------------------------------

## 5. Meetings

-   1:1 notes → `@meetings/1on1s/` (one folder per person; append notes)
-   Standups → `@skills/MorningStandup/memory/` (one file per day, `YYYY-MM-DD.md`)
-   One-off meetings → `@meetings/` (root level)

------------------------------------------------------------------------

## 6. Quick Capture

-   Uncertain where it belongs → `@_temp/`
-   Weekly cleanup

------------------------------------------------------------------------

## 7. Output Archival

At the start of each month, archive the previous month's output subdirectories:

```
output/triage/YYYY-MM-*      →  output/triage/archive/YYYY-MM/
```

-   Active directories contain only the current month's items
-   Archived items remain accessible at the `archive/YYYY-MM/` path
-   Update any live path references when archiving
-   Skill memory files are not archived; they are date-stamped and low-volume
-   Triage summaries and transcripts are compacted quarterly (see below), not monthly

### Transcript & Triage Quarterly Compaction (`@skills/QuarterlyCompaction/`)

At the close of each quarter, transcripts and triage summaries follow a two-tier lifecycle:

-   **HOT (current quarter):** `output/transcripts/<quarter>/` holds one sectioned `.md` file per meeting plus a `.raw.md` sibling when raw text exists; `output/transcripts/INDEX.md` is the retrieval index. `triage-summaries/triage_YYYY-MM-DD.md` accrue daily.
-   **COLD (at quarter close):** distill each quarter into `output/transcripts/digests/<quarter>_digest.md` and `triage-summaries/digests/<quarter>_triage_digest.md`, then move the granular files to `_archive_move_out/` (reversible staging, never hard-deleted). `INDEX.md` and `digests/` stay in the repository.
-   Shared VOC folders are excluded from compaction.

### Binary Files

Binary files (PDF, PPTX, XLSX, DOCX) do not belong in git. See `.gitignore`.

------------------------------------------------------------------------

# How Skills Work

> **Claude Code skill routing:** ProdOS uses custom skills stored in `skills/` and agents stored in `agents/`. When the user invokes a `/command` (e.g. `/standup`, `/1on1 prep <person>`, `/triage`), do not use the Skill tool, which will report an unknown skill. Find the matching folder under `skills/` or `agents/`, read its `CLAUDE.md`, and execute the workflow directly.

Skills are **domain containers**. Each contains:

-   `CLAUDE.md`: identity, role, principles, routing logic
-   `MEMORY.md`: long-term learnings (curated over time)
-   `memory/`: daily session logs (raw notes)
-   `workflows/`: specific task workflows (prep, analyze, review, and so on)
-   `tools/`: automation scripts

------------------------------------------------------------------------

## Natural Language Skill Routing

Claude matches intent → skill → workflow and executes. No paths are needed.

### Routing Patterns

**VOC** (`skills/VOC/`)
- "Create interview guide for [topic]" → VOC prep workflow
- "Analyze @[transcript]" / "Analyze transcript about [topic]" → VOC analyze workflow
- "Find patterns across interviews" / "Synthesize @shared/output/voc/" → VOC synthesis workflow

**Morning Standup** (`skills/MorningStandup/`)
- `/standup`, "Morning standup", "What's on deck today?", "What happened yesterday?" → morning standup

**CTO** (`skills/CTO/`)
- "Validate moat for [feature]" / "Is [feature] technically defensible?" → moat validation
- "Should we build or buy [capability]?" → build vs buy
- "Can we build [feature]?" / "Technical feasibility of [feature]" → feasibility

**Strategy** (`skills/Strategy/`)
- `/strategy [question]` or "Strategy: [question]" → strategic analysis
- `/update-knowledge` or "Update knowledge base" → Truth Pack maintenance
- Auto-invokes CTO when build decisions are detected and no CTO output exists

**PRD** (`skills/PRD/`)
- `/prd [Feature Name]` → start a new PRD | `/prd continue [Feature Name]` → resume | `/prd list` → list sessions | `/prototype` → generate prototype requirements

**PowerPoint** (`skills/PowerPoint/`)
- `/pptx [Topic]` → create a presentation with auto-loaded context | `/pptx-prompt [Topic]` → portable prompt file | `/pptx save` / `pause` / `resume`

**1:1** (`skills/1on1/`)
- `/1on1 add [Person]` | `/1on1 prep [Person]` | `/1on1 profile [Person]` | `/1on1 list`

**Transcript Intelligence** (`skills/transcript-intel/`)
- `/transcript [file]` or "Analyze this transcript"

**Board-Learn** (`skills/board-learn/`)
- `/board-learn [file]` | `/board-propagate [YYYYQQ]`

**Project Kickstart** (`skills/ProjectKickstart/`)
- `/project start [Name]` | `/project list` | `/project update [Name]` | `/project close [Name]`

**Think** (`skills/Think/`)
- `/think`, "I need to think through...", "Help me work through..."

**Diagram** (`skills/Diagram/`)
- `/diagram <flow>` or "diagram how X works in the code" → trace the code, then render
- `/diagram <type> <description>` → diagram a described system | `/diagram list`

**Consultant** (`skills/Consultant/`)
- `/ingest [journal filename]` | `/ingest` (all un-indexed journals) | "Ingest journal"

**Boot** (`skills/boot/`)
- `/boot`, "boot the session", "start my agents", "are my crons running?"

**Catchup** (`skills/catchup/`)
- `/catchup`, "what did the agents find?", "catch me up" | `/catchup watch` | `/catchup watch stop` | `/catchup --all`

**Triage Agent** (`agents/triage/`)
- `/triage` or "Process the drop zone" | `/triage-watch` | `/triage-watch stop`

**Inbox Watch Agent** (`agents/inbox-watch/`)
- `/inbox-watch` or "Monitor my email" | "Check my email" → immediate scan | "Read this in" / "Process this email" → ingest | "Dismiss [email]" | `/inbox-watch stop`

**Zoom Watch Agent** (`agents/zoom-watch/`)
- `/zoom-watch` | `/zoom-watch pull` | `/zoom-watch pull <reference>` | `/zoom-watch stop`

**Pulse** (`skills/Pulse/`)
- `/pulse run --month YYYY-MM` | `/pulse check --week YYYY-MM-DD`

**Weekly Recall** (`skills/WeeklyRecall/`)
- `/weekly-recall`, "Weekly recall", "End of week review"

**IdeasSync** (`skills/IdeasSync/`)
- `/ideas sync` | `/ideas triage` | "Show me ideas for [module]"

**JiraStatus** (`skills/JiraStatus/`)
- `/jira-status <EPIC-KEY>` | `/jira-status <EPIC-KEY> --quick` | `/jira-status morning`

**Blood Program Tracker** (`skills/BloodProgramTracker/`)
- `/blood-tracker` or "Run blood program tracker"

**Initiative Brief** (`skills/InitiativeBrief/`)
- `/brief [item]` | `/brief all` | `/brief list`

**Quarterly Compaction** (`skills/QuarterlyCompaction/`)
- `/compact-quarter [YYYYQQ]` (defaults to the just-closed quarter; `--force` for the open quarter)

> For full sub-command options and syntax, load `SKILLS_REFERENCE.md`.

### Routing Logic

Claude identifies intent by keywords (interview guide → VOC, standup → MorningStandup), context (`@transcript` → VOC analyze), and action verbs (validate → CTO, create → prep, analyze → analyze). If intent is unclear, Claude asks a clarifying question. Explicit paths (`@skills/VOC/workflows/prep/`) always work as a manual override.

------------------------------------------------------------------------

# Filesystem Coordination Pattern

Skills communicate through **files**, not APIs.

    VOC Analyze workflow
      ↓ writes to
    shared/output/voc/Analysis_[Name]_[Date].md
      ↓ read by
    VOC Synthesis workflow
      ↓ writes to
    shared/output/voc/Synthesis_[Date].md
      ↓ read by
    PRD Kickoff workflow (uses customer insights)

### Transcript Intelligence

    /transcript [file]
      ↓ writes to
    output/transcripts/<quarter>/<date>_<slug>.md   (one sectioned file; 8 ## lens sections)
    output/transcripts/<quarter>/<date>_<slug>.raw.md   (sibling when raw text exists)
    output/transcripts/INDEX.md   (one row appended per meeting)
      ↓ downstream skills read SECTIONS, not separate files:
    VOC Synthesis (## VOC Signals), Strategy (## Strategic Learnings),
    1:1 Skill (## Relationship Notes), Standup (## Action Items),
    Decision Log (## Decisions)

### Board-Learn

    /board-learn [file] → output/board/BM_learnings_[YYYYQQ].md
      → reviewed by the user →
    /board-propagate [YYYYQQ] → proposes patches to Truth Pack files
      → applied after approval

### Project Workspaces

    /project start [Name]
      ↓ creates
    projects/[slug]/BRIEF.md, CONTEXT.md, RUNNING_LOG.md, PARKING_LOT.md
      ↓ registers in
    projects/PROJECT_REGISTRY.md

### Think

    /think
      ↓ loads
    GOALS.md, tasks/active.md, domain-specific Truth Pack files
      ↓ produces
    output/think/[YYYY-MM-DD]_[session-slug].md
      ↓ commits actions to
    tasks/active.md, tasks/backlog.md
      ↓ session state saved to
    skills/Think/sessions/[session-slug].md

### Triage Agent

    /triage
      ↓ reads
    drop-zone/dropzone_*.md (all unprocessed files)
      ↓ transcripts route to
    /transcript skill → output/transcripts/<quarter>/<date>_<slug>.md
      ↓ email/notes/slack route to
    extract-general workflow → output/triage/[date]_[source]-[N]/
      ↓ writes
    triage-summaries/triage_YYYY-MM-DD.md
      ↓ archives to
    drop-zone/archive/dropzone_YYYY-MM-DD_archived.md
      ↓ uncertain items to
    drop-zone/holding_YYYY-MM-DD.md

### Inbox Watch

    /inbox-watch
      ↓ scans
    Gmail MCP (inbox, recent window)
      ↓ surfaces
    Attention alerts with suggested actions
      ↓ on "read this in"
    extract-general workflow → output/triage/YYYY-MM-DD_inbox-[N]/
      ↓ auto-propagates
    Truth Pack, tasks, profiles (same as triage)

### Zoom Watch

    /zoom-watch (or the scheduled crons)
      ↓ queries
    Zoom MCP search_meetings + get_meeting_assets
      ↓ dedups against
    drop-zone/dropzone_*.md + drop-zone/archive/dropzone_*_archived.md (ZOOM_UUID field)
      ↓ appends transcript blocks (SOURCE: transcript) to
    drop-zone/dropzone_YYYY-MM-DD.md
      ↓ consumed by
    /triage → transcript-intel skill → output/transcripts/<quarter>/<date>_<slug>.md

### Pulse

    /pulse run --month YYYY-MM
      ↓ dispatches
    Scouts (CRM, conversations, web search, product data, cross-signal)
      ↓ assembles
    output/pulse/Pulse_YYYY-MM.md (monthly)
    output/pulse/Pulse_Check_YYYY-MM-DD.md (weekly)

### Weekly Recall

    /weekly-recall
      ↓ reads
    output/recall/ (previous week's commitments)
    meetings/, output/triage/, output/transcripts/, output/pulse/ (this week's artifacts)
    knowledge/_personal/ decision log, tasks/active.md, GOALS.md
      ↓ produces (after the conversational ritual)
    output/recall/YYYY-MM-DD.md

### IdeasSync

    /ideas sync
      ↓ pulls from
    Atlassian MCP (Jira Product Discovery)
      ↓ writes to
    output/ideas/ideas_db.md (single-table database)
    output/ideas/sync_log.md (cumulative log)
      ↓ read by
    /ideas triage → output/ideas/triage_YYYY-MM-DD.md

### Initiative Brief

    /brief [item] | /brief all
      ↓ reads the roadmap live from a spreadsheet
      ↓ mines shared/output/voc/, output/ideas/ideas_db.md, Truth Pack, output/transcripts/, GOALS.md
      ↓ writes
    shared/output/briefs/Brief_<item-slug>.md   (product half only)
    shared/output/briefs/INDEX.md

### Quarterly Compaction

    /compact-quarter [YYYYQQ]
      ↓ reads
    output/transcripts/<quarter>/ + INDEX.md, triage-summaries/triage_*.md, tasks/active.md (reference check)
      ↓ writes (stay in repo)
    output/transcripts/digests/<quarter>_digest.md
    triage-summaries/digests/<quarter>_triage_digest.md
      ↓ moves (reversible staging, confirmation-gated)
    granular files → _archive_move_out/

### Key Principle

One workflow writes. Others read. No conflicts. No shared mutable state.

------------------------------------------------------------------------

# Memory System

Skills improve over time through persistent files.

1.  **Daily logs (raw session notes):** `skills/<Skill>/memory/YYYY-MM-DD.md` holds what happened, what was learned and the feedback received.
2.  **Long-term memory (curated):** `skills/<Skill>/MEMORY.md` holds distilled patterns, preferences and lessons learned.

> Memory is limited. If something must persist, write it to a file. Mental notes do not survive session restarts. Files do.

After each session, append to `memory/YYYY-MM-DD.md` and periodically distill insights into `MEMORY.md`.

------------------------------------------------------------------------

# Commands

## Work Capture

Add [task] to @tasks/backlog.md · Move [task] from backlog to @tasks/active.md · Complete [task], move to @tasks/archive/

## Meeting Prep

Review @meetings/1on1s/<person>/PROFILE.md · Update after the meeting

## Quick Capture

Save this to @_temp/ for later processing

## System Health

`/heartbeat` uses @HEARTBEAT.md to check system health.
`/save` uses @SAVE.md to write session memory before ending a conversation. Run it before closing any session that produced meaningful work, and as a recovery step if a previous session ended abruptly.

------------------------------------------------------------------------

# Working Principles

1.  **Pointers, not duplication.** `CLAUDE.md` links to files; it does not duplicate content.
2.  **Context is king.** Skills load relevant knowledge before responding (VOC loads personas and the moat framework; PRD loads product scope and the moat framework).
3.  **Workflows over monoliths.** Small, focused files instead of giant prompts.
4.  **Skills contain workflows.** Hierarchy: skill → workflows → steps.
5.  **Challenge assumptions.** Do not blindly execute; ask strategic questions; push back on vague requests.
6.  **Files are coordination.** Workflows write files; other workflows read files. No APIs, no message queues.
7.  **Memory compounds.** Each session improves performance through `MEMORY.md` updates.

------------------------------------------------------------------------

# Reference Loading Rules

**Always reference:** `@GOALS.md`, `@shared/knowledge/truth_pack/`, `@shared/knowledge/pm_principles/PMOP_01`

**Sometimes reference:** `@knowledge/reference/`, `@templates/`, `@tasks/active.md`, skill `MEMORY.md` files

**Load at workflow start:** the skill's `MEMORY.md`, the skill's `knowledge_context.md`, today's daily log (if it exists)

# Check the current date and time at the start of a new conversation

Run `[System.TimeZoneInfo]::ConvertTimeBySystemTimeZoneId((Get-Date), '<your time zone id>')` (or the equivalent for your shell) before beginning any task, so dates in outputs are correct.

------------------------------------------------------------------------

# Quality Standards

Every skill output must:

-   Reference the Truth Pack for company context
-   Consider the moat framework for defensibility implications
-   Provide evidence (quotes, data, sources)
-   Be actionable (clear next steps)
-   Align with strategy (`@GOALS.md`)

------------------------------------------------------------------------

## Writing Style (all drafted prose: emails, docs, board content, messages)

-   Avoid em dashes in content that may be shared externally. Use commas, periods or parentheses.
-   Avoid setup-and-negate constructions ("do X, not Y", "not just A, but B"). State the point directly and positively.
-   Lead with the point; make a recommendation, not a survey.
-   Plain language over jargon in customer-facing writing. Describe the benefit, not the internal feature name.

------------------------------------------------------------------------

## Avoid

-   Generic persona references (specify the persona, for example career vs volunteer chief)
-   Solutions without evidence
-   Efficiency-first framing (lead with defensibility)
-   Feature-parity thinking (build moats, not features)

------------------------------------------------------------------------

# System Principles

-   Defensibility beats efficiency
-   Workflow before data
-   Build moats, not features
-   Proprietary feedback loops beat generic AI
-   Evidence-based decisions
-   Strategic thinking before execution
-   Learning compounds over time
-   Simple coordination (files) beats complex orchestration
