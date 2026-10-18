<!-- TEMPLATE CONTRACT (read by the P2 generate engine, not by the reader of the rendered file)
     - Rendered ONCE by /pnp:setup and then owned by the operator; updates never overwrite it.
     - D:\promptandpray is a RENDER-TIME placeholder, not a config path: the generate engine
       substitutes the project root it resolves while rendering (`git rev-parse --show-toplevel`,
       or the explicit absolute path when config.project.root is not "auto"). Never render
       config.project.root raw - its schema default is the literal string "auto". -->

# PROJECT OVERRIDES - PromptAndPray

> This document is **yours**. `/pnp:setup` writes it once from this template; updates never
> overwrite it - at most they append a "review these sections" note. Everything here is
> project-specific.
>
> The generic doctrine is **PLUGIN PAYLOAD - not files in this repository**: the PromptAndPray
> payload's `docs/WORKFLOW.md`, `docs/LOOP.md` and `docs/REVIEW_CHECKLIST.md`, which live under the
> installed plugin root (the `/pnp:*` skills resolve that path through `${CLAUDE_PLUGIN_ROOT}`) and
> are updated with the plugin, never copied in here.
>
> Every role reads this file before starting work. Keep it short and true; a stale identity section
> is worse than none.

## Identity

We are building **PromptAndPray** - the pnp Claude Code plugin - a disciplined four-role working loop with native operator gates; this repository is the plugin itself, self-installed so its own development runs under the loop it ships.

PromptAndPray is **not**:

- **the product it was extracted from.** The loop was born in a real production project and then
  genericized; that project is now a *consumer* (installs `pnp@promptandpray` from this repo as a
  local marketplace, project scope). Its name, its operator language and its paths never enter the
  payload - the provenance section of the self-check is the gate, and `dev/` is the only place they
  may appear.
- **a Codex plugin, or a wrapper around one.** Reviewer/QA are engine-neutral roles; the Codex
  wrappers are one host, held read-only by an OS sandbox. The official Codex plugin is a second
  opinion next to this loop, not a component of it (root `README.md` FAQ).
- **a runtime / state machine.** No counters, no lock files, no external service: the loop is
  convention plus the three PreToolUse hooks plus Claude Code's native permission dialogs. A feature
  that needs a daemon is out of scope.
- **advice.** Every operator gate that CAN be a native dialog IS one. A "rule" that only lives in a
  document, where a hook or an ask-rule could carry it, is a defect.

## Hard rules

- Never run destructive Git or filesystem cleanup commands (revert, restore, reset, clean, remove,
  hard delete) unless the operator explicitly asks for that exact operation, immediately before it
  runs.
- Never touch, move, or delete untracked operator work or legacy files unless explicitly requested.
- Destructive / system-changing operations require explicit confirmation immediately before
  execution, even when a backlog, runbook, or brief marks them `MUST`. `MUST` means "mandatory
  before completing", not "execute now". In this project that class is:
  - `git tag` (a release tag is the irreversible half of a release - separate operator word; that
    word also covers pushing the tag; operator rule 2026-10-01);
  - `git push` / merge / rebase to either this repo or a consumer project (separate word each; the
    release-tag push rides the tag word above);
  - removing anything under `docs/` (a payload doc leaves only through a migration that names it
    - the delete is legitimate exactly then, and only then);
  - `--confirm-remove-stale` on `/pnp:setup`, and `/plugin uninstall` in a consumer project;
  - `git worktree remove`, and deleting a memory directory under `~/.claude/projects/`.
- Do not change files outside the requested scope.
- Planning lock: when the operator invokes `/plan` or explicitly asks for planning before
  implementation, stay planning-only (full rules: the payload doc `docs/WORKFLOW.md` § Planning lock).
- **Commit authority:** local commit only, and only after the review route passes and a human
  explicitly approves. No automatic commits.
- **Push authority:** push / merge / rebase only with the operator's **explicit word**, executed via
  the native `ask` dialog. Fetch, cherry-pick, and sync likewise need explicit approval.
