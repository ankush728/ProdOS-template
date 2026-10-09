export const meta = {
  name: 'evidence-sweep',
  description: 'Sweep every ProdOS evidence corpus in parallel for claims bearing on a question, then dedupe, adversarially verify, and synthesize',
  whenToUse: 'Building a business case, initiative brief, executive argument, or validation package where the evidence is spread across VOC, transcripts, ideas_db, Truth Pack, backlog, and board/recall output and will not fit in one context.',
  phases: [
    { title: 'Read', detail: 'one agent per corpus, each returns cited claims' },
    { title: 'Consolidate', detail: 'dedupe across corpora, assign N-counts, rank' },
    { title: 'Verify', detail: 'adversarial refutation; repo-only or repo + web depending on the claim' },
    { title: 'Synthesize', detail: 'write the evidence base to output/evidence/' },
  ],
}

// ---------------------------------------------------------------------------
// args: { question: string, deliverable?: string, maxVerify?: number }
// ---------------------------------------------------------------------------

// args should arrive as an object. Tolerate two caller mistakes rather than
// hard-failing a run: a JSON-encoded string, or a bare question string.
let input = args
if (typeof input === 'string') {
  try {
    input = JSON.parse(input)
  } catch (e) {
    input = { question: input }
  }
}

const QUESTION = (input && input.question) || null
if (!QUESTION) {
  // Instrument rather than guess: report what actually arrived.
  const shape = `typeof args = ${typeof args}; keys = ${
    args && typeof args === 'object' ? Object.keys(args).join(',') : 'n/a'
  }; preview = ${String(args).slice(0, 300)}`
  log(`ARGS DIAGNOSTIC — ${shape}`)
  throw new Error(`evidence-sweep got no usable args.question. ${shape}`)
}
const DELIVERABLE = (input && input.deliverable) || 'an evidence base a VP of Product can turn into a leadership-ready business case'
const MAX_VERIFY = (input && input.maxVerify) || 6

// Guardrails every reader gets. These encode ProdOS evidence discipline.
const RULES = `
## Repo you are reading
<repo-root>
PSTrax = fire/EMS compliance software. The reader is the VP of Product.

## HARD GUARDRAILS
1. NEVER read or cite anything under knowledge/_personal/ (the confidential personal layer,
   for example the decision log and investor-relationship notes). It is excluded from anything shareable.
2. Do NOT infer, extrapolate, or synthesize. Report only what a named file actually says.
   If you want to state a pattern, you must be able to cite each instance separately.
3. Every claim needs a real file path that exists and a verbatim quote or figure from it.
   No paraphrase-as-evidence. If you cannot quote it, do not claim it.
4. Flag confidential content you encounter (for example an unreleased forecast) rather than
   laundering it into a claim. Set flagged_sensitive: true.

## ProdOS EVIDENCE DISCIPLINE (this is how strength is assigned)
- canonical      = stated in shared/knowledge/truth_pack/ (already vetted and written)
- multi_source   = 2+ INDEPENDENT sources (different customers/meetings, not one meeting
                   quoted in three files). Backlog "Reinforces (no new item)" blocks and
                   "N+1" / "N=2" / "N≥3" notations are explicit multi-source markers.
- single_source  = one source. Directional only. Never present as validated.
- directional    = paraphrased source (Zoom AI summaries), advisor opinion, or internal
                   speculation. Advisor input (the investor, board advisors, consultants) is a
                   SUGGESTION, never a PSTrax-adopted decision.

## SUPERSESSION
This repo corrects itself in place and by date. A later dated entry beats an earlier one.
Watch for "corrected", "supersedes", "RESOLVED", "void", "retired", "DONE", "reversed",
strikethrough (~~...~~), and [x] checkboxes. If a claim has been corrected, report the
CORRECTED version and note what it superseded. Do not resurface retired framing.

## CONSTRAINTS MATTER AS MUCH AS SUPPORT
Load-bearing negatives are often the most valuable output: things that BLOCK or BOUND the
answer. Set is_constraint: true for those. A business case that misses a constraint is wrong.
Examples of the shape: a data field that is not populated in practice; a workflow customers
do not actually perform; a capability that does not exist today.
`

