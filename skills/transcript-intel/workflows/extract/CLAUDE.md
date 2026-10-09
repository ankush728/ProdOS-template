# Transcript Intelligence — Extract Workflow

## Your Role in This Workflow

You are processing a transcript through all four extraction phases to produce structured intelligence outputs.

**Your expertise:** Multi-lens signal extraction from conversational transcripts. You detect action items, decisions, VOC signals, competitive mentions, strategic insights, relationship dynamics, and personal takeaways — all in a single pass.

**Your job:** Read the transcript, resolve speakers, extract signals across all lenses, get user approval, and generate output files.

**Stop condition — You're done when:**
- [ ] Meeting file saved to `output/transcripts/<quarter>/<YYYY-MM-DD>_<slug>.md`
- [ ] `## Summary` section always written
- [ ] All approved lens sections contain attributed, quoted signals; unapproved sections render `_None._`
- [ ] `## Decisions` section (if populated) matches TP_06 format
- [ ] `## VOC Signals` section (if populated) matches VOC analyze format
- [ ] Raw transcript saved to sibling `<YYYY-MM-DD>_<slug>.raw.md` (when present)
- [ ] One row appended to `output/transcripts/INDEX.md`
- [ ] Completion confirmation displayed with file path(s)

---

## Knowledge to Load

**Must load:**
- Transcript file (provided by user)
- `knowledge/reference/team.md` — Speaker resolution
- `shared/knowledge/truth_pack/TP_03 Customer Archetypes & Personas.md` — Persona detection
- `meetings/1on1s/` — 1:1 profiles for speaker resolution
- `skills/transcript-intel/MEMORY.md` — Past learnings

**Load if competitive signals detected:**
- `shared/knowledge/truth_pack/TP_07 Competitive Intelligence Registry.md` — Competitor names and aliases

**Load if VOC signals detected:**
- Recent `shared/output/voc/Analysis_*.md` files — Pattern matching

---

## Phase 1: Read & Detect

### Step 1: Read the Transcript
- Read the file provided by the user
- Do not skim — read the full transcript

### Step 2: Detect Format
Identify the transcript format and normalize accordingly:

| Format | Detection Cues | Normalization |
|--------|---------------|---------------|
| **Plain text** (.txt, .md) | `Name:` or `[Name]` speaker labels | Extract speaker labels, group by turns |
| **VTT** (.vtt) | `WEBVTT` header, `-->` timestamp markers | Strip timestamps, extract speaker from cue text |
| **SRT** (.srt) | Numbered entries, `-->` timestamps | Strip sequence numbers and timestamps, extract speaker labels |
| **Otter.ai** | "Speaker 1/2/3" labels, paragraph format | Map speaker labels, preserve turn structure |
| **Zoom transcript** | Display names with timestamps | Extract display names as speaker labels |
| **DOCX** | Word document format | Read content, identify speaker turn patterns |

### Step 3: Identify Speakers
- List all distinct speaker labels found
- Cross-reference against `team.md` and 1:1 profiles
- Mark the VP of Product (the user) automatically
- Track which speakers are resolved vs. unresolved

### Step 4: Note Structural Cues
- Heavy Q&A → likely interview
- Dense monologue → likely presentation or podcast
- Back-and-forth with action items → likely working meeting
- Two speakers, personal topics → likely 1:1

---

## Phase 2: Speaker Disambiguation (Interactive)

**Rule:** Only ask about speakers you cannot confidently resolve from context.

### If all speakers resolved:
Skip to Phase 3. Tell the user:
```
All [N] speakers identified: [list names and roles].
Proceeding to extraction...
```

### If unresolved speakers exist:
Present disambiguation questions in a single batch:

```
Reading: [filename]
Detected [N] speakers. Resolved: [names]. Unresolved: [count].

SPEAKER DISAMBIGUATION

Speaker 2 says: "[sample quote from early in transcript]"
Who is Speaker 2? (or leave blank to keep as 'Unknown')

Speaker 3 says: "[sample quote from early in transcript]"
Who is Speaker 3? (or leave blank to keep as 'Unknown')
```

**Important:**
- Show a distinctive quote that might help the user identify the speaker
- Batch all questions together — don't ask one at a time
- Accept blank/empty as "Unknown [N]"
- Do not block on unresolved speakers — proceed with whatever is resolved

---

## Phase 3: Deep Extraction & Lens Proposal (Interactive)

### Step 1: Run All Seven Lenses

For each lens, scan the full transcript and extract matching signals:

**Lens 01 — Action Items:**
Look for: commitments, follow-ups, deliverables, deadlines
Extract: Item description, owner (speaker), implied deadline, source quote