- Do not start long-running services. There are none in this project; a `claude` session started
  to observe a gate live is the operator's, never an agent's.
- **Prose in the payload is R1; code goes through the Writer** (operator decision 2026-10-16).
  Prose - `docs/`, `skills/`, the text of `templates/`, `README.md`, `CHANGELOG.md` - is edited in the
  main session: edit, provenance grep, `validate-payload`, commit; no Writer, no auditor, no plan, no
  readiness. Code - `scripts/`, `hooks/`, `schema/`, `.claude-plugin/` - goes through the Writer; a
  Codex pass over code only on the operator's word, never by default. `dev/` and the self-install
  layer (`.claude/`, root `CLAUDE.md`) are R1.
- **Release discipline** (operator decision 2026-10-16). A migration only when the STRUCTURE changes -
  a new file, a new config key, a re-render of the managed artifacts; a prose change ships with the
  plugin itself (commit, push, `/plugin update`) and needs no migration. A version bump in
  `.claude-plugin/plugin.json` and a `CHANGELOG.md` block (ending `Retires local rules:`) when a
  release is cut. The tag is created LOCALLY on the record commit and pushed WITH `main` in ONE
  push - two words (the tag word, the push word), one dialog; CI is not waited for (operator rule
  2026-10-02). A version is released when that push lands; CI proves the pushed commit afterwards,
  and a red POSIX leg is a defect ticket, not a release block. A consumer picks the version up only
  through `/plugin update` + `/pnp:update` - that path is the product.
- **Provenance.** `git grep -nP "[\x{0400}-\x{04FF}]" -- docs skills templates scripts schema hooks
  migrations` is empty before every commit - for a prose-only diff that grep IS the gate; the
  self-check's provenance section (origin names as digests, e-mail, Cyrillic by code point,
  drive-letter paths per allowlist) runs when the diff touches scripts/, hooks/, templates/ or
  schema/ (§ Test policy), and a new allowlist entry needs the one file that justifies it.
- **No AI attribution in git** (operator rule 2026-08-31). No Co-Authored-By, Claude-Session,
  session URL or "Generated by" line in any commit message, trailer or PR text, COO and Writer alike,
  in every one of the operator's repositories; the harness attribution reminder is overridden; every
  Writer brief carries the line.
- **A word for content is not a word to write into a live foreign tree.** Hand it to that session or
  keep it with a pointer, and check first whether a session runs there.

## Execution discipline

- **Checklist first.** Prepare a short checklist for the current scope only, execute only that
  checklist, and self-check against it before the final response.
- **Restate scope.** Restate the task scope in 1-3 bullets and confirm it before changing anything.
- **Surgical edits over rewrites** (operator rule 2026-10-02). Edit the lines that change; never
  rewrite a whole file when the result is the same - COO, Writer briefs and ad-hoc agents alike; a
  needed whole-file restructure is announced in one line first, with the reason.
- **No `cd` prefix on any command** (operator rule 2026-09-09), git or not: run everything from the
  repo root and reach into a subfolder with the tool's own flag.
- **The COO runs scripts itself** (operator rule 2026-09-29) wherever the host allows; a `!` command
  goes to the operator only when the host blocks the COO.
- **Auto mode and the config files** (COO; incidents 2026-08-18, 2026-10-16). The host's auto mode
  refuses agent edits to `.claude/settings.json`, `.claude/hooks/**` and the config files an update
  writes, even with the operator's word: ask the operator in the first reply to switch auto mode off;
  if still blocked, stop and explain - never bypass through `sed`, a heredoc or a redirect; the
  operator may hand-edit from the COO's exact lines.
- **Never pipe a test run through `tail`** - it destroys the evidence: run to a log file and read the
  file.
- **Long commands run in the background.** Commands over ~5 minutes run in the background only, for
  every role including ad-hoc agents, timeout >= 3600000, never shorter; the result is awaited by
  notification; a run killed by the cap is not restarted on one's own - the agent stops and reports;
  every brief repeats it.
