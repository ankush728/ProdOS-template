export const meta = {
  name: 'engagement-review',
  description: 'Quarter-end scan of the ProdOS repo that answers each Employee Engagement question with one dedicated agent, verifies the factual answers against their sources, and writes a submission-ready draft',
  whenToUse: 'At the close of a quarter, when the Employee Engagement questionnaire arrives from HR and the honest answers (what shipped, what drifted, what the goals should be) are spread across GOALS.md, recall output, transcripts, task archives and skill memory.',
  phases: [
    { title: 'Accountability', detail: 'read last quarter\'s draft, check each stated goal against evidence' },
    { title: 'Answer', detail: 'one agent per survey question, each against its own corpora' },
    { title: 'Verify', detail: 'open every cited file, confirm the quote, kill shipped-claims backed only by status flags' },
    { title: 'Assemble', detail: 'write the draft to output/engagement/' },
    { title: 'Critique', detail: 'honesty + style pass, applied in place' },
  ],
}

// ---------------------------------------------------------------------------
// args: { quarter: string,            // REQUIRED, e.g. "2026Q4" (the survey period)
//         reportingOn?: string,       // e.g. "Q3 2026" (the quarter being reported on)
//         priorDraft?: string,        // path override; defaults to the previous quarter's file
//         person?: string }           // defaults to the VP of Product
//
// Date/time functions are unavailable inside workflow scripts (they break resume),
// so the quarter is always passed in rather than derived.
// ---------------------------------------------------------------------------

let input = args
if (typeof input === 'string') {
  try {
    input = JSON.parse(input)
  } catch (e) {
    input = { quarter: input }
  }
}

const QUARTER = input && input.quarter
if (!QUARTER || !/^\d{4}Q[1-4]$/.test(String(QUARTER))) {
  const shape = `typeof args = ${typeof args}; keys = ${
    args && typeof args === 'object' ? Object.keys(args).join(',') : 'n/a'
  }; preview = ${String(args).slice(0, 200)}`
  log(`ARGS DIAGNOSTIC — ${shape}`)
  throw new Error(
    `engagement-review needs args.quarter in YYYYQ# form (e.g. "2026Q4"). Got: ${shape}`
  )
}

const PERSON = (input && input.person) || 'the VP of Product'
const REPORTING_ON = (input && input.reportingOn) || 'the quarter that just closed'

// Previous quarter, computed by string arithmetic (no Date available).
const YEAR = parseInt(String(QUARTER).slice(0, 4), 10)
const QNUM = parseInt(String(QUARTER).slice(5), 10)
const PRIOR_QUARTER = QNUM === 1 ? `${YEAR - 1}Q4` : `${YEAR}Q${QNUM - 1}`
const PERSON_SLUG = input && input.person ? String(input.person).split(' ')[0] : 'VPProduct'
const PRIOR_DRAFT =
  (input && input.priorDraft) ||
  `output/engagement/${PRIOR_QUARTER}_${PERSON_SLUG}_Engagement_Draft.md`
const OUT_PATH = `output/engagement/${QUARTER}_${PERSON_SLUG}_Engagement_Draft.md`

// ---------------------------------------------------------------------------
// Shared guardrails. These encode the repo's own discipline: the
// attribution-audit findings, the release-notes defect class, the confidential
// capture rule, and the VP of Product's writing-style rules.
// ---------------------------------------------------------------------------

