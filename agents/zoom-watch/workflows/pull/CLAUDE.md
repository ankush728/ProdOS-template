# Zoom Watch — Pull Workflow

The single workflow used by both the cron jobs and the `/zoom-watch pull` command. Fetches new Zoom transcripts, dedups against the drop-zone, and appends them as `SOURCE: transcript` blocks to today's drop-zone file.

---

## Inputs

- **Window** — `(from, to)` UTC range. Cron uses `(now - 36h, now)`. On-demand `/zoom-watch pull` uses the same default. `/zoom-watch pull <reference>` may narrow the window based on date hints in the reference.
- **Reference** (optional, on-demand only) — substring to match against Zoom topic or attendee names.

## Step 1 — Load context

Read `agents/zoom-watch/MEMORY.md` for slug calibrations and known calendar/Zoom topic mismatches.

Determine today's date in Eastern Time:
- PowerShell: `[System.TimeZoneInfo]::ConvertTimeBySystemTimeZoneId((Get-Date), 'Eastern Standard Time')`
- Use the date portion (YYYY-MM-DD) for the dropzone filename: `drop-zone/dropzone_YYYY-MM-DD.md`.

## Step 2 — Build the existing-UUID set (dedup state)

Scan the drop-zone for already-pulled UUIDs:

1. Glob `drop-zone/dropzone_*.md` — read each file. For every line matching `^ZOOM_UUID:\s*(\S+)`, capture the UUID.
2. Glob `drop-zone/archive/dropzone_*_archived.md` — same scan.
3. Combine into a single set `existing_uuids`.

If no dropzone files exist yet, `existing_uuids` is empty.

## Step 3 — Query Zoom MCP

Call `mcp__claude_ai_Zoom_for_Claude__search_meetings` with:
- `from` = window start (ISO 8601 UTC, e.g. `2026-05-04T00:00:00Z`)
- `to` = window end (ISO 8601 UTC)
- `q` = the user-supplied reference, if any (omit for cron / parameterless `/zoom-watch pull`)
- `page_size` = 100

Paginate via `next_page_token` until exhausted. No cap — process all pages.

## Step 4 — Filter candidates

For each meeting returned:

1. **Permission + asset filter** — keep the candidate if AT LEAST ONE of these is true:
   - `has_transcript == true` AND `has_transcript_permission == true` → candidate's preferred source is the verbatim transcript
   - `has_summary == true` AND `has_summary_permission == true` → candidate's fallback source is the Zoom AI summary
   
   Skip the candidate only if BOTH paths fail (no transcript permission AND no summary permission, or neither asset exists). The fallback to summary is intentional — Zoom AI Companion frequently produces a summary without verbatim transcription enabled, and the summary is high-fidelity for triage extraction even if quotes are paraphrased.
   
   Tag each surviving candidate with `asset_type` = `transcript` (preferred) or `zoom-summary` (fallback). Used downstream in Step 6.

   🔴 **Permission-locked meetings are IGNORED, not reported.** When both paths fail, log the meeting once to the run's skip list in `memory/YYYY-MM-DD.md` and move on. **Do not surface it as a gap, a miss, or a finding** — not in the run report, not in conversation. The same handful of host-locked recurring meetings (other teams' personal meeting rooms, leadership meetings, anything on an external tenant) would otherwise be re-reported on every run of every day, which is noise rather than signal.
   - 🔴 **NEVER escalate a lock, not even a new one, and never suggest asking the organizer for permission.** The VP of Product records their own meetings with a separate note-taking tool and pastes the transcripts into the drop zone themselves. A lock is therefore **a routing fact, not a gap**: the meeting still gets captured, through them rather than through the MCP. Add the host to the list in `MEMORY.md`, log it to the run's skip list, and say nothing.
   - ⚠️ **Keep evaluating BOTH asset paths every run anyway.** Ignoring is about *reporting*, not about *checking*. Permissions are per asset: a host can be on the locked list while `has_transcript_permission` is true for a given meeting even though the summary permission stays false. A host-level skip would lose a full verbatim. **Cheap to check, expensive to assume.**