const CLAIM_SCHEMA = {
  type: 'object',
  properties: {
    corpus: { type: 'string', description: 'which corpus you read' },
    coverage: {
      type: 'string',
      description: 'What you actually read vs. what you skipped and why. Be honest about gaps.',
    },
    claims: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          claim: { type: 'string', description: 'One sentence. The assertion itself.' },
          evidence: { type: 'string', description: 'Verbatim quote or figure from the source.' },
          source: { type: 'string', description: 'Repo-relative file path that exists.' },
          source_date: { type: 'string', description: 'Date of the source (YYYY-MM-DD) or "undated".' },
          source_kind: {
            type: 'string',
            description: 'customer_voc | internal_meeting | partner_call | canonical_tp | idea_db | board | advisor | other',
          },
          strength: { type: 'string', enum: ['canonical', 'multi_source', 'single_source', 'directional'] },
          bears_on: { type: 'string', description: 'How this specifically answers the question asked.' },
          is_constraint: { type: 'boolean', description: 'Does this block or bound the answer?' },
          flagged_sensitive: { type: 'boolean' },
        },
        required: ['claim', 'evidence', 'source', 'strength', 'bears_on', 'is_constraint'],
      },
    },
  },
  required: ['corpus', 'coverage', 'claims'],
}

// ---------------------------------------------------------------------------
// PHASE 1 — corpus readers. Barrier is justified: consolidation needs all
// claims at once to compute cross-corpus N-counts.
// ---------------------------------------------------------------------------

const CORPORA = [
  {
    key: 'voc',
    label: 'read:voc',
    scope: `shared/output/voc/ — the customer-evidence base. Prioritise in this order:
  1. Segment consolidations, which already carry N-counts:
     law-enforcement/Analysis_LESegment_Consolidated_<date>.md      (segment consolidation)
     ems-segment/EMS_Needs_Coverage.md                              (standalone-EMS tracker)
     blood-products/*.md                                            (roster, tracker, unit economics)
     churn/cancel-form-signals.md                                   (living churn analysis)
  2. Synthesis_*.md at the top level (cross-interview patterns).
  3. Analysis_*.md at the top level (per-account deep dives).
  4. Guide_*.md and Signal_*.md (interview guides and single signals).
  5. *_scan.md (procurement, podcasts, meetings, publications scans).
  Skip daily/ unless the question is about a specific date.
  NOTE: agency and contact names may be present here and are expected. Do not redact them.
  Do NOT cite any personal-only file under output/voc/ (for example a CRM-derived champion profile extract).`,
  },
  {
    key: 'transcripts',
    label: 'read:transcripts',
    scope: `output/transcripts/ — meeting extractions. START with INDEX.md, the retrieval index:
  use it to pick which meeting files are worth opening rather than reading everything.
  Then read the relevant files in output/transcripts/<quarter>/ (e.g. 2026Q3/, an illustrative quarter) and any
  output/transcripts/digests/<quarter>_digest.md for closed quarters.
  Each meeting file has 8 "##" lens sections. For this task the load-bearing ones are
  usually "## VOC Signals", "## Strategic Learnings", "## Decisions", "## Competitive Intel".
  Prefer verbatim files over .raw.md siblings. Zoom AI summaries are PARAPHRASED —
  mark anything sourced from one as strength: directional, not single_source.`,
  },
  {
    key: 'ideas',
    label: 'read:ideas',
    scope: `output/ideas/ideas_db.md — the living ideas database synced from Jira Product Discovery
  (your ideas project) plus community feature requests (CMT-xx rows). Rows carry module_cluster,
  type, and problem_clarity. Also output/ideas/sync_log.md for what has been pulled and when.
  Use this to establish DEMAND VOLUME: how many independent requests exist for a capability,
  which modules they cluster in, and how well-specified they are. A capability with 8 idea rows
  across 6 agencies is a materially different claim from one with a single row.
  Known caveat: JPD custom-field descriptions do not sync, so some rows have thin descriptions —
  say so in coverage rather than treating a thin row as a weak signal.`,
  },
  {
    key: 'canonical',
    label: 'read:truth-pack',
    scope: `shared/knowledge/truth_pack/ and shared/knowledge/pm_principles/ — the vetted canonical layer.
  Truth Pack files present: TP_00 Index, TP_01 Company & Positioning, TP_01A Company Strategy,
  TP_02 Market & Customer Facts, TP_03 Customer Archetypes & Personas, TP_04 Product Scope and
  Module Map, TP_05 Security Privacy & Data Guardrails, TP_07 Competitive Intelligence Registry,
  TP_08 Pricing & Packaging, EP_01 Engineering Context.
  TP_06 (Decision Log) is deliberately NOT here — it lives in knowledge/_personal/. Do not go get it.
  pm_principles/ has PMOP_01 (AI Moat Framework), the AI Strategy series, and Product Principles.

  ALSO IN YOUR SCOPE — the reference layer, which is where SHIPPED-CAPABILITY truth lives:
     shared/knowledge/reference/pstrax-module-functionality.md   <- named by BOTH TP_04 and EP_01
                                                                    as the sandbox-validated record
                                                                    of what actually ships today
     shared/knowledge/reference/cradle-to-grave-lifecycle.md
     shared/knowledge/reference/pstrax-lifecycle-gap-analysis.md
  READ pstrax-module-functionality.md WHENEVER THE QUESTION TOUCHES WHETHER A CAPABILITY EXISTS.
  Without it, a run can conclude a capability is missing when canonical and a PRD acceptance
  criterion both say it ships. A customer transcript, a sales rep's recollection, or an analysis
  file is NOT authority on what PSTrax ships. This file and EP_01 are.
  Everything you cite from truth_pack is strength: canonical.
  YOUR SECOND JOB: note any canonical claim that would CONTRADICT a likely answer to the
  question. The consolidation step uses this to catch claims that fight the vetted record.`,
  },
  {
    key: 'threads',
    label: 'read:live-threads',
    scope: `tasks/backlog.md and tasks/active.md — the live thread state. These are large; read fully.
  Three block types matter and mean different things:
  - "TP candidates (surface to /update-knowledge — do NOT auto-write)" = claims already
    identified as candidate canonical facts but not yet vetted. High-value, pre-filtered.
  - "Reinforces (no new item — live threads)" = an N+1 on an existing pattern. These are the
    multi_source markers. Count them.
  - "Visibility (others-owned)" = NOT owned by the VP of Product. Useful context, never an action.
  Also capture explicit strength notations already in the text: "N=2", "N≥3", "single-source",
  "directional", "verify before writing".
  Watch hard for supersession here — this file corrects itself inline and by date.`,
  },
  {
    key: 'exec',
    label: 'read:board-exec',
    scope: `output/board/, output/recall/, output/pulse/ — leadership directives, prior commitments, business intel.
  output/board/: BM_learnings_<YYYYQQ>.md, BM_patches_pending_*.md, and any talk-track files
  output/recall/: weekly recalls plus any retrospectives
  output/pulse/: monthly Pulse reports, weekly Pulse_Check_*, competitor trackers
  What to extract: standing asks and directives from leadership, numbers leadership has already been given
  (so a new case does not contradict them), commitments the VP of Product made and their status, and market
  or competitive figures with a date.
  Executive deck figures can be CONFIDENTIAL. Flag them (flagged_sensitive: true) with a note
  on the restriction rather than presenting them as freely usable.`,
  },
]

