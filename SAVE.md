# ProdOS Session Save

Invoked by `/save`. Run before ending any work session — especially before closing the browser, switching context, or when a session has produced meaningful work.

**Purpose:** Write session memory to the appropriate skill memory files so nothing is lost between conversations. This is the enforcement mechanism for a system that otherwise relies on graceful endings.

---

## When to Run

- Before closing a conversation
- After completing significant work (strategy analysis, PRD section, CTO review, etc.)
- When switching to a different topic mid-session
- As a recovery step at the start of a new session if the previous one ended abruptly

---

## Process

### Step 1: Identify Active Skills

Review the current conversation and identify which skills were used. Look for:
- Explicit skill commands (`/strategy`, `/prd`, `/standup`, `/transcript`, etc.)
- Skill routing (VOC analysis, CTO review, 1:1 prep, etc.)
- Outputs produced (files written to `output/`)

List the active skills. If none were used (e.g., quick question session), say so and skip to Step 4.

---

### Step 2: Write Dated Memory for Each Active Skill

For each skill identified in Step 1, append to `skills/[Skill]/memory/YYYY-MM-DD.md` (create if it doesn't exist).

**Entry format:**

```markdown
## [HH:MM] — [One-line session summary]

**What happened:**
[2-4 sentences: what was worked on, what was produced, where things stand]

**Outputs produced:**
- `output/path/to/file.md` — [brief description]
- (none if no files written)

**Patterns / observations:**
[Any noteworthy patterns, user preferences, or insights from this session — or "none"]

**Feedback received:**
[Any explicit feedback from the VP of Product on the skill's output — or "none"]

**Left off at:**
[If work is in progress — where it stopped, what comes next. Otherwise "complete."]
```

If a dated file already exists for today, **append** the new entry (don't overwrite).

---

### Step 3: Check for MEMORY.md Updates

For each active skill, ask:

> "Was there a pattern, preference, or insight from this session strong enough to add to [Skill]/MEMORY.md?"

Criteria for distilling to MEMORY.md:
- A preference confirmed for the second time ("the VP of Product prefers X")
- A workflow pattern that should change future behavior
- A recurring error to avoid
- A calibration insight (e.g., "SCBA topics always trigger Tacit Knowledge + Mission-Critical moats")

If yes: propose the addition and ask for confirmation before writing.
If no: proceed to Step 4.

---

### Step 3.5: Agent Day-Close (drain the analysis layer before the session ends)

The background agents write far more than they surface (tens of KB per day across `agents/*/memory/` and the triage summary), and every one of catchup's normal reporting buckets is action-shaped, so the analysis layer reaches the working window only if something asks for it.

`/catchup` has an **18:20 day-close firing** for this, and it is useless on any day the session ends earlier. **This ritual is the real end of the day, so it owns the pass and the cron is the backstop.**

1. Read `state/catchup.md`. If it carries `DAY_CLOSE: <today>`, the synthesis already ran (from the cron or an earlier `/save`) — **say nothing and skip to Step 4.**
2. Otherwise run the day-close described in `skills/catchup/CLAUDE.md`: read the **full day** of `agents/*/memory/<today>.md` plus `triage-summaries/triage_<today>.md`, and report only the **🔬 Patterns & system findings** bucket, **max 3**.
3. Write `DAY_CLOSE: <today>` into `state/catchup.md` so the 18:20 cron does not repeat it.
4. **Report nothing if nothing qualifies.** Silence is the pass state here as everywhere in catchup.

**Do not re-report** extractions, gaps, held items or the queue — those were surfaced and acted on during the day. This step exists for the findings that change how the system should be read and that no bucket was shaped to carry.

⚠️ **This is not a second triage and it must not call MCP.** Local files only, same scope rules as `/catchup`.

---

### Step 4: Shared Repo — Publish Canonical Edits (automatic)

The shared team repo (`shared/`, a separate git repo, gitignored from this one) holds canonical team
context — Truth Pack, competitive intel, all VOC, briefs, roadmap. **Edits there are invisible to teammates
until published**, and because `shared/` doesn't appear in this repo's `git status`, it
strands silently.

The documented cadence is *"pull at session start, publish at EOD checkpoint"* — and `/save` **is** the
EOD checkpoint. **This step publishes automatically rather than asking.**

1. **Check state:**
   ```bash
   cd shared && git status --short && git log --oneline origin/main..HEAD && git log --oneline HEAD..@{u}
   ```
2. **If nothing is outstanding, say nothing and move to Step 5.** Silence is the pass state.
3. **Run the guards. Both are hard stops, not preferences:**
   - 🔴 **Sensitive content.** If any changed path is under `knowledge/_personal/`, or otherwise looks
     board/personnel-confidential, **STOP and flag it. Do not publish.** That content is excluded from
     the shared repo by construction, so its appearance is a bug rather than a publish candidate
     (for example the decision log or investor-relationship notes).
   - ⚠️ **Incoming commits.** If `HEAD..@{u}` is non-empty, a teammate has published since this session
     started. **Report it and ask before publishing** — a pull may need a merge, and canonical
     conflicts are human-resolved under the optimistic-write model. Auto-publishing into a diverged
     remote is the one case where the deliberate gate still applies.
4. **Otherwise publish:** read `skills/sync-shared/CLAUDE.md` and follow `/sync-shared publish`. Do not
   hand-roll the git commands.
5. **Report what went out** in the save receipt: the commit SHA, the files, and a one-line note on what
   each change was. You have the session context to say it, so say it rather than only naming paths.

**Why it is automatic.** An outward-facing push to a repo teammates read could justify a deliberate gate. In practice the files reaching
`shared/` at EOD are almost entirely **written by the background agents, not by the VP of Product** — VOC segment
trackers, the cancellation-signal file, the daily meetings and publications scans. Asking the VP of Product to approve
a push of content they did not author, at the end of the day, is a confirmation step with no judgment in
it.

**What a gate would protect is preserved in the two guards above.** The risk is never volume, it is
publishing something sensitive or clobbering a teammate's work. Those are explicit checks rather than a
blanket ask.

---

### Step 5: Confirm

Output a brief save receipt:

```
Session saved.

Memory written:
- skills/[Skill]/memory/YYYY-MM-DD.md — [one-line summary]
- skills/[Skill]/memory/YYYY-MM-DD.md — [one-line summary]
(none — no skills active this session)

MEMORY.md updates:
- [Skill]/MEMORY.md: [what was added] — or "none"

Shared repo:
- Published [N] canonical change(s) — [SHA], [files] — or
- [N] change(s) HELD — [reason: sensitive path / incoming commits from a teammate] — or
- Nothing outstanding

To resume any in-progress work next session, run the relevant skill command.
```

---

## What /save Does NOT Do

- Does not update Truth Pack files (use `/update-knowledge` for that)
- Does not run system health checks (use `/heartbeat` for that)
- Does not archive completed tasks (update `tasks/active.md` manually)
- Does not commit or push **this** (personal) repo — commit manually when ready
- **Does auto-publish the shared repo** (Step 4), subject to two hard stops: nothing sensitive, and no unmerged incoming commits from a teammate.

---

## Recovery: Session Ended Without Saving

If the previous session ended abruptly, run `/save` at the start of the next session.

Claude will reconstruct what it can from:
- Files written to `output/` during the previous session (check timestamps)
- Any session state files in `skills/PRD/sessions/` or `skills/PowerPoint/sessions/`
- The conversation history (if still available in context)

Reconstructed entries should be marked `[RECONSTRUCTED]` so you know they were written after the fact.
