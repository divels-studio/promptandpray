# Changelog

All notable changes to PromptAndPray (`pnp`) are recorded here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/); versions follow strict
`MAJOR.MINOR.PATCH` as enforced by `scripts/update/validate-payload.mjs`.

## [0.3.4] - 2026-10-22

The plan-readiness blocker contract says what INFO is, so the paid pass stops filing wording as a
BLOCKER.

### Changed

- **The readiness blocker contract names INFO (PASSCOST)** - `templates/briefs/readiness-codex.md`
  states in one line that wording, formatting and `file:line` precision are INFO, never BLOCKER,
  gives the one test for a row (executed exactly as written, would a ticket fail, land wrong or
  leave a decision open?) and six INFO examples; `docs/REVIEW_CHECKLIST.md` § Plan readiness carries
  the same test. Every readiness pass measured before this returned INFO: 0. Migration
  `0029_info-contract` carries the release note and writes nothing.

Retires local rules: none.

## [0.3.3] - 2026-10-22

The execution guards a consumer wrote during its first plans under the new cycle live in the payload,
one sentence each; the per-ticket byte cap is a config value; the Codex review wrappers say what they
ran.

### Added

- **The execution guards homed (GUARDS)** - `docs/WORKFLOW.md`: no claim without an opened file or the
  word UNVERIFIED (§ Verifying failure claims); a consumer grep of every changed definition before
  dispatch (§ COO owns broad scans); one defect line per acceptance criterion in the diff-review file
  before the first paid pass (§ The COO write boundary); a plan-recorded bar, pin, threshold or cap
  moves only through trigger 1 (§ Escalation); a product dialog names the field lost and its
  definition (§ The operator does not arbitrate); environment preflight and the unit baseline by test
  name before VERIFY (§ VERIFY honesty); the operator's own live run closes a ticket whose outcome is
  visible in the running product (§ Durable development history); the revision stop rule counts
  carried OPEN rows (§ Triage). `docs/REVIEW_CHECKLIST.md` § Test quality: red under a named fault,
  then green; narrowings grepped.
- **The briefs carry the guards (GUARDS, BRIEFS)** - `templates/briefs/writer-dispatch.md` states
  the three stop conditions; `planner.md` gains the COO-filled CLOSING GREPS block and trim-by-citing;
  `research.md` returns six sections (what already exists; paths touched without being named);
  `skills/plan` Step 1 asks which real inputs the operator can supply, Step 5 runs a scan-tier
  runnability pre-pass before the paid readiness pass. The research and planner briefs read the
  code by pointer - a grep hit and its section, never a whole file (BRIEFS; measured before: research
  407k and one planner dispatch of 500k on a consumer plan).
- **`plan.ticketByteCap` (GUARDS-001)** - the plan gate's per-ticket byte cap is read from
  `aiwf.config.json` (factory 6144, minimum 1024; an unreadable key falls back to 6144). Migration
  `0028_ticket-byte-cap` writes the key and carries the release note.

### Changed

- **The Codex review wrappers print a run header and a run footer on stderr (GUARDS-001)** - model,
  effort, cold or resumed, and after the run the exit code and the recorded session id with the
  resume flag; codex's own streams stay untouched.

Retires local rules: the execution guards 1-11 of a consumer's overrides (no claim without an opened
file; the proof sees the defect; red before green; bars, pins and definitions do not move; a product
gate names what the user loses; scope is the Code Map; environment preflight before VERIFY;
verification honesty with a named baseline; whole diff for a cache key, server-action switch or
module removal; a live import closes a ticket on the import path; one writer on the tree); "a ticket
is trimmed by citing, never by cutting"; the memory rule "a settled product rule is not reopened with
a hypothetical case".

## [0.3.2] - 2026-10-18

The roadmap gains the area entry and its fourth write, shipped as a release so the doctrine reaches
every installation.

### Changed

- **The roadmap area entry and the fourth write (REL-032)** - a roadmap entry may be an AREA (a module
  or theme, goal "no known open defect") whose `Scope: in -` list collects the findings born during
  work, one indented line each with date, origin and pointer, until the list is worth a plan; that
  list grows at a finding's birth while Status and Plans change at the three events only.
  - `docs/WORKFLOW.md` § Durable development history carries the rule and the one-time port of the
    live candidates; § Out-of-scope findings names the area line as a destination.
  - `templates/ROADMAP.md.tmpl` gains the one-sentence header; a consumer's `ROADMAP.md` is a seed
    and is not re-rendered. Migration `0027_roadmap-area` is one `note`.
- **Release discipline (REL-032)** - a payload change that must reach a consumer is a release: a
  version bump + a migration (a note op when the change is prose) + a CHANGELOG block, because a
  consumer's /plugin update refreshes nothing at the same version.

Retires local rules: none

## [0.3.1] - 2026-10-18

The transfer surface becomes the ledger - a pointer index - and the generic rules projects kept in
their overrides document live in the payload doctrine, one sentence each.

### Added

- **The ledger and migration `0026_ledger` (GENERIC-003)** - `templates/LEDGER.md.tmpl` (one
  paragraph, `## Plans`, `## Rows that belong to no plan`) replaces `PNP_CANDIDATES.md.tmpl`;
  `/pnp:setup` seeds `<plansDir>/LEDGER.md` with an exclusive create and writes
  `paths.transferSurface` itself, so `<plansDir>/PNP_CANDIDATES.md` is a legacy fallback only.
  - `0026` seeds the ledger, asks for `paths.transferSurface` where the key is absent (default
    `docs/backlogs/LEDGER.md`), and re-renders the `CLAUDE.md` region and `ORCHESTRATOR.md`.
  - A `seed-file` whose target already exists is `kept` even when it is the transfer surface; an
    absent surface is still refused (the 0011 promise).
- **`## Where things are written` in the managed `CLAUDE.md` region (GENERIC-003)** - the home of an
  idea, a plan, readiness, a closed ticket and its events, the plan-less rows, doctrine and a
  project rule.
- **43 generic rules homed in the payload (GENERIC-001)** - one sentence each in `WORKFLOW`, `LOOP`,
  `REVIEW_CHECKLIST` and the Codex recipe; the planner brief's COO line names the model.

### Changed

- **The ledger, the roadmap and the skills prose (GENERIC-002)** - `WORKFLOW` § The transfer surface
  becomes § The ledger: one line per plan under `## Plans`, a plan's ruling and pass rows in
  `readiness/<ABBR>/ledger.md`, a ticket's events in its record's `## Events`; the roadmap holds
  only live entries. `/pnp:arbiter` reads the parked brief first, then the plan's `ledger.md`, then
  the plan-less rows; `/pnp:plan` gains a doctrine preflight; `/pnp:work` and `/pnp:mission` stop
  printing the audit table.
- **The event ledger in `ORCHESTRATOR.md` (GENERIC-003)** - a ticket's event row goes into its
  `records/<REF>.md`, a plan-less one into the ledger; it points at `WORKFLOW` § The ledger.

Retires local rules: no retelling; never a whole plan in front of the operator; paid passes stated
and priced; informal address; no dispatch on precedent; resource checks are the coo's own; the gate
is not prompted; a dead paid pass waits; analyse and decide; on an objection stop the tools; a
ticket born mid-work; a yes covers only the asked action; the coo runs scripts itself; out-of-scope
findings; dialogs only at the gates; never pipe a test run through tail; a documentation claim is a
hypothesis; candidates registered where they are born; the bump by hand, the tag its own word; the
resume memory is state; a repo copy of a live artifact; a file count is not a runner count; a heavy
ticket in a fresh session; a session reads its own ticket; no session brief when the state is
durable; readiness only through the plan skill; the auditor never below the author; a rule record
carries a marker; english everywhere in the tree; the coo line names the model; worktree and
memory-directory removal are destructive; the diff-review file; the writer runs only the tests it
adds; no cd prefix; surgical edits over rewrites; long commands run in the background; auto mode
and the config files; the writer's reply is short; n surfaces, n asserts; an entity's references; a
paid pass is a quota start/stop pair; resume with an explicit id.

## [0.3.0] - 2026-10-17

The planning cycle is one skill, and the doctrine states it once: research, decisions, a planner, a
mechanical gate, ONE readiness pass under a blocker contract, the COO's triage, the operator's
approval, the landing.

### Added

- **`/pnp:plan` - the planning cycle as one skill (RBB-001)** - the roadmap entry, research by
  scan-tier agents in a fresh context, `DECISIONS.md` with Open Questions that stop the cycle, the
  planner dispatched as the `writer` agent type and writing only under `<plansDir>/drafts/<ABBR>/`,
  `plan-gate --stamp` then `--check`, one readiness pass on the plan's standing word, triage into
  `readiness/<ABBR>/round-N.md`, a second pass only on the operator's word (a reversed decision or a
  named risk), the landing commit.
- **`templates/briefs/` (RBB-001)** - the agent contracts as plain Markdown read at run time:
  `research.md`, `planner.md`, `readiness-codex.md`, `writer-dispatch.md`; never rendered, never
  managed.
- **The `seed-file` op and migration `0025_roadmap-seed` (RBB-003)** - a file written only when
  absent, kept byte for byte when present and never recorded; `0025` seeds `<plansDir>/ROADMAP.md`
  and re-renders the `CLAUDE.md` region, `ORCHESTRATOR.md` and the Reviewer agent where the
  installation has one. The example bump exercises all five op types.
- **The session rule (RBB-002)** - a readiness cycle starts in a fresh session; about 400k tokens of
  context is a ticket boundary and a guide; the COO carries no revision body and no review body.

### Changed

- **`/pnp:review` readiness mode is what `/pnp:plan` calls (RBB-002)** - the brief is `COVERED BY`,
  `Class: plan`, `PLAN: <folder>` plus the shipped readiness brief; the verdict is one findings table
  and a `BLOCKERS: <n> INFO: <m>` line; the fact-check gate runs over a diff only; a Claude-hosted
  plan row reads the folder, takes no diff, and returns the same table.
- **The docs state the cycle once (RBB-002)** - `WORKFLOW` § Plan readiness review, § Planning lock
  and § Durable development history, `REVIEW_CHECKLIST`, `LOOP`, `OPERATOR_PROTOCOL`, the Codex
  recipe, `READINESS_CLASSES`, `SESSION_BRIEF_RECIPE` and the pointer skills name no struck artifact;
  the Writer brief is a ticket pointer (`templates/briefs/writer-dispatch.md`).
