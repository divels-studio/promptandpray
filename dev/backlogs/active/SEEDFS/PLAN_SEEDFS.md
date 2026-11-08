# PLAN_SEEDFS - the seed-file op contained through the real filesystem
Tickets: 1 - one shippable piece: the containment fix, its proof and the release that carries it ride one code commit; a second ticket would split a fix from its proof

The plan of the roadmap entry `SEEDFS` in `dev/backlogs/ROADMAP.md`. One folder: this index,
`DECISIONS.md` (D-01..D-14), `RESEARCH.md` (two scans, 2026-11-08, facts 1-27),
`tickets/SEEDFS-001.md` (the frozen contract), `records/SEEDFS-001.md` (written at the ticket's close).

## Goal

The `seed-file` migration op judges its target the way setup already judges the transfer surface:
through the REAL filesystem, wherever it would write. The order is resolve (the `<plansDir>` token
and today's lexical test, which stays the first refusal) -> exists (a present regular file is `kept`,
whatever link leads to it) -> canonical containment (a target that leaves the project through a
junction or symlink on a parent directory is refused with setup's wording) -> the surface (D-01). A
target that is this installation's transfer surface under another spelling - an alias through a
junction - is refused as the surface (D-02); a link standing at an absent target is refused instead
of written through (D-04). The judgement is setup's own three helpers, exported and imported, not
copied (D-03), and `samePath` folds case on darwin as well as win32, for setup and update alike
(D-11); the summary lines and the dry-run overlay keep the project-relative target (D-05). The proof
is the shipped 0026 seed path in the update suite (D-06), each new check shown red-then-green by the
Writer's narrow run on scratch copies while the COO runs the suites once (D-12); the fix ships as
release 0.3.15 with one `note` migration (D-07); routing and the four VERIFY rows are D-08; the
boundary of the change is D-09; one ticket, D-10.

## Scope

In:
- SEEDFS-001, ONE code commit carrying the whole release diff (D-07, the 0.3.14 shape `eb5da90`).
  The Writer: `scripts/update/migrate.mjs` - the `planSeedFile` order, a canonical containment step,
  `refuseSurfaceSeed`, `seedTargetExists`, the docblock (D-01, D-02, D-04, D-05); the re-check of the
  canonical parent inside `applySeed`, `planSeedFile` and `applyPlan` exported as test seams (D-13); the three exports and
  the darwin fold in `scripts/setup/generate.mjs` (D-03, D-11); the 15c cases and the header comment
  in `scripts/update/test-update.mjs` (D-06); the narrow runner `.aiwf/SEEDFS-001-narrow.mjs` (D-12);
  migration `0040_seed-containment`, the manifest entry and the bump (D-07). The COO: the
  `CHANGELOG.md` block, the `README.md` version line and the 0011 stale sentence (R4), R1 prose (D-07, `dev/PROJECT_OVERRIDES.md:38-43`),
  written before the Verify batch and so before the Writer's commit; the self-install
  `/pnp:update --apply` after the commit. Worklist W1-W8, P1, N1, R1-R5 in the ticket's `## Scope`.

Out (D-09; DECISIONS § Deferred): setup's own surface and roadmap judgement
(`scripts/setup/generate.mjs:918-1040`, already real-filesystem) beyond the darwin fold it takes
through the shared `samePath` (D-11); the fallback name
`PNP_CANDIDATES.md` (ROADMAP § SETUP); the text of `migrations/0011_transfer-surface/NOTES.md`
(its promise `:28-30`; the stale `:31-32` sentence is R4's); the Gate 3 hook
`scripts/engine/pretooluse-mutation-guard.js` (lexical, pure by design); the validator
`scripts/update/validate-payload.mjs` (payload time, no project at hand); the `canonicalize` copy in
`scripts/ci/run-example-cycle.mjs:191-204`; `writeAtomic` / `writeConfig` (`migrate.mjs:118`,
`:644-646`); a `[SKIP]` for hosts that cannot create a junction; the consumers - a consumer takes
0.3.15 through `/plugin update` + `/pnp:update` in its own session.

## Tickets

| ref | title | implements | status | record |
|---|---|---|---|---|
| SEEDFS-001 | the seed-file op judged through the real filesystem - containment, the surface alias, a link at an absent target, the darwin fold; the 15c proof; release 0.3.15 | D-01 D-02 D-03 D-04 D-05 D-06 D-07 D-08 D-09 D-10 D-11 D-12 D-13 D-14 | open | - |

## Order and gates

One ticket; no order to keep, no side-by-side group. The route is the R3 shape (D-14): this plan and
its readiness pass are the mini-plan and its review; then Writer -> `/pnp:review` (code row) -> the
commit dialog, on `main`, declared by D-14. No QA - operator dialog answer 'Без QA', 2026-11-08 (the
suite log is the artifact; the Reviewer reads it).

- **SEEDFS-001**: the operator's word for the ticket (the planning word is not it). The Writer is
  dispatched once with `Ticket: SEEDFS-001` on its own line (Gate 2 silent: the ref names a ticket of
  an active plan), the scope guard `HEAD <hash>` at the dispatch; it writes W1-W8, P1, N1, R1-R3 and
  hands back once, with the narrow run red on the guard HEAD's `migrate.mjs` and green on the change,
  and no full suite run (D-12). The COO writes R4 (the CHANGELOG block, the README version line) in
  the main session BEFORE the Verify batch starts, so before the Writer's commit (D-07). The COO runs
  the four Verify rows (`update-suite`, `setup-suite`, `validate-payload`, `selfcheck` in the CI form)
  ONCE as one parallel batch in the background at the hand-back, beside the full diff read - that run
  is the VERIFY row (D-08, D-12). Review
  pass 1 of the audit table's code row (`/pnp:roles`) rides the ticket's word; any further pass takes
  its own word, one word per pass. No QA (the operator's answer above). The ONE code commit - the whole release
  diff, the COO's R4 prose included (D-07) - is the Writer's, local, by explicit paths, through its
  native dialog - the operator's click is the approval - body
  `Refs: SEEDFS-001`, no AI attribution line of any kind (operator rule 2026-08-31); the provenance
  grep empty before it. The live copy refreshed after the commit (root `CLAUDE.md` § This repository is
  the plugin). The self-install `/pnp:update --apply` on this repository by the COO on the operator's
  word (R5), its embedded project-scope self-check the proof of the fixture form's project rows
  (`dev/VERIFY_RUNBOOK.md:22-29`). The record `records/SEEDFS-001.md` in its own docs commit through
  its own dialog; the plan archived at once (guard (e)).
- **The release**: the tag word and the push word are the operator's, separate, after the ticket - the
  tag created locally on the record commit and pushed with `main` in one push, CI not waited for
  (`dev/PROJECT_OVERRIDES.md:50-54`). They are named here, not gates of the ticket.

## Closing greps

- Set 1 - the lexical surface comparison that leaves migrate.mjs: `rg -n "sameRel|FOLD_CASE" scripts` -> 9 hits; the set: `scripts/update/migrate.mjs:504`, `:505`, `:530`; exempt (not callers - the Gate 3 hook's own separate `FOLD_CASE` definition, pure by design, D-03): `scripts/engine/pretooluse-mutation-guard.js:192`, `:282`, `:294`, `:295`, `:304`, `:305`. After the ticket: 6 hits, all in the hook.
- Set 2 - the three helpers the plan exports: `rg -n "canonicalPath|isInsideDir|samePath" scripts` -> 18 hits, all `scripts/setup/generate.mjs`: definitions `:639`, `:663`, `:675`; uses `:922`, `:923`, `:924`, `:943`, `:945`, `:952`, `:960`, `:975`, `:1000`, `:1001`, `:1002`, `:1012`, `:1014`, `:1020`, `:1025`. Zero hits outside generate.mjs today; after the ticket the grep hits generate.mjs and `scripts/update/migrate.mjs` only.
- Set 3 - the seed functions the plan changes: `rg -n "resolveSeedTarget|refuseSurfaceSeed|seedTargetExists" scripts` -> 6 hits, all `scripts/update/migrate.mjs`: `:493`, `:494`, `:497`, `:508`, `:527`, `:539`. No caller outside the file; and `rg -n "applySeed" scripts` -> 4 hits today: definition `scripts/update/migrate.mjs:556`, its one caller `:661` (the `seed` branch of `applyPlan`), the comment `:485`; exempt (a comment naming it, not a caller): `scripts/setup/generate.mjs:1357`. After the ticket: the definition with its third argument (unexported - the seams are `planSeedFile` and `applyPlan`), the caller `:661` passing `plan.expectParent`, the comment `:485`; still 4 hits - 3 in migrate.mjs plus the exempt comment `scripts/setup/generate.mjs:1357`, and `rg -n "planSeedFile|applyPlan" scripts/update/test-update.mjs` hits P1 case (e) as the seams' importer - the close grep states both counts.
- Set 4 - the message strings: `rg -n "the transfer surface of this installation" scripts` -> 4 hits: producer `scripts/update/migrate.mjs:532`; readers `scripts/update/test-update.mjs:1565`, `:1742`, `:1750` (kept verbatim, D-02). `rg -n "not inside the project" scripts` -> 6 hits today: `scripts/update/migrate.mjs:521` (the lexical sentence - it STAYS as the first refusal, D-01; no test reads it), `scripts/setup/generate.mjs:855`, `:926`, `:1004`, `scripts/setup/test-setup.mjs:1940`, `:2096` (setup's, untouched); after the ticket: those 6 plus the canonical sentence in migrate.mjs and the P1 reader(s) in test-update.mjs - the close grep states the count. `rg -n "really resolves to" scripts` -> 4 hits today: `scripts/setup/generate.mjs:926`, `:1004`, `scripts/setup/test-setup.mjs:1940`, `:2096`; after the ticket migrate.mjs and test-update.mjs join the list (D-01, D-06).
- Set 5 - the release stamp set and its readers: `rg -n --hidden "0\.3\.14" --glob '!dev/**' --glob '!.git/**' .` -> 9 hits today: `CHANGELOG.md:7` (the 0.3.14 block header - stays, the 0.3.15 block goes above it, R4), `.claude-plugin/plugin.json:3` (R3 moves it), `README.md:22` (R4 moves it), `.claude/aiwf-native/aiwf.config.json:4` (the self-install - moved by R5 only, never by hand), `migrations/index.json:40` (stays; R2 adds the 0040 line after it), `migrations/0039_selfcheck-jobs/ops.json:3`, `:8`, `migrations/0039_selfcheck-jobs/NOTES.md:35`, `:47` (a shipped migration's text, frozen - D-09). `rg -n --hidden "0039_selfcheck-jobs" --glob '!dev/**' --glob '!.git/**' .` -> 5 hits: `CHANGELOG.md:46`, `.claude/aiwf-native/aiwf.config.json:5` (R5 moves it), `migrations/index.json:40`, `migrations/0039_selfcheck-jobs/ops.json:2`, `NOTES.md:1` - none changes in the Writer's commit. The close grep after the ticket: `rg -n --hidden "0\.3\.15" --glob '!dev/**' --glob '!.git/**' .` hits exactly `.claude-plugin/plugin.json:3`, `README.md:22`, `migrations/index.json` (the 0040 line), `migrations/0040_seed-containment/ops.json`, `migrations/0040_seed-containment/NOTES.md`, `CHANGELOG.md` (the new block) - and `.claude/aiwf-native/aiwf.config.json:4` only after R5. Readers of the set: `scripts/setup/generate.mjs:797-812` (a fresh install validates the payload and stamps the manifest's LAST entry - so index.json's last line must be 0040), `scripts/update/validate-payload.mjs` (manifest ascending by one, last entry = plugin.json version; `migrations/README.md:18-25`), `scripts/update/aiwf-update.mjs --check` (the version interlock).

## Measurements

| idea -> approved plan | cycle spend |
|---|---|
| 270,000 (approval 340,000 = 34 % x 1,000,000, minus the start 70,000 = 7 % x 1,000,000; both from the statusline files `~/.claude/ctx/<session>.pct` / `.size`, whole-percent precision) | 696,619 |

The parts of the cycle spend, one per line, with the source of each value:
- research agent, code surface (sonnet) - 74,466 - notification
- research agent, tests / docs / CI surface (sonnet) - 94,917 - notification
- planner (writer type, pinned model; one agent across the first write, revisions 1-3 and the small fixes) - 204,452 cumulative, counted once - notification
- runnability pre-pass (sonnet) - 41,135 - notification
- Codex readiness passes 1-3 on `review.plan` (gpt-6-sol/xhigh; pass 1 cold 124,909, passes 2 and 3 resumed, 197,637 and 281,649 cumulative) - 281,649, the session's running total over the three passes - round headers (`readiness/SEEDFS/round-1.md`, `round-2.md`, `round-3.md`)
- the COO session itself - the first column, not a part of the second.

## Roadmap entry

- Goal: the `seed-file` migration op refuses a target that resolves outside the project or onto this installation's transfer surface through the REAL filesystem (a junction, a symlinked alias), as setup's surface judgement already does
- Why: Codex code pass 1 on GENERIC-003 (2026-10-18) returned two blockers on it - `resolveSeedTarget` / `refuseSurfaceSeed` in `scripts/update/migrate.mjs` resolve `<plansDir>` and compare the surface lexically; pre-existing since `926a3c6` (0.3.0's seed-file op; 0025's ROADMAP seed has the same exposure), outside GENERIC-003's scope; operator word „1" (recorded as a risk, not a correction round)
