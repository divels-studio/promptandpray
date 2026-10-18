# RESEARCH - plan GENERIC (2026-10-18)

Two sonnet scan agents, fresh context: A = the rules surface (align-decision C-rows vs
`dev/PROJECT_OVERRIDES.md` vs the payload), B = the mechanics surface (transfer surface, migrations,
CLAUDE.md region, roadmap landing, audit-table prints). Pointers are to HEAD `0cf97e7`.

## Code Map

| file | role today |
|---|---|
| `dev/backlogs/drafts/align-2026-10-16/align-decision.md` | input: C1-C4 action table (snapshot predates RBC-002) |
| `dev/backlogs/drafts/align-2026-10-16/rules-pnp.md`, `rules-matrix.md` | input: PNP-NNN ids per C-row |
| `dev/PROJECT_OVERRIDES.md` | local overrides (363 lines); carries most ADOPT rows already (RBC-002) |
| `docs/WORKFLOW.md`, `docs/LOOP.md`, `docs/REVIEW_CHECKLIST.md` | payload doctrine - the rule homes |
| `docs/CODEX_REVIEW_QA_RECIPE.md`, `docs/OPERATOR_PROTOCOL.md` | adjacent payload doctrine (Codex flags; three doors) |
| `templates/PROJECT_OVERRIDES.md.tmpl` | seeded once, never re-rendered |
| `templates/ORCHESTRATOR.md.tmpl`, `templates/CLAUDE.md.tmpl` | managed artifacts (re-render = migration) |
| `templates/PNP_CANDIDATES.md.tmpl`, `templates/ROADMAP.md.tmpl` | seed-once templates (surface, roadmap) |
| `templates/briefs/planner.md`, `record.md`, `readiness-codex.md`, `research.md` | run-time briefs |
| `templates/memory-seeds/` (17 files) | printed by setup; a home of the enumeration grep |
| `schema/aiwf.config.schema.json` | `paths.transferSurface`, no default, fallback in prose |
| `scripts/engine/pretooluse-mutation-guard.js` | Gate 3: surface + roadmap one-file allows, own fallback copy |
| `scripts/setup/generate.mjs` | seeds surface and roadmap, renders the CLAUDE.md region |
| `scripts/update/migrate.mjs`, `validate-payload.mjs` | op semantics (`seed-file`, `rerender-managed-region`, `add-config-key`); payload validator |
| `scripts/selfcheck/aiwf-selfcheck.js`, `scripts/setup/test-setup.mjs`, `scripts/update/test-update.mjs`, `scripts/spike/run-spikes.mjs` | pin the surface name, the seed and the roles CLI |
| `scripts/ci/run-example-cycle.mjs`, `examples/example-project/` | tree hashed before/after; bump built dynamically |
| `migrations/index.json`, `migrations/0025_roadmap-seed/` | manifest; the newest migration (the model) |
| `skills/plan`, `work`, `mission`, `roles`, `setup`, `arbiter` (SKILL.md) | roadmap/landing, audit-table prints, ledger reader |
| `CHANGELOG.md`, `.claude-plugin/plugin.json`, `README.md` | release block, version, README version line |
| `CLAUDE.md`, `.claude/aiwf-native/aiwf.config.json`, `dev/answers.json` | self-install: root region, bookkeeping, answers |
| `dev/backlogs/ROADMAP.md`, `dev/backlogs/CANDIDATES.md` | the GENERIC entry; the current surface (1662 lines) |

## What the code does today

### A. Rules (agent A)

1. The overrides carry no explicit product/machine marker on any section. Machine/product content:
   portions `dev/PROJECT_OVERRIDES.md:184-189`, runbook `:191-193`, CI proof `:181-182` and `:51-53`,
   context source `:260-264` (the only self-declared machine-local section), start number `:266-270`.
2. `Retires local rules:` lines: `CHANGELOG.md:50-53` (0.3.0, last paragraph of the block, lowercase
   phrases separated by `;`, no ids); `CHANGELOG.md:107` (0.2.20, `none`). No script reads the line;
   `skills/update/SKILL.md:53` prints the blocks to consumers.
