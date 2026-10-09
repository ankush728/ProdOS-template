# Boot — Session Bring-Up

Brings the session's MCP integrations and background agents up, claims ownership of the crons, and reports posture. **Nothing else.**

This is the **agent-window skill** — the one command you run in the window you then ignore, so that its 8 crons fire there instead of into your working session.

**Command:** `/boot`
**Natural language:** "boot the session", "start my agents", "bring the agents up", "are my crons running?"

---

## The One Rule

**This skill specifies nothing. It delegates.**

Cron schedules and cron prompt text live in **each agent's own CLAUDE.md** and nowhere else. Boot's job is to notice an agent is down and invoke that agent's start command. It must never contain a cron schedule, a cron prompt body, or a copy of an agent's setup steps.

**Why this rule exists, concretely:** `skills/MorningStandup/CLAUDE.md` once carried its own copies of the inbox-watch and zoom-watch cron prompts and created the crons directly. Those copies drifted. The standup copy never picked up an ingest branch later added to the agent, so on any morning standup created the crons, the hourly scan silently ran without a capability that had been deliberately added. The copy also carried a stale Gmail tool name with a correction sitting next to it rather than in it.

If you find yourself pasting a cron prompt into this file, the answer is a fix in the agent's file instead.

---

## Why this skill is separable — the context argument

Session crons **fire into the session that created them.** Whichever window runs `/boot` absorbs every firing for the rest of the day: ~20 firings across 8 jobs, each carrying its own MCP payloads. Those payloads are the real cost — `get_meeting_assets` routinely returns 100–160KB, Gong transcripts and Drive sheets similar.

**The intended pattern is two windows:**

| Window | Runs | Sees |
|---|---|---|
| **A — agents** | `/boot` once, then ignored | all cron firings, all pulls, all triage processing |
| **B — working** | `/standup` and actual work | the *results*, by reading files the agents wrote |

This works because triage's output is files. Window B reads extractions, INDEX rows and backlog sections without paying for the processing — ProdOS principle #6 (*"One workflow writes. Others read."*) applied to context rather than just to data.

**Also keep out of Window B:** `/zoom-watch pull` and `/transcript` on a large file → Window A. **Gong demo calls → `/demos` in a third, disposable window** (`skills/demo-calls/`) — it owns Gong end to end and its own window gets closed after the read. Window B only ever needs the extraction, never the raw.

---

## Step 0 — Read the ownership marker

Read `state/agents.md` (gitignored; may not exist).

| Marker state | Action |
|---|---|
| **Missing, or `BOOT_DATE` is not today** | Stale. Proceed with Step 0.5 onward; this session takes ownership. |
| **`BOOT_DATE` is today, `CRON_COUNT` is a number** | Another session already owns the agents. **Do not create a second set** — go to the conflict rule below. |
| **`BOOT_DATE` is today, `CRON_COUNT: pending`** | A boot is mid-flight (or died partway). Do not race it. Report *"boot in progress in another window, started [TIME]"* and stop. If it has clearly stalled, `--force` overrides. |

### Conflict rule — boot invoked when today's marker already exists

Report what the marker says and stop, unless told otherwise:

> `state/agents.md` says `/boot` ran at **[TIME]** and claimed **[N]** crons. Those crons belong to that window and fire there.
>
> - If that window is **still open**, nothing to do — running boot here would create a duplicate set of 8 and double every firing.
> - If it has been **closed**, the crons died with it and the agents are down. Say "take ownership" and I'll create them here.

On **"take ownership"** (or `/boot --force`): proceed through Steps 1–5 and overwrite the marker with this session's claim.

⚠️ **The honest limitation:** a session cannot see another session's crons, and it cannot detect whether that session is still alive. The marker records *intent*, not liveness. If Window A is closed without anything re-running boot, the marker will assert 8 crons that no longer exist. That failure mode is silent — inbox scans and zoom pulls simply stop, and a quiet day looks identical. **The tell is behavioural:** if no zoom pull or inbox scan has surfaced by mid-morning, re-run boot with "take ownership."

---

## Step 0.5 — Claim ownership immediately (before any work)

Write `state/agents.md` now, with the count unresolved:

```markdown
# Agent Session Ownership

BOOT_DATE: <today, YYYY-MM-DD>
BOOT_TIME: <HH:MM ET>
CRON_COUNT: pending
CRON_DETAIL: boot in progress
MCP: probing
CLAIMED_BY: the session that ran /boot at the time above

<!-- CRON_COUNT: pending means boot started and has not finished. Other sessions
     should treat this as owned and create nothing. -->
```

**Why the claim comes before the work, not after:** boot takes ~30–60s (three MCP probes, a `CronList`, up to eight `CronCreate` calls). Writing the marker only at the end leaves that whole span uncovered — a `/standup` opened during it reads no marker, concludes nobody owns the agents, and creates a **second** set of 8. Claiming first makes the ordering irrelevant: open the working window whenever, and the worst case is standup reporting *"boot in progress"* rather than duplicating.

**If boot then fails partway**, the marker is left reading `pending`, which is the accurate state — something started and did not finish. `/boot --force` clears it.

---

## Step 1 — MCP pre-flight

Check the integrations the agents depend on at runtime:

| MCP | Probe (`ToolSearch`) | Depends on it |
|---|---|---|
| Gmail | `select:mcp__claude_ai_Gmail__search_threads` | inbox-watch (all 4 crons), standup bridge scan |
| Google Calendar | `select:mcp__claude_ai_Google_Calendar__list_events` | standup calendar pull, meeting prep |
| Zoom | `select:mcp__claude_ai_Zoom_for_Claude__search_meetings` | zoom-watch (all 3 crons) |

A probe returning "No matching deferred tools found" or otherwise failing means that MCP is not loaded.

**Report what's missing, then continue.** Boot does **not** block — an agent whose MCP is down will still register its cron and its own failure handling covers the runtime case (all three agents log MCP failures to daily memory and alert after 3 consecutive misses). The value of boot is the posture report, so produce it even when degraded.

⚠️ **The one thing that IS worth stating plainly:** if Zoom MCP is down, zoom-watch crons will fire and pull nothing all day, and triage will find an empty drop zone and stay silent. That combination looks identical to a quiet day. Say so in the report rather than letting silence read as calm.

---

## Step 2 — Cron posture

Run `CronList` once. Bucket every job by which agent's path its prompt mentions:

| Agent | Match on prompt | Expected |
|---|---|---|
| inbox-watch | `agents/inbox-watch/` | 4 |
| zoom-watch | `agents/zoom-watch/` | 3 |
| triage | `agents/triage/` | 1 |

**Expected total: 8 session-only cron jobs.**

Crons are session-scoped — they die with the session. A fresh session always shows 0 and needs all three agents started. That is normal, not a fault.

---

## Step 3 — Start what's down

For each agent below its expected count, **read that agent's CLAUDE.md and invoke its start command.** Follow the agent's own Cron Job Setup section, including its idempotency check.

| Agent | Start command | Authoritative file |
|---|---|---|
| inbox-watch | `/inbox-watch` | `agents/inbox-watch/CLAUDE.md` → Cron Job Setup |
| zoom-watch | `/zoom-watch` | `agents/zoom-watch/CLAUDE.md` → Cron Job Setup |
| triage | `/triage-watch` | `agents/triage/CLAUDE.md` → Cron Job Setup |

Each agent's setup is already idempotent, so invoking a start command that turns out to be unnecessary is safe. When in doubt, invoke.

**Partial counts are the interesting case.** An agent showing 2 of 4 crons means a create failed mid-run, not that it is up. Treat any count below expected as down and re-run that agent's setup — its idempotency check will skip what exists.

---

## Step 4 — Resolve the ownership marker

Overwrite the Step 0.5 claim with the settled result, replacing `pending` with the real count. Get the time from PowerShell, never by inference:
`[System.TimeZoneInfo]::ConvertTimeBySystemTimeZoneId((Get-Date), 'Eastern Standard Time')`

```markdown
# Agent Session Ownership

BOOT_DATE: YYYY-MM-DD
BOOT_TIME: HH:MM ET
CRON_COUNT: 8
CRON_DETAIL: inbox-watch 4 · zoom-watch 3 · triage 1
MCP: gmail=ok · calendar=ok · zoom=ok
CLAIMED_BY: the session that ran /boot at the time above

<!-- Session crons fire into the session that created them. This marker tells other
     sessions (notably /standup Step 0.0) not to create a second set. It records
     intent, not liveness — if that window is closed, the crons died with it. -->
```

