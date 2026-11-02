# PLAN_DOCSTAGE - the doctrine by stage, rendered into the project

The plan of the roadmap entry `DOCSTAGE` in `dev/backlogs/ROADMAP.md` (Size M). One folder: this
index, `DECISIONS.md` (D-01..D-13), `RESEARCH.md` (the two scans of 2026-11-01, tree at `e8761b6`),
`tickets/DOCSTAGE-NNN.md` (the frozen contract), `records/DOCSTAGE-NNN.md` (written at each
ticket's close). Readiness history: `readiness/DOCSTAGE/`.

## Goal

A session loads only the doctrine of the stage it is in, whole, by construction of the entry
command, and a project's local rules live next to the rule they modify (D-01): every rule of
`docs/WORKFLOW.md`, `docs/LOOP.md` and `docs/REVIEW_CHECKLIST.md` stands in exactly one stage file -
the always-on `ORCHESTRATOR.md` or one of `work.md`, `ticket.md`, `plan.md`, `review.md` (D-02,
D-05) - rendered into the project as a managed artifact with its own project additions block (D-03,
D-04), and each entry door names the files it reads IN FULL (D-06). 001 and 002 ship as ONE
release, 0.3.8, cut at the close of 002 (D-09).

## Scope

In:
- DOCSTAGE-001 (prose, R1 in the main session): the four stage templates under `templates/doctrine/`
  and the core sections added to `templates/ORCHESTRATOR.md.tmpl` - § DOCSTAGE-001 worklist below;
  D-08's control and mid-state runs; the three docs untouched (D-09).
- DOCSTAGE-002 (code, the Writer, release 0.3.8): the four managed keys, the suites and the fixture,
  migration `0033`, the doors re-pointed (D-06), the docs reduced (D-02), `/pnp:loop` removed
  (D-07), the README, the CHANGELOG block with its `Retires local rules:` line (D-11), the bump,
  D-08's final run - § DOCSTAGE-002 worklist below.

Out: the mandatory skeletons through Gate 2, the compaction of `docs/OPERATOR_PROTOCOL.md`,
`docs/SESSION_BRIEF_RECIPE.md` and the skills' bodies, the per-version preflight measurement as a
standing procedure, Step 0.5's version-keyed dual (DECISIONS § Deferred); sentence-level wording
fixes (ROADMAP § DOCTR); the context ceiling (ROADMAP § CTX); any consumer write (Silerax,
Furnissimo) - a consumer takes 0.3.8 through `/plugin update` + `/pnp:update` in its own session.

## Tickets

| ref | title | implements | status | record |
|---|---|---|---|---|
| DOCSTAGE-001 | prose: the four stage templates and the core sections of ORCHESTRATOR, the coverage control and mid-state | D-01 D-02 D-03 D-04 D-05 D-08 D-09 | closed (`78fa59a`) | `records/DOCSTAGE-001.md` |
| DOCSTAGE-002 | code + release 0.3.8: the managed keys, migration 0033, the doors re-pointed, the docs reduced, `/pnp:loop` removed | D-01 D-02 D-03 D-05 D-06 D-07 D-08 D-09 D-10 D-11 D-13 | closed (`955e64c`) | `records/DOCSTAGE-002.md` |

## Order and gates

Order 001 -> 002 (D-09: nothing reads the templates before 002, so the old preflight keeps working
between the two commits). Sessions (D-12): S1 the entry, research, decisions, this planner, the
stamp, the runnability pre-pass and the readiness pass if the context allows, otherwise S2 fresh;
S3a DOCSTAGE-001 on an Opus session; S3b DOCSTAGE-002 and the release on a fresh Fable session.
Numbers are measured (D-10): start 120,000; the two `/context` numbers are asked at 002's close.

- **DOCSTAGE-001** - the operator's word for the ticket; R1 in the main session (overrides § Hard
  rules), no Writer, no auditor (`review.docs` row 0); D-08's control BEFORE the first template is
  written; VERIFY = the prose row plus one render dry-run (procedure below); ONE scan-tier fact-check
  over the diff's prose before the commit (RULEHOME/D-16 (b)); one docs commit through its dialog;
  the live copy refreshed (root `CLAUDE.md` § This repository is the plugin); no bump, no CHANGELOG
  block (D-09); the record `records/DOCSTAGE-001.md` with both D-08 runs and the merged-or-dropped
  list.