- **The plan row's note in `/pnp:roles --show` (RBB-003)** - `second pass only on your word: a
  reversed decision or a named risk`.

### Removed

- **The readiness artifacts of the old cycle (RBB-002)** - `/pnp:review` Steps 2a/2c/2d/2e (the
  behavior ledger, the consequence scan, the COO's own pass, the artifact move), the `PASS` /
  `NEEDS-FIX` plan verdict, and the single-file draft `drafts/PLAN_<ABBR>.draft.md`.

Retires local rules: readiness mechanics (the delta consequence scan and the delta fact-check);
chain-trace in the evidence pack; the plan is read by sections; the blockers of the previous ticket
enter the next brief; readiness symmetry; a turn of its own is not a stop; the checkpoint rules the
session rule replaces.

## [0.2.20] - 2026-10-17

The update overwrites what it renders, and what it renders goes thin: the rules stay in the payload,
and a rendered file carries the project's data, its role's contract and pointers.

**Before you run `/pnp:update`:** a managed file you edited - or held through the old keep-mine
resolution - is OVERWRITTEN by this update. Move the text you want to keep into that file's project
additions block or into your overrides document FIRST.

### Changed

- **The update overwrites managed artifacts (UPDARCH-001)** - a re-render always writes the payload
  render: an edited, a deleted and a never-recorded managed file alike, the `CLAUDE.md` region
  spliced with every byte outside its markers kept. Nothing asks, nothing is held.
  - Bookkeeping is one version per key, `_aiwf.managedRegions[<key>] = "<version>"`; an older shape
    is normalized on load and written back by `--apply`, even on a current project.
  - An interrupted update is simply run again: every operation is idempotent, and the version
    stamps move together once per migration.
- **The update prints the CHANGELOG between versions (UPDARCH-001)** - `--dry-run` and `--apply`
  print every payload `CHANGELOG.md` block between the installed and the payload version before the
  first operation, and `--check` adds a `behind:` line; that replaces the migration note and its
  `supersedes` list as what a consumer reads. From this version on, each block ends with a
  `Retires local rules:` line naming the consumer-local rules the payload now carries.
- **The self-check checks presence and working hooks (UPDARCH-001)** - the payload-doctrine section
  is gone, and the project layer is checked for presence, version and the roles/agent field
  equality (`managed-regions-present`); a legacy record is a `[NOTE]`.
- **Thin rendered files (UPDARCH-002)** - the managed `CLAUDE.md` region, `ORCHESTRATOR.md`, the
  Writer, Reviewer and QA agents and `AGENTS.md` carry the project data, each role's behaviour
  contract and one pointer per rule cluster to its section in the payload `docs/`; restated doctrine
  is gone, so a rule fix reaches an installation with the plugin itself. Migration `0024` re-renders
  the six once (Reviewer and QA only where the installation has them).
  - The one dropped sentence that had no payload home - the behavior ledger's honest limit - moved
    into `docs/WORKFLOW.md` § Plan readiness review.
- **The Writer points at the project's test policy (UPDARCH-002)** - the Writer agent no longer
  inlines a test routing of its own, which contradicted a project whose routing had moved on; it
  points at `§ Test policy` of the overrides document.

### Added

- **The project additions block (UPDARCH-001, UPDARCH-002)** - one `<!-- project additions -->` ...
  `<!-- /project additions -->` block per rendered Markdown file, carried byte for byte by setup,
  update and `/pnp:roles`; a malformed block stops the run naming the file, nothing guessed. Every
  whole-file Markdown template now ends with an empty one.

### Removed

- **Conflicts, holds, `--resolve`, `--adopt`, the journal and the CHANGES report (UPDARCH-001)** -
  the two-hash conflict bookkeeping, keep-mine holds and `/pnp:update --resolve`,
  `/pnp:setup --adopt`, the migration journal with its stage and recover, and the
  `CHANGES_<from>-to-<to>.md` report are gone. `paths.changesDir` is still accepted and no longer
  used.

Retires local rules: none

## [0.2.19] - 2026-10-15

The update engine: a configurable folder for the CHANGES reports, a `$schema` pointer that is kept
current, and the supersede duty of a re-rendering migration written down.

### Added

- **CHANGES report folder (PLB-002)** - a new config key `paths.changesDir` names the
  project-relative folder `/pnp:update` writes `CHANGES_<from>-to-<to>.md` into; its default `"."`
  keeps the project root, and an installation without the key reads it the same way. One
  containment rule (`containedRelativePath`) is shared by setup, the update run and the self-check:
  an absolute value, a drive letter or a climb out of the project is refused - by the update before
  any operation, as is a value naming an existing file; `--check` and `--resolve` never refuse on
  it. Migration `0023` adds the key as `"."`; setup asks for it after the paths questions.
- **The Codex auditor's `AGENTS.md` is rendered (PLB-003)** - the project-root `AGENTS.md` a
  Codex-hosted Reviewer or QA reads is now a managed artifact rendered from
  `templates/AGENTS.md.tmpl` by setup and by update (the last operation of migration `0023`): the
  project name, who reads the file, that the brief on stdin is the contract, and the project's canon
  files by relative path - no plugin version and no plugin path, so an update cannot leave it stale.
  If you keep a hand-written `AGENTS.md`, move it aside BEFORE `/pnp:update`: otherwise the update
  refuses at that third operation with the first two applied and journalled, and `--check` stays red
  (the ten interlocked `/pnp:*` skills blocked; `update` and `selfcheck` still run) until the
  file is moved and the update re-run. Setup blocks on a foreign `AGENTS.md` the same way;
  `--adopt` decides it on a project with no installation.
- **Self-check pin on the role section of `docs/LOOP.md` (PLB-004)** - a structural check reads the
  top-level bullets of `## Role boundaries` and holds them to exactly the seven roles (COO, Writer,
  Reviewer, QA, QAL, Arbiter, Operator) in both directions: a role whose bullet is gone, a bullet
  that names no role and a second bullet for the same role all fail, each proven by its own negative
  control.
- **E2E trace note (PLB-004)** - when `verify.e2e.outputDir` resolves under `verify.e2e.cwd` and that
  directory holds a `next.config.*`, the setup interview says so right after the outputDir answer and
  the self-check prints it as a `[NOTE]`: a traced build may copy the whole E2E output into the
  standalone bundle. One predicate and one sentence (`scripts/setup/e2e-trace-note.mjs`) serve both;
  it is an observation and never a failure.

### Changed

- **Supersede duty for re-rendering migrations (PLB-002)** - `migrations/README.md`: a migration
  that re-renders an existing region with new sentences greps them against every consumer-local
  duplicate its NOTES.md names before it lands, and its note's `supersedes` list equals that grep's
  hits.
- **Gate 3 lets the main session write the transfer surface (PLB-001)** - while an R2/R3 route is
  open, the main session may now also write the one file `paths.transferSurface` resolves to (else
  `<plansDir>/PNP_CANDIDATES.md`), so an incident row no longer waits for the ticket to close. The
  surface is honoured only when it is a contained relative path with no `..` segment, ends in `.md`
  and is not under `.claude`, and never while the route state is unusable; every other code-class
  path stays denied, and a config that cannot be read opens nothing. The deny text names the
  surface when one is in force.

### Fixed

- **`$schema` no longer goes stale (PLB-002)** - setup wrote the pointer once and update never did,
  so an installation that only updated kept a path into an old plugin cache. Every update run from a
  different plugin root now refreshes it once, before any migration is journalled (a resumed run
  keeps its journal's hashes and the next clean run refreshes); an already-current run that refreshes
  it prints `refreshed $schema: <from> -> <to>` and `nothing else was written` and runs the
  self-check, and an applying run records the same line in its CHANGES report.
- **`/pnp:roles --show` no longer forces its exit (PLB-004)** - `aiwf-roles.mjs --show` ended with
  `process.exit(0)`, which can cut its own pending stdout short on a POSIX pipe; it now returns
  status 0 through `process.exitCode`, with the write path in its own branch so the table is never
  printed twice. The setup suite's exit pin now also refuses `process.exit(0);` in that file.

## [0.2.18] - 2026-10-15

Doctrine text tightened where consumers found it silent or wrong: shell edits, dialogs, how passes
are counted and named, a paid pass that dies, who commits what, and what a ticket's close leaves
behind.

### Changed

- **Editing is not a shell job (STAB-001)** - tracked files change through Edit/Write; scan agents
  answer in their reply; a procedure agent writes only under the scratch directory; a permission
  gate is tested on a copy, never weakened.
- **Dialogs and the operator channel (STAB-001)** - a question stops work only when the ticket
  cannot continue; dialogs are named by what they approve; passes by role, number and engine;
  verdicts by who gave them.
- **Passes (STAB-001)** - a correction round counts from a verdict; a small code round after a
  Reviewer fail needs no verification pass outside migration, access policy, grants, auth and the
  permission model, and a QA fail is closed only by a QA run; a dead paid pass resumes on the
  operator's word; the review brief is written before the dispatch.
- **Plans and close (STAB-001)** - a ticket's COO routing line; the Writer commits code and the COO
  its records; the close cleans the scratch directory and recommends the session; relayed claims
  are checked or marked unverified.
- **Smaller rules (STAB-001)** - parallel Writers over disjoint files, background long commands,
  tests that cannot fail, the resume point rewritten whole, incidents in the ledger, host refusals
  of self-modifying writes.
- **Migration `0022_stab-prose` (STAB-001)** - re-renders the managed CLAUDE.md region, the Writer
  agent, ORCHESTRATOR.md and, where present, the Reviewer agent.

## [0.2.17] - 2026-10-14

The readiness cycle is leaner and sharper: one scan agent per ticket, no counter pair, a
class for the race left as an "accepted residual", an own pass that opens what the Writer acts on,
a plan that carries `file:line` where someone acts, and a self-check that sees a plansDir under the
scratch directory.

### Added

- **Readiness class 15 (LEAN-001)** - `docs/READINESS_CLASSES.md`: a concurrency decision left as an
  accepted residual is an open decision, and no pass accepts it; readiness check 3 names, for every
  write the plan adds or changes, the lock that holds it and what runs beside it - in
  `docs/WORKFLOW.md`, in the fact-check instruction and in the own pass's `discovery` cell.
- **plansDir under the scratch directory is observed (LEAN-001)** - the self-check's fourth
  `(observed)` row says `under the scratch directory` or `outside the scratch directory` (a note,
  never a failure), and `/pnp:setup` warns at the plans question - a lexical prefix test over the
  configured paths, folding case and backslashes on a project whose `os` is windows; any other
  ignored path is detected by neither.

### Changed

- **One scan agent per ticket (LEAN-001)** - `/pnp:review` Step 2a dispatches one scan-tier agent
  that returns the behavior ledger and the consequence scan as two tables from one context; the
  files stay two and the plan gate is untouched; Step 2c describes the second table and the delta
  scan before a further pass. `.claude/aiwf-native/ORCHESTRATOR.md` is re-rendered by migration
  `0021_lean-readiness`.
- **The own pass opens what the Writer acts on (LEAN-001)** - Step 2d and `docs/WORKFLOW.md` § Plan
  readiness review: every pointer the Writer acts on opened, the ledger rows read as behavior, every
  instrument run with valid AND broken input - in place of "every `file:line` opened".
- **Pointer discipline (LEAN-001)** - `docs/WORKFLOW.md` § Ticket brief contract and § Plan readiness
  review: a plan carries `file:line` where the Writer acts or an acceptance check reads; context
  cites the section and the symbol.

### Removed

- **The counter start/stop pair (LEAN-001)** - `templates/PNP_CANDIDATES.md.tmpl` and the skeleton
  in `docs/WORKFLOW.md` § The transfer surface: a Pass statistics row records which pass it was and
  what it cost as the engine reported it, and nothing asks the operator for a counter; § Branch
  policy loses the "one live auditor" clause that held only while a pair was being recorded.

## [0.2.16] - 2026-10-04

A plan's draft and its readiness history live in the repository; the scratch directory carries the
live loop mechanics only.

### Changed

- **Readiness artifacts live under plansDir (DRAFTS-001)** - `/pnp:review` Step 2e: a draft is
  `<plansDir>/drafts/PLAN_<ABBR>.draft.md`, untracked, and is moved to `active/` at landing; the
  behavior ledger, the consequence scan, the fact-check ledgers, the own pass and the revisions land
  in `<plansDir>/readiness/<ABBR>/` with the plan's docs commit and stay there; the scratch directory
  stands in only while Gate 3 holds the main session out of plansDir, and the landing checks the
  fixed names before `git add`. `/pnp:setup` creates `drafts/` and `readiness/`; an older installation creates them on
  first use, and the self-check observes them as a note. Doctrine and the plansDir description say
  "parent of active/, archive/, drafts/ and readiness/".
- **"Gitignored" is the project's own doing (DRAFTS-001)** - none of the six sentences that called
  the scratch directory, the route state or the E2E artifact directory gitignored survives: four
  now say the project's own `.gitignore` keeps the path out of git (three of them that setup writes
  no ignore entry), and the two that placed the behavior ledger and the consequence scan name their
  readiness files instead; the self-check observes, as a note, whether git ignores the scratch
  directory at all.
- **The CLAUDE.md region says "lands in active/" (DRAFTS-001)** - re-rendered by migration
  `0020_drafts-in-repo`: the plan is moved there from its draft, not copied.

## [0.2.15] - 2026-10-02

A paid readiness pass no longer starts on an own pass nobody wrote down: the consequence scan and
the COO's own pass are files the brief names, and a plan-class pass refuses to start without them.

### Added

- **Consequence scan (RGATE-001)** - `/pnp:review` Step 2c: before every paid readiness pass, one
  scan-tier agent per ticket searches the tree for surfaces that can violate each decision of the
  plan; the COO closes every row in a file before the pass, and the scan runs again over what each
  revision changed.
- **The own pass as a file (RGATE-001)** - Step 2d: the COO's own pass is the last act over the
  plan - one row per audited ticket against the six readiness checks, every instrument run on valid
  and on broken input - stamped with the plan's SHA-256 (`scripts/engine/plan-gate.js --hash`).
