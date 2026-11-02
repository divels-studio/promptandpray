# DOCSTAGE - research (2026-11-01, tree at e8761b6)

Two scan agents (sonnet, fresh context): A - the prose surface (docs, skills, templates), B - the
render engine, the update engine, the self-check and the hooks. The COO verified every claim it
relies on below with its own Read where marked (V). Base: none - the first plan of the entry; the
input `dev/backlogs/inputs/DOCSTAGE-2026-10-31.md` § 2-3 re-verified (S5).

## S1. Code Map

| file | role today |
|---|---|
| `docs/WORKFLOW.md` | the doctrine authority, 24 `##` sections, 912 lines, read IN FULL at every preflight |
| `docs/LOOP.md` | native mapping + role boundaries + the four gates + commit gate + security model, 269 lines, read IN FULL at every preflight |
| `docs/REVIEW_CHECKLIST.md` | Reviewer/QA verdict rules, 231 lines; the reviewer agent reads it in full, the Codex brief hands its path |
| `docs/OPERATOR_PROTOCOL.md`, `docs/SESSION_BRIEF_RECIPE.md`, `docs/CODEX_REVIEW_QA_RECIPE.md`, `docs/READINESS_CLASSES.md`, `docs/README.md` | operator page; brief recipe; wrapper recipe; blocker classes; the docs index |
| `skills/work`, `skills/mission`, `skills/plan` | the three doors; each carries its own copy of the four-document preflight sentence |
| `skills/loop/SKILL.md` | a convention restatement (141 lines) with no inbound pointer from any skill, template, script or hook |
| `skills/review`, `skills/qa`, `skills/arbiter`, `skills/brief`, `skills/roles`, `skills/setup`, `skills/update`, `skills/selfcheck`, `skills/qal` | stage skills; only `arbiter` names one WORKFLOW section to read IN FULL |
| `templates/CLAUDE.md.tmpl` | the managed `aiwf-core` region; the preflight sentence at :65-70 |
| `templates/ORCHESTRATOR.md.tmpl` | the COO's standing rules (full text) + a References-only list + the additions block; rendered to `.claude/aiwf-native/ORCHESTRATOR.md` |
| `templates/agents/{writer,reviewer,qa}.md.tmpl`, `templates/AGENTS.md.tmpl` | role prompts, each ending with the additions block |
| `templates/PROJECT_OVERRIDES.md.tmpl` | seeded ONCE, operator-owned, no additions block |
| `templates/briefs/*.md` | agent contracts and the record skeleton, read by path, never rendered |
| `templates/README.md` | the templates contract: thin renders, "a rule is never copied into a template" |
| `scripts/setup/generate.mjs` | render core: `planInstall` (the hard-coded managed-artifact list), `carryProjectAdditions`, `applyPlan`, `managedRegions` stamping |
| `scripts/update/migrate.mjs`, `scripts/update/validate-payload.mjs` | the update engine and the op vocabulary (five ops) |
| `scripts/selfcheck/aiwf-selfcheck.js` | payload integrity (skills Step 0, dangling refs, `/pnp:` names), provenance, `managed-regions-present`, the fixture's managed keys |
| `scripts/setup/test-setup.mjs`, `scripts/update/test-update.mjs`, `scripts/ci/run-example-cycle.mjs` | suites pinning the managed key set, the ORCHESTRATOR render, the additions carry |
| `scripts/engine/pretooluse-dispatch-gate.js` | Gate 2: the `Ticket:` line, off-plan lookup, the plan-pass deny |
| `migrations/index.json`, `migrations/0012_orchestrator-role/`, `migrations/0032_rule-homes/` | the manifest; the precedent for a NEW whole-file artifact; the newest migration |
| `.claude-plugin/plugin.json`, `CHANGELOG.md` | version `0.3.7`; the `Retires local rules:` line convention |

## S2. What the code does today

Preflight and reading:

1. The four-document preflight sentence stands in five copies: `skills/work/SKILL.md:32-36`,
   `skills/mission/SKILL.md:33-36`, `skills/plan/SKILL.md:54-61` (Step 0.5, the only copy with the
   suppression dual - `git diff <HEAD at the read> -- <the four paths>` empty; re-read after
   compaction), `skills/loop/SKILL.md:34-39`, `templates/CLAUDE.md.tmpl:65-70`. `work` and `mission`
   carry no dual and no HEAD note.
2. Today's preflight read: WORKFLOW 912 + LOOP 269 + the rendered ORCHESTRATOR (template 196) +
   the overrides document (this repository's 285 lines) - about 1,660 lines before any plan file.
   (V: `git ls-files | Measure-Object -Line`, 2026-11-01.)
3. The dual's `git diff` works only on paths INSIDE the project repository: in a consumer the payload
   docs live under the plugin cache, outside its tree, so the dual never fires there; a rendered copy
   under `.claude/aiwf-native/` is in the consumer's tree and diffs (`skills/plan/SKILL.md:60-64`).
4. Every skill's Step 0 is the same 4-item block in 11 copies; "Reading is not a shell job" also at
   `docs/LOOP.md:95`, `templates/CLAUDE.md.tmpl:78`, `templates/agents/writer.md.tmpl:55`.
5. Per-stage reads that already exist: `skills/arbiter/SKILL.md:46` (WORKFLOW § Escalation IN FULL),
   `:52` (§ Branch policy); `templates/agents/reviewer.md.tmpl:39` (REVIEW_CHECKLIST in full before
   the pass); `templates/agents/qa.md.tmpl:35`; `templates/agents/writer.md.tmpl:34` (LOOP § Role
   boundaries), `:61` (the Writer lines of the brief contract, a digest).
6. `${CLAUDE_PLUGIN_ROOT}` stands literally in the skills (71 occurrences, 19 files) and in
   `hooks/hooks.json:10,20,29`; no script substitutes it - the harness does at skill load (V: the
   `/pnp:mission` text this session received carries `D:/pnp-live/...`).
7. `skills/loop/SKILL.md` carries ONE rule found nowhere else: a QA `BLOCKED` is not a Writer defect,
   pauses the loop and consumes no correction round (`:91-94`; `skills/qa` has no such sentence,
   grep "consume" empty; `BLOCKED` is defined at `skills/qa/SKILL.md:207-214`,
   `docs/REVIEW_CHECKLIST.md:201-202`, `docs/LOOP.md:75` as a precondition verdict only). Three
   phrasings unique to it carry no rule ("three tiny stateless hooks" `:128-131`, "R1 is different"
   `:120-123`, "no token, no state file" `:100-104`). Inbound pointers: `docs/LOOP.md:27`,
   `README.md:114` (namespace list), `README.md:198` (table row), `CHANGELOG.md:1492,1562`
   (history); none from `skills/`, `templates/`, `scripts/`, `hooks/`.

The section inventory (headings by `^##`; "stage" = where the citations put the read; "never" = no
section-form cite):

| doc | section | lines | cited by | stage today |
|---|---|---|---|---|
| WORKFLOW | Roles | 15-38 | LOOP.md:3 (file-level) | preflight only |
| WORKFLOW | COO owns broad scans | 39-96 | CLAUDE.md.tmpl:92; ORCHESTRATOR.md.tmpl:191; a memory seed | session start |
| WORKFLOW | The COO write boundary runs along artifact class | 97-121 | LOOP.md:24; briefs/record.md:36; review/SKILL:223 | review / close |
| WORKFLOW | The operator does not arbitrate engineering decisions | 122-154 | CLAUDE.md.tmpl:32; ORCHESTRATOR.md.tmpl:75 | session start |
| WORKFLOW | ### How the COO speaks to the operator | 155-183 | CLAUDE.md.tmpl:94; ORCHESTRATOR.md.tmpl:85; qa/SKILL:378; review/SKILL:528 | session start / verdict |
| WORKFLOW | Operator-interaction guards (a-h) | 184-242 | CLAUDE.md.tmpl:88; ORCHESTRATOR.md.tmpl:98,185-188; memory seeds | session start |
| WORKFLOW | Verifying failure claims | 243-265 | CLAUDE.md.tmpl:93; ORCHESTRATOR.md.tmpl:193 | session start |
| WORKFLOW | Loop shape and its overrides | 266-305 | PROJECT_OVERRIDES.tmpl:161; record.md:73; loop/SKILL:97-98 | dispatch / close |
| WORKFLOW | Planning lock | 306-339 | plan/SKILL:49; PROJECT_OVERRIDES.tmpl:49 | `/pnp:plan` |
| WORKFLOW | Plan readiness review | 340-422 | ORCHESTRATOR.md.tmpl:190; LOOP.md:93; REVIEW_CHECKLIST:14,42; README.md:225 | `/pnp:plan` |
| WORKFLOW | Ticket brief contract (R2/R3) | 423-491 | writer.tmpl:61; briefs/writer-dispatch.md | dispatch |
| WORKFLOW | ### Proof-surface feasibility | 492-508 | none | brief / readiness |
| WORKFLOW | ### Out-of-scope failures found during work | 509-516 | none | work |
| WORKFLOW | Durable development history | 517-650 | plan/SKILL:98,267,276,286; work/SKILL:41,50; mission/SKILL:52; setup/SKILL:97; ORCHESTRATOR.md.tmpl:54; record.md:4,59; CLAUDE.md.tmpl:90; generate.mjs:737,755 (quoted title) | plan, work, mission, close |
| WORKFLOW | ### The ledger (+ the fenced skeleton) | 651-681 | arbiter/SKILL:78; plan/SKILL:271; record.md:21; ORCHESTRATOR.md.tmpl:178; test-setup.mjs:1597-1602 (byte pin) | plan, arbiter, close |
| WORKFLOW | Routes (R1/R2/R3, COO routing) | 682-757 | review/SKILL:119; LOOP.md:19; CLAUDE.md.tmpl | route decision |
| WORKFLOW | Branch policy | 758-796 | plan/SKILL:44,48; arbiter/SKILL:23,52; ORCHESTRATOR.md.tmpl:192; LOOP.md:160 | plan, arbiter |
| WORKFLOW | Fail aggregation | 797-808 | plan/SKILL:232; review/SKILL:163,296,423; REVIEW_CHECKLIST:213 | review, plan pass 2 |
| WORKFLOW | Escalation and the arbiter | 809-843 | arbiter/SKILL:46 (IN FULL); ORCHESTRATOR.md.tmpl:119; LOOP.md:88 | arbiter / always |
| WORKFLOW | Tests | 844-850 | none | never |
| WORKFLOW | Status / release docs policy | 851-860 | PROJECT_OVERRIDES.tmpl:117 (title) | close |
| WORKFLOW | Commit & Push Authority | 861-891 | CLAUDE.md.tmpl:37,41,95; LOOP.md:244 | close / always (a gate) |
| WORKFLOW | Reproducibility | 892-912 | none | never |
| LOOP | Routing mapped to native | 9-29 | CLAUDE.md.tmpl:52 | session start |
| LOOP | Role boundaries | 30-118 | CLAUDE.md.tmpl:56,80; writer.tmpl:34; reviewer.tmpl:48; qa.tmpl:45; review/SKILL:368,484; qa/SKILL:255,362; qal/SKILL:154 | session start, every role |
| LOOP | Enforcement of Writer-only writes | 119-239 | LOOP.md:101; WORKFLOW:26,445,452,776,889,908 | hook reference, no skill |
| LOOP | Commit gate | 240-247 | test-setup.mjs:1012 (comment); a fixture note's docRef `docs/LOOP.md#commit-gate` (test-update.mjs:199) | close |
| LOOP | Honest security model | 248-269 | CLAUDE.md.tmpl:96; WORKFLOW:889 | reference |
| REVIEW_CHECKLIST | Plan readiness (before implementation) | 10-30 | WORKFLOW:375; reviewer.tmpl:95 | plan pass |
| REVIEW_CHECKLIST | Given per brief | 31-45 | reviewer.tmpl:74 | review |
| REVIEW_CHECKLIST | Reviewer - code & design correctness | 46-75 | reviewer.tmpl:59 | review |
| REVIEW_CHECKLIST | Review dimensions by defect class (13 `###`) | 76-187 | reviewer.tmpl:60; review/SKILL:201 | review |
| REVIEW_CHECKLIST | QA - real, observable behavior | 188-203 | qa.tmpl:35 | qa |
| REVIEW_CHECKLIST | Fail aggregation (both roles) | 204-219 | reviewer.tmpl:79,99; WORKFLOW:800 | review, qa |
| REVIEW_CHECKLIST | Verdict (both roles) | 220-231 | none (section form) | review, qa |

`docs/OPERATOR_PROTOCOL.md` is cited only at `templates/CLAUDE.md.tmpl:70` and
`ORCHESTRATOR.md.tmpl:24`; `work` and `mission` do not name it.

The render and update engines:

8. The managed-artifact list is hard-coded in `planInstall` (`scripts/setup/generate.mjs:1043-1080`):
   `roles.json`, `.claude/agents/writer.md`, `ORCHESTRATOR.md` (`ORCHESTRATOR_REL` :85), `AGENTS.md`,
   reviewer/qa agents when Claude-hosted, `CLAUDE.md#aiwf-core`. The key is the POSIX relative path.
   Nothing reads a list from `templates/`.
9. The whole-file loop (`generate.mjs:1093-1119`) carries the additions block for every `rel` ending
   in `.md`, then stamps `managedRegions[key] = <plugin version>`. `applyPlan` runs
   `mkdirSync(dirname, {recursive:true})` before every write (`:1355`); the update path the same in
   `writeAtomic` (`migrate.mjs:119`) - a subdirectory such as `.claude/aiwf-native/doctrine/` needs
   no new directory code.
10. `carryProjectAdditions` (`generate.mjs:585-598`): ONE block per file (`:565`); the existing
    block's bytes replace the render's block slot (or are appended after the render); everything
    outside the block is discarded, the render wins; malformed markers throw. The five whole-file
    `.md` templates end with an empty block (`ORCHESTRATOR.md.tmpl:195`, `AGENTS.md.tmpl:30`,
    `writer.md.tmpl:158`, `reviewer.md.tmpl:104`, `qa.md.tmpl:76`).
11. Placeholders: `{{config.x}}`, `{{resolvedRoot}}`, `{{overridesDocPath}}`, `{{wrappers.k}}`,
    `{{#each}}`, `{{^inv}}` (`generate.mjs:131-133`); an unresolvable path throws;
    `<!-- TEMPLATE CONTRACT` blocks are stripped (`:244-247`).
12. The op vocabulary is exactly five (`validate-payload.mjs:105-162`). `rerender-managed-region`
    takes `op, file, region, template` (+ `ifRecorded` | `createIfAbsent`); with `region: null` on a
    file the installation never recorded it CREATES the file ("created from the payload render",
    `migrate.mjs:441-479`, `:468`) and stamps it; `createIfAbsent` is accepted and ignored
    (`validate-payload.mjs:127-129`). Precedent: `migrations/0012_orchestrator-role/ops.json` (V)
    introduced `ORCHESTRATOR.md` this way. There is NO remove-file op.
13. `--check` (`migrate.mjs:761-769`) compares versions and ids only, never file contents; a managed
    file is overwritten at re-render, never asked about (`generate.mjs:1108-1116`, `migrate.mjs:471`).
14. The self-check's PAYLOAD INTEGRITY (`aiwf-selfcheck.js:7543-7679`): every skill's Step 0 text
    (`:7558-7559`), the interlock command (`:7567-7573`), a dangling-reference scan over skills,
    docs, templates, migrations and `scripts/update/*.mjs` whose regex (`:7587`) matches
    `docs/<name>.md` (no slash inside) and `templates/<path>.(tmpl|json)` (slash allowed);
    `listFiles` recurses (`:7530-7540`, V). Every `/pnp:<cmd>` named anywhere must be a skill
    directory (`:7666-7679`). No size or heading assertion over the docs anywhere.
15. Provenance (`aiwf-selfcheck.js:7712-7932`) scans every payload file by extension, recursively,
    skipping `dev`, `.claude`, `.aiwf`, root `CLAUDE.md`; a new `templates/doctrine/` is scanned
    without any change.
16. `managed-regions-present` (`aiwf-selfcheck.js:6704-6741`) is generic over the recorded keys;
    the self-check FIXTURE hard-codes its keys (`FIXTURE_MANAGED_KEYS` `:515-516`, `:585`, `:588`,
    `:624`); `test-setup.mjs:244` asserts the EXACT key set; `test-update.mjs:137,208,1291-1298,1615`
    pin the ORCHESTRATOR op and the key set; `run-example-cycle.mjs:308,312,601,615-617` assert the
    CLAUDE.md region, the Writer and `AGENTS.md` keys and a byte-identical repository (`:630`); the
    example bump's ops re-render the CLAUDE.md region and the Writer and seed a file
    (`examples/example-project/bump/`).
17. Gate 2 (`scripts/engine/pretooluse-dispatch-gate.js`): matcher `Agent` (`hooks/hooks.json:16`);
    `Ticket:` read from the prompt by `TICKET_LINE` (`:72`, used `:212`); only
    `subagent_type === 'writer'` is gated (`:293`); missing line / off-plan ref -> ASK (`:214-218`,
    `:235-239`), on-plan -> silent (`:233`); a `reviewer` dispatch with `Class: plan` runs
    `plan-gate.js` and DENIES on problems (`:268-290`). The dispatch gate carries no `onFailure`
    (`hooks.json:19-21`); the two deny gates carry `block` (`:11`, `:30`).
18. `templates/README.md:25-31` (V): "The rendered Markdown artifacts are thin: the project data, the
    role's own behaviour contract, and one pointer per rule cluster to the payload document that
    holds the rule - a rule is never copied into a template." `templates/briefs/` are "never
    rendered, never managed" (`:44-48`).
19. `CHANGELOG.md:7` opens `## [0.3.7] - 2026-10-31`; its `Retires local rules:` line is `:76`;
    the format is `CLAUDE.md:125-137` (one line per block, names only). `migrate.mjs:323` reads
    blocks by `^## \[(\d+\.\d+\.\d+)\]`.
20. `test-setup.mjs:1597-1602` pins the ledger skeleton byte for byte to the fenced block of
    WORKFLOW § The ledger; `generate.mjs:737,755` quote the title "Durable development history" in
    an error string.

## S3. Consumers and adjacent contracts

- Preflight sentence consumers: the five copies of fact 1 + `ORCHESTRATOR.md.tmpl:24` (names the four
  payload docs) + `CLAUDE.md.tmpl:12-19` ("Where the rules live" lists WORKFLOW, LOOP,
  REVIEW_CHECKLIST, OPERATOR_PROTOCOL) + `docs/README.md:6-17` (the index) + `README.md:60,114,198,225`.
- `docs/REVIEW_CHECKLIST.md` path consumers: `reviewer.md.tmpl:39`, `qa.md.tmpl:35`,
  `skills/review/SKILL.md:186`, `skills/qa/SKILL.md:206` (the absolute path handed to the brief),
  `docs/WORKFLOW.md:5`, `REVIEW_CHECKLIST` cites inside WORKFLOW (`:375,:800`), `docs/README.md:10`.
- Adding a managed artifact moves: `generate.mjs` `planInstall`, `test-setup.mjs:244`, the
  self-check fixture keys (fact 16), `test-update.mjs` pins, a migration + `migrations/index.json`,
  the version bump, the CHANGELOG block; the example cycle asserts keys, not a committed rendered set.
- A new migration: `validate-payload.mjs:21-30` (manifest/directory equality, `targetPluginVersion`);
  the example bump numbers itself manifest length + 1 (`run-example-cycle.mjs:510-512`).
- The additions carry is pinned by `test-update.mjs:579-641`, `test-setup.mjs:1139-1218,1475-1488`,
  `run-example-cycle.mjs:541-595`, `aiwf-roles.mjs:357-374`; documented at
  `scripts/setup/README.md:26`, `scripts/update/README.md:17`, `templates/README.md:28`.
- `/pnp:loop` consumers: `README.md:114,198`, `docs/LOOP.md:27`; the self-check's `/pnp:<cmd>` rule
  (fact 14) fails on any remaining `/pnp:loop` string once the directory is gone.
- Gate 3 (`aiwf-selfcheck.js:2443-2446`): a main-session write under `.claude/` is denied while a
  route is open - a rendered stage file is written by the engines, never by hand mid-ticket.
- Hooks carry no doc pointer (`git grep docs/ -- hooks` empty).

## S4. What already exists

- The suppression dual of the preflight (`skills/plan/SKILL.md:60-64`).
- Per-stage reads inside skills and agents (fact 5); the ORCHESTRATOR's References-only list
  (`ORCHESTRATOR.md.tmpl:181-196`) routing a rule to its section.
- The additions-block carry (fact 10) and the subdirectory-safe writes (fact 9).
- Creating a new whole-file managed artifact through `rerender-managed-region` (fact 12, 0012).
- The `Retires local rules:` convention (fact 19); the `note` op printing `docRefs`.
- The brief skeletons under `templates/briefs/` (writer-dispatch 9 lines, record 77).

## S5. Paths touched without being named

- This repository's own self-install (`.claude/aiwf-native/ORCHESTRATOR.md`, `.claude/agents/*`,
  root `CLAUDE.md` region) - re-rendered by `/pnp:update --apply` on this repository at the release.