3. Rules that live only in the operator's memory, not in the overrides: PNP-088/089/090/092/093/094/
   095/105 (C-010, C-022, C-026, C-028, C-029, C-030, C-091, C-096).
4. REBUILD § Corrections (`dev/REBUILD.md:142`): the checkpoint rule (C-016/017/018) and chain-trace
   (C-020) STAY local - excluded from this plan's homing.
5. Per-C-row table (PnP rows only; n/a rows skipped). "partial" = related text, substance not stated.

| C-id | rule (short) | overrides | payload | note |
|---|---|---|---|---|
| C-015 | fresh scan agent runs checks, fixes nothing; Writer runs only its red-seen test | partial `:195-197` | partial `WORKFLOW.md:57-62`, `:204-207` | PnP's VERIFY shape is machine-specific |
| C-016/17/18 | checkpoint file, 950k/1000k | partial `:309-317` | no (`WORKFLOW.md:336` ships none) | stays local (fact 4) |
| C-019 | readiness only through `/pnp:review` Class: plan | no | partial `WORKFLOW.md:281-330` | - |
| C-020 | chain-trace in the evidence pack | no | partial `REVIEW_CHECKLIST.md:54-55` | stays local (fact 4) |
| C-021 | only what is new; no retelling; status one line | yes `:234-236` | partial `WORKFLOW.md:131-134` | - |
| C-022 | „да" covers only the named action; config change needs an apply word | no (memory PNP-090) | no (`WORKFLOW.md:154-157` is a different rule) | - |
| C-023 | out-of-scope finding -> operator with a destination, at ticket's end | yes `:328-330` | partial `WORKFLOW.md:431-434` | - |
| C-025 | routing tiers Fable/Opus, never Sonnet | yes `:306-308` | partial `WORKFLOW.md:623-629` (top/cheap) | model names = project fact |
| C-026 | judging agent never below the session model | no (memory PNP-092) | partial `templates/agents/reviewer.md.tmpl:19-21` | - |
| C-028 | no review dispatch from precedent | no (memory PNP-089) | no | - |
| C-029 | each paid pass = quota start/stop pair | no (memory PNP-093) | no (`CODEX_REVIEW_QA_RECIPE.md:80` quota only) | Codex-specific |
| C-033 | worktree remove, memory dir delete = destructive | yes `:36` | partial `OPERATOR_PROTOCOL.md:132-133` (memory dir only) | - |
| C-034 | ticket born mid-work: plan committed ONCE after answers | yes `:325-327` | partial `WORKFLOW.md:158-166` | - |
| C-035 | previous ticket's blockers enter the next brief | no | partial `WORKFLOW.md:676-677`, `skills/review/SKILL.md:153-156` | 0.3.0 Retires line claims it |
| C-036 | N surfaces -> N fixtures/asserts | no | no | - |
| C-037 | delete/edit of an entity checks its references | no | partial `templates/briefs/readiness-codex.md:40`, `research.md:19` | - |
| C-038 | no pointer-refresh agent; delta scans parallel | no | no (mechanics removed, `CHANGELOG.md:46-48`) | dead rule |
| C-039 | a turn of its own is not a stop | no | yes `templates/ORCHESTRATOR.md.tmpl:78-92` | done |
| C-042 | resource checks are the COO's own | yes `:337-338` | no | - |
| C-043 | no `cd` prefix on ANY command | yes `:73-74` | partial `CLAUDE.md.tmpl:78`, `writer.md.tmpl:50-52` (git only) | - |
| C-044 | never pipe a test run through tail | yes `:81` | no | - |
| C-047 | never a whole PLAN in front of the operator | yes `:245-246` | partial `skills/plan/SKILL.md:196-197` | - |
| C-048 | no `/pnp:brief` when the state is durable | yes `:251-253` | no | - |
| C-049 | the COO runs scripts itself; `!` only when blocked | yes `:75-76` | no | - |
| C-050 | resume memory = current state, rewritten whole | yes `:358-360` | no | - |
| C-053 | repo copy of a live artifact refreshed at the canon moment | yes `:361-363` | no | - |
| C-054 | the gate is not prompted; refusal is an answer | yes `:249` | no | - |
| C-055 | agents without dialogs except at the gates; Writer brief carries the line | yes `:318-320` | no | - |
| C-058 | Writer's reply <= ~25 lines | yes `:339-340` | partial `templates/briefs/planner.md:38` (planner only) | - |
| C-059 | COO reads the whole diff, records it in `.aiwf/<REF>-diff-review.md` | no | partial `CLAUDE.md.tmpl:27-30` (reads the full diff) | - |
| C-060 | a session reads only the shared sections + its ticket | no | partial `WORKFLOW.md:332-336` | 0.3.0 Retires line claims it |
| C-061 | COO line names the model | yes `:306-308` | partial `WORKFLOW.md:624`, `planner.md:29` (top/cheap) | - |
| C-062 | paid passes stated in the first sentence; euro | yes `:331-333` | partial `WORKFLOW.md:449-452` | - |
| C-063 | a dead paid pass waits for the word; resume id | yes `:334-336` | partial `skills/review/SKILL.md:405`, `CODEX_REVIEW_QA_RECIPE.md:137` | - |
| C-065 | > ~5 min -> background, timeout >= 3600000, no restart | yes `:82-84` | partial `writer.md.tmpl:105-109` | - |
| C-066 | a file count on disk is not a runner count | yes `:205-206` | no | - |
| C-069 | on an objection stop the tools | yes `:247-248` | no | - |
| C-070 | informal address | yes `:250` | no (`PROJECT_OVERRIDES.md.tmpl:125` language only) | - |
| C-072 | analyse and decide; no built mockup | yes `:242-244` | partial `WORKFLOW.md:109-127` | - |
| C-073 | a documentation claim is a hypothesis; code wins | yes `:85-87` | partial `WORKFLOW.md:195-202`, `:391-395` | - |
| C-005 | VERIFY proportional | yes `:171-182` | partial `WORKFLOW.md:366` | test policy is local by design (`WORKFLOW.md:711-715`) |
| C-006 | test routing; E2E never visual | yes `:158-165` | pointer only `WORKFLOW.md:711-715` | same |
| C-008 | changelog caps | no in overrides; root `CLAUDE.md` operator zone has them | `CLAUDE.md.tmpl:109-116` (no caps) | project convention |
| C-009 | heavy ticket in a fresh session on the operator's word | partial `:315-316` | partial `WORKFLOW.md:332-336`, `:462-464` | - |
| C-010 | resume with explicit `-ResumeId`; bare `-Resume` only with one session | partial `:336` | partial `CODEX_REVIEW_QA_RECIPE.md:104,132-139` | Codex-specific |
| C-011 | small-round dual is the payload's; prose takes no audit question | yes `:321` | yes `WORKFLOW.md:236-245` | done |
| C-012 | auto mode blocks config edits: ask first, never bypass | yes `:77-80` | no | - |
| C-013 | candidate registered where born, with retrigger/expiry | yes `:356-357` | partial `WORKFLOW.md:520-521,556` | - |
| C-014 | bump manual, never by a hook; tag its own word | yes `:30-31,46-53` | partial `WORKFLOW.md:471-475`, `:742-746` | - |
| C-091 | PNP-105 shell-redirection workaround | no (memory) | no | machine-specific |
| C-096 | PNP-088 memory pointer | memory | yes `WORKFLOW.md:117-121` | done |
| C-099 | a word for content is not a word to write into a live foreign tree | yes `:62-63` | yes `WORKFLOW.md:655-661` | - |
| C-103 | no AI attribution in git | yes `:58-61` | no | operator policy |
| C-104 | whole-file restructure announced first | yes `:70-72` | no | - |
| C-105/106 | marker rule; English everywhere | yes `:220-228` | no (`PROJECT_OVERRIDES.md.tmpl:131`) | - |