- **Plan-pass gate (RGATE-001)** - `scripts/engine/plan-gate.js` checks the brief's `Class:`,
  `PLAN:`, `TICKETS:`, `CONSEQUENCE SCAN:` and `OWN PASS:` lines; `codex-review.ps1` / `codex-review.sh`
  refuse a plan-class run (by the class flag or the brief's `Class: plan` line) with exit 2 and
  Gate 2 denies a Claude reviewer dispatch whose brief carries that line when an artifact is
  missing, a row is open, a ticket is uncovered, an
  instrument cannot fail or the plan changed after the stamp. It proves presence and shape, not
  quality.

### Changed

- **Readiness order (RGATE-001)** - `docs/WORKFLOW.md` and the rendered
  `.claude/aiwf-native/ORCHESTRATOR.md` (re-rendered by migration `0019_plan-readiness-gate`): the
  behavior ledger, the consequence scan, the fact-check gate, then the COO's own pass - last.

## [0.2.14] - 2026-09-30

A reported verdict is no longer a stop: the COO reports it on its own and goes on in the same turn.

### Changed

- **A verdict gets its own message, not its own turn (HARD-022)** - the Orchestrator rule "a verdict
  and the next dispatch never share one message" was read as "stop after a verdict" and halted the
  loop at steps that need no operator word; it now says the verdict is reported on its own, the COO
  goes on in the same turn, and the loop halts only where the doctrine puts a halt.

## [0.2.13] - 2026-09-30

A readiness pass stops paying for what the plan's author remembered wrong about the code: the code
is read by a second context before the pass, and the fact-check gate reports on every claim.

### Added

- **Readiness classes (RDY-001)** - `docs/READINESS_CLASSES.md` lists fourteen blocker classes a
  readiness pass keeps finding, one question each; the fact-check agent applies every class to
  every ticket before a readiness pass and names a gap by class number.
- **Behavior ledger (RDY-001)** - `/pnp:review` Step 2a: before the first paid readiness pass (and,
  with no auditor pass configured, before execution approval) one scan-tier agent per ticket reads
  every link of the ticket's chains in the code and returns one row per link - what it does with
  the plan's input, what it closes over, what it does at N rows and under concurrency, what the
  library underneath does; a link the plan creates is a `NEW` row, an unopened one an `UNREAD` row.

### Changed

- **The fact-check gate returns a ledger per claim (RDY-001)** - `/pnp:review` Step 2b now returns
  one row per claim (verified, false or unverifiable) and a `CLAIMS:` count line; sampling is a
  contract violation that re-dispatches the section, a claim not opened is unverifiable, and a hook,
  engine or library claim is verified in code, never in a document that describes it. Over a plan
  the document is split into one agent per ticket section plus one for the shared sections.
- **Behavior ledger duty replaces the chain-trace duty (RDY-001)** - the rendered
  `.claude/aiwf-native/ORCHESTRATOR.md` (re-rendered by migration `0017_behavior-ledger`) now owes
  the ledger of Step 2a before a paid readiness pass, and also when no auditor pass is configured.
- **WORKFLOW describes the same gate (RDY-001)** - `docs/WORKFLOW.md` names the per-claim ledger,
  the own pass over the behavior ledger, and one new rule: the revision after a pass closes the
  blockers it was handed and adds nothing new.

## [0.2.12] - 2026-09-28

The fact-check gate now hands the COO the readiness gaps a paid pass would otherwise be spent on, and the self-check stops pinning doctrine sentences.

### Changed

- **The fact-check gate reads a plan for readiness gaps, not only for false facts (HARD-020)** -
  before a readiness pass, the scan-tier fact-check agent now applies the six readiness checks
  adversarially and returns a second list of gaps (A: the Writer cannot execute, or the check
  cannot fail or cannot pass; B: a false or unverifiable claim; C: consistency) beside the false
  claims, with no verdict; the COO closes every A and B item before the paid pass. The list is not
  the COO's own pass and is never counted as a pass: `docs/WORKFLOW.md` § Plan readiness review
  says so, adds that the own pass runs every command on the real tree rather than on a stub, and
  no longer describes the gate as returning only claims or as unable to see process.
- **The self-check stops pinning doctrine sentences (HARD-021)** - of 96 doctrine checks it keeps
  9: five operator-gate sentences, one home each (one word per pass, the audit-pass question for a
  newborn ticket, the doctrine-write gate, host-directive precedence, a warm readiness pass only on
  the operator's word) and four mechanical checks (the two `git -C` ruleset forms, the
  model-agnostic Orchestrator template, the shipped-commands index). Prose in `docs/` and `skills/`
  is read in place by the installed skills and is never rendered into a project, so a prose change
  is a version bump, a CHANGELOG line and a note-only migration - verified by CI on the pushed
  commit, not by a local run of every suite.

## [0.2.11] - 2026-09-24

A Claude-hosted Reviewer or QA can be pinned to an exact model id, the way the Writer always could,
and a real release stops rewriting the example project.

### Changed

- **A real release no longer touches examples/ (HARD-019)** - the example project's simulated bump
  used to be a numbered migration fixture that had to be renamed at every release, so every version
  bump rewrote `examples/`. The fixture is now an unnumbered template (`bump/example-bump/`), and
  `scripts/ci/example-bump.mjs` numbers it at run time against the payload it lands in, reading the
  whole template into memory before it writes anything - a refused build leaves the payload intact
  and can simply be run again.

### Fixed

- **A Claude-hosted Reviewer/QA can be pinned to an exact model id (HARD-018)** - a claude-hosted
  `roles.reviewer`, `roles.qa` and audit-table row took `fable|opus|sonnet|haiku` only, and an alias
  silently moves to a newer model with every model release. They now take a tier alias or an exact
  id (e.g. `claude-opus-5-5`): `/pnp:review` and `/pnp:qa` pass `model` to the Agent tool only for
  an alias and omit it for an exact id, so the rendered agent's frontmatter pin runs - the Writer's
  pattern. A claude row shares the ONE reviewer agent file, so it takes an alias or exactly
  `roles.reviewer.model`; one function (`scripts/setup/role-rules.mjs` `claudePinErrors`) enforces
  that for setup, `/pnp:update` preflight and `/pnp:roles` before any write, and `/pnp:review` fails
  closed at dispatch on a pin mismatch. An exact id is never ranked: `/pnp:roles --show` marks it
  `(exact id - tier not ranked)` and the fact-check gate always runs before a pass on it. No config
  valid before this release becomes invalid; migration `0015_exact-model-pin` re-renders the agent
  files that state the dispatch contract.

## [0.2.10] - 2026-09-24

The audit table stops being stricter than the engines it dispatches to: a review row's `effort` is
any non-empty string, exactly like a role's.

### Fixed

- **The audit-table rows take any effort the engine takes (HARD-017)** - `review.plan|code|docs`
  pinned `effort` to `low|medium|high`, so an auditor measured at an effort a newer engine release
  accepts could not be written down: `/pnp:roles --set code.effort=<value>` exited 1 and the only
  way to use that configuration was to go around the wrapper. The three rows are now
  `{"type": "string", "minLength": 1}`, the shape `roles.*.effort` always had - the engine owns the
  vocabulary and rejects an unknown value visibly at call time, and `--set <row>.engine=codex` can
  now copy a codex Reviewer whose own effort no list of ours anticipated. The empty value, the
  refusal on a claude row and every configuration valid before this release are unchanged.

## [0.2.9] - 2026-09-22

The two defects the 0.2.8 arbitration surfaced are fixed: the operator's two session doors now
read the same four documents the managed CLAUDE.md region requires, and nothing /pnp:setup
prints contradicts the doctrine it reinforces.

### Fixed

- **The session doors' doctrine preflight names all four documents (HARD-015)** - /pnp:mission
  and /pnp:work listed three, and a consumer session worked a full day on a stale preflight;
  both skills now carry the managed region's wording for the rendered standing rules, and the
  self-check pins the enumeration's three payload homes with a per-home negative control.
- **The dispatch-waits-for-operator-word seed no longer prints a revoked reading (HARD-016)** -
  the seed restated "a notification, not a question"; it now points at guard (b). Guard (b)
  says the loop runs to the end of what the word covers - every further paid pass takes its
  own word; guard (g) now states when an operator remark becomes a standing rule (read the
  guard - the mechanism lives there, not here); the planning-lock memory sentence defers to
  guard (g) for rule-bearing writes; the memory-seeds directory joins tripwire (4)'s
  closing-grep homes.

## [0.2.8] - 2026-09-21

The main session gets a rendered rules file of its own, and the re-render operation learns how to
put a brand-new artifact on an installation that has never had one. The Orchestrator role is the
COO's standing rules as DATA, in two kinds: a rule whose home is a payload document is pointed at
rather than restated, while the COO's own working rules have no other home and are stated there in
full - with no model pinned anywhere in it, because who audits what is the audit table's answer. It
reaches an existing installation through `createIfAbsent`, the new optional field on
`rerender-managed-region`, which relaxes nothing about adoption: it renders and stamps where nothing
is on disk, and it STOPS where a file this engine never wrote is already standing.

### Added

- **The rendered Orchestrator role (CONS-008)** - `.claude/aiwf-native/ORCHESTRATOR.md`, a managed
  artifact rendered from `templates/ORCHESTRATOR.md.tmpl` on every installation: unconditional (a
  project has a main session whatever its review hosts are), without frontmatter (nothing dispatches
  it), and model-agnostic by contract - the template reads no `config.roles.*` key, and the
  self-check holds all three of those as negatives over the file. It STATES the COO's own working
  rules, five of them pinned literally by the self-check with a control each: data discipline, the
  separation of a verdict from the next dispatch, the honest limit of the chain-table form check,
  the duals law, and the event-ledger row format. The rules whose home is a payload document are
  named and pointed at rather than restated.
- **`createIfAbsent` on the rerender operation (CONS-008)** - an optional boolean on
  `rerender-managed-region` for an artifact the payload has only just started rendering. No record
  and no file: rendered, written and stamped, and reported as `created (no record, no file)` in the
  `CHANGES` report, on the operation that created it. No record but a file already standing there
  whose content IS the render: that is this engine's own write - the artifact lives in the plugin's
  own folder - so nothing is written over it and it is simply recorded. No record and a file that
  DIFFERS: the run stops, at planning, at the last read before the write, at the write itself (a
  creation publishes NO-CLOBBER at the syscall, so a file that appears in between fails with EEXIST
  and gets the same sentence) and in the recovery of an interrupted creation, because an update
  never adopts a file it did not write. A record already there: the ordinary re-render, with the
  field invisible. It is refused for a
  region-scoped operation (a region cannot be created into a file that does not exist), and it may
  not travel in one operation with `ifRecorded`, whatever the two values are - they answer the same
  question in opposite directions, and the validator refuses the pair rather than inventing a
  precedence between them.

- **`/pnp:arbiter` - the escalation session (CONS-009)** - a twelfth command, and the only one that
  is opened cold on purpose: it loads the escalation rule, reads the **Ruling ledger** section of the
  transfer surface (the configured `paths.transferSurface`, or `<plansDir>/PNP_CANDIDATES.md` when
  the key is absent), takes the brief the COO parked at
  `<scratchDir>/arbiter-brief.txt` and returns ONE ruling as a message. Without that brief it
  refuses in one line rather than reconstructing the case from the conversation, and the last parked
  brief overwrites the previous one - one open case at a time. It is read-only on the tree by the
  construction of its own steps: it writes nothing, dispatches nothing, and does not write the ledger
  row it hands over ready to paste, because the executing session is the one accountable for what
  lands in the tree.
- **Escalation and the arbiter in `docs/WORKFLOW.md` (CONS-009)** - the four countable triggers (a
  reversed plan-recorded decision, an access-policy/tenancy/security-definer surface, a blast radius
  that crosses the ticket, two sessions or roles disagreeing in writing), and the rule that a fired
  trigger makes the escalation MANDATORY with no word gating it. Where a second-view session is live
  the COO sends the brief to it directly and the operator is never a courier; where none is, the
  operator's part is purely physical - one command - and a solo installation escalates to the
  operator. The ruling returns as a message and the executing session writes the
  `{ question / ruling / evidence pointer }` row.
- **COO routing (CONS-009)** - a subsection of § Routes with four countable checks deciding whether a
  ticket is driven by a COO at the top tier or by the cheap one: any "yes" routes upward, all "no"
  routes cheap, and two sessions reading the same ticket compute the same answer. Beside them the
  dynamic clause (a trigger surfacing mid-ticket suspends the ticket) and the invariant that makes
  the cheap route survivable - the routing moves the COO and nothing else, so the Writer's pin and
  the audit table do not follow it down. The hardening principle rides with them as an ECONOMICS
  NOTE rather than as a fifth check: it says where the saving of a cheap COO comes from and where it
  evaporates - work routed cheap without a readiness cycle behind it keeps the same routing and pays
  the difference later, in correction rounds - and it changes no answer of the four checks and names
  no kind of work. The four checks are the whole rule. The term is "COO routing"; "tier" stays
  reserved for the model vocabulary. What the self-check buys here is text,
  not behaviour: it holds these SENTENCES in `docs/WORKFLOW.md` and holds the retired "COO tier"
  spelling as a negative over `docs/`, `skills/` and `templates/` - a routing rule has no runtime
  surface, and nothing here proves how a session routed.

### Changed

- **A disputed design decision stops the loop instead of being implemented (CONS-009)** - the
  rendered Orchestrator role and `/pnp:review` Step 4 now say the same thing in their own registers:
  where the Reviewer disputes a DESIGN decision the COO made, rather than naming a defect, the COO
  writes the disagreement down in two or three sentences and takes it to the operator; the
  correction round waits for the word. A round that implements a disputed blocker settles a design
  question by spending a pass, with the party tempted to skip the escalation deciding. Pinned in both
  homes, by count.
- **The index of shipped commands gets a second instrument (CONS-009)** - the literal pin on
  `skills/README.md`'s `Shipped:` line catches a rewording and nothing else, so a skill could ship
  without ever being written into the line. It is now also read structurally, in both directions:
  every directory under `skills/` is named, and every name is a directory. Both counts of twelve -
  the prose line and the command table in `README.md` - were updated with it.
- **The managed CLAUDE.md region's preflight names the rendered role (CONS-008)** - the
  doctrine-preflight bullet inside the `aiwf-core` markers now lists
  `.claude/aiwf-native/ORCHESTRATOR.md` beside the two payload documents and the project's overrides
  document. That is the whole delta of the region; migration `0012_orchestrator-role` re-renders it.

## [0.2.7] - 2026-09-17

An installation gets one operator-owned page, and a release note gets a way to say what it retires.
The transfer surface is where the four things that outlive a plan are collected - work that is only
proposed, the ruling that settled a conflict, what an auditor pass cost, and a rule-class event
worth a pointer - and its whole design is what does NOT happen to it: seeded once by `/pnp:setup`,
then no bookkeeping record, no resolvable address and no migration operation, ever. The self-check
holds that boundary with a control that injects a record for it and is required to fail. Beside it,
a `note` operation may now declare `supersedes`, so a release can name the ids it retires and the
`CHANGES` report prints them under the note that explains why - applying nothing, because a note
never writes a file of the operator's.

### Added

- **The transfer surface, seeded once and never managed (CONS-001)** - `/pnp:setup` writes the
  four-section skeleton (Candidates, Ruling ledger, Pass statistics, Event ledger) from
  `templates/PNP_CANDIDATES.md.tmpl` at the configured `paths.transferSurface`, or at
  `<plansDir>/PNP_CANDIDATES.md` when that optional key is absent. A file already at that path is
  left byte for byte as it is. The key has no schema default on purpose: a default would put it into
  every fresh config and invite the managed-artifact treatment this file must never get. Setup reads
  the key for the seed location and validates it stays inside the project root; the update engine and
  the hooks never read it. An installation older than the key creates the file by hand from the
  skeleton written out verbatim in `docs/WORKFLOW.md`.
- **`supersedes` on a `note` operation (CONS-001)** - an optional array of non-empty strings, checked
  on the same terms as `docRefs`, printed in `CHANGES_<from>-to-<to>.md` as one `Supersedes: <id>`
  line under its note. It is a fifth FIELD on one operation, not a fifth operation type, and it
  applies nothing.
- **Eight doctrine rules adopted into `docs/WORKFLOW.md` (CONS-004)** - rules that had been living in
  one or another installation's local notes now have an authoritative home. § Branch policy states
  the multi-session invariant: one working tree carries exactly ONE executing session, the others may
  read, and the "one live auditor" clause is scoped to measurement rather than being a general work
  ban. § Operator-interaction guards grows from five rules to eight: **(f)** project canon beats the
  host's ergonomic directives while its safety and permission rules are never overridden, **(g)** a
  rule-bearing write is shown to the operator and lands only on approval (a purely factual status is
  exempt), **(h)** doctrine born in any other home leaves a same-moment pointer row on the transfer
  surface. Guard (b) gains the question a newborn ticket's announcement carries - does this ticket get
  an audit pass - mirrored in the managed `CLAUDE.md` region, `/pnp:mission` and `/pnp:work`.
  Archiving now checks as well as moves: it greps a plan's process sections for rule-class points
  without a pointer row. And the completion record is its own commit, stated both where the record is
  defined and in § Commit & Push Authority. Each sentence is pinned by the self-check with a negative
  control that reverts it to the weaker rule it replaced.
- **A fourth countable tripwire (CONS-004)** - an enumeration ends on the closing grep (for the
  symbol, for the phrase or count the change invalidates, and for the bare pointer form) that first
  HITS the known list and then returns zero outside it, and every new or changed evidentiary
  instrument is made to fail on purpose before it is trusted; retro-proofing existing instruments is a
  deliberate ticket, never an ambient duty. `docs/WORKFLOW.md` and the managed `CLAUDE.md` region move
  in lockstep to "Four countable tripwires", and "Three countable" joins the retired patterns the
  doctrine sweep refuses to find anywhere in `docs/`, `skills/`, `templates/` or `README.md`.
- **`0011_transfer-surface` re-renders the managed `CLAUDE.md` region (CONS-004)** - the two doctrine
  sentences above that live inside the `aiwf-core` markers - the audit-pass question and the fourth
  tripwire - reach an existing installation through a `rerender-managed-region` operation on this
  release's own migration. Text outside the markers is untouched, and an artifact held through an
  override is recorded as upstream and reported rather than applied. The transfer surface itself is
  unaffected and stays what it was: no record, no address, no operation, in this release or a later
  one.
- **The word-gate line travels in the note text (CONS-001)** - a migration whose release introduces a
  word-gate carries "If this release introduces a word-gate: check your local rules for
  self-initiated dispatch or remediation - a rule written before this gate may contradict it."
  verbatim in its note, because the note text is the only thing that reaches the operator's `CHANGES`
  report. The convention is written down in `migrations/README.md`.
- **Three contract clauses for a review pass (CONS-005)** - `/pnp:review` now says what a pass is
  handed. A readiness fact-check carries the chain-table line beside the acceptance-command one
  (every Outcome sentence has a row, every link resolves at its `file:line`, endpoints are source or
  render-or-DB-write surfaces, chains start at the entry point); `docs/WORKFLOW.md` § Plan readiness
  review moves with it and names the same two instructions. The plan-readiness brief shape - the
  brief a readiness pass is actually written from - carries the previous pass's blockers as a fixed
  field, verbatim, and states that their absence from pass 2 on is a contract violation the Reviewer
  reports separately; that is the input side of the carry mechanism `docs/WORKFLOW.md` § Fail
  aggregation already required, and the implementation-diff template keeps the field but points at
  the rule rather than restating it, so the contract has one home. And a first `code`-class pass
  carries an evidence pack: the `file:line` evidence the COO already holds, handed over so the pass
  is spent on judgment rather than on rediscovery - with the limit that keeps it honest written
  beside it, that the pack is the audited side's own selection, so the Reviewer keeps the right and
  the duty to read past it and an incomplete pack is itself a finding. The claim for the pack is
  qualitative and stays that way: it is not a promise of a cheaper pass.
- **When a pass may resume, beside the mechanics that already said how (CONS-005)** - `/pnp:review`
  and `/pnp:qa` document the resume flag, the per-role state file and the refusals; each now also
  states the policy, in the same place, so the two cannot drift apart. One question decides it -
  resume answers "is the DELTA sound", cold answers "is the WHOLE still sound" - and from it: a
  plan-readiness pass 1 is always cold, for independence rather than for economy; a verification
  pass after a correction round resumes by default; a round that re-architected rather than closed
  the blockers reverts to cold or to the operator's call; a readiness pass after the first resumes
  only with its compensations and only on the operator's word; and a warm session is retired at its
  first compaction. With them, the recovery an interruption gets: a killed pass ends a process, not
  the work, so the default is a bare resume plus a short continuation prompt rather than a fresh
  dispatch of the whole brief. All three background-run paragraphs - both skills and
  `docs/CODEX_REVIEW_QA_RECIPE.md`, which had been declaring a pass lost two lines above the section
  documenting its recovery - stop calling such a pass lost: the run ends and no verdict arrives,
  which is unchanged, but what it had already read is recoverable. The case against running a pass in
  the foreground is left exactly as strong, because recovery costs a further dispatch and the
  operator's attention. Every rule above is pinned by the self-check with a negative control that
  loosens it back to the practice it replaced - one entry per file for a rule that stands in two -
  and the wording the fatalism is gone from is pinned the only way a removal can be: as an absence,
  in the retired-phrase sweep that refuses to find it anywhere in `docs/`, `skills/`, `templates/`
  or `README.md`.

### Fixed

- **The self-check's output no longer truncates on POSIX (CONS-011)** - a red self-check printed its
  report and then lost the tail of it, so the operator read half a failure list. The place is the
  CALLERS' exit: `finishWithSelfCheck` writes the child's captured stdout into the caller's own
  stdout, which is synchronous on Windows but an asynchronous pipe on POSIX, and all four callers -
  `scripts/update/aiwf-update.mjs`, `scripts/setup/generate.mjs`, `scripts/setup/interview.mjs`,
  `scripts/setup/aiwf-roles.mjs` - turned the returned code into `process.exit(<code>)`, which forces
  the exit with that write still pending. Each now assigns it to `process.exitCode` instead; the exit
  codes themselves are unchanged, byte for byte. POSIX-005 was recorded as a known limit in 0.2.2:
  that entry named this mechanism, pointed at the `spawnSync` CAPTURE of the child's output, and said
  honestly that the exact site was unpinned - the site is the callers' exit. macOS had been showing
  the same defect since 0.2.0, and Linux joined it when the self-check's own output grew. The setup
  suite pins the four exit statements byte for byte - the compliant form present once, the forced
  form absent - and pins the count of `finishWithSelfCheck(` call sites across the payload's scripts
  at five; a new caller is not discovered by that pin, and is the reason the count is pinned.
- **`skills/README.md` lists every shipped command (CONS-005)** - the index line named ten of them
  and omitted `roles`, so the directory's own index disagreed with the directory. The corrected line
  is pinned, with a control that reverts it to the ten-name list.

## [0.2.6] - 2026-09-15

The audit table stops reading like a list of settings and starts reading like what it is. The one
screen that answers "who audits this work, on which engine, with how many passes" was printing four
different KINDS of row - the roles, the review classes, the fact-check gate and R1 - as one
undifferentiated stream, where a structural blank and an unset value look identical. It now prints
as four labelled blocks under the same header, with every value, marker and column width unchanged
to the byte. The two rows nothing configures are pinned by the self-check with a control that
removes one of them, because a session re-rendering the table came back with seven rows and the
missing two had no setting anywhere to give them away. The renderer and the skills that print it are
payload, so that half of the release arrives with `/plugin update` and has no operation to apply.
The other half does: the doctrine now states one prefix per plan, and
`0010_plan-prefix-legibility` carries both the release note and a re-render of the `aiwf-core`
region of your `CLAUDE.md`, where the rule about a ticket born after a standing word is written.

### Added

- **One prefix per plan: the ref is a lookup, not a description (HARD-009)** - a plan file is
  `PLAN_<ABBR>.md` with `<ABBR>` written as 2 to 8 uppercase letters, every ticket in it carries the
  Ticket Ref `<ABBR>-<NNN>` with the same abbreviation and a three-digit sequential number that is
  never reused, a ticket born while other work is in
  flight takes that same abbreviation and the next free number, and a candidate has no ref until it
  is written into a plan. From `ABC-007` the plan file is known without a search, which is what
  makes the ref worth having. The convention is not retroactive: existing plans and refs keep their
  names.
- **Gate 2 looks the ticket up by address, with the scan as a fallback (HARD-009)** - in `off-plan`
  mode the dispatch gate derives `<ABBR>` from the ref and reads `PLAN_<ABBR>.md` directly; only
  when that file does not exist, cannot be read, or does not carry the ref does it fall back to
  reading every `PLAN_*.md` in the active directory - which is how a plan named before the
  convention is still found. The ask/silent decision is unchanged in both directions; only which
  files are read is. A targeted hit still lists the active directory before clearing the ref, and
  still raises the old dialog when it cannot, because a directory the gate cannot read has never
  been a silent pass.
  The gate now exports that lookup, so the self-check exercises the production helper: with a decoy
  plan that sorts FIRST and also mentions the ref, the targeted path must report having read exactly
  one file.
- **The self-check asserts the naming rule, with a two-leg control (HARD-009)** - for every
  `PLAN_<ABBR>.md` in the project's active plans, each `<PREFIX>-<NNN>` ticket heading must carry
  that plan's own abbreviation. The check prints how many files and headings it examined, so an
  empty directory cannot read as a pass; a clean fixture must produce no finding and a sabotaged
  copy carrying a foreign prefix must fail. Plan files whose names predate the convention are
  excluded by construction and reported as an observation rather than silently passed.

### Changed

- **The audit table reads as four kinds of row (HARD-008)** - `/pnp:roles --show` prints its header,
  then `-- roles (who does the work) --`, `-- review classes (what gets audited, how many passes) --`,
  `-- always-on gate --` and `-- routes --`, one blank line between blocks. The nine data lines are
  byte-for-byte what they were - the same cells, the same `(below the top tier)` and
  `(the Reviewer's - Claude rows share the agent file)` markers, the same column widths - because the
  block labels are emitted outside the column padding rather than through it. The point is the empty
  cell: a dash in a role's `passes` column, a dash on the fact-check row's `effort` and R1's
  `0 / no auditor` are three different structural facts, and one stream could not say so. Nothing
  about who audits what, or how `--set` and `--reset` address a row, changes. The self-check's
  `--show` pins are rewritten to the new shape (header first, the four labels in order, every row
  under its own block) and gain one of their own: BOTH non-configurable rows present, with a
  two-leg control - the relocated pristine renderer must still satisfy the assertion, and a copy with
  only the fact-check row removed must fail with exactly that one finding. `/pnp:roles`'s own
  "How to read the table" sample shows the new format, with its data lines unchanged.
- **`/pnp:work` and `/pnp:setup` print the audit table verbatim (HARD-008)** - both said "print the
  audit table" while `/pnp:mission` and `/pnp:roles` already said the tool's literal output. A table
  retold from memory is a table whose cells nobody verified, which is exactly how the two missing
  rows above were observed.

### Fixed

- **The update report no longer claims a dialog-free apply that never happened (HARD-008)** - every
  `CHANGES_*.md` carried the sentence "An unheld artifact you had not edited, whose payload render
  changed, was applied without a dialog; edited ones were asked about; held ones were recorded, not
  applied." unconditionally, including for a release whose migration renders nothing of yours. It is
  a legend for managed-artifact renders, so `assembleChanges` now prints it only when the run really
  carried one - a `rerender-managed-region` whose artifact this installation actually has - and the
  wording for such a run is unchanged, word for word. The defect was visible first on this release's
  migration while it still carried only a note; the update suite pins both directions, because a
  conditional with only its true branch asserted is indistinguishable from a constant.

## [0.2.5] - 2026-09-14

Live operator corrections and one consumer proof become payload rules, and they all land on the
same surface: what surrounds an audit pass, and what a plan owes before one is paid for. A verdict
now reaches the operator in substance rather than as half a line on the way to the next dispatch.
The default that let a LATER auditor pass ride the word given for the ticket is revoked: pass 1
rides that word, every further pass takes one of its own. Fail aggregation inside the
plan-readiness cycle stops being a bare ban and becomes a mechanism - the next pass is handed the
previous pass's blocker list, and a new blocker declares why that pass could not see it. And a
durable plan now owes an inventory of consumers and adjacent contracts before its first draft, a
walk of the ticket's own process against the gates before every paid pass, verification commands
that are written rather than described, and the contract that has to move with the change inside
the scope of the change. `0009_readiness-discipline` re-renders the managed artifacts that stated
the revoked default in writing: the `aiwf-core` region of your `CLAUDE.md`, and - where one was
rendered at all - `.claude/agents/reviewer.md`, which a Claude-hosted Reviewer reads instead of the
doctrine. Nothing else of your project changes.

### Added

- **Every Reviewer/QA verdict is reported in substance (HARD-012)** - `docs/WORKFLOW.md` § How the
  COO speaks to the operator gains a fourth point, and `/pnp:review` and `/pnp:qa` carry it at the
  step that relays the verdict: the COO reports the verdict plus one or two sentences of its
  substance, before the next dispatch - what the pass confirmed, or what its blockers and notes
  are. Verbatim to the COO, two sentences to the operator. The observed defect was the opposite of
  a wall of text: a bare "pass, moving on" that hid an audit the operator had paid for, and the
  rule that fixed it lived in one session's memory until now. The verdict vocabulary is untouched
  (`pass` / `pass-with-notes` / `fail`, `PASS` / `NEEDS-FIX`); the self-check pins the sentence at
  all three sites, each with a control that rewords it back into a one-line status.
- **Fail aggregation becomes an instrumented contract (HARD-005)** - the rule that a later round may
  not raise an already-visible blocker was a ban and nothing else, and a ban was measured to fail
  twice. In the plan-readiness cycle it becomes a mechanism instead: the brief of the next pass hands
  the Reviewer the blocker list the previous pass returned, and any blocker that is new must name its
  origin - why a pass earlier could not see it - with an undeclared one reported as a broken contract
  rather than folded into the verdict. The contract sentence itself is stated at the three sites that
  dispatch or judge a readiness pass (`/pnp:review` plan-readiness mode, `docs/WORKFLOW.md`
  § Fail aggregation, with a cross-reference from the readiness cycle, and `docs/REVIEW_CHECKLIST.md`),
  each pinned by the self-check with a control that collapses it back into the bare ban; the rendered
  `reviewer` agent states the same duty in its own voice, so a Claude-hosted auditor meets it where it
  works. The same mechanism now also pins the sentence that states the honest limit of the commit
  click - that the click approves the invocation rather than the tree that finally lands - at its two
  sites (`docs/LOOP.md` § Commit gate, `docs/WORKFLOW.md` § Commit & Push Authority), which until now
  could rot silently. Implementation reviews are untouched, and so are pass counts and every existing
  pass contract.
- **The consumer inventory becomes a readiness precondition (HARD-006)** - a durable plan now owes a
  scan before it owes a draft: one scan-tier agent harvests, for everything the plan touches - a
  column, a permission, a command, a contract - who consumes it and which contracts sit next to it,
  and the draft answers that list before the first paid review pass. In a measured readiness cycle
  the blockers were dominated by integration defects sitting a grep away from the author; a paid
  pass that discovers them buys at the most expensive tier what the cheapest one proves. The
  requirement is stated in `docs/WORKFLOW.md` § Plan readiness review, immediately before the COO's
  own pass, and in `/pnp:review` plan-readiness mode as a precondition on the COO rather than a
  check of the pass; the self-check pins both sites, each with a control that dissolves the
  specific requirement back into the generic discovery rule. No new skill and no new tool - this is
  doctrine over the scan mechanism that already exists.
- **Three rules of plan precision (HARD-007)** - what a consumer proof paid for in correction rounds
  is now stated where plans are written and judged, all three in `docs/WORKFLOW.md`. First, a
  verification command in a PLAN document is literal and can fail: readiness check 5 asks for a
  command runnable as written, with a named output that would mean "broken", instead of criteria
  that are "real and sufficient" - and § Proof-surface feasibility says the same about the plan
  itself, so a proof nobody can write as a command is a discovery item rather than an acceptance
  criterion. Second, before every paid readiness pass the COO walks the ticket's PROCESS against the
  gates it will hit, in order - the word that starts it, the tree its commands assume, each pass that
  needs a word of its own, the commit click, the tag and the push - because the fact-check gate reads
  claims and a wrong ORDER of correct steps leaves every claim true. Third, the brief-authoring list
  grows a sixth failure: the contract that has to move with the change is scoped beside it, a
  dependency pin bringing its lockfile and a deploy change its deployment canon. The self-check pins
  each of the three at its site, with a control that weakens it back into the rule it replaced -
  described proofs, a process folded into the fact-check gate, and "keep the scope tight".

### Changed

- **One word per pass replaces the standing-word default (HARD-012)** - the doctrine used to say
  that "the passes the route already prescribes run on the ticket's standing word", which let the
  COO spend a paid pass - external quota on a Codex host, top-tier tokens on a Claude one - without
  asking. From this release only the FIRST auditor pass of a route rides the ticket's word. Every
  further pass - a further configured readiness pass, the verification pass after a correction
  round that touched code, a pass beyond the review contract, a round past the correction cap - is
  dispatched on the operator's own explicit word, one word per pass. `review.<class>.passes` is
  therefore a CEILING rather than a budget, and `passes + 1` remains the hard maximum for plan
  readiness. Rewritten everywhere it was stated: `docs/WORKFLOW.md` (operator gates, loop shape,
  the readiness cycle and the sentence that used to start the whole cycle without a word),
  `docs/REVIEW_CHECKLIST.md`, `docs/OPERATOR_PROTOCOL.md`, `README.md`,
  `templates/CLAUDE.md.tmpl`, `templates/PROJECT_OVERRIDES.md.tmpl`,
  `templates/agents/reviewer.md.tmpl`, `/pnp:review`, `/pnp:roles`,
  `/pnp:work`, the config schema's `review.plan` description and both role-resolver headers - a
  rule left standing in the skill that dispatches the pass would keep instructing the revoked
  default. Unchanged: the correction-round cap, the pass COUNTS in your audit table, and the
  prose exception - a correction round whose whole delta is prose still warrants no pass at all,
  being covered by the fact-check gate plus the COO's own verification. Your overrides document
  keeps its seeded wording: that file is yours and no update rewrites it;
  `0009_readiness-discipline`'s notes say which line to correct if you want it true.

## [0.2.4] - 2026-09-13

Setup stops adopting a plans directory in silence. An install pointed at a project whose
`<plansDir>/active/` already holds `PLAN_*.md` files was handing Gate 2's `off-plan` mode a set of
plans nobody in this loop had approved, and saying nothing about it. The commit gate stops
overstating itself in the same release: the click approves an invocation, not a final tree.
`0008_consumer-correctness` is a note-only migration: nothing already installed changes.

### Added

- **Setup warns about a pre-existing plans directory (HARD-003)** - the `paths.plansDir` question now
  checks the candidate path before it is answered (the offered default first, then whatever is typed)
  and prints `N existing PLAN_*.md in <path>/active - Gate 2 off-plan will read them as active pnp
  plans; pick another paths.plansDir if they are not.` The count is exactly the set Gate 2 reads - a
  real file matching `PLAN_*.md` - so a directory with that name, or a `notes.md` beside the plans,
  is not counted. It matters because in `off-plan` mode Gate 2 stays SILENT on a Writer dispatch
  whose `Ticket: <REF>` appears in one of those files: pointed at somebody else's plans, the dispatch
  gate goes quiet on refs this loop never approved. The generator repeats the line as a `note` in its
  plan and report, so `--dry-run` and the non-interactive `--answers-file` install - which never sees
  a question - show it too. It is a WARNING, never a blocker: an operator may want that directory on
  purpose, and no install is refused over it. The schema defaults are untouched.
- **Setup says when the overrides document is already there (HARD-003)** - the same treatment on
  `paths.overridesDoc`, for the opposite reason: setup seeds that file once and never rewrites it, so
  pointing it at an existing file means this install writes no template there at all. Correct
  behaviour that produced no output, and was therefore indistinguishable from having been written.
- **The commit click's honest limit is written down (HARD-004)** - `docs/LOOP.md` § Commit gate and
  `docs/WORKFLOW.md` § Commit & Push Authority now both say that the click **approves the
  invocation**, not the final tree content. On a project carrying commit automation - a
  `post-commit` hook that amends, a `pre-commit` formatter, a version stamper - the approved tree
  and the tree that lands diverge silently; measured on a real consumer, an unstaged version file
  was amended into the commit the operator had just approved. Every guard of the form "this ticket
  touched exactly these files", including a brief's HEAD-at-dispatch anchor, is wrong by
  construction there. Binding the click to content (a token, a state file, a HEAD hash) stays
  refused by design, so the limit is stated instead of hidden.
- **The self-check reports commit automation as a `[NOTE]` (HARD-004)** - a new COMMIT AUTOMATION
  section reads the inspected project for an active `pre-commit`/`post-commit` hook (git's own
  `.sample` files are inert and never counted) and for a `core.hooksPath` that moves them, and
  prints the limit above as a `[NOTE]`. Never a failure and never a blocker: such a hook is a
  legitimate project choice, and a note is deliberately not counted in the pass/fail tally. The
  lookup follows git rather than a guess at it: a linked worktree is resolved through its
  `commondir` to the common directory where git really keeps hooks and config, and the effective
  `core.hooksPath` is layered as git layers it - `[core "sub"]` is not `[core]`, the last assignment
  wins, plain `[include]` files are followed to a 3-hop cap, and a per-worktree `config.worktree`
  overrides the shared config. The value itself is read as git reads one - a comment starts at an
  unquoted `#` wherever it stands, `\"` `\\` `\n` `\t` `\b` are escapes, a trailing backslash
  continues the value on the next line, `~/` expands against the home directory, and a value git
  would refuse is read as no value rather than as a guess. A `hooksPath` armed only through a
  conditional `[includeIf]`, and a `~user/` path, are deliberately not resolved; the self-check's
  COVERAGE text names both as non-claims. Both directions are asserted on repositories the section
  builds itself, including the inverse for the worktree case: a hook planted where git never looks
  must not be reported.

## [0.2.3] - 2026-09-13

The gate that was addressed to one shell tool now covers both. A permission rule names a TOOL, and a
Windows session carries a `PowerShell` tool next to `Bash` - so until now the whole ask list and
Gate 4 alike stopped at `Bash`, and the same commit, push, reset or recursive delete run through the
other tool raised no dialog at all. `0007_powershell-ask-ruleset` adds the 54 mirror rules to your
`.claude/settings.json`; rules you wrote or removed yourself are untouched.

### Added

- **The update names the payload rules it did not add and does not own (HARD-002)** - a payload ask
  rule your project already carries in the payload's own spelling is left alone forever: not added
  (it is there), not removed (it is not owned), not tombstoned (nobody removed it). That correct
  behaviour used to be invisible, because it produces no diff, and an operator reasonably read the
  silence as coverage. `planAskRules` now measures the set - `(desired n actual) - owned` - the
  reconcile summary reports it as `N payload rule(s) present but not owned here - hand-edited, the
  engine will never touch them`, and the `CHANGES_<from>-to-<to>.md` report lists those rules by name
  under the `reconcile-ask-ruleset` entry. Zero such rules, and the line is absent rather than zero.
  Nothing about what the reconcile adds, removes or tombstones changed: the add half never consulted
  ownership, and a project that owns nothing still receives every payload rule it is missing - now
  proven by the acceptance suite on the real entrypoint rather than described.
- **A `PowerShell(<X>)` mirror for every ask rule (HARD-001)** - `templates/settings.ask-ruleset.json`
  carries 54 pairs instead of 54 rules: the git verbs (including the three `git.exe` forms and the
  three rendered `git -C <projectRoot>` forms), the package-manager, migration-tool and container
  rules, and the four delete commands, each in a `Bash(<X>)` and a `PowerShell(<X>)` spelling, plus
  `PowerShell(*)` next to `Bash(*)` in the factory allow posture. The mirror is an invariant, not a
  convention: the self-check asserts it in BOTH directions - a `Bash` rule with no PowerShell twin
  leaves that tool unguarded, and an orphan `PowerShell` rule with no `Bash` base reads as coverage
  while gating one tool only - each direction with its own flipping control on a sabotaged copy. On a
  session with no PowerShell tool the new rules are inert, by the same prefix-matching argument that
  already lets one OS-neutral ruleset carry `Remove-Item` and `rm` side by side.
- **Gate 4 runs on both shell tools (HARD-001)** - the hook is wired on matcher `Bash|PowerShell` (a
  matcher of letters, digits, `_`, `-`, space, `,` and `|` is an exact alternation list, not a regex)
  and reads `tool_name` from the payload to judge each command in that tool's dialect. The deny
  branch is identical on both and still runs before the form is looked at: a non-writer subagent
  cannot reach a gated git verb by CHOOSING the other shell any more.
- **The PowerShell dialect is modelled as LESS, never as the same (HARD-001)** - three documented
  differences, each resolved towards asking. Its AST split is `;`, `|` and PS7's `&&` / `||`, so `&`
  stays the call operator it is and `& git push` matches no rule form; no wrapper or `NAME=value`
  stripping is documented for it, so `timeout 30 git commit` asks there while staying silent on Bash;
  and its matching is case-insensitive, so recognition folds case (`GIT Push` is recognised, and a
  background subagent is denied for it) while the byte-exact rule test folds case on neither tool - a
  passthrough may not rest on a rewrite this repository cannot observe. An unknown `tool_name`
  resolves to the PowerShell dialect, the stricter of the two on every axis.

### Changed

- **Every deny and ask names the REAL tool (HARD-001)** - the diagnostics said "Blocked Bash command"
  for every payload, which on a PowerShell command sent the reader to the wrong half of the ruleset;
  they now carry the tool from the payload, and a payload too malformed to name one says "shell"
  rather than inventing a name. Asserted on both tools with the other as the flipping control, in the
  spike matrix and in the self-check.
- **The honest limit is now a class, not a named hole (HARD-001)** - `README.md`,
  `docs/LOOP.md`, `docs/WORKFLOW.md`, `docs/OPERATOR_PROTOCOL.md`, `skills/loop/SKILL.md` and the two
  engine headers said "this gate sees one shell tool" and "every rule is a `Bash(...)` rule". Both
  layers now cover both shells, `Monitor` is documented as running under the Bash rules, and what
  remains is stated as the class it is: a tool NEITHER layer names, closable in two lines for any
  tool that exists, unclosable in advance for one nobody has named.
- **Branch policy states the cross-repository rule (HARD-001)** - a session does not run a mutating
  git or filesystem operation against a repository outside its own project root without the
  operator's explicit word for that exact operation. The `-C` forms ask by construction on both
  tools; the dialog is the backstop, the word is the rule.
- **The example fixture's negative control is relative (HARD-001)** - the self-check's
  `example-bump-id` sabotage hardcoded `0009_example-bump` against a fixture at `0007`. The fixture
  ascends by 1 with every shipped migration, so that constant would have become a VALID id two
  releases on and the control would have gone green while proving nothing. It now renumbers one past
  whatever the fixture currently is.

### Security

- The commit / push / merge / rebase / destructive boundary no longer depends on which shell tool an
  agent reaches for. Both the declarative `ask` rules and the hook behind them cover `Bash` and
  `PowerShell`; a background subagent is denied an ask-class git verb on either. This was the widest
  gap in that boundary, because unlike every other residual it needed no unusual command form - only
  the other tool.

## [0.2.2] - 2026-09-09

A third enforcement hook, for the two things a permission rule cannot do on its own: a background
agent's dialog reaches nobody, and a rule only covers the form it spells out - `git.exe reset
--hard`, `git -C <path> reset --hard` and `sudo git reset --hard` matched none of them. Nothing in
your project changes - `0006_git-verb-gate` carries a single note.

### Added

- **Gate 4, the git-verb guard (GATE-001)** - `scripts/engine/pretooluse-git-verb-guard.js`, wired
  on matcher `Bash`. It recognises `git` / `git.exe` (with an optional global `-C <path>` or
  `-c <k=v>`) followed by an ask-class verb anywhere in the command and then decides by identity:
  a subagent that is not the Writer is **denied**, naming the verb; the main session and the Writer
  pass through **silently** only where a rule the payload really ships matches the subcommand byte
  for byte (`git <verb> ...`, and `git.exe push|merge|rebase ...`), and are **asked** on everything
  else it recognised: `git.exe` outside those three verbs, **any** `git -C <path> <verb>` (the rule
  names `<projectRoot>`, and a hook that reads no project directory cannot confirm a path), a
  wrapper Claude Code does not strip (`sudo`, `npx`, `docker exec`, a flagged `xargs`, a
  `command -v` query), a nested shell (`bash -c "... git reset --hard"`), and irregular whitespace on
  either side of the verb - a tab or a second space where a rule spells out exactly one. Those forms
  matched no rule and raised nothing at all before. The default is
  inverted on purpose - confirm a real rule match or ask - because a guess about which forms "look
  gated" turns every looseness into a silent bypass, while asking is free: a hook decision does not
  bypass the permission rules, and a hook `ask` beside a matching `ask` rule is one dialog, not two.
  It fails closed like Gate 1, with the wider blast radius of matcher `Bash` named in its own
  header: it reads its stdin payload and nothing else - no config, no files, no project directory.
- **What the harness already does is left alone (GATE-001)** - Claude Code's permission documentation
  describes an operator-aware matcher: rules are tested against each subcommand of a chained command
  (`&&`, `||`, `;`, `|`, `|&`, `&`, newlines), the `timeout` / `time` / `nice` / `nohup` / `stdbuf` /
  `command` / `builtin` / `noglob` / flagless-`xargs` wrappers are stripped first, and matching
  continues past leading `NAME=value` assignments. So
  `cd <path> && git commit -m x`, `timeout 30 git commit -m x` and `FOO=bar git push` were never
  holes; Gate 4 stays silent on them and this release's doctrine says so instead of claiming
  otherwise.
- **The verb list is cross-checked, not proof-read (GATE-001)** - the hook carries one constant and
  the self-check parses `templates/settings.ask-ruleset.json` and requires every git verb those
  rules gate to be one the hook knows, with a control that adds a verb to a copy of the ruleset and
  requires the assertion to fail. A rule added to the ruleset can no longer outrun the gate in
  silence. Every shipped git rule is also parsed into its literal invocation FORM and held against
  the hook's own accept-space in both directions - each modelled form must be accepted, each accepted
  form must be carried by a rule, the `-C` forms must be refused - so deleting `Bash(git.exe push:*)`
  from the ruleset while the hook still accepts that form is now a failure rather than a green suite.
  The three gate branches are asserted as pairs - the same command from two identities, the
  same identity on two verbs, and every bypass shape (`.exe`, `-C`, `sudo`, `npx`, a flagged
  `xargs`, `command -v`, a nested `bash -c`, a tab or a second space on either side of the verb, a
  leading space, a newline split, a `$(...)` or `` `...` `` substitution, a verb glued to a `;`, a
  `)` or a backtick) against the
  nearest form a rule really matches - in the spike matrix and in the self-check, both of which run
  the shipped hook as the harness runs it. The verb token's reduction is a whitelist of the
  characters a verb is made of, and the self-check pins all 26 enumerated shell metacharacters as
  terminators, because a blacklist of them had already been wrong twice.

### Changed

- **The payload stops contradicting itself about second-layer shell hooks (GATE-001)** -
  `docs/LOOP.md` claimed one was deliberately not attempted while `scripts/engine/aiwf-lib.js`
  recorded that one had been tried and removed. Both now say the same thing: emulating shell
  escape/continuation semantics for every command remains out of scope, the removal record stands,
  and Gate 4 is the narrower thing that recognises verbs and decides on identity. The hook count
  moves from two to three across the README, the doctrine, the skills and the self-check's own
  wiring assertions, and the counted facts got a control that sabotages a copy of `hooks.json`.
- **The doctrine describes the harness's real matching (GATE-001)** - `docs/LOOP.md`,
  `docs/WORKFLOW.md` and `docs/OPERATOR_PROTOCOL.md` now state that permission rules are matched per
  subcommand, past the stripped wrapper set and past `NAME=value` prefixes, and that a hook decision
  never bypasses a rule. "Prefix matching" alone had been describing something weaker than what the
  harness actually does.
- **macOS is officially unsupported, and the payload says so (POSIX-005)** - supported channels are
  windows and linux. Nothing is removed and no configuration changes: macOS keeps its place in the
  `os` enum, keeps installing on the bash channel it shares with linux, and keeps its full CI leg
  running every gate. What changes is the promise, which had been wider than the evidence - the
  README's status section names the support tier, and the macos CI leg is now advisory
  (non-blocking) over the known defect below instead of blocking a merge on a platform nobody
  operates this loop on. The README's claim that no CI leg is advisory went with it.

### Fixed

- **The setup suite's section 23 control on macOS (POSIX-003)** - the entrypoint-identity section
  built its "direct" fixture inside the suite's own temp directory, which on macOS already sits
  behind a `/var` symlink, so the control that must prove "the link really defeats the naive guard
  here" was comparing a link against a link and failed on the premise it could not hold. Every
  fixture in that section now hangs off the resolved temp path, leaving the explicit junction as the
  only link in the picture.
- **The self-check reports even when it crashes (POSIX-004)** - a section that THREW escaped
  `main()` uncaught, so the tally, the `FAILURES:` block and the exit code never ran and the only
  thing the operator saw was output that stopped mid-run. An uncaught throw is now caught, printed
  on the same stream as the rest of the report - an `Error` with its full stack, any other thrown
  value rendered field by field rather than flattened or lost - counted as one `(uncaught)`
  failure - so the run exits 1 and keeps every assertion that ran before the crash - and announced
  as an INCOMPLETE RUN above the coverage text, which describes a complete one. The update
  acceptance suite stopped truncating the evidence in the same breath: a failing spawn's detail was
  its last three lines cut at 260 characters, and is now its complete output, printed only for the
  checks that fail.

### Known limits (stated, not hidden)

- **The git boundary covers ONE shell tool.** Every rule in `templates/settings.ask-ruleset.json` is
  a `Bash(...)` rule and Gate 4 is wired on the `Bash` matcher, so a harness that exposes a second
  shell tool - a Windows session carries a `PowerShell` tool next to `Bash` - runs commit, push,
  merge, rebase and reset through a tool neither layer sees, with no dialog at all - both halves of
  that are readable here, in the ruleset and in `hooks/hooks.json`. This is weaker than the
  recognition residuals below,
  because it costs no cleverness with the command - a subagent whose tool allowlist includes the
  other shell only has to choose it, so Gate 4's deny is bypassable by tool choice. What Gate 4 does
  on the `Bash` tool, it does as described above.
- **The passthrough branch rests on host behaviour this repository cannot test.** The operator-aware
  matching above is Claude Code's documented behaviour, not something any suite here pins - every
  assertion runs the hook against an assumed harness. If the host stopped matching per subcommand,
  the forms Gate 4 passes through (`cd <path> && git commit -m x` first) would silently stop being
  gated by anything and no test here would go red. The deny, the byte-exact rule test and the ask are
  the plugin's own behaviour and are covered.
- Gate 4 recognises, it does not parse a shell: an alias, a verb assembled from a variable
  (`git $VERB`) and an **escaped** verb (`git \push`) are not seen. A **quoted** verb is -
  `git 'push'` and `git "reset"` are recognised, because a verb token's surrounding quotes come off
  before the lookup - and so is a gated verb inside a quoted string, which costs a click. The
  decomposition does not mirror the harness's reach into subshells and command substitutions, so
  `` `git push` `` and `$(git reset --hard)` resolve to an ask rather than a pass.
- **The self-check's output truncates on macOS, and the cause is not pinned (POSIX-005).** On the
  macos runner the captured self-check output stops mid-line shortly after the role-resolver
  section, and the run ends with no tally and no `FAILURES:` block. It is not a JS throw: the catch
  added above prints nothing at all - no stack, no `(uncaught)` failure - so nothing threw. The
  capture in `scripts/selfcheck/run-selfcheck.mjs:49` is a `spawnSync` with no `maxBuffer`, and the
  self-check's `main()` ends by setting `process.exitCode` rather than exiting, which is consistent
  with buffered stdout being dropped when a process ends while its stdout pipe is asynchronous - as
  a pipe is on POSIX and is not on windows. That is a hypothesis with evidence behind it, not a
  diagnosis: the exact site is unpinned, pinning it needs a macOS host, and there is none. Tracked,
  not fixed; the macos CI leg is advisory for exactly this reason.

## [0.2.1] - 2026-09-03

A code-only release with an uncomfortable cause: the CI matrix had a Linux and a macOS leg since it
was written, both were red from their first run, and they were read for the first time after 0.2.0
was pushed. Nothing here changes your project - no config key, no managed region, no agent file -
and `0005_posix-legs` exists only because a version bump still needs a manifest entry.

### Fixed

- **Entrypoint identity behind a symlinked path (POSIX-001)** - every CLI entrypoint decided whether
  it was started directly or imported by comparing the invoked path with its own module path, and
  Node resolves an entry file to its real path before loading it. On a host whose temp directory sits
  behind a symlink - the normal case on macOS - an entrypoint spawned from a payload copy under temp
  concluded it was not the main module, did nothing, and exited 0. The suites read that 0 as success:
  sabotage controls came back green because nothing had run. All six entrypoints now compare real
  paths on both sides, and the self-check carries an entrypoint-identity assertion with a
  constructed-input control. Reproduced on Windows through a directory junction before the fix.
- **The Linux and macOS CI legs (POSIX-001)** - every defect that kept them red is fixed; the 0.2.1
  push's CI run is the proof. Besides the entrypoint defect: the `codex-qal.sh` cleanup function
  that only a `trap` ever calls is now exempted from BOTH shellcheck codes that report it (two
  ShellCheck generations name the same false positive differently), `actions/checkout` and
  `actions/setup-node` are pinned at `@v5`, and the workflow header no longer claims those legs have
  never executed. macOS itself is proven by CI on the 0.2.1 push - this repository has no macOS host.
- **A test expectation built with the host's separator (POSIX-001)** - the setup suite compared a
  rendered path against a string assembled with the separator of the machine running the test, while
  the product deliberately renders the separator of the CONFIGURED channel. The expectation is now
  built from the channel too.
- **The provenance scan ignores the harness's plugin-cache metadata (POSIX-002)** - when the plugin
  is installed from a marketplace, the payload root is a directory inside Claude Code's plugin cache,
  and the harness keeps `.in_use/<pid>` and `.orphaned_at` in it. The self-check's provenance scan
  fails on files whose type it does not know, so a perfectly clean marketplace installation reported
  four failures about the harness's own bookkeeping. Both names are skipped now - at the payload root
  only, by exact name, and only those two: a `.in_use` directory deeper in the payload is still
  scanned, an unclassified root file of any other name still fails, and two controls prove both
  directions.

## [0.2.0] - 2026-09-02

Who audits what stops being doctrine text and becomes a table in your config: three review classes
(`plan`, `code`, `docs`), each with its own pass count and, if you want one, its own host. One
command shows the whole picture and changes any of it without a re-interview.

### Added

- **The audit table (AUD-001)** - `review.plan`, `review.code` and `review.docs` in
  `aiwf.config.json`, factory `2 / 1 / 1` passes. A row carries only `passes` and INHERITS the
  Reviewer role whole (engine, model and effort together), or names its own host in one of exactly
  two shapes: `{ passes, engine: "claude", model }` or
  `{ passes, engine: "codex", model, effort }`. There is no field-by-field inheritance, so no
  configuration can compose a Claude tier with a Codex model id. The effective rows are rendered
  into `.claude/aiwf-native/roles.json`.
- **`/pnp:roles` (AUD-001)** - `scripts/setup/aiwf-roles.mjs`: `--show` prints the table (every
  role, every class, the fact-check gate and R1); `--set <target>.<field>=<value>` and
  `--reset <plan|code|docs>` change it and re-render `roles.json` and the agent files. Two phases:
  everything is decided and validated before a single byte is written, so a refusal leaves the
  project exactly as it was. It is plan-before-write, not a transaction - an interrupted run is
  finished by re-running the same command. Exit 0 written, 1 refused, 2 could not start.
  `/pnp:mission`, `/pnp:work` and `/pnp:setup` print the table in their reports.
- **The role resolver takes an optional review class (AUD-001)** - `-Class plan|code|docs`
  (`--class` on the bash channel), reviewer-only, in both channels: JSON gains `class` and
  `passes`, the plain form prints four tokens. Without the flag the output is byte-identical to
  0.1.2. The Codex review wrappers take the same flag and use the row's model and effort.
- **`ifRecorded` on `rerender-managed-region` (AUD-001)** - a migration can now re-render an
  artifact that exists on SOME installations only (`.claude/agents/reviewer.md` is rendered for a
  claude-hosted host and does not exist at all on a codex-configured project). Without a record it
  is reported as `not on this installation (no record) - skipped` instead of aborting the run. No
  adoption, no write, no new bookkeeping entry.
- **A third countable tripwire (AUD-002)** - running a mechanical procedure (a helper script, a bulk
  find/replace, a verify cycle over a fixed list, debugging a helper written a minute ago) is a
  `general-purpose` subagent's job with exact inputs and an output contract, not the orchestrator's.
  The countable moment is the SECOND inline fix of the same helper in one session. It is in
  `docs/WORKFLOW.md` and in the managed `CLAUDE.md` region, so it travels to installed projects.
- **The COO's own readiness pass, before any paid one (AUD-002)** - `docs/WORKFLOW.md` § Plan
  readiness: a finished draft is re-read in a separate turn against the six readiness checks, every
  `file:line` opened and every command executed on the recorded OS channel, before an auditor is
  dispatched. A paid pass verifies decisions; precision is paid for on the author's own account.
- **A fifth brief-authoring failure: a scope guard is anchored to HEAD at dispatch (AUD-002)** -
  never to the previous ticket's commit, which silently includes everything committed in between
  (typically the orchestrator's own completion-record commit) and manufactures a VERIFY failure the
  Writer cannot and must not fix. Guards that intentionally span several tickets keep their named
  base and say so.
- **Public install path (PUB-001)** - the plugin installs from the GitHub marketplace this
  repository serves: `/plugin marketplace add divels-studio/promptandpray` +
  `/plugin install pnp@promptandpray`, and `/plugin marketplace update` +
  `/plugin update pnp@promptandpray` + `/reload-plugins` + `/pnp:update` for a newer version.
  `README.md`, `docs/README.md` and `dev/README.md` put that path first and keep the local checkout
  as the alternative; `plugin.json` now names its `repository` and `homepage`. `/reload-plugins` is
  spelled out at every one of those places because a running session keeps the version it loaded at
  startup - the update lands on disk, and `/plugin list` is what says which version is live.

### Changed

- **A Claude auditor is never below the author (AUD-001)** - one rendered `reviewer` agent file per
  installation, whose `model` is the Reviewer's own when the Reviewer is claude-hosted and `fable`
  otherwise, and whose `effort` is always `roles.reviewer.effort` (the Agent tool has no
  per-invocation effort, so a Claude row carries none of its own). The file is now rendered when
  the Reviewer role OR any review row is claude-hosted. `/pnp:roles --show` marks a Claude auditor
  below the top tier; QA is deliberately not marked - it compares artifacts against acceptance
  criteria rather than auditing decisions.
- **The doctrine reads the table instead of stating rules (AUD-002)** - `docs/WORKFLOW.md`,
  `docs/LOOP.md`, `docs/REVIEW_CHECKLIST.md`, `docs/OPERATOR_PROTOCOL.md`, `/pnp:review`,
  `/pnp:work`, the `README`, the reviewer agent template, the overrides template and the managed
  `CLAUDE.md` region no longer hardcode "two passes", "a third pass", a docs-class host or a model.
  The review brief carries `Class: plan | code | docs`, `/pnp:review` resolves that row through the
  resolver's `-Class`, plan readiness runs `review.plan.passes` with `review.plan.passes` + 1 as the
  hard maximum, and a docs-class ticket on a Claude host is a configuration `/pnp:roles` shows.
- **The fact-check gate guards the expensive pass, whichever engine hosts it (AUD-002)** - it runs
  before every reviewer pass above the scan tier (a Codex pass, or a Claude reviewer on
  `opus`/`fable`), over a diff **or over a plan**, and may be skipped only when the reviewer itself
  runs on a scan-tier model. The old wording skipped it whenever the Claude branch resolved, which
  was wrong the moment a Claude auditor became the expensive one.

### Removed

- **The ad-hoc `opus` reviewer for docs-class diffs (AUD-001)** - "a docs-class ticket goes to a
  Claude host regardless of the configured engine" is no longer a rule with a hardcoded model. It
  is `review.docs`, which starts out inheriting the same auditor as `review.code` and is one
  `/pnp:roles --set` away from anything else. A Claude-hosted row now dispatches the project's
  rendered `reviewer` agent, which exists whenever the Reviewer role or any row is Claude-hosted.
- **The plan pre-pass as a separate step (AUD-002)** - it was the fact-check gate under a second
  name, run over a plan instead of a diff. There is now one rule: fact-check before every pass above
  the scan tier, over a diff or a plan.

## [0.1.2] - 2026-08-31

The first consumer update (0.1.0 -> 0.1.1 on a real installation) produced two take-new dialogs for
artifacts the operator had never opened. A question that cannot be answered wrongly is not a gate, so
the update engine now asks only where there is operator content to lose - and says in the CHANGES
report what happened to every managed artifact.

### Changed

- **A payload change alone is no longer a conflict (P9)** - `scripts/update/migrate.mjs`: an unheld
  artifact the operator has not edited, whose payload render changed, is applied WITHOUT a dialog,
  through the same take-new path an operator decision goes through (same journal, same stage, same
  resume). The run says why: `<key>: the payload version applied (you had not edited it)`. A dialog is
  still raised - and the file still left untouched - when the operator edited the artifact, when it is
  GONE, and when a held artifact was edited again; a held, untouched artifact is still recorded as
  upstream and never re-applied. `/pnp:update`'s dry run now stops only where a decision is genuinely
  needed (a config key that asks, or a real edit of yours).
- **The CHANGES report names each artifact's final state (P9)** - every `rerender-managed-region`
  line in "Applied" carries `payload-current` or `held (your version kept)`, derived from the final
  bookkeeping only, so the report is identical whether the update ran in one process or resumed after
  a crash. One header sentence says which artifacts were applied without a dialog, which were asked
  about and which were only recorded. Accepted boundaries, stated in
  `migrations/0003_quiet-rerender/NOTES.md`: auto and operator take-new are not distinguished, and
  neither are applied and already-current.
- **Plan-readiness reviews always run on the configured engine (P9)** - the docs-class engine
  override from 0.1.1 applies to IMPLEMENTATION diffs only (`/pnp:review` Step 0c and its
  plan-readiness mode, `docs/WORKFLOW.md`, `docs/LOOP.md`). A cheap Claude pre-pass before the first
  pass is allowed, without a verdict, exactly like the fact-check gate.
- **The quota gate names its mechanics (P9)** - `docs/WORKFLOW.md` and the managed
  `CLAUDE.md#aiwf-core` region listed "expensive-quota passes" as an operator gate with no mechanics,
  which read literally made the orchestrator ask before EVERY paid pass. The gate is now the passes
  BEYOND the review contract - a third plan-readiness pass, a correction round past the cap - while
  the passes the route already prescribes run on the ticket's standing word. `0003_quiet-rerender`
  carries that region re-render, which on an unedited region applies with no dialog at all: the new
  conflict rule's first proof on a real installation.