- **DOCSTAGE-002** - the operator's word for the ticket; the Writer (`Ticket: DOCSTAGE-002`); the
  fact-check gate; Codex code pass 1 of the `review.code` row riding the ticket's word, any further
  pass on its own word; the code commit through its dialog; the live copy refreshed; the closing
  half: this repository on 0.3.8 through `/pnp:update --apply`, the sweep of THIS repository's own
  consumer layer against the 0.3.8 `Retires local rules:` line (RULEHOME/D-16 (c)) AND for every
  pointer to the three docs (D-09, R1 in `dev/`): `dev/PROJECT_OVERRIDES.md:4-5`, `:109`, `:254`,
  `:266`, `:281`, `dev/VERIFY_RUNBOOK.md:82`, `dev/README.md`, the root `CLAUDE.md` operator zone,
  each re-aimed at the stage file or the map against row B9's exempt list (`dev/REBUILD.md` and
  `dev/backlogs/**` are history and stay), checked by 002's last acceptance line; the format text
  of root `CLAUDE.md` § Changelog format per D-11, the operator asked once for the two `/context`
  numbers of D-10 and the expectation judged in the record; the record commit through its dialog;
  then the tag word and the push word - the tag created locally on the record commit and pushed with
  `main` in one push (overrides § Hard rules :49-51).

## DOCSTAGE-001 worklist (D-01..D-05, D-08)

Pointers at `e8761b6`. The writer of each row is the main session. Sections move WHOLE and
verbatim (D-02); the only edits inside moved text are a cross-stage reference rewritten to the one
line `<stage>.md § <heading>` (D-05) and the ORCHESTRATOR duplicates collapsed (D-02 core).

| id | where | what lands |
|---|---|---|
| A0 | scratch, outside the repository | D-08 control over the untouched tree (procedure below), before A1 |
| A1 | `templates/doctrine/work.md.tmpl` (new) | the D-02 `work.md` sections |
| A2 | `templates/doctrine/ticket.md.tmpl` (new) | the D-02 `ticket.md` sections; of § Durable development history items 4-5 (`docs/WORKFLOW.md:534-572`; complete assignment, D-05); LOOP § Role boundaries WHOLE under `## Role boundaries` (`docs/LOOP.md:30-118`, D-05); § Loop shape and its overrides whole (`docs/WORKFLOW.md:266-305`) |
| A3 | `templates/doctrine/plan.md.tmpl` (new) | the D-02 `plan.md` sections; of § Durable development history everything but items 4-5 (`docs/WORKFLOW.md:517-533`, `:573-681`; complete assignment, D-05); ### The ledger with its fenced skeleton byte for byte (`docs/WORKFLOW.md:651-681`; the pin `scripts/setup/test-setup.mjs:1600-1602` matches ```` ```markdown\n# Ledger ```` and is re-aimed here in 002) |
| A4 | `templates/doctrine/review.md.tmpl` (new) | `docs/REVIEW_CHECKLIST.md` whole, its plan-readiness section included (D-02) |
| A5 | `templates/ORCHESTRATOR.md.tmpl`, above the block `:195-196` | the D-02 core sections; its own duplicates of them collapsed (the four triggers once); the string `records/<REF>.md` kept (pinned by `scripts/update/test-update.mjs:1700-1711`); `:24` and the References-only list `:181-194` left for 002 |
| A6 | every A1-A4 file | the frame of the whole-file templates: a `<!-- TEMPLATE CONTRACT` block first (stripped, `scripts/setup/generate.mjs:244-247`), the `##` headings of the moved sections kept verbatim, ONE empty project additions block last in the form of `templates/ORCHESTRATOR.md.tmpl:195-196` (D-04, `generate.mjs:565`), placeholders only of the set at `generate.mjs:131-133` |
| A7 | scratch, outside the repository | D-08 mid-state run, the render dry-run; both into `records/DOCSTAGE-001.md` |

## DOCSTAGE-002 worklist (D-02, D-03, D-05..D-11, D-13)