### B. Mechanics (agent B)

6. `paths.transferSurface`: schema `schema/aiwf.config.schema.json:309-314` (no default, fallback named in
   prose `:313`); Gate 3 in `scripts/engine/pretooluse-mutation-guard.js` - `TRANSFER_SURFACE_BASENAME =
   'PNP_CANDIDATES.md'` `:152`, `resolveTransferSurface` `:172-182`, `containedSurface` `:196-211`,
   allow `:300`, deny text `:303`; roadmap allow `:188-193`, `:301`. `aiwf-lib.js` has no surface logic.
7. `scripts/setup/generate.mjs`: basename + resolver `:680-686`, roadmap `:694-697`, path vetting
   `:835-958`, surface seed from `PNP_CANDIDATES.md.tmpl` `:1167-1175` (present = note only), roadmap seed
   `:1181-1190`, CLAUDE.md region render `:1064-1065` (`REGION_ID = 'aiwf-core'` `:90`).
8. The fallback name `PNP_CANDIDATES.md` is a literal in: schema `:313`, guard `:152`, generate `:680`,
   `validate-payload.mjs:184`, selfcheck `:2207-2214`, `test-update.mjs:1588-1589`, `LOOP.md:134`,
   `WORKFLOW.md:536`, `skills/arbiter/SKILL.md:59-60`.