- **The example cycle proves both halves of the rule (P9)** - `0004_example-bump` (renumbered from
  `0003_example-bump`, which the ascend-by-1 rule requires now that the payload ships a third
  migration) gains a second `rerender-managed-region`, over an artifact the cycle never edits: zero
  dialogs for it, `payload-current` in the report, and the hand-edited region still takes the
  keep-mine path.

### Fixed

- **The 0.1.0 entry below overstated the example cycle (P9)** - it exercises `keep-mine` and
  `take-new` (`merge` lives in the update suite) and contains no crash injection (resume after an
  interrupted migration is proven in the update suite, section 9). Corrected in place.
- **The self-check pins the new rule and the readiness carve-out (P9)** - `/pnp:update`'s conflict
  sentence and the plan-readiness clause are asserted as text with their own flipping controls,
  `/pnp:update` joins the six skills carrying the canonical "reading is not a shell job" sentence,
  and the example-fixture controls read the bump's id from `bump.json` instead of hardcoding a number
  that legitimately moves.

## [0.1.1] - 2026-08-30

Hygiene from the first real run of the loop through the plugin, one doctrine correction learned
from an observed violation, and the first migration with operations
(`0002_operator-word-and-hygiene`) - so an installed project takes all of it through
`/plugin update` + `/pnp:update`.

