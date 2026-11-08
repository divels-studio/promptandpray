# 0042_skills-wording

**The skills say in their own words what the loop had carried as local habits: the E2E report
copied by whoever ran the suite, setup's auto-mode sentence, no session brief when the state is
durable, the no-match check of the runnability pre-pass, the live planner resumed by a message, the
planning questions answered after the research, the COO tier of each ticket in the approval report,
and the spec's RED run as a declared QA artifact. A prose-only release: one `note`, no managed file
re-rendered.**

## What changes

`/pnp:qa` (`skills/qa/SKILL.md`):

- Step 2: the report is copied by whoever ran the suite - the COO at the handoff, this step after a
  scoped re-run - right after the run and before anything else, to
  `<scratchDir>/<REF>-e2e-report-<N>.json` (`<N>` the run's number in the ticket, 1 for the handoff
  run); the runner's output directory is neither deleted nor run over again before that copy stands.
- Step 2, Step 2b and Step 3: the artifact lists and the QA brief name the declared RED run (the JSON
  report of the Writer's own first run of the spec it adds, copied to
  `<scratchDir>/<REF>-e2e-red.json`), and the brief's JSON report line points at the copy of Step 2;
  the RED run line reads `RED run: none - because <reason>` when the pre-change tree could not be run.

`/pnp:review` (`skills/review/SKILL.md`):

- Step 2, the review pack: for a ticket whose brief says `E2E: yes`, beside the log path of the green
  E2E run made at the handoff, the copy of its JSON report (`/pnp:qa` Step 2).

`/pnp:setup` (`skills/setup/SKILL.md`):

- Step 3: in an auto-approving permission mode the host may refuse the generator's write to
  `.claude/settings.json` or `aiwf.config.json` as self-modification; run it again in a mode that
  asks.

`/pnp:brief` (`skills/brief/SKILL.md`):

- New Step 0.5, when no brief is composed: when the state is durable - the ticket's record, the memory
  and the transfer surface are complete - compose no brief, say "new session, `/pnp:mission`" and
  stop; a brief is composed only mid-flight.

`/pnp:plan` (`skills/plan/SKILL.md`):

- Step 1: the step asks the operator nothing; the questions on the goal are answered after the
  research.
- Step 2: the three questions, after the research - which real inputs exist, what must stay, what
  retires - are answered by the COO from the research and the recorded state of Step 1, each written
  with its pointer into `DECISIONS.md`; only what stays unanswered goes to the operator, in ONE
  dialog, before Step 3. Its suppression dual: when every answer stands, ask nothing and cite where
  each one stands.
- Step 5: a gate refusal, a command that cannot run and every revision go to the dispatched planner by
  a message (the harness's agent-message tool, `SendMessage` in Claude Code), never a fresh dispatch
  while that agent lives. The runnability pre-pass also checks that a command carrying a test filter
  selects at least one test: a filter that selects none is reported as "cannot fail" (class 8,
  `docs/READINESS_CLASSES.md`) and treated like a command that cannot run; the check runs over the
  tree as it stands at the stamp, and a filter that names a test the ticket itself creates is exempt.
- Step 6: the revision goes to the live planner over the round file; the approval report names the
  COO tier of each ticket (its `COO: <model> - because <check>` line).

The Writer brief template (`templates/briefs/writer-dispatch.md`):

- A `RED run` line for an `E2E: yes` ticket: right after the first, red run of the spec it adds, the
  Writer copies the runner's JSON report to `<scratchDir>/<REF>-e2e-red.json`, or writes
  `RED run: none - because <reason>` in the hand-back.

The recipes:

- `docs/CODEX_REVIEW_QA_RECIPE.md`, § QA (artifact judge): the artifacts QA reads include the report
  of the spec's declared RED run, and the invocation's brief names the copy of the JSON report and the
  RED run.
- `docs/SESSION_BRIEF_RECIPE.md`: when the state is durable, no brief is written at all; the next
  session opens with `/pnp:mission` (`/pnp:brief` Step 0.5).

## What this migration does

- One `note` (`skills-wording-0-3-17`) and no other operation: `/pnp:update` prints it with the
  CHANGELOG block of 0.3.17, its three `docRefs` and its two `supersedes` ids. The release adds no
  stop for the operator's word, so the note carries no word-gate sentence.

## What it leaves alone

Every config key, the ask-ruleset, every managed file - no rendered template changed, so the core, the
stage files, the agents, `AGENTS.md` and the managed `CLAUDE.md` region are not re-rendered - and
every operator-owned file. The skills, the recipes and the brief templates are read from the plugin
root, so they arrive with the version and need no write in the project.

## Superseded local rules

Two. A project may carry either as a local rule, in its overrides document or in the project
additions block of a stage file:

- the E2E report is copied out of the runner's output directory before it is run over - typically in
  `work.md` § project additions; the note names it by the id `e2e-report-copied-out`;
- the planning questions come after the research - typically in `plan.md` § project additions; the
  note names it by the id `questions-after-the-research`.

The payload now carries both, so each local rule may be deleted on the operator's word - this update
deletes nothing. The CHANGELOG's line for 0.3.17 names them:
`Retires local rules: work.md § project additions: the E2E report is copied out; plan.md § project additions: Questions come after the research`.
