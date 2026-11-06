# GATES-003 [R2 code] - the plan gate refuses side-by-side tickets whose Code Maps share a path

Implements: D-04, D-11.
COO: Opus - because all four no.
Branch: `main`. Scope guard: `HEAD <hash>` at the dispatch. Depends on: GATES-002 committed (the
selfcheck is a shared file, D-10).

## Outcome

A plan index may declare `Side by side: <REF>, <REF>[, <REF> ...]` lines at column 0 (two or more
refs, no upper bound); `plan-gate.js` refuses a malformed line, an unknown or duplicate ref, and every
path two refs of one line share in their Code Maps - equal, or a directory containing it, the longer
path named - with D-04's three tokens; no line, nothing checked. The planner brief and `plan.md`
name the line (D-04).

## Scope

The worklist; every row at its `file:line`.

- C1 `scripts/engine/plan-gate.js`: the three tokens in the header after `codemap-path-missing`
  `:53-55`; a reader beside `declaredTicketCap` `:443-455` - column 0, fenced lines masked, the key
  `Side by side: `; refs checked against the ticket files of `readFolder` `:266`; in `examine` after
  `:520-524`: a line with fewer than two refs, or a token (split on `, `) off the `<ABBR>-NNN`
  grammar -> `sidebyside-malformed:<line>` (no upper bound on the refs); a ref with no ticket file,
  or one named twice on its line -> `sidebyside-unknown-ref:<line>`; per pair of refs of a
  well-formed line, each pair of `codeMapPaths` `:372-386` entries that share - equal, or one a
  directory containing the other - -> `sidebyside-shared-path:<REF-a>,<REF-b>,<path>`, `<path>` the
  longer of the two (refs in the line's order, one problem per shared path); no line -> nothing.
  `stampPlanFolder` `:564-578` unchanged (it writes nothing while a problem stands).
- C2 `scripts/selfcheck/aiwf-selfcheck.js`: `PG_CONTRACT_TOKENS` `:5278-5279` gains the three; M-cases
  on a two-ticket variant of `PLAN_FIX` (`:4871-4930`) - `FIX-002` written inside the case's `after`,
  so the other cases' `exactly(...)` sets (`:5009-5081`) and the contract files `:4986` stand: one for
  `sidebyside-malformed`, one for `sidebyside-unknown-ref`, one for `sidebyside-shared-path` by
  equality, one by containment (a directory row against a file under it, the longer path named), and
  one well-formed line over disjoint Code Maps -> `exactly('stamp-mismatch')`; a named-fault control
  beside `:5392` per token and one for the containment test; `[plan-gate-tokens]` `:5293` counts them
  produced.
- C3 `templates/briefs/planner.md:31-41` names the line where the index states the order;
  `templates/doctrine/plan.md.tmpl:86-91` (§ Plan readiness review, the mechanical gate) names the check.
- C4 unchanged: spike gate2-plan rows `scripts/spike/run-spikes.mjs:353-384`; Gate 2 reads the tokens
  through brief mode with no change of its own.

## Acceptance

From the repository root; the output after the dash means broken.

- The selfcheck run of § Verify - exit != 0, or its `[plan-gate-tokens]` line names a `sidebyside-`
  token as never produced, or an M-case of `:5009-5081` changed its `exactly(...)` set.
- `git grep -c -F "sidebyside-" -- scripts/engine/plan-gate.js` - fewer than 6.
- `git grep -c -F "Side by side:" -- templates/briefs/planner.md templates/doctrine/plan.md.tmpl` - a
  file with no hit.
- `node scripts/engine/plan-gate.js --check dev/backlogs/active/GATES` (this plan, which declares no
  side-by-side line) - a `sidebyside-` token in the output.
- In a scratch copy of this plan's folder outside the repository, the line
  `Side by side: GATES-001, GATES-002` added under the index's `Tickets:` line, then
  `node <repo>/scripts/engine/plan-gate.js --check <copy>` - no `sidebyside-shared-path:GATES-001,GATES-002,scripts/selfcheck/aiwf-selfcheck.js`
  line; with `GATES-001, GATES-009` instead - no `sidebyside-unknown-ref:` line; with `GATES-001`
  alone - no `sidebyside-malformed:` line; with `GATES-001, GATES-002, GATES-003, GATES-004` - a
  `sidebyside-malformed:` line (no upper bound); with `GATES-002, GATES-003` after a row `` `scripts` ``
  is added to the copy's GATES-002 Code Map - no
  `sidebyside-shared-path:GATES-002,GATES-003,scripts/engine/plan-gate.js` line (containment, the
  longer path named).
- The validate-payload and spikes runs of § Verify - exit != 0.
- The provenance grep of `dev/PROJECT_OVERRIDES.md:156-157` - any hit.

## Risk threshold

Blocks: a folder that passed before refused with no `Side by side:` line in its index; a problem
token outside D-04's three, or a token name changed; the stamp written while a side-by-side problem
stands; a line inside a fenced block read; a containment missed, or reported under the shorter path; a
line refused for its number of refs above one; a pair reported for refs of two different lines; the existing M-cases' sets changed; a path
or project name in the payload. Notes: message wording, the order of problems within the new group.

## Stop condition

Stop and hand back before writing when: D-04's grammar does not fit a column-0 line the way the
`Tickets:` line does; Gate 2's brief mode would need a change of its own; a file outside the Code Map
must change. Stop after the hand-back; the commit follows the review, on the operator's click.

## Verify

D-11's plan-gate row (overrides § Test policy): `selfcheck` (`node scripts/selfcheck/aiwf-selfcheck.js
--plugin-root . --project-fixture .`), `spikes` (`node scripts/spike/run-spikes.mjs`) and
`validate-payload` (`node scripts/update/validate-payload.mjs --plugin-root .`), cwd `.`, and one
render dry-run of `templates/doctrine/plan.md.tmpl` on a scratch copy (the union for a template edit)
- once, by the COO in the background at the hand-back. Portion 1 only (Portion 2 is not a release gate); runbook
`dev/VERIFY_RUNBOOK.md`; logs outside the repository; a run over ~5 minutes in the background with a
3600000 ms timeout. The Writer runs only the tests it adds, red then green.

## Code Map

| path | role |
|---|---|
| `scripts/engine/plan-gate.js` | C1 |
| `scripts/selfcheck/aiwf-selfcheck.js` | C2 |
| `templates/briefs/planner.md` | C3 |
| `templates/doctrine/plan.md.tmpl` | C3 |