Pointers at `e8761b6`; the Writer re-anchors them at the dispatch HEAD.

| id | where | what lands |
|---|---|---|
| B1 | `scripts/setup/generate.mjs:85`, `:1056-1057` | four `addArtifact` calls beside the ORCHESTRATOR one, keys `.claude/aiwf-native/doctrine/{work,ticket,plan,review}.md`, templates `doctrine/<stage>.md.tmpl` through `readTemplate`; unconditional like ORCHESTRATOR |
| B2 | `scripts/setup/test-setup.mjs:183`, `:244`, `:251-252`; `scripts/update/test-update.mjs:137`, `:208`, `:1291-1298`, `:1615`; `scripts/selfcheck/aiwf-selfcheck.js:515-516`, `:585`, `:588`, `:624`, `:2868-2869`; `scripts/ci/run-example-cycle.mjs:308`, `:312`, `:601`, `:615-617` | each hit carries the four keys beside ORCHESTRATOR, or is named exempt with its reason in the hand-back |
| B3 | `scripts/setup/test-setup.mjs:1597-1602` | the ledger-skeleton pin reads the fenced block of `templates/doctrine/plan.md.tmpl` |
| B4 | `scripts/setup/generate.mjs:737`, `:755`; `scripts/setup/test-setup.mjs:737`; `scripts/selfcheck/aiwf-selfcheck.js:1043`, `:1066`, `:6789`, `:6796`; `scripts/engine/pretooluse-dispatch-gate.js:69`, `:125`; `scripts/engine/aiwf-lib.js:132` | a quoted doctrine title or phrase naming `docs/WORKFLOW.md` re-aimed at the stage file whose template carries it |
| B5 | `migrations/0033_<slug>/` (`ops.json`, `NOTES.md`), `migrations/index.json:33` | target 0.3.8; four creating re-renders in the shape of `migrations/0012_orchestrator-role/ops.json:12-18`; ORCHESTRATOR, the CLAUDE.md region and the Writer in the shape of `migrations/0032_rule-homes/ops.json:5-7`; reviewer and qa with `ifRecorded` (`migrations/0024_thin-rendered-files/ops.json:5-10`) when their templates changed; ONE `note` per D-11 |
| B6 | `.claude-plugin/plugin.json:3` | `0.3.8` |
| B7 | `skills/work/SKILL.md:32-36`, `skills/mission/SKILL.md:33-36`, `skills/plan/SKILL.md:54-64`, `skills/review/SKILL.md:186`, `:201`, `skills/qa/SKILL.md:206`, `skills/arbiter/SKILL.md:46`, `:52`, `skills/setup/SKILL.md:3`, `:45`; a NEW Step 0.5 in `skills/review/SKILL.md`, `skills/qa/SKILL.md` and `skills/qal/SKILL.md` (after their Step 0, `skills/review/SKILL.md:31-49`, `skills/qa/SKILL.md:38-56`, `skills/qal/SKILL.md:48-59`); `skills/qal/SKILL.md:152-159` (Role boundaries cites) | D-06: the doors' reads and the dual over the rendered paths; review, qa and qal read core + `ticket.md` IN FULL with the dual; qal's Role boundaries cites at `ticket.md`; arbiter reads the rendered `.claude/aiwf-native/ORCHESTRATOR.md` IN FULL in place of its two payload section reads (`:46`, `:52`); the auditor handed the rendered `review.md`; setup's description (`:3`) and artifact list (`:45`) name the four files |
| B8 | `templates/CLAUDE.md.tmpl:12-19`, `:65-70`; `templates/ORCHESTRATOR.md.tmpl:24`, `:181-194`; `templates/agents/reviewer.md.tmpl:25`, `:39`, `:59`, `:74`, `:79`, `:95`, `:98`; `templates/agents/qa.md.tmpl:22`, `:35`; `templates/agents/writer.md.tmpl:34`, `:61`; `templates/memory-seeds/` (seven files); `templates/README.md:25-31` | D-06 pointers; the References-only list at stage files (D-02 core); the templates contract rewritten to D-01 |
| B9 | EVERY pointer to `docs/WORKFLOW.md`, `docs/LOOP.md`, `docs/REVIEW_CHECKLIST.md` - section form and bare file name - in `docs/`, `skills/`, `templates/`, `README.md`, `scripts/native/`: every "cited by" entry of RESEARCH § S2's inventory not named above, `docs/OPERATOR_PROTOCOL.md:3-5` (the authority statement), `docs/SESSION_BRIEF_RECIPE.md`, `docs/CODEX_REVIEW_QA_RECIPE.md`, `docs/READINESS_CLASSES.md`, `README.md:60`, `:225` | re-aimed at `<stage>.md § <heading>` or the map. Exempt: the map's own pointers, cites of LOOP's kept sections (§ Enforcement of Writer-only writes, § Commit gate, § Honest security model, § Role hosts) and of WORKFLOW § Reproducibility, the wrappers' header pointers to the recipe and LOOP (`scripts/native/ps/codex-qal.ps1:54`, `scripts/native/sh/codex-qal.sh:58`); every cite of § Role boundaries points at `ticket.md` |
| B10 | `docs/WORKFLOW.md`, `docs/LOOP.md`, `docs/REVIEW_CHECKLIST.md`, `docs/README.md:6-17` | D-02: WORKFLOW the map + § Reproducibility; LOOP keeps § Enforcement of Writer-only writes, § Commit gate, § Honest security model, plus a NEW `## Role hosts` table of about eight lines - role, host, cell - new text that copies no rule and points at `ticket.md § Role boundaries` (D-05; § Role boundaries itself moved whole in 001), points at `work.md` for routing; REVIEW_CHECKLIST a pointer stub; the docs index |
| B11 | `skills/loop/`, `README.md:114`, `:198`, `docs/LOOP.md:27`; `skills/loop/SKILL.md:91-94` -> `skills/qa/SKILL.md` at the verdict step (`:371`) | D-07 |
| B12 | `README.md` § Status, `:60`, `:225`; `CHANGELOG.md` | the block `## [0.3.8]` with `### Removed` (D-07) and `Retires local rules:` per D-11 |
| B13 | scratch, outside the repository | D-08 final run, the bar exactly one hit |
| B14 | `scripts/selfcheck/aiwf-selfcheck.js:7666-7679` (`KNOWN_FUTURE` `:7666`, the scan `:7669-7676`) | D-07: a `RETIRED_COMMANDS` map (`loop` -> `0.3.8`) accepted ONLY for files under `migrations/` (`migrations/0022_stab-prose/NOTES.md:9` is history, never rewritten); a retired name anywhere else still fails; a negative control - a retired name planted outside `migrations/` in a scratch copy is reported |
| B15 | `scripts/setup/generate.mjs:888-907` (`ownedDestinations`), `scripts/setup/test-setup.mjs` | D-13: the four stage files and the `doctrine` directory enter the collision list beside the other managed destinations; one test: the overrides document configured onto a doctrine path is a blocker |
| B16 | session scratch folder, outside the repository | the shipped 0033 on a real 0.3.7 layer. The fixture is complete: `.claude/` whole, `CLAUDE.md`, `AGENTS.md`, every artifact `_aiwf.managedRegions` records, `dev/PROJECT_OVERRIDES.md`, `dev/backlogs/ROADMAP.md`, `dev/backlogs/LEDGER.md`, `dev/backlogs/active/`, and every path `aiwf.config.json` `paths.*` names created empty where this repository has none (`.aiwf/`, `dev/changes/`) - the rows the embedded self-check asserts (`scripts/selfcheck/aiwf-selfcheck.js:6724-6770`). Run `node scripts/update/aiwf-update.mjs --apply --project-root <scratch copy>` with this repository as the 0.3.8 payload; red when the apply's exit != 0 (its output read whole), any of the four files is absent, `_aiwf.managedRegions` lacks any of the four keys at `0.3.8`, or `_aiwf.lastMigrationApplied` is not the 0033 id. The update suite's truncated-manifest design (`scripts/update/test-update.mjs:241-247`) stays; this apply is the live proof, repeated on the repository itself in the closing half |
| B17 | `scripts/selfcheck/aiwf-selfcheck.js:7557-7573` | D-06 pinned positively: per door the skill names its stage path AND `IN FULL` - work -> `doctrine/work.md`; mission, review, qa, qal -> `doctrine/ticket.md`; plan -> `doctrine/plan.md`; review, qa -> `doctrine/review.md`; arbiter -> `ORCHESTRATOR.md`; `templates/CLAUDE.md.tmpl` -> `ORCHESTRATOR.md` and the four stage names; a negative control: a door skill copy without its line is reported |