phase('Read')
log(`Sweeping ${CORPORA.length} corpora for: ${QUESTION}`)

const reads = await parallel(
  CORPORA.map((c) => () =>
    agent(
      `You are mining ONE evidence corpus in the ProdOS repo to answer a specific question.

# THE QUESTION
${QUESTION}

# THE DELIVERABLE THIS FEEDS
${DELIVERABLE}

# YOUR CORPUS (read only this)
${c.scope}
${RULES}

# METHOD
1. Orient with the index or directory listing before opening files. Do not read blind.
2. Grep for the question's key terms, then read the files that hit. Read whole files when
   they are the substrate (segment consolidations, ideas_db, Truth Pack files); read
   selectively in the big append-only files.
3. Extract claims. A claim earns a slot only if it changes what someone would conclude or
   decide about the question. Skip colour.
4. Assign strength honestly. The most common failure here is calling one meeting a pattern.
5. Set is_constraint: true on anything that blocks or bounds the answer.

Return 5-25 claims. Fewer excellent claims beat many weak ones. If your corpus genuinely
has little bearing on the question, return few claims and say so plainly in coverage —
that is a useful result, not a failure.`,
      { label: c.label, phase: 'Read', schema: CLAIM_SCHEMA },
    ),
  ),
)

const corpusResults = reads.filter(Boolean)
const allClaims = corpusResults.flatMap((r) =>
  (r.claims || []).map((cl) => ({ ...cl, corpus: r.corpus })),
)
const coverageNotes = corpusResults.map((r) => `- ${r.corpus}: ${r.coverage}`).join('\n')

log(`${allClaims.length} raw claims from ${corpusResults.length}/${CORPORA.length} corpora`)
if (reads.length !== corpusResults.length) {
  log(`WARNING: ${reads.length - corpusResults.length} corpus reader(s) failed — coverage is incomplete`)
}
if (allClaims.length === 0) {
  return { question: QUESTION, claims: [], note: 'No claims found. Check the question phrasing or the corpora.' }
}

// ---------------------------------------------------------------------------
// PHASE 2 — consolidate. One node, needs every claim at once.
// ---------------------------------------------------------------------------

phase('Consolidate')