const RULES = `
## Repo
<repo-root>
PSTrax = fire/EMS compliance software. ${PERSON} is the VP of Product,
reporting to the CEO. You are drafting ${PERSON}'s OWN self-assessment for the
quarterly Employee Engagement questionnaire. Survey period ${QUARTER}; it reports on ${REPORTING_ON}.

## HARD GUARDRAILS
1. NEVER read or cite anything under knowledge/_personal/ (the confidential personal layer,
   for example the decision log and investor-relationship notes).
2. NEVER include another employee's performance content, engagement submission, career
   conversation, compensation, or departure. This document is about ${PERSON} only. If a
   source contains such material, do not quote it and do not allude to it.
3. Every non-obvious claim needs a real repo path that exists plus a verbatim quote or figure
   from it. If you cannot quote it, do not claim it. Paraphrase is not evidence.
4. Do NOT invent deliverables. A theme assigned to someone is not a document; an intention
   is not an artifact. If the repo records a commitment with no artifact, that is a DRIFT
   finding, not an accomplishment.

## SHIPPED IS NOT THE SAME AS MARKED DONE
Release notes are generated from Jira release contents rather than tested state, so they
inherit deployment-flag errors, in BOTH directions.
A "Done" ticket, a green status, or a release-note line is NOT evidence something shipped.
Accept as shipped only: a customer or CS person referring to using it, a launch/press artifact,
a demo of it working, or an explicit production-confirmation in a transcript. Otherwise report
it as "marked complete, production state unverified."

## SUPERSESSION
The repo corrects itself in place and by date. A later dated entry beats an earlier one. Watch
for "corrected", "supersedes", "RESOLVED", "WITHDRAWN", "void", "retired", "DONE", "reversed",
strikethrough (~~...~~) and [x] checkboxes. Report the corrected version; never resurface
retired framing. Entries may carry explicit corrections of earlier mistakes. Respect them.

## HONESTY REQUIREMENT
Every answer that makes a claim must also carry the honest other half: what did not land, what
slipped, what you personally caused. A self-assessment that only lists wins is a worse document
and the VP of Product will not send it. Prefer a specific miss with a named cause over a hedge.

## WRITING STYLE (mandatory: this text goes to the CEO and to HR)
- NO em dashes anywhere. Use commas, periods, parentheses or a rewrite.
- NO setup-and-negate constructions ("not just X but Y", "X isn't only about Y", "from a lesser
  into a greater"). State the point directly and positively.
- First person, plain language, lead with the point. No corporate jargon, no hype.
- Measurable where the question asks for measurable: a number, a date, or a named artifact.

## HOW TO FRAME THE ROLE
**${PERSON} was hired to own how PSTrax creates value. Owning the product is the instrument for that.**
Present business-level ownership (strategy, pricing, GTM, the multi-year plan) as the ORIGINAL
mandate. Never write "increasingly being asked to," "expanding into," "also owns," or "beyond
product" about that scope, because it implies scope creep the person is consenting to and understates both
the job and their intent. Check GOALS.md (the strategic mandate and the stated link between product strategy,
revenue and market positioning) for corroboration.
State it positively; "not just product but the business plan" is the banned setup-and-negate shape.
`

// ---------------------------------------------------------------------------
// The seven questions, each with its own corpora. The corpus assignment IS the
// graph: no single agent could hold all of this, and each question needs a
// different slice.
// ---------------------------------------------------------------------------

const CORPORA_COMMON = `GOALS.md (rocks, mandates, company metrics, personal development goals), CLAUDE.md`

