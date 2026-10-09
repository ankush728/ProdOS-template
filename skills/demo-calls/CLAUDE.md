# Demo Calls — Gong Research Session

Enumerate the previous business day's long-form external Gong calls, pick which to read in, extract them, and propagate the knowledge. **Run this in its own window, read it once, then forget it for the day.**

**Commands:**
- `/demos` — enumerate the previous business day and present the picker
- `/demos YYYY-MM-DD` — a specific day
- `/demos <n>[,<n>...]` — after a picker, extract the numbered call(s)
- `/demos all` — extract every enumerated call (use sparingly; each is 100KB+)

**Natural language:** "read in the demo calls", "pull yesterday's Gong calls", "what demos ran yesterday?"

---

## Why this is its own skill and its own window

Reading in Gong calls is heavy and not part of the VP of Product's daily work. It is research that is a key input to understanding the market, but it runs once in the morning and is not referred to later, so it sitting in the same context window as standup is overkill. The skill saves the analysis and updates overall memory and knowledge so standup and any other activity in the working window learn from it.

**The payload math:** `list_calls` returns 80–100KB and a sales org can log many calls a day, so enumeration alone is 2–4 paged responses. Each `retrieve_transcripts` is another 100KB+. A three-call morning is most of a working window, spent on something never referenced again after the read.

**The output that matters is written down, not remembered.** Extractions, INDEX rows, segment consolidation, backlog sections and TP candidates all land in files. Standup's "What Happened Yesterday" and its `backlog.md` read pick them up for free. **So the window is disposable and the knowledge is not.**

⚠️ **Do not reintroduce Gong into standup or boot.** This skill owns Gong end to end. Standup does not enumerate, pick or mention demo calls (see Relationship to standup). Two files owning one scan is a drift pattern: a duplicated copy goes stale and silently drops later changes.

---

## Step 1 — Enumerate

**Tool:** `mcp__gong__list_calls` (deferred — load via `ToolSearch`).

**Window** — previous *business* day in ET, converted to UTC:
- Tue–Fri: previous calendar day.
- **Monday: look back to Friday**, never Sunday.
- After a holiday: the last business day before it.
- `/demos YYYY-MM-DD` overrides with that day, `00:00 → 24:00 ET`.

ET offset varies (EDT = UTC-4, EST = UTC-5). Compute at runtime:
`[System.TimeZoneInfo]::ConvertTimeBySystemTimeZoneId((Get-Date), 'Eastern Standard Time')` — never hardcode.

**Filter — client-side, after fetch:**
- `system == "Zoom"` (excludes Gong Connect SDR dialer calls)
- `scope == "External"` (excludes internal training and team meetings)
- `duration > 1800` (seconds)

🔴 **Duration is the ONLY gate. Title keywords play no part — do not check for, note, or flag them.** Title keywords such as "demo" are unreliable: long, valuable external calls are routinely titled "Intro" or similar, so a keyword rule misses them and a keyword flag would mark the majority case without telling the reader anything.

⚠️ **Gong mislabels some internal meetings as `scope: External`** (e.g. a weekly sales team meeting or a pipeline review). They pass the filter on scope + duration. **List them separately at the bottom of the picker as likely-internal, and do not resolve their host IDs against `gong_user_map.md`** — that map is for AEs on customer calls.

**Pagination:** max 100 calls per response; `records.cursor` is exposed but **not accepted as input**. If `records.totalRecords > 100`, split the window into 3–6 hour blocks and union the results. Expect 2–4 paged calls. A 404 usually means zero calls in the window — treat as empty, not an error.

**Payload handling:** responses exceed the inline token limit; the harness auto-persists to a tool-results file. **Run `jq` against the saved file — never re-emit the payload.**

```bash
jq -r '.[0].text | fromjson | .calls[]
  | select(.system == "Zoom" and .scope == "External" and (.duration > 1800))
  | "\(.id)\t\(.duration)\t\(.started)\t\(.primaryUserId)\t\(.title)\t\(.url)"' <persisted-file>
```

**Resolve AE names** from `knowledge/reference/gong_user_map.md` by `primaryUserId`. Unknown IDs: show the raw ID flagged `❓ unknown`, **and append a placeholder row to the map** so it gets named once and resolves thereafter. The map is self-improving — keep it that way, and ask at the end of the session who the new IDs are.

---

## Step 2 — Present the picker

