# ProdOS System Heartbeat

Invoked by `/heartbeat`. Run when the system feels stale, before a major work session, or when something seems off.

**Purpose:** Audit the health of ProdOS — not just task status, but whether the system itself is functioning correctly (memory fresh, files intact, knowledge current).

---

## How to Run

When `/heartbeat` is invoked:
1. Work through each check below in order
2. For each check, report: PASS / WARN / FAIL with a one-line finding
3. End with a prioritized fix list for any WARN/FAIL items

---

## Check 1: Skill Memory Freshness

For each skill, find its `MEMORY.md` and check when it was last meaningfully updated.

| Skill | Memory File | Check |
|-------|-------------|-------|
| VOC | `skills/VOC/MEMORY.md` | Any entries beyond template? |
| Strategy | `skills/Strategy/MEMORY.md` | Reflects recent strategy sessions? |
| CTO | `skills/CTO/MEMORY.md` | Updated after CTO reviews? |
| PRD | `skills/PRD/MEMORY.md` | Tracks PRD patterns? |
| 1:1 | `skills/1on1/MEMORY.md` | Updated after 1:1 sessions? |
| MorningStandup | `skills/MorningStandup/MEMORY.md` | Has standup preferences? |
| Boot | `skills/boot/MEMORY.md` | Records the no-duplication invariant + any cron-posture learnings? |
| Catchup | `skills/catchup/MEMORY.md` | Records why findings must flow back to the working window? |
| Demo Calls | `skills/demo-calls/MEMORY.md` | Records the duration-primary filter + Gong response-shape gotchas? |
| PowerPoint | `skills/PowerPoint/MEMORY.md` | Has presentation patterns? |
| Think | `skills/Think/MEMORY.md` | Has thinking session patterns? |
| Consultant | `skills/Consultant/MEMORY.md` | Has ingestion history? |
| Pulse | `skills/Pulse/MEMORY.md` | Tracks pulse run patterns and data source health? |
| WeeklyRecall | `skills/WeeklyRecall/MEMORY.md` | Tracks recall session patterns? |
| ProjectKickstart | `skills/ProjectKickstart/MEMORY.md` | Tracks project workspace patterns? |
| Transcript Intel | `skills/transcript-intel/MEMORY.md` | Tracks extraction patterns? |
| Board-Learn | `skills/board-learn/MEMORY.md` | Tracks board deck processing history? |
| InitiativeBrief | `skills/InitiativeBrief/MEMORY.md` | Tracks drafting patterns, evidence gaps, Drive-publish process? |
| IdeasSync | `skills/IdeasSync/MEMORY.md` | Tracks Jira sync/classification patterns? |
| JiraStatus | `skills/JiraStatus/MEMORY.md` | Records data-source facts (90-day graph TTL, payload sizes, status set)? |
| BloodProgramTracker | `skills/BloodProgramTracker/MEMORY.md` | Tracks PHTC cross-ref run history? |
| QuarterlyCompaction | `skills/QuarterlyCompaction/MEMORY.md` | Tracks compaction run history (per closed quarter)? |

**WARN if:** A skill has been used (outputs exist) but MEMORY.md is still a blank template.
**FAIL if:** A skill MEMORY.md file is missing entirely.

---

## Check 2: Output Recency

Scan `output/` for recency signals.

| Directory | What to check |
|-----------|---------------|
| `shared/output/voc/` | Any analysis files? Most recent date? |
| `output/cto/` | Any reviews? Most recent date? |
| `output/strategy/` | Any strategy artifacts? `MoatPortfolio_*.md` exists? |
| `output/board/` | Any board learnings? Current quarter processed? |
| `output/transcripts/` | Any transcript intel processed? |
| `output/prds/` | Any PRDs in progress? |
| `output/presentations/` | Any presentations saved? |
| `output/think/` | Any thinking session outputs? Most recent date? |
| `output/pulse/` | Any Pulse reports? Most recent monthly/weekly? `Pulse_YYYY-MM.md` or `Pulse_Check_YYYY-MM-DD.md`? |
| `output/recall/` | Any Weekly Recall outputs? Most recent Friday ritual? `YYYY-MM-DD.md`? |
| `output/triage/` | Any triage extraction outputs? Most recent date? |
| `output/hubspot/` | Any HubSpot data pulls? `archive/YYYY-MM/` directories? |