**Lens 02 — Decisions:**
Look for: confirmed choices, agreements, directional calls
Extract: Decision statement, context, who was present, date
Format each as TP_06 Decision Log entry:
```
### [Decision Title]
**Date:** [date of transcript]
**Context:** [what prompted this decision]
**Alternatives Considered:** [if mentioned]
**Decision:** [what was decided]
**Rationale:** [why — from transcript context]
**Source:** Transcript: [filename]
**Status:** Active
**Review Date:** [if mentioned, otherwise omit]
```

**Lens 03 — VOC Signals:**
Look for: customer pain points, feature requests, objections, validations
Extract: Direct quote, signal type (pain/request/objection/validation), persona tag (from TP_03 if identifiable), strategic implication
Format compatible with VOC analyze output:
```
**Signal:** "[direct quote]"
**Speaker:** [name/role]
**Type:** [Pain | Request | Objection | Validation]
**Persona:** [Career Chief | Volunteer Chief | Battalion Chief | Unknown]
**Strategic Implication:** [one sentence connecting to moat or positioning]
```

**Lens 04 — Competitive Intel:**
Look for: competitor names (check TP_07 aliases), competitive mentions, win/loss signals
Extract: Competitor name, context, signal type (feature/win-loss/pricing/positioning), source speaker

**Lens 05 — Strategic Learnings:**
Look for: reframes, mental model shifts, insights about market/product/positioning
Extract: Learning statement, source context, applicable area, confidence level

**Lens 06 — Relationship Notes:**
Look for: commitments between people, sentiment signals, follow-up needs
Extract: Person, commitment or signal, sentiment, follow-up needed

**Lens 07 — Personal Insights:**
Look for: self-reflection, "note to self" moments, leadership/craft learnings
Extract: Insight, source, domain, suggested action

### Step 2: Score Each Lens
Count meaningful, distinct signals per lens. A signal must be:
- Attributable (tied to a speaker or context)
- Substantive (not just a passing mention)
- Actionable or informative (adds value to the output)

### Step 3: Present Lens Proposal

Present only lenses that meet their minimum signal threshold:

```
LENS PROPOSAL — [filename]

The following lenses have meaningful signal. Approve the ones you want written.
Unapproved lenses will render "_None._" under their heading (section order is fixed).
Press Enter to approve all, or specify numbers to exclude (e.g., "2 4"):

[1] ACTION ITEMS          → ## Action Items
    [N] items found. Owners: [names]. [deadline note if applicable].

[2] DECISIONS             → ## Decisions
    [N] decisions logged. [brief description].

[3] VOC SIGNALS           → ## VOC Signals
    [N] signals found. Types: [pain/request/etc.].

[4] COMPETITIVE INTEL     → ## Competitive Intel
    [N] mentions. Competitors: [names].

[5] STRATEGIC LEARNINGS   → ## Strategic Learnings
    [N] learnings flagged. [brief topic note].

[6] RELATIONSHIP NOTES    → ## Relationship Notes
    [brief description of key relationship signals].

[7] PERSONAL INSIGHTS     → ## Personal Insights
    [N] insights found. Domains: [leadership/craft/etc.].

Excluded (low signal): [list lenses that didn't meet threshold]

Your selection (Enter = approve all):
```

---

## Phase 4: Output Generation

### Determine Output Path

Before writing, compute:
- **Quarter folder:** `2026Q2` for Apr–Jun 2026, `2026Q3` for Jul–Sep 2026, etc. Create with `mkdir -p` if absent.
- **Meeting file:** `output/transcripts/<quarter>/<YYYY-MM-DD>_<slug>.md`
- **Raw file (when transcript text is present):** `output/transcripts/<quarter>/<YYYY-MM-DD>_<slug>.raw.md`

### Write the Meeting File

Write ONE file containing YAML frontmatter followed by eight fixed `##` sections in this exact order:

```markdown
---
date: YYYY-MM-DD
meeting: <slug or short title>
people: [ ... ]        # best-effort attendee tags
themes: [ ... ]        # best-effort topic tags (free-form)
source: zoom|gong|notes
---

# <meeting> — <date>

## Summary

**Source:** [filename]
**Date:** [date from filename or transcript content]
**Participants:** [resolved speaker list with roles]
**Conversation Type:** [auto-classified: 1:1 / team meeting / customer interview / board call / etc.]

[3-5 sentence plain-English summary of what was discussed and what matters]

**Key Takeaway:** [One sentence: the single most important thing from this conversation]

## Action Items

**Extracted:** [today's date]

| # | Action Item | Owner | Deadline | Source Quote |
|---|------------|-------|----------|-------------|
| 1 | [description] | [name] | [date/timeframe] | "[abbreviated quote]" |

## Decisions

**Format:** TP_06 Decision Log compatible — copy directly into `knowledge/_personal/TP_06 Decision Log.md`

---

[Decision entries in TP_06 format — see Phase 3 template]

## VOC Signals

**Format:** VOC analyze compatible — can be fed into VOC synthesis workflow

---

[VOC signal entries in format from Phase 3]

---

**Pattern Summary**
- **Total signals:** [N]
- **By type:** [pain: N, request: N, objection: N, validation: N]
- **Dominant persona:** [if identifiable]
- **Strategic themes:** [1-2 sentence summary]

## Competitive Intel

| # | Competitor | Context | Signal Type | Speaker |
|---|-----------|---------|-------------|---------|
| 1 | [name] | [what was said/implied] | [feature/win-loss/pricing/positioning] | [speaker] |

**Implications:** [1-2 sentences on what these competitive signals mean for PSTrax positioning]

## Strategic Learnings

| # | Learning | Source Context | Area | Confidence |
|---|---------|---------------|------|-----------|
| 1 | [statement] | [context from transcript] | [strategy/positioning/product/market] | [direct/inferred] |

**Synthesis:** [1-2 sentences connecting these learnings to PSTrax strategy]

## Relationship Notes

| # | Person | Signal/Commitment | Sentiment | Follow-up? |
|---|--------|-------------------|-----------|-----------|
| 1 | [name] | [what they committed to or signaled] | [positive/neutral/concerned/tense] | [Y/N] |

[Any additional relationship context worth remembering]

## Personal Insights

| # | Insight | Source | Domain | Suggested Action |
|---|---------|-------|--------|-----------------|
| 1 | [insight] | [context] | [leadership/product craft/market/communication] | [what to do with this] |
```

**Lenses not approved (or below signal threshold):** render `_None._` as the only line under the heading. Never omit a heading — the eight-section order is fixed.

### Save Raw Transcript (when present)

If the drop-zone block or input file contains a `RAW:` body or verbatim speaker-grouped transcript, write it to the sibling `.raw.md` file. Never inline it in the meeting file.

```markdown
# Raw Transcript — <slug> — <date>

[verbatim speaker-grouped transcript]
```

### Append to INDEX.md

After the meeting file is written, append one row to `output/transcripts/INDEX.md`. Create the file (with header row) if it does not exist.

```markdown
| Date | Meeting | People | Themes | Source | Link |
|------|---------|--------|--------|--------|------|
| YYYY-MM-DD | <meeting slug/title> | [person, person] | [theme, theme] | zoom/gong/notes | [↗](<quarter>/<YYYY-MM-DD>_<slug>.md) |
```

### Completion Confirmation

After all files are written, display:
```
PROCESSING COMPLETE

Source:    [filename]
Meeting file: output/transcripts/<quarter>/<YYYY-MM-DD>_<slug>.md
Raw file:  output/transcripts/<quarter>/<YYYY-MM-DD>_<slug>.raw.md  (if written)
INDEX:     output/transcripts/INDEX.md  (row appended)

Sections written:
  ## Summary          ✓
  ## Action Items     ✓  ([N] items)
  ## Decisions        ✓  ([N] decisions)
  ## VOC Signals      ✓  ([N] signals)  — or — _None._
  ## Competitive Intel ✓  ([N] mentions) — or — _None._
  ## Strategic Learnings ✓  ([N] learnings)
  ## Relationship Notes  ✓
  ## Personal Insights   ✓  — or — _None._

Downstream integration:
  - ## Decisions ready for TP_06 append
  - ## VOC Signals ready for VOC synthesis
  - [other relevant integrations]
```

---

## Quality Checklist (Self-Review Before Output)

Before generating final outputs, verify:
- [ ] Every signal has speaker attribution
- [ ] Every high-value signal has a direct quote
- [ ] `## Decisions` entries match TP_06 template exactly
- [ ] `## VOC Signals` entries include persona tags where identifiable
- [ ] `## Action Items` entries have owners (even if "Unclear")
- [ ] No lens section is populated with fewer signals than its threshold (render `_None._` instead)
- [ ] `## Summary` accurately reflects conversation type and key content
- [ ] Slug and date in the filename are correct
- [ ] YAML frontmatter is well-formed (valid list syntax for `people` and `themes`)
- [ ] Quarter folder exists (create if absent before writing)
- [ ] One row appended to `output/transcripts/INDEX.md`
- [ ] Raw transcript written to sibling `.raw.md` (not inlined in meeting file)