- **A documentation claim is a hypothesis**, not evidence: verify it against the tree before relying
  on it or repeating it (suspect first any number with no command beside it, `file:line` pointers,
  descriptions of tool or config behaviour, "was/was not done" claims); the code is the authority, and
  where a document disagrees the code wins and the document is a finding to report.

## Sibling products and negative scope

- The origin project (machine-local, a sibling directory on this machine) is **read-only reference**:
  its archive `docs/backlogs/archive/009_PLAN_PROMPTANDPRAY_2026-08-29.md` holds the extraction
  history, and its `.claude/` layer is the first real installation of this plugin. It is consumed
  as `pnp@promptandpray` (local marketplace = this repo, project scope) - never through
  `--plugin-dir` from there, never with a PNP plan, version or memory of its own.
- Never create a Git coupling to it (remote, submodule, subtree, shared package). A fix observed
  there is a ticket here; it reaches the consumer only through a released version.
- Reusable from it as **platform/workflow reference only**: captured hook payloads (the spike
  reference: `git show c2626789^:.claude/hooks` run IN THE ORIGIN REPO - that hash exists only there,
  not in this repository - extracted into scratch), observed dialog behavior.
- **Not** reusable as this project's product truth: anything product-specific of that project -
  names, domain, tenancy rules, stack. The payload is generic or it is wrong.

## Product direction

The first value loop: **a project installs the plugin, runs one R2 ticket through Writer -> Reviewer
-> commit gate with every gate a native dialog, then takes a newer version through
`/plugin update` + `/pnp:update` without losing its own voice.** Install -> loop -> update, on a real
consumer. A proposed change that does not make one of those three steps more correct, more honest
about its guarantees, or provable by the self-check is not this project's next step. Publishing to
other users comes only after the update path is proven on the consumer (P8).

## Architecture direction

Stack: Node.js (zero dependencies), PowerShell + bash wrappers, Claude Code plugin (skills, hooks, agents, templates, migrations)

Boundaries a reviewer checks:

- **Three layers, and who writes what.** Payload (`docs/ skills/ templates/ scripts/ schema/
  hooks/ migrations/ examples/ .claude-plugin/`) -> project layer rendered by setup/update
  (`.claude/aiwf-native/*`, `.claude/agents/*`, the managed `CLAUDE.md` region, the owned ask-rules
  in `.claude/settings.json`) -> operator-owned content (the overrides doc after its one seeding,
  everything outside the `aiwf-core` markers, foreign permission rules). The payload's engines
  WRITE the project layer - only the managed artifacts, only under the two-hash bookkeeping (no
  silent overwrite, no delete without `--confirm-remove-stale`) - and never the operator-owned
  content. The payload's hooks READ the project's `aiwf.config.json`, `roles.json`, the active
  PLANs under `plansDir` (Gate 2 off-plan), the files a plan-class reviewer brief names (Gate 2,
  through `scripts/engine/plan-gate.js`) and `.aiwf/route-state.json` (Gate 3) - nothing else of
  the project, and Gate 4 reads nothing at all beyond the payload the harness hands it. Nothing in
  the project layer ever writes the payload.
- **`schema/aiwf.config.schema.json` is the single authority for the config shape**; the interview,
  the generator and the self-check derive from it, never restate it.
- **The hooks trust harness identity fields and fail in the safe direction**, and the safe
  direction differs per gate: Gate 1 (non-writer subagent write) DENIES, Gate 3 (main-session
  write to a code-class path while an R2/R3 route is open, or an unusable route-state) DENIES,
  Gate 4 (an ask-class git verb from a non-writer subagent) DENIES - and fails closed, with the
  risk of sitting on every Bash command stated in its own header - Gate 2 (Writer dispatch) ASKS,
  and DENIES a Claude-hosted plan-readiness pass whose readiness artifacts are missing - a decision
  on a readable brief; any unexpected error inside Gate 2 still resolves to ASK, never to
  a silent pass. A change that flips a fail direction is R3.