```
## Gong Calls — [previous business day], [N] external Zoom calls > 30 min

1. **[Title]** — [Xh Ym] — [HH:MM] ET — AE: [Name or ❓ ID]
   `[callId]` | [gong url]
2. ...

Which do you want read in? (numbers, "all", or "none")
```

**Then stop and wait.** Never auto-extract — a three-call day is 300KB+ and the choice is the VP of Product's. Include a one-line read on anything notably unusual (a customer segment that is currently deferred, an unusual operator type, a call that ran far over its slot), since that is what they are choosing on.

---

## Step 3 — Extract each picked call

**Tool:** `mcp__gong__retrieve_transcripts`.

⚠️ **Actual response shape is `{callTranscripts:[{callId, transcript:[{speakerId, sentences:[{text}]}]}]}`** — *not* the documented `.[0].text | fromjson`. Payload will be oversized; read from the persisted file, flatten with `jq`, never re-emit.

Then route through **`skills/transcript-intel/CLAUDE.md` in full** — all 8 lenses, quarter-foldered output, `.raw.md` sibling, INDEX row. Do not shortcut it.

**If several calls are picked, dispatch one subagent per call** and have each return only its extraction path plus the 3–5 findings needing a decision. Even a disposable window fills up at 3–4 transcripts, and per-call isolation also keeps extraction quality from degrading by the third call.

🔴 **EVERY SCRATCHPAD FILE MUST CARRY THE CALL ID IN ITS NAME — `flat_<callId>.txt`, never `flat.txt`. Put this in the subagent prompt.** Parallel agents share one scratchpad directory, so a generic filename is a live collision: one agent's flattened transcript can be overwritten by a sibling's. The failure mode is silent and severe — **a wrong transcript extracted under the right title** — so do not rely on catching it.

**Also cross-check before writing anything centrally:** grep each `.raw.md` for agency-name markers belonging to the *other* calls in the pull. Each file should contain only its own. It costs one command and it is the only cheap proof that no swap occurred.

**Hold the shared files back from the subagents.** `INDEX.md`, the segment trackers, the procurement needs analysis, `tasks/backlog.md` and `gong_user_map.md` are appended by ONE writer at the end — have each agent *return* its proposed row and signals instead. Concurrent appends to one file are how rows get clobbered, and the agents are genuinely concurrent.

---

## Step 4 — Propagate (this is what standup learns from)

Everything here is a file write. It is the reason the window can be thrown away.

1. **MANDATORY Drive sync** — per `shared/knowledge/reference/voc_drive_sync.md`, transcript-intel Phase 5. Every Gong call here is Gong-sourced VOC, so this is **not optional and must not be skipped, including when dispatched to a subagent.**
   - **One folder per CUSTOMER, dated by the FIRST call.** `search_files` under **Sales Gong Transcripts** for **any folder starting with the customer slug** and **reuse it whatever date it carries** — do not match on the full title, because a repeat call's computed title carries the *new* date and a literal same-title search creates an unfixable duplicate. File titles carry their own call dates, so the folder stays unambiguous. Full rationale and the honest trade: `voc_drive_sync.md` §"One folder per CUSTOMER."
   - 🔴 **Upload TWO files: the sanitized summary AND the raw transcript.** Gong calls are the **only** source for which raw verbatim goes to Drive.
     - **Sanitized summary** — strip internal coordination and jargon; **exclude** Action Items, Decisions, Relationship Notes, Personal Insights.
     - **Raw transcript — uploaded unsanitized.** It is the customer's own words; sanitization applies to the analysis, not to what people actually said.
     - 🔴 **When the raw does not fit one `create_file`, SPLIT IT INTO NUMBERED PARTS** — `..._transcript_1of2.md` / `_2of2.md` (`1of3`… for longer calls), every part headed with which part it is, the set containing every line. This is written into `voc_drive_sync.md`. Do not treat it as a choice; letting each run pick produces drift.
     - 🔴 **EXCEPTION, not re-litigated per run: an INLINE-ONLY session uploads the summary and points at the repo.** When the only write path is `create_file` with inline `textContent` (no file-path upload, `update_file` metadata-only, no delete), a 60–75 KB verbatim would have to be **regenerated token by token across many one-shot unfixable calls** into files labelled *"transcript"*, and an infidelity inside a file labelled verbatim is the exact failure numbered parts exist to prevent. **That is the correct outcome, not a degraded one.** Numbered parts remains the rule wherever a file-streaming path exists.
       - **Settle it BEFORE writing the first summary** — the summary asserts what is in the folder and nothing can be edited or deleted afterwards. A summary that names part files that were never created can only be fixed with a companion README.
       - **Apply it to the WHOLE PULL, never call by call.** Splitting some and holding others is the drift this rule exists to stop.
       - ⚠️ **Full rationale lives in `voc_drive_sync.md` §"Operational reality."** **A prompt and its governing reference must change in the same edit**, or a correct instruction reads as a defect and subagents have to adjudicate the conflict mid-run.
   - **The repo `.raw.md` remains the authoritative verbatim of record.** Drive holds a copy for sharing, not the record.
   - ⚠️ **Never label a shortened file "verbatim."** A condensed transcript shipped as verbatim and then duplicated cannot be undone, because no delete tool is available.
   - ⚠️ **Drive `create_file` does not overwrite and no delete/trash tool is exposed in-session, so every upload is one-shot and unrecoverable.** Get the file right before pushing.
   - Drive failure is non-blocking — log to memory and continue; the local extraction is authoritative.
