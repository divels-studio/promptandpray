# PLAN_PLB - consequence scan (Step 2a/2c)

Pass 1 scan, 2026-10-15, five `sonnet` Explore agents over HEAD `7e0180c` (same dispatch as the
behavior ledger). Every row closed by the COO in r3 of the draft.

| # | ticket | decision | surface | violation | closure |
|---|---|---|---|---|---|
| 1 | PLB-001 | "every other code-class path stays denied" | `.claude/aiwf-native/aiwf.config.json:184` (`enforcement.routeWriteGuard`) | a writable config lets the session set `routeWriteGuard:false` under an open route | plan: config no longer writable - Outcome reduced to the transfer surface; § Scope names the reason |
| 2 | PLB-001 | same | `aiwf.config.json` (`dispatchGate`, `review.*`, `verify.*`, `roles`) | same writable config carries Gate 2's mode, the audit table, VERIFY | plan: same closure as row 1 |
| 3 | PLB-001 | D5 reader; Outcome (a) | `schema/aiwf.config.schema.json:323-328`; `generate.mjs:1031-1036` | schema accepts any string; a hand-edited surface `src/app.ts` would be allowed | plan: hook allows the resolved surface only when contained (relative, no `..`, not absolute) and basename `.md`; deny rows for `src/app.ts`, absolute, `..` |
| 4 | PLB-001 | Outcome (a) fallback chain | `generate.mjs:875-879` | setup resolver has no `docs/backlogs` literal; a CJS copy can drift | plan: third step removed (default/blank plansDir fallbacks are already allowed); parity selfcheck row over three fixture configs |
| 5 | PLB-001 | `.bak` control | `guard.js:200-205` | lexical resolve, no realpath - junction/symlink inherited | no defect: pre-existing behaviour, the junction hole is out of scope by § Scope with its reason |
| 6 | PLB-001 | D6 closing grep | `skills/mission/SKILL.md:81-82`; `skills/work/SKILL.md:76-77` | phrase breaks across lines, single-line grep misses it | plan: homes enumerated explicitly; grep `-i -E "root-level\|root \`\*\.md\`\|\.aiwf/\*\*"` must hit every listed home |
| 7 | PLB-001 | D6 | `schema/aiwf.config.schema.json:257` | no backticks, grep misses it | plan: listed home; `.aiwf/**` alternative hits it |
| 8 | PLB-001 | D6 | `docs/OPERATOR_PROTOCOL.md:54-56` | different wording, not in worklist | plan: added to the worklist and the home list |
| 9 | PLB-001 | D6 / worklist | `scripts/spike/README.md:77-79` | a captured transcript; rewriting falsifies evidence | plan: listed as a known hit NOT edited |
| 10 | PLB-001 | D6 | `guard.js:30, 211` | `:211` has no backticks; guard.js is a hit that is not a doc home | plan: hook `:30` and `:211` listed as homes (both edited) |
| 11 | PLB-001 | D6 | `docs/WORKFLOW.md:591-593` | plansDir-behind-the-guard sentence contradicts the exception unless edited | plan: `:586-593` in the worklist, the `:591-593` sentence gains the exception; `skills/review/SKILL.md` Step 2e likewise |
| 12 | PLB-001 | "Writer untouched" | `guard.js:232` | holds | no defect: Writer branch returns before any config read (`guard.js:232`) |
| 13 | PLB-001 | D5 one reader | `scripts/engine/pretooluse-dispatch-gate.js:64` | Gate 2 has its own reader; a third copy of the parse rule | no defect: D5 governs the mutation guard's file; Gate 2's reader is another hook with its own fail rule (ask), untouched by this plan |
| 14 | PLB-001 | D1 unusable-state unchanged | `guard.js:186-189, 207` | one `isAllowlisted` call serves both cases | plan: extra set passed ONLY when `st.why !== 'unusable'`; a deny row for the surface under an unusable state |
| 15 | PLB-001 | Outcome | any shell mutation | Gate 3 covers Edit/Write only | no defect: documented limit (`docs/LOOP.md` § Gate 3), unchanged by this plan |
| 16 | PLB-001 | Outcome (b) config writable | `migrate.mjs`, `generate.mjs` bookkeeping | hand writes change a stamped artifact | no defect: (b) dropped (row 1); and `aiwf.config.json` carries no managedRegions entry of its own (`aiwf.config.json:7-28` lists four keys, none the config) |
| 17 | PLB-001 | acceptance "seen FAIL on the pre-fix hook" | `run-spikes.mjs:152-168` | rows in `gate1Cases` diverge from the reference | plan: plugin-only table beside `gate3ToggleCases` with a state+config fixture |
| 18 | PLB-001 | selfcheck `.bak` row | `aiwf-selfcheck.js:1766-1790` | `mkRoot` has no config | plan: new rows on a `mkProject`-style fixture (`:1867-1874`) |
| 19 | PLB-001 | deny message names the classes | `aiwf-selfcheck.js:1805-1830` | no row pins the class wording | plan: a row pins the deny text's class wording |
| 20 | PLB-001 | Outcome (a) bookkeeping by the main session | `docs/WORKFLOW.md:812-820`; `skills/arbiter/SKILL.md:57-60` | arbiter read-only; nothing new violates | no defect: the arbiter writes nothing by doctrine; the executing session writes the row (`WORKFLOW.md:1010-1015`) |
| 21 | PLB-001 | junction hole | `generate.mjs:1031-1060` | out of scope | no defect: § Scope lists it with its reason |
| 22 | PLB-001 | no fail direction flips | none found (hooks tree, `hooks.json`, `context-gate.mjs`) | none | no defect: only `pretooluse-mutation-guard.js` reads `route-state.json` |
| 23 | PLB-002 | default `"."` keeps location | `scripts/ci/run-example-cycle.mjs:585` | second reader at the hard-coded root | plan: worklist says unchanged with a comment; the example config keeps the default |
| 24 | PLB-002 | resolves under the project root | `generate.mjs:1031` | containment loop lacks `changesDir` | plan: `changesDir` added to the containment loop |
| 25 | PLB-002 | same | `migrate.mjs:1559` | no containment in the engine | plan: engine refuses absolute or `..` with `UpdateError` before writing; a test |
| 26 | PLB-002 | `additionalProperties: false` | `aiwf-selfcheck.js:5456-5460` | no selfcheck row for `changesDir` | plan: `path-changesDir` row (present after update, relative, no `..`) |
| 27 | PLB-002 | (b) `$schema` at the end of a successful update | `migrate.mjs:1480-1484`; `test-update.mjs:305-318` | no-op path skips it; zero-diff pin | plan: no-op writes the config only when `$schema` differs and not in dry run; the pin's fixture uses one root so it still holds; a test for the stale case |
| 28 | PLB-002 | (b) | `migrate.mjs:1519-1529` (`--resolve`) | a second config write path | plan: `$schema` set inside `writeConfig` (`:891-893`), so `--resolve` refreshes it too |
| 29 | PLB-002 | (b) | `aiwf-roles.mjs:410,470` | roles tool re-persists the stored value | no defect: it rewrites what the last update wrote; after PLB-002 that value is fresh, and `/pnp:roles` is not an update |
| 30 | PLB-002 | (b) CHANGES says so | `migrate.mjs:1320` | `assembleChanges` has no parameter for it | plan: optional `schemaRefreshed: {from, to}` parameter, one line |
| 31 | PLB-002 | (b) schema description | `schema/aiwf.config.schema.json:21-24` | says setup is the only writer | plan: description updated in the worklist |
| 32 | PLB-002 | skill text | `migrations/README.md:88` | no location named | plan: `:88` names the configured folder (worklist (c)) |
| 33 | PLB-002 | same | `examples/example-project/README.md:103` | "appears at the project root" | plan: added to the worklist |
| 34 | PLB-002 | same | `examples/example-project/bump/example-bump/NOTES.md:12` | location unstated | no defect: the sentence names no location, so it stays true |
| 35 | PLB-002 | default keeps location | `CHANGES_0.2.3-to-0.2.4.md` (tracked at root) | old reports stay where they were | no defect: history files are not moved; the key governs new reports only |
| 36 | PLB-002 | a fifth op | `validate-payload.mjs:105-160` | `$schema` cannot ride an op | no defect: the refresh is engine code, not an op - exactly why it is not an op |
| 37 | PLB-002 | D3 bump in PLB-006 | `validate-payload.mjs:262-270` | 0023 at 0.2.19 fails while plugin.json is 0.2.18 | plan: D3 rewritten - PLB-002 bumps `plugin.json` and opens the CHANGELOG block; PLB-002 runs first |
| 38 | PLB-002 | same | `test-setup.mjs:225-230` | same pin | plan: same closure as row 37 |
| 39 | PLB-002 | D1 | none found | none | no defect: route is a ruling, not code |
| 40 | PLB-002 | D4 | none found | none | no defect: the five commands are the entry points |
| 41 | PLB-002 | D7 | none found | none | no defect: process rule |
| 42 | PLB-002 | supersede validator out of scope | `validate-payload.mjs:406-411` | shape only; no registry | no defect: agrees with § Scope |
| 43 | PLB-002 | changed default location | `test-update.mjs:305-318` | 21 reads at the root default | no defect: default `"."` keeps them valid |
| 44 | PLB-002 | `$schema` idempotent | `migrate.mjs:234-239` | deterministic only if the string is rebuilt identically | no defect: the value is built from `pluginRoot` by one expression inside `writeConfig`; the no-op test proves byte-identity |
| 45 | PLB-003 | `createIfAbsent` refused, never adopted | `generate.mjs:1278-1297` (`--adopt`) | take-new over a hand-written file | plan: Outcome states the three paths as they are (update refuses; plain setup blocks; `--adopt` offers take-new/keep-mine) |
| 46 | PLB-003 | "conflict dialog" | `migrate.mjs:641-660, 1131-1137` | no dialog, hard refusal, whole update stops | plan: wording corrected; NOTES.md and CHANGELOG say so; op is LAST of 0023 |
| 47 | PLB-003 | managed artifact | `migrate.mjs:179-186` | `--resolve AGENTS.md` throws | plan: `RESOLVABLE_ARTIFACT_TEMPLATES` entry + selfcheck needle (`:2066-2070`) |
| 48 | PLB-003 | two-hash stamp | `aiwf-roles.mjs:339-470` | `/pnp:roles --set` does not re-render AGENTS.md | no defect: the file renders only config keys `/pnp:roles` does not change (`paths.overridesDoc`, `review.productBoundaryChecks`); same as reviewer.md after a hand edit |
| 49 | PLB-003 | same | `skills/roles/SKILL.md`; schema `review.productBoundaryChecks` | a changed boundary check leaves the file stale until a setup re-run | no defect: identical to `reviewer.md` today (schema `:336-343` says it is rendered there); the next update re-renders both |
| 50 | PLB-003 | setup renders the artifact | `generate.mjs:1267-1313` | deleting the file blocks later setups; a hand edit = "edited by hand" | no defect: the standard managed-artifact contract, the same as ORCHESTRATOR.md; `/pnp:update --resolve` is the way out (row 47 makes it work) |
| 51 | PLB-003 | operator-owned file | `generate.mjs:1072-1089, 1433-1450` | transfer surface configured as `AGENTS.md` is not refused | plan: `ownedDestinations` gains `AGENTS.md` |
| 52 | PLB-003 | same | `aiwf-selfcheck.js:5495-5517` | flags only after the damage | no defect: row 51 refuses it at setup, before any write |
| 53 | PLB-003 | same via the hook | `guard.js:92-101` | root `*.md` writable under a route | no defect: a hand edit of a managed file is caught by hash drift, as for CLAUDE.md today; Gate 3 is a route guard, not a bookkeeping guard |
| 54 | PLB-003 | D8 no path, no version | `generate.mjs:290-309` (context exposes `resolvedRoot`, `overridesDocPath`) | a template author can leak an absolute path | plan: template uses `config.*` keys only; acceptance grep on the template for `[A-Za-z]:/` and `0\.2\.` |
| 55 | PLB-003 | D8 | `aiwf.config.json:244-248` | operator-written boundary lines rendered verbatim could carry a version | no defect: operator-owned text in an operator-owned config; the provenance gate covers the template, not the consumer's own words |
| 56 | PLB-003 | D8 verdict vocabulary | `codex-qa.ps1:158`; `codex-qa.sh:172` | QA reads the same file, different verdicts | plan: the file names NO verdict vocabulary |
| 57 | PLB-003 | same | `templates/agents/reviewer.md.tmpl:100-125` | readiness mode PASS/NEEDS-FIX | plan: same closure as row 56 |
| 58 | PLB-003 | D8 "brief names every doctrine file" | `skills/review/SKILL.md:174-185`; `skills/qa/SKILL.md:191` | only REVIEW_CHECKLIST (+ classes doc) | plan: D8 restated - the brief names the checklist; the hand-written WORKFLOW/LOOP pointers are not reproduced, by design |
| 59 | PLB-003 | resume path | `codex-review.ps1:186-196`; `codex-review.sh:200-210` | a resumed session may not re-read the file | no defect: a resumed pass reuses a session that already read the file; stated in the Outcome |
| 60 | PLB-003 | acceptance setup-suite | `test-setup.mjs:240-244` | 5-key list | plan: in the worklist (becomes 6) |
| 61 | PLB-003 | acceptance selfcheck | `aiwf-selfcheck.js:~585-625, 4920-5090` | fixture builder lists 5 keys | plan: fixture builder in the worklist |
| 62 | PLB-003 | same | `aiwf-selfcheck.js:2066-2070` | needle list lacks AGENTS.md | plan: needle added (row 47) |
| 63 | PLB-003 | this repo's own install | `aiwf.config.json:6-30`; no root `AGENTS.md` | real selfcheck red until the repo updates | plan: D10 - `/pnp:update` on this repo after the commit; acceptance names the resulting file |
| 64 | PLB-003 | validate-payload with 0023 at 0.2.19 | `validate-payload.mjs:265-275` | bump deferred | plan: D3 - bump with PLB-002, which runs first |
| 65 | PLB-003 | example cycle asserts the key | `run-example-cycle.mjs:583-630` | no expected-output tree; nothing checks AGENTS.md | plan: an assertion added beside `:583-630` |
| 66 | PLB-003 | refusal test | `test-update.mjs:2036-2100` | section 15 uses another artifact | plan: a section-15 test over the AGENTS.md op (empty ground; foreign file) |
| 67 | PLB-003 | four ops / op shape | `validate-payload.mjs:104-141` | op omitted `region` and `template` | plan: op written with all four fields |
| 68 | PLB-003 | migration op order | `migrate.mjs:1131-1160, 620-680` | a refusal after `add-config-key` leaves a half-applied migration | plan: the AGENTS.md op is the LAST op of 0023 |
| 69 | PLB-003 | `--adopt` inventory | `generate.mjs:1533-1545, 601-626`; `skills/setup/SKILL.md:147` | adopt address not listed | plan: `skills/setup/SKILL.md:42-46` adopt surface gains the file |
| 70 | PLB-003 | D6 | none found | none | no defect: PLB-001's decision; AGENTS.md is already a root `*.md` |
| 71 | PLB-003 | D5 | none found | none | no defect: hooks never read managedRegions |
| 72 | PLB-003 | D1 | none found | none | no defect: payload migration = R2 by the ruling |
| 73 | PLB-003 | D4 | none found | none | no defect: the five suites |
| 74 | PLB-003 | D7 | none found | none | no defect: by D7 |
| 75 | PLB-003 | version in template | `aiwf-selfcheck.js:6809, 6608-6626` | provenance gates paths, not `0.2.x` | plan: the acceptance grep covers `0\.2\.`; a permanent selfcheck rule is not owed by this plan |
| 76 | PLB-004 | (a) `exitCode = 0` | `aiwf-roles.mjs:722-731` | no else: fall-through into the write path | plan: write path moved into `else`; acceptance "prints the table ONCE, config byte-identical" |
| 77 | PLB-004 | exit codes | `aiwf-roles.mjs:709, 757` | forced error exits remain | no defect: error paths, out of scope and stated |
| 78 | PLB-004 | pin covers `:724`? | `test-setup.mjs:957-962` | it does not | plan: `absent: ['process.exit(0);']` + a control that injects the line |
| 79 | PLB-004 | same class elsewhere | `validate-config.mjs:313`; `validate-payload.mjs:479` | same `console.log` + `exit(0)` pattern | plan: included where it is the last statement |
| 80 | PLB-004 | `--show` tests | `aiwf-selfcheck.js:4633-4705` | assert status only | plan: acceptance asserts single print and byte-identical config |
| 81 | PLB-004 | (b) literal list vs "loop role" | `docs/LOOP.md:100` | Arbiter says "not a loop role" | plan: wording "the section's roles"; literal of 7 names |
| 82 | PLB-004 | (b) bullet naming | `docs/LOOP.md:40` | `COO / Orchestrator` | plan: extraction rule - bold text before ` /` |
| 83 | PLB-004 | (b) other enumerations | `WORKFLOW.md:122-125`; `templates/CLAUDE.md.tmpl:123`; `SESSION_BRIEF_RECIPE.md:53` | "Writer, Reviewer, QA" prose | no defect: a different set (the loop roles), not the section this pin holds |
| 84 | PLB-004 | (b) new agent/skill without a bullet | `templates/agents/*`, `skills/*` | no pin ties agents to bullets | no defect: the candidate asks for the third home of the skills enumeration; tying agents is a different pin, not owed |
| 85 | PLB-004 | (b) controls | `aiwf-selfcheck.js:6564-6566` | no control = note only | plan: two controls named |
| 86 | PLB-004 | (c) `[NOTE]` printer | `aiwf-selfcheck.js:104-107, 113-116` | two printers | plan: `addObservation` |
| 87 | PLB-004 | (c) base of outputDir | `skills/qa/SKILL.md:100-104` | cwd-relative | plan: predicate `resolve(root, cwd, outputDir)` under `resolve(root, cwd)`; fixture `cwd: app`, `outputDir: test-results` |
| 88 | PLB-004 | (c) free strings | `schema:292-295` | `..`, absolute, backslashes | plan: `path.resolve` normalises; the note is an observation, never a failure |
| 89 | PLB-004 | (c) interview | `interview.mjs:265-268` | answers-file skips it | plan: stated; the selfcheck after every install covers that path |
| 90 | PLB-004 | (c) later config edits | `interview.mjs:208-213`; `/pnp:update` | note fires once | no defect: the selfcheck observation runs on every `/pnp:selfcheck` and after every update |
| 91 | PLB-004 | (c) no fixture has next.config | `dev/answers.json:33`; `aiwf.config.json:229-235` | case exists nowhere | plan: fixture mutation at `:548-550` + `app/next.config.js` |
| 92 | PLB-004 | (c) never a failure | `aiwf-selfcheck.js:5542-5553` | `add()` would be a FAIL | plan: `addObservation`; risk threshold names it |
| 93 | PLB-004 | (c) `verify.e2e.enabled` | `aiwf-selfcheck.js:5160-5163` | absent keys | plan: absent `verify`/`e2e` tolerated |
| 94 | PLB-004 | "non-overlapping files" | `aiwf-selfcheck.js` for (b) and (c) | false at file level | plan: title "one Writer, sequential" |
| 95 | PLB-004 | D3 migration | none found | none | no defect: no managed artifact changes |
| 96 | PLB-004 | D4 pin fixture | `test-setup.mjs:1013-1041` | an `absent` entry has no fixture line | plan: the control injects the line (row 78) |
| 97 | PLB-004 | D5/D6 | none found | none | no defect: not Gate 3 surfaces |
| 98 | PLB-004 | D7 | none found | none | no defect: by D7 |
| 99 | PLB-005 | `dev/` through the Writer | `guard.js:93-101, 209-213` | COO cannot fix up `dev/**` under a route | plan: D9 - micro-round to the live Writer; records after `{}` |
| 100 | PLB-006 | durable half | `guard.js:93-101` + route state | records/archive/readiness under `dev/` denied under a route | plan: D9 close-first-record-second |
| 101 | PLB-006 | irreversible half | `guard.js:93-101` | `plugin.json`, `index.json` outside the allowlist | plan: D3 - the Writer lands them in PLB-002; PLB-006 is tag + push only |
| 102 | PLB-006 | D3 bump surfaces | `aiwf.config.json` version stamp; root `CHANGES_*` files | second version place; CHANGES report of the self-update | plan: D10 - `/pnp:update` on this repo moves the stamp and its report rides the docs commit |
| 103 | PLB-005 | overrides acceptance bound | `dev/PROJECT_OVERRIDES.md:196, 263, 264` | three Cyrillic lines outside the bullet; no record exists | plan: explicit allowed set, at most 5 lines, each named |
| 104 | PLB-005 | three vs four ledgers | `CANDIDATES.md:1004, 1022, 1142, 1224` | undefined frozen set | plan: "the four ledger sections", named |
| 105 | PLB-005 | 22 open sections | headings 9..945 | 20, three are notes, one already English | plan: 20 at r3, notes included, Direction section already English |
| 106 | PLB-005 | quotes verbatim | `CANDIDATES.md` (1028 Cyrillic lines) | no quote convention | plan: quote convention defined (`„...“` and operator-attributed `"..."` spans byte-for-byte) |
| 107 | PLB-005 | rule scope | `PLAN_HARD.md`; `dev/VERIFY_RUNBOOK.md:8`; `readiness/*`; `CLAUDE.md:157-158` | other Bulgarian files read in sessions | plan: PLAN_HARD out of scope with its reason (§ Scope); `VERIFY_RUNBOOK.md` and readiness history are not read every session; CLAUDE.md role names are config values |
| 108 | PLB-005 | line pin 335-351 | `PROJECT_OVERRIDES.md:335-351` vs `PLAN_HARD.md:3133` | lines move | plan: cited by bullet title with "(:335-351 at r3)" |
| 109 | PLB-005 | provenance grep | `docs skills templates scripts schema hooks migrations` | does not cover `dev/` | no defect: the acceptance grep for PLB-005 is over `dev/PROJECT_OVERRIDES.md` explicitly |
| 110 | PLB-006 | tag + push | `CLAUDE.md:174-178`; Gate 4 | who runs it | plan: "COO, from the main session; each its own operator word" |
| 111 | PLB-006 | pnp-live refresh | `CLAUDE.md:174-178` | only at the end | plan: D10 - after EVERY commit; PLB-001 second so its hook is live |
| 112 | PLB-006 | index.json last entry | `validate-payload.mjs:205-243` | 0023 may not exist | plan: D3 - PLB-002 creates it |
| 113 | PLB-006 | CHANGELOG re-introduces the phrase | `CHANGELOG.md:7-30` | D6 grep excludes it by pathspec | no defect: CHANGELOG is a known hit left out of the pathspec by design (history) |
| 114 | PLB-005 | VERIFY row for docs | overrides Test policy | acceptance items cannot fail | plan: acceptance rewritten - bounded grep, `(was:)` count, 0 differing spans |
| 115 | PLB-005/006 | D6 | PLB-001 homes | none | no defect: PLB-005/006 touch none of them |
| 116 | PLB-005 | heading count | none found (no machine reader of dev CANDIDATES titles) | none | no defect: only human citations, kept greppable by `(was:)` |