const CONSOLIDATED_SCHEMA = {
  type: 'object',
  properties: {
    load_bearing: {
      type: 'array',
      description: 'Ranked. The claims that actually decide the answer. Cap at 12.',
      items: {
        type: 'object',
        properties: {
          claim: { type: 'string' },
          evidence: { type: 'string' },
          sources: { type: 'array', items: { type: 'string' }, description: 'All file paths supporting it.' },
          independent_source_count: { type: 'integer', description: 'Distinct customers/meetings, not distinct files.' },
          strength: { type: 'string', enum: ['canonical', 'multi_source', 'single_source', 'directional'] },
          is_constraint: { type: 'boolean' },
          corpora: { type: 'array', items: { type: 'string' } },
          why_load_bearing: { type: 'string' },
          contradiction_risk: { type: 'string', description: 'Any canonical or later-dated claim that fights this. "none" if clean.' },
          verification_mode: {
            type: 'string',
            enum: ['internal', 'external', 'both'],
            description: 'internal = only the repo can settle it. external = a public source can. both = the repo establishes the internal fact, a public source settles the external half.',
          },
          external_question: {
            type: 'string',
            description: 'If external or both: the precise question a web search must answer. "Does a company called <Vendor> exist, and does its product cover vehicle/asset tracking?" not "research <Vendor>".',
          },
        },
        required: ['claim', 'evidence', 'sources', 'independent_source_count', 'strength', 'is_constraint', 'why_load_bearing', 'verification_mode'],
      },
    },
    supporting: {
      type: 'array',
      description: 'Real but secondary claims. Keep the citation, compress the prose.',
      items: {
        type: 'object',
        properties: {
          claim: { type: 'string' },
          sources: { type: 'array', items: { type: 'string' } },
          strength: { type: 'string' },
        },
        required: ['claim', 'sources', 'strength'],
      },
    },
    promotion_candidates: {
      type: 'array',
      description: 'Claims now at 2+ independent sources that are NOT yet canonical — i.e. ripe for /update-knowledge.',
      items: {
        type: 'object',
        properties: {
          claim: { type: 'string' },
          target_tp_file: { type: 'string' },
          independent_source_count: { type: 'integer' },
          sources: { type: 'array', items: { type: 'string' } },
        },
        required: ['claim', 'target_tp_file', 'independent_source_count', 'sources'],
      },
    },
    contradictions: {
      type: 'array',
      description: 'Places where corpora disagree, or a claim fights the canonical record.',
      items: {
        type: 'object',
        properties: { description: { type: 'string' }, sources: { type: 'array', items: { type: 'string' } } },
        required: ['description', 'sources'],
      },
    },
    evidence_gaps: {
      type: 'array',
      description: 'What the question needs that NO corpus answered. Be specific and name who could get it.',
      items: { type: 'string' },
    },
    sensitive_flags: { type: 'array', items: { type: 'string' } },
  },
  required: ['load_bearing', 'supporting', 'promotion_candidates', 'contradictions', 'evidence_gaps'],
}

const consolidated = await agent(
  `You are consolidating claims mined independently from ${corpusResults.length} evidence corpora.
Each reader saw only its own corpus. You are the first to see all of it, so the cross-corpus
work is yours alone and is the reason this step exists.

# THE QUESTION
${QUESTION}

# CORPUS COVERAGE (what was and was not read)
${coverageNotes}

# RAW CLAIMS
${JSON.stringify(allClaims, null, 2)}

# YOUR FIVE JOBS

1. DEDUPE, AND COUNT INDEPENDENT SOURCES CORRECTLY.
   The same underlying fact often appears in three files: the transcript extraction, the
   backlog entry that cites it, and a VOC analysis. That is ONE independent source, not three.
   independent_source_count = distinct customers, agencies, or meetings. Getting this wrong is
   the single most damaging error you can make, because it manufactures false patterns.

2. RE-GRADE STRENGTH after deduping. A claim two readers each called single_source may be
   genuinely multi_source if their sources are independent. The reverse is also true and more
   common: three files echoing one meeting is single_source. Downgrade without hesitation.

3. RANK. load_bearing = claims that change the answer. Constraints usually rank HIGH: a claim
   that invalidates an approach is worth more than one that mildly supports it. Cap at 12.

4. FIND THE HOLES. contradictions (including anything fighting the canonical Truth Pack record)
   and evidence_gaps. Gaps are a first-class output: name the specific missing input and who
   could produce it. "No unit count for the blood module; likely a data pull by engineering" is useful.
   "More research needed" is not.

5. ROUTE EACH LOAD-BEARING CLAIM FOR VERIFICATION. Set verification_mode:
   - internal — only this repo can settle it. Internal decisions, what a specific customer said,
     what PSTrax does or does not ship today, who owns a thread, what a meeting concluded.
     This is the majority. Default here.
   - external — a public source can settle it, and the repo cannot. Does a named company exist
     and what is its actual product scope; is a regulation real and what does it require; is a
     published market figure traceable to a named primary source; what does a vendor publicly
     claim its product does.
   - both — the repo establishes the internal half and a public source settles the external half.
     Example shape: the repo proves a named tool is a given agency's incumbent (internal), while
     the company's identity, correct spelling, and product scope are external.
   When mode is external or both, write external_question as a precise, answerable question.
   Route to external aggressively for: competitor and vendor names carrying "verify" /
   "unverified" / "likely" / autotranscription caveats; any regulatory or standards claim; any
   market size, adoption rate, or pricing figure destined for an executive slide; any competitor
   capability claim relayed through a sales call.`,
  { label: 'consolidate', phase: 'Consolidate', schema: CONSOLIDATED_SCHEMA, effort: 'high' },
)

