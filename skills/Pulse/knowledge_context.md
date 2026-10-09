# Pulse Skill - Knowledge Context

## What to Load and When

### Conductor (Always Load)
- `GOALS.md` — Strategic goal tags (G1-G4, RETENTION, ACV) reference
- `shared/knowledge/truth_pack/TP_07 Competitive Intelligence Registry.md` — Competitor aliases for normalization, threat tiers for prioritization
- `shared/knowledge/truth_pack/TP_01A Company Strategy.md` — S1/S2/S3 pillars for strategic tagging
- `skills/Pulse/MEMORY.md` — Past learnings and calibration notes
- `output/pulse/Pulse_[prior-YYYY-MM].md` — Prior month Pulse (for Watch List Accountability Review — Step 0)

### Scout 1 — Revenue & Pipeline (Always Load)
- `output/hubspot/competitor_aliases.md` — HubSpot-specific alias map for normalization
- `output/hubspot/LAST_REFRESHED.md` — Last refresh date to determine if fresh pull needed
- `shared/knowledge/truth_pack/TP_07 Competitive Intelligence Registry.md` — Canonical competitor list + aliases
- `shared/knowledge/truth_pack/TP_02 Market & Customer Facts.md` — Segment definitions (volunteer/combination/career)
- `output/pulse/competitive_tracker.md` — Prior month win rates for delta computation and threshold checking (read before computing scoreboard; append new row after section is written)

### Scout 2 — Sales Conversations (Load if transcripts exist)
- `skills/VOC/CLAUDE.md` — VOC skill identity (for workflow dispatch)
- `skills/VOC/workflows/analyze/CLAUDE.md` — Analyze workflow contract
- `skills/VOC/workflows/synthesis/CLAUDE.md` — Synthesis workflow contract
- `shared/knowledge/truth_pack/TP_03 Customer Archetypes & Personas.md` — Persona detection
- `shared/knowledge/pm_principles/PMOP_01_AI_Moat_Framework.md` — 8 moats for evidence mapping
- **Output path:** `shared/output/voc/pulse/[YYYY-MM]/` — all VOC analyses and synthesis for Pulse are saved here, never to `shared/output/voc/` root (structural scoping guard)

### Scouts 3A/3B/3C — Web Search Scouts (Always Load)
- `shared/knowledge/truth_pack/TP_07 Competitive Intelligence Registry.md` — Competitor names for search queries
- `shared/knowledge/truth_pack/TP_04 Product Scope and Module Map.md` — Module names for RFP matching (3A)
- `shared/knowledge/reference/pstrax-module-functionality.md` — Sandbox-validated functional reference (paired companion to TP_04). Use to match RFP requirements against actual PSTrax surfaces, not just conceptual modules. A RFP requirement for "asset hose testing tracking" maps to an existing surface (Asset Hose Testing check + Asset Cost Report); without this distinction the analysis under-counts PSTrax capability.
- `shared/knowledge/truth_pack/TP_02 Market & Customer Facts.md` — Market context for regulatory impact (3B)

### Scout 4 — Customer Voice (Always Load)
- `shared/knowledge/truth_pack/TP_07 Competitive Intelligence Registry.md` — Competitor names for sentiment matching
- `shared/knowledge/reference/product.md` — Product features for review matching

### Scout 5 — Product Signal (Load if data files exist)
- `shared/knowledge/truth_pack/TP_04 Product Scope and Module Map.md` — Module map for engagement mapping
- `tasks/active.md` — Current sprint work for "shipped this month" scoring
- `shared/knowledge/truth_pack/TP_07 Competitive Intelligence Registry.md` — Competitor features for relevance scoring

### Scout 6 — Cross-Signal (Load after all scouts complete)
- All scout frontmatter blocks + body content from the current run
- `output/pulse/competitive_tracker.md` — Multi-month win rate history for drift detection and threshold alerts
- `GOALS.md` — For strategic goal tagging of convergent signals
- `shared/knowledge/truth_pack/TP_01 Company & Positioning.md` — Positioning context for convergence assessment

### Scout 7 — Churn & Retention (Always Load — Limited Mode)
- `skills/Pulse/workflows/scout-7-churn/CLAUDE.md` — Workflow definition and mode logic
- HubSpot MCP (Cancel pipeline, Downgrade pipeline, FIN/Renewals pipeline)
- **Full Mode activation:** Load `pulse-data/[YYYY-MM]/churn_export.csv` if present

### Scout 9 — Local Government & Publications Signal (Always Load)
- `shared/output/voc/meetings_scan.md` — daily municipal meeting-minutes scan (procurement, operational, competitive signals)
- `shared/output/voc/publications_scan.md` — daily industry-publications scan (pre-labeled Hot/Warm/Cold)
- `shared/knowledge/truth_pack/TP_07 Competitive Intelligence Registry.md` — competitor aliases for normalization (these files name real competitors and adjacent vendors)
- `shared/knowledge/truth_pack/TP_04 Product Scope and Module Map.md` — module names to judge adjacency vs. direct relevance
- **Windowing:** read only entries dated within the run window (month for monthly; 7-day lookback for weekly); keep hot/warm only

### Weekly Pulse Check (Subset)
- Scout 1 context (pipeline movement only)
- Scout 4 context (new posts/reviews only)
- Scout 9 context (both local scans, 7-day window, hot/warm only)
- Scout 6 context (cross-signal from available data)