**WARN if:** A skill exists and has been used before, but its output directory has nothing from the last 30 days.
**WARN if:** `output/strategy/MoatPortfolio_*.md` does not exist (useful context for PowerPoint skill, but gracefully handled as absent). Consider generating before long-term vision work.

---

## Check 3: Active Task Staleness

Read `tasks/active.md`.

- Flag any task with no status change implied for >7 days based on dates mentioned
- Flag if more than **15** items are listed (violates the focus constraint)
- Flag if tasks reference files that don't exist (dead input pointers)
- **Check the file's own `## Notes` block against reality** — item count, "last recall" date, and any status claim it makes about itself

**WARN if:** Any active task has been "Pending" or "In Progress" with no update signal for >7 days, **or `active.md`'s Notes block describes the file inaccurately.**
**FAIL if:** active.md has **>15** items or references non-existent input files.

> ⚠️ **Keep this check in sync with the cap.** `active.md`'s cap is **15** (raised from 3–5 once items became multi-thread workstreams; the old cap pushed real work into `backlog.md` where it stopped being tracked). **When a rule changes, the checker that enforces it has to change in the same edit**, or the audit fails the system for following its own decision.
>
> The self-description sub-check exists because a stale Notes block (wrong item count, wrong "last recall" date) says work is undone when it is done, and invites re-running it.

---

## Check 4: Knowledge Base Integrity

Verify key referenced files and directories exist.

| Item | Expected Path | Status |
|------|--------------|--------|
| Truth Pack TP_01 | `shared/knowledge/truth_pack/TP_01 Company & Positioning.md` | Check exists |
| Truth Pack TP_01A | `shared/knowledge/truth_pack/TP_01A Company Strategy.md` | Check exists |
| Truth Pack TP_02 | `shared/knowledge/truth_pack/TP_02 Market & Customer Facts.md` | Check exists |
| Truth Pack TP_07 | `shared/knowledge/truth_pack/TP_07 Competitive Intelligence Registry.md` | Check exists |
| EP_01 | `shared/knowledge/truth_pack/EP_01 — Engineering Context.md` | Check exists |
| PMOP_01 | `shared/knowledge/pm_principles/PMOP_01_AI_Moat_Framework.md` | Check exists |
| GOALS.md | `GOALS.md` | Updated this quarter? |
| Stakeholders dir | `knowledge/reference/ext_stakeholders/` | Exists? |
| The CEO profile | `meetings/1on1s/<CEO>/PROFILE.md` | Exists and has content? |

**WARN if:** Stakeholders directory or the CEO's profile is missing.
**FAIL if:** Any core Truth Pack file (TP_01 through TP_04) is missing.

---

## Check 5: Session Log Coverage

Scan `skills/MorningStandup/memory/` for daily logs.

- How many standup logs exist?
- Most recent date?
- Any gaps >5 business days?

**WARN if:** Most recent standup log is >5 business days old and the VP of Product has been working (check active.md for recent updates).
**INFO:** This is not a failure — standups are optional — but long gaps suggest the system isn't being used for daily context.

---

## Check 6: Dead References Audit

Check for known dead references documented in `docs/audit/`:

| Reference | Location | Status |
|-----------|----------|--------|
| _(none currently open)_ | — | — |

**Standing decision:** `knowledge/reference/ext_stakeholders/` may hold nothing beyond its README. It is a deliberate, documented scaffold (the README defines the per-stakeholder format and the skills that consume it), and the content it anticipates is often written elsewhere: per-person files under `meetings/1on1s/*/PROFILE.md`, and sensitive investor or board material in `knowledge/_personal/` (where the sensitivity rule requires it). Reporting an unpopulated scaffold as a dead reference every run is noise. **Re-open only if a skill actually fails to find a stakeholder file it needs.**

**WARN if:** Any known dead reference from the audit remains unfixed.

---

## Check 7: Project Registry Integrity