// Fail legibly rather than with a TypeError three phases later. A null here means
// the consolidator errored (rate limit, terminal API error) or returned nothing.
// Reader results are already journalled, so a resume retries this without re-reading.
if (!consolidated) {
  log('FATAL: consolidation returned nothing — agent error or empty result. Cannot verify or synthesize.')
  return {
    question: QUESTION,
    error: 'consolidation_failed',
    claims_mined: allClaims.length,
    corpora_read: `${corpusResults.length}/${CORPORA.length}`,
    note: 'Reader results are cached in this run journal. Resume the run to retry consolidation without re-reading any corpus.',
  }
}

const loadBearing = consolidated.load_bearing || []
log(`${loadBearing.length} load-bearing claims | ${(consolidated.evidence_gaps || []).length} gaps | ${(consolidated.contradictions || []).length} contradictions`)

// ---------------------------------------------------------------------------
// PHASE 3 — adversarial verification. Job is to REFUTE, not to confirm.
// ---------------------------------------------------------------------------

phase('Verify')

// Selection must NOT be pure rank order. Externally-checkable claims tend to rank
// lower (a competitor's correct legal name matters less to the argument than a
// customer constraint does), so a plain slice(0, MAX_VERIFY) drops precisely the
// claims the web fork exists to settle. Reserve slots for them.
const isWeb = (cl) => cl.verification_mode === 'external' || cl.verification_mode === 'both'
const webAll = loadBearing.filter(isWeb)
const internalAll = loadBearing.filter((cl) => !isWeb(cl))
const webSlots = Math.min(webAll.length, Math.max(1, Math.floor(MAX_VERIFY / 3)))
const toVerify = webAll.slice(0, webSlots).concat(internalAll.slice(0, MAX_VERIFY - webSlots))

if (loadBearing.length > toVerify.length) {
  log(`Verifying ${toVerify.length} of ${loadBearing.length} load-bearing claims. The other ${loadBearing.length - toVerify.length} carry verdict: UNVERIFIED.`)
}
log(`Routing: ${toVerify.length - webSlots} repo-only, ${webSlots} with a web check (${webAll.length} were web-routed in total)`)
if (webAll.length > webSlots) {
  log(`NOTE: ${webAll.length - webSlots} web-routed claim(s) did not fit the cap and stay unverified. Raise args.maxVerify to cover them.`)
}

const VERDICT_SCHEMA = {
  type: 'object',
  properties: {
    verdict: { type: 'string', enum: ['CONFIRMED', 'WEAKENED', 'REFUTED', 'SUPERSEDED'] },
    quote_check: { type: 'string', enum: ['exact', 'paraphrased', 'not_found'] },
    corrected_strength: { type: 'string', enum: ['canonical', 'multi_source', 'single_source', 'directional'] },
    corrected_claim: { type: 'string', description: 'A defensible restatement, or the original if it held.' },
    reasoning: { type: 'string' },
    what_would_settle_it: { type: 'string', description: 'If not CONFIRMED: the specific evidence that would.' },
    external_checked: { type: 'boolean', description: 'Did you run a web search for this claim?' },
    external_finding: {
      type: 'string',
      enum: ['corroborated', 'contradicted', 'vendor_claim_only', 'not_found', 'not_applicable'],
      description: 'vendor_claim_only = the only source is the vendor asserting it about their own product.',
    },
    external_sources: {
      type: 'array',
      description: 'Public sources consulted. Empty if none.',
      items: {
        type: 'object',
        properties: {
          url: { type: 'string' },
          publisher: { type: 'string' },
          published_date: { type: 'string' },
          what_it_says: { type: 'string', description: 'The specific relevant finding, quoted or closely paraphrased.' },
          is_primary: { type: 'boolean', description: 'Primary source, or an article citing someone else?' },
        },
        required: ['url', 'publisher', 'what_it_says', 'is_primary'],
      },
    },
    corrected_facts: {
      type: 'string',
      description: 'If the web corrected a name, spelling, ownership, scope, or figure: the corrected version. "none" otherwise.',
    },
  },
  required: ['verdict', 'quote_check', 'corrected_strength', 'corrected_claim', 'reasoning', 'external_checked', 'external_finding'],
}

