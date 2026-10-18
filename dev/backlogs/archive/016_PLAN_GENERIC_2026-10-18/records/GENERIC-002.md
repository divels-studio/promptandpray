# GENERIC-002 - the ledger, roadmap and skills prose

## What landed

`834147d` (docs, COO direct edits, R1 prose):

- item 1 (D-08): `docs/WORKFLOW.md` § The transfer surface -> § The ledger: a pointer index (one line
  per plan under `## Plans`, plus the rows that belong to no plan), the D-08 skeleton (`# Ledger`, one
  paragraph, `## Plans`, `## Rows that belong to no plan` with `| date | kind | text | pointer |`); who
  writes the `## Plans` line (`/pnp:plan` at the landing, the archiving rewrites it);
- item 2 (D-07): guard (h) splits a pointer row by plan / no plan; the record paragraph names the
  ticket's events as rows of the record's `## Events`; the ruling-ledger paragraph of § Escalation
  points at `readiness/<ABBR>/ledger.md` or the plan-less rows; the layout block names `ledger.md`;
  `templates/briefs/record.md` gains `## Events` after `## Decisions and deviations`;
  `docs/OPERATOR_PROTOCOL.md` Gate 3 line follows;
- item 3 (D-08): `skills/arbiter/SKILL.md` Step 2 is the parked brief (its `Ticket:` line names the
  plan), Step 3 reads the plan's `ledger.md`, then the plan-less rows; no ticket -> the ledger only;
  the frontmatter description and WORKFLOW's "Where it goes" sentence follow the new order;
- item 4 (D-12): `done <date>` gone from `skills/plan/SKILL.md`, `templates/ROADMAP.md.tmpl`,
  `dev/backlogs/ROADMAP.md`; the grain and leaving rules beside the format in all three; WORKFLOW's
  archiving paragraph (the entry leaves, the dropped-idea row, the `## Plans` line rewritten) and the
  layout line `one LIVE entry per idea`;
- item 5 (D-13, D-08): `skills/plan/SKILL.md` Step 6 writes `## Roadmap entry` with `## Measurements`
  before the re-stamp, the plan's `## Plans` line at the landing, the ledger in the landing's
  `git add`; `templates/briefs/planner.md` says the planner writes neither section;
- item 6 (D-15): `skills/plan/SKILL.md` `## Step 0.5 - Doctrine preflight` with the git-diff
  suppression dual and the re-read after compaction;
- item 7 (D-16): the audit-table print removed from `skills/work/SKILL.md` Step 2 and
  `skills/mission/SKILL.md` Step 5;
- item 8 (D-11): `dev/backlogs/CANDIDATES.md` frozen notice, two English lines; the pointer lines stay
  for GENERIC-003 item 10.

## Decisions and deviations

- The term "transfer surface" stays as the config's name for the ledger (`paths.transferSurface`), so
  the sentences that use it without the `§` form (Gate 3 in LOOP and WORKFLOW, C-105's sentence in
  § Loop shape, the session rule) stay true; GENERIC-001's note on C-105 is answered by this, no edit.
- `docs/WORKFLOW.md` "Where it goes" sentence and the arbiter's frontmatter description were not in
  the worklist; both stated the old read order and were brought in line (one sentence each).
- `templates/briefs/record.md` § Remaining debt names "the ledger" instead of "the transfer surface".
- `dev/backlogs/ROADMAP.md` header gains the same grain and leaving lines as the template (the file was
  seeded from it).
- `skills/plan/SKILL.md` names the ledger path as `<ledger>`, resolved by § The ledger, so no
  `PNP_CANDIDATES` literal enters the skill (acceptance count).
- Step 0.5's dual: a diff error (a payload path outside the project repository) counts as "read again".
- COO diff reading: the whole diff of `834147d` read before the commit; no out-of-scope change, no
  heading beyond the rename, no managed template touched.

## Events

- violation, self-caught | overrides § Loop shape, gate checkpoint hook | `.aiwf/checkpoint.md` was not
  rewritten before the prose commit `834147d`; rewritten before the record commit.

## Verification (what actually ran)

PowerShell, from the repository root, after the last edit:

- `git diff -U0 0cf97e7 -- docs | Select-String -Pattern '^[-+]#{1,3} '`: the nine allowed lines only
  (count 9).
- `git grep -n -F "§ The transfer surface" -- docs skills`: no output.
- `git grep -c -i -F "pnp_candidates" -- docs skills`: `docs/LOOP.md:1`, `docs/WORKFLOW.md:2`,
  `skills/arbiter/SKILL.md:2`.
- `readiness/<ABBR>/ledger.md`: `docs/WORKFLOW.md:3`, `skills/arbiter/SKILL.md:1`.
- `## Events` in `record.md`: `:1`. `done <date>`: no output. `at least one plan`: plan `:1`,
  template `:1`. `## Roadmap entry`: plan `:1`, planner `:1`. `## Plans` in plan: `:1`.
  `## Step 0.5 - Doctrine preflight`: `skills/plan/SKILL.md:47`.
- `aiwf-roles.mjs` in work/mission: no output; in roles `:5`, setup `:1`.
- `LEDGER.md` in `CANDIDATES.md`: `:1`.
- Render dry-run `git grep -c -F "{{" -- templates/ROADMAP.md.tmpl`: no output.
- Provenance grep: no output (exit 1). `node scripts/update/validate-payload.mjs --plugin-root .`:
  exit 0 (`valid: 25 migration(s)`, payload 0.3.0).
- No auditor (R1 prose, D-18).

## Remaining debt

None. Until GENERIC-003, `templates/PNP_CANDIDATES.md.tmpl` and the `ORCHESTRATOR.md.tmpl` event-ledger
paragraph differ from § The ledger - expected by the ticket's stop condition.

## Scratch

`.aiwf/checkpoint.md` rewritten for this ticket; it is rewritten whole at the next gate, nothing to
move. Nothing to delete.

## Measurements

| correction rounds | COO session at close | source |
|---|---|---|
| 0 (no auditor) | 180k (18% x 1,000,000) | `~/.claude/ctx/<session>.pct`, `.size` |
