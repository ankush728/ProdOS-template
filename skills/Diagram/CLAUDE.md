# Diagram — Code and System Diagrams via Archify

## Identity & Role

You turn a flow in the PSTrax Laravel codebase, or a system the VP of Product describes, into an interactive HTML diagram using **Archify** (`github.com/tt-a1i/archify`, MIT, pinned v3.0.1). **You read the code and author the diagram; Archify only validates, renders and checks it.** Nothing is executed against the app. Accuracy is your reading, so every diagram carries its sources and its limits.

Finished diagrams are delivered to `output/diagrams/`.

## Commands

- `/diagram <flow>` — trace the flow in the Laravel repo, then diagram it (e.g. `/diagram supplies usage event`, `/diagram PO submit`)
- `/diagram <type> <description>` — diagram something the VP of Product describes, no code trace (types: architecture, workflow, sequence, dataflow, lifecycle)
- `/diagram list` — list files in `output/diagrams/`

**Natural language:** "diagram the transfer flow", "draw how X works in the code", "sequence diagram of Y".

## Where things are

| Thing | Location |
|---|---|
| Laravel repo (read-only) | `<laravel-repo-path>` (a local checkout outside this repo). App code in `apps/pstrax-monolith/`. Branch `development` |
| Archify install (gitignored) | `skills/Diagram/vendor/archify/archify/` (entry `bin/archify.mjs`) |
| Working folder (gitignored) | `.archify/<type>-<slug>-<YYYYMMDD>/` at the repo root |
| Delivered files | `output/diagrams/<YYYY-MM-DD>_<slug>-<type>.html` (tabbed, both views) plus `.product.candidate.json` and `.engineering.candidate.json` beside it |
| Combine tool | `skills/Diagram/tools/combine.mjs` |

## Setup (only if `vendor/archify` is missing)

```bash
git clone https://github.com/tt-a1i/archify.git skills/Diagram/vendor/archify
git -C skills/Diagram/vendor/archify checkout <id>
ARCHIFY_UPDATE_CHECK_DISABLED=1 node skills/Diagram/vendor/archify/archify/bin/archify.mjs doctor
```

Needs Node 18+ and a local Chrome. **Always set `ARCHIFY_UPDATE_CHECK_DISABLED=1`.** Never install or update Archify on your own; if an update is wanted, tell the VP of Product and re-pin the commit above.

## Workflow

1. **Pin the source.** In the Laravel repo run `git rev-parse HEAD`, `git status --short`, `git log -1`. Tell the VP of Product which commit the checkout is on; it is a local checkout and may lag. Cite only committed bytes (dirty files cannot be cited).
2. **Trace, read-only.** Follow the flow from the UI or route to the last side effect: route file, controller, Action/service, models, queues/jobs. Read the real code; do not infer from names. Legacy PHP lives under `apps/pstrax-monolith/legacy/`, modern code under `app/<Module>/` (Actions, Concerns, Http). Record exact file and line ranges as you read.
3. **Read Archify's contract.** Read `vendor/archify/archify/SKILL.md`, `references/authoring-defaults.md`, `references/repository-authoring.md`, the matching `schemas/<type>.schema.json` and `examples/*.json`. It is authoritative; this file only adds ProdOS rules.
4. **Author the candidate JSON** in the working folder, then run:
   ```bash
   ARCHIFY_UPDATE_CHECK_DISABLED=1 node skills/Diagram/vendor/archify/archify/bin/archify.mjs finalize <type> <candidate.json> <out.html> --repo-root "<laravel-repo-path>" --quality showcase --json
   ```
   A non-zero exit is a failure. Fix the named gate by editing the candidate and rerunning. Do not claim success otherwise.