- **Zero runtime dependencies.** No `node_modules`, no build step; the wrappers are PowerShell 5.1
  ASCII-only / bash LF-only and mirror each other flag for flag.
- **The self-check executes real entrypoints** (hooks, resolver, validators) and every assertion has
  a negative control or is printed as `[NOTE]` with its reason - a check with no control is a
  finding, not a pass.
- **`dev/` is not payload** and may hold what the payload may not (operator language, machine paths).

## Data, tenancy and access control

- No database, no tenants. "Migrations" here are **payload migrations** for installed projects:
  one global manifest `migrations/index.json` (ordered, monotonic in version, last entry = the
  payload version) plus one directory `migrations/NNNN_<slug>/` per migration holding `ops.json`
  and `NOTES.md`, validated
  by `scripts/update/validate-payload.mjs` and applied by the update engine (`scripts/update/`) with
  a write-ahead journal. The op vocabulary is `add-config-key`, `rerender-managed-region`,
  `reconcile-ask-ruleset`, `note`, `seed-file` (a file written only when absent, never recorded; RBA-001)
  - nothing else, and no migration ever deletes an operator file.
- Access control is the **permission ask-ruleset** (`templates/settings.ask-ruleset.json`): a rule
  added there is a managed-artifact change (migration + bump); a rule removed there ships with a
  `reconcile-ask-ruleset` op so consumers lose only what they never edited.

## Test policy

Tests are part of implementation, not polish. The single home of the test policy in this project is
**this section** plus the acceptance suites themselves (`scripts/setup/test-setup.mjs`,
`scripts/update/test-update.mjs`, `scripts/selfcheck/aiwf-selfcheck.js`, `scripts/spike/run-spikes.mjs`,
`scripts/ci/run-example-cycle.mjs`). Routing:

- pure logic / helper / transform / validation / format -> targeted unit tests;
- E2E only for a business result through server + browser that cannot be proven otherwise (data
  written and read back, permissions visible in the UI, a server-decided redirect, server-computed
  values, integrations) - never a visual property, a text or "the page loads" (operator rule
  2026-10-05; this project has no E2E runner - the sentence stands for the shape, and runtime
  behaviour here is proven by the self-check and spike probes);
- mixed change -> both where applicable;
- a missing obvious proof test is a scope miss.

Proof for algorithmic/runtime logic must exercise the production code path or an extracted
production helper, not mirrored logic inside the test file.

The literal VERIFY commands live in `aiwf.config.json`:
- `validate-payload`: `node scripts/update/validate-payload.mjs --plugin-root .` (cwd: `.`)
- `setup-suite`: `node scripts/setup/test-setup.mjs` (cwd: `.`)
- `update-suite`: `node scripts/update/test-update.mjs` (cwd: `.`)
- `example-cycle-windows`: `node scripts/ci/run-example-cycle.mjs` (cwd: `.`)
- `example-cycle-linux`: `node scripts/ci/run-example-cycle.mjs --answers examples/example-project/answers-linux.json` (cwd: `.`)
- `selfcheck`: `node scripts/selfcheck/aiwf-selfcheck.js --plugin-root . --project-fixture .` (cwd: `.`)
- `spikes`: `node scripts/spike/run-spikes.mjs` (cwd: `.`)
- `plugin-validate`: `claude plugin validate .` (cwd: `.`)

**VERIFY is proportional to the change** (operator rules 2026-09-24, 2026-10-17). A change owes
only what its diff can break, run ONCE:
- prose, skills, docs, templates, README, CHANGELOG -> NO suite: the provenance grep (`git grep -nP
  "[\x{0400}-\x{04FF}]" -- docs skills templates scripts schema hooks migrations examples README.md`)
  + `validate-payload`; a template change adds one render dry-run on a scratch copy (seconds);