2. **Segment consolidation** — append to the relevant tracker (e.g. `shared/output/voc/ems-segment/EMS_Needs_Coverage.md`) with a Call Log row. ⚠️ **A combination fire/EMS agency does NOT increment the standalone-EMS `n`** — append the signals, hold the count.

   **2c. Procurement & supplies append** — a **cross-segment** lane, run in addition to 2 rather than instead of it.

   **Target:** `shared/output/voc/procurement-supplies/NeedsAnalysis_<topic>_<date>.md`, in the dated update section at the end.

   **Trigger — append when a call carries any of these, regardless of segment:**
   - ordering, reordering, purchase orders, requisitions, approval gating, carts, catalogs
   - a **named distributor or supplier** (a medical or fire supply distributor, a marketplace, a co-op, or a net-new name) — 🔴 **record the NAME, the vertical and who called it primary. Nothing else.** Which distributors get integrated is a **partner conversation**; do not write coverage arguments, roadmap paths or gap analysis into this file.
   - par levels, min/max, restock, over-ordering, expiration-driven rotation, stock-out
   - **receiving** — what happens to inventory when an order arrives
   - **onboarding friction** — item→product linking, catalog import, barcodes, part numbers
   - a stated reason procurement **cannot** be used (mandated corporate platform, no distributor, hospital-owned stock, blanket PO)

   🔴 **This file records NEEDS STATED BY PROSPECTS AND CUSTOMERS. Nothing else.** No prioritization, no build sequencing, no roadmap recommendations, no "we should build X next" — that lives in `shared/output/procurement/Procurement_Build_Priorities.md` and is **re-ranked by the VP of Product, never by a pull.** If a run produces a prioritization thought, it goes in the backlog section or nowhere.

   🔴 **Label every entry `[prospect]` or `[customer]`.** Both belong. They answer different questions — a prospect describes current-state pain in a demo, a customer reports live product debt — and **mixing them silently is how a demo objection gets read as a defect, and how a real defect gets discounted as an objection.**

   **What to write — same discipline as the backlog section, ~6 lines per run maximum:**
   - Which of the standing themes it moves, and **the new count**. A theme that only gains a count gets one line.
   - **Anything that does not fit a theme goes in as net-new**, named as such, so it does not sit stranded in an individual extraction.
   - 🔴 **Evidence that cuts against a live thesis is the highest-value row and must never be dropped for length.** **If the run has only one line of budget, spend it here.**
   - One short verbatim quote per item, only when the quote *is* the finding.

   ⚠️ **Before writing a line as disconfirming, apply this test:** **a customer not engaging with the framing an AE used is NOT the same as the customer not wanting the capability.** A call can look like it weakens a thesis when shipped capability already answers the customer's stated ask. **Check what already ships before calling a signal negative** — `shared/knowledge/reference/pstrax-module-functionality.md` is the sandbox-validated record. A wrongly-negative row is more expensive than a missing one, because it argues against a build.

   **⚠️ Do NOT rewrite the nine themes or the prioritized build list in place.** Append to the dated section; the build list is re-ranked by the VP of Product, not by a pull.

   **Why this step exists.** Steps 2 and 3 name *segment* trackers, and procurement is not a segment, so procurement-bearing calls can go past without anything accumulating them. The cost is not a missing file: it is that needs and defects stay scattered across individual extractions with nothing accumulating them for the procurement business case.

