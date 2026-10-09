# Catchup — Drain Agent Findings into the Working Window

Reads what the background agents produced since you last looked, and surfaces only what needs you. **Small local files only — no MCP, no payloads.**

**Commands:**
- `/catchup` — drain now
- `/catchup watch` — start the recurring 2-hourly cron (idempotent)
- `/catchup watch stop` — remove it
- `/catchup --all` — ignore the marker, re-read the whole day

**Natural language:** "what did the agents find?", "catch me up", "anything from triage?"

---

## Why this exists

The two-window pattern (agent window plus working window) sends cron firings and heavy pulls to Window A so Window B stays focused. That handles **payload** correctly and originally handled **findings** not at all.

**The gap:** with triage running in Window A, the VP of Product would have to track both windows to avoid losing triage findings, which defeats the purpose of firing boot in Window A and not checking it throughout the day.

Triage runs in A and produces extractions, backlog items, TP candidates and contradiction flags. The agents also report **gaps** that only appear in their conversation and daily logs, such as a meeting that could not be retrieved, a tool flag that proved wrong, or a bad temp-file path that wrote an empty `RAW:` block which was then corrected. Nothing in Window B would otherwise surface those.

Standup reads *yesterday's* triage summary, so findings produced during the working day were invisible until the next morning. Catchup closes that.

**What this skill is not:** a second triage. It reads what triage already wrote. It never processes the drop zone, never calls an extraction skill, and never touches MCP.

---

## Step 1 — Read the marker

Read `state/catchup.md` (gitignored; may not exist).

```markdown
LAST_SEEN: YYYY-MM-DDTHH:MM:SS-04:00
```

- **Missing, or `LAST_SEEN` is not today** → treat the whole of today as new.
- **`--all`** → ignore the marker entirely.

Get the current time from PowerShell, never by inference:
`[System.TimeZoneInfo]::ConvertTimeBySystemTimeZoneId((Get-Date), 'Eastern Standard Time')`

---

## Step 2 — Read the sources

All local, all small. Today's date in ET.

| Source | Read for |
|---|---|
| `triage-summaries/triage_YYYY-MM-DD.md` | run sections timestamped after `LAST_SEEN` — items processed, skills called, **held items**, **contradictions flagged**. 🔑 **In practice this is the richest single source — read it first.** |
| `tasks/backlog.md` — **newest dated section only** | where `/triage` and `/demos` actually write their findings and TP candidates. Never read the whole file (it is large); locate the newest `## From <date>` header and read only that section. |
| `shared/output/voc/meetings_scan.md` · `publications_scan.md` | **only if the newest dated section postdates `LAST_SEEN`** — these are standup's Step 1.4 sources, and on a day standup runs before the scans do, their delta reaches nobody. Report existence and headline count; **do not read the file history** (150–350KB). |
| `agents/triage/memory/YYYY-MM-DD.md` | run-level notes, patterns, errors |
| `agents/zoom-watch/memory/YYYY-MM-DD.md` | pulls, **skipped meetings and why**, permission gaps, MCP anomalies |
| `agents/inbox-watch/memory/YYYY-MM-DD.md` | attention items surfaced, auto-ingests, scan failures. **Also run the surfaced-but-not-ingested check below.** Read `## Sent today` before calling any item open, owed or obsolete, so that a reply read in isolation does not lead to telling the VP of Product to delete a draft they already sent. |
| `drop-zone/holding_*.md` | **any** unresolved held item, regardless of date |
| `drop-zone/dropzone_YYYY-MM-DD.md` | unprocessed content still queued |
| `skills/demo-calls/memory/YYYY-MM-DD.md` | whether `/demos` ran, and what it pulled. **Absent = it has not run today** — worth one line in the afternoon, silent in the morning (standup routinely precedes the research window). |
| `output/transcripts/<quarter>/` | extraction files with an mtime after `LAST_SEEN` |

### 🔴 Surfaced-but-not-ingested check

**Only two things auto-ingest** — product-community feature requests and HubSpot Cancel Request Form submissions. **Everything else inbox-watch surfaces requires the VP of Product to be in the agent window and say "read this in," and they are not in that window.** So a substantive email can be fully analysed in Window A and never become a ProdOS artifact.

**The check:** for each item inbox-watch marked **🔴 Surfaced** today, is there a matching `output/triage/<today>_inbox-*/` directory? If not, and the item carries **technical detail, a schema, a commitment, a date, or a decision that changes a live thread**, report it as:

`📥 **Analysed but not ingested:** [sender] — [one line] → `/triage` it, or say "read this in".`