Delta scan after readiness pass 1 (Step 2c), 2026-10-15, one `sonnet` Explore agent over the
decisions and passages revised in r6; rows closed in r7.

| # | ticket | decision | surface | violation | closure |
|---|---|---|---|---|---|
| 117 | PLB-001 | D1 unusable/Gate 1 unchanged | `guard.js:175-214` | none found | no defect: the one `isAllowlisted` call is the only place `extra` enters |
| 118 | PLB-001 | Outcome allow set | `hooks/hooks.json:5-12` matcher | shell writes bypass Gate 3 entirely | no defect: documented limit (`docs/LOOP.md` § Gate 3), unchanged |
| 119 | PLB-001 | `.md` rule keeps the config out | `.claude/agents/*.md`, `ORCHESTRATOR.md` (contained `.md`) | a surface configured as an agent file is writable mid-route | plan: resolver returns `null` for a first segment `.claude`; a deny row for `.claude/agents/writer.md` |
| 120 | PLB-001 | hook copies the surface rule | `generate.mjs:874-879`; `aiwf-selfcheck.js:5507-5512` | untrimmed / trailing-slash values resolve differently in three copies | plan: the resolver `trim()`s; the rule stays two lines; the parity rows use the literal expected paths |
| 121 | PLB-001 | fallback contained only | `guard.js:96` first-segment fold | `DOCS/x.md` allowed on Linux by the pre-existing fold | no defect: pre-existing behaviour, named as not widened here |
| 122 | PLB-001 | win32-only fold; POSIX deny row in CI | `ci.yml:105-151` (macos leg); no `process.platform` in hooks today | macOS default FS is case-insensitive: a deny there is a false deny; first platform branch in a hook | plan: fold on `win32` and `darwin`, exact on `linux`; the row runs on linux only; "the hooks' first `process.platform` branch" stated |
| 123 | PLB-001 | D5 one reader | `pretooluse-dispatch-gate.js:58-60` | Gate 2 has its own reader | no defect: D5 is scoped to the mutation guard |
| 124 | PLB-001 | D6 closing grep | pathspec omits `hooks migrations examples`; README/CLAUDE.md in pathspec but not homes | a home in an omitted dir is invisible; a hit in README fails the ticket | plan: pathspec = whole payload + the two root files; a hit outside the 11 (README/CLAUDE.md included) is a missed home - by design |
| 125 | PLB-001 | unusable allowlist unchanged | `guard.js:186-189` | none found | no defect: the only reader of `st.why` is the branch the plan restricts |
| 126 | PLB-002 | helper in `scripts/engine/aiwf-lib.js` | `aiwf-lib.js:1,130-133` - the hook lib, loaded by every gate and the plan gate | first ESM->engine import; a path helper in the hooks' lib | plan: helper moved to `scripts/setup/validate-config.mjs` (ESM, already imported by `migrate.mjs:88`); selfcheck evaluates it by `spawnSync` + `--input-type=module` |
| 127 | PLB-002 | same | `aiwf-selfcheck.js:2559-2590`, `:4002-4006` (engine copies) | the export ships into every plan-gate probe copy | no defect: after row 126 nothing new is in `scripts/engine/` |
| 128 | PLB-002/004 | new engine file | `generate.mjs:744-749` (`scanSupersededLegacy`: every `scripts/engine/*.js` is a hook name) | `e2e-trace-note.js` would be reported as a superseded hook | plan: no new file under `scripts/engine/`; PLB-004's helper is `scripts/setup/e2e-trace-note.mjs` |
| 129 | PLB-002 | one containment rule | `generate.mjs:1031-1036` (other four keys) | the other keys keep a host-dependent rule | no defect: stated - changing theirs is a behaviour change outside this plan |
| 130 | PLB-002 | refuse in `preflight` | `migrate.mjs:1457-1459` (`--check` runs `preflight`) | a bad `changesDir` would block every `/pnp:*` skill | plan: check moved out of `preflight` into `runUpdate` after the no-op branch, and the dry run; a test "`--check` and `--resolve` are not refused" |
| 131 | PLB-002 | same | `migrate.mjs:1581-1582` (`--resolve` runs `preflight`) | `--resolve` refused for a key it never uses | plan: same closure as 130 |
| 132 | PLB-002 | folder created by `writeAtomic` | `migrate.mjs:1553-1566` (report written after all ops, before the stamp) | a `changesDir` that is an existing FILE fails after the ops are applied | plan: the pre-plan check also refuses an existing non-directory (`fs.statSync`); a test |
| 133 | PLB-002 | absent key = `.` | `test-update.mjs` 21 `CHANGES_` reads at the root | not listed as consumers | no defect: listed under PLB-002 worklist ("keep working at the default") |
| 134 | PLB-002 | containment | `aiwf-roles.mjs:520-530` rewrites the config without the check | a hand-edited bad value survives a roles change | no defect: caught at the next update run, stated in (a) |
| 135 | PLB-002 | refresh before the no-op test | `migrate.mjs:1478-1479` (`if (journal) throw` inside the no-op branch) | a refused run (journal present, nothing pending) would already have rewritten the config | plan: refresh only when `journal === null`, after that throw |
| 136 | PLB-002 | every later hash over the refreshed config | `migrate.mjs:1019-1021`, `:1148-1156` (recovery hashes) | a RESUMED run with an older journal would refresh first and match neither hash | plan: no refresh while a journal exists; the crash-resume test asserts no refresh on resume and a refresh on the next clean run |
| 137 | PLB-002 | refresh in `resolveArtifact` | `migrate.mjs:1581-1583` (no `dryRun`; refuses with a journal AFTER the start) | `--resolve` would always write `$schema` | plan: `--resolve` does not refresh |
| 138 | PLB-002 | `writeConfig` untouched | setup `generate.mjs:1556`, `aiwf-roles.mjs:529` | other `$schema` writers/preservers | no defect: setup writes the live root; roles preserves the last update's value |
| 139 | PLB-002 | `$schema` description | `test-setup.mjs:230` suffix pin only | none found | no defect: no check asserts the live value, and the plan adds the update test for it |
| 140 | PLB-002 | four ops | `migrate.mjs:392-398`; `validate-payload.mjs:160` (`$schema`/`_aiwf` excluded from op paths) | the refresh is a config write by no op | plan: stated - `$schema` is engine bookkeeping like the `_aiwf.*` stamps, excluded from op paths by the same line |
| 141 | PLB-002 | one migration / bump | `aiwf-selfcheck.js:5445-5447`; `ci.yml:61,103,151` | none found as a CI violation | no defect: CI's selfcheck runs without the fixture |
| 142 | PLB-002 | (c) "0023 renders no region" | PLB-003's `rerender-managed-region` op | false for the shipped migration | plan: (c) reworded - the step is for RE-rendering an existing region; 0023's op CREATES a file with no duplicate to supersede |
| 143 | PLB-003 | D8 no role-specific check | wrappers `-C <projectRoot>` for review and QA | none found | no defect: both roles read the same file and it carries nothing role-specific |
| 144 | PLB-003 | template variables | `generate.mjs:290-309`, `renderTemplate` (no escaping) | a project name with markdown control text lands unescaped | no defect: pre-existing for every template (`reviewer.md.tmpl` renders the same values); out of scope |
| 145 | PLB-003 | hand-written file blocks the update | `migrate.mjs:119-120, 648-653`; `aiwf-update.mjs:165-180` | the consumer's update refuses at op 3 with ops 1-2 journaled; `--check` red until the file is moved | plan: the CHANGELOG entry tells such a consumer to move the file aside BEFORE `/pnp:update` |
| 146 | PLB-003 | resolve map entry | `aiwf-selfcheck.js:2066-2070` substring needles | nothing proves map and needles stay equal | no defect: the needle is listed; equality of a six-name list is the existing design |
| 147 | PLB-003 | `ownedDestinations` | `guard.js:99` (root `*.md`); `aiwf-selfcheck.js:5500-5512` | the COO can hand-edit `AGENTS.md` mid-route; an UPDATE with `transferSurface: AGENTS.md` is not refused | no defect: a hand edit of a managed file is caught by hash drift (same as `CLAUDE.md`); the surface collision is refused at setup, and the PLB-001 resolver's `.md`+contained rule makes a root `AGENTS.md` surface writable only as any root `*.md` already is |
| 148 | PLB-003 | `managed-regions-cover` unconditional member | `aiwf-selfcheck.js:5423-5432` | installs not yet on 0023 go red | no defect: a consumer runs the 0.2.19 selfcheck only after `/pnp:update` applied 0023 (`finishWithSelfCheck`); a refused update (row 145) is red by design |
| 149 | PLB-003 | D10 "nothing changes a hook" | `aiwf-lib.js` required by every gate | PLB-002 would have edited it | plan: no engine edits in PLB-002/003 (row 126); the claim holds again |
| 150 | PLB-003 | D10 interlock | `migrate.mjs:1457-1459` reads the payload of the tree it runs from | a skill run from the working tree would see 0.2.19 pending | no defect: every `/pnp:*` skill runs from `D:\pnp-live` (`--plugin-dir`), never from the working tree (CLAUDE.md) |
| 151 | PLB-003 | deferred selfcheck in PLB-003's record | `ci.yml:61,103,151` (no fixture in CI) | the real-fixture run exists only locally | no defect: stated; the local run is the record's evidence |
| 152 | PLB-003 | D9 `{}` after the code commit | `guard.js:93-101` | the self-update writes the config via node, not Edit | no defect: `/pnp:update` is a node process, not an Edit; and `{}` precedes it |
| 153 | PLB-004 | (c) helper in `scripts/engine/` | `interview.mjs` ESM; QA runners never apply the predicate | ESM->CJS engine import; QA side unaffected | plan: helper is `scripts/setup/e2e-trace-note.mjs` (ESM); the QA runners are out of scope (the note is an install/selfcheck observation) |
| 154 | PLB-004 | D4 Git Bash commands | `dev/VERIFY_RUNBOOK.md:11-18` (PowerShell `Start-Process` for the suites) | `$TMP` unset; no Git Bash section in the runbook | plan: D4 - suites per the runbook, greps/counts in Git Bash, an explicit absolute scratch path |
| 155 | PLB-004 | D4 split rule | PLB-001/005 `git grep` pipelines | the pipe masks the first stage's status | plan: D4 states the last-stage status is the designed result for `grep -v` filters; PLB-001's grep is not a pipeline |
| 156 | PLB-004 | (a) pin `absent` list | `aiwf-roles.mjs:708, 757` | the `process.exit(code);` entry already exists | no defect: existing pin, unchanged |
| 157 | PLB-005 | English everywhere | `PLAN_HARD.md`, `readiness/**`, `VERIFY_RUNBOOK.md`, `CLAUDE.md`, `ORCHESTRATOR.md` | no mechanical gate over `dev/` | no defect: PLB-005's acceptance is the one-file grep + the equivalence scan; the rest is out of scope by the rule's own text |
| 158 | PLB-006 | D7 cheap | `WORKFLOW.md:906` | tag/push of a migration-carrying release | no defect: check 1 is about WRITING migration code; PLB-006 writes none |
| 159 | all | D7 | PLB-004 (a) edits code | routed top on check 2 anyway | no defect: top is top |
| 160 | all | D8 | `review.productBoundaryChecks` readers | none found | no defect: only the reviewer template and the review brief read them |