const QUESTIONS = [
  {
    key: 'accomplishments',
    factual: true,
    question: 'What were your top accomplishments (rocks, projects, major tasks) last quarter?',
    shape: `Name at most three things you would call DONE, each with its evidence, then the honest
other half in its own paragraph. Rank by what the CEO would care about, not by effort spent.`,
    corpora: `${CORPORA_COMMON}; the prior quarter's Rocks/Goals in GOALS.md; output/recall/*.md
(the accountability record, the highest-signal source for what actually happened);
tasks/archive/*.md (what closed); output/transcripts/<quarter>/*.md (look for production
confirmations, launches, and leadership meetings); output/board/*.md; triage-summaries/digests/;
output/strategy/, output/prds/, output/briefs/ for artifacts with real mtimes.`,
  },
  {
    key: 'goals',
    factual: true,
    question:
      'Please describe your top 3 goals/priorities you plan to achieve this quarter (specific and measurable).',
    shape: `Exactly three, each ONE sentence of intent plus an explicit "Measure:" clause with a
number, a date or a named artifact. If the repo already states quarterly goals, use them rather
than inventing new ones, and supply the measure the repo is missing. Include the leading
indicator you would actually watch.`,
    corpora: `${CORPORA_COMMON} (the current quarter's goals are usually already written there);
tasks/active.md (the live workstreams and their owners); the newest dated section of tasks/backlog.md;
output/recall/*.md (most recent, for committed-but-unfinished work); any numeric targets stated by
others that you are held to (search transcripts for percentage or date targets set by engineering leadership,
the CEO or other executives).`,
  },
  {
    key: 'company_impact',
    factual: true,
    question: 'How does what you plan to accomplish directly relate to the success of the company?',
    shape: `Connect each goal to a company metric or a leadership-visible constraint, with the figure.
Close with the single biggest risk to your own plan, named plainly.`,
    corpora: `${CORPORA_COMMON} (the company context table of key metrics, annual goals and the
long-term target); output/strategy/*.md (market sizing, segmentation, pricing analyses); output/board/*.md;
output/pulse/*.md; shared/knowledge/truth_pack/TP_01A and TP_02 for market structure;
shared/output/voc/churn/ for retention drivers.`,
  },
  {
    key: 'career',
    factual: false,
    question: "What's next for your career goals and what's needed to get there?",
    shape: `🔴 **This question is about ${PERSON}'s trajectory as a person. It is not about the role's
operating plan.** A common failure mode is answering with the role's mandate plus a headcount request,
which reads as a job description. A correct answer names **the next role or scope ${PERSON} is growing into,
a horizon, what they must demonstrate to get there, the capabilities they are deliberately building, and
a question back to their manager about the path.** Resourcing asks belong under "what's needed to get
there," never as the substance of the goal. Dependencies owned by other functions do not belong in
this answer at all; they are operating-plan items.

Do not ask for a title. Do not be falsely modest and do not oversell. Where ${PERSON} has named a
development weakness themselves, include it and ask for a direct read on it rather than smoothing it.

🔴 **Name ONE binding constraint, not a list of three.** A three-item wish list reads as unfocused
and makes the weakest item carry the same weight as the strongest. Find the constraint that is
actually limiting the current quarter's goals and lead with it; mention at most one dependency you
do not control. **Test each candidate: does it limit PRODUCTION (how much gets made) or DISTRIBUTION
(how well what is made lands)?** Production constraints belong here. Distribution gaps and unowned
mandates belong in the "anything else" question as a decision to be made, because they are not
things ${PERSON} needs in order to grow.

If the honest answer is headcount, say what SHAPE of hire and why, and state plainly that a hire
landing next quarter does not relieve this quarter. That is an argument for deciding sooner, and
saying it is more credible than pretending otherwise.`,
    corpora: `GOALS.md (§Strategic Mandate, what the CEO asked for; §Personal Development Goals);
output/transcripts/ for advisor and CEO 1:1s that reframed the scope of the role; meetings/1on1s/
PROFILE.md files for the manager relationship; any mandate in GOALS.md with no progress against it
(that is usually the real ask).`,
  },
  {
    key: 'pivot',
    factual: false,
    question: 'How do you plan to pivot this quarter?',
    shape: `One behaviour to stop or change, with the mechanism that makes it structural rather
than a resolution. Ground it in a drift pattern the repo has actually diagnosed about ${PERSON},
and state the pattern in their own terms.

🔴 **Pitch it at leadership register, not personal-workflow register. The reader is the CEO.**
A pivot such as "stop carrying two heavy solo artifacts at once, every artifact gets a named
reviewer" is too tactical and internal for that reader.
**The test: would this change what the organization experiences, or only what ${PERSON}'s week looks like?**
Personal calendar and drafting habits fail that test. Generalize the same evidence one level up:
for example, ${PERSON} is the single point through which context and decisions travel, with solo-artifact
drift as one symptom among several rather than the headline. **Find the behaviour that explains several
observed failures at once, then list the tactics underneath it.** Tie it back to the career answer
where the connection is real.

Delegation and collaboration are common candidates. Argue delegation from what has already worked
and extend it deliberately rather than case by case. Argue collaboration from how cross-functional
plans get built (with revenue and engineering owners from the start). **Lead with the honest
self-diagnosis that makes it credible, for example an instinct to write the important things alone
and share them once they are good.** Check whether a later quarter has superseded the prior pivot before
reusing it.`,
    corpora: `output/recall/*.md (Running Patterns, Execution shape, capacity findings — the
forcing-function law lives here); skills/*/MEMORY.md and the user memory index for feedback
patterns; tasks/backlog.md entries marked as drifted, deferred or repeatedly displaced;
output/think/*.md.`,
  },
  {
    key: 'other',
    factual: false,
    question: "Is there anything else you'd like to discuss?",
    shape: `One or two items only, each something you want settled with the CEO this quarter rather
than a complaint. Prefer unowned mandates and unresolved forums over product detail.

🔑 **Prefer a stated position with a trigger over an escalated decision.** "Here is the sequencing I
am choosing and the condition that would change it" reads as judgment; "please decide between these
three options" hands the thinking back. Example shape: ${PERSON} covers an unowned function themselves
for now, the function gets added once delivery is predictable, and the trigger is a named, observable
condition.

⚠️ **Be precise about what ${PERSON} was actually asked to own.** Check \`GOALS.md\` §Strategic Mandate
wording rather than paraphrasing it. "Address the gap in a function" is not "own the function".
A questionnaire that overstates the remit invites a conversation about work ${PERSON} never agreed to.`,
    corpora: `GOALS.md §Strategic Mandate (mandates with no owner); tasks/active.md items blocked on
someone else; the Waiting On Others table; output/recall/ horizon sections for dates that need a
decision before they arrive.`,
  },
  {
    key: 'optional_2026',
    factual: false,
    question: '(Optional) What is a personal or professional goal you have for the year?',
    shape: `One goal, concrete enough to be judged, plus one sentence on what it would look like
if it happened. Personal development, not another work deliverable.`,
    corpora: `GOALS.md §Personal Development Goals and §Working style; skills/*/MEMORY.md for
recurring self-observations.`,
  },
]