**Why the check exists:** a partner email carrying schema details and an open decision can be correctly analysed by inbox-watch and then sit un-ingested for hours, reaching the working window only by accident.

**Do not widen auto-ingest to fix this.** Auto-ingest writes to canonical paths without review, and its two existing cases work because they are narrow, high-confidence and structurally identical every time. A partner email needs judgment about what it changes. **Reporting the omission is the cheap correction; revisit only if this check keeps firing on the same class of sender.**

---

**If a memory file is absent, say so rather than assuming quiet.** An agent that wrote nothing all day is a signal, not silence — most often it means its crons died with a closed Window A. That is exactly the failure `state/agents.md` cannot detect, and this is the layer where it becomes visible.

---

## Step 3 — Report only what needs the VP of Product

**Silence is the pass state.** In cron mode, produce **no output** when nothing new qualifies.

Suppress: successful routine runs, silent cron firings, deduped meetings, routine skips already covered by a documented rule.

Surface:

```
## Catchup — [HH:MM] ET (since [LAST_SEEN time])

**New extractions ([N]):**
- `<path>` — [1-line what it was] → [the 2-3 findings that need a decision]

**⚠️ Agent gaps:**
- [failed scan / MCP anomaly / corrected error — with the so-what]

> 🔴 **"Uncaptured meeting" is NOT a gap. Never report one.**
>
> **The VP of Product records their own transcripts in Granola and pastes them into the drop zone when they get the opportunity.** A meeting that produced no Zoom assets — whether permission-locked, or permission-true-with-zero-assets — is **the workaround running, not a failure.** Report nothing: **do not log it here, do not count consecutive instances, do not name the host, and never propose asking anyone to change a setting or share a transcript.**
>
> ⚠️ **Generalise it: when a standing rule is fixed at one producer, check every consumer that reads that producer's output.** zoom-watch's memory legitimately records non-capturing rooms so it can skip them. That record is for the agent, not for the brief. A consumer that reads the agent's memory and reports the non-capture anyway crosses the line the agent held.

**Held for review ([N]):** [item + why held]

**TP candidates raised ([N]):** [one line each, do NOT auto-write]

**Queued, unprocessed:** [drop-zone content triage has not reached]

**🔬 Patterns & system findings (max 3):**
- [what an agent worked out that changes how its output should be read, even with no action attached]
```

### 🔴 The sixth bucket exists because the first five are all action-shaped

Window A, where the crons run, also produces analysis of emails and Zoom conversations. The VP of Product works in Window B, so there is a risk of missing that analysis. The gap is structural: every reporting bucket above is a decision or an item of work, and Step 3's instruction to suppress routine runs then drops the analysis layer by design.

**Examples of analysis that would otherwise reach the working window only by accident:** a zoom-watch finding that transcript-permission-true-with-zero-assets occurs repeatedly, or that one meeting room hosts two different recurring meetings; inbox-watch flagging that the team reference file is stale enough to degrade Tier 1/2 classification; triage concluding that edits must be anchored on headings after repeated concurrent-edit collisions.

**The test for this bucket is not "does this need a decision."** It is: **would the VP of Product have wanted to know this if they had read Window A?** Qualifying shapes:
- A finding that changes how to interpret an agent's own output or a tool's flags (the `has_transcript` false negatives, the permission-vs-recording distinction).
- A repeated instance count crossing into a pattern (third flag on the same stale file, Nth instance of a class).
- A calibration question the agent resolved by judgment and wants ratified, or one it could not resolve.
- A cost or failure mode the agent worked around silently.

**Still suppress:** clean runs, dedupe hits, routine skips, and anything already reported in an earlier drain. **Hard cap of 3**, chosen deliberately — this bucket exists to stop knowledge evaporating, not to relay Window A's conversation into Window B, which would reintroduce the payload the two-window split removed.

**Rules for the findings line.** Report what the extraction *found*, not that an extraction happened — "[Customer A]: asked for approval routing, 3rd instance" beats "processed 1 transcript." **Never re-summarize a full extraction here.** Two or three lines and the file path; the VP of Product opens the file if they want more.

**Agent gaps rank above extractions**, because a failed scan or a corrected error is time-sensitive in a way a written extraction is not. 🔴 **But an uncaptured meeting is not one of them** — see the block above. Asking anyone for a transcript is exactly what the system has been instructed to stop doing.

---

## Step 4 — Update the marker

Write `state/catchup.md` with `LAST_SEEN` = now, **only after** reporting. On a silent cron run, still update it — nothing new was found, and that finding is itself current.

**Do not update** when `--all` was used, unless the run also covered up to now.

---

## Cron Job Setup

**This file is the single source of truth for the catchup cron.** `/standup` invokes `/catchup watch`; it does not restate the prompt.

