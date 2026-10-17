# RESEARCH - plan RBA (REBUILD plan A: the structure)

Two `sonnet` scan agents, 2026-10-17, read-only over the tree at `edd6a74`. Pointers, not prose; a
line number is what the agent saw at that commit and is re-verified by whoever acts on it.

## Code Map (file -> role today)

| file | role |
|---|---|
| `scripts/setup/generate.mjs` | setup generator: transfer-surface seed (:677-681 resolve, :820-940 judge, :1083-1103 write-if-absent, no bookkeeping by design :1084-1089); `renderTemplate` :361, `templateContext` :258-275; dirs under plansDir :1179; `existingPlansWarning` :698-713 (flat scan, Gate 2's predicate) |
| `scripts/update/validate-payload.mjs` | payload validator: `OP_SPECS` :105-152 (four ops), `OP_TYPES` :154, unknown-op error :335; rerender rules :357-391; manifest shape :205-256; ops.json shape :307-315; last manifest entry MUST equal plugin.json version :258-268 |
| `scripts/update/migrate.mjs` | update engine: `planOperation` switch :380-402, `operationKey` :365-374, `note` rendering :383-391, rerender executor :429-475 (always overwrites, `createIfAbsent` ignored :434-435, records `managedRegions` :472) |
| `scripts/update/test-update.mjs` | update suite: `makePayload`/`project`/`install`/`update`/`check` helpers; add-config-key section :733-762; createIfAbsent section 15 :1302-1400; 0023 AGENTS.md section :1416 |
| `scripts/setup/test-setup.mjs` | setup suite: transfer-surface section 24 :1551-1650 (skeleton headings asserted :1559 incl. `## Candidates`; seeded exactly :1568-1571; no bookkeeping :1575-1577; second install zero diff :1583-1589; configured key :1598-1606; operator file preserved :1615-1623; directory at path refused :1768-1777); dirs exist :187; existing-plans warning :644 |
| `scripts/selfcheck/aiwf-selfcheck.js` | self-check: transfer-surface rows 3b2 :1909-2013; OP_TYPES copy :6922; provenance walk covers `.tmpl` :6355/:6494; plan-ref section :989-1041 (`PLAN_FILE_RE` :989, ABBR grammar :993, flat scan, subdirs IGNORED), fixtures :1043-1230; `plans-active-subdir` :5539; PLAN GATE section 5c :3856-4300 (fixtures :3872-3917, M cases :4152-4167, W1-W9 :4169-4196, G1-G7 :4198-4223, sabotage controls :4225-4300); `PLAN_GATE_ENGINE_FILES` :2698 |
| `scripts/engine/pretooluse-dispatch-gate.js` | Gate 2: `TICKET_LINE` :70; `plansDirOf` :117-121; `lookupTicketRef` :149-216 (targeted `active/PLAN_<ABBR>.md` :156-167, `refRegex` match anywhere :181, flat fallback scan `isFile && /^PLAN_.*\.md$/` :197-209); ask text hard-codes `PLAN_*.md` :244 (asserted by selfcheck :835); reviewer + `Class: plan` branch :276-297; exports :315 |
| `scripts/engine/pretooluse-mutation-guard.js` | Gate 1 + Gate 3: plansDir read only for the transfer surface :152-172 |
| `scripts/engine/plan-gate.js` | today's plan gate (441 lines): exports :441 `checkPlanBrief`, `planHash`, `isPlanBrief`; CLI :368-439 (`--project-root`, `--plan-class`, `--hash`); brief lines `Class: plan`, `PLAN:`, `TICKETS:`, `CONSEQUENCE SCAN:`, `OWN PASS:` (:52-65, :94, :122-131); tokens list in the agent report; exit 0 silent / 2 with `plan-gate: <token> - <message>` :419-423 |
| `scripts/native/ps/codex-review.ps1` | plan-gate call :215-230 (`--plan-class` when `-Class plan`; refuses on `-not $? -or $LASTEXITCODE -ne 0`) |
| `scripts/native/sh/codex-review.sh` | plan-gate call :227-241 (`GATE_ARGS+=(--plan-class)`; `|| fail`) |
| `scripts/spike/run-spikes.mjs` | Gate 2 off-plan fixtures :260-359, gate2-plan G1/G2 :320-359 |
| `templates/PNP_CANDIDATES.md.tmpl` | 25 static lines, no placeholders; Candidates bullet :9, `## Candidates` heading :18 |
| `docs/WORKFLOW.md` | Gate 3 allowlist :588-589; § The transfer surface :817-849 (skeleton verbatim :824-849, Candidates :833/:842); plan landing :246; Gate 2 lookup :578; archiving :733-791; plansDir layout :763-764 |
| `docs/LOOP.md` | Gate 3 surface path :169; Gate 2 lookup :141 |
| `schema/aiwf.config.schema.json` | `paths.plansDir` :297-301 (default `docs/backlogs`); `paths.transferSurface` :309-313 (no default) |
| `skills/*/SKILL.md` | readers of `active/`: mission :39,:42; work :46-50; brief :34; loop :63,:71; setup :76-95; review :459-464, Steps 2a-2e :197-513, brief block :552-563, `--hash` :408, brief file :603; arbiter :59-60 (transfer surface) |
| `templates/memory-seeds/finished-plan-is-archived.md` :7, `templates/PROJECT_OVERRIDES.md.tmpl` :192 | restate the active/archive move |
| `migrations/0011_transfer-surface/ops.json` :8 | the note that no migration op may ever address the transfer surface |
| `examples/` | no active-plan fixture; the cycle asserts the REPO byte-identical (`run-example-cycle.mjs` :14-17, :95-97, :630), seeded files land in the work dir only |
| `dev/answers.json` | plansDir `dev/backlogs`, no `transferSurface` key; `dev/backlogs/CANDIDATES.md` has NO `## Candidates` heading (entries are individual `##` sections; ledgers at :1395, :1419, :1544) |

## What the code does today (the facts the decisions rest on)

1. A seeded-once, operator-owned file exists in exactly one form - the transfer surface: setup writes
   it if absent, records nothing, never rewrites. No migration op can create such a file: the four
   ops are `add-config-key`, `rerender-managed-region` (always overwrites, makes the file managed),
   `reconcile-ask-ruleset`, `note`.
2. `migrations/index.json` last entry version == `.claude-plugin/plugin.json` version is a hard
   validator error. Current: `0024_thin-rendered-files` / `0.2.20` == `0.2.20`.
3. A directory under `<plansDir>/active/` is invisible to every reader: Gate 2 skips it (ask dialog
   for a ref inside it), the self-check plan-ref section ignores it (no failure), setup's HARD-003
   warning does not count it. Nothing throws on it.
4. The plan gate's contract is the struck readiness artifacts (scan table, own-pass file with SHA and
   instruments table); its tests are self-check 5c + two spike cases, fixtures generated in code.
5. No script or skill checks the archive file name; only `docs/WORKFLOW.md` :733-791 states it.
6. `test-setup.mjs:1559` asserts the transfer-surface skeleton contains `## Candidates`.

## Unknowns left to the Writer (confirm before acting; none changes the design)

- `TICKET_HEADING_RE` text in the self-check; the exact `$planGateArgs` list in `codex-review.ps1`.
- Whether `run-example-cycle.mjs` asserts anything about the installed tree beyond the repo diff.
- Whether `dev/backlogs/PNP_CANDIDATES.md` exists (irrelevant to the tickets; the real file in use
  is `dev/backlogs/CANDIDATES.md`).
