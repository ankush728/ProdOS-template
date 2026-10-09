# Morning Standup - Knowledge Context

This file explains what the Morning Standup skill scans and why.

---

## Files Always Loaded

**GOALS.md** - Strategic context
- **Why:** Need Q1 goals to show alignment
- **Used for:** Strategic Context section, goal progress tracking
- **Key content:** Q1 goals, weekly priorities, blockers

**tasks/active.md** - Current work
- **Why:** Core of "On Deck Today" section
- **Used for:** Active tasks list, status tracking, deadline awareness
- **Key content:** 3-5 active tasks with status/next/due/blocker

**skills/MorningStandup/MEMORY.md** - Preferences
- **Why:** Apply learned preferences (what to highlight, brief length)
- **Used for:** Tuning output to PM preferences
- **Key content:** What to always/never highlight, communication style

---

## Files Scanned for Changes

**tasks/backlog.md** - New tasks
- **Why:** Flag if many new tasks added (>10 = needs grooming)
- **Used for:** "What Happened Yesterday" if backlog grew significantly
- **When to mention:** If >10 new tasks since last standup

**shared/output/voc/*.md** - VOC artifacts
- **Why:** New customer insights are strategic wins
- **Used for:** "What Happened Yesterday" if new analysis/synthesis created
- **When to mention:** Any new Analysis_*.md or Synthesis_*.md files

**output/cto/*.md** - CTO reviews
- **Why:** Technical validation completed is progress
- **Used for:** "What Happened Yesterday" if new moat validation or feasibility done
- **When to mention:** Any new files in output/cto/

**skills/*/memory/YYYY-MM-DD.md** - Recent sessions
- **Why:** Understand what work happened in other skills
- **Used for:** "What Happened Yesterday" context
- **Scan:** Yesterday's date only (not entire history)

---

## Files Sometimes Loaded

**meetings/1on1s/*.md** - Meeting context
- **Why:** If meetings today, provide context
- **Used for:** "On Deck Today" meetings section
- **When to load:** Only if meeting scheduled for today (check calendar or ask PM)

**HEARTBEAT.md** - System health
- **Why:** If PM wants health check in standup
- **Used for:** Optional "System Health" section
- **When to load:** Only if PM explicitly requests

---

## What NOT to Scan

**Don't scan:**
- Truth Pack files (TP_*) - static context, not daily changes
- PM Principles files (PMOP_*) - universal frameworks, not daily work
- Templates - static, don't change
- README.md - documentation, not daily activity
- CLAUDE.md (root) - system config, not daily work

**Why not:**
- These files rarely change
- Not actionable for daily standup
- Would add noise without signal

---

## How to Detect "Yesterday"

**Option 1: Use file timestamps**
```bash
# Find files modified in last 24 hours
find output/ -type f -mtime -1
find tasks/ -type f -mtime -1
find skills/*/memory/ -type f -mtime -1
```

**Option 2: Check git commits (if available)**
```bash
# Files changed since yesterday
git diff --name-only HEAD@{1.day.ago} HEAD
```

**Option 3: Look for yesterday's date in filenames**
```bash
# VOC files created yesterday
ls shared/output/voc/*YYYY-MM-DD* # use yesterday's date
```

**Option 4: Ask PM**
"When did you last run standup?" and scan since that time.

**Recommended for Week 2:** Use file timestamps (Option 1) - simplest, no git dependency

---

## Scanning Efficiency

**Don't read entire files:**
- `tasks/active.md` - Just scan for status changes, don't deep read
- `shared/output/voc/*.md` - Just note file exists, don't analyze content
- `memory/*.md` - Scan headers for session types

**Do read fully:**
- `GOALS.md` - Need weekly priorities section
- `MEMORY.md` - Apply all preferences

**Why:**
- Standup should generate in <30 seconds
- Reading every output file would take minutes
- File existence = signal, contents = optional deep dive

---

## Data Flow

**Input sources:**
```
GOALS.md (strategic context)
tasks/active.md (current work)
output/*/ (recent artifacts)
memory/*/ (recent sessions)
  |
Morning Standup skill
  |
Brief output (terminal or file)
  |
skills/MorningStandup/memory/YYYY-MM-DD.md (log)
```

**Simple pattern:** Load -> Scan -> Synthesize -> Brief -> Log

---

## Notes

- Standup scans breadth (many files), not depth (full content)
- Signal = file created, task completed, blocker added
- Noise = routine edits, minor updates
- Goal = <30 second generation time
