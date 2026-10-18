# DECISIONS - plan GENERIC

Operator words verbatim where they are the source (ROADMAP § GENERIC, 2026-10-18); everything else is
the COO's engineering call with its one-line why. `RESEARCH.md` facts are cited as `fact N`.

## Decisions

- **D-01** One home per generic rule, three buckets, read off RESEARCH fact 5 row by row: (a) the payload
  already carries the substance -> the local copy is deleted (a clause the payload lacks survives as one
  line with its marker); (b) a generic rule the payload lacks -> ONE sentence in `docs/WORKFLOW.md`,
  `docs/LOOP.md` or `docs/REVIEW_CHECKLIST.md`, the local copy deleted, its name on the 0.3.1 `Retires
  local rules:` line; (c) product / machine / config rows stay local and gain the marker `(product)` or
  `(machine)` at the end of their line. Operator: „тези 40 правила от консолидацията къде и кога влизат".
  plan: GENERIC
- **D-02** Bucket (b) rows and their homes - WORKFLOW § How the COO speaks to the operator: C-021, C-047,
  C-062 (first-sentence + euro), C-070; § The operator does not arbitrate: C-028, C-042, C-054, C-063,
  C-072; guard (a): C-069; guard (b): C-022, C-034 (commit ONCE after the answers / open question); guard
  (d): C-049; § Out-of-scope failures found during work: C-023; § Ticket brief contract: C-035, C-055;
  § Verifying failure claims: C-044, C-073; § Durable development history: C-013 (retrigger/expiry),
  C-014 (bump manual, never by a hook), C-050, C-053, C-066; § Plan readiness review (the session rule):
  C-009, C-048, C-060; § COO owns broad scans (model policy): C-026; § COO routing: C-061 (the COO line
  names the model; `templates/briefs/planner.md:29` follows); § Commit & Push Authority: C-033; § The COO
  write boundary: C-059 (the diff-review file under `<scratchDir>/<REF>-diff-review.md`, folded into the
  record at close); § Tests: C-015's generic core (a check agent fixes nothing; the Writer runs only the
  tests it adds, red then green); § Plan readiness review (the pass): C-019 (a readiness pass runs only
  through `/pnp:plan` Step 6, which applies `/pnp:review` Step 3's dispatch mechanics, the skill loaded
  before any scan agent; a hand-built readiness is a route violation - round-1 B13); § Loop shape and its
  overrides: C-105 (a rule record in the overrides carries its marker `(operator rule <date>)`, not its
  story); § Ticket brief contract (the language paragraph): C-106 (everything in the tree is English -
  plans, records, memory, commits; the operator's own words are quoted verbatim in their language).
  LOOP § Role boundaries (the shell paragraph): C-012, C-043, C-058, C-065, C-104. REVIEW_CHECKLIST: C-036
  (N surfaces -> N asserts), C-037 (an entity's references). Why: the home is the section whose topic the
  rule already belongs to; a reader finds it where they would look. plan: GENERIC
- **D-03** Codex-mechanics rows C-010 (explicit `-ResumeId`, bare `-Resume` only when one session holds the
  tree) and C-029 (a paid pass = one quota start/stop pair; token counters overstate a resumed pass) are
  homed in `docs/CODEX_REVIEW_QA_RECIPE.md`, not in the three engine-neutral docs. Why: the three docs
  name no engine flag; the recipe is where every other Codex flag lives (fact 5, `:104,132-139`).
  plan: GENERIC
- **D-04** Bucket (c) - stays local, marked: the checkpoint rule C-016/17/18 and chain-trace C-020
  (REBUILD § Corrections, fact 4); C-025 model names of the routing tiers (config fact; the payload keeps
  `top|cheap`); C-005/C-006 test policy (`WORKFLOW.md:711-715` makes it local by design); C-103 no AI
  attribution (operator policy over the operator's repositories; align-decision C4 placed it in the
  overrides); C-008 changelog caps (root `CLAUDE.md` operator zone, already there); C-091 PNP-105
  (machine); portions, runbook, CI proof, context source, start number (fact 1). plan: GENERIC
- **D-05** Dead and done rows take no text: C-038 (the delta scans no longer exist, fact 5), C-039 and
  C-096 (payload carries them), C-011 (done), C-099 (payload `WORKFLOW.md:655-661` carries it -> the local
  Hard-rules line is deleted under D-01 (a)). plan: GENERIC
- **D-06** A rule homed under D-02/D-03 that today lives only in the operator's memory (C-022, C-026,
  C-028, C-029, C-010 - fact 3) leaves its memory file as a one-line pointer to the payload section,
  written by the COO at the ticket's close; a memory write that only points is a factual status, not a
  doctrine write. plan: GENERIC
- **D-07** The ledgers move into the plan folder. A plan's rulings and pass-statistics rows go to
  `<plansDir>/readiness/<ABBR>/ledger.md` (the precedent files of fact 19); a ticket's events go to its
  `records/<REF>.md`. Operator: „всичко свързано с плановете е в папката на плана". plan: GENERIC
- **D-08** `<plansDir>/LEDGER.md` is a NEW file and the transfer surface: a pointer index (one line per
  plan -> its `readiness/<ABBR>/` and `records/`) plus the rows that belong to no plan, and nothing else.
  Operator: „леджер нов файл ... леджер е указател". Shape of the seed `templates/LEDGER.md.tmpl`: title
  `# Ledger`, one paragraph (seeded once and then yours), `## Plans` (pointer lines), `## Rows that belong
  to no plan` (one row per ruling / pass / event / dropped idea, `| date | kind | text | pointer |`).
  `templates/PNP_CANDIDATES.md.tmpl` is removed; WORKFLOW § The transfer surface becomes § The ledger
  with the new skeleton. Writers of `## Plans` (round-1 B6): `/pnp:plan` Step 6 writes the plan's line at
  the landing (`<ABBR> - readiness/<ABBR>/, active/<ABBR>/records/`); WORKFLOW's archiving paragraph
  rewrites it to the archive path; GENERIC's own line is written by GENERIC-003 after the seed. Guard (h)
  (round-1 B7): a pointer row born inside a plan goes to that plan's `readiness/<ABBR>/ledger.md`, a
  plan-less one to the LEDGER. The arbiter (round-1 B5) reads the parked brief first - its `Ticket:
  <ABBR>-NNN` line names the plan - then `readiness/<ABBR>/ledger.md`, then the LEDGER's plan-less rows;
  a brief with no ticket reads the LEDGER only. plan: GENERIC
- **D-09** The fallback name `PNP_CANDIDATES.md` stays in the engine (guard, generate, validator, selfcheck,
  test-update - fact 8) and is documented as the LEGACY fallback for an install that has no key; the
  template is renamed (`LEDGER.md.tmpl`), and `/pnp:setup` on a fresh install seeds `<plansDir>/LEDGER.md`
  from it AND writes `paths.transferSurface: <plansDir>/LEDGER.md` into the config explicitly
  (`generate.mjs:1167-1175` + the config writer), so no install after 0.3.1 relies on the fallback; the
  prose copies of the fallback (`LOOP.md:134`, `WORKFLOW.md:536`, `skills/arbiter/SKILL.md:59-60`) say
  "legacy", and so do the schema's `$comment`/description (`schema/aiwf.config.schema.json:309-314`) and
  the `generate.mjs:671-674` comment (round-1 B3). The setup seed is an exclusive create (`flag: 'wx'`,
  as `applySeed` `migrate.mjs:549-557`): `EEXIST` is reported as kept, never overwritten; nothing runs
  beside setup - one executing session per tree (round-1 B9). Every § 24 fixture of `test-setup.mjs`
  that uses the no-key destination moves to `LEDGER.md` (`:1641-1654`, `:1796-1808`, `:1859-1870` with
  the rest - round-1 B4). Why: renaming the fallback makes `<plansDir>/LEDGER.md` the DEFAULT surface, and both the
  validator (`validate-payload.mjs:184`) and `resolveSeedTarget` (`migrate.mjs:487,521-527` - configured
  OR default) refuse a `seed-file` aimed at it, so D-10 op (1) could never run; the rename returns when a
  later release can drop the fallback branch outright (Deferred). plan: GENERIC
- **D-10** Migration `0026_ledger` -> 0.3.1, ops in this order: (1) `seed-file` `templates/LEDGER.md.tmpl`
  -> `<plansDir>/LEDGER.md`; (2) `add-config-key` `paths.transferSurface` with exactly `default:
  "docs/backlogs/LEDGER.md"` (the schema's `plansDir` default, `schema/aiwf.config.schema.json:300`),
  `askOperator: true`, `question` naming `<plansDir>/LEDGER.md` - the operator's answer wins, the default
  stands for the default `plansDir`, the schema validates the value before any byte (`migrate.mjs:423-425`);
  skipped where the key is present (fact 13) (round-1 B1); (3) `rerender-managed-region`
  `CLAUDE.md#aiwf-core`; (4) `rerender-managed-region` `.claude/aiwf-native/ORCHESTRATOR.md` (the event-
  ledger paragraph names the record and the LEDGER). Why the order: `resolveSeedTarget` throws when the
  target IS the configured surface (fact 12), so the seed runs before any key points at it; and the
  Writer REORDERS `planSeedFile` (`migrate.mjs:490-493`: today `resolveSeedTarget` throws at `:521-527`
  before `seedTargetExists` runs) so that an existing target is `kept` BEFORE the surface refusal - an
  installation whose key already names `<plansDir>/LEDGER.md` with the file present gets `kept` and
  exit 0, nothing written, the 0011 promise holds (round-1 B2; test t5 red before the reorder). PnP's own
  key
  (`dev/backlogs/CANDIDATES.md`, fact 20) is switched by hand to `dev/backlogs/LEDGER.md` after the seed -
  self-install layer, R1. A consumer whose key names its `CANDIDATES.md` keeps it until its own session
  switches it. Operator: „консуматорите получават доктрината и LEDGER seed-а с 0.3.1, CANDIDATES.md
  непипнат като история". plan: GENERIC
- **D-11** `dev/backlogs/CANDIDATES.md` is frozen history: a two-line English notice under its title (frozen
  2026-10-18; new rows -> `LEDGER.md`, ideas -> `ROADMAP.md`), its pointer lines `:7-10` move to
  `LEDGER.md § Plans` - in the code ticket, right after the seed creates `LEDGER.md` (the file does not
  exist before it; the seed is exercised on this repository); written again only to mark a row "taken
  up -> ROADMAP § X" or "dropped". No migration, no template. Operator: „кандидати остава исторически и с
  времето се прехвърля към роадмап". plan: GENERIC
- **D-12** `ROADMAP.md` holds only LIVE entries: `Status: idea | researching | planned | in progress` (no
  `done`); at the archiving of an entry's last plan the entry leaves the roadmap; a dropped idea leaves
  with one LEDGER row `<ABBR> dropped: <why>`; grain rule - an entry is a goal worth at least one plan, a
  three-line task is not an entry. Written in `skills/plan/SKILL.md` Step 1, `templates/ROADMAP.md.tmpl`,
  `dev/backlogs/ROADMAP.md:6-15`, WORKFLOW § Durable development history (archiving paragraph + layout
  block). Operator: „роадмап носи всички бъдещи планове и идеи". plan: GENERIC
- **D-13** The archived plan's index carries the roadmap entry's Goal and Why verbatim: `/pnp:plan` Step 6
  writes a section `## Roadmap entry` (the two lines, verbatim) into `PLAN_<ABBR>.md` together with
  `## Measurements`, before the re-stamp; `templates/briefs/planner.md:20` names the section as COO-written
  at landing. Operator: „copied at landing". plan: GENERIC
- **D-14** The "Where things are written" block (`dev/PROJECT_OVERRIDES.md:290-297`) goes into
  `templates/CLAUDE.md.tmpl` as the last managed section before `<!-- END aiwf-core -->` (`:95`), in
  generic form with `{{config.paths.plansDir}}`, `{{config.paths.overridesDoc}}`, `LEDGER.md`, the
  payload `docs/`; the local block shrinks to its project-only lines (the redesign's state ->
  `dev/REBUILD.md`). Ships through D-10 op (3). Operator: „every session has it from line one".
  plan: GENERIC
- **D-15** `/pnp:plan` gains Step 0.5 "Doctrine preflight": read WORKFLOW, LOOP, the overrides document and
  `ORCHESTRATOR.md` IN FULL (the four of `skills/work/SKILL.md:32-36`); its suppression dual: skipped when
  this session already read their current text - checked by `git diff <that read's HEAD> -- <the four
  paths>` returning empty; after a context compaction all four are read again. Operator: „влиза".
  plan: GENERIC
- **D-16** The audit-table print leaves `skills/work/SKILL.md` Step 2 (`:39-42`) and `skills/mission/SKILL.md`
  Step 5 (`:59-62`); `skills/roles` and `skills/setup` keep it; the prose pointers of fact 18 stay true.
  Operator: „искам да махнем принтирането на таблицата с ролите". plan: GENERIC
- **D-17** Release 0.3.1 is this plan's: the migration binds the bump (`validate-payload.mjs:294-304`, fact
  10) - `plugin.json`, `README.md:22`, `CHANGELOG.md` block `## [0.3.1] - <date>` ending `Retires local
  rules:` with the D-02/D-03 rule names in the 0.3.0 convention (fact 2: lowercase phrases, `;`, no ids),
  and the self-install brought to 0.3.1 by `/pnp:update` in the same ticket. Close order of every ticket
  (round-1 B10): the index row flipped (and, at the final close, `## Roadmap entry` written) -> `--stamp`
  -> `--check` exit 0 -> at the final close `git mv` to the archive and `--check` over the archive path
  -> the record commit. The tag and the push are the
  operator's two words after the plan closes - not plan work (overrides § Hard rules, Release discipline).
  plan: GENERIC
- **D-18** Routing and order: the two prose tickets are R1 in the main session (overrides § Hard rules,
  operator decision 2026-10-16), the code ticket is R2 through the Writer on `main` - a payload migration
  is a data file the update suite validates, not the DB/auth surface R3 names, and this plan's readiness
  pass already is the plan-first step R3 adds; its COO line is `COO: Fable - because check 1` (the word
  "migration" is read literally); order rules -> ledger/roadmap/
  skills prose -> code + templates + migration + bump, because the `Retires` line needs the homed names and
  the template rename needs its code in the same commit (fact 9: `generate.mjs:1167`, `test-setup.mjs:1581`).
  The CLAUDE.md.tmpl block (D-14) and the ORCHESTRATOR.md.tmpl paragraph ride the code ticket, so no commit
  leaves a managed template ahead of its migration. VERIFY per the overrides' rows: prose = provenance grep
  + `validate-payload`; the code ticket = `selfcheck`, `validate-payload`, `setup-suite`, `update-suite`
  (schema/config + update-engine + hooks rows; no `spikes` - Gate 3's logic is untouched, only a literal).
  GENERIC-001's acceptance checks meaning and uniqueness row by row (round-1 B12): `rule-homes.md` carries
  a `phrase` column (a distinctive phrase of each payload sentence), each phrase hits exactly one payload
  file exactly once, and one sonnet equivalence scan over `rule-homes.md` against `git show
  0cf97e7:dev/PROJECT_OVERRIDES.md` returns `rows: 43 homeless: 0 duplicated: 0 meaning-changed: 0` (the
  RBC-002 instrument); the line goes into the record. GENERIC-002's acceptance uses PowerShell
  (`Select-String`), never `grep` (round-1 B8). GENERIC-003's single suite run (round-1 B11, operator „2 да" 2026-10-18): a
  code pass IS worded for GENERIC-003 (operator „3 да" 2026-10-18 - the plan's approval is that pass's
  word, quoted in its `COVERED BY` line), so the ONE run of its VERIFY rows moves to AFTER the pass's
  verdict and its correction rounds, before the commit; the suite is still run once. No pass 2 on the
  plan (operator question answered at the approval: no trigger fired). plan: GENERIC

## Deferred

- The consumers' own trees (Silerax, Furnissimo): their overrides trim, their key switch to `LEDGER.md`,
  their CANDIDATES freeze - each in its own session on `/plugin update` + `/pnp:update` to 0.3.1 and the
  0.3.1 `Retires` line. Returns when 0.3.1 is pushed.
- Translating existing Bulgarian rows of `CANDIDATES.md`: frozen history, stays (overrides § Communication).
- An orphan-template inventory check in the self-check (RESEARCH unknown 2): only if the code ticket's
  suite shows one exists; then it is part of that ticket, not a new one.
- Renaming the legacy fallback `PNP_CANDIDATES.md` -> `LEDGER.md` in the engine (D-09): returns when a
  release can drop the fallback branch outright, every install carrying the key by then.
- `templates/briefs/record.md` gains a `## Events` section (D-07's docs half) in the prose ticket.
- `templates/memory-seeds/` that cite WORKFLOW headings (fact 23): re-checked by the rules ticket's closing
  grep; a seed goes stale only if a heading changes, which D-02 does not do.

## Open Questions

None.