const ANSWER_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['key', 'answer', 'claims', 'honest_other_half', 'gaps'],
  properties: {
    key: { type: 'string' },
    answer: {
      type: 'string',
      description:
        'The prose answer, ready to paste into the sheet. First person. No em dashes. No setup-and-negate constructions.',
    },
    claims: {
      type: 'array',
      description: 'Every factual claim the answer makes, each with its source.',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['claim', 'file', 'quote', 'shipped_evidence'],
        properties: {
          claim: { type: 'string' },
          file: { type: 'string', description: 'Real repo-relative path that exists.' },
          quote: { type: 'string', description: 'Verbatim quote or figure from that file.' },
          shipped_evidence: {
            type: 'string',
            enum: ['production_confirmed', 'marked_complete_unverified', 'not_a_shipping_claim'],
          },
        },
      },
    },
    honest_other_half: {
      type: 'string',
      description: 'What did not land, with the cause. Empty string only if the question genuinely has none.',
    },
    gaps: {
      type: 'array',
      description: 'Things you could not answer from the repo and the VP of Product must supply.',
      items: { type: 'string' },
    },
  },
}

const VERDICT_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['key', 'revised_answer', 'verdicts', 'must_ask_owner'],
  properties: {
    key: { type: 'string' },
    revised_answer: {
      type: 'string',
      description: 'The answer with unsupported claims removed or downgraded to hedged language.',
    },
    verdicts: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['claim', 'grounded', 'note'],
        properties: {
          claim: { type: 'string' },
          grounded: { type: 'boolean' },
          note: { type: 'string', description: 'What the file actually says, or why the claim fails.' },
        },
      },
    },
    must_ask_owner: {
      type: 'array',
      description: 'Facts that could not be settled from the repo and need confirmation from the owner before submitting.',
      items: { type: 'string' },
    },
  },
}