// Appended to a verifier's prompt only when the consolidator routed the claim
// externally. Keeps internal-only verifiers focused on the repo.
function externalAttacks(cl) {
  if (cl.verification_mode !== 'external' && cl.verification_mode !== 'both') {
    return `
# NO EXTERNAL CHECK FOR THIS CLAIM
This claim was routed internal-only: the repo is the only thing that can settle it.
Do not run a web search. Set external_checked: false, external_finding: "not_applicable".`
  }

  return `
# ATTACK 6 — EXTERNAL VALIDATION (this claim was routed for a web check)
Use WebSearch and WebFetch. If those tools are not in your tool list, load them first with
ToolSearch using the query "select:WebSearch,WebFetch".

The question to answer:
${cl.external_question || 'Verify the externally-checkable facts in this claim: names, spellings, ownership, product scope, regulations, and any published figure.'}

## Rules for external evidence
1. CITE PROPERLY. Every external source needs url, publisher, published_date, and the specific
   finding. Same discipline as internal citation: no source, no claim.
2. A VENDOR'S OWN PAGE IS NOT PROOF THE PRODUCT WORKS. If the only source for "competitor X
   ingests RFID" is competitor X's marketing site, that is external_finding:
   "vendor_claim_only". It establishes what they CLAIM, which is genuinely useful for a battle
   card, and does not establish that it works. Say which one you found. Never blur them.
3. FIRST-HAND CUSTOMER OBSERVATION BEATS A VENDOR PAGE. If a customer in a transcript says a
   competitor cannot do something and the vendor's site says it can, the customer wins on lived
   experience and the site tells you what the vendor asserts. Report both. Do not "correct" the
   customer with marketing copy.
4. CHASE THE PRIMARY SOURCE ON FIGURES. An article quoting an unnamed survey is not a
   executive-usable figure. Set is_primary: false and say the primary source is unlocated. Finding
   that a widely-repeated number has no traceable origin is a valuable result, not a failure.
5. NAMES FROM TRANSCRIPTS ARE OFTEN GARBLED. Autotranscription mangles company names. Try
   plausible spellings before concluding a company does not exist, and put the confirmed legal
   name and product name in corrected_facts.
6. NOT FOUND IS AN ANSWER. If a company or figure has no findable public trace, set
   external_finding: "not_found" and say so. Do not fill the hole with something adjacent.
7. Regulatory and standards claims need the issuing body or the text itself, not a vendor
   blog summarising it.

Your verdict must account for both halves. A claim whose internal fact holds but whose external
fact is wrong is WEAKENED at best, with the correction in corrected_facts.`
}

const verdicts = await parallel(
  toVerify.map((cl, i) => () =>
    agent(
      `Your job is to REFUTE this claim, not to confirm it. Assume it is wrong until the files
prove otherwise. A verifier that confirms everything is useless.

# CLAIM
${cl.claim}

# AS EVIDENCED BY
"${cl.evidence}"

# CITED SOURCES
${(cl.sources || []).join('\n')}

# ASSERTED
strength: ${cl.strength} | independent sources: ${cl.independent_source_count} | constraint: ${cl.is_constraint}

# THE FIVE ATTACKS — run every one
1. QUOTE CHECK. Open each cited file. Does that quote literally appear, and does it mean what
   the claim says it means in its actual context? Quotes pulled across a section boundary
   routinely reverse meaning. Set quote_check accordingly.
2. INDEPENDENCE. Are the sources genuinely independent, or is this one meeting echoed through
   an extraction, a backlog entry, and an analysis? If echoed, the count is wrong and the
   strength must drop.
3. SUPERSESSION. Search the repo for a LATER dated statement that corrects or retires this.
   ProdOS corrects itself inline: look for "corrected", "supersedes", "RESOLVED", "void",
   "retired", "reversed", strikethrough, and completed checkboxes. Also check whether the
   framing was explicitly abandoned. If superseded, verdict: SUPERSEDED and give the current version.
4. CANONICAL CONFLICT. Check shared/knowledge/truth_pack/ for a vetted claim that contradicts
   this. Canonical wins unless the claim carries a later, better-sourced correction.
   Do NOT read knowledge/_personal/.
5. PROVENANCE. Is the source a paraphrased Zoom AI summary (directional, not single_source)?
   An advisor's suggestion presented as a PSTrax decision? An internal opinion dressed as a
   customer signal? Sales-call enthusiasm read as validated demand?

Grep the repo. Read the files. Do not reason from the claim text alone.
${externalAttacks(cl)}

Say CONFIRMED only if the claim survives every attack you were asked to run.`,
      {
        label: `${cl.verification_mode === 'external' || cl.verification_mode === 'both' ? 'verify-web' : 'verify'}:${i + 1}`,
        phase: 'Verify',
        schema: VERDICT_SCHEMA,
        effort: 'high',
      },
    ).then((v) => ({ claim: cl, verdict: v })),
  ),
)