### Every 2 hours during the working day

**Tools:** `CronCreate` to create, `CronList` to check, `CronDelete` for `stop` — all deferred; load via `ToolSearch` (`select:CronCreate,CronList,CronDelete`).

**Cron:** `"20 10-18/2 * * 1-5"` — fires at 10:20, 12:20, 14:20, 16:20, 18:20 ET, weekdays.
**Prompt:**
```
Read skills/catchup/CLAUDE.md and run /catchup.
Drain agent findings produced since state/catchup.md LAST_SEEN — new extractions, agent gaps, held items, TP candidates, unprocessed queue.
Cron mode — silent if nothing new.
```

**Why minute :20:** triage fires at :05, so :20 gives it room to finish and write its summary before catchup reads it. Offsetting also keeps this clear of the global cron fleet at :00 and :30.

### 🔬 The 18:20 firing is a day-close synthesis, not an incremental drain

**The last firing of the day ignores `LAST_SEEN` for the analysis layer only.** Re-read the full day of `agents/*/memory/<today>.md` plus the day's triage summary, and report the **Patterns & system findings** bucket across the whole day rather than only since the previous drain. Extractions, gaps, held items and the queue stay incremental as normal, since those were already reported and acted on.

**Why the day needs a closing pass:** an incremental drain every two hours judges each finding against a two-hour window, where a third instance of something looks like one instance. Repetition is most of the signal in agent output, and it is only visible across a day. This is also the cheapest moment to read, because the day's decisions are already made and nothing is competing for attention.

**Keep the cap at 3 here too.** If more than three things qualify, that is itself worth one line: say how many were dropped and where they live, so the next morning's standup or a `/catchup --all` can pick them up.

#### 🔴 The clock is the backstop, not the trigger — `/save` owns this pass

**The VP of Product often wraps before 18:20**, so a wall-clock firing is the wrong primary mechanism. **`SAVE.md` Step 3.5 runs the day-close as part of the end-of-session ritual**, which is the thing that actually happens when the day actually ends.

**Coordinate through a flag so it runs exactly once:**
- Whichever runs first — `/save` Step 3.5 or the 18:20 firing — writes **`DAY_CLOSE: <today>`** into `state/catchup.md`.
- The other reads that flag and **skips silently.** No "already done" chatter.
- ⚠️ The flag is separate from `LAST_SEEN` and does **not** replace it. `LAST_SEEN` stays the incremental cutoff.

**Second backstop, for the day both are missed** (session ends without `/save` and before 18:20): on the **first firing of a new day**, check whether `state/catchup.md` carries a `DAY_CLOSE` for the **previous** business day. If not, run the day-close for *that* day first, labelled as such, then proceed with today's normal drain. **This is what makes the loop converge rather than silently losing a day**.

**Why 2-hourly rather than aligned to the zoom-watch chains:** findings do arrive in bursts after a zoom pull, but manual drop-zone pastes and inbox auto-ingests land all day. A flat interval catches both. If most firings turn out empty, tighten to 13:00 / 16:00 / 18:30 (roughly 30 min after each zoom pull's triage).

### 🔴 This cron belongs to the WORKING window

**Run `/catchup watch` in Window B, never Window A.** Crons fire into the session that created them — created in A, its output lands in the window you are ignoring, which is the exact problem this skill exists to fix.

It is **not** part of boot's expected **8**. `CronList` in A cannot see it and `CronList` in B cannot see the 8. The counts are independent and both are correct:
- Window A: **8** (4 inbox-watch + 3 zoom-watch + 1 triage)
- Window B: **1** (catchup)

### Idempotency
Before calling `CronCreate`, run `CronList`. If any cron's prompt mentions `skills/catchup/`, report `Catchup already active.` and do not duplicate.

### Stop
On `/catchup watch stop`: `CronList`, then `CronDelete` every cron whose prompt mentions `skills/catchup/`, then confirm the count removed.

---

## Scope

**MAY:** read the sources in Step 2 · write `state/catchup.md` · write `skills/catchup/memory/YYYY-MM-DD.md` · manage its own cron.

**MAY NOT:** run `/triage` or any extraction skill · process or archive the drop zone · call any MCP · write to Truth Pack, tasks, profiles or transcripts · auto-write TP candidates (surface only).

---

## Stop conditions

- [ ] `state/catchup.md` read (or `--all` honoured)
- [ ] All Step 2 sources checked; absent memory files reported rather than assumed quiet
- [ ] Only decision-needing items surfaced; routine runs suppressed
- [ ] Marker updated to now
- [ ] Silent output on a cron run with nothing new
