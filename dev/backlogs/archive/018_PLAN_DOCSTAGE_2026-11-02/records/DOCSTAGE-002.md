# DOCSTAGE-002 - code + release 0.3.8: the managed stage files, migration 0033, the doors re-pointed, the docs reduced, `/pnp:loop` removed

Closed 2026-11-02, Fable 5.1 session `358b0e5f` (D-12 S3b - a fresh session entered by
`/pnp:mission`), on the operator's word "da" (2026-11-02, after the mission report). R2 code through
the Writer (`Ticket: DOCSTAGE-002`, Gate 2 silent - on-plan), the fact-check gate, Codex code pass 1
on the `review.code` row (gpt-6-sol, xhigh, 1 pass), the code commit through its dialog, then the
closing half in this session: 0.3.8 applied to this repository, the dev-layer sweep, this record, the
plan archived, the tag and the push on the operator's two words.

## What landed

- `955e64c` (code, the Writer's commit through the operator's dialog) - 48 files, 736 insertions,
  1595 deletions; `migrations/0033_doctrine-stages/` added, `skills/loop/SKILL.md` deleted. Per row of
  the index § DOCSTAGE-002 worklist:
  - B1 `scripts/setup/generate.mjs`: `DOCTRINE_DIR`, `DOCTRINE_STAGES`, `doctrineRel`; four
    `addArtifact` calls in a loop after ORCHESTRATOR's, unconditional, through `readTemplate`;
    the header comment lists the new write.
  - B2 the key sets: `test-setup.mjs` (`STAGE_FILES` rendered, the exact `managedRegions` set, a
    per-stage render-equality + shape test `[setup-stage-<s>-1/2]`), `aiwf-selfcheck.js`
    (`FIXTURE_STAGE_KEYS` in the fixture and its files), `run-example-cycle.mjs` (a post-cycle check of
    the four keys). Exempt, with the Writer's reasons: `test-update.mjs` `ORCH_REL` / `ORCH_OP` (the
    interrupted-run, 0026-replay and ledger tests about ORCHESTRATOR itself), its generic before/after
    key set, its pin of the shipped 0026 (history); `aiwf-selfcheck.js` validator-refusal fixture (an
    arbitrary op subject) and the arbiter's core path (not a key set); the example cycle's own bump
    ops (the CLAUDE region and the Writer).
  - B3 the ledger-skeleton pin reads the fence of `templates/doctrine/plan.md.tmpl`.
  - B4 the quoted doctrine titles in `generate.mjs`, `test-setup.mjs`, `aiwf-selfcheck.js`,
    `pretooluse-dispatch-gate.js`, `aiwf-lib.js` re-aimed at `plan.md` / `ticket.md` §; none exempt.
  - B5 `migrations/0033_doctrine-stages/` (`ops.json` 10 ops: four creating re-renders with
    `createIfAbsent`, the CLAUDE.md region, ORCHESTRATOR, the Writer, reviewer and qa `ifRecorded`,
    one note `doctrine-stages-0-3-8` per D-11; `NOTES.md`), `migrations/index.json` last entry 0.3.8;
    proof test `test-update.mjs` section 15e `[stages-0..5]` replaying the REAL 0033 ops.
  - B6 `.claude-plugin/plugin.json` 0.3.8.
  - B7 the doors: `work` reads core + `work.md` + the overrides IN FULL with the dual and `ticket.md`
    at the R2/R3 route; `mission` core + overrides, `ticket.md` before the dispatch, the dual;
    `plan` Step 0.5 core + `plan.md` + overrides; `review`, `qa`, `qal` a new Step 0.5 (core +
    `ticket.md`, the dual); `arbiter` the rendered core IN FULL (the dual added in the prose
    micro-round); `setup` `:3` and `:45` name the four files; the review and qa output contracts hand
    `<root>/.claude/aiwf-native/doctrine/review.md`. Deviation in scope: `skills/README.md` "Shipped:"
    list minus `loop`.
  - B8 `templates/CLAUDE.md.tmpl` (the rules list, the preflight, the gates' pointers, "Where each
    COO rule lives"), `templates/ORCHESTRATOR.md.tmpl` ("Who reads this" both paragraphs, References
    only, six in-body pointers), the reviewer / qa / writer agent templates, the seven memory seeds,
    `templates/README.md` contract rewritten to D-01 (announced whole-section rewrite),
    `templates/PROJECT_OVERRIDES.md.tmpl`, `templates/briefs/record.md`.
  - B9 every pointer to the three docs in `docs/`, `skills/`, `templates/`, `README.md`,
    `scripts/native/` re-aimed; left as exempt per the row: pointers at the map (`README.md:77`,
    `docs/LOOP.md:4`, `docs/OPERATOR_PROTOCOL.md:6`, the stub `:7`, `templates/README.md:30`,
    `templates/ORCHESTRATOR.md.tmpl:27`), cites of LOOP's kept sections (`README.md:60`,
    `docs/OPERATOR_PROTOCOL.md:83`, `docs/WORKFLOW.md:35,51,55`, `templates/CLAUDE.md.tmpl:105`,
    `templates/ORCHESTRATOR.md.tmpl:208,441,513`, `templates/doctrine/ticket.md.tmpl:47,54,207`,
    `test-setup.mjs:1045` comment), the docs index (`docs/README.md:6,9,11`), the two qal wrapper
    headers. `docs/SESSION_BRIEF_RECIPE.md` and `docs/READINESS_CLASSES.md` carried no pointer.
  - B10 `docs/WORKFLOW.md` = the map (the five stage files, their contents and readers, the dual, the
    templates, the rest of the payload docs) + § Reproducibility; `docs/LOOP.md` = a new intro, a
    `## Role hosts` table (7 rows), the three kept sections verbatim but two re-aimed pointers;
    `docs/REVIEW_CHECKLIST.md` = a 9-line pointer stub; `docs/README.md:6-11`.
  - B11 `skills/loop/` deleted; `README.md:114`, `:198`; `work.md.tmpl`'s `/pnp:loop` sentence
    (001's input); the QA `BLOCKED` rule in `skills/qa/SKILL.md` after the verdict step.
  - B12 `README.md` § Status (v0.3.8, twelve commands, the doctrine-by-stage bullet, the glossary
    rows, `:225`); `CHANGELOG.md` `## [0.3.8] - 2026-11-02` with Added / Changed / Removed, a
    consumer-action paragraph, `Retires local rules: none`.
  - B13 D-08 final run: 223 sources, bar 1, 41 off-bar, every one explained (the list below).
  - B14 `RETIRED_COMMANDS { loop: '0.3.8' }` accepted only under `migrations/`, a "really gone" check,
    a scratch-copy negative control (a synthetic migration note + the name planted in a copy of
    `docs/README.md`).
  - B15 the four stage files and the `doctrine` directory in `ownedDestinations`;
    `[setup-stage-collide]` x2 (a stage file, the directory) as blockers before any write.
  - B16 the shipped 0033 applied on a complete scratch copy of this repository's 0.3.7 layer with
    this repository as the 0.3.8 payload: the four files created, the four keys at 0.3.8,
    `lastMigrationApplied` 0033; exit 1 from the embedded self-check's ONE row (below).
  - B17 `DOOR_READS` / `doorReadFindings` - per door, the stage path and `IN FULL` in the same
    paragraph; a two-sabotage control (work's path removed, arbiter's IN FULL replaced) reports
    exactly those two.
- The closing half in this session (this record's commit):
  - `/pnp:update --apply` on this repository: migration 0033 (the four stage files created, the
    CLAUDE.md region, ORCHESTRATOR.md and writer.md re-rendered with their project additions carried,
    reviewer / qa skipped - no record here, one note), `self-check: PASS - 1581/1581`, exit 0 - the
    clean proof B16 could not give on a copied tree. `_aiwf.installedPluginVersion` 0.3.8.
  - The D-16 (c) / D-09 sweep of this repository's consumer layer against the 0.3.8 `Retires local
    rules: none` line (nothing to delete) and for every pointer to the three docs:
    `dev/PROJECT_OVERRIDES.md` header (`:4-5` -> the core and the stage files, the map),
    `:254` -> `ticket.md` § Loop shape and its overrides, `:266` -> `plan.md` § Plan readiness
    review, `:281` -> `plan.md` § Durable development history; `:109` (`docs/LOOP.md` § Enforcement)
    kept - a kept section; `dev/VERIFY_RUNBOOK.md:82` -> `ORCHESTRATOR.md` § Verifying failure
    claims; `dev/README.md` no hit; root `CLAUDE.md` operator zone: no pointer to the three docs
    (`:105` is the managed region's LOOP § Honest security model cite, a kept section); memory: three
    pointer files (`auditor-never-below-author`, `every-pass-after-the-first-needs-a-word`,
    `yes-covers-only-the-asked-action`) re-aimed at the rendered `ORCHESTRATOR.md`.
    `dev/REBUILD.md` and `dev/backlogs/**` are history and stay (B9's exempt list).
  - Root `CLAUDE.md` § Changelog format: the D-11 sentence (a retired rule named as
    `<stage>.md § project additions: <rule>`; adopting = moving the sentence into the stage template).
  - `dev/backlogs/ROADMAP.md`: § DOCSTAGE `Status: in progress` at 002's dispatch (the roadmap's
    second-event write, 001 wrote no route state); at the close the entry's `Plans:` line rewritten
    to the archive path and the D-10 line added (below).
  - The plan archived: `git mv dev/backlogs/active/DOCSTAGE dev/backlogs/archive/018_PLAN_DOCSTAGE_2026-11-02`;
    `dev/backlogs/LEDGER.md` § Plans line rewritten; `dev/backlogs/readiness/DOCSTAGE/ledger.md`
    gains the code pass row and the apply ruling row.
  - `D:\pnp-live` refreshed to `955e64c` after the code commit and to this record's commit after it.

## Decisions and deviations

- **One Writer for the whole worklist** - the rows share the key sets, the migration and the docs;
  a split would have crossed files. Why: no non-overlapping file sets to split on.
- **The brief made the Writer run the three suites itself "as its own confirmation", plus three
  negative-control copies** - a brief defect against overrides § Test policy ("the row's suite runs
  ONCE, started by the COO at the hand-back; never a second batch"). Cost: ~175 min / 379 tool uses
  on the Writer's side, most of it suites on four trees. The COO's Portion 1 ran once after the
  hand-back as the policy says; the Writer's runs are recorded below as what they were. Events.
- **The brief named B16's fixture apply without the CI-form caveat** - the embedded self-check of an
  apply on a COPIED tree false-reds on the six root-bound `git -C D:\promptandpray` owned ask rules
  (`dev/VERIFY_RUNBOOK.md:60-62`), so B16 exited 1 on that one row while every effect of the
  migration was green; the clean proof is the apply on this repository (above). A brief defect per
  the runbook's own rule, not a code defect. Events.
- **Fact-check findings fixed in a prose micro-round to the live Writer before the pass** (four): the
  arbiter's read gained the dual the other doors carry (D-06 names every door; the CHANGELOG and the
  map said "each read carries" it); `templates/PROJECT_OVERRIDES.md.tmpl` "re-rendered by every
  `/pnp:update`" -> "whenever a release changes them" (a re-render happens only through a migration
  op); 0033 NOTES.md's Retires sentence beside `none`; the `KNOWN_FUTURE` comment's stale "planned".
  Verified first-hand after the round; no suite owed (prose + one comment).
- **Deviation accepted: `skills/README.md` "Shipped:" list** - not in a worklist row; in scope by D-07's
  closing check (zero `pnp:loop`... the list is prose naming the command) and the Code Map.
- **The ROADMAP entry DOCSTAGE stays after its first plan is archived** - DECISIONS § Deferred names
  the entry's second plan (the Gate 2 skeletons, R3) and the 2026-11-01 operator-correction row records
  that a deferred item lives as a roadmap line under its entry; the entry's `Status` is set back to
  `idea` with the first plan named under `Plans:` - the doctrine's three events do not name this case
  (a first plan archived with a second deferred), so this is the COO's reading, reported here.
- **The route state was cleared after the code commit**, before the closing half's dev-layer writes:
  the Writer's work was done and Gate 3 would otherwise deny the COO's own R1 writes under `dev/`
  (the sweep, this record), which the plan assigns to this session.
- **D-10 left open on the operator's answer** („Няма ги още - отворено"; „без измервания", „не мога
  да измеря в момента на телефона съм"): the two `/context` numbers
  exist only when fresh `/pnp:work` and `/pnp:plan` sessions open on 0.3.8; a line under ROADMAP
  § DOCSTAGE carries the question and the expectation (~60k / ~85-95k) until they are read.
- **Notes left as they are (wording, moved text):** `templates/doctrine/review.md.tmpl:24` "brief on
  stdin" (since 0.3.7 the brief arrives through `-BriefFile`, stdin the fallback) - a ROADMAP § DOCTR
  line; `docs/OPERATOR_PROTOCOL.md` Door 3 "loads the full doctrine" - DECISIONS § Deferred
  (compaction); `ORCHESTRATOR.md` itself not in setup's `ownedDestinations` (pre-existing) - already a
  line under ROADMAP § SETUP (CANDIDATES:1062), nothing new to write.
- **`scripts/engine/aiwf-lib.js` had CRLF in the working copy** after the Writer's Edit;
  `.gitattributes` `text=auto eol=lf` normalised it at the commit (git's warning seen on the diff); the
  committed change is the one comment line.

## Events

| date | rule or D-id | kind | pointer |
|---|---|---|---|
| 2026-11-02 | overrides § Test policy - the row's suite runs ONCE, by the COO at the hand-back | violation (the COO's brief) | the brief's "the three self-check / suite commands of § Acceptance as your own confirmation" made the Writer run selfcheck, setup and update suites plus three control copies - a second batch, ~175 min; § Decisions and deviations |
| 2026-11-02 | `dev/VERIFY_RUNBOOK.md:60-62` (the fixture form false-reds on a copied tree) | violation (the COO's brief) | B16 exit 1 on the six root-bound owned rules, every migration effect green; the clean proof moved to the apply on this repository; § Verification |
| 2026-11-02 | RULEHOME/D-16 (b) fact-check gate before the pass | catch | 4 FALSE claims of 190 fixed before the Codex pass (the arbiter's missing dual, "every /pnp:update", the Retires sentence, "planned"); § Decisions and deviations |
| 2026-11-02 | guard (a) - the operator objects to a cost or a process | operator-correction | „не е нормално това" (the Writer at ~2.5 h); „още 2 3 часа ли ще чакаме тези верифай команди, отново ли сме в сянката на овъринжинеринга ... това е плъгин не е банков софтуер"; „и кодекс като върне 10+ блокера - още 2 3 часа". The answer given: Portion 1 is the one run the policy prescribes (40 min on this run, in the background); the excess was the brief's (the row above); the pass cap is the operator's - fail aggregation, one correction round, a verification pass only on a word. No process changed on the COO's own; § Decisions and deviations |
| 2026-11-02 | D-12 S3b - 002 on a Fable session | event (unverified) | the operator: „ти кой модел си ... щото тук ми пише опус"; this session's `/model` line at its start recorded "Set model to Fable 5.1" and the harness identifies it as `claude-fable-5-1`; what the operator's screen read is not visible to the COO (candidates: fast mode, which runs on Opus; the statusline showing the last active agent - the Writer on Opus 5.5); the operator: „все тая, към края сме". Unresolved, recorded with the words |
| 2026-11-02 | the habit guard (0.3.7) | catch | the COO's own `... | Select-Object -First 1` in a non-repository command (starting AnyDesk on the operator's request) was denied with the hint; reformulated without the pipe. The guard's first catch on the main session in this repository |
| 2026-11-02 | the COO's interim-status ping to a Writer waiting on a background suite | event | the ping could not be read until the suite ended (a subagent reads messages at its next tool round); the Writer's progress was read instead from its scratch logs and the process tree (the suite's children alive and advancing) - the honest way to tell a long suite from a hang without stopping it |

## Verification (what actually ran)

- **The Writer's own runs** (hand-back; logs under the session scratch `DOCSTAGE-002/logs/`, outside
  the repository): selfcheck CI form exit 0 (1582/1582), re-run after the B14 fix exit 0; setup suite
  exit 0 (481 checks / 0 failures); update suite first run exit 1 (6 failures - the B14 control had
  copied `migrations/0022`, absent from the suite's truncated payloads; fixed by a synthetic note in
  the control), re-run exit 0 (455 / 0); validate-payload exit 0 ("valid: 33 migration(s) ... 0.3.8");
  `claude plugin validate .` exit 0 ("passed with warnings": root CLAUDE.md, no icon - pre-existing).
  Red controls: copy A (doctrine loop removed, `ownedDestinations` entries removed, a fence byte
  changed) test-setup exit 1 with exactly the 13 new assertions red; copy B (the ticket op dropped
  from 0033) test-update exit 1 (`stages-0`, `-2`, `-3`, `-5`); copy C (work's stage path removed,
  `/pnp:loop` planted in `docs/README.md`) selfcheck exit 1 (1578/1582, exactly the 4 new checks).
  Render dry-run exit 0 (five doctrine/core templates, three agent templates, CLAUDE.md.tmpl OK; fence
  identical, 566 bytes; both negative controls red). D-08: positive control first (a deleted paragraph
  `OFF 0`, a duplicated one `OFF 2`), final run `sources: 223 bar: 1 off-bar: 41`.
- **B16** (`b16-apply.log`): the migration's lines all `created from the payload render` / `the
  payload render written`; `==== 1580/1581 assertions passed ====`; the one FAIL: "every owned ask
  rule comes from the payload ruleset (none invented locally)" naming the six
  `Bash|PowerShell(git -C D:\promptandpray push|merge|rebase:*)` rules - the runbook's copied-tree
  fingerprint.
- **VERIFY Portion 1, by the COO, one parallel batch in the background after the hand-back**
  (`Start-Process` per command, logs outside the repository; 11:45:24 -> 12:25:29, 2405 s wall):
  `validate-payload` exit 0; `setup-suite` exit 0 (`checks: 481, failures: 0`); `update-suite` exit 0
  (`checks: 455, failures: 0`); `example-cycle-windows` exit 0 (`checks: 43, failures: 0`);
  `example-cycle-linux` exit 0 (`checks: 43, failures: 0`); selfcheck CI form
  `node scripts/selfcheck/aiwf-selfcheck.js --plugin-root .` exit 0 (`==== 1582/1582 assertions
  passed ====`); `claude plugin validate .` exit 0 ("Validation passed with warnings"). No Portion 2
  (not a release gate; CI runs the POSIX legs after the push). `spikes` not owed (hooks unchanged).
- **The COO's acceptance greps** (ticket § Acceptance; `acc.log`): B9 bare and section forms - every
  hit on row B9's exempt list; `REVIEW_CHECKLIST` only `docs/README.md:11` outside the stub;
  `pnp:loop` zero; `git ls-files skills/loop` listed the file until the commit staged the deletion;
  "Durable development history" in scripts names `plan.md` everywhere; `consume` = 1 in
  `skills/qa/SKILL.md`; the ten door -> path `--all-match` pairs with `IN FULL` all hit; provenance
  (Cyrillic, Silerax/Stratex/Furnissimo, `D:\`) empty, the untracked 0033 included;
  `templates/doctrine/` in `migrations/` = `0033_*/ops.json:4` + `NOTES.md:1` (`--untracked` before
  the commit); plugin.json `"version": "0.3.8"`; CHANGELOG `## [0.3.8]` with `### Removed`. The
  narrowed-test grep (`skip|only|todo` over the three suites' added lines): 3 hits, all the word
  "only" in prose - no narrowed test.
- **Fact-check gate** (`/pnp:review` Step 2b, one sonnet Explore agent over the diff's added prose,
  93 tool uses, ~9.4 min): `CLAIMS: total=190 verified=176 false=4 unverifiable=10`; the four fixed
  (above); the ten closed by reference - the block date (the commit's), "every rule in exactly one
  file" x3 (D-08 is the instrument), the dual's git behaviour x3 (D-03 (b), RESEARCH S2 fact 3),
  "/pnp:loop not used" (D-07, the operator's word), consumer files (not in the tree), "no runtime
  state machine" (moved text).
- **Codex code pass 1** (`review.code`: codex gpt-6-sol xhigh, 1 pass; cold; brief file
  `.aiwf/DOCSTAGE-002-review-brief.txt`, first line `COVERED BY: operator word "da", 2026-11-02`,
  `Class: code`, `Ticket: DOCSTAGE-002`, the diff by `git diff` + the untracked 0033, an evidence pack
  of the rows' pointers and the proof above, the three product-boundary lines, the ticket's risk
  threshold and stop condition): **`pass`** - "No findings at the stated risk threshold. I reviewed the
  47 tracked changes and both untracked 0033 migration files against DOCSTAGE-002 and D-01-D-13. The
  reported suite and migration results came from the evidence pack; I did not rerun runtime checks in
  this read-only review." 118,653 tokens; session `01a19bcd-c662-7ba3-a942-fff905707ae2`; exit 0.
  No correction round.
- **The closing half:** `aiwf-update.mjs --check` exit 1 (`behind: 0.3.7 -> 0.3.8`); `--dry-run` exit 0
  (the CHANGELOG block + the 10 ops shown to the operator); `--apply` exit 0 after the operator's word
  in a dialog, `self-check: PASS - ==== 1581/1581 assertions passed ====` (the fixture form on this
  repository: the version row green now that installed = payload).

### D-08 final run - the 41 off-bar paragraphs (bar 1; source = the docs at `e8761b6`)

- Count 0, the pointer re-aimed by B9 (each with a 0.9+ match at the target): WORKFLOW `:17` ->
  ORCHESTRATOR `:199`; `:371` -> plan `:93`; `:799` -> ticket `:268`; LOOP `:11` -> work `:104`; `:18`
  -> work `:111` (B9 plus 001's rewrite); `:32` -> ticket `:138`; `:92` -> ticket `:198`; `:149` ->
  docs/LOOP `:53`; `:242` -> docs/LOOP `:146`; REVIEW_CHECKLIST `:3` -> review `:23`; `:12` -> review
  `:32`; `:39` -> review `:59`; `:193` -> review `:213`; `:212` -> review `:232`.
- Count 0, 001's cross-stage rewrite (D-05, on 001's list), singular now that the docs copy is gone:
  WORKFLOW `:111`, `:157`, `:188`, `:286`, `:312`, `:349`, `:387`, `:439`, `:511`, `:573`, `:697`,
  `:704`, `:732`, `:835`; LOOP `:95`.
- Count 0, other: WORKFLOW `:526` (001's split at item boundaries); `:821` (merged into ORCHESTRATOR
  § Escalation, 001); `:3`, `:11` (rewritten as the map's opening, D-02 - now `docs/WORKFLOW.md:3`,
  `:12`); `:896` (Reproducibility: hosts and boundaries re-aimed, the one-page-mapping bullet
  replaced by the doctrine bullet, `docs/WORKFLOW.md:43`); LOOP `:1`, `:3` (title and intro
  rewritten - LOOP is no longer the mapping, D-02); LOOP `:27` (the `/pnp:loop` sentence removed, D-07).
- Count above 1, heading / substring collisions as on 001's list: WORKFLOW `:517` (2, the split
  heading in both halves); `:651` (2, heading + the contract mention); `:797` (2, substring);
  REVIEW_CHECKLIST `:44` "---" (10, table rules).

## Remaining debt

None that blocks anything. Registered elsewhere:

- D-10's two `/context` numbers - a line under ROADMAP § DOCSTAGE (the operator: „Няма ги още -
  отворено"), read and judged when fresh `/pnp:work` and `/pnp:plan` sessions open on 0.3.8.
- `templates/doctrine/review.md.tmpl:24` "brief on stdin" wording - ROADMAP § DOCTR.
- `ORCHESTRATOR.md` not in setup's `ownedDestinations` - already under ROADMAP § SETUP.
- The entry's second plan (the Gate 2 skeletons, R3) - DECISIONS § Deferred, the roadmap line under
  § DOCSTAGE.

## Diff review

The whole working diff at HEAD `f3fd9e0` (47 files + `skills/loop` deleted + `migrations/0033`
untracked; the patch 3470 lines) read line by line, except the body of the `docs/WORKFLOW.md` deletion
hunk - the old text read in full at this session's preflight and covered by the D-08 final run (every
deleted paragraph hits once elsewhere or stands on the list above with its reason). Per acceptance
criterion, the defect the proof would see and what it reads, written before the paid pass:

| acceptance line | defect the proof would see | what it reads |
|---|---|---|
| selfcheck CI form exit != 0 | a key missing from a key set, a door without its line, a retired name outside migrations/ | the summary line, every `[FAIL]` |
| validate-payload exit != 0 | index not monotonic / 0033 not last / plugin.json not 0.3.8 | the first error line |
| setup-suite exit != 0 or no B15 case | the overrides document onto a doctrine path accepted | `[setup-stage-collide]` x2 + copy A |
| update-suite exit != 0 | the fixture key set without the four; the 0033 replay broken | 15e `[stages-0..5]` + copy B |
| `claude plugin validate .` | a dangling manifest entry after the removal | the output |
| B16 apply | a creating op absent; a key not at 0.3.8; the stamp not 0033 | the fixture's `_aiwf.*`, the four files |
| B17 pin + control | a door reading a payload doc; a pin that accepts a copy without its line | `DOOR_READS`, the two-sabotage control |
| door -> path greps | the path without IN FULL or IN FULL without the path | each door's step |
| REVIEW_CHECKLIST hits | a reader still handed the payload checklist | the hit lines |
| the three names off B9's list (two forms) | a pointer at a section that left the doc | the hits against the exempt list |
| `pnp:loop`, `ls-files skills/loop` | the removal incomplete | the hit lines |
| B14 + control | `/pnp:loop` accepted outside migrations/ | `RETIRED_COMMANDS`, copy C |
| "Durable development history" in scripts | a quoted title re-aimed nowhere | the hit lines |
| ORCHESTRATOR hits in scripts without the four keys | a key set missing the stage files | each hit + the exempt list |
| `consume` in qa | D-07's rule not moved or reworded | the count |
| `templates/doctrine/` in 0033 = 4 | a creating op missing or doubled | `ops.json` |
| plugin.json / CHANGELOG | the bump or the block absent | the two files |
| D-08 final | a rule in two places or none off the list | the script's output |
| provenance | a consumer name, Cyrillic, an absolute path | the hit lines |
| the D-09 sweep | a dev pointer at a reduced section | the hits against B9's list |

What the read found: the engine, the migration, the suites and their controls sound (controls present
and fail-capable; the three `only` hits are prose, not narrowed tests); the doors, docs, templates,
README and CHANGELOG as the rows say; no defect at the risk threshold; the four wording notes in
§ Decisions and deviations.

## Scratch

- `.aiwf/DOCSTAGE-002-diff-review.md` - its content stands in § Diff review and § Verification above;
  deleted.
- `.aiwf/DOCSTAGE-002-review-brief.txt` - its content stands in the ticket file (the contract fields)
  and in § Verification (the COVERED BY line, the class, the scope, the evidence pack's substance);
  deleted (the ticket-end delete the review skill names).
- `.aiwf/last-review-session.DOCSTAGE-002.txt` - the session id stands in § Verification and in
  `readiness/DOCSTAGE/ledger.md`; deleted.
- `.aiwf/route-state.json` - `{}`, kept. `.aiwf/checkpoint.md` - the gate checkpoint of overrides
  § Loop shape, rewritten whole to the closed state, kept.
- The session's own scratch outside the repository (the Writer's `DOCSTAGE-002/` logs, copies and
  fixture; the COO's `coo/` diff, Portion 1 logs, update logs) is not covered; the numbers it holds
  are copied above.

## Closing checklist

- the operator's own run on a real input - the apply of 0.3.8 on this repository ran on the
  operator's own word in a dialog („Да, приложи") with the operator present; the consumer's run
  (Silerax, Furnissimo) is out of scope (index § Scope) and comes with their `/plugin update`;
- the diff review folded in above - yes;
- finding lines on a roadmap area entry - none closed by this ticket (the entry's harvested lines
  are the deferred items, DECISIONS § Deferred);
- out-of-scope findings registered - two new lines (ROADMAP § DOCSTAGE D-10, § DOCTR the stdin
  wording); the `ownedDestinations` gap already stood under § SETUP;
- scratch files found standing in the tree before their delete - yes (§ Scratch);
- the next ticket: none in this plan - the plan is archived; the entry's second plan is born through
  `/pnp:plan` on the operator's word, in a fresh session.

## Measurements

| correction rounds | COO session at close | source |
|---|---|---|
| 0 (pass on Codex pass 1; the two prose micro-rounds before the verdict are ticket work) | 430,000 (43 % of 1,000,000) | `~/.claude/ctx/358b0e5f-c023-4803-9a41-9b5f3b83a1a0.pct` x `.size`, read at the record |