const checked = verdicts.filter(Boolean)
const failedVerify = verdicts.length - checked.length
if (failedVerify > 0) log(`WARNING: ${failedVerify} verifier(s) failed — those claims are UNVERIFIED, not confirmed`)

const tally = checked.reduce((acc, v) => {
  const k = (v.verdict && v.verdict.verdict) || 'UNKNOWN'
  acc[k] = (acc[k] || 0) + 1
  return acc
}, {})
log(`Verdicts: ${Object.entries(tally).map(([k, n]) => `${k} ${n}`).join(' | ')}`)

const externalTally = checked
  .filter((v) => v.verdict && v.verdict.external_checked)
  .reduce((acc, v) => {
    const k = v.verdict.external_finding || 'unknown'
    acc[k] = (acc[k] || 0) + 1
    return acc
  }, {})
if (Object.keys(externalTally).length > 0) {
  log(`Web findings: ${Object.entries(externalTally).map(([k, n]) => `${k} ${n}`).join(' | ')}`)
}
const factCorrections = checked.filter(
  (v) => v.verdict && v.verdict.corrected_facts && v.verdict.corrected_facts !== 'none',
)
if (factCorrections.length > 0) log(`${factCorrections.length} external fact correction(s) found`)

// Not slice(MAX_VERIFY) — selection is no longer rank-ordered, so derive the
// remainder from what was actually verified.
const verifiedClaims = new Set(toVerify.map((cl) => cl.claim))
const unverified = loadBearing.filter((cl) => !verifiedClaims.has(cl.claim))

// ---------------------------------------------------------------------------
// PHASE 4 — synthesize and write the artifact.
// ---------------------------------------------------------------------------

phase('Synthesize')

const SYNTH_SCHEMA = {
  type: 'object',
  properties: {
    file_path: { type: 'string' },
    answer: { type: 'string', description: 'The 3-5 sentence answer the evidence actually supports.' },
    confidence: { type: 'string', enum: ['strong', 'moderate', 'thin', 'insufficient'] },
    confirmed_count: { type: 'integer' },
    top_gaps: { type: 'array', items: { type: 'string' } },
    surprises: { type: 'array', items: { type: 'string' }, description: 'What would change the reader\'s mind or was not expected.' },
    external_corrections: {
      type: 'array',
      description: 'Names, spellings, ownership, scope, or figures the web check corrected. Reusable beyond this sweep.',
      items: { type: 'string' },
    },
    unblocked_tp_candidates: {
      type: 'array',
      description: 'Previously-parked "verify before writing" items that a web check just settled.',
      items: { type: 'string' },
    },
  },
  required: ['file_path', 'answer', 'confidence', 'top_gaps'],
}