Read `projects/PROJECT_REGISTRY.md` (if it exists).

- Any projects marked "active" with no updates in >14 days?
- Any project workspace directories missing their BRIEF.md?

**WARN if:** Active projects have gone silent >14 days.
**INFO:** Skip this check if no projects have been started yet.

---

## Check 8: Triage Agent Health

### Drop Zone
- Does `drop-zone/` directory exist?
- Any unprocessed `dropzone_*.md` files with content?
- Any `holding_*.md` files with unresolved items?

### Triage Summaries
- Does `triage-summaries/` directory exist?
- Most recent triage summary date?
- Gap between last triage run and today?

### Agent Memory
- Does `agents/triage/MEMORY.md` exist and have content beyond template?

**WARN if:** Holding area has unresolved items older than 3 days.
**WARN if:** Drop Zone has unprocessed files (material sitting without triage).
**INFO:** Skip if triage agent has never been run (no summaries exist).

---

## Check 9: Inbox Watch Agent Health

- Does `agents/inbox-watch/CLAUDE.md` exist?
- Does `agents/inbox-watch/MEMORY.md` exist and have content beyond template?
- Any inbox watch session logs in `agents/inbox-watch/memory/`?

**INFO:** Inbox Watch is session-bound (not persistent). This check verifies the agent is configured and has been used, not that it's currently running.

---

## Check 10: Pulse Skill Health

- Does `skills/Pulse/CLAUDE.md` exist with Conductor + Scout architecture?
- Does `skills/Pulse/knowledge_context.md` exist?
- Does `skills/Pulse/workflows/` directory have workflow files?
- Any monthly reports in `output/pulse/Pulse_YYYY-MM.md`?
- Any weekly checks in `output/pulse/Pulse_Check_YYYY-MM-DD.md`?
- Is HubSpot MCP accessible? (Scout 1 dependency)
- Does `output/hubspot/` have archived data?

**WARN if:** Pulse skill exists but no output has ever been produced.
**WARN if:** HubSpot archive directory is empty (data source not feeding Pulse).
**INFO:** Pulse depends on external MCP connections (HubSpot, web search). Check 10 verifies the skill structure; MCP availability is runtime-dependent.

---

## Check 11: Weekly Recall Skill Health

- Does `skills/WeeklyRecall/CLAUDE.md` exist?
- Does `skills/WeeklyRecall/MEMORY.md` exist and have content?
- Any recall outputs in `output/recall/YYYY-MM-DD.md`?
- If it's been >2 Fridays since the last recall output, flag it.

**WARN if:** WeeklyRecall skill exists but no recall output has ever been produced.
**WARN if:** More than 2 consecutive Fridays without a recall (suggests the operating rhythm has lapsed).

---

## Check 12: Output Cleanup Candidates

Scan `output/` directories and `_temp/` for files that have served their purpose and are candidates for archival out of the active repo. Use the age thresholds below; do **not** flag files referenced by open items in `tasks/active.md`.

### Age Thresholds by Directory

| Directory | What to scan | Cleanup threshold |
| --------- | ------------ | ----------------- |
| `_temp/` | All files | **7 days** (CLAUDE.md mandates weekly Friday cleanup) |
| `output/triage/` | Individual extraction *folders* (e.g. `<date>_notes-1/`) — **not** the `triage_YYYY-MM-DD.md` summary files, which stay | **30 days** |
| `output/transcripts/<quarter>/` | Individual meeting files (e.g. `<quarter>/<date>_customer-call.md`) and `.raw.md` siblings — **not** `INDEX.md` or `digests/` files, which stay | **Deferred to `/compact-quarter` at quarter close** — do NOT flag transcript files here; the `QuarterlyCompaction` skill digests + archives them (with the standup quarter-start nudge). Only flag if a prior quarter is still un-compacted >30 days after close (recommend running `/compact-quarter`). |
| `triage-summaries/` | Daily `triage_YYYY-MM-DD.md` summaries — **not** `digests/`, which stay | **Deferred to `/compact-quarter` at quarter close** (same as transcripts). Do NOT flag individually. |
| `output/think/` | Think session `.md` files | **60 days** |
| `shared/output/voc/` | Individual analysis files (`Analysis_*.md`) — **not** synthesis files (`Synthesis_*.md`), which stay | **60 days** |
| `output/hubspot/` | Raw data dump files directly in `output/hubspot/` (not inside `archive/`) | **60 days** |
| `output/board/` | Board extraction files where patches are marked applied or from a prior quarter | **90 days** |
| `output/presentations/` | All presentation files | **90 days** |
| `output/strategy/` | Working draft files (not the most recent file per topic) | **90 days** |
| `output/pulse/` | Monthly `Pulse_YYYY-MM.md` files — keep last 3 months, flag older | **90 days** |
| `output/recall/` | Weekly recall files — keep last 8 weeks, flag older | **56 days** |
| `output/*/archive/` | Already-archived content inside any output subdirectory | **120 days** |