9. Tests pinning the surface: selfcheck 3b2 `:2130-2154` (fixture `dev/backlogs/CANDIDATES.md` `:2154`),
   fallback rows `:2207-2214`, roadmap rows `:2222-2254`; `test-setup.mjs` §24 `:1579-1860` (`SURFACE_TMPL`
   `:1581`, section headers asserted `:1587`, the "Candidates live in ROADMAP.md" line `:1590-1591`, byte
   compare seed vs template `:1599-1601`, `:1634`), §24b roadmap `:1879-1973`; `test-update.mjs` seed faces
   `:1459-1603` (`[seed-12]` `:1537-1549`, `[seed-20]` `:1588-1589`); spikes `:197-218`, `:628`.
10. `migrations/index.json`: array of `{id, targetPluginVersion}`, last `0025_roadmap-seed` -> 0.3.0; prefix =
    position + 1 (`validate-payload.mjs:273`); last entry must equal `plugin.json` version (`:294-304`);
    versions strictly monotonic (`:284`); directory set = manifest set (`:306-319`); `NOTES.md` required
    (`:330`); `ops.json` keys (`:342-352`); per-op exact field set, referenced templates must exist (`:473-484`).
11. `migrations/0025_roadmap-seed/ops.json`: `seed-file` ROADMAP + `rerender-managed-region` for
    `CLAUDE.md#aiwf-core`, `ORCHESTRATOR.md` (region null), `reviewer.md` (`ifRecorded: true`); `NOTES.md`
    sections "What changes", "What this migration does", "Superseded local rules".
12. `seed-file` (`validate-payload.mjs:152-161`, `:174-188`; `migrate.mjs:490-499`, `:505-529`, `:549-557`):
    `{op, template, target}`, target's first segment the token `<plansDir>/`, template whole (no `#`);
    present = kept, absent = exclusive create (`wx`), never recorded in `managedRegions` (`:482-484`).
    **`resolveSeedTarget` THROWS when the target equals the installation's transfer surface - the
    configured key OR the default fallback** (`migrate.mjs:487`, `:521-527`, `resolveTransferSurface(paths)`;
    case-folded on win32/darwin); the validator refuses only
    `<plansDir>/pnp_candidates.md` (`:184`). Migration 0011's promise "no op ever addresses the surface"
    is quoted at `validate-payload.mjs:156`, `migrate.mjs:487`, `test-update.mjs:1546`.
13. `add-config-key` (`validate-payload.mjs:106`, `:386-390`; `migrate.mjs:22`, `:394`): `{path, default,
    askOperator, question}`; skips a present key; `askOperator: true` asks the operator for the value
    (`test-update.mjs:733-805`); cannot target `_aiwf`.
14. `rerender-managed-region` (`migrate.mjs:441-479`): always writes the fresh render; `ifRecorded` skips an
    unrecorded key (`:444`); with `region` -> `spliceRegion` (`:101`, bytes outside markers kept); whole
    `.md` -> `carryProjectAdditions` (`<!-- project additions -->` survives); bookkeeping
    `managedRegions[key] = payload version` (`:476`).