2. **UUID dedup** — skip if `meeting_uuid` is in `existing_uuids`.

3. **Reference match** (on-demand `pull <reference>` only) — confirm the substring matches `topic`, any attendee name, or a date-component of `schedule_start_time`. If no match, drop. If the candidate set is now empty, report "No matching meeting found." and stop.

If `existing_uuids` filtering leaves >0 candidates, proceed. If 0 candidates AND this is a cron run, exit silently. If 0 candidates AND this is on-demand, report "No new transcripts or summaries found in window."

## Step 5 — Multi-match disambiguation (on-demand only)

If `/zoom-watch pull <reference>` resolves to >1 candidate after filtering:

- List candidates: `[N] [topic] — [start time ET] — [attendees, comma-separated]`
- Ask user: "Multiple matches. Pull which one (1, 2, ...), all, or none?"
- Wait for response. Proceed with selected. Do NOT pull anything before the answer.

For cron runs, never disambiguate — pull all surviving candidates.

## Step 6 — For each candidate, fetch and format

For each remaining candidate, in order of `schedule_start_time` (oldest first):

### 6a — Fetch meeting assets

Call `mcp__claude_ai_Zoom_for_Claude__get_meeting_assets` with `meetingId` = the candidate's `meeting_uuid`.

**If the response is truncated** (returns "result exceeds maximum allowed tokens" with a temp file path):
- Parse the temp file path from the error message.
- Read the JSON file directly using the `Read` tool, in chunks if needed.
- Continue with the parsed JSON as if it had returned inline.

**Asset selection — prefer transcript, fall back to summary:**

1. If `meeting_transcript.transcript_items` is present and non-empty → use the verbatim transcript path (Step 6b-transcript). Set the candidate's `asset_type = transcript`.
2. Else if `meeting_summary.summary_markdown` (or `summary_plain_text`) is present → use the AI-summary path (Step 6b-summary). Set the candidate's `asset_type = zoom-summary`.
3. Else → log a warning, skip this candidate, do NOT add UUID to dedup state (next run retries).

This is the same precedence the Step 4 filter implied — transcripts are richer for downstream triage; summaries are the fallback when Zoom AI Companion produced a summary without verbatim transcription.

### 6b-transcript — Format the verbatim transcript as speaker-grouped markdown

(Use this path when `asset_type == transcript`.)

Iterate `meeting_transcript.transcript_items`. For each item:

1. Look for a `Name: ` prefix in `text` (colon at index 1–60). If present, extract `speaker = text[:colon].trim()` and `body = text[colon+1:].trim()`.
2. If there's no colon prefix, `speaker = null`, `body = text`.
3. When `speaker != last_speaker` (and `speaker` is not null), emit a new speaker block header:

```
**<speaker>** [<HH:MM:SS>]
```

Use `item.start` for the timestamp.

🔴 **Normalize `item.start` before emitting — it carries milliseconds.** The raw value is `00:00:12.000`; the block format is `[HH:MM:SS]`. **Strip everything from the `.` onward.** This is not cosmetic: downstream extractions quote these timestamps, and a mixed corpus makes them unsearchable.

Do it inline here rather than as a post-format pass, so it is never fixed after the fact.

4. Emit `body` on the next line.

The result is markdown like:

```
**An External Contact** [00:50:05]
We operate a lot leaner than...

**A team member** [00:50:14]
Yeah.
```

### 6b-summary — Format the Zoom AI summary as structured markdown

(Use this path when `asset_type == zoom-summary`.)

Use `meeting_summary.summary_markdown` if present (preferred — already structured with headings). Fall back to `meeting_summary.summary_plain_text` if not.

Emit the content as-is — no reformatting needed. The summary is the body of the `RAW:` block.

**Speaker attribution caveat:** Zoom AI summaries include lines like `the product manager: ...` or `the VP of Product: questioned why...` — these are **paraphrases** by the AI, not verbatim quotes. Downstream triage MUST be told this so it does not mis-attribute exact words. The `NOTE:` metadata line in Step 6f handles that.