const ACCOUNTABILITY_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['prior_draft_found', 'rows', 'summary'],
  properties: {
    prior_draft_found: { type: 'boolean' },
    rows: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['stated_goal', 'outcome', 'evidence', 'cause'],
        properties: {
          stated_goal: { type: 'string' },
          outcome: { type: 'string', enum: ['met', 'partial', 'missed', 'unverifiable'] },
          evidence: { type: 'string', description: 'Path plus quote, or an explicit statement that no artifact exists.' },
          cause: { type: 'string', description: 'For partial/missed: why. Structural cause preferred over effort.' },
        },
      },
    },
    summary: { type: 'string' },
  },
}

// ---------------------------------------------------------------------------
// Phase 1 — Accountability. This is what makes the workflow a LOOP rather than
// a one-off scan: each run is graded against what the last run promised.
// A barrier is correct here, because every question agent needs this result.
// ---------------------------------------------------------------------------

phase('Accountability')
log(`engagement-review ${QUARTER} — checking ${PRIOR_DRAFT} for stated goals`)

const accountability = await agent(
  `${RULES}

## Your task
Read ${PRIOR_DRAFT}. It is the previous quarter's version of this same questionnaire.

If the file does not exist, set prior_draft_found=false, return an empty rows array, and say so
in the summary. Do not fabricate a history. (This is expected on the first ever run.)

If it exists: extract the goals ${PERSON} committed to for that quarter (question 2), plus the
pivot they committed to (question 5). For EACH one, establish what actually happened by searching
the repo for evidence, and grade it met / partial / missed / unverifiable.

Grade against the artifact, never against a status field. Apply the SHIPPED IS NOT MARKED DONE
rule strictly. "unverifiable" is an honest and expected answer for some rows; prefer it to a guess.

Where a goal was missed, name the structural cause if the repo diagnosed one (displacement by
travel, no counterparty, no external deadline, a dependency on another team). The repo has an
explicit forcing-function diagnosis about this person; use it where it applies rather than
attributing a miss to effort.`,
  { label: 'accountability', phase: 'Accountability', schema: ACCOUNTABILITY_SCHEMA, effort: 'high' }
)

const ACC_CONTEXT = accountability && accountability.prior_draft_found
  ? `## Accountability context from last quarter (${PRIOR_QUARTER})
${accountability.summary}

${(accountability.rows || [])
  .map((r) => `- [${r.outcome}] ${r.stated_goal}\n  evidence: ${r.evidence}${r.cause ? `\n  cause: ${r.cause}` : ''}`)
  .join('\n')}

Use this. An accomplishments answer that ignores a missed prior goal is dishonest, and a goals
answer that silently re-commits to something already missed twice must say so explicitly.`
  : `## Accountability context
No prior engagement draft was found at ${PRIOR_DRAFT}. This is the first run, so there is no
prior-commitment record to grade against. Do not imply one exists.`

// ---------------------------------------------------------------------------
// Phases 2 + 3 — Answer, then Verify, as a PIPELINE. Each question flows through
// both stages independently: the career answer is not held up waiting for the
// accomplishments verification. Only factual questions get a verify stage.
// ---------------------------------------------------------------------------

phase('Answer')