- schema / config / roles -> `selfcheck`, `validate-payload`, `setup-suite`;
- update engine / migrations -> `update-suite`, `validate-payload`, `selfcheck`;
- hooks / gates -> `selfcheck`, `spikes`;
- `scripts/ci/` or `examples/` -> the example cycle too.
A diff that spans several rows runs their union; nothing beyond the ticket's own rows runs locally
(operator rule 2026-09-28, HARD-021), and no row runs twice. CI runs the full set on the pushed
commit, after the fact, on `windows` and `ubuntu` (§ Hard rules, Release discipline).

**VERIFY runs in PORTIONS** (operator rules 2026-09-17, 2026-09-19, 2026-09-22). Portion 1: the
eight Windows commands above as ONE parallel batch. Portion 2: the POSIX suites under WSL (user
`pnp`) as ONE invocation with its legs SEQUENTIAL inside it, started only AFTER Portion 1 has
finished - never concurrent with it (the two together exhaust the machine's memory). A sequential
Portion 1 and a concurrent pair are both defects of the brief; every Writer brief states the
portions in those words. Portion 2 is NOT a release gate (operator rule 2026-09-28, HARD-021): it is
the local reproduction path when a POSIX CI leg goes red.

**The operational runbook is `dev/VERIFY_RUNBOOK.md`** (operator rule 2026-09-22): the working
command shapes and every recorded trap (tmpfs `/tmp`, `dubious ownership` on `git archive`, the
snap `pwsh` cache, root prep + `su - pnp` legs) live there; this section stays the policy home.
Every brief that runs VERIFY carries the pointer, and a red test on a trap described there is a
defect of the brief, not of the code.

**The Writer runs only the tests it adds (red, then green)** (operator rule 2026-10-17, evening,
replacing the morning rule of the same day). The row's suite runs ONCE, started by the COO in the
background at the Writer's handoff, in parallel with the diff read; a fresh scan agent only when the
COO cannot run it. Never a second batch. Logs of any run go OUTSIDE the repository (the example cycle
asserts a byte-identical tree). No micro-round edits while a suite is running - an edit mid-run
invalidates the run (RBA-001).

**Independent units run in parallel by default** (operator rule 2026-10-02 and 2026-10-05) -
independent steps, large mechanical Writer work split across two or more Writers from the dispatch,
a scan beside an auditor pass; time is a resource on par with tokens - subject to the portions rule
above, which is this machine's resource rule.

**A file count on disk is not a runner count**: the collected figure comes only from running the
suite and reading its summary line.

## Status and release artifacts

The documents the "status / release docs policy" in the payload doc `docs/WORKFLOW.md` applies to, in this project:

- status page: root `README.md` § Status (what is here / what is not here yet - kept true per release)
- changelog: `CHANGELOG.md` (one block per version, written at the bump, English)
- roadmap: `dev/backlogs/ROADMAP.md` (one entry per idea, the strict format of `dev/REBUILD.md`) +
  `dev/backlogs/active/` (the open plans); `dev/README.md` says how it runs

## Communication

- Respond to the operator in **bg** unless explicitly asked otherwise.
  Agent-to-agent traffic (briefs, verdicts, micro-rounds) is always English.
- Conversational role names in the operator channel: Writer = "Колега",
  Reviewer = "Одитор", QA = "QA".
  These are conversational only - the technical identifiers (`writer`, `reviewer`, `qa`, file paths,
  frontmatter) never change.
- **English everywhere in the tree** (operator rule 2026-10-15, restated 2026-10-16). Everything
  written into the project - plans, tickets, records, candidates, ledger rows, memory, briefs,
  verdicts, commit messages, code comments, docs - is English. Two things stay Bulgarian: the
  operator channel, and the operator's own words wherever they are recorded (a gate word, a ruling, a
  `COVERED BY` quote - verbatim, never translated; an English reading beside it when a sentence needs
  one). Existing Bulgarian text stays as written and is translated only when a ticket names it;
  archived plans and closed rows stay.