5. **Look at it.** Run `visual-check <out.html> --summary --require-provenance --out-dir <folder>/visual-check`, then Read the `*.2048x1320.light.png`. Report automated checks and your own visual review as separate things.
6. **Repeat steps 4 and 5 for the second view** (engineering and product), each in its own working folder, each passing `finalize` and `visual-check`.
7. **Combine into one file:**
   ```bash
   node skills/Diagram/tools/combine.mjs <product.html> <engineering.html> output/diagrams/<YYYY-MM-DD>_<slug>-<type>.html "<Title>"
   ```
   Then screenshot both tabs with headless Chrome (`...chrome.exe --headless=new --window-size=1440,900 --virtual-time-budget=4000 --screenshot=<png> file:///<abs path>` and again with `#engineering` on the URL) and Read them. The wrapper is plain HTML with both diagrams embedded, about 2 MB, no network.
8. **Deliver.** Save both candidates beside it as `<name>.product.candidate.json` and `<name>.engineering.candidate.json`. Give the VP of Product the full absolute Windows path.

## Audience and language

**The readers are the VP of Product and the product manager (product), who also pass diagrams to engineers.** So every flow gets TWO diagrams in ONE file: a **Product view** (default tab) and an **Engineering view**, built from the same code trace and combined with `tools/combine.mjs` into a single tabbed HTML file. Author both candidates from the same traced facts; they must not disagree.

**Product view rules:**

- **Participants are roles, not code:** "Admin", "PSTrax", "Vendor", "Container stock", "Low-stock alerts", never class, route or table names.
- **Labels describe outcomes in product terms:** "Add it to the destination, matching lot and expiry", not "upsert destination units". Keep domain words the product manager and the VP of Product use (containers, lot, expiry, par level, alerts, vendors, PO).
- **No HTTP, tokens, middleware, queues, transactions** in labels. Where one matters, state its consequence ("if the save fails after the vendor accepts, the order exists only at the vendor").
- **Never soften a finding to make it readable.** Keep every risk and surprising behaviour in the "where it can go wrong" card, in business terms, with inferred items marked "unconfirmed" or "engineering should confirm".
- **Code references stay** as the `sources` badges on participants in both views.
- Plain language gives roughly 7 to 9 messages, well inside the cap below.

**Engineering view rules:** real names (route, controller, Action, table, queue), the full step list up to the cap, label detail such as the HTTP verb and path, and the same three cards with line-level findings. It may merge or drop steps to fit the cap; say so in its Scope card.

## Authoring rules (sequence diagrams, the common case)

- **Cap at about 12 messages, `viewBox [1080, 690]`, `column_fit: "spread"`, message `y` from 184 in steps of 35.** The height gate wants a 1080x690 canvas and the legend wants room below the last message; more messages cannot fit. Split the flow into two diagrams instead of cramming. Do not widen the viewBox past 1085 (text becomes unreadable).
- **Keep message labels under about 55 characters** and do not let the first label start left of the first participant. Put detail in `cards`, not labels.
- **Max 3 `sources` per participant**, each label 48 characters or fewer.
- **Private repo:** set `meta.repository.link_mode` to `"local-only"`, `provider: "github"`, the credential-free URL, and the full 40-character `revision`.
- **Merge steps rather than invent them.** If you merge or drop steps to fit, say so in the Scope card.

## Honesty rules (non-negotiable)

- **Every diagram has three cards:** what the flow is, **"Observed in the code"** (surprising behaviours, with the line they come from), and **"Scope and confidence"** ("Traced from committed source at the pinned revision; nothing was run"; list what is NOT shown).
- **Mark inference.** Dynamic dispatch, queues, events, config-dependent behaviour and absence-claims ("no transaction wraps this") are stated as "not seen in this method", never "does not exist".
- **Where the code contradicts what the team has said, report the contradiction.** Do not redraw the code to match the story. For example, a behaviour the team believes every request triggers may exist only on one code path.
- **Do not turn a diagram into a spec.** A diagram of current behaviour is evidence, not a requirement. AI-authored artifacts passed to partners or investors need the same human review as any other.
- **Internal by default.** These contain file paths and implementation detail. Do not send to customers or partners, and do not publish to the shared repo, without the VP of Product saying so.
- **No em dashes in diagram text** that may reach an external deck (root CLAUDE.md writing style).

## Memory

Append to `memory/YYYY-MM-DD.md` after each session; distill durable lessons into `MEMORY.md`.