const answered = await pipeline(
  QUESTIONS,

  // Stage 1 — answer the question from its own corpora.
  (q) =>
    agent(
      `${RULES}

${ACC_CONTEXT}

## The survey question you own
"${q.question}"

## Required shape of your answer
${q.shape}

## Your corpora (read these; do not wander the whole repo)
${q.corpora}

## Method
1. Read your corpora. Prefer the most recent dated material, and honour every correction.
2. Draft the answer in ${PERSON}'s voice: first person, plain, specific, no hype.
3. For every factual claim, record the path and a verbatim quote in the claims array. If a claim
   is about something shipping, classify its shipped_evidence honestly.
4. Fill honest_other_half. If you cannot find a real miss, say so rather than manufacturing
   modesty, but look properly first: the recall files and the newest transcripts are where
   misses are recorded.
5. Put anything only ${PERSON} can answer into gaps. An empty gaps array on a subjective
   question is usually a sign you invented something.

Return the answer as the exact prose to paste, not as notes about what could be written.`,
      { label: `answer:${q.key}`, phase: 'Answer', schema: ANSWER_SCHEMA, effort: 'high' }
    ),

  // Stage 2 — verify factual answers against their own citations. Skip for
  // subjective questions, which have no external truth to check.
  (draft, q) => {
    if (!draft) return null
    if (!q.factual) {
      return {
        key: q.key,
        revised_answer: draft.answer,
        verdicts: [],
        must_ask_owner: draft.gaps || [],
        honest_other_half: draft.honest_other_half,
        claims: draft.claims || [],
      }
    }
    return agent(
      `${RULES}

## Your task — adversarial evidence check
Below is a drafted answer to "${q.question}" and the claims it rests on. Your job is to try to
BREAK it, not to approve it.

For each claim: open the cited file, find the quote, and confirm it says what the claim says.
Mark grounded=false when the file does not exist, the quote is not in it, the quote is real but
does not support the claim, a later dated entry corrects it, or the claim is a shipping claim
whose only backing is a status flag or release note.

Default to grounded=false when uncertain. The cost of a false claim in front of the CEO is much
higher than the cost of a thinner answer.

Then rewrite the answer: delete ungrounded claims, downgrade partially-supported ones to hedged
language, and keep the voice and the honest other half intact. Do not add new claims of your own.
Anything that cannot be settled from the repo goes into must_ask_owner.

## Drafted answer
${draft.answer}

## Honest other half
${draft.honest_other_half}

## Claims to check
${JSON.stringify(draft.claims, null, 2)}`,
      { label: `verify:${q.key}`, phase: 'Verify', schema: VERDICT_SCHEMA, effort: 'high' }
    ).then((v) =>
      v
        ? { ...v, honest_other_half: draft.honest_other_half, claims: draft.claims || [] }
        : { ...draft, revised_answer: draft.answer, verdicts: [], must_ask_owner: draft.gaps || [] }
    )
  }
)

const results = (answered || []).filter(Boolean)
const byKey = {}
for (const r of results) byKey[r.key] = r

const killed = results.reduce(
  (n, r) => n + (r.verdicts || []).filter((v) => !v.grounded).length,
  0
)
const asks = results.flatMap((r) => r.must_ask_owner || [])
log(`${results.length}/${QUESTIONS.length} questions answered · ${killed} claim(s) failed verification · ${asks.length} open ask(s) for the VP of Product`)

if (results.length < QUESTIONS.length) {
  const missing = QUESTIONS.filter((q) => !byKey[q.key]).map((q) => q.key)
  log(`⚠️ COVERAGE GAP — no answer produced for: ${missing.join(', ')}. The draft will say so rather than omit the question silently.`)
}

// ---------------------------------------------------------------------------
// Phase 4 — Assemble. A barrier is genuinely required: the assembler needs all
// seven answers at once to keep one voice, dedupe repeated evidence across
// questions, and make the goals and company-impact answers agree with each other.
// ---------------------------------------------------------------------------

phase('Assemble')