### 6c — Filter bot/automation attendees

Before computing metadata, filter the `attendees[]` array to remove bot/automation participants. They pollute the `ATTENDEES` field and corrupt slug derivation (a notetaker bot will resolve as "external" because it isn't in team.md, even when no real human external attendee exists).

An attendee is treated as a bot if its `user_name` matches **any** of the following (case-insensitive substring match):

- `notetaker` (catches "RevOps Notetaker", "Read.ai Notetaker", "Otter.ai Notetaker", etc.)
- `ai companion` (catches "Zoom AI Companion")
- `otter.ai`
- `fireflies`
- `fathom`
- `read.ai`
- `tactiq`
- `grain.com`

The filtered list (call it `human_attendees`) replaces the raw `attendees[]` array for both Step 6c (`ATTENDEES` field) and Step 6d (slug derivation). The raw list is NOT used downstream after this step.

### 6d — Compute optional metadata

Build the metadata block from the assets payload + the `search_meetings` candidate object:

| Field | Source |
|---|---|
| `DATE` | Today's date in ET (YYYY-MM-DD) |
| `SOURCE` | `transcript` if `asset_type == transcript`; `zoom-summary` if `asset_type == zoom-summary` |
| `ZOOM_UUID` | `meeting_uuid` |
| `ZOOM_TOPIC` | `topic` from search result, exact string. If empty/missing → `(none)` |
| `MEETING_START` | `schedule_start_time` (ISO 8601 UTC, exactly as Zoom returns it) |
| `MEETING_DURATION` | Computed from `meeting_start_time` and `meeting_end_time` (if both present), formatted as `<H>h <M>m`. Drop seconds. Omit `<H>h ` when hours = 0 (e.g. `45m`, `1h 34m`). If duration cannot be computed, omit the field entirely. |
| `ATTENDEES` | Comma-separated names from `human_attendees[].user_name` (post-bot-filter), in the order Zoom returns them. If empty/missing → `(unknown)` |
| `SUGGESTED_SLUG` | See Step 6e |
| `NOTE` | **Only emit when `asset_type == zoom-summary`.** Literal text: `Zoom AI Companion produced a structured summary, NOT a verbatim transcript. Extracted action items and decisions are reliable; do not quote as verbatim.` Omit the field entirely for transcript sources. |

### 6e — Derive `SUGGESTED_SLUG`

All attendee references below operate on `human_attendees` (the post-bot-filter list from Step 6c), not the raw `attendees[]` array.

```
slug_date = MEETING_START date in YYYY-MM-DD (ET)

generic_topic_patterns = [
    "Personal Meeting Room",
    "'s Personal Meeting Room",   # case-insensitive substring; matches "a team member's Personal Meeting Room"
    "Instant Meeting",
    "Zoom Meeting"
]

is_generic = any pattern (case-insensitive substring) appears in ZOOM_TOPIC

if not is_generic:
    slug = slugify(ZOOM_TOPIC)
elif any human_attendee resolves as external:
    slug = "external-" + slugify(<first external human attendee name>)
elif human_attendees is non-empty:
    slug = "internal-" + slugify(<first human attendee name other than the VP of Product>)
else:
    slug = "all-bots"   # only bots attended (rare); user can override

SUGGESTED_SLUG = slug_date + "_" + slug
```

**External attendee resolution:** a human attendee is `external` if their `user_name` does NOT appear in `knowledge/reference/team.md` under the Internal Stakeholders or the investor sections. Match full name, case-insensitive. The Zoom-level `has_external_user` flag is informational only — once bots are filtered, the human-attendee list is authoritative for external/internal classification.

**`slugify()`:** lowercase the string, replace runs of non-alphanumeric characters with a single `-`, strip leading/trailing `-`, truncate to a maximum of 40 characters.

### 6f — Append to today's drop-zone file

Open `drop-zone/dropzone_YYYY-MM-DD.md` (today's ET date). If it does not exist, create it empty.

Append (never overwrite) the following block. Always start with a `---` separator on its own line, followed by a blank line, even if the file is currently empty (the separator demarcates entries — triage already splits on `---`):

```
---

DATE: 2026-05-05
SOURCE: transcript
ZOOM_UUID: <uuid>
ZOOM_TOPIC: <topic>
MEETING_START: <ISO 8601 UTC>
MEETING_DURATION: <duration>
ATTENDEES: <names>
SUGGESTED_SLUG: <slug>
RAW:
<speaker-grouped transcript, no leading blank line>
```

### 6g — Add UUID to `existing_uuids` (in-memory)

So that subsequent candidates in this same run dedup correctly.

## Step 7 — Update memory

Append a session entry to `agents/zoom-watch/memory/YYYY-MM-DD.md` (today's ET date; create if missing). Format:

```markdown
## Run at HH:MM ET — <invocation type: cron / on-demand / on-demand with reference>

- Window: <from> → <to>
- Candidates returned: <N>
- Skipped — already in dropzone: <N> (UUIDs: ...)
- Skipped — no transcript permission: <N>
- Skipped — reference no match: <N>
- Pulled: <N>
  - <topic> (<uuid>) → SUGGESTED_SLUG: <slug>
  - ...
- Errors: <list, or none>
- MCP latency: <approx seconds>
```

## Step 8 — Report

**Cron mode:** silent if 0 pulled. If >0, output one line per pulled meeting:

```
Zoom Watch (HH:MM): pulled <N> transcript(s):
- <topic> (<duration>) → drop-zone/dropzone_YYYY-MM-DD.md
- ...
```

**On-demand mode:** always report, even on 0 pulled (so the user knows the command ran).

Do **not** invoke `/triage`. Do **not** modify any file outside the drop-zone or `agents/zoom-watch/memory/`.

## Failure handling

| Condition | Action |
|---|---|
| MCP auth/network/rate-limit failure | Log to today's memory file. Skip this run. The next cron retry will catch up via the 36h window. On 3+ consecutive failures across runs, surface a one-line alert in conversation: "Zoom Watch: MCP unavailable for 3+ runs. Check authentication." |
| `get_meeting_assets` returns neither transcript NOR summary despite the search-API flags | Log a warning. Skip this candidate. Do NOT add the UUID to dedup state — let the next run try again. |
| `get_meeting_assets` returns no transcript but a summary IS present | Fall back to summary path (Step 6b-summary). Set `asset_type = zoom-summary`. Continue normally. |
| Truncated MCP response | Read from the temp file path the MCP returned. Continue normally. |
| `search_meetings` returns >300 candidates | Pagination via `next_page_token`. Process all pages. No artificial cap. |
| Missing `topic` | Use `(none)`. Slug derivation falls through to attendee-based rule. |
| Missing `attendees` | Use `(unknown)`. Slug derivation falls through to UUID suffix (`internal-<first-uuid-segment>`). |

## Authorized actions

**MAY do autonomously:**
- Query Zoom MCP (`search_meetings`, `get_meeting_assets`).
- Read drop-zone files and the team.md reference.
- Append to today's `drop-zone/dropzone_YYYY-MM-DD.md`.
- Create today's dropzone file if missing.
- Write to `agents/zoom-watch/memory/YYYY-MM-DD.md`.

**MAY NOT do without explicit user request:**
- Modify or delete any existing dropzone content.
- Run `/triage` or any extraction skill.
- Modify Truth Pack, profiles, tasks, MEMORY.md, or any other ProdOS file.
- Pull Zoom recordings, Docs, whiteboards, or notes.

## Stop conditions

Pull run is complete when:
- [ ] Zoom MCP queried with the correct window
- [ ] All candidates classified (pulled / skipped with reason)
- [ ] Pulled transcripts appended to today's drop-zone (one block each)
- [ ] Daily memory log updated
- [ ] Report displayed (or silent if cron + 0 pulled)