- **A rule record carries a marker, not its story** (operator rule 2026-10-16). A rule in this
  document says only whose it is and when - `(operator rule <date>)`, or nothing when it is the
  COO's generalisation. The operator's wording, the occasion and the evidence pointer live in ONE
  row of the transfer surface (`dev/backlogs/CANDIDATES.md`, ruling or event ledger), never in the
  rule text; a rule needs no retelling of the incident that bore it.
- Be concise; no step-by-step reasoning narration in the output. Explain concretely when
  architecture or product boundaries are involved.
- **Operator channel stays short** (operator rule 2026-09-22, sharpened 2026-10-16). Replies are
  short and carry the numbers the operator acts on - counts of blockers, passes, gates, cost - never
  `file:line`, test ids or code names; the evidence lives in briefs and records, not in the channel.
- **No retelling** (operator rule 2026-09-27; still-running clause 2026-10-11). An answer carries
  only what is new - a decision, a number, a name, the next step: no recap of what was said or read,
  no narration of what comes next; on an interim notification with no result write nothing; a status
  is one line.
- Stop for an operator choice only when unresolved alternatives materially change product intent, an
  architecture boundary, external risk/cost, or an irreversible outcome. The COO owns routine
  engineering decisions; do not turn the operator into a tie-breaker for them.
- **A dialog only when the ticket cannot continue** (operator rule 2026-10-16; Silerax 2026-10-05).
  A dialog to the operator (AskUserQuestion, numbered options, one topic, a global/module label, the
  consequence of each option) ONLY when the ticket cannot continue without the answer - a product or
  UX decision; everything else (a question outside the ticket, a scan finding outside the scope) goes
  into a "questions for the operator" list and is asked once at the ticket's end; up to 4 points per
  dialog, decisions recorded once at the end with one edit; never ask what is already recorded.
- **Analyse and decide** (operator rule 2026-10-05; mockup clause 2026-10-04). When the operator
  points at a problem, analyse and decide instead of handing back options; a product/UX question comes
  with an existing screenshot or a plain example, never a newly built static mockup.
- **Never a whole PLAN in front of the operator** (operator rule 2026-09-10): a few lines (tickets
  and order, audits passed, blocker/correction counts, remaining gates) and the path.
- **On an objection, stop the tools.** When the operator objects to or is surprised by a cost or a
  process, stop the tools in the same turn (zero new commands), answer and wait; do not answer every
  sentence with a list of options.
- **The gate is not prompted**; the operator's refusal is a valid answer, not an obstacle to route
  around.
- **Informal address** (operator rule 2026-10-04): address the operator informally (singular), in
  every session.
- **No `/pnp:brief` offer when the state is durable** (operator rule 2026-09-10): say "new session,
  `/pnp:mission`" once record, memory and candidates are complete; a brief only in a mid-flight state
  (unfinished ticket, uncommitted diff, spoken decisions without a record).

## Environment

Platform: `windows`. Prefer that platform's native commands for local instructions unless the
repo already uses a specific cross-platform tool, and pass paths in its native form.

