export const meta = {
  name: 'attribution-audit',
  description: 'Audit ProdOS analysis files for misattributed quotes, analyst inference passed off as quotes, and overstated capability absences, by checking each against its raw source and canonical',
  whenToUse: 'Before any analysis file feeds an executive deck, business case, brief, or PRD. Run it when a claim is about to travel outside the repo, and periodically over the files that feed external-facing work.',
  phases: [
    { title: 'Audit', detail: 'one agent per file, each checking claims against its raw sibling and canonical' },
    { title: 'Roll up', detail: 'dedupe, rank by exposure risk, write the correction list' },
  ],
}

// ---------------------------------------------------------------------------
// args: { files?: string[], scopeNote?: string }
//
// Default target set = example paths. Replace DEFAULT_FILES with the analysis
// files that currently feed external-facing work, or pass args.files per run.
// ---------------------------------------------------------------------------

let input = args
if (typeof input === 'string') {
  try {
    input = JSON.parse(input)
  } catch (e) {
    input = { scopeNote: input }
  }
}

const DEFAULT_FILES = [
  'output/transcripts/<quarter>/<date>_<internal-1on1>.md',
  'output/transcripts/<quarter>/<date>_<internal-strategy-session>.md',
  'output/transcripts/<quarter>/<date>_<customer-call>.md',
  'shared/output/voc/Analysis_<Customer>_<topic>_<date>.md',
  'shared/output/voc/<segment>/<segment-needs-coverage>.md',
]

const FILES = (input && input.files && input.files.length ? input.files : DEFAULT_FILES)
const SCOPE_NOTE = (input && input.scopeNote) || 'files currently feeding external-facing work'

// The five defect classes, with the root cause of each. This is the whole point
// of the workflow, so it goes in every auditor's prompt verbatim.
const DEFECTS = `
# THE FIVE DEFECT CLASSES: hunt every one

## D1. MISATTRIBUTION (the most damaging, and the most common)
A quote assigned to the wrong speaker.

**Root cause, and you must internalise it:** extraction files carry a trailer like
"(Source: <Person> 1:1, <date>)". That names the **MEETING**, not the **SPEAKER**. Downstream
readers then cite the quote as though the person the meeting is named after said it. Typical shapes:
  - A statement made by the VP of Product is cited to the other participant in the 1:1.
  - An internal self-assessment, made by the VP of Product while describing their own product to an advisor,
    is cited as the advisor's independent judgement.
For EVERY quoted string, find the speaker in the raw transcript and confirm it.

## D2. ANALYST INFERENCE PRESENTED AS A QUOTE
The extraction's own analytical wording, formatted or cited as if a participant said it.
Typical shape: "Any forecasting or auto-reorder design that assumes station-level usage data will
fail" reads as a participant's quote, but it is the analyst's conclusion.
Test: does this exact sentence appear in the raw? If not, is it presented in a way a reader
would take as spoken? Both matter.

## D3. OVERSTATED CAPABILITY ABSENCE
A claim that PSTrax cannot do something, contradicted by the authoritative record.
Typical shape: a sales rep, unsure about their own product, says a capability is "not developed",
while canonical documents and a shipped per-tenant setting documented in a PRD acceptance criterion
say it exists, and the colleague they deferred to was never asked.
**Authority order for what ships today:**
  1. shared/knowledge/reference/pstrax-module-functionality.md (sandbox-validated)
  2. shared/knowledge/truth_pack/EP_01 — Engineering Context.md and TP_04
  3. a PRD acceptance criterion
  4. an engineer speaking about their own area
  ...and FAR below all of those: a customer's impression, a sales rep's recollection, or an
  analysis file restating one of those.
Distinguish "not built" from "built but unpopulated" from "built but the ergonomics are bad."
Those three have completely different roadmap consequences and get conflated constantly.

## D4. CITATION THAT CUTS THE OTHER WAY
A source cited as support that actually contradicts the claim, or is about a different subject.
Typical shapes: a ticket cited to prove a link does not exist, when it documents that the link
EXISTS and is merely stale; or a remark about one workflow (summing asset repair history) cited as
evidence about another (procurement cost).
Open each cited source and confirm it says what it is cited for.

## D5. INDEPENDENCE INFLATION
One meeting echoed through an extraction, a backlog entry, and an analysis, then counted as
three sources. Independent means distinct agencies or distinct meetings, never distinct files.
Also watch for a synthetic echo: an AI-simulated persona exercise whose prompt was seeded from a
real customer profile is NOT a second agency.
`