## Procedures

- **D-08 coverage script** (A0, A7, B13). A script in the session scratch directory, never in the
  repository: split `docs/WORKFLOW.md`, `docs/LOOP.md`, `docs/REVIEW_CHECKLIST.md` at `e8761b6`
  (`git show e8761b6:<path>`) into paragraphs on blank lines, fenced blocks as one paragraph,
  whitespace collapsed; count each paragraph's occurrences, normalised the same way, across
  `templates/doctrine/*.tmpl`, `templates/ORCHESTRATOR.md.tmpl` and the current `docs/` three files.
  Output: one line per paragraph whose count differs from the bar, with its source file and line.
  Bars: control (A0) exactly 1; mid-state (A7) exactly 2; final (B13) exactly 1. A paragraph off
  the bar stands on the merged-or-dropped list of the ticket's record, with the paragraph it merged
  into or the reason it dropped, or the run is red. Known off-bar paragraph of the control: the
  four escalation triggers, a pre-existing duplicate (`docs/WORKFLOW.md:813-819` =
  `templates/ORCHESTRATOR.md.tmpl:107-113`) - recorded as such, collapsed to one copy by A5.
- **Render dry-run** (A7, B12, B13). A scratch script importing `templateContext`, `renderTemplate` and
  `carryProjectAdditions` from `scripts/setup/generate.mjs` (`:261`, `:364`, `:585`) renders each
  `templates/doctrine/*.md.tmpl` and `templates/ORCHESTRATOR.md.tmpl` against this repository's
  `.claude/aiwf-native/aiwf.config.json`, then carries a one-line additions block into each render.
  Red: a throw, a `{{` left in the output, a `TEMPLATE CONTRACT` line left in the output; a
  template whose last non-blank line is not `<!-- /project additions -->`, or a render whose carried
  block does not end it (a block not last). Fence comparison: extract the fenced ```` ```markdown ````
  block beginning `# Ledger` from `git show e8761b6:docs/WORKFLOW.md` and from
  `templates/doctrine/plan.md.tmpl` and compare the bytes - any difference is red.