- `D:\pnp-live` - what sessions load; refreshed after every commit on `main`.
- Consumers (Silerax `D:\Stratex`, Furnissimo) - their ORCHESTRATOR / Writer additions blocks hold
  local rules today (RULEHOME-003 diet); their overrides cite payload section names.
- `templates/memory-seeds/*.md` - seven seeds point at WORKFLOW sections by quoted title.
- `migrations/*/NOTES.md` `docRefs` and the fixture note `docs/LOOP.md#commit-gate`
  (`test-update.mjs:199`).
- `scripts/native/{ps,sh}/codex-*.{ps1,sh}` headers point at the recipe and LOOP.
- Input file re-verification: the sizes at `inputs/DOCSTAGE-2026-10-31.md:39-40` are stale (fact 2
  has today's); § 3.5's grep claim holds for `docs skills templates scripts hooks` and misses the
  README/CHANGELOG hits (fact 7); § 3.4's template lines exist (`writer-dispatch.md:4`, `:9`); § 3.2's
  CANDIDATES:250 one-author compaction finding stands.

## S6. Unknowns

- Whether any suite beyond fact 20 pins a WORKFLOW/LOOP section title or the preflight sentence:
  `git grep -nE "Doctrine preflight|Step 0\.5|IN FULL" -- scripts` (the Writer's closing grep).
- Whether `skills/setup`, `skills/update`, `skills/roles` prose or `aiwf-roles.mjs` name the count or
  the names of re-rendered files beyond the lines above: `git grep -n ORCHESTRATOR -- skills scripts/setup/aiwf-roles.mjs`.
- (superseded 2026-11-01 by DECISIONS D-05 after readiness rounds 1-2: one section splits, at named
  line ranges, and the assignment is complete; the paragraph-coverage check of D-08 verifies it.)