const synthesis = await agent(
  `Write the evidence base. Reader: the VP of Product at PSTrax. They will build
${DELIVERABLE} directly off this file, so it has to be defensible under executive questioning.

# THE QUESTION
${QUESTION}

# VERIFIED LOAD-BEARING CLAIMS (each with an adversarial verdict)
${JSON.stringify(checked, null, 2)}

# LOAD-BEARING BUT UNVERIFIED (over the verification cap — label them as such)
${JSON.stringify(unverified, null, 2)}

# SUPPORTING / PROMOTION CANDIDATES / CONTRADICTIONS / GAPS
${JSON.stringify(
  {
    supporting: consolidated.supporting,
    promotion_candidates: consolidated.promotion_candidates,
    contradictions: consolidated.contradictions,
    evidence_gaps: consolidated.evidence_gaps,
    sensitive_flags: consolidated.sensitive_flags,
  },
  null,
  2,
)}

# CORPUS COVERAGE
${coverageNotes}

# WRITE THE FILE
Get today's date by running:
  [System.TimeZoneInfo]::ConvertTimeBySystemTimeZoneId((Get-Date), 'Eastern Standard Time')
Never compute or guess a date. Write to:
  output/evidence/<YYYY-MM-DD>_<short-kebab-slug-of-question>.md
Create output/evidence/ if it does not exist.

# READABILITY IS A REQUIREMENT, NOT A NICETY
This file gets read on a phone before a meeting and skimmed by people who will never open
section 7. Two hard rules:

- **Sections 0 through 2 must be readable in under three minutes and must stand alone.** Someone
  who reads only the top sheet should be able to make the decision and know what they are
  trusting. Everything from section 3 down is the appendix that defends it.
- **No wall-of-text paragraphs anywhere.** Cap prose paragraphs at roughly 4 sentences. Prefer a
  table, a short list, or a claim-and-quote block. Section 1's answer is the single exception and
  even it should break after 5 sentences.

0. **Top sheet** — the first thing in the file, before anything else. Exactly four elements,
   nothing more:
   - **The call** in one sentence. Not the topic, the recommendation.
   - **Confidence**, one word, with the single reason in a half sentence.
   - **The three things that decide it** — the shortest list that would change the call if any
     one flipped. One line each.
   - **What to do next**, max three bullets, each naming a person or a specific artifact.
   Then a horizontal rule. If the top sheet cannot be written honestly in that space, the
   evidence does not support a recommendation yet, and section 1 should say so plainly.

1. **Answer** — what the evidence supports, in 3-5 sentences. If the evidence does not
   support a confident answer, say that in the first sentence. Do not pad a thin base.
2. **Confidence** — strong / moderate / thin / insufficient, and why in one line.
3. **What the evidence establishes** — the CONFIRMED claims. One block each: the claim, the
   verbatim quote, the file path, independent source count, strength.
4. **Constraints** — is_constraint claims in their own section. These are what kill approaches
   and they get buried when mixed in with support. Do not bury them.
5. **What did not survive** — every WEAKENED / REFUTED / SUPERSEDED verdict, with the reason.
   This section is as valuable as section 3 and must not be softened or omitted.
6. **External corroboration** — every claim that got a web check. For each: the finding
   (corroborated / contradicted / vendor-claim-only / not-found), the URL, publisher, date, and
   whether the source was primary. Keep "the vendor claims X" visibly separate from "X is true"
   — a battle card can use the first, an executive slide needs the second. List every corrected name,
   spelling, ownership, scope, or figure here so the fix is reusable. If a widely-repeated figure
   turned out to have no traceable primary source, say that plainly; it is a finding.
7. **Unverified** — load-bearing claims past the cap. Explicitly not confirmed.
8. **Contradictions** — where the record disagrees with itself.
9. **Evidence gaps** — the specific missing input and who could produce it. Ranked by how much
   it would change the answer.
10. **Promotion candidates** — claims now at 2+ independent sources, with the target TP file.
    Note they still require /update-knowledge review; nothing here writes to the Truth Pack.
    Where a web check settled a previously-parked "verify before writing" item, say so — that
    unblocks it.
11. **Coverage and method** — corpora read, what was skipped, how many claims got a web check
    versus repo-only, the verification cap, and the honest limits of this sweep.

# WRITING RULES (from the repo's own standards)
- Lead with the point. Make a recommendation, not a survey.
- NO em dashes. Use commas, periods, parentheses, or a rewrite.
- No setup-and-negate constructions ("X isn't just about Y", "not just A, but B"). State it directly.
- Every non-obvious claim carries a file path. A claim without a citation does not go in the file.
- Never upgrade strength to make the answer look better. A thin base honestly labelled is
  useful; a thin base presented as strong is a credibility liability.
- Flag anything confidential rather than quietly using it.

Then return the path, the answer, the confidence, the top gaps, and anything genuinely surprising.`,
  { label: 'synthesize', phase: 'Synthesize', schema: SYNTH_SCHEMA, effort: 'high' },
)

return {
  question: QUESTION,
  artifact: synthesis && synthesis.file_path,
  answer: synthesis && synthesis.answer,
  confidence: synthesis && synthesis.confidence,
  verdicts: tally,
  claims_mined: allClaims.length,
  load_bearing: loadBearing.length,
  verified: checked.length,
  unverified: unverified.length,
  corpora_read: `${corpusResults.length}/${CORPORA.length}`,
  evidence_gaps: (consolidated && consolidated.evidence_gaps) || [],
  promotion_candidates: ((consolidated && consolidated.promotion_candidates) || []).length,
  surprises: (synthesis && synthesis.surprises) || [],
  web_checked: webSlots,
  web_routed_total: webAll.length,
  web_findings: externalTally,
  external_corrections: (synthesis && synthesis.external_corrections) || [],
  unblocked_tp_candidates: (synthesis && synthesis.unblocked_tp_candidates) || [],
}
