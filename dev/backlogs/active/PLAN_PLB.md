# PLAN_PLB - Plan B: the code part (0.2.19)

APPROVED 2026-10-15 - operator word „одобрявам" over r9 (stamp
1266bc2eb4747d668b6a7210a175878ed7fd56a9cf1523467b47980c1ae411c8); two Codex readiness passes
(NEEDS-FIX 9 -> closed, NEEDS-FIX 4 revision-born -> closed), no third pass by the operator's
decision. Execution: PLB-002 first, in a fresh session (COO recommendation; this one at 67%).

Status: r9, 2026-10-15, after the consumer inventory, the Step 2a behavior ledger +
consequence scan, three fact-check gate rounds, readiness pass 1 (NEEDS-FIX, 9 blockers - 8
closed in r6, blocker 1 closed by the operator's ruling in D1), the delta consequence scan
(rows 117-160, closed in r7) and readiness pass 2 (NEEDS-FIX, 4 revision-born blockers, closed
in r9 - the configured passes are exhausted; a third pass takes the operator's own word;
`dev/backlogs/readiness/PLB/revisions.md` has the rows and the verdict verbatim). Pointers are `file:line` against HEAD `7e0180c`; counts are recomputed at each ticket's
start. At approval this draft moves to `dev/backlogs/active/PLAN_PLB.md` and lands with
`readiness/PLB/` AND the uncommitted `dev/backlogs/CANDIDATES.md` ruling row of 2026-10-15 (the
PLB-001 route) in ONE docs commit (`docs/WORKFLOW.md` guard (e)), so the tree is clean at PLB-002's
dispatch; PLB-006 archives it from there.
Readiness cycle: `review.plan` row = codex gpt-6-sol/xhigh, 2 passes. Source:
`dev/backlogs/CANDIDATES.md` § "Инвентар 2026-10-14", paragraph "План Б - кодът (0.2.19)", and the
candidate sections it names (cited by title - their line numbers move with every row added to that
file). The RULES queued under "ВЛИЗАТ В ПЛАН Б" are NOT in this plan - they land once, in the compact
register, in PLAN_DOCT (0.2.20); writing them into the overrides now and shortening them next release
would be the same text paid twice.

## Goal

Close the code defects consumers reported during stabilization, in one release (0.2.19), with the
code row's single Codex pass per ticket, and put the tree into English where it is read every session.

## Scope / out of scope

In: PLB-001..006 below. Out, with the reason:
- every rule-class candidate -> PLAN_DOCT; the plan format -> PLAN_FOLD; the context-cap hook
  beyond (j); HARD-011 (public README) -> 0.3.1; `dev/backlogs/active/PLAN_HARD.md` stays Bulgarian
  (its header `:26-29` keeps it active until HARD-011 closes; its records are history);
- the junction-containment hole (§ "Заварен лексикален containment с junction дупка"): the row
  itself says a canonical check would REFUSE installs that work today (a junctioned `docs/`) - a
  behaviour change with a product cost, so it stays a candidate until the operator wants that cost;
- a per-ticket `last-review-session.<REF>.txt` (§ "Прием от Silerax" item 9): the only risk the row
  names is two sessions reviewing in one project at once, which `docs/WORKFLOW.md` § Branch policy
  already forbids (one executing session per tree); the change would touch both wrappers, the
  self-check's session-file map (`scripts/selfcheck/aiwf-selfcheck.js:3353-3357`) and three docs for
  a case the doctrine excludes - not worth a pass;
- a validator for supersede-list completeness (§ "`0011` supersede списъкът пропусна едно ID"): the
  `supersedes` field lives on the `note` op (`scripts/update/validate-payload.mjs:145-155`,
  `:406-411`), its ids are free-form strings with no registry anywhere in the payload, so no validator
  can know the set it should be complete against; the duty is the author's closing grep, written as a
  step in `migrations/README.md` (PLB-002 Outcome (c));
- making `.claude/aiwf-native/aiwf.config.json` writable under an open route (the candidate's second
  half): the config carries `enforcement.routeWriteGuard` and `paths.transferSurface` themselves, so a
  writable config lets the session widen or switch off the guard it is held by (consequence scan rows
  PLB-001 #1-3). A config key is set between tickets.

## Decisions

- D1. Route R2 for PLB-002..006, by the standing ruling for payload work (CANDIDATES § Ruling
  ledger, row "Тикет с payload миграция: R2 или R3?", operator 2026-10-14). PLB-001 widens Gate 3's
  allowlist by one resolved path and changes neither the deny-on-unusable-state nor Gate 1, so no
  fail direction flips (overrides § Architecture direction, "a change that flips a fail direction is
  R3") - but `docs/WORKFLOW.md` § R3 names "access policy" and the migration ruling does not cover a
  gate change (pass-1 blocker 1), so PLB-001's route is the OPERATOR's ruling: `ROUTE PLB-001: R2
  by ruling "widening a gate's allowlist without flipping its fail direction is R2" - operator
  word 2026-10-15 „R2 с ruling"` (CANDIDATES § Ruling ledger row of the same date). PLB-001 works
  on `main` like the other tickets.
- D2. Class per ticket: `code` for PLB-001..004 (one Codex pass each, fact-check before it),
  `docs` for PLB-005 and PLB-006 (no auditor; PLB-006 runs no suite - its VERIFY is the
  provenance grep of the docs row, and the tag and push are operator gates, not checks).
- D3. The version moves with the first ticket that needs the migration. `validate-payload` requires
  the manifest's last `targetPluginVersion` to equal `plugin.json` (`scripts/update/validate-payload.mjs:262-270`;
  `scripts/setup/test-setup.mjs:225-227` pins the same), so a `0023` entry at 0.2.19 cannot exist
  while `plugin.json` says 0.2.18, and manifest versions are strictly monotonic
  (`validate-payload.mjs:252-253`), so 0.2.19 has exactly ONE migration. Therefore PLB-002 creates
  `migrations/0023_changes-dir-and-agents/` (`ops.json`, `NOTES.md`, the `migrations/index.json`
  entry `{"id": "0023_changes-dir-and-agents", "targetPluginVersion": "0.2.19"}`), bumps
  `.claude-plugin/plugin.json` to 0.2.19 and opens the `## [0.2.19] - <date of the PLB-002 commit>`
  block in `CHANGELOG.md`; PLB-003 appends its op to the SAME migration and its CHANGELOG entry;
  PLB-001 and PLB-004 add their CHANGELOG entries. Op order in 0023: `add-config-key`, then the
  `note` op (the operator-facing text for `changesDir`, `$schema` and `AGENTS.md`), then the
  `rerender-managed-region` for `AGENTS.md` LAST - a refusal there leaves the first two applied and
  journaled, and a re-run after the file is moved aside resumes (`migrate.mjs:1131-1160`). A version
  is RELEASED only by the tag + push words (PLB-006), so an open 0.2.19 across four commits is
  unreleased work, not a release. Op vocabulary stays the four ops (overrides § Data).
- D4. VERIFY per ticket is the overrides § Test policy row for its diff, run by a fresh `sonnet`
  agent (operator rule 2026-10-15); the Writer runs only the targeted red-then-green test it adds.
  The suites run as `dev/VERIFY_RUNBOOK.md` says (PowerShell, Portion 1 as one parallel batch).
  Every OTHER acceptance command in this plan - the greps and counts - is a Git Bash command, run
  through the Bash tool from the repo root (this Windows host has no `grep` in PowerShell; `grep`,
  `git grep`, `wc` exist in Git Bash); a pipeline whose first stage is a `node` run is split in two
  commands - the `node` run redirected to a file under the session scratch directory (an explicit
  absolute path, never a bare `$TMP`) with its exit code recorded, then the count over that file -
  so the filter's status never masks the run's; a `git grep ... | grep -v ...` pipeline reports the
  LAST stage's status by design (exit 1 = nothing left after the filter).
- D5. The Gate 3 hook reads the config through ONE reader with ONE failure rule: anything it cannot
  read, parse or type resolves to the narrower allowlist (armed), exactly as
  `routeWriteGuardEnabled` does today (`scripts/engine/pretooluse-mutation-guard.js:118-133`).
  `paths.scratchDir` is never resolved: the schema makes it `const ".aiwf"`
  (`schema/aiwf.config.schema.json:306-310`) and the hook hard-codes it (`:71`).
- D6. Every doc sentence that states the Gate 3 allowlist is one enumeration: the known homes are
  listed in PLB-001, rewritten to one common phrase, and the closing grep there must hit exactly the
  11 files PLB-001 names and nothing outside them (the spike README's captured transcript, one test
  label and one code comment are known hits left unedited; `CHANGELOG.md` is outside the pathspec).
- D7. COO routing per ticket (`docs/WORKFLOW.md` § COO routing, four checks), written after the
  consequence scan: PLB-001 `COO: top, because check 1` (it edits a permission-model gate);
  PLB-002 `COO: top, because check 1` and PLB-003 `COO: top, because check 1` (check 1 reads
  "writes migration ... code", `docs/WORKFLOW.md:905`, and both write migration 0023 - a payload
  migration is still a migration until a ruling says otherwise); PLB-004 `COO: cheap, because all
  four no` and PLB-005 `COO: cheap, because all four no` - by the operator's ruling of 2026-10-15
  (CANDIDATES § Ruling ledger): check 2 counts a worklist item that still needs discovery to locate;
  a NEW file with a fixed path and contract, or a section cited by its title, is anchored (PLB-003's
  template likewise, but PLB-003 stays top by check 1); PLB-006 `COO: cheap, because all four no`.
  Tiers: top = Fable, cheap = Opus
  (overrides § Loop shape, operator rule 2026-10-15 - no Sonnet COO). The routing moves the COO
  only; Writer and audit table stay as `/pnp:roles` shows them.
- D8 (PLB-003 design). The rendered Codex instruction file carries NO plugin-root path, NO
  version and NO role-specific check: the brief on stdin names the files the pass needs by their
  resolved absolute path (the review brief supplies the path of `docs/REVIEW_CHECKLIST.md`, and of
  the classes doc for a readiness pass - `skills/review/SKILL.md:174-185`, `:304`; the QA brief the
  same checklist, `skills/qa/SKILL.md:191`), so a file that names no version cannot go stale by an
  update; and because the same file reaches the Reviewer AND QA runs (both wrappers use `-C
  <projectRoot>`), it carries nothing that belongs to one role - `review.productBoundaryChecks` are
  the Reviewer's (schema `:338`, `REVIEW_CHECKLIST.md:58-59`) and stay in the reviewer agent and the
  review brief, never in `AGENTS.md` (pass-1 blocker 7).
- D9. Gate 3 and the COO's own writes. While a route is open the main session cannot write `dev/**`
  (`isAllowlisted`, `scripts/engine/pretooluse-mutation-guard.js:93-101`). The route stays open
  through the check agent's VERIFY run, the Codex pass and the Writer's commit (none of them writes
  `dev/**`); `.aiwf/route-state.json` is cleared with `{}` right after the ticket's code commit,
  and only then the COO writes the completion record, the CANDIDATES rows and the readiness files -
  close first, record second. A COO fix inside that window is a micro-round to the live Writer,
  never a COO edit of `dev/**`.
- D10. The self-update of this repository happens ONCE, after PLB-003 - because the engine applies
  only manifest entries after `_aiwf.lastMigrationApplied` (`migrate.mjs:515-525`), an op appended
  to 0023 after this repo applied it would never be pending. So `D:\pnp-live` is NOT refreshed
  after exactly THREE commits - PLB-002's code commit, PLB-002's completion-record commit (written
  right after its code commit, D9) and PLB-003's code commit - a stated exception to CLAUDE.md's
  after-every-commit rule. Interlock walk: pnp-live stays at `7e0180c` (payload 0.2.18) while
  `_aiwf.installedPluginVersion` is 0.2.18, so `aiwf-update.mjs --check` exits 0 at every `/pnp:*`
  start through those three commits, and nothing in them changes a hook (PLB-002/003 touch the
  update engine, setup and templates, not `scripts/engine/pretooluse-*`). After PLB-003's code
  commit, in this order: refresh `D:\pnp-live` (payload now 0.2.19, `--check` non-zero); run
  `/pnp:update` on this repository (the documented exception skill; applies 0023 whole:
  `changesDir`, `$schema`, the `note`, `AGENTS.md`; writes the CHANGES report; installed becomes
  0.2.19, `--check` green again); run the real `node scripts/selfcheck/aiwf-selfcheck.js
  --plugin-root . --project-fixture .` - the deferred acceptance item of PLB-002 and PLB-003 (on
  the bumped tree before the self-update it is red on `version-stamp`, `aiwf-selfcheck.js:5445-5447`,
  and after PLB-003 also on `managed-regions-cover`); the PLB-003 completion-record commit takes
  the record AND those tree changes (`.claude/aiwf-native/aiwf.config.json`, the CHANGES report,
  `AGENTS.md`) and carries the selfcheck result for both tickets, so the tree is clean at PLB-001's
  dispatch. PLB-002's own record (written at its gate) states the item as "deferred to the D10
  self-update, result in PLB-003's record" - an explicit exception to the Test policy row
  "schema / config / roles -> selfcheck" for the pre-commit run, because the stamp makes the real
  selfcheck structurally red there. From then on every commit refreshes pnp-live as usual. That
  self-update is the first consumer proof of 0023.

## Tickets

### PLB-001 - Gate 3 lets the main session write the transfer surface while a route is open
COO: top, because check 1 (D7).
Source: CANDIDATES § "Gate 3 заключва `paths.transferSurface` за консуматор по средата на тикет"
+ (j) of § "Таван на контекста"; event row 2026-10-14 "Gate 3 затваря трансферната повърхност".
Problem: with `.aiwf/route-state.json` naming an R2/R3 route, `isAllowlisted`
(`scripts/engine/pretooluse-mutation-guard.js:93-101`) allows the first path segment `docs` or
`.aiwf`, or a root `*.md`, and nothing else. The transfer surface (`paths.transferSurface`, fallback
`<plansDir>/PNP_CANDIDATES.md`, `schema/aiwf.config.schema.json:323-328`) is under `docs/` only when
`plansDir` keeps its default `docs/backlogs` (`:311-316`); on this repo it is `dev/backlogs`
(`.claude/aiwf-native/aiwf.config.json:239-241`) and the consumer rows in CANDIDATES report the same
shape, so an incident row waits until `{}` and is forgotten (LEAN-001; Silerax UIR-047).
Outcome: while a route is open and the state is a TICKET (not unusable), the main session may also
write the file `paths.transferSurface` resolves to - the configured value when it is a non-blank
string, else `<paths.plansDir>/PNP_CANDIDATES.md` (`scripts/setup/generate.mjs:874-879` is the rule
the hook copies; with a default or blank `plansDir` that fallback is already under `docs/` or a root
`*.md`, so the copy matters only for a configured value) - and only when that resolved path is
contained (relative, no `..` segment, not absolute) and its basename ends in `.md` - the `.md`
rule is what keeps `.claude/aiwf-native/aiwf.config.json` and every code file out even when the
config names them. Everything else stays as it is: every other code-class path denied, the
unusable-state allowlist unchanged, the Writer untouched. The hook holds no lock: a write to the
surface is one Edit/Write by one actor, and two actors writing it at once is the one-executing-
session invariant (`docs/WORKFLOW.md:965`), not this ticket's. A surface that is a symlink or
junction is the realpath residual already out of scope (§ Scope, the junction row).
Deny text (literal): `it may write only docs/**, .aiwf/** and root-level *.md, plus the transfer
surface <resolved path> (gate 3)`; when no surface resolves, the sentence ends at `*.md`.
Worklist (Writer acts here):
- `scripts/engine/pretooluse-mutation-guard.js`: ONE config reader `readProjectConfig(projectDir)`
  (parsed object or `null` on any read/parse/type failure) that `routeWriteGuardEnabled` (`:118-133`)
  is refactored onto, keeping its armed-on-failure result; `resolveTransferSurface(config)` beside it
  returning the contained `.md` path or `null` - `null` also for a value whose first segment is
  `.claude` (the project layer: agent files and `ORCHESTRATOR.md` are `.md` and contained, and must
  not become writable by naming them as the surface), and the value is `trim()`med before the test
  (`generate.mjs:877` tests `trim() !== ''` but returns the value untrimmed - a padded value is a
  config defect; the hook, the stricter side, trims, and the parity rows use clean values);
  the identity test is the HOST's path identity, not a string rewrite (pass-2 blocker 1): the
  surface is resolved once as `surfaceAbs = path.resolve(projectDir, surface)` with the host `path`
  (so on Linux a backslash is a filename character and `dev\backlogs\CANDIDATES.md` is NOT the
  surface; on Windows it is a separator), the target is the `resolved` the hook already computes
  with the same host `path.resolve` (`:200`), and the write is the surface iff
  `path.relative(surfaceAbs, resolved) === ''` - with both sides lower-cased first ONLY when
  `process.platform === 'win32'` or `'darwin'` (the default case-insensitive filesystems; a
  case-sensitive macOS volume is the stated residual of this rule, as the realpath residual is of
  Gate 3 as a whole) and compared exactly on `linux`, where `DEV/backlogs/CANDIDATES.md` is another
  file (pass-1 blocker 2; the existing first-segment fold at `:96` stays as it is on every platform
  - pre-existing behaviour, not widened here). The `.claude` exclusion is tested on the NORMALISED
  relative form, `path.relative(projectDir, surfaceAbs)` split on the host separator - so
  `./.claude/agents/writer.md` and `.claude\agents\writer.md` are refused like `.claude/...`. This
  is the hooks' first `process.platform` branch, stated as such. The surface rule is
  deliberately STRICTER than PLB-002's `containedRelativePath` (which normalises `a/../reports`):
  a security allowlist admits no `..` segment at all, a report location may; the hook is CJS and
  cannot import the ESM helper anyway. `mainSessionDecision` (`:175-214`) passes `extra` ONLY when
  `st.why !== 'unusable'`; the deny text (`:209-213`) and the header comment (`:30`) carry the
  literal above, and the "plus the transfer surface" clause is emitted only when `extra` was passed
  (never on an unusable state).
- `scripts/selfcheck/aiwf-selfcheck.js`: new rows in a `mkProject`-style fixture (`:1865-1874`,
  state + config). Allow rows - seen FAIL on the pre-fix hook: the configured surface
  `dev/backlogs/CANDIDATES.md` under `plansDir: dev/backlogs`; `./dev/backlogs/CANDIDATES.md` and
  `dev\backlogs\CANDIDATES.md` as the written path. Deny rows - negative controls, which pass on both
  hooks and prove the allow did not widen: the same surface with the state unusable;
  `dev/backlogs/CANDIDATES.md.bak`; `dev/notes.md`; `.claude/aiwf-native/aiwf.config.json` and
  `roles.json`. Resolver rows (the exported `resolveTransferSurface` called directly, no hook run):
  a configured `src/app.ts`, `../x.md`, `C:/x.md`, `/abs/x.md`, `.claude/agents/writer.md`,
  `./.claude/agents/writer.md` each return `null` - the resolver rejects `path.win32.isAbsolute` AND `path.posix.isAbsolute` AND any
  `..` segment AND a first segment `.claude` on every platform - and with such a config a hook
  write to `dev/x.md` is denied - for which the hook gains what its siblings have (`plan-gate.js:426`,
  `pretooluse-dispatch-gate.js:250`, `pretooluse-git-verb-guard.js:496`): the `lib.runFailClosed`
  call at `:216` moves under `if (require.main === module)` and `module.exports = {
  resolveTransferSurface, isAllowlisted }` is added, so the selfcheck can `require` the resolver
  without running the hook. A row pins the deny text literal. One platform row whose expected
  decision is computed in the test from `process.platform` (`check()` rows have no `skipWhen`;
  that mechanism exists only on mutation controls, `:6545-6546`): with the surface configured
  `dev/backlogs/CANDIDATES.md`, a write to `DEV/backlogs/CANDIDATES.md` is denied on `linux` (the
  CI `ubuntu` leg proves it) and allowed on `win32`/`darwin`; a second platform row: a write to the
  literal target `dev\backlogs\CANDIDATES.md` is denied on `linux` (a different filename there)
  and allowed on `win32` (the separator form of the same file). A row per fixture config (configured, default
  `plansDir`, blank `plansDir`) asserts the hook's decision on the literal expected path written in
  the test - the rule is two lines and is copied from `generate.mjs:875-879`; a parity import is not
  attempted.
- `scripts/spike/run-spikes.mjs`: a plugin-only table beside `gate3ToggleCases` (`:189-193`, the
  `:170-173` comment says why not in `gate1Cases`) with a fixture carrying state + config.
- Doc homes of the allowlist sentence (D6 enumeration), every one rewritten to the SAME phrase
  `docs/**, .aiwf/** and root-level *.md, plus the transfer surface` so the closing grep hits each:
  `docs/LOOP.md:168`, `docs/WORKFLOW.md:586-593` (the `plansDir` sentence at `:591-593` gains the
  exception), `docs/OPERATOR_PROTOCOL.md:54-56`, `skills/mission/SKILL.md:81-82`,
  `skills/work/SKILL.md:76-77`, `skills/review/SKILL.md:480` (Step 2e - this one carries no
  allowlist sentence today and GAINS one: "Gate 3 holds the main session out of
  `{{config.paths.plansDir}}` - its drafts and readiness files - while a route is open; the
  allowlist is docs/**, .aiwf/** and root-level *.md, plus the transfer surface, which it may
  write"), `schema/aiwf.config.schema.json:257`, the hook `:30` and `:211`.
  Known hits NOT edited: `scripts/spike/README.md:77-80` (a captured transcript),
  `scripts/selfcheck/aiwf-selfcheck.js:1794` (a test label), `scripts/setup/generate.mjs:1099` (a
  comment on a root-level file). `CHANGELOG.md` is outside the pathspec.
- `CHANGELOG.md` `## [0.2.19]` entry (PLB-002 opens the block first - § Execution order).
Acceptance (run by the check agent, exact exit codes recorded):
- `node scripts/selfcheck/aiwf-selfcheck.js --plugin-root . --project-fixture .` exit 0, and the
  three allow rows seen FAIL on the pre-fix hook (the Writer records the red run);
- `node scripts/spike/run-spikes.mjs` exit 0; `node scripts/setup/test-setup.mjs` and
  `node scripts/update/validate-payload.mjs --plugin-root .` exit 0 (the diff touches `schema/` and
  `skills/`, overrides § Test policy rows); the provenance grep
  `git grep -nP "[\x{0400}-\x{04FF}]" -- docs skills templates scripts schema hooks migrations` exits 1;
- `git grep -n -i -E "root-level|root \`\*\.md\`|\.aiwf/\*\*" -- docs skills templates schema scripts hooks migrations examples CLAUDE.md README.md`
  (the whole payload plus the two root files; `.claude/` and `dev/` are the self-install and dev
  layers, rendered from or outside the payload) hits exactly these 11 files and no other: `docs/LOOP.md`, `docs/WORKFLOW.md`,
  `docs/OPERATOR_PROTOCOL.md`, `skills/mission/SKILL.md`, `skills/work/SKILL.md`,
  `skills/review/SKILL.md`, `schema/aiwf.config.schema.json`,
  `scripts/engine/pretooluse-mutation-guard.js`, `scripts/selfcheck/aiwf-selfcheck.js`,
  `scripts/setup/generate.mjs`, `scripts/spike/README.md` (at HEAD it hits 9 of them, missing
  OPERATOR_PROTOCOL and review - the rewrite to the common phrase is what makes them hit); a
  twelfth file is a missed home and fails the ticket.
Risk threshold: any allow beyond the resolved transfer surface, a writable config, or a change to
the unusable-state allowlist, blocks. Stop: the hook, the two suites, the doc homes.

**Completion record (CLOSED 2026-10-16, operator word „пускай 001", code commit `2cdda73`).**
- Actual changes: 11 files, 298 insertions / 32 deletions - the worklist as written. Hook:
  `readProjectConfig` (one reader, `null` on any failure) with `routeWriteGuardEnabled` refactored
  onto it; `resolveTransferSurface(config, projectDir)` (trimmed value or `<plansDir>/PNP_CANDIDATES.md`
  with the schema default `docs/backlogs`; refuses win32/posix-absolute, any `..` segment, a non-`.md`
  basename, a normalised first segment `.claude` - case-folded on win32/darwin, trailing dots and
  spaces stripped on every platform - and a value that resolves outside the project); `isTransferSurface`
  on host path identity with the win32/darwin case fold (the hooks' first `process.platform` branch);
  the extra allow and the deny-text clause only for a ticket state; entrypoint under
  `require.main === module` + `module.exports`. Selfcheck section 3b2 `sectionGate3Surface` (allow,
  deny, platform p1-p3, fallback and resolver rows, with a positive control and an entrypoint-guard
  pre-check); spike table `gate3SurfaceCases` (4 cases); the eight doc homes on the common phrase;
  CHANGELOG entry under 0.2.19.
- Deviations: (1) rows (iii) and (p2) of the plan are one platform row (same literal, same
  expectation); (2) an unreadable or non-object config yields no surface (D5's narrower allowlist,
  not the fallback); (3) `routeWriteGuardEnabled` takes the parsed config, read once per decision;
  (4) extra rows beyond the plan: a resolver positive control, a padded value, the refused surface
  written itself, the entrypoint-guard pre-check (requiring an unguarded hook would end the self-check
  process with exit 0), the fallback rows also pin the surface named in the deny text, and the spike
  table's config-file case; (5) the plan's "test label" hit is `aiwf-selfcheck.js:1797`, not `:1794`;
  (6) the trailing-dot/space fold was added in a pre-verdict micro-round from the Writer's own open
  question - two resolver rows, red before / green after.
- Verification (check agent, fresh `sonnet`, D4; Portion 1 as one parallel batch): `node
  scripts/selfcheck/aiwf-selfcheck.js --plugin-root . --project-fixture .` exit 0, 1290/1290 (and
  again on the final tree after the prose delta); `node scripts/spike/run-spikes.mjs` exit 0, checks
  330 / failures 0; `node scripts/setup/test-setup.mjs` exit 0, 502/0; `node
  scripts/update/validate-payload.mjs --plugin-root .` exit 0; provenance grep exit 1 (clean); the
  closing grep hits exactly the 11 files (9 at HEAD before the ticket). The Writer saw the new rows
  red on the pre-fix hook (10 rows, 1269/1279) and green after; the two micro-round rows likewise
  (1288/1290 -> 1290/1290).
- Review: fact-check gate over the diff 155 claims, 2 FALSE (a selfcheck comment calling the
  backslash-named root file "already root-level *.md" - `isAllowlisted` splits on backslashes
  everywhere; the review-skill Step 2e sentence stating Gate 3 holds plansDir closed unconditionally),
  both corrected in a prose-only micro-round before the pass; 6 UNVERIFIABLE (OS facts stated as
  such, the external spike reference, a process rule). Auditor pass 1 (Codex gpt-6-sol/xhigh, session
  `01a1431e-1fb0-78b3-8afb-fb833ebfb33a`): `pass`, no findings at the risk threshold; the stated
  residuals (symlink/junction, case-sensitive macOS volume, shell writes) remain. No correction round.
- Remaining: none blocking. `.aiwf/` holds only the live mechanics (route-state `{}`, the review
  brief, the session file, the checkpoint); the check agent's logs live in the session scratchpad -
  nothing to delete under the repo. `D:\pnp-live` refreshed after the record commit, so the new Gate 3
  is live for PLB-004 onward. Next ticket PLB-004 is routed cheap (Opus, D7): a FRESH session.

### PLB-002 - Update engine: CHANGES folder, `$schema` refresh, supersede duty; opens 0.2.19
COO: top, because check 1 (D7).
Source: CANDIDATES § "Прием от Silerax" items 1 and 3; § "`0011` supersede списъкът".
Problem: (a) `scripts/update/migrate.mjs:1559` composes `path.join(projectRoot,
\`CHANGES_${from}-to-${to}.md\`)` - hard-wired to the project root; both consumers move the file by
hand (as reported in CANDIDATES, not measured here). (b) `$schema` is written once by setup
(`scripts/setup/generate.mjs:1553-1557`, the live plugin root) and never by update -
`migrate.mjs:389-398` only strips it from the render context - so a consumer that only updated since
its first setup keeps a path into a stale plugin cache (the consumer reports `pnp\0.2.1\schema`).
(c) migration `0011` omitted one id from a `note` op's `supersedes` list (the consumer's report).
Outcome:
(a) a new key `paths.changesDir` (schema `paths` block `schema/aiwf.config.schema.json:301-330`,
`additionalProperties: false`; `type: string`, `minLength: 1`, `default: "."`, so a fresh config via
`collectDefaults` and every migrated config via the op keep today's location; an ABSENT key at
runtime reads as `"."`); the interview asks it after the `paths` questions
(`scripts/setup/interview.mjs:220-229`) as
`text('paths.changesDir', 'update: folder for the CHANGES_<from>-to-<to>.md reports, relative to the project root', { allowEmpty: true })`
(empty = the default). ONE containment rule for this key everywhere (pass-1 blocker 4):
`containedRelativePath(v)` exported from `scripts/setup/validate-config.mjs` (ESM; `migrate.mjs:88`
and `generate.mjs` already import that module - NOT from `scripts/engine/`, whose `aiwf-lib.js` every
hook and the plan gate load and whose every `*.js` name `scanSupersededLegacy` treats as a hook name,
`generate.mjs:744-749`) - true iff `v` is a non-empty string, `!path.win32.isAbsolute(v)`,
`!path.posix.isAbsolute(v)`, `!/^[A-Za-z]:/.test(v)` (drive-relative `C:x` is not win32-absolute
yet leaves the project on Windows), and `n = path.posix.normalize(v.replace(/\\/g, '/'))` is
neither `..` nor starts with `../` (so `a/../reports` -> `reports` is contained; `../x`,
`a/../../x`, `/x`, `C:/x`, `C:\x`, `C:x` - the six refused literals - are refused on EVERY
platform, including the CI `ubuntu` leg; seven literals with the accepted one). Consumers: setup's
containment loop (`scripts/setup/generate.mjs:1031-1036`) calls it for `changesDir` (the other four
keys keep their existing check - changing theirs is a behaviour change outside this plan);
`migrate.mjs` `runUpdate` right after the no-op branch and before `makeContext` (`:1485-1487`) and
the dry-run branch (`:1505-1512`) - NOT in `preflight`, which `--check` (`:1457-1459`, the version
interlock the eleven `/pnp:*` skills other than `update` and `selfcheck` run at Step 0) and
`--resolve` (`:1581-1582`) share and which must not refuse for a key they never use - -> `UpdateError` naming the key; the same point also refuses when the resolved
folder exists and is not a directory (`fs.statSync`), so the report write at `:1559` cannot fail
after every op is applied and journaled; the selfcheck row runs the rule through
`spawnSync(node, ['--input-type=module', '-e', ...])` importing the module by `pathToFileURL` (the
selfcheck is CJS, `aiwf-selfcheck.js:56-62`); the tests import it directly. `:1559` resolves
`<projectRoot>/<changesDir>/CHANGES_<from>-to-<to>.md` (`writeAtomic` `:234-239` creates the
folder). Carry-over needs no code (`generate.mjs:1004-1040` spreads `existing`); `aiwf-roles.mjs`
rewrites the config without this check and a hand-edited bad value is caught at the next update
run. `writeAtomic` holds no lock; one executing session per tree (`docs/WORKFLOW.md:965`) is what
rules out a second writer.
(b) one helper `schemaRef(pluginRoot)` = `toPosix(path.join(pluginRoot, 'schema',
'aiwf.config.schema.json'))` (the local `toPosix`, `:95`), and ONE refresh point that runs BEFORE
any op is planned or journaled and NEVER while a journal exists (pass-1 blocker 3: the first op's
pre/post hashes are taken at `:613` and the journal is written through `writeConfig` at `:996`, and
`configHash` includes `$schema` - `projectionText` at `:195-202` drops only `migrationJournal` - so
a refresh inside `writeConfig` would leave a crashed run
with a hash matching neither journal value, and a refresh at the top of a RESUMED run would do the
same to a journal written by the earlier run): `refreshSchemaRef(configFile, config, pluginRoot,
dryRun)` - when `config.$schema !== schemaRef(pluginRoot)`: assign in place and, unless `dryRun`,
`writeAtomic(configFile, jsonText(orderConfig(config)))`, outside the journal; return `{from, to}`
or `null`. It is called ONCE, in `runUpdate` after `preflight` returns `{configFile, config,
pending, journal}` (`:1473-1477`) and only when `journal === null` - after the no-op branch's own
`if (journal) throw` (`:1479`) for the no-op case, and before the no-op return and before
`makeContext` for the apply case - so a resumed run keeps its journal's hashes and refreshes on the
next clean run, and every hash of a clean run is over the refreshed config. `--resolve`
(`resolveArtifact`, `:1581`) does NOT refresh; `writeConfig` (`:891-893`) does NOT touch `$schema`.
`$schema` is engine bookkeeping like the `_aiwf.*` stamps - both excluded from op paths
(`validate-payload.mjs:160`) - not a fifth op. The no-op branch returns `{current: true,
schemaRefreshed}`; `aiwf-update.mjs` (`:198-215`) then prints `refreshed $schema: <from> -> <to>`
followed by `nothing else was written` (instead of its plain "Nothing was written", `:199`) and
runs the integrated self-check as a WRITING run does (`finishWithSelfCheck` with `wouldRun: true`,
`:157`), because the config changed on disk (pass-2 blocker 2); `skills/update/SKILL.md:104`
("an already-current run writes nothing") gains "- except a stale `$schema`, which it refreshes,
says so, and self-checks". On the apply path `assembleChanges` (`:1320`) takes the same optional
value and prints the same line into the report. `test-update.mjs:306-318` (no-op = zero diff, same
root) still holds. Three `$schema` tests (pass-2 blocker 3): (i) `$schema: stale value on an
already-current project is refreshed, the two lines print, the self-check runs` - install from A,
update from B when nothing is pending; (ii) `$schema: crash after the first journal write, resume
completes without touching $schema` - install from B, update from B with a crash injected after the
first journal write (the suite's crash-injection pattern, `test-update.mjs:1010`), resume from B;
(iii) `$schema: a journal written under another root is resumed without a refresh, and the next
clean run refreshes` - install from A, write a journal fixture by hand exactly as the engine would
after the first op (stored `$schema` still A's, `preHash`/`postHash` computed over A's config by
the suite's helper), resume from B: no refresh, the hashes match, the update completes with `$schema`
still A's; a following clean run from B refreshes to B's and prints the line. The `$schema` description
(`schema/aiwf.config.schema.json:21-24`, "written by /pnp:setup ... harmless") says update refreshes
it.
(c) `migrations/README.md` gains the authoring step for a migration that RE-renders an existing
region with new sentences: before it lands, grep the region's new sentences against every
consumer-local duplicate its NOTES.md names, and the `supersedes` list equals that grep's hits
(0023's only render op CREATES `AGENTS.md`, a new file with no consumer-local duplicate to
supersede, so its NOTES.md says so and carries no list); `:88` (which today names only
`CHANGES_<from>-to-<to>.md`) gains "under `paths.changesDir`, the project root by default".
(d) the release opens (D3): `migrations/0023_changes-dir-and-agents/ops.json` with
`add-config-key` `{path: "paths.changesDir", default: ".", askOperator: false}` (shape
`migrations/0004_audit-table/ops.json:5-10`) and the `note` op; `NOTES.md`; the manifest entry;
`.claude-plugin/plugin.json` `0.2.19`; `CHANGELOG.md` `## [0.2.19] - <commit date>` block opened
between the preamble (`:3-5`) and `## [0.2.18]` (`:7`) with this ticket's entries.
Worklist: the files above plus `skills/update/SKILL.md:122` ("at the project root" -> the configured
folder); `examples/example-project/README.md:103` (same sentence); `scripts/ci/run-example-cycle.mjs:585`
unchanged (a comment on the line above it: the example config keeps the default, so the report is
read at the root); `scripts/selfcheck/aiwf-selfcheck.js` beside `:5456-5461`: a `path-changesDir` row (when present:
`containedRelativePath` true, evaluated through the `spawnSync` import above) with a negative
control (fixture config `changesDir: "../x"`) and a positive fixture `changesDir: "a/../reports"`
that passes; `scripts/setup/validate-config.mjs`: `containedRelativePath` + a `test-setup.mjs` unit
test over the seven literals above;
`scripts/update/test-update.mjs`, seven tests with these labels, each pasted red before the fix:
`changesDir: report lands in the configured folder, none at the root` (`changesDir: "reports"`),
`changesDir: default keeps the report at the root`, `changesDir: ../x, C:/x, C:x and /x are refused before
any op runs, on every platform; a/../reports is accepted; a changesDir that is an existing FILE is
refused`, `changesDir: --check and --resolve are not refused by a bad value`, `$schema: rewritten on apply when the
update root differs from the install root`, `$schema: no-op run rewrites a stale value and leaves a
fresh one byte-identical` (two roots in one test), and the three `$schema` tests (i)-(iii) named in Outcome (b) in place of the two
`$schema` labels above (nine tests in all); `scripts/setup/test-setup.mjs:230` stays a suffix pin.
Acceptance: `node scripts/update/test-update.mjs`, `node scripts/update/validate-payload.mjs
--plugin-root .`, `node scripts/setup/test-setup.mjs`, `node scripts/ci/run-example-cycle.mjs` all
exit 0 before the commit; the new tests seen red before the fix (the Writer pastes the red run with
the labels above); `node scripts/selfcheck/aiwf-selfcheck.js --plugin-root . --project-fixture .`
exit 0 is the DEFERRED item run after the D10 self-update (red before it on `version-stamp`,
`aiwf-selfcheck.js:5445-5447`): this ticket's completion record, written right after its code
commit, states it as "deferred to the D10 self-update, result in PLB-003's record" - an explicit
exception to the Test policy row for the pre-commit run; PLB-003's record carries the result for
both tickets. Risk threshold: a
fifth op, a changed default location, an uncontained `changesDir` that writes, or a `$schema` write
that is not idempotent blocks. Stop: (a)-(d) and their tests.

**Completion record (CLOSED 2026-10-15, operator word „da", code commit `3c1c314`).**
- Actual changes: 18 files, 525 insertions / 18 deletions - the worklist as written. `containedRelativePath`
  in `scripts/setup/validate-config.mjs`, consumed by `generate.mjs` (planInstall, after the four-key
  loop), `migrate.mjs` (`changesFolder` in `runUpdate`, after the no-op branch and before the `$schema`
  refresh and `makeContext`; also refuses an existing non-folder) and `aiwf-selfcheck.js` (row
  `path-changesDir` via a `spawnSync` ESM import, negative control `../x`, positive fixture
  `a/../reports`); `schemaRef` / `refreshSchemaRef` / `schemaRefreshLine` in `migrate.mjs`, called on
  the no-op path and on the apply path only when `journal === null`; `aiwf-update.mjs` prints the two
  lines and self-checks on a no-op refresh; `assembleChanges` writes the line first under `## Applied`;
  migration `0023_changes-dir-and-agents` (`add-config-key` + `note`; the AGENTS.md render op is
  PLB-003's), `plugin.json` 0.2.19, CHANGELOG `## [0.2.19] - 2026-10-15` opened; test-setup section
  25, test-update section 17 (nine labels), the three doc homes.
- Deviations: (1) the plan's "already current writes nothing" sentence sits at
  `skills/update/SKILL.md:106-107`, not `:104`; the same sentence in the `aiwf-update.mjs` header
  (`:21-22`) was updated too. (2) The suite has no config-hash helper, so test (iii) builds the journal
  fixture with the engine's exported `configHash`. (3) Test (ii) and the resume half of (iii) cannot be
  red against the old engine (it never wrote `$schema`); they are regression guards, and (iii) is the
  one that discriminates a refresh inside `writeConfig`. (4) The existing section-8 case (a refused
  `add-config-key` from a DIFFERENT payload root) now sees the config written, because the refresh runs
  before the refused op exactly as Outcome (b) orders; its assertion became `and the $schema refresh to
  the attempted payload root was the ONLY write` (config differs only in `$schema`, new value ==
  `schemaRef(attempted root)`, nothing else on disk changed), and the `refreshSchemaRef` doc comment and
  NOTES.md state that an update refused at a later operation keeps the refreshed pointer. (5) Drive-letter
  test literals are composed from a `DRIVE = 'C:'` constant so the self-check's provenance regex does not
  read them as absolute paths.
- Verification (check agents, fresh `sonnet`, D4): `node scripts/update/validate-payload.mjs
  --plugin-root .` exit 0 (23 migrations, payload 0.2.19); `node scripts/setup/test-setup.mjs` exit 0,
  493/0; `node scripts/update/test-update.mjs` exit 0, 614/0 on the final tree (14m23s); `node
  scripts/ci/run-example-cycle.mjs` exit 0, 47/0; provenance grep exit 1 (clean). The new tests were
  seen red before the implementation (test-setup section 25: 10 of 11 red; test-update section 17: 9 of
  9 red) and green after. `node scripts/selfcheck/aiwf-selfcheck.js --plugin-root . --project-fixture .`
  was run informationally: 1260/1261, the ONLY red being `installedPluginVersion equals the payload
  version` (installed 0.2.18, payload 0.2.19) - the acceptance item is DEFERRED to the D10 self-update,
  result in PLB-003's record; `path-changesDir`, its control and fixture, and the provenance section PASS.
- Review: fact-check gate over the diff 111 claims, 0 FALSE, 4 UNVERIFIABLE (the AGENTS.md sentences of
  the 0023 note = PLB-003's half; the historical 0011 omission). Auditor pass 1 (Codex gpt-6-sol/xhigh):
  `fail`, 2 blockers - the narrowed section-8 assertion passed when nothing was written (vacuous), and
  the full test-update exit 0 was not yet shown. Correction round 1 (of 2): 6 test lines in
  `test-update.mjs` section 8 (already audited), the instrument made to fail against HEAD's engine in a
  scratch copy (`changed []`) and green on the tree; fact-check over the delta 15 claims, 0 FALSE; the
  COO read the hunk first-hand. No verification pass: WORKFLOW § Loop shape suppression dual (<= ~10
  lines, audited file, red-before-fix, no routing-check-1 surface). No second auditor pass.
- Remaining: none blocking. `README.md:22` still says v0.2.18 - correct until the release; it moves to
  0.2.19 in PLB-006's durable half. `D:\pnp-live` deliberately NOT refreshed after this commit and its
  record commit (D10).

### PLB-003 - The Codex auditor's instruction file is rendered, not hand-written
COO: top, because check 1 (D7).
Source: CANDIDATES § "Прием от Silerax" item 2; evidence `D:\Stratex\AGENTS.md` (consumer,
read-only).
Discovery (facts): the wrapper runs `codex exec -C $ProjectRoot` (`scripts/native/ps/codex-review.ps1:174`;
`scripts/native/sh/codex-review.sh:190`), passes no flag that disables project docs (grep
`project_doc|AGENTS` over `scripts/native/`: 0 hits) and loads the user config (`:166-167`). That
Codex then reads `<projectRoot>/AGENTS.md` is Codex's documented behaviour, NOT a fact of this tree:
the installed binary carries the strings `AGENTS.md`, `project_doc_max_bytes`,
`project_doc_fallback_filenames`, and the consumer wrote the file because the auditor reads it - held
as "observed, not executed here". The user-level `~/.codex/AGENTS.md` exists and is empty. The
consumer's file is 272 hand-written lines; the staleness is at its L32-34, three doctrine paths
pinned to `.../cache/promptandpray/pnp/0.2.16/docs/...`, with a fallback sentence at L37-38 telling
Codex to substitute `_aiwf.installedPluginVersion`. The payload mentions `AGENTS.md` once, in a
comment (`scripts/engine/pretooluse-mutation-guard.js:99`); nothing renders it.
Problem: a doctrine path with a version segment goes stale on every update, and nothing of PnP's
reaches the Codex auditor except the brief on stdin.
Outcome: a managed artifact `AGENTS.md` at the project root, rendered from
`templates/AGENTS.md.tmpl` by setup (`addArtifact`, `scripts/setup/generate.mjs:1150-1175`; the
two-hash stamp `:1191-1196`) and by update (`rerender-managed-region`; required fields `op`,
`file: "AGENTS.md"`, `region: null`, `template: "templates/AGENTS.md.tmpl"`, plus the optional
`createIfAbsent: true` - `scripts/update/validate-payload.mjs:131-135`, `:394-395`). What happens
to a consumer's hand-written file is the engine's existing creation rule, stated here as it is: a
file whose bytes equal the render is stamped (`migrate.mjs:653`); any other file makes the update
REFUSE with `UpdateError` ("an update never adopts a file it did not write; move it aside or remove
it", `:119-120`, thrown `:648-653`) and stop - no dialog, no overwrite; a plain setup re-run blocks
on `unrecordedArtifact` (`generate.mjs:1214-1217`); only `/pnp:setup --adopt` offers take-new /
keep-mine through `adoptDecide` (`:1278-1297`). The `note` op of `0023` carries that sentence to the
operator's CHANGES report, `NOTES.md` and the CHANGELOG entry repeat it, and the AGENTS.md op is the
LAST op of `0023` (D3).
Per D8 the text states only what is version-free. Template contract (`templates/AGENTS.md.tmpl`,
ASCII, LF, no region markers - a whole-file artifact; every `{{...}}` path under `config.`, the
context root, `generate.mjs:290-309`), exactly these sections in this order:
1. `# AGENTS - <project name>` with `{{config.project.name}}`;
2. `## Who reads this` - two fixed sentences: "This file is read by the Codex-hosted auditor that
   PromptAndPray dispatches with `codex exec -C <project root>` under a read-only sandbox. The
   auditor reads and reports; it never edits, commits or pushes.";
3. `## Where the contract is` - one fixed sentence: "The brief on stdin is the contract: it names
   the review checklist and the verdict vocabulary of the pass; nothing here overrides it." (no
   verdict words appear in the file: the review, QA and readiness modes use three different sets -
   the review brief pastes `docs/REVIEW_CHECKLIST.md` by absolute path, `skills/review/SKILL.md:174-185`,
   and the QA brief names the same file, `skills/qa/SKILL.md:191`);
4. `## Where the project's canon is` - a bullet list of project-relative paths:
   `{{config.paths.overridesDoc}}`, `.claude/aiwf-native/aiwf.config.json`,
   `.claude/aiwf-native/roles.json`, `CLAUDE.md`.
Nothing else: no product boundary checks (they are the Reviewer's and stay in the reviewer agent
and the review brief - D8), no `{{#each}}` block, no verdict words. The only template variables are
`config.project.name` and `config.paths.overridesDoc`, both present in every config (schema
`required`). The file reaches QA runs too (`scripts/native/ps/codex-qa.ps1:158`, `codex-qa.sh:172`),
which is why it carries nothing role-specific. The resume
form of the wrapper (no `-C`) reuses a session that already read the file - Codex-internal, left as
it is. The consumer's hand-written `WORKFLOW.md`/`LOOP.md` pointers are not reproduced: the
auditor's contract is the brief, and D8 forbids the path that would carry them.
Worklist: `templates/AGENTS.md.tmpl` (new, the contract above); `scripts/setup/generate.mjs`
artifacts list beside `:1157-1164` (unconditional) and `ownedDestinations` (`:1072-1089`) so a
transfer surface configured as `AGENTS.md` is refused; `scripts/update/migrate.mjs`
`RESOLVABLE_ARTIFACT_TEMPLATES` (`:178-185`) entry for `AGENTS.md` and the selfcheck needle list
for it (`scripts/selfcheck/aiwf-selfcheck.js:2066-2070`); `aiwf-selfcheck.js` `managed-regions-cover`
expected set `:5423-5428`, the fixture builder's key list `:621` and `put()` files `:579-600` so the
`selfAuthored` runs carry the artifact, a negative control "AGENTS.md record deleted" beside
`:8111-8120`, and the ORCHESTRATOR op fixture at `:2157` read and left as it is;
`scripts/setup/test-setup.mjs:243` (the 5-key list becomes 6) and its adopt inventory tests
(`~:1082-1985`, read; changed only where they enumerate the artifact set) plus one new case: a
foreign `AGENTS.md` on a fresh install is a blocker and the file is untouched;
`scripts/update/test-update.mjs` section 15 (from `:1997`): two cases over the AGENTS.md op - empty
ground (after `install()` the test deletes the file AND its `managedRegions` record, then updates:
created and stamped `upstream == local`) and a foreign file (refused, file untouched);
`scripts/ci/run-example-cycle.mjs` beside `:583-630`: assert the key `AGENTS.md` is recorded after
the cycle; `migrations/0023_changes-dir-and-agents/ops.json` (the op appended last) + `NOTES.md`
paragraph; `docs/CODEX_REVIEW_QA_RECIPE.md`: a new last section `## The project's AGENTS.md` - one
sentence: setup and update render it from `templates/AGENTS.md.tmpl`, it names no version and no
plugin path, and a hand-written file at that path blocks the update until moved aside;
`skills/setup/SKILL.md:43-47` (the adopt surface gains the file) and `:124-127` and
`scripts/update/README.md` where they enumerate managed artifacts; `CHANGELOG.md` entry, which
tells a consumer with a hand-written `AGENTS.md` (the consumer this ticket comes from has one) to
move it aside BEFORE `/pnp:update` - otherwise the update refuses at the third op with the first
two journaled, and `--check` stays red (the eleven interlocked `/pnp:*` skills blocked; `update` and
`selfcheck` still run) until the file is moved and the update re-run.
Acceptance: `setup-suite`, `update-suite`, `validate-payload`, `example-cycle-windows` exit 0 before
the commit (the POSIX cycle is CI's after the push, overrides § Test policy); the new tests pasted
red before the change with their labels; in Git Bash (D4):
`grep -c -E "[0-9]+\.[0-9]+\.[0-9]+|[A-Za-z]:[\\/]|pass-with-notes|NEEDS-FIX|BLOCKED|productBoundaryChecks|#each" templates/AGENTS.md.tmpl`
prints `0` and exits 1 (no hit) while `grep -c "## Who reads this" templates/AGENTS.md.tmpl` prints
`1` (plain `grep`, so the still-unstaged file is read; the positive control hits); `node scripts/selfcheck/aiwf-selfcheck.js
--plugin-root . --project-fixture .` exit 0 is the DEFERRED item after the D10 self-update, together
with: `AGENTS.md` exists at the root and
`node -e "const m=require('./.claude/aiwf-native/aiwf.config.json')._aiwf.managedRegions['AGENTS.md'];process.exit(m&&m.upstream===m.local&&m.override===false?0:1)"`
exits 0. Risk threshold: a write over an operator-owned file, a version, an absolute path or a
verdict word in the template, blocks. Stop: template, render, resolve map, migration op, the four
suites + the deferred selfcheck.

**Completion record (CLOSED 2026-10-15, operator word „пускай", code commit `4b8f83a`).**
- Actual changes: 12 files, 214 insertions / 11 deletions. `templates/AGENTS.md.tmpl` (new; a
  `<!-- TEMPLATE CONTRACT -->` block the engine strips, then exactly the four D8 sections, two
  placeholders); `generate.mjs` `CODEX_AGENTS_REL`, an `ownedDestinations` row, the unconditional
  `addArtifact` after the Orchestrator one, and - from the Reviewer's blocker - a refusal in
  `planInstall` when `paths.overridesDoc` is the same path as ANY other owned destination (generic, not
  AGENTS.md-only; `ORCHESTRATOR.md` is not in that list, see Remaining); `migrate.mjs`
  `RESOLVABLE_ARTIFACT_TEMPLATES['AGENTS.md']`; 0023 gains the `rerender-managed-region` /
  `createIfAbsent` op LAST (D3) and a NOTES.md bullet; selfcheck cover set, fixture, needle and the
  negative control "AGENTS.md rendered but not recorded"; example cycle asserts the artifact recorded
  clean; tests `[setup-agents-1..6]`, `[update-agents-0..5]` (faces 11/12 of section 15, the SHIPPED op
  read from the real ops.json); docs: RECIPE § The project's AGENTS.md, setup skill adopt/blocker
  wording, CHANGELOG entry.
- Deviations: (1) CHANGELOG says "ten interlocked `/pnp:*` skills" where the plan said eleven - the
  tree has eleven skills carrying the `--check` call minus `update` = ten (fact-checked). (2)
  `scripts/update/README.md` enumerates no managed artifacts, so it has no change. (3) Pointers were
  re-anchored at `0d9e28f` before the brief by a sonnet scan (41 pointers, 13 shifted, 0 false) - the
  cost of `file:line` in a multi-ticket plan, taken to the FOLD candidate.
- Verification (check agents, fresh `sonnet`, D4; final tree): `node scripts/setup/test-setup.mjs`
  exit 0, 502/0; `node scripts/update/test-update.mjs` exit 0, 623/0; `node
  scripts/update/validate-payload.mjs --plugin-root .` exit 0; `node scripts/ci/run-example-cycle.mjs`
  exit 0, 48/0; provenance grep exit 1. New tests seen red before (setup slices 9 red of 172, update
  slice 6 red of 82; round-1 case red before its fix) and green after. Git Bash: the forbidden-pattern
  grep over the template prints 0 / exit 1; `## Who reads this` count 1.
- Review: fact-check gate over the diff 78 claims, 0 FALSE, 5 UNVERIFIABLE (rhetorical). Auditor
  pass 1 (Codex gpt-6-sol/xhigh): `fail`, 1 blocker - `paths.overridesDoc = AGENTS.md` planned two
  writes to one path with no refusal (the record would hold the first hash, the second write wins) -
  and 1 note (RECIPE sentence: a file equal to the render is recorded without a write). Correction
  round 1 (of 2): 10 code lines in `generate.mjs` (audited file), 10 test lines (`[setup-agents-6]`,
  red before / green after), 2 prose lines; fact-check over the delta 19 claims, 0 FALSE; COO read the
  hunks. No verification pass: operator word „без пас" (2026-10-15) on the COO's recommendation that
  the suppression dual holds (10 code lines, audited file, red-before-fix test).
- D10 self-update (this repo, first consumer proof of 0023): `D:\pnp-live` refreshed to `4b8f83a`;
  `/pnp:update` dry run then `--apply` on the operator's word „да": `$schema` refreshed to the
  pnp-live path, `paths.changesDir = "."` added, the note, `AGENTS.md` created and recorded; installed
  0.2.19, `--check` green. The integrated self-check went RED on provenance: the report's new
  `$schema` line carries two drive-letter paths and the report sat at the repo root, which the scan
  reads as payload (the four PROVENANCE CONTROL rows are the cascade of the same file in the control
  copy). Resolution (COO, this repo's own layer): `paths.changesDir = "dev/changes"` - `dev/` is
  outside the payload by design - and the report moved there; the real selfcheck then:
  `node scripts/selfcheck/aiwf-selfcheck.js --plugin-root . --project-fixture .` exit 0,
  **1262/1262** - the DEFERRED acceptance item of PLB-002 and PLB-003, both closed. The 21 earlier
  `CHANGES_*.md` stay tracked at the root (history; a candidate names the split).
- Remaining: none blocking. Candidates recorded: `ORCHESTRATOR.md` is not in `ownedDestinations`;
  the root `CHANGES_*.md` history vs `dev/changes/`; the plan layout (tickets section immutable,
  records after it; worklist by symbol, `file:line` born in the brief). `README.md:22` moves to
  0.2.19 in PLB-006. From this commit on `D:\pnp-live` is refreshed after every commit again.

### PLB-004 - Three small defects, one Writer, sequential
COO: cheap (Opus), because all four no - ruling 2026-10-15 on check 2 (D7).
Source: CANDIDATES § "`--show` на aiwf-roles.mjs печата таблицата и излиза с process.exit(0)",
§ "Третият дом на изброяването", § "От Silerax UIR-003" (outputDir under a traced app root).
(b) and (c) both edit `scripts/selfcheck/aiwf-selfcheck.js` (different functions), so one Writer.
Outcome:
(a) `scripts/setup/aiwf-roles.mjs:722-725`: the `--show` branch prints and sets `process.exitCode = 0`,
and the write path (`:727-754`) moves into an `else` branch - today that path is unreachable only
because of the `exit(0)` at `:724`; a bare `exitCode` would run `planRoles`/`applyRoles` and print
the table twice (`:746-749`). The pin entry for `aiwf-roles.mjs` in `scripts/setup/test-setup.mjs:962-963`
gains `absent: ['process.exit(code);', 'process.exit(0);']`, with a control beside `:1015-1038`
labelled `roles-show-exit-zero` that injects `process.exit(0);` into the fixture and expects the
violation (the FIXTURE is built from `present` only, `:1004-1009`, so without the control the new
`absent` entry passes vacuously). Error exits `:708` and `:757` stay. `validate-config.mjs:313` and
`validate-payload.mjs:479` are NOT in this ticket: their `exit(0)` sits mid-block before an error
path, so the change there is structural and belongs to its own candidate.
(b) `scripts/selfcheck/aiwf-selfcheck.js`: a structural pin `doctrine-role-boundaries-structure`
beside `doctrine-shipped-commands-structure` (`:6395-6408`; readers `:6342-6352`; literal
`:6339-6340`): the `## Role boundaries` section of `docs/LOOP.md` (`:38` to the next `## `, `:126`)
carries exactly these top-level bullets, read as the bold text before ` /` or the whole bold text:
`COO`, `Writer`, `Reviewer`, `QA`, `QAL`, `Arbiter`, `Operator` (the section's roles - the Arbiter
bullet itself says it is not a loop role, and it is still a bullet the pin holds); compared both ways;
continuation lines and the non-bullet paragraphs (`:106-125`) do not count. Negative controls in
`DOCTRINE_CONTROLS` beside `:6517-6527`: `loop-role-bullet-removed` (a `doctrineFile` function that
cuts the whole multi-line `QAL` bullet, `:6440-6445`) and `loop-role-bullet-stranger` (adds
`- **Scribe** - ...`).
(c) one ESM helper `scripts/setup/e2e-trace-note.mjs` (under `scripts/setup/`, beside its first
consumer; `scripts/engine/` is the hooks' directory - its `*.js` names are hook names to
`scanSupersededLegacy`, `generate.mjs:744-749` - and a setup/selfcheck helper does not belong there)
exporting
`tracedOutputDir(projectRoot, e2e)`
(true when `e2e && e2e.enabled === true`, `path.resolve(projectRoot, e2e.cwd, e2e.outputDir)` is
under `path.resolve(projectRoot, e2e.cwd)`, and that cwd directory holds a file matching
`next.config.*`; false for an absent `verify`/`e2e`, `enabled: false`, or no such file) and the fixed
sentence `E2E_TRACE_NOTE` = "verify.e2e.outputDir sits under verify.e2e.cwd, which holds a
next.config.* - a traced build may copy the whole E2E output into the standalone bundle; point
outputDir outside the app root or exclude it from tracing". `outputDir` is cwd-relative because the
runner is run FROM `cwd` (`skills/qa/SKILL.md:100-104`). Consumers: `aiwf-selfcheck.js`
`projectLayerFindings` (`:5146` ff.) evaluates the predicate through
`spawnSync(node, ['--input-type=module', '-e', ...])` importing the module by `pathToFileURL` (the
selfcheck is CJS) and adds `addObservation('e2e-outputdir-traced', E2E_TRACE_NOTE)` (the
function-local helper at `:5150`, printed as `[NOTE]` by `observation()`, `:113-116`, asserting
nothing); `scripts/setup/interview.mjs` (`:208-214`) imports it and writes the same sentence through `out.write`
after the `outputDir` answer when `projectRoot` is given and the predicate holds (the
`--answers-file` path, `:291-296`, skips the interview and is covered by the self-check that follows
every install).
(d) `CHANGELOG.md` entries for (a)-(c).
Acceptance: `selfcheck`, `setup-suite`, `validate-payload`, `claude plugin validate .` exit 0; (a)
in Git Bash (D4), two commands: `node scripts/setup/aiwf-roles.mjs --show --project-root . --plugin-root . > "<session scratch dir>/show.txt"`
(the absolute scratch path of the check agent's session, written out literally in its brief - never
`$TMP`, which Git Bash resolves to `/tmp`) with its own exit code recorded as 0, then
`grep -c "role/class" "<session scratch dir>/show.txt"` prints `1`, and
`git diff --exit-code -- .claude/aiwf-native/aiwf.config.json` exits 0 afterwards; the
`roles-show-exit-zero` control seen red; (b) the two controls seen red;
(c) fixture rows in the selfcheck, in a fixture of their own - NOT the S6 fixtures, whose
observation count is pinned at exactly four (`o.grew !== 4`, `:5685-5686`) and which stay free of a
traced e2e: `cwd: "app"`, `outputDir: "test-results"` + `app/next.config.js` -> the `[NOTE]` line
present; the same without `next.config.js`, with `enabled: false`, and with no `e2e` key -> absent; a scripted `runInterview` case in `test-setup.mjs` with a `projectRoot` holding
`app/next.config.js` sees `E2E_TRACE_NOTE` in `out`. Risk threshold: a changed exit code of any
script, or a note that becomes a failure, blocks. Stop: (a)-(d).

**Completion record (CLOSED 2026-10-16, operator word „пускай", code commit `1b2045f`).**
- COO routing: run on the TOP COO (Fable, this session) instead of D7's cheap COO - operator word
  „пускай" after „новата сесия струва 180К пейлоад" (2026-10-16): the start-up cost of a fresh session
  outweighed the top-tier premium on a three-defect ticket. Writer and audit table unchanged.
- Actual changes: 7 files, 258 insertions / 33 deletions. (a) `aiwf-roles.mjs` `--show` sets
  `process.exitCode = 0` and the write path sits in the `else`; the setup suite's pin gains
  `'process.exit(0);'` in the aiwf-roles `absent` array (the entry already carried `absent`) with the
  control `roles-show-exit-zero`. (b) selfcheck pin `doctrine-role-boundaries-structure` (readers
  `roleBoundaryNames` / `DOCTRINE_ROLE_BOUNDARIES`; a missing role, a stranger bullet AND a duplicate
  bullet fail) with three controls `loop-role-bullet-removed` / `-stranger` / `-duplicate` through a
  shared `afterOperatorBullet` helper. (c) new `scripts/setup/e2e-trace-note.mjs` (`tracedOutputDir`,
  `E2E_TRACE_NOTE`); selfcheck `e2eTraceNote` child-process evaluation + `addObservation(
  'e2e-outputdir-traced', ...)` in `projectLayerFindings`, own section `sectionE2eTraceObservation`
  (T1-T4); interview prints the note after the outputDir answer on the effective values when
  `projectRoot` is given; test-setup section 12d (two scripted runs); `scripts/setup/README.md` row.
  (d) CHANGELOG: two `### Added` entries, one `### Fixed`.
- Deviations: (1) labels and comments say `"## Role boundaries"` instead of `§` (ASCII payload);
  (2) the selfcheck rows are their own section after `sectionDraftsObservations`, read through the
  real `projectLayerFindings` outside `captured()`; (3) the predicate child is spawned only when
  `cfg.verify.e2e` is truthy; (4) beyond the plan, from the Writer's handoff questions: the README
  row and the duplicate-bullet check + control (COO decision, same ticket); (5) the plan's "test
  label" pointer and the test-setup/selfcheck line numbers were re-anchored by a sonnet scan before
  the brief (test-setup +47, selfcheck +160..170).
- Verification (check agent, fresh `sonnet`, D4; Portion 1 as one parallel batch, ~13 min): `node
  scripts/selfcheck/aiwf-selfcheck.js --plugin-root . --project-fixture .` exit 0, 1298/1298; `node
  scripts/setup/test-setup.mjs` exit 0, 505/0; `node scripts/update/validate-payload.mjs --plugin-root .`
  exit 0; `claude plugin validate .` exit 0 (one pre-existing warning about root CLAUDE.md); Git Bash:
  `--show` redirected exit 0, `grep -c "role/class"` = 1, `git diff --exit-code --
  .claude/aiwf-native/aiwf.config.json` exit 0; provenance grep exit 1; the new file has no non-ASCII
  byte (`LC_ALL=C grep -n "[^[:print:][:space:]]"` exit 1). Red before / green after (Writer): the
  roles control (`saw []`), section 12d (`no such line`), selfcheck T1 with the wiring disabled
  (1296/1297); the three doctrine controls report `sabotage detected ... FAIL as required`.
- Review: fact-check gate over the diff 84 claims, 0 FALSE, 8 UNVERIFIABLE (Next.js tracing and
  Node's process-I/O note - external, stated as such; one rationale sentence). Auditor pass 1 (Codex
  gpt-6-sol/xhigh, session `01a1435c-65af-7b93-8e79-a744772e1102`): `pass-with-notes`, no blockers;
  two notes - the `--show` CHANGELOG entry sits under `### Fixed` (the COO's two briefs disagreed;
  `Fixed` is right, kept) and the controls comment said "one control per direction" with three
  controls (one comment line rewritten before the commit, no rerun). No correction round.
- Remaining: none blocking. `.aiwf/` holds only the live mechanics; the check agent's logs are in the
  session scratchpad. `D:\pnp-live` refreshed after the record commit. Next: PLB-005 (cheap COO by
  D7) - the operator decides the session at its word; the ticket gains the measurement step below.

### PLB-005 - English where it is read every session
COO: cheap (Opus), because all four no - ruling 2026-10-15 on check 2 (D7).
Source: operator rule 2026-10-15 (overrides § Communication, "English everywhere in the tree").
Outcome:
- `dev/PROJECT_OVERRIDES.md`, the bullet "Чекпойнт по гейтове и таван на контекста" in § Loop shape
  (HARD-024; `:335-351` at r3), in English; verbatim inside it: the operator quote
  `„да, впиши го в overrides“` and the checkpoint heading `„След компресиране направи“`; the
  cross-references to CANDIDATES § „Таван на контекста“ keep that Bulgarian title because that
  section is `[ОТЛОЖЕН]` and is not translated. Each Bulgarian span is kept on ONE line (no wrap
  inside `„...“`), so the acceptance grep below matches it whole. Three other Cyrillic lines stay by
  design: `:196` (a quoted PLAN_HARD heading, „Ред и гейтове“) and `:263-264` (the role names
  „Колега“ / „Одитор“, which are config values).
- `dev/backlogs/CANDIDATES.md`: every OPEN `##` section - a title without a `[ПУСНАТ ...]`,
  `[ЗАТВОРЕН ...]` or `[ОТЛОЖЕН ...]` prefix: 20 content sections at r3 (one of them, "Direction
  2026-10-15", already English; the three "Бележка"/"Отхвърлени" sections included) - in English,
  title and body; the first line under each translated title reads `(was: „<old title>“)` so every
  citation by the old title in the tree (`PLAN_HARD.md`, `readiness/*`, this plan) still greps; the
  prefixed sections and the existing rows of the four ledger sections (Ruling, Pass statistics, Event,
  D2 pointer rows) are untouched; new rows there are English by the rule.
- Quote convention (the equivalence scan's definition): every `„...“` span and every `"..."` span
  attributed to the operator in a translated section is copied byte-for-byte, with the English reading
  after it in parentheses where the sentence needs one; everything else is translated.
- This ticket is the "unless the ticket says otherwise" of overrides § Hard rules (`:71-72`: "`dev/`
  and the self-install layer (`.claude/`, root `CLAUDE.md`) are R1 docs unless the ticket says
  otherwise"): it says otherwise -
  `dev/` through the Writer, R2 docs class. No auditor: the COO reads the delta first-hand BEFORE
  the Writer's commit, and one `sonnet` equivalence scan over `git show HEAD:<file>` (HEAD = the
  commit's parent, the scan runs before the commit) vs the worktree returns, per translated
  section: the `„...“` spans before/after with any that differs, and the Cyrillic lines after that
  are neither inside a span nor a `(was:)` line (expected 0).
Acceptance (the Writer records the 19 old titles in its handoff; the check agent runs these in
Git Bash, D4):
- `git grep -n -P "[\x{0400}-\x{04FF}]" -- dev/PROJECT_OVERRIDES.md | grep -v -E "Ред и гейтове|Колега|Одитор|да, впиши го в overrides|След компресиране|направи“|Таван на контекста"`
  prints nothing (exit 1): every remaining Cyrillic line is one of the named literals;
- `grep -c "^## " dev/backlogs/CANDIDATES.md` before == after; for each of the 19 translated titles
  (the 20 open sections minus "Direction 2026-10-15", already English)
  `grep -c -F "(was: „<title>“)" dev/backlogs/CANDIDATES.md` == 1;
- the equivalence scan reports 0 differing spans and 0 stray Cyrillic lines.
Risk threshold: a changed quote, a dropped row or a missing `(was:)` line blocks. Stop: the two
files.
Measurement step (added 2026-10-16, operator word „да" to the COO's proposal; a record item, not a
gate): BEFORE the translation and AFTER it, a `sonnet` scan agent counts the tokens of
`dev/backlogs/CANDIDATES.md` and of the translated overrides bullet - for Claude through the
Anthropic token-count endpoint (`messages.count_tokens`, the model named in the record), for Codex
through `tiktoken` `o200k_base` - and the completion record carries the four numbers with the exact
commands that produced them (Bulgarian vs English cost, overrides § Data discipline: measured or not
stated). The step changes nothing in the ticket's acceptance.

### PLB-006 - Closeout 0.2.19
COO: cheap (Opus), because all four no (D7).
Durable half (COO, after `{}` - D9): PLB-005's completion record, CANDIDATES rows (pass
statistics, events), PLAN archive `git mv dev/backlogs/active/PLAN_PLB.md
dev/backlogs/archive/011_PLAN_PLB_<date>.md` (the plan is tracked in `active/` since its landing),
one docs commit (the record commit).
Irreversible half (COO, from the main session; each its own operator word, in this order): the
tag `v0.2.19` on the record commit; `main` + tag in ONE push (overrides § Release discipline,
operator rule 2026-10-02); then `git -C D:\pnp-live checkout --detach main` (CLAUDE.md). The
version, the migration and the CHANGELOG block already landed with PLB-002/003 (D3).
Acceptance: `git tag --points-at HEAD` prints `v0.2.19`; `git ls-files dev/backlogs/archive/`
lists `011_PLAN_PLB_<date>.md` and `git ls-files dev/backlogs/active/` does not list `PLAN_PLB.md`;
after the push `git status -sb` first line is `## main...origin/main` with no `[ahead` or
`[behind`; `git -C D:\pnp-live rev-parse HEAD` == `git rev-parse HEAD`.

## Execution order

PLB-002 -> PLB-003 -> [D10: refresh pnp-live, `/pnp:update` on this repo, deferred selfcheck,
PLB-003 docs commit] -> PLB-001 -> PLB-004 -> PLB-005 -> PLB-006. PLB-002 and PLB-003 first and
together because they are the two halves of migration 0023 (D3) and the repo self-updates once
(D10); pnp-live stays at the pre-bump payload for exactly three commits (PLB-002 code, PLB-002
record, PLB-003 code). PLB-001 next so its
hook is live for PLB-004 onward. PLB-005 after the code tickets so their CANDIDATES rows are already
there when the open sections are translated.

## Readiness artifacts

`dev/backlogs/readiness/PLB/`, produced during the cycle: `ledger.md`, `consequence-scan.md`,
`revisions.md` (on disk since r2), `fact-check-r<N>.md` (one per revision, after each gate run),
`own-pass.md` (stamped last, before each pass) - `/pnp:review` Step 2e.
