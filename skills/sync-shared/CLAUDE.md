# sync-shared Skill — canonical team-repo git

## Identity & Role

This skill manages **all git for the shared team repo** mounted at `shared/`. It is the ONLY thing that runs git against the shared repo — no manual submodule/subtree/git ceremony anywhere else.

The shared repo (`<github-url>`) is the **single source of truth for canonical team context** (Truth Pack, pm_principles, reference facts, **all VOC output**, briefs). It is cloned into `shared/` in this personal repo. `shared/` is gitignored by the personal repo, so the two git histories never mix.

> **Note:** **all** VOC lives in shared (not just synthesis), and it is **not de-identified**: agency names, contact names, and some customer email addresses are present, because the evidence base is unusable without attribution. The sensitivity line is the one below, not anonymization.

**Non-negotiable:** sensitive content (decision log, investor and board notes, candid people-notes) lives in `knowledge/_personal/` — OUTSIDE `shared/` — and never enters the shared repo.

---

## Commands

- **`/sync-shared pull`** — fetch + merge the latest canonical from the shared repo.
- **`/sync-shared publish`** — commit + push local canonical edits to the shared repo.
- **`/sync-shared`** (no arg) — status: local `shared/` changes + ahead/behind vs. origin.

**Cadence:** pull at the start of a work session (so you're reading current canonical); publish at your commit checkpoint (when you've made canonical edits worth sharing). Don't auto-push mid-work.

**Who reminds you (both are prompts, neither invokes this skill on its own):**
- **MorningStandup Step 0.4** — fetches `shared/` every standup and surfaces incoming commits from the product manager in Attention Items, so a session doesn't run all day on stale canonical. Read-only; it never pulls.
- **`/save` Step 4** — **publishes unpublished canonical edits automatically** at the EOD checkpoint. It still refuses to publish anything under `knowledge/_personal/`, and it still asks before publishing when the product manager has incoming commits (a merge is a human decision under optimistic-write). It reports the SHA and files in the save receipt.

**Why the gate moved on the publish side but not the pull side.** The files reaching `shared/` at EOD are almost entirely written by the background agents rather than by the VP of Product — VOC segment trackers, the cancel-form churn file, the daily scans — so approving them was a confirmation step with no judgment in it. **Pull is still never automatic**, because an unattended pull can surprise an in-flight edit, and standup Step 0.4 stays read-only.

---

## Process

### First run — mount if absent
If `shared/` does not exist:
```
git clone https://<github-url>.git shared
```
(Each person authenticates with their own git credentials. Requires collaborator access on the shared repo.)

### `/sync-shared pull`
1. `cd shared && git pull --no-rebase origin main`
2. If a **merge conflict** occurs → STOP. Surface the conflicting files. A human resolves (optimistic-write model — never auto-resolve canonical conflicts). The reconciliation skill is the later backstop for drift/dedupe.
3. Report `git diff --stat` of what changed.

### `/sync-shared publish`
1. `cd shared && git status` — show what changed.
2. **Guard:** confirm only legitimate canonical files changed. Nothing from `knowledge/_personal/` should ever appear here (it's outside `shared/` by construction) — if a personal/sensitive file somehow shows up, STOP and flag; do not push.
3. `git add -A && git commit -m "<one-line summary of canonical change>" && git push origin main`
4. If the push is **rejected** (remote moved ahead), run `pull` first, resolve any conflict, then re-push.

---

## Rules

- Operate **only inside `shared/`.** Never run these commands against the personal repo's own git.
- The personal repo's `.gitignore` excludes `shared/` — keep it that way.
- Canonical edits go in `shared/…`; sensitive stays in `knowledge/_personal/…`.
- Conflicts = human-resolved (optimistic-write governance).

## Stop Conditions
- **pull:** clean merge (or conflict surfaced for human) + change summary reported.
- **publish:** guard passed, committed, pushed (or rebased-then-pushed on rejection).
- **status:** local changes + ahead/behind reported.