**Resolve it even when the count came up short of 8** — record the real number. A marker claiming 8 when 6 exist is worse than no marker. **Never leave `pending` behind on a successful run.**

**Do not touch it** when Step 0 hit the conflict rule and ownership was not taken — that path skips Steps 0.5 through 4 entirely, and the existing claim stands.

---

## Step 5 — Report

```
## Session Boot — [HH:MM] ET

**MCP:** Gmail ✓ · Calendar ✓ · Zoom ✓        (or: ⚠️ Zoom not loaded — zoom-watch will pull nothing)

**Agents:** 8 of 8 crons active
- inbox-watch — 4/4 (hourly 9am-5pm, summaries 12/3/5pm)
- zoom-watch — 3/3 (pulls 12:30 / 3:30 / 6:00pm)
- triage — 1/1 (hourly 10am-6pm)

[Started: <agents that were down>]   — omit the line if nothing needed starting
```

If the total is not 8 after Step 3, say which agent is short and by how much. **Never report a number without having run `CronList` for it.**

**When Step 0 hit the conflict rule**, the report is just the marker's contents plus the open/closed question — no counts of your own, because this session has none.

---

## Phase 2 — removed

The Gong demo-call enumeration does not live here. **`skills/demo-calls/`** owns Gong end to end (enumerate → pick → extract → propagate) in its own disposable window.

**Why:** with enumeration in boot and the picker in standup, one scan had two owners, the same split that lets a duplicated cron prompt go stale and silently drop a capability. Demo-call reading runs once in the morning and is not referred to again, which makes it a self-contained research session, not a bring-up step.

**Boot is bring-up only.** If a future scan genuinely belongs here, the test it must pass is **high payload, low surviving output, and no interactive decision** — the third condition is what disqualified Gong, since picking which call to read is a judgment call and judgment does not belong in a window nobody reads.


## Relationship to standup

`/standup` calls `/boot` as its first step and then proceeds to the briefing. Running `/boot` standalone is equally valid and is the better habit when a session starts outside the morning — **boot is once-per-session, not once-per-morning.** Standup was only ever the host because it was the reliable daily habit, which is a scheduling accident rather than an architectural fit.

**What stays with standup, deliberately:** the **bridge inbox scan** (a one-shot wide-window Gmail scan that closes the gap between yesterday's 5:07pm cron and today's 10:07am cron) is briefing content — it produces a section the VP of Product reads. It is not bring-up. Boot does not run it.

**Why the bridge scan stays with standup but Gong got its own skill:** the bridge scan pulls ≤25 Gmail threads and nearly all of it reaches the brief. Gong `list_calls` pulls 80–100KB × 2–4 pages to produce a five-line list, and each transcript is another 100KB+. **Two discriminators, not one:** payload-to-surviving-output, *and* whether the step requires an interactive decision. Picking which call to read in is judgment, and judgment does not belong in a window nobody reads.

**Boot never touches Gong.** Enumeration, the picker and extraction all live in `skills/demo-calls/` (`/demos`), run in its own disposable window. Standup does not call or mention Gong; `/catchup` notices whether `/demos` ran.

Also standup's, not boot's: the **No-Calendar Mode** rendering rules that govern how the brief presents an unknown meeting state.

---

## Scope

**MAY do autonomously:** probe MCP availability · `CronList` · invoke the three agent start commands · `CronDelete` only when an agent's own setup section calls for legacy cleanup.

**MAY NOT:** define or edit cron schedules or prompts · run an agent's actual work (no scans, no pulls, no triage) · write to any file outside `skills/boot/` · modify agent files.

---

## Stop conditions

- [ ] `state/agents.md` read; conflict rule applied if today's marker exists (number **or** `pending`)
- [ ] Ownership claimed with `CRON_COUNT: pending` **before** any probing or cron creation
- [ ] All three MCPs probed and reported
- [ ] `CronList` run and bucketed by agent
- [ ] Every agent below expected count started via its own command
- [ ] Marker resolved — `pending` replaced with the real count (never left behind)
- [ ] Posture report displayed with a real count
- [ ] **No scans run.** Boot brings agents up; it does not gather. Gong belongs to `/demos`, the bridge inbox scan to `/standup`.