### How to Run This Check

1. For each directory above, list files/folders matching the criteria (age + not referenced in active.md).
2. Group candidates by directory.
3. Count total items and approximate total size if possible.
4. Present the full candidate list to the VP of Product before taking any action.
5. **Ask for confirmation:** "Move these [N] items to `_archive_move_out/`?"
6. On confirmation, move each item to `_archive_move_out/[original-path]/`, preserving the directory structure. Create `_archive_move_out/` at the repo root if it doesn't exist.

### What NOT to flag

- Files explicitly referenced by open `[ ]` items in `tasks/active.md` or `tasks/backlog.md`
- Synthesis/summary files (keep the curated output, clean the raw extractions)
- The most recent file of any given type within a directory
- `.gitkeep` files

**CLEAN if:** Candidates found — present list and move on confirmation.
**PASS if:** No candidates meet any threshold.
**INFO:** `_archive_move_out/` is a staging area, not permanent deletion. Files can be reviewed before removing from git history.

---

## Check 13: Zoom Watch Agent Health

- Does `agents/zoom-watch/CLAUDE.md` exist?
- Does `agents/zoom-watch/MEMORY.md` exist?
- Does `agents/zoom-watch/workflows/pull/CLAUDE.md` exist?
- Are zoom-watch cron jobs registered? Check `CronList` for prompts mentioning `agents/zoom-watch/`. Expect 3 (12:30pm, 3:30pm, 6:00pm ET).
- Recent activity? Most recent `agents/zoom-watch/memory/YYYY-MM-DD.md` date — how stale?

**WARN if:** Zoom Watch is configured but fewer than 3 cron jobs exist (partial setup).
**WARN if:** Most recent zoom-watch memory log is >5 business days old AND crons are running (suggests pulls failing silently).
**INFO:** Skip if `/zoom-watch` has never been started (no memory logs, no crons). Configuration-only state is valid.

⚠️ **`CronList` is per-session.** If this heartbeat is not running in the agent window, it will see zero crons and that is not a finding. Read `state/agents.md` instead — `BOOT_DATE`, `CRON_COUNT` and `CRON_DETAIL` record which session owns today's crons. Expected posture is **8** (inbox-watch 4 · zoom-watch 3 · triage 1). Report a genuine gap only when the marker is absent or stale-dated.

---

## Check 14: Auto-Loaded File Size — /heartbeat OWNS THE BACKLOG SWEEP

`tasks/backlog.md`, `tasks/active.md`, `CLAUDE.md`, `GOALS.md` and `MEMORY.md` load as project instructions on **every turn of every session**, so their bytes are a standing tax on all ProdOS work. Measure them.

| File | Trigger | Action |
|------|---------|--------|
| `tasks/backlog.md` | **>150 KB** | **Run the 14-day sweep** (see below) |
| `tasks/active.md` | >150 KB | Flag for prune; the Weekly Recall owns it |
| others | >50 KB | Flag only |

**🔴 This check owns the sweep, and that ownership is the whole point of Check 14 existing.** The rule inside `backlog.md` says `/heartbeat` is the natural owner, but a rule with no check that performs it lets the file overrun its trigger repeatedly, with most of its content out of window and a large per-turn token cost. **Reporting the size is not the job; sweeping is.**