const assembled = await agent(
  `${RULES}

## Your task
Write the submission-ready draft to ${OUT_PATH} using the Write tool, then return a two-line
summary of what you wrote and anything you had to leave blank.

## Structure (follow exactly)
- H1: "Employee Engagement — ${QUARTER} — ${PERSON} (draft)"
- A metadata line: survey period ${QUARTER}, reporting on ${REPORTING_ON}, manager the CEO,
  and the date left as "generated by /engagement-review" (you do not have a clock).
- A blockquote status block containing, in this order: that it is a DRAFT and not submitted;
  a "Confirm before submitting" list built from every must_ask_owner item across all questions;
  and the sensitivity notice that this file is self-assessment about ${PERSON} only, must never
  carry another employee's performance content, and must not be published to shared/.
- Then one "## N. <question text>" section per question, in the order given below, each containing
  the prose answer followed by an italic "*Evidence: ...*" line listing the surviving cited paths.
- Then "## Accountability against ${PRIOR_QUARTER}" rendering the accountability rows as a table
  (Stated goal | Outcome | Evidence | Cause). If no prior draft existed, say that in one line
  instead of rendering an empty table.
- Then "## Regenerating this next quarter" with the exact invocation:
  Workflow({ name: "engagement-review", args: { quarter: "<next quarter>", reportingOn: "<this quarter>" } })

## Voice and consistency
Keep each answer's prose essentially as given. Your job is assembly and consistency, not rewriting.
Fix only: duplicated evidence across sections, a goal named differently in two answers, and any
em dash or setup-and-negate construction that survived.

If a question has no answer, render the heading with "*(no answer produced this run — see the
coverage gap note)*" rather than dropping the question.

## Accountability rows
${JSON.stringify(accountability, null, 2)}

## Answers, in order
${QUESTIONS.map((q, i) => {
  const r = byKey[q.key]
  if (!r) return `### ${i + 1}. ${q.question}\n(NO ANSWER PRODUCED)`
  return `### ${i + 1}. ${q.question}
ANSWER:
${r.revised_answer}

HONEST OTHER HALF (fold into the answer if it is not already there):
${r.honest_other_half || '(none returned)'}

SURVIVING EVIDENCE:
${(r.claims || [])
  .filter((c) => {
    const v = (r.verdicts || []).find((x) => x.claim === c.claim)
    return !v || v.grounded
  })
  .map((c) => `- ${c.file} — "${String(c.quote).slice(0, 200)}"`)
  .join('\n') || '- (none)'}

OPEN ASKS: ${(r.must_ask_owner || []).join(' | ') || '(none)'}`
}).join('\n\n')}`,
  { label: 'assemble', phase: 'Assemble', effort: 'high' }
)

// ---------------------------------------------------------------------------
// Phase 5 — Critique, applied in place. The repo's own finding is that AI-authored
// artifacts carry verification debt; this is the pass that pays some of it.
// ---------------------------------------------------------------------------

phase('Critique')

const critique = await agent(
  `${RULES}

## Your task
Read ${OUT_PATH} and improve it in place with Edit. You are the last reader before the CEO.

Check, in priority order:
1. **Honesty.** Does every claim-bearing answer carry a real miss? Is any accomplishment a
   restated intention? Is any shipping claim backed only by a status flag? Fix by softening the
   claim, never by deleting the honesty.
2. **Self-contradiction.** Do the goals answer and the company-impact answer name the same goals?
   Does anything contradict the accountability table (for example claiming an accomplishment the
   table grades as missed)?
3. **Measurability.** Does every goal have a number, a date, or a named artifact? If one does not,
   add the measure the repo supports, or flag it in the Confirm-before-submitting list.
4. **Style.** No em dashes. No setup-and-negate constructions. First person. No jargon. Trim any
   sentence that says nothing.
5. **Sensitivity.** No other employee's performance, career, compensation or departure content.
   Nothing from knowledge/_personal/. If you find any, remove it and note the removal.

Then return a short report: what you changed, what you deliberately left alone, and the single
thing you would most want ${PERSON} to look at before submitting. Do not restate the document.`,
  { label: 'critique', phase: 'Critique', effort: 'high' }
)

return {
  quarter: QUARTER,
  output: OUT_PATH,
  questions_answered: results.length,
  questions_total: QUESTIONS.length,
  claims_failed_verification: killed,
  open_asks: asks,
  prior_draft_graded: !!(accountability && accountability.prior_draft_found),
  assembled,
  critique,
}