15. `templates/CLAUDE.md.tmpl` (116 lines): markers `:1` / `:95`; last managed section "## Where each COO
    rule lives" `:81-93`; operator zone `:97-116` (Operator channel, Changelog format); doctrine preflight
    `:62-67`; audit-table pointer `:60`. Root `CLAUDE.md` (141 lines) lines up 1:1 through `:95`; operator
    zone `:97-141` ("This repository is the plugin" `:123`).
16. `skills/plan/SKILL.md`: Step 1 entry format `:47-74` (duplicated in `templates/ROADMAP.md.tmpl:6-15`);
    Step 6 landing `:211-229` (re-stamp, move, update `Plans:`/`Status: planned`, add, one commit) writes
    nothing into the index but `## Measurements` (`:202-209`); no preflight step; Step 0 `:15-30`.
    `skills/work/SKILL.md:32-36` Step 1 is the preflight model. No "suppression dual" text in any skill.
17. `docs/WORKFLOW.md` archiving paragraph `:477-488` says nothing about the roadmap entry; layout block
    `:495-502` ("one entry per idea, its plans listed under it"); § The cycle `:290-300`; landing files
    `:175`, `:272`; § The transfer surface + skeleton `:533-563`; guard (h) `:189-193`; arbiter ledger `:691`,
    `:704`. `templates/briefs/planner.md:20-23`: index = title, `## Goal`, `## Scope`, `## Tickets` - no Why
    slot; `plan-gate.js` does not enforce `## Goal`; the index is hashed (`plan-gate.js:50`).
18. Audit-table prints: `skills/work/SKILL.md:39-42` (Step 2), `skills/mission/SKILL.md:59-62` (Step 5),
    `skills/roles/SKILL.md:34-51`, `skills/setup/SKILL.md:157-168`. No test pins the print in work/mission/
    setup; selfcheck `:5096-5254`, `:5431-5444` and `test-setup.mjs:1405-1446` exercise the CLI itself.
    Prose: `README.md:202,213`, `docs/OPERATOR_PROTOCOL.md:98`, `docs/WORKFLOW.md:219`, `CLAUDE.md.tmpl:60`.
19. `dev/backlogs/CANDIDATES.md`: 1662 lines (`wc -l`); header `:1` (Cyrillic, dev/ allowed); pointer notice
    `:3-4`; pointer lines `:6-10` (RBA `:6`, RBB `:7`, RBC `:9`, SCRATCH-dropped `:10`); `## Ruling ledger`
    `:1404`, `## Pass statistics` `:1435`, `## Event ledger` `:1562`, `## D2 pointer rows` `:1651`; ~60 other
    `##` sections `:18-1394`. Precedent for a per-plan ledger file: `readiness/RGATE/ledger.md`,
    `readiness/LEAN/ledger.md`, `readiness/STAB/ledger.md`, `readiness/PLB/ledger.md`.
20. Versions: `plugin.json:3` 0.3.0; `README.md:22` `**v0.3.0. Public since 0.2.0.**`; `CHANGELOG.md:7`
    `## [0.3.0] - 2026-10-17`; self-install `aiwf.config.json:4` installedPluginVersion, `:5`
    lastMigrationApplied, `:6-12` managedRegions (`CLAUDE.md#aiwf-core` 0.3.0, `ORCHESTRATOR.md` 0.3.0),
    `:225` transferSurface = `dev/backlogs/CANDIDATES.md`, `:222` plansDir = `dev/backlogs`.
21. Example cycle (`scripts/ci/run-example-cycle.mjs:15`, `:95-97`, `:496-538`, `:630`): the tree is hashed
    before/after; the bump migration is built at run time (manifest length + 1, `major.(minor+1).0`); a new
    0026 migration or a new template needs no change under `examples/`.
22. Provenance gate: `aiwf-selfcheck.js:6948` (areas), `:6975` (Cyrillic), `:7035-7107` (origin tokens,
    e-mails, drive-letter paths; `PROV_ABS_ALLOW`), negative controls `:7168-7185`. Payload integrity
    `:6725-6800`: every `docs/*.md`, schema, migrations, scripts path named in skills/docs/templates/
    migrations must exist (`:6766`). No assertion pins the prose of WORKFLOW/LOOP/REVIEW_CHECKLIST.