**The sweep:**
1. Cutoff = today − 14 days. Split every `## From YYYY-MM-DD …` and `## ⏰ DAY YYYY-MM-DD …` section on its date.
2. **Standing thematic sections stay regardless of age** — Monitor / Watch List, Parked, Someday, Unsorted, Notes, deferred workstreams, engineering backlog, onboarding sections, partner keep-warm checkpoints, Project Kickstart, Infrastructure, the carried-from-prune block, and any standing spec whose heading happens to start with a date (⚠️ it must not be swept on that date).
3. Move the rest **byte-identically** to `tasks/archive/backlog_YYYY-MM-DD.md`, under a header giving the cutoff, the counts, and **the live threads whose detail went with it** so nobody reconstructs them from scratch.
4. **Never delete. Verify the byte reconciliation** (new + archive − archive header == original) before replacing the file.
5. ⚠️ **Do not write the split with `open(path,'w')` on a repo file** — the PreToolUse hook in `.claude/hooks/` blocks it, and correctly. Build in the session scratchpad, verify, then copy over.
6. Update the backlog header's sweep log and "Most recent archive" line in the same pass.

**Also report the producer calibration:** average bytes per in-window dated section against the 2,500-byte target and 4,000-byte ceiling. Over the target but under the ceiling is a tuning note for `agents/triage/workflows/process/CLAUDE.md` and `skills/demo-calls/CLAUDE.md`; **over the ceiling is a producer defect.** A missed sweep, not a blown budget, is the usual cause of an oversized file.

**FAIL if:** `tasks/backlog.md` is over 150 KB. **Offer the sweep in the fix list with the measured before/after.**

---

## Output Format

```
# ProdOS Heartbeat - [Date]

## Summary
[N] checks run | [N] PASS | [N] WARN | [N] FAIL | [N] CLEAN

## Check Results

1. Skill Memory Freshness — [PASS/WARN/FAIL]
   [Finding]

2. Output Recency — [PASS/WARN/FAIL]
   [Finding]

3. Active Task Staleness — [PASS/WARN/FAIL]
   [Finding]

4. Knowledge Base Integrity — [PASS/WARN/FAIL]
   [Finding]

5. Session Log Coverage — [PASS/INFO]
   [Finding]

6. Dead References Audit — [PASS/WARN/FAIL]
   [Finding]

7. Project Registry Integrity — [PASS/WARN/SKIP]
   [Finding]

8. Triage Agent Health — [PASS/WARN/SKIP]
   [Finding]

9. Inbox Watch Agent Health — [PASS/INFO/SKIP]
   [Finding]

10. Pulse Skill Health — [PASS/WARN/SKIP]
    [Finding]

11. Weekly Recall Skill Health — [PASS/WARN/SKIP]
    [Finding]

12. Output Cleanup Candidates — [PASS/CLEAN]
    [N items across N directories qualify for archival]

    Candidates:
    - _temp/[filename] — [age] days old
    - output/triage/[folder]/ — [age] days old
    - output/transcripts/<quarter>/[file].md — [age] days old
    ...

    Move these [N] items to _archive_move_out/? (yes/no)

13. Zoom Watch Agent Health — [PASS/WARN/SKIP]
    [Finding]

14. Auto-Loaded File Size — [PASS/FAIL]
    backlog.md [N] KB / active.md [N] KB | in-window section avg [N] bytes vs 2,500 target
    [If over 150 KB: N sections older than [cutoff] qualify for the sweep — run it?]

---

## Fix List (WARN/FAIL items only)

1. [Most critical] — [What to do]
2. [Next] — [What to do]
...
```

---

## When to Run

- **Monday morning** — before standup, to reset for the week
- **Before a major session** (strategy, board prep, PRD work)
- **After a long gap** (returning from travel, vacation, or >5 days away)
- **When something feels off** — skill output seems generic, context seems stale

---

## What Heartbeat Does NOT Do

- Does not check external systems (no APIs, no calendar, no Slack)
- Does not replace the morning standup — standup is daily context; heartbeat is system health
- Check 12 moves files to `_archive_move_out/` (staging) — it does not permanently delete anything