const FINDING_SCHEMA = {
  type: 'object',
  properties: {
    file: { type: 'string' },
    claims_checked: { type: 'integer', description: 'How many attributed quotes and capability claims you actually verified.' },
    raw_available: { type: 'boolean', description: 'Was a .raw.md sibling or equivalent ground truth available?' },
    coverage: { type: 'string', description: 'What you checked, and what you could not check and why.' },
    findings: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          defect: { type: 'string', enum: ['D1_misattribution', 'D2_inference_as_quote', 'D3_overstated_absence', 'D4_citation_reversed', 'D5_independence_inflation'] },
          location: { type: 'string', description: 'Section heading or line reference inside the file.' },
          as_written: { type: 'string', description: 'The text as it currently appears.' },
          what_is_true: { type: 'string', description: 'What the raw source or canonical actually says, with the speaker named where relevant.' },
          corrected_text: { type: 'string', description: 'A drop-in replacement that is defensible.' },
          evidence: { type: 'string', description: 'The raw quote or canonical line proving the correction, with its file path.' },
          exposure_risk: {
            type: 'string',
            enum: ['high', 'medium', 'low'],
            description: 'high = would put words in a named person\'s mouth, or assert a false capability gap, if it travelled outside the repo. medium = would misstate strength or source count. low = cosmetic.',
          },
          travelled_to: {
            type: 'array',
            description: 'Other repo files that appear to have inherited this defect. Grep for the claim text to find them.',
            items: { type: 'string' },
          },
        },
        required: ['defect', 'location', 'as_written', 'what_is_true', 'corrected_text', 'evidence', 'exposure_risk'],
      },
    },
  },
  required: ['file', 'claims_checked', 'raw_available', 'coverage', 'findings'],
}

phase('Audit')
log(`Auditing ${FILES.length} file(s): ${SCOPE_NOTE}`)

const audits = await parallel(
  FILES.map((f, i) => () =>
    agent(
      `You are auditing ONE ProdOS analysis file for attribution and capability-claim defects.
This is a correctness audit, not a summary. You are looking for text that would mislead someone
who quoted it in front of an external audience.

# YOUR FILE
${f}

# GROUND TRUTH AVAILABLE TO YOU
1. The **.raw.md sibling** of your file if one exists (same path, .raw.md instead of .md). This is
   the verbatim source and it OUTRANKS the extraction on every question of who said what.
   If your file is an analysis rather than an extraction, find the underlying transcript it cites.
2. **Canonical:** shared/knowledge/truth_pack/ (especially EP_01 and TP_04) and
   shared/knowledge/reference/pstrax-module-functionality.md for what actually ships.
3. **Grep the whole repo** to see where a defective claim has already spread.

# HARD GUARDRAIL
Never read or cite anything under knowledge/_personal/. It holds confidential personal-layer material.
${DEFECTS}

# METHOD
1. Read your file fully. List every attributed quote and every capability claim.
2. Open the raw sibling. For each quote, locate it and confirm the SPEAKER. This is the core of
   the job — do not skip it because the attribution looks plausible.
3. For each capability claim, check it against the authority order in D3.
4. For each cited source, open it and confirm it supports what it is cited for.
5. For anything you find, grep the repo for the claim text and record where else it appears.
   A defect that has already spread to the backlog or a brief is far more urgent than one still
   sitting in a single extraction.

# CALIBRATION
Report real defects only. If the file is clean, return an empty findings array and say so in
coverage — that is a genuinely useful result. Do NOT invent marginal findings to look thorough,
and do NOT flag a quote as misattributed merely because you could not locate it; if the raw is
missing or unsearchable, say that in coverage instead.

Write corrected_text as a drop-in replacement, not as advice. Someone should be able to paste it.`,
      { label: `audit:${f.split('/').pop().slice(0, 34)}`, phase: 'Audit', schema: FINDING_SCHEMA, effort: 'high' },
    ),
  ),
)

const results = audits.filter(Boolean)
const allFindings = results.flatMap((r) => (r.findings || []).map((x) => ({ ...x, file: r.file })))
const failed = audits.length - results.length
if (failed > 0) log(`WARNING: ${failed} auditor(s) failed — those files are UNCHECKED, not clean`)

const byDefect = allFindings.reduce((acc, f) => {
  acc[f.defect] = (acc[f.defect] || 0) + 1
  return acc
}, {})
const highRisk = allFindings.filter((f) => f.exposure_risk === 'high')
log(`${allFindings.length} finding(s) across ${results.length} file(s) | ${highRisk.length} high exposure-risk`)
log(`By class: ${Object.entries(byDefect).map(([k, n]) => `${k} ${n}`).join(' | ') || 'none'}`)