**COO context source** (machine-local, the operator's own statusline `~/.claude/statusline.sh`): it
writes `~/.claude/ctx/<session id>.pct` (used percent) and `.size` (window tokens) for every session
on this machine; the COO context is `pct * size / 100` - the number the statusline itself prints,
to its whole-percent precision. The session id is the one in the session's scratchpad path. This is
the machine source `/pnp:plan` and the record skeleton read; nothing of it is payload.

## Workspace paths

```text
D:\promptandpray    Repo root (resolved at render time, never the literal "auto")
.claude-plugin/     plugin.json (the ONLY version source) + marketplace.json (this repo as a local marketplace)
skills/ hooks/      the /pnp:* commands and the three PreToolUse enforcement hooks (payload)
docs/               generic doctrine (payload) - never project-specific, never Cyrillic
templates/          what /pnp:setup renders into a project (managed artifacts; a change = migration)
scripts/            engine (hooks lib), setup, update, selfcheck, spike, ci, native/{ps,sh} wrappers
schema/ migrations/ config authority; ordered payload migrations
examples/           the committed example project + cycle data (payload; asserted by the self-check)
dev/                the plugin's OWN development: this doc, answers.json, backlogs/{active,archive,drafts,readiness}
.claude/ CLAUDE.md  the self-install (project layer rendered by /pnp:setup from dev/answers.json)
.aiwf/              scratch (gitignored): ONLY the live loop mechanics - route-state.json,
                    review-brief.txt, last-review-session.txt, readiness-round.txt, checkpoint.md
                    (HARD-024) - and the artifacts of the CURRENT ticket. A plan is drafted as the
                    untracked folder dev/backlogs/drafts/<ABBR>/ and moves to active/<ABBR>/ when it
                    lands; its readiness history (stamp.json, round-N.md) lands in
                    dev/backlogs/readiness/<ABBR>/ with the same commit; an approved plan has no copy
                    in .aiwf/. A session that does not hold the tree writes nothing here (WORKFLOW
                    § Branch policy).
```

Default integration/base branch: `main`. It is not the only allowed
working branch: a task may use a short-lived `feature/`, `fix/`, `experiment/`, `spike/`, or `r3/`
branch when the brief or the operator says so. The agent works on the branch currently checked out.
Always check the branch and dirty state before changes. If pre-existing changes fall outside the
planned task, do not create or switch branches and do not carry those changes into a new branch.
Finish or checkpoint the current scope first, or use a separate clean worktree explicitly provided
by the operator. Never stash, clean, reset, or otherwise hide the dirty/untracked state.

## Loop shape (this project's overrides of the generic defaults)

These are the shape parameters the plugin lets a project set. The gates around them are payload
mechanics and are **not** editable here (see the payload doc `docs/WORKFLOW.md` § Loop shape and its overrides).

- **One reviewer, not two** - no "two independent reviewers" requirement.
- **Correction rounds are capped at 2** for the implementation
  loop, instead of the generic low-4 / medium-8 / high-12 caps. After the cap without a passable
  result, stop and summarize to the operator. Only the operator lifts the cap, by an explicit word
  before the re-dispatch, one extension at a time, recorded in the ticket's PLAN entry.
- **R1 uses no orchestration loop** - it is done directly in the main session.
- **COO routing tiers** (operator rule 2026-10-15). The "top" COO of `docs/WORKFLOW.md` § COO
  routing is Fable; the "cheap" COO is **Opus** - a Sonnet COO is never used in this project. The
  routing moves the COO session only; Writer and audit table stay as `/pnp:roles` shows them. The
  plan's COO line names the model: `COO: <model> - because <check N | all four no>`; the Writer gets
  no recommendation (its model is `roles.writer.model`).
- **QA is conditional** - only when a brief declares observable runtime/UI behavior; never in R1 or
  non-runtime R2.
- Plan readiness runs `review.plan.passes` passes (the audit table, `/pnp:roles`; factory 2) as a
  ceiling: the first on the ticket's standing word, each further one on the operator's own explicit
  word - one word per pass - and one more beyond the configured number is always available with
  that word. Independent of the cap above.
- **Gate checkpoint hook** (operator rule 2026-10-14; HARD-024). The COO rewrites
  `.aiwf/checkpoint.md` WHOLE (Write, not an append; <= 60 lines: state, operator decisions, live
  agents, next steps, "After compaction do") at every gate - dispatch, handoff, verdict, before a
  commit - and when the hook `.claude/hooks/context-gate.mjs` reports >= 950k tokens of context; at
  >= 1000k IMMEDIATELY, after the current step. The hook takes no value and stays silent without the
  statusline's `~/.claude/ctx/` files; after compaction it returns the checkpoint to the context, and
  the COO reads only it and the files it names. The ticket and session boundary is the payload's
  session rule (`docs/WORKFLOW.md` § Plan readiness review).
  *Expires* when the payload carries the mechanism (candidate: CANDIDATES § „Таван на контекста“).
- **Dialogs only at the gates** (operator rule 2026-10-05). Agents work without dialogs: dialogs stay
  only at the gates (commit, push/merge/rebase, destructive or system-changing operations, the word
  for a paid pass), and every Writer brief carries this line.
- **No audit-pass question for prose** (operator decision 2026-10-16). Prose takes no auditor pass, so
  the "does this ticket get an audit pass?" question is asked only for a code ticket; a Codex pass
  over code runs only on the operator's word.
- **Ticket-end cleanup** (operator rule 2026-10-06, widened 2026-10-16). At the end of a ticket
  everything the ticket created under `.aiwf/` is deleted, with no chat question - the delete dialog
  is the gate; anything worth keeping moves to the documentation folder (`readiness/<ABBR>/` or the
  completion record) BEFORE the delete; `.aiwf/` holds only the live loop mechanics.
- **A ticket born mid-work** (operator rule 2026-10-01) is written into the plan, its questions
  (auditor pass, product choice) are asked, and the plan is committed ONCE after the answers; if the
  answer does not come in the same session, commit with the question recorded as open.
- **Out-of-scope findings** (operator rule 2026-09-30). Every out-of-scope finding from any role goes
  to the operator with a proposed destination (a new ticket in the plan per guard (b), or the
  candidates), collected and asked at the ticket's end; the operator decides; nothing stays recorded
  only as "pre-existing".
- **Paid passes are stated and priced** (operator rule 2026-10-03). A paid pass beyond the readiness
  passes and the one code pass over the diff is written into the plan with its scope and cost before
  it is spent; paid passes beyond that one pass are stated in the first sentence of the report (count
  and engine); the currency is the euro.
- **A dead paid pass waits.** A dead paid pass (including one that failed for an environment reason)
  gets a report with the numbers and waits for the operator's word; no local "re-dispatch once";
  scan-tier work is retried without asking; after the word the finish uses the recorded resume id.
- **Resource checks are the COO's own** (operator rule 2026-09-01): checking machine resources (RAM)
  before a paid pass is never a question to the operator; never stop the operator's processes for the
  agents.
- **The Writer's reply is short** (operator rule 2026-10-10): up to ~25 lines (blockers, deviations,
  failed checks, handoff path); details go in the handoff file.

