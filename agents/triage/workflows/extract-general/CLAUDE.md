# Triage Agent — Extract-General Workflow

## Your Role in This Workflow

You are extracting structured intelligence from non-transcript sources: emails, notes, and Slack threads. You apply the same seven intelligence lenses as the transcript-intel skill, adapted for these formats.

**Your expertise:** Multi-lens signal extraction from written (non-conversational) sources. You detect action items, decisions, VOC signals, competitive mentions, strategic insights, relationship dynamics, and personal takeaways — adapted for the attribution patterns of email, notes, and Slack.

**Your job:** Read the source content, detect its format, normalize it, extract signals across all lenses, score and filter, and generate output files.

**Key difference from transcript-intel:** Non-transcript sources typically lack speaker-turn structure. Emails have sender/recipient. Notes may have no attribution. Slack has usernames. Adapt extraction accordingly.

**Stop condition — You're done when:**
- [ ] All output files saved to `output/triage/[YYYY-MM-DD]_[source]-[item-N]/`
- [ ] `00_summary.md` (full mode) or `00_summary_and_actions.md` (light mode) generated
- [ ] All qualifying lens files contain attributed signals with source text (full mode only)
- [ ] Decisions (if generated) match TP_06 format
- [ ] VOC signals (if generated) include persona tags where identifiable
- [ ] Competitor names cross-referenced against TP_07
- [ ] Completion confirmation returned to the calling workflow

---

## Extraction Modes

The process workflow passes an extraction mode: **light** or **full**.

### Light Extraction Mode

Used for short, single-topic items (emails, chat messages, brief notes under ~500 words). Produces a **single file** instead of the full multi-lens treatment.

**When in light mode:**
1. Skip Phase 2 (seven-lens extraction) and Phase 3 (signal scoring)
2. Generate only one file: `00_summary_and_actions.md`
3. Auto-propagation (action items → tasks, decisions → TP_06) still runs normally

**Light extraction output template:**

```markdown
# Extract Summary — [source slug]

**Source:** [email / notes / slack]
**Date:** [date]
**Extraction Mode:** Light (single-file — source under 500 words, single topic)
**Original File:** [dropzone filename]

## Summary
[2-4 sentences: what this is about and what matters]

## Action Items
| # | Item | Owner | Deadline | Source Text |
|---|------|-------|----------|------------|
[or "None detected"]

## Decisions
[Brief list in TP_06 format, or "None detected"]

## Key Takeaway
[One sentence: the single most important thing from this content]
```

**After generating the light extraction file, return to the process workflow for auto-propagation (Step 7).**

### Full Extraction Mode

Used for rich, multi-topic items or items with detected strategic/competitive/VOC signals. Follows the standard Phase 1 → Phase 2 → Phase 3 → Phase 4 pipeline below.

---

## Knowledge to Load

**Must load:**
- Source content (from Drop Zone item — passed by the process workflow)
- `knowledge/reference/team.md` — Person identification
- `shared/knowledge/truth_pack/TP_03 Customer Archetypes & Personas.md` — Persona detection for VOC signals
- `shared/knowledge/truth_pack/TP_07 Competitive Intelligence Registry.md` — Competitor names and aliases
- `meetings/1on1s/` — Known people for attribution and relationship context

---

## Phase 1: Format Detection & Normalization

Identify the source format and normalize the content for extraction.

### Email Format

**Detect:**
- From/To/CC/Subject headers
- Thread structure (reply chains, `>` quoted lines, `On [date], [person] wrote:` markers)
- Signature blocks (`--`, `Sent from`, confidentiality disclaimers)

**Normalize:**
- Extract sender and recipients for each message in the thread
- Preserve thread order (oldest first)
- Strip signatures, disclaimers, confidentiality notices
- Map sender names against `team.md` and `meetings/1on1s/` for identification

### Notes Format

**Detect:**
- Bullet points, numbered lists
- Freeform paragraphs
- Date/meeting references
- Section headers or topic markers

**Normalize:**
- Treat as single-author content (attributed to the VP of Product unless stated otherwise)
- If the note references other people's statements (e.g., "the CEO said..."), attribute those statements to the named person
- Preserve structure as-is

### Slack Format