## Measurements

| idea -> approved plan | cycle spend |
|---|---|
| 230,000 (approval 350,000 - start 120,000; both `~/.claude/ctx/<session>.pct` x `.size`, 35 % and 12 % of 1,000,000) | 890,067 |

Parts of the cycle spend, one per line, with the source of each value:

- research agent A (sonnet, the prose surface) - 106,643 - notification
- research agent B (sonnet, the engines and the hooks) - 165,997 - notification
- the planner (writer type, three turns: the plan, revision 1, revision 2) - 182,351 cumulative - notification (the last one)
- the runnability pre-pass (sonnet) - 85,568 - notification (the last one)
- Codex readiness pass 1 (gpt-6-sol xhigh, cold) - 123,210 - round header (`readiness/DOCSTAGE/round-1.md`)
- Codex readiness pass 2 (gpt-6-sol xhigh, cold, on the operator's word) - 226,298 - round header (`readiness/DOCSTAGE/round-2.md`)

The sum is arithmetic over six printed values, not a measurement of its own; no part is estimated.
Session: one (S1, Fable 5.1, 2026-11-01) - the entry, research, decisions, planner, stamp, pre-pass,
both passes, two revisions, approval and landing.

## Roadmap entry

- Goal: a session loads only the doctrine of the stage it is in, whole, by construction of the entry command, and a project's local rules live next to the rule they modify
- Why: „ние отваряйки сесия независимо от командата започваме работа и това изисква четене на доктрина ... доктрината да бъде разделена на секции" and „във всеки файл носещ някакви правила да има Local rules секция, така overrides остава само продуктови" (operator 2026-10-18, relayed by the arbitration session)