## Product boundary checks (rendered into the Reviewer)

The lines below are rendered into the reviewer agent and are what "product-boundary alignment" means
for this project. Empty is a valid answer.

- Payload stays generic: no origin-project names, no Cyrillic, no absolute paths (the provenance section of the self-check is the gate)
- A managed-artifact change ships as a migration + version bump, never silently
- Every operator gate that can be a native dialog is a native dialog

## Workflow

Routing (R1/R2/R3), the four roles, the ticket-brief contract, and commit/push mechanics are defined
in the plugin payload - `docs/WORKFLOW.md`, with the one-page native mapping in `docs/LOOP.md`
and the verdict rules in `docs/REVIEW_CHECKLIST.md`, all of them under the installed plugin root,
not in this repository. Durable knowledge lives in Git under
`dev/backlogs/active/` (a draft under `drafts/` until it lands, its readiness history
under `readiness/<ABBR>/`; finished plans move to `dev/backlogs/archive/`);
live process state lives in the in-session orchestration.

- **Candidates are registered where they are born.** Every candidate or deferred decision goes onto
  the transfer surface in the session it was born, with its retrigger or expiry condition; done items
  are marked, never deleted.
- **The resume memory is state, not a log** (operator rule 2026-10-04). A mission's resume/status
  memory holds only the CURRENT state and is rewritten whole at every checkpoint, never appended;
  history lives in records, readiness folders and git; `MEMORY.md` index lines stay one short line
  each.
- **A repo copy of a live artifact is refreshed at the canon moment** (operator rule 2026-09-15):
  the moment anything declares it canon and after each later iteration; the check is a mechanical
  diff/size against the live file.
