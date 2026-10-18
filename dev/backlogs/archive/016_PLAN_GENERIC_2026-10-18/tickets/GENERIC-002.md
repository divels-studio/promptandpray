# GENERIC-002 [R1 prose] - the ledger, roadmap and skills prose

Implements: D-07, D-08 (the docs and skills half), D-11 (the notice half), D-12, D-13, D-15, D-16.
COO: cheap (Opus) - because all four no
Branch: `main`. Base: `0cf97e7` (plan-spanning). Depends on: GENERIC-001 (committed).

## Outcome

The doctrine, the skills and the files below say what D-07, D-08, D-12, D-13, D-15, D-16 decide.

## Scope

1. D-08 docs: `docs/WORKFLOW.md:533-563` - heading `### The ledger`; the page is the pointer index
   plus the plan-less rows; the fenced skeleton is D-08's (`# Ledger`, one paragraph, `## Plans`,
   `## Rows that belong to no plan` with `| date | kind | text | pointer |`). `:704` points at
   `§ The ledger`. Every `PNP_CANDIDATES` literal (`:536-537`, `docs/LOOP.md:134`,
   `skills/arbiter/SKILL.md:59-60`) stays for GENERIC-003 (D-09).
2. D-07: `docs/WORKFLOW.md:703-705` - a plan's ruling rows go to `<plansDir>/readiness/<ABBR>/ledger.md`,
   a plan-less one to the ledger; guard (h) `:189-193` the same split for a pointer row (D-08);
   `:453-463` the record carries the ticket's events; `:498` the layout names `ledger.md`.
   `templates/briefs/record.md:12` gains `## Events` after `## Decisions and deviations`, rows
   shaped as `templates/ORCHESTRATOR.md.tmpl:170`. `docs/OPERATOR_PROTOCOL.md:54` follows.
3. D-08 arbiter: `skills/arbiter/SKILL.md:55-75` - Steps 2 and 3 swap: the parked brief first (its
   `Ticket: <ABBR>-NNN` line names the plan), then `readiness/<ABBR>/ledger.md`, then the ledger's
   plan-less rows; a brief with no ticket reads the ledger only.
4. D-12: drop `done <date>` from `skills/plan/SKILL.md:66`, `templates/ROADMAP.md.tmpl:13`,
   `dev/backlogs/ROADMAP.md:13`; the grain rule ("a goal worth at least one plan") and the leaving
   rule beside the format at `skills/plan/SKILL.md:70-74` and `templates/ROADMAP.md.tmpl:4`;
   `docs/WORKFLOW.md:477-488` - at the archiving of an entry's last plan the entry leaves the
   roadmap, a dropped idea leaves with one ledger row `<ABBR> dropped: <why>`, and the plan's
   `## Plans` line is rewritten to the archive path (D-08); `:496` follows.
5. D-13 and D-08: `skills/plan/SKILL.md:202-224` - on the approval the COO writes `## Roadmap entry`
   (the entry's Goal and Why, verbatim) into the index with `## Measurements`, before the re-stamp;
   at the landing it writes the plan's `## Plans` line (`<ABBR> - readiness/<ABBR>/,
   active/<ABBR>/records/`) and adds the ledger to the landing's `git add`.
   `templates/briefs/planner.md:20` names `## Roadmap entry` as COO-written at landing.
6. D-15: `skills/plan/SKILL.md` between `:45` and `:47` - `## Step 0.5 - Doctrine preflight`: the
   the four documents of `skills/work/SKILL.md:32-36` IN FULL, with D-15's suppression dual.
7. D-16: delete the print sentence `skills/work/SKILL.md:39-42` and the audit-table clause of
   `skills/mission/SKILL.md:59-62`; `skills/roles`, `skills/setup`, fact 18's pointers stay.
8. D-11 notice: `dev/backlogs/CANDIDATES.md:3-5` becomes two English lines - frozen 2026-10-18; new
   rows -> `LEDGER.md`, ideas -> `ROADMAP.md`. The pointer lines move in GENERIC-003 item 10.

Out of scope: managed templates, `PNP_CANDIDATES` literals (GENERIC-003); code; the overrides.

## Acceptance

From the repository root, in PowerShell; the output after the dash means broken.

- `git diff -U0 0cf97e7 -- docs | Select-String -Pattern '^[-+]#{1,3} '` - any line but
  `-### The transfer surface`, `+### The ledger`, `-# Transfer surface`, `+# Ledger`,
  `-## Ruling ledger`, `-## Pass statistics`, `-## Event ledger`, `+## Plans`,
  `+## Rows that belong to no plan`.
- `git grep -n -F "§ The transfer surface" -- docs skills` - any hit (at `0cf97e7`: `docs/WORKFLOW.md:704`).
- `git grep -c -i -F "pnp_candidates" -- docs skills` - anything but `docs/LOOP.md:1`, `docs/WORKFLOW.md:2`, `skills/arbiter/SKILL.md:2`.
- `git grep -c -F "readiness/<ABBR>/ledger.md" -- docs/WORKFLOW.md skills/arbiter/SKILL.md` - a file missing.
- `git grep -c -F "## Events" -- templates/briefs/record.md` - no output.
- `git grep -n -F "done <date>" -- skills templates dev/backlogs/ROADMAP.md` - any hit.
- `git grep -c -F "at least one plan" -- skills/plan/SKILL.md templates/ROADMAP.md.tmpl` - a file missing.
- `git grep -c -F "## Roadmap entry" -- skills/plan/SKILL.md templates/briefs/planner.md` - a file missing.
- `git grep -c -F "## Plans" -- skills/plan/SKILL.md` - no output.
- `git grep -n -F "## Step 0.5 - Doctrine preflight" -- skills/plan/SKILL.md` - no output.
- `git grep -n -F "aiwf-roles.mjs" -- skills/work/SKILL.md skills/mission/SKILL.md` - any hit.
- `git grep -c -F "aiwf-roles.mjs" -- skills/roles/SKILL.md skills/setup/SKILL.md` - a file missing.
- `git grep -c -F "LEDGER.md" -- dev/backlogs/CANDIDATES.md` - no output.
- `git grep -nP "[\x{0400}-\x{04FF}]" -- docs skills templates scripts schema hooks migrations examples README.md` - any hit.
- `node scripts/update/validate-payload.mjs --plugin-root .` - exit != 0.

## Risk threshold

Blocks: a heading change beyond the rename; a `PNP_CANDIDATES` literal or a managed template
touched; the print gone from `/pnp:roles` or `/pnp:setup`; a meaning changed. Notes: wording.

## Stop condition

Stop after the record commit. Until GENERIC-003 skeleton and template differ: expected.

## Verify

Prose row (overrides § Test policy): the provenance grep + `validate-payload`, once, before the
commit. Render dry-run: `git grep -c -F "{{" -- templates/ROADMAP.md.tmpl` - any output is a
token to render; none means the render is the text.

## Code Map

| path | role in this ticket |
|---|---|
| `docs/WORKFLOW.md` | items 1, 2, 4 |
| `docs/OPERATOR_PROTOCOL.md` | item 2 |
| `templates/` | items 2, 4, 5 (`briefs/`, `ROADMAP.md.tmpl`) |
| `skills/arbiter/SKILL.md` | item 3 |
| `skills/plan/SKILL.md` | items 4-6 |
| `dev/backlogs/ROADMAP.md` | item 4 |
| `skills/work/SKILL.md` | items 6 (read), 7 |
| `skills/mission/SKILL.md` | item 7 |
| `dev/backlogs/CANDIDATES.md` | item 8 |