3. **Backlog section** in `tasks/backlog.md` — 🔴 **SHORT. Actions plus pointers. The reasoning stays in the extraction.**

   🔴 **The cap is denominated in BYTES, not lines, and Gong pulls are the worst offenders.** A markdown "line" is unbounded, so a line cap can be met faithfully while still producing a huge section. The backlog keeps a rolling window, so this cap is the main lever on its size.

   **Hard rules:**
   - **🔴 Hard cap: ~2,500 bytes per run, 4,000 ceiling — whatever the call count.** Measure the section. A six-call pull gets the same budget as a two-call pull; **the extra calls mean fewer items each, not a bigger section.** Do not append a note explaining why you exceeded it — cut items instead.
     - ⚠️ **Aim at 2,500; a section that lands well above the target is over budget even though it passes the ceiling.**
   - **≤15 items, ~120 bytes each: the action, the ask, and a section pointer.** Format: `- [ ] **[action]** — [one sentence of why it needs the VP of Product]. → \`<extraction path>\` §[section]`
   - **At most one short verbatim quote per item, and only when the quote *is* the finding.** Do not stack three quotes to build a case; the extraction already did that.
   - **`Reinforces` becomes a single line naming the threads**, not a bulleted essay per thread. `- **Reinforces:** [thread A] N+5 · [thread B] N+10 · [thread C] → see extraction §Notes`
   - **`TP candidates` becomes a numbered list of one-liners** — the TP file, the claim in a clause, the source. Everything else lives in the extraction.

   **Why.** `backlog.md` loads as a project instruction **on every turn of every session**, so its size is a direct tax on all ProdOS work. The structural cause of bloat is appending full analysis to `backlog.md` when that analysis already lives in the extraction file. **A backlog entry should carry the action plus a pointer.** Without this discipline each prune buys only a few weeks.

   **The test before you write a line:** *is this sentence already in the extraction?* If yes, replace it with the pointer. The extraction is the record; the backlog is the queue.

   - 🔴 **These are sales calls. Do NOT manufacture action items for the VP of Product** — AE follow-ups belong in Gong and HubSpot. Only surface what genuinely needs the VP of Product.
4. **`gong_user_map.md`** — placeholder rows for unknown AE IDs.
5. **Memory** — `skills/demo-calls/memory/YYYY-MM-DD.md`: calls enumerated, picked, skipped and why, extraction paths, Drive results, patterns.

---

## Step 5 — Report, then be forgettable

Close with the headlines only — the 3–5 findings that need the VP of Product, and where the files went. **Do not re-summarize the extractions;** they open them if they want more.

State plainly that the knowledge is now on disk and this window can be closed.

---

## Relationship to standup

**Standup does not enumerate, render a picker, call Gong, or nudge about it.** Standup routinely runs before the research window does, so a nudge from a point-in-time file check fires on a race condition. `/catchup` owns noticing whether `/demos` ran today, using `skills/demo-calls/memory/<today>.md`. Everything else standup needs arrives through `backlog.md`, the INDEX, and the segment trackers, which it already reads.

---

## Scope

**MAY:** call `mcp__gong__list_calls` and `mcp__gong__retrieve_transcripts` · invoke transcript-intel · write extractions, INDEX rows, segment trackers, **the procurement needs analysis (dated update section only)**, a backlog section, `gong_user_map.md`, own memory · Drive sync per `voc_drive_sync.md` · dispatch subagents.

**MAY NOT:** auto-extract without a pick · auto-write Truth Pack (surface TP candidates only) · manufacture action items for the VP of Product from sales calls · skip the Drive sync · modify `tasks/active.md` (backlog only — active is capped by design).

---

## Stop conditions

- [ ] Correct business-day window computed at runtime (Monday → Friday)
- [ ] Duration-only filter applied; no title-keyword check anywhere in the run
- [ ] Gong-mislabelled internal meetings listed separately, host IDs not added to the AE map
- [ ] Picker presented and **waited on**
- [ ] Each picked call routed through transcript-intel in full
- [ ] **Drive sync done** for every extraction — **both files, sanitized summary + raw transcript** (or the failure logged)
- [ ] Segment consolidation appended, `n` handled correctly for combination agencies
- [ ] **Procurement/supplies signal appended to the needs analysis (Step 4.2c), or the run states there was none** — cross-segment, so it fires on fire, EMS and LE calls alike. **Disconfirming evidence is never dropped for length.**
- [ ] Backlog section written with no manufactured action items, **and under ~2,500 bytes / ≤15 items — actions plus pointers, reasoning left in the extraction. Measure it; a line count does not bound a markdown line.**
- [ ] Unknown AE IDs appended to `gong_user_map.md` and asked about
- [ ] Memory log written
- [ ] Headlines-only report
