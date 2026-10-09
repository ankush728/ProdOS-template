# Transcript Intelligence Skill - Knowledge Context

This file explains which knowledge bases the transcript-intel skill references and why.

---

## Always Load

**`knowledge/reference/team.md`** — Internal team roster
- **Why:** Resolve speaker identities from transcript labels
- **Used in:** Phase 1 (speaker detection) and Phase 2 (disambiguation)
- **Key content:** Names, roles, titles of PSTrax team members

**`shared/knowledge/truth_pack/TP_03 Customer Archetypes & Personas.md`** — Customer personas
- **Why:** Identify VOC signals and tag speakers by persona type
- **Used in:** Phase 3 (VOC lens extraction), persona tagging in outputs
- **Key content:** Career Chief, Volunteer Chief, Battalion Chief, City Manager

**`shared/knowledge/reference/pstrax-module-functionality.md`** — Sandbox-validated functional reference (paired companion to TP_04)
- **Why:** When customers mention a feature in a transcript, distinguish "asking for an existing feature they don't know about" from "asking for something new." The first is a UX/discovery gap (CS team training opportunity); the second is a roadmap signal. Mis-tagging propagates into VOC synthesis and Strategy work.
- **Used in:** Lens 03 (VOC signals — flag whether mentioned feature exists), Lens 04 (competitive intel — surface PSTrax-vs-competitor capability claims correctly), Lens 05 (strategic learnings — ground "PSTrax can/can't do X" assertions)
- **Key content:** All 11 modules with URLs, workflows, fields, reports table

**`meetings/1on1s/`** — 1:1 person profiles (all PROFILE.md files)
- **Why:** Resolve speakers from relationship context; enrich relationship notes lens
- **Used in:** Phase 1 (speaker resolution), Phase 3 (relationship lens)
- **Key content:** Person names, roles, communication preferences, relationship history

**`skills/transcript-intel/MEMORY.md`** — Own long-term memory
- **Why:** Apply past learnings about speaker patterns, lens relevance, format detection
- **Used in:** All phases

---

## Load If Competitive Signals Detected

**`shared/knowledge/truth_pack/TP_07 Competitive Intelligence Registry.md`** — Competitor registry
- **Why:** Match competitor names and aliases in transcript for competitive intel lens
- **Used in:** Phase 3 (competitive intel lens extraction)
- **Key content:** Competitor names, aliases/shorthand, categories, threat tiers
- **Note:** Always do a lightweight scan for competitor mentions first; only deep-load if signals found

---

## Load If VOC Signals Detected

**Recent `shared/output/voc/` files** — Prior VOC analyses
- **Why:** Cross-reference new VOC signals against existing patterns
- **Used in:** Phase 3 (VOC lens — check if signals are new vs. already captured)
- **Note:** Load only the most recent 3-5 analysis files for pattern matching

---

## How Context Is Used by Phase

### Phase 1: Read & Detect
1. Load transcript file (provided by user)
2. Load `knowledge/reference/team.md` — resolve known speakers
3. Load `meetings/1on1s/` profiles — resolve relationship contacts
4. Load `MEMORY.md` — apply format detection and speaker resolution learnings

### Phase 2: Speaker Disambiguation
1. Use team roster + 1:1 profiles to auto-resolve speakers
2. Only ask about truly unresolved speakers
3. Context reduces disambiguation questions significantly

### Phase 3: Deep Extraction
1. Load `shared/knowledge/truth_pack/TP_03 Customer Archetypes & Personas.md` — persona detection for VOC lens
2. Scan for competitor mentions; if found, load `shared/knowledge/truth_pack/TP_07 Competitive Intelligence Registry.md`
3. If VOC signals detected, load recent `shared/output/voc/Analysis_*.md` files for pattern matching
4. Run all 7 lenses with enriched context

### Phase 4: Output Generation
1. Generate outputs using context-enriched extraction results
2. Format decisions per TP_06 template
3. Format VOC signals per VOC analyze conventions
4. Save all files to `output/transcripts/[YYYY-MM-DD]_[slug]/`

---

## Knowledge Loading Best Practices

**At workflow start:**
1. Read this file (knowledge_context.md) to know what to load
2. Read MEMORY.md to apply past learnings
3. Load always-load context files
4. Scan transcript for competitive/VOC signals before loading conditional files

**During extraction:**
- Reference loaded knowledge, don't re-read files
- Use team roster for speaker attribution in all lenses
- Use persona context for VOC signal tagging
- Use competitor aliases for competitive intel detection

**At workflow end:**
- Save outputs to appropriate location
- Append learnings to daily log
- Update MEMORY.md if significant pattern emerged (e.g., new recurring speaker, new format encountered)