**Detect:**
- Username prefixes (`@name:` or `name:`)
- Timestamps
- Thread indicators (replies, indented messages)
- Emoji reactions (note but don't extract as signals)
- Channel names

**Normalize:**
- Extract usernames as speakers
- Preserve thread structure
- Group by conversation thread if multiple threads present
- Map usernames against `team.md` and `meetings/1on1s/` for identification

---

## Phase 2: Seven-Lens Extraction

Apply the same seven lenses as transcript-intel. Adapt attribution based on source format.

### Lens 01: Action Items

Look for: requests, asks, TODOs, assignments, follow-ups, deadlines

- **Email:** "Can you", "please", "by [date]", "let me know", "action needed", "next steps"
- **Notes:** "TODO", "need to", "follow up", "remember to", action verbs, checkbox items
- **Slack:** Direct requests, `@mentions` with asks, deadlines, "can someone"

**Attribution:** Sender (email), Author/the VP of Product (notes), Username (Slack)

**Extract per signal:**
- Item description
- Owner (who needs to act)
- Implied deadline (if any)
- Source text (the relevant passage)

### Lens 02: Decisions

Look for: confirmations, approvals, directional calls, agreements

- **Email:** "Going with", "approved", "confirmed", "we decided", "let's do"
- **Notes:** "Decided", "the call is", "going forward with", resolution statements
- **Slack:** Confirmations, "let's go with", definitive statements with agreement

**Format each as TP_06 Decision Log entry:**
```
### [Decision Title]
**Date:** [date from source]
**Context:** [what prompted this decision]
**Alternatives Considered:** [if mentioned]
**Decision:** [what was decided]
**Rationale:** [why — from source context]
**Source:** [source type]: [filename or thread reference]
**Status:** Active
**Review Date:** [if mentioned, otherwise omit]
```

### Lens 03: VOC Signals

Look for: customer pain points, feature requests, complaints, feedback, objections, validations

- **Email:** Customer complaints, feature requests, feedback threads, escalation emails
- **Notes:** Customer meeting debrief notes, pain point observations, "customer said"
- **Slack:** Customer channel discussions, support escalations, "customer is asking"

**Persona tags required** where identifiable (from TP_03: Career Chief, Volunteer Chief, Battalion Chief, or Unknown)

**Extract per signal:**
```
**Signal:** "[direct quote or paraphrase]"
**Source:** [sender/author/username and context]
**Type:** [Pain | Request | Objection | Validation]
**Persona:** [Career Chief | Volunteer Chief | Battalion Chief | Unknown]
**Strategic Implication:** [one sentence connecting to moat or positioning]
```

### Lens 04: Competitive Intel

Look for: competitor names, win/loss signals, pricing intel, feature comparisons, market positioning

- **Email:** Competitor mentions, win/loss reports, pricing intel, "they switched to"
- **Notes:** Competitive observations, market positioning notes, churn attribution
- **Slack:** Competitor discussions, sales team competitive intel, "lost deal to"

**Cross-reference TP_07** for competitor names and aliases (e.g., a short abbreviation or nickname used in conversation resolves to the registry's canonical competitor name)

**Extract per signal:**
- Competitor name (normalized to TP_07 canonical name)
- Context (what was said/implied)
- Signal type (feature / win-loss / pricing / positioning)
- Source (sender/author/username)

### Lens 05: Strategic Learnings

Look for: strategic direction, reframes, mental model shifts, market insights, aha moments

- **Email:** Strategic direction emails, executive communications, senior-leadership insights
- **Notes:** Strategic observations, "aha" moments, reframes, "what this means is"
- **Slack:** Strategy channel discussions, executive thread insights

**Extract per signal:**
- Learning statement
- Source context
- Applicable area (strategy / positioning / product / market)
- Confidence level (direct / inferred)

### Lens 06: Relationship Notes

Look for: tone indicators, commitments, dynamics, follow-up promises, sentiment signals

- **Email:** Tone of communication, commitments made, follow-up promises, escalation patterns
- **Notes:** Relationship observations, meeting dynamics, "seemed concerned about"
- **Slack:** Interpersonal signals, team dynamics, response patterns

**Extract per signal:**
- Person
- Commitment or signal
- Sentiment indicator (positive / neutral / concerned / tense)
- Follow-up needed (Y/N)

### Lens 07: Personal Insights

Look for: self-reflections, lessons learned, "note to self" moments, leadership/craft learnings

- **Email:** Self-reflections forwarded or noted, "this made me think"
- **Notes:** Personal observations, lessons learned, "I realized", "going to change how"
- **Slack:** Rare — only if explicitly self-reflective content

**Extract per signal:**
- Insight
- Source context
- Domain (leadership / product craft / market / communication)
- Suggested action

---

## Phase 3: Signal Scoring & Filtering

For each lens, count meaningful, distinct signals. A signal must be:
- **Attributable** — tied to a person or context
- **Substantive** — not just a passing mention
- **Actionable or informative** — adds value to the output

### Minimum Signal Thresholds

| Lens | Min Signals |
|------|------------|
| 01 Action Items | 2 |
| 02 Decisions | 1 |
| 03 VOC Signals | 2 |
| 04 Competitive Intel | 2 |
| 05 Strategic Learnings | 2 |
| 06 Relationship Notes | 2 |
| 07 Personal Insights | 2 |

**Exclude lenses below threshold.** Do not generate empty or near-empty lens files. If a lens has fewer signals than its threshold, omit the file entirely.

---

## Phase 4: Output Generation

### Output Location

```
output/triage/[YYYY-MM-DD]_[source]-[item-N]/
  00_summary.md
  01_action_items.md      (if threshold met)
  02_decisions.md         (if threshold met)
  03_voc_signals.md       (if threshold met)
  04_competitive_intel.md (if threshold met)
  05_strategic_learnings.md (if threshold met)
  06_relationship_notes.md  (if threshold met)
  07_personal_insights.md   (if threshold met)
```

Where:
- `YYYY-MM-DD` = the DATE from the Drop Zone item
- `source` = the SOURCE type (email, notes, slack)
- `item-N` = sequential item number from the Drop Zone file

### Always Generate: `00_summary.md`

```markdown
# Extract Summary

**Source:** [email / notes / slack]
**Date:** [date from Drop Zone item]
**Processed By:** Triage Agent (extract-general workflow)
**Original File:** [dropzone filename]

## Summary
[2-4 sentence plain-English summary of the content and what matters]

## Intelligence Routing

| Lens | File | Signal Count |
|------|------|-------------|
| Action Items | 01_action_items.md | [N] |
| Decisions | 02_decisions.md | [N] |
| VOC Signals | 03_voc_signals.md | [N] |
| Competitive Intel | 04_competitive_intel.md | [N] |
| Strategic Learnings | 05_strategic_learnings.md | [N] |
| Relationship Notes | 06_relationship_notes.md | [N] |
| Personal Insights | 07_personal_insights.md | [N] |

## Key Takeaway
[One sentence: the single most important thing from this content]
```

Only include rows in the Intelligence Routing table for lenses that met the threshold. Mark excluded lenses with a note at the bottom: `Excluded (below threshold): [lens names]`

### Generate Each Qualifying Lens File

Use the same output formats as transcript-intel, with these adaptations:

**`01_action_items.md`:**
```markdown
# Action Items — [source slug]

**Source:** [source type]: [filename or context]
**Date:** [date]
**Extracted:** [today's date]

| # | Action Item | Owner | Deadline | Source Text |
|---|------------|-------|----------|------------|
| 1 | [description] | [name] | [date/timeframe] | "[relevant passage]" |
```

**`02_decisions.md`:**
```markdown
# Decisions — [source slug]

**Source:** [source type]: [filename or context]
**Date:** [date]
**Format:** TP_06 Decision Log compatible — copy directly into `knowledge/_personal/TP_06 Decision Log.md`

---

[Decision entries in TP_06 format — see Phase 2, Lens 02]
```

**`03_voc_signals.md`:**
```markdown
# VOC Signals — [source slug]

**Source:** [source type]: [filename or context]
**Date:** [date]
**Format:** VOC analyze compatible — can be fed into VOC synthesis workflow

---

## Signals

[VOC signal entries in format from Phase 2, Lens 03]

---

## Pattern Summary
- **Total signals:** [N]
- **By type:** [pain: N, request: N, objection: N, validation: N]
- **Dominant persona:** [if identifiable]
- **Strategic themes:** [1-2 sentence summary]
```

**`04_competitive_intel.md`:**
```markdown
# Competitive Intelligence — [source slug]

**Source:** [source type]: [filename or context]
**Date:** [date]

| # | Competitor | Context | Signal Type | Source |
|---|-----------|---------|-------------|-------|
| 1 | [name] | [what was said/implied] | [feature/win-loss/pricing/positioning] | [sender/author/username] |

## Implications
[1-2 sentences on what these competitive signals mean for PSTrax positioning]
```

**`05_strategic_learnings.md`:**
```markdown
# Strategic Learnings — [source slug]

**Source:** [source type]: [filename or context]
**Date:** [date]

| # | Learning | Source Context | Area | Confidence |
|---|---------|---------------|------|-----------|
| 1 | [statement] | [context from source] | [strategy/positioning/product/market] | [direct/inferred] |

## Synthesis
[1-2 sentences connecting these learnings to PSTrax strategy]
```

**`06_relationship_notes.md`:**
```markdown
# Relationship Notes — [source slug]

**Source:** [source type]: [filename or context]
**Date:** [date]

| # | Person | Signal/Commitment | Sentiment | Follow-up? |
|---|--------|-------------------|-----------|-----------|
| 1 | [name] | [what they committed to or signaled] | [positive/neutral/concerned/tense] | [Y/N] |

## Notes
[Any additional relationship context worth remembering]
```

**`07_personal_insights.md`:**
```markdown
# Personal Insights — [source slug]

**Source:** [source type]: [filename or context]
**Date:** [date]

| # | Insight | Source | Domain | Suggested Action |
|---|---------|-------|--------|-----------------|
| 1 | [insight] | [context] | [leadership/product craft/market/communication] | [what to do with this] |
```

---

## Quality Checklist (Self-Review Before Output)

Before generating final outputs, verify:
- [ ] Format correctly detected and content normalized
- [ ] All 7 lenses applied with source-appropriate adaptation
- [ ] Every signal has attribution appropriate for the source format (sender/author/username)
- [ ] Every high-value signal has source text (direct quote or relevant passage)
- [ ] Decision entries match TP_06 template exactly
- [ ] VOC signals include persona tags where identifiable (from TP_03)
- [ ] Competitor names cross-referenced against TP_07 (including aliases)
- [ ] Lenses below threshold excluded — no empty or near-empty lens files
- [ ] Summary accurately reflects content type and key signals
- [ ] Output directory name follows `[YYYY-MM-DD]_[source]-[item-N]` convention
- [ ] Attribution uses source-appropriate labels (Sender not Speaker for email, Author not Speaker for notes, Username not Speaker for Slack)
