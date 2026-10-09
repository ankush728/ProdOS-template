# ProdOS: a product-management operating system on Claude Code

ProdOS is a set of instructions, workflows and background agents that turn Claude Code into a working environment for a product leader. It captures what happens around you (meetings, email, customer calls, tickets), turns that capture into structured knowledge and decisions, and keeps everything in plain files that a person or an agent can read.

This repository is a **template**. It contains the design of the system. It does not contain any company data, customer research, meeting records or memory logs.

## Architecture

```
  CAPTURE (background agents)          SYNTHESIS (skills and workflows)         SHARED FILES (what the team works from)
  ---------------------------          --------------------------------         ---------------------------------------
  Zoom Watch   -> drop zone     ->     Triage -> Transcript Intelligence  ->    output/transcripts/<quarter>/
  Inbox Watch  -> drop zone            VOC, PRD, CTO, Strategy, Think           shared/output/voc/  (customer research)
  Call research (/demos)               Pulse, Weekly Recall, Initiative Brief   shared/knowledge/truth_pack/  (canonical facts)
                                       IdeasSync, JiraStatus                    tasks/, projects/, output/*
```

1. **Capture.** Background agents pull transcripts and watch the inbox on a schedule and append raw material to a *drop zone*. They never interpret it.
2. **Synthesis.** A triage agent classifies each drop-zone item and routes it to the right skill. Skills (`skills/<Name>/CLAUDE.md`) and multi-agent workflows (`.claude/workflows/*.js`) turn raw material into extractions, analyses, PRDs, briefs and recommendations.
3. **Shared files.** Every output is a markdown file in a known place. Other skills read those files. The team reads the canonical subset (the Truth Pack and customer research) from a shared repository mounted at `shared/`.

### Files are the coordination layer

Skills do not call each other through APIs or queues. One workflow writes a file; other workflows read it. This keeps the system inspectable (you can open any intermediate result), diffable (git shows what changed) and resilient (a failed step leaves its inputs intact). Where two windows or agents need to agree on state, they use a small state file (for example, which session owns the background crons).

### The three-window pattern

Session crons fire into the session that created them, and MCP payloads (transcripts, call lists) are the main context cost. Work is placed by where its cost can be ignored:

| Window | Command | Absorbs | Lifetime |
|---|---|---|---|
| **A: agents** | `/boot` | cron firings, transcript pulls, triage processing | open all day, never read |
| **B: working** | `/standup`, then real work | the daily brief, inbox scan, `/catchup` drains | your focus |
| **C: research** | `/demos` | call enumeration and transcripts | opened, read once, closed |

A step belongs in window A only if it has high payload, low surviving output and no interactive decision. Findings produced in window A reach window B through `/catchup`.

### Memory: skills improve from corrections

Every skill has two memory layers:

- `memory/YYYY-MM-DD.md`: raw daily notes (what happened, what you corrected, what you liked).
- `MEMORY.md`: distilled, curated lessons that the skill loads at the start of each run.

`/save` writes the daily notes at the end of a session and proposes `MEMORY.md` additions for your confirmation. Over time the skills carry your preferences, recurring errors to avoid and calibration notes without re-prompting. In this template every `MEMORY.md` is empty and starts growing when you use the skill.

## Folder map

| Path | What lives there |
|---|---|
| `CLAUDE.md` | System entry point: identity, routing, principles. Claude reads it at conversation start. |
| `GOALS.md` | Your goals and ownership areas (sample provided). |
| `skills/<Name>/` | One folder per skill: `CLAUDE.md`, optional `workflows/`, `knowledge_context.md`, `tools/`, `MEMORY.md`. |
| `agents/<name>/` | Background agents (inbox watch, zoom watch, triage). |
| `.claude/workflows/` | Multi-agent workflow scripts (evidence sweep, attribution audit, engagement review). |
| `.claude/hooks/` | Safety hooks (blocks scripted writes that would truncate a repo file). |
| `templates/` | Document structures (PRD, CTO reviews, strategy artifact, initiative brief, and others). |
| `scripts/` | Scan and maintenance scripts. |
| `mcp-servers/gong-mcp/` | A small MCP server for call-recording search (needs your own credentials). |
| `tasks/` | `active.md`, `backlog.md`, `archive/`. |
| `projects/` | Project workspaces and `PROJECT_REGISTRY.md`. |
| `meetings/1on1s/` | One folder per person, plus `templates/`. |
| `drop-zone/` | Raw capture waiting for triage. |
| `triage-summaries/` | Daily triage summaries and quarterly digests. |
| `output/` | Skill outputs (transcripts, strategy, think sessions, recall, pulse, and so on). |
| `knowledge/` | Stable reference facts (`reference/`) and a never-shared layer (`_personal/`). |
| `shared/` | Mount point for the team repository: `knowledge/truth_pack/`, `knowledge/pm_principles/`, `output/voc/`. |
| `state/` | Ephemeral coordination state (gitignored). |

## Setup

1. **Install Claude Code** and open this folder as the project.
2. **Copy `.env.example` to `.env`** and fill in only the keys for the scripts you plan to run. Never commit `.env`.
3. **Connect MCP servers** for the tools you use: Gmail, Google Calendar and Drive, Zoom, a CRM (for example HubSpot), Jira/Confluence (Atlassian), and a call-recording tool. `mcp-servers/gong-mcp/` shows the pattern for a custom server; supply your own credentials in a local, gitignored `.mcp.json`.
4. **Fill in the identity layer:** the Identity section of `CLAUDE.md`, `GOALS.md`, and the files under `knowledge/reference/`.
5. **Write your Truth Pack.** Use `shared/knowledge/truth_pack/TP_TEMPLATE.md` as the structure and create the TP files that `CLAUDE.md` references.
6. **Run `/boot`** in one window to start the background agents, then `/standup` in your working window.
7. The write-safety hook is registered in `.claude/settings.json`. Add your own permission allowlist to a local `.claude/settings.local.json` (not shipped).

## What's not included

- Company, customer, partner, investor and board data of any kind.
- Memory logs (`MEMORY.md` files are empty; `memory/` folders do not exist yet).
- The contents of the Truth Pack and the PM-principles library (structure only).
- Customer research, call transcripts and extractions.
- The third-party diagram package that `skills/Diagram/` depends on, and that skill's helper scripts.
- The Consultant skill's topic library (the ingest workflow is included; the topics are yours to build).
- Brand specs, spreadsheets, decks and any binary file.

Several skills describe integrations with a CRM, a ticketing system or a call-recording tool. Those instructions are kept as design; they need your own accounts and data to do anything useful.