23. `templates/memory-seeds/`: read by `generate.mjs:1346`; several seeds cite WORKFLOW headings (guards
    a, b, d, e, § COO owns broad scans, § How the COO speaks) - `WORKFLOW.md:72` makes them a home of the
    enumeration grep on every doctrine change.

## Consumers and adjacent contracts

- **Surface rename (template + fallback)**: every literal in fact 8 moves together, plus `test-setup.mjs`
  §24 asserts (`:1581`, `:1587`, `:1590-1591`), selfcheck 3b2 fallback rows, `test-update` `[seed-20]`,
  `validate-payload.mjs:184`; `generate.mjs:1167-1175` is the only setup writer; `skills/arbiter/SKILL.md:57-60`
  reads the Ruling ledger section; `templates/ORCHESTRATOR.md.tmpl:166-174` and `templates/briefs/record.md:24`
  name "the transfer surface"; `dev/PROJECT_OVERRIDES.md:228,296`, `dev/VERIFY_RUNBOOK.md:8`,
  `dev/REBUILD.md:230` name CANDIDATES.md.
- **Seed order**: the `seed-file` of `<plansDir>/LEDGER.md` must run while `paths.transferSurface` still
  points elsewhere (fact 12); in PnP the key is `dev/backlogs/CANDIDATES.md` (fact 20) - the hand switch of
  the key comes after the seed. A consumer with the key present keeps it (`add-config-key` skips, fact 13).
- **Managed templates**: `CLAUDE.md.tmpl` and `ORCHESTRATOR.md.tmpl` changes ship as `rerender-managed-region`
  + bump (0025 pattern, fact 11); the root `CLAUDE.md` region is refreshed only by `/pnp:update` (fact 15).
  `ROADMAP.md.tmpl` and the surface template are seed-once: a text change reaches new installs only.
- **Bump surfaces**: `plugin.json:3`, `README.md:22`, `migrations/index.json`, the new directory,
  `CHANGELOG.md` block ending `Retires local rules:`, and the self-install bookkeeping (`aiwf.config.json:4-12`)
  which `/pnp:update` refreshes; selfcheck `version-stamp` (~`:5930`) is red until the self-install is at 0.3.1.
- **Roadmap entry format**: `skills/plan/SKILL.md:59-68` and `templates/ROADMAP.md.tmpl:6-15` duplicate it;
  `dev/backlogs/ROADMAP.md:6-15` carries the seeded copy; `WORKFLOW.md:495-502` describes it.
- **Overrides trim**: `test-setup.mjs:1324-1334` (template contract comment), `:186`, `:661-706` (seeded once)
  pin the template, not the document; the provenance grep is the prose gate (`PROJECT_OVERRIDES.md:54-57`).
- **Memory files** (fact 3) live outside the repo; a rule homed in the payload leaves its memory as a pointer.

## Unknowns

1. Whether `add-config-key` accepts a `<plansDir>/`-tokenised default - unneeded if the op uses
   `askOperator: true` (fact 13); settle by Read of `migrate.mjs:394-440` if a literal default is wanted.
2. Whether selfcheck or `test-setup` has an orphan-template inventory that goes red on a renamed template -
   Grep `readdirSync.*templates` in `aiwf-selfcheck.js` and `test-setup.mjs`.
3. Whether any test pins the line count of `templates/CLAUDE.md.tmpl` - Grep `CLAUDE.md.tmpl` in the three
   suites (agent B saw only ops fixtures at `aiwf-selfcheck.js:2572,2578`).
4. Whether `migrations/0011_transfer-surface/NOTES.md` words the "never a migration target" promise so that
   a seed beside the surface contradicts it - Read that file.
5. Whether `.github/` workflows key on the manifest length or the version - Glob `.github/**`.
6. Whether `skills/review/SKILL.md` plan-readiness mode already states C-019's "skill loaded before any scan
   agent" - Read its plan-readiness section.