const clean = results.filter((r) => (r.findings || []).length === 0).map((r) => r.file)
if (clean.length > 0) log(`Clean: ${clean.length} file(s)`)

if (allFindings.length === 0) {
  return {
    files_audited: results.length,
    findings: 0,
    note: 'No attribution or capability-claim defects found. Coverage notes are in the journal.',
    coverage: results.map((r) => `${r.file}: ${r.coverage}`),
  }
}

// ---------------------------------------------------------------------------
// Roll up. Needs every finding at once to spot a defect that spread across files.
// ---------------------------------------------------------------------------

phase('Roll up')

const ROLLUP_SCHEMA = {
  type: 'object',
  properties: {
    file_path: { type: 'string' },
    headline: { type: 'string', description: 'One sentence a VP reads first.' },
    high_risk_count: { type: 'integer' },
    spread_count: { type: 'integer', description: 'Defects that have already propagated beyond their origin file.' },
    systemic_patterns: {
      type: 'array',
      description: 'Recurring causes worth a process change rather than a one-off correction.',
      items: { type: 'string' },
    },
    immediate_corrections: {
      type: 'array',
      description: 'The high-risk ones, ready to apply.',
      items: { type: 'string' },
    },
  },
  required: ['file_path', 'headline', 'high_risk_count', 'systemic_patterns'],
}

const rollup = await agent(
  `You are rolling up an attribution audit into one correction list. Reader: the VP of Product at
PSTrax. They will use this to fix the files and to decide whether a process change is
needed upstream in extraction.

# FINDINGS (${allFindings.length} across ${results.length} files)
${JSON.stringify(allFindings, null, 2)}

# COVERAGE
${results.map((r) => `- ${r.file} (${r.claims_checked} claims checked, raw available: ${r.raw_available}): ${r.coverage}`).join('\n')}

# YOUR JOBS
1. **Dedupe and trace spread.** The same defect often appears in several files because one of them
   copied another. Report it once, with the ORIGIN file named and every inheriting file listed.
   A defect that reached tasks/backlog.md or a brief in shared/output/briefs/ is the urgent kind,
   because those feed executive-facing work directly.
2. **Rank by exposure risk**, not by how interesting the defect is.
3. **Name the systemic patterns.** If three misattributions share one cause (for example the
   "Source: X 1:1" trailer naming the meeting rather than the speaker), that is a fix to the
   transcript-intel extraction step, not three text corrections. This is the most valuable output
   in the file — one-off corrections decay, a process fix does not.

# WRITE THE FILE
Get today's date by running:
  [System.TimeZoneInfo]::ConvertTimeBySystemTimeZoneId((Get-Date), 'Eastern Standard Time')
Never compute or guess a date. Write to:
  output/audits/<YYYY-MM-DD>_attribution-audit.md
Create output/audits/ if needed.

# STRUCTURE
0. **Top sheet** — readable in under two minutes and standing alone: how many defects, how many
   high-risk, how many already spread, the single most urgent correction, and whether a process
   change is warranted. Then a horizontal rule.
1. **High exposure-risk corrections** — one block each: as-written, what is true, drop-in corrected
   text, the proving evidence with its file path, and every file that inherited it.
2. **Systemic patterns and the process fix each implies.**
3. **Medium and low risk**, compressed into a table.
4. **Clean files**, named. Absence of findings is a result and belongs in the record.
5. **Coverage and limits** — what was checked, what had no raw sibling available, what was not
   reachable, and therefore what this audit does NOT license anyone to trust.

# WRITING RULES
- Lead with the point. No em dashes. No setup-and-negate constructions.
- Cap prose paragraphs at about 4 sentences. Prefer tables and quote blocks.
- Corrected text must be paste-ready, not advice.
- Never soften a high-risk finding. Putting words in a named person's mouth in front of an
  external audience is the failure this whole audit exists to prevent.`,
  { label: 'rollup', phase: 'Roll up', schema: ROLLUP_SCHEMA, effort: 'high' },
)

return {
  artifact: rollup && rollup.file_path,
  headline: rollup && rollup.headline,
  files_audited: results.length,
  files_failed: failed,
  findings_total: allFindings.length,
  high_risk: highRisk.length,
  by_defect_class: byDefect,
  clean_files: clean,
  systemic_patterns: (rollup && rollup.systemic_patterns) || [],
  immediate_corrections: (rollup && rollup.immediate_corrections) || [],
}