### Added

- **A ticket born after a standing word waits for its own word (P8)** - `docs/WORKFLOW.md` guard
  (b), the managed `CLAUDE.md` region, `/pnp:mission` and `/pnp:work`: a NEW ticket (one not in the
  PLAN's recorded execution order) is written into the PLAN, announced in ONE sentence, and STOPS -
  zero mutations on it until the operator's word for THAT ticket. The earlier reading, "the
  announcement is a notification, not a question", is explicitly REVOKED: it allowed a ticket to be
  born and started in the same turn without a word.
- **Review engine by ticket class (P8)** - the review brief carries `Class: docs | code` (`code`
  when absent) and `/pnp:review` Step 0c branches on it: a docs-class ticket is reviewed by the
  `reviewer` Claude subagent whatever `roles.reviewer.engine` says, a code-class one by the
  configured engine.
- **Fact-check gate before a paid pass (P8)** - `/pnp:review` Step 2b: one cheap read-only scan
  agent over the PROSE of the diff, returning only the false or unverifiable claims with
  `file:line`, before any pass on a paid external engine. The Reviewer verifies decisions; it is
  not the mechanism that discovers a wrong path or a wrong count.
- **A second paid pass only when the correction round touched code (P8)** - in the not-configurable
  half of `docs/WORKFLOW.md` § "Loop shape and its overrides". Prose-only corrections are verified
  by the fact-check gate plus the COO's own first-hand check, recorded in the completion record; the
  operator may always ask for a paid pass explicitly.
- **"Reading is not a shell job" as a skill instruction (P8)** - one identical sentence in Step 0 of
  `/pnp:mission`, `/pnp:work`, `/pnp:setup`, `/pnp:review`, `/pnp:qa` and `/pnp:loop`, and in the
  writer agent.
- **A `## VERIFY` section in the writer agent (P8)** - run every VERIFY command literally, report
  the exact exit code the harness shows, never append `; echo "X=$?"`.
- **Worktrees and memory (P8)** - a short section in `docs/OPERATOR_PROTOCOL.md`: a git worktree is
  a separate project path and therefore a separate memory directory; copying and merging memory is
  manual, and it is a harness fact, not a plugin mechanism.
- **A PAYLOAD DOCTRINE section in the self-check (P8)** - the rules that exist only as text are
  asserted as text, each with its own flipping control (including one that only REWORDS a rule), and
  the project layer now proves an owned ask rule belongs to the ruleset rendered for the CURRENT
  project root.

### Changed

- **The template-contract comment is stripped from every render (P8)** - `<!-- TEMPLATE CONTRACT`
  blocks are notes for whoever edits a template and no longer reach the rendered agent, overrides
  document or managed region. Both engines render through one shared context builder, so setup and
  update cannot disagree about the bytes.
- **`0002_operator-word-and-hygiene` re-renders the managed `CLAUDE.md` region and
  `.claude/agents/writer.md` and reconciles the ask ruleset (P8)** - deliberately with no op for
  `agents/reviewer.md` / `agents/qa.md`, which are absent on a codex-hosted install; the migration's
  `NOTES.md` states that limit and the two ways to re-render them.
- **The Gate 2 dialog spike is recorded as OBSERVED (P8)** - `scripts/spike/README.md`: the native
  Yes/No dialog was seen in `always` mode carrying the `[plugin:pnp]` tag, and a dispatch naming an
  on-plan ticket passed silently in `off-plan`. The procedure stays as the reproduction recipe.

### Fixed

- **A re-run no longer keeps ask rules rendered for a project root that is gone (P8)** - the
  to-remove half of the reconcile formula now lives in `planAskRules` itself, so setup and update
  apply it identically: an owned rule that is not in the desired set for the CURRENT root leaves
  `settings.json` and `ownedAskRules`. It is NOT tombstoned - a tombstone means the operator removed
  it - and a foreign rule that merely mentions the old path is untouched.
- **The blanket `Bash(git -C:*)` ask rule is gone from the factory ruleset (P8)** - it gated every
  `-C` form of every git command, read-only ones included, while adding nothing to the
  push/merge/rebase gate, which keeps its three rendered `Bash(git -C <projectRoot> ...)` forms.
  Consumers lose it through the migration's `reconcile-ask-ruleset` op only where the plugin
  inserted it.
- **The rendered writer agent no longer carries the template-contract comment or a mixed-slash
  overrides path (P8)** - the overrides document is now one absolute path in the native separator of
  `config.os`.

### Known limits (stated, not hidden)

- The hooks trust the harness identity fields and the permission rules match by command prefix:
  accident-grade, not adversary-proof. Mutations performed through shell commands are doctrine,
  not enforcement.
- On a claude-hosted reviewer or qa role, `agents/reviewer.md` / `agents/qa.md` keep the
  template-contract comment until they are re-rendered by `/pnp:setup` or
  `/pnp:update --resolve <key>` - see the migration's `NOTES.md`.

## [0.1.0] - 2026-08-29

First tagged version. Pre-release, private, not published to any marketplace. Extracted from a
production project's native AIWF working loop and genericized; proven by a dogfood installation in
that project (adopt mode, two Writer dispatches through the plugin-hosted loop, one real ticket).

### Added

- **Plugin skeleton** - `.claude-plugin/plugin.json` (`name: pnp`), `hooks/hooks.json` wired
  through `${CLAUDE_PLUGIN_ROOT}`, LF normalization via `.gitattributes`.
- **Two enforcement hooks, three responsibilities.** Gate 1 (`pretooluse-mutation-guard.js`):
  the Edit/Write family is allowed only for the true main session or the `writer` subagent.
  Gate 3 (same file, `enforcement.routeWriteGuard`): while `.aiwf/route-state.json` names an
  R2/R3 route the main session writes only `docs/**`, `.aiwf/**` and root `*.md`. Gate 2
  (`pretooluse-dispatch-gate.js`): the Writer dispatch through the Agent tool becomes a native
  Yes/No dialog - on every dispatch (`enforcement.dispatchGate: "always"`, factory default) or
  only when the brief's `Ticket: <REF>` line names no ticket in an active PLAN (`"off-plan"`).
  Every unreadable or malformed state of either key fails towards the dialog, never towards
  silence.
- **Ten skills** - `/pnp:loop`, `brief`, `mission`, `work`, `review`, `qa`, `qal`, `setup`,
  `update`, `selfcheck` - sharing one Step 0 (project root via `git rev-parse --show-toplevel`,
  config read, version interlock); `update` and `selfcheck` are the documented interlock
  exceptions.
- **Engine-neutral review roles.** Role resolver plus three Codex wrappers with locked flags
  (Reviewer and QA under `--sandbox read-only`, QAL operator-gated without a sandbox), on two
  mirrored OS channels: `scripts/native/ps/` (Windows, PowerShell 5.1-compatible, ASCII-only)
  and `scripts/native/sh/` (Linux/macOS, bash; brief on stdin only, NUL-delimited resolver
  transport). The Claude-hosted alternative renders `reviewer`/`qa` subagents held read-only by
  tool allowlist + Gate 1.
- **Config schema v1** (`schema/aiwf.config.schema.json`, draft 2020-12) as the single authority
  for `aiwf.config.json`; a schema-driven validator that fails loudly on any unknown keyword.
- **Setup engine** (`scripts/setup/`): interview (interactive or `--answers-file`), plan-then-write
  generator (a blocker means zero bytes written), three-state hash bookkeeping for the managed
  artifacts (`roles.json`, `agents/*.md`, the `aiwf-core` region of `CLAUDE.md`), ask-ruleset
  ownership without takeover and with tombstones (`_aiwf.ownedAskRules` /
  `_aiwf.suppressedAskRules`), a hand-owned `PROJECT_OVERRIDES.md` that is never rewritten, memory
  seeds printed rather than written.
- **Adopt mode** (`/pnp:setup --adopt --adopt-file`): installs into a project that already carries
  the loop by hand - identical artifacts are recorded clean, differing ones take an explicit
  per-artifact `keep-mine` / `take-new` decision, nothing is ever deleted, superseded legacy files
  are listed advisory-only; refused on a project that already has an installation.
- **Update engine** (`scripts/update/`): migration manifest (`migrations/index.json`, ops per
  version), fail-closed payload validator, migrator with a write-ahead journal and durable staging
  under `.claude/aiwf-native/update-stage/`, deterministic crash recovery, the
  `take-new` / `keep-mine` / `merge` conflict machine with an `override` that is never re-applied,
  read-through dry-run preview, CHANGES report, `--check` interlock, `--resolve <key>` outside a
  version bump.
- **Self-check** (`scripts/selfcheck/`): payload invariants (both hooks executed at their real
  entrypoints, resolver parity across both channels, wrapper flag locks byte-level), the project
  layer (bookkeeping, rendered artifacts, ask ownership, paths), a provenance scan of the whole
  payload (origin-project names, e-mail addresses, Cyrillic code points, absolute drive paths
  outside an allowlist), and negative controls proving every assertion can fail. It is the final
  step of `setup` and `update`; a red self-check after a successful write exits 1 and says so.
- **Example project and CI** (`examples/example-project/`, `.github/workflows/ci.yml`): the full
  setup -> simulated bump -> update -> self-check cycle, exercising `keep-mine` and `take-new`
  (`merge` and crash-resume are proven in the update suite, not here); OS matrix
  Windows / Linux / macOS (shellcheck on the bash channel). (Corrected in 0.1.2 - the original entry
  claimed all three conflict decisions and resume after an interrupted migration.)
- **Doctrine as payload** (`docs/`): `WORKFLOW.md`, `LOOP.md`, `REVIEW_CHECKLIST.md`,
  `OPERATOR_PROTOCOL.md`, `SESSION_BRIEF_RECIPE.md`, `CODEX_REVIEW_QA_RECIPE.md`,
  `QA_BROWSER_INVESTIGATION.md` - read under the installed plugin root, never copied into a
  project.

### Fixed

- Gate 2 (`off-plan`): ticket-ref boundaries use the whole identifier alphabet
  (`(?<![A-Za-z0-9_-])...(?![A-Za-z0-9_-])`) - a `\b` boundary let `DEMO-1` pass silently
  against a plan that only carried `DEMO-1-EXTRA`.

### Known limits (stated, not hidden)

- The hooks trust the harness identity fields and the permission rules match by command prefix:
  accident-grade, not adversary-proof. Mutations performed through shell commands are doctrine,
  not enforcement.
- Ask-rule reconciliation on re-run is additive: an owned rule that is no longer desired - a rule
  the payload dropped, or one rendered for a project root that has moved - stays in
  `settings.json`. (Fixed in 0.1.1.)
- The factory ruleset carries a blanket `Bash(git -C:*)` ask rule that a project with a
  deliberately silent sibling repository will want to remove. (Fixed in 0.1.1.)
- The `writer` template renders its template-contract comment and a mixed-slash overrides path
  into the project's `agents/writer.md` (cosmetic). (Fixed in 0.1.1.)

[0.2.6]: https://github.com/divels-studio/promptandpray/releases/tag/v0.2.6
[0.2.5]: https://github.com/divels-studio/promptandpray/releases/tag/v0.2.5
[0.2.4]: https://github.com/divels-studio/promptandpray/releases/tag/v0.2.4
[0.2.3]: https://github.com/divels-studio/promptandpray/releases/tag/v0.2.3
[0.2.2]: https://github.com/divels-studio/promptandpray/releases/tag/v0.2.2
[0.2.1]: https://github.com/divels-studio/promptandpray/releases/tag/v0.2.1
[0.2.0]: https://github.com/divels-studio/promptandpray/releases/tag/v0.2.0
[0.1.2]: https://github.com/divels-studio/promptandpray/releases/tag/v0.1.2
[0.1.1]: https://github.com/divels-studio/promptandpray/releases/tag/v0.1.1
[0.1.0]: https://github.com/divels-studio/promptandpray/releases/tag/v0.1.0
