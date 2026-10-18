---
name: plan
description: Run the planning cycle for one durable plan - roadmap entry, research, decisions, the planner agent, the mechanical plan gate, ONE readiness pass with COO triage, the operator's approval, the landing commit. Writes only the plan's own draft and readiness files until the landing.
allowed-tools: Read, Grep, Glob, Bash, Agent
---

# /pnp:plan - the planning cycle, from the roadmap entry to the landing commit

You are the Orchestrator/COO. This skill takes ONE goal from an idea to an approved plan folder in
`{{config.paths.plansDir}}/active/<ABBR>/`. It is the whole cycle: nothing here asks you to open
another skill's steps, except `/pnp:review` Step 3 for the mechanics of the wrapper.

Arguments: the goal in the operator's words, or the `<ABBR>` of an existing roadmap entry.

The four agent contracts ship as plain Markdown under `${CLAUDE_PLUGIN_ROOT}/templates/briefs/`:
`research.md`, `planner.md`, `readiness-codex.md`, `writer-dispatch.md`. Beside them, `record.md` is
the skeleton of a ticket's completion record - not an agent contract; the COO fills it. They are read
at run time by path, never rendered into the project. Fill the placeholders `<ABBR>`, `<folder>`, `<goal>` (and any
other `<...>` a template names) and send the text; never paraphrase a template into a brief.

## Step 0 - Project context (mandatory for every `/pnp:*` skill)

1. **Resolve the project root.** Run `git rev-parse --show-toplevel`. If that fails (not a git
   worktree), fall back to `project.root` in the config below. If neither resolves, stop and say
   so - no skill guesses a root. `<root>` below means this path.
2. **Read the config.** `<root>/.claude/aiwf-native/aiwf.config.json`. If it is missing, stop with
   one line: *PromptAndPray is not installed in this project - run `/pnp:setup`.*
3. **Version interlock.** Run
   `node "${CLAUDE_PLUGIN_ROOT}/scripts/update/aiwf-update.mjs" --check --project-root "<root>"`.
   Exit 0 = this project is current. Any non-zero exit = migrations are pending: **stop** and point
   the operator at `/pnp:update`. The command reads only.
   Two skills are documented exceptions and run anyway: `/pnp:update` and `/pnp:selfcheck`.
4. **Reading is not a shell job.** Read or inspect files with the Read/Grep/Glob tools - never
   `cat`/`grep`/`ls`/`head`/`node -e` through the shell for reading; the shell is for execution
   (tests, git, build).

Notation: `{{config.some.key}}` in this document means *substitute the value you read in step 2*.
`<plansDir>` is `{{config.paths.plansDir}}`, `<scratchDir>` is `{{config.paths.scratchDir}}`; every
path below is written from `<root>`, and every command runs from `<root>`.

**Preconditions.** No R2/R3 route is open (`<scratchDir>/route-state.json` absent or `{}`) - while one
is, Gate 3 keeps the main session out of `<plansDir>` and the drafts cannot be written. The planning
lock holds for the whole skill (`docs/WORKFLOW.md` § Planning lock): until the landing in Step 6 the
only files written are the plan's own - `<plansDir>/drafts/<ABBR>/`, `<plansDir>/readiness/<ABBR>/`,
the roadmap entry - and the scratch brief. A readiness cycle starts in a fresh session.

## Step 0.5 - Doctrine preflight

Read the plugin's `docs/WORKFLOW.md` and `docs/LOOP.md`, this project's
`{{config.paths.overridesDoc}}` and `.claude/aiwf-native/ORCHESTRATOR.md` IN FULL - the four
documents of `/pnp:work` Step 1 - before Step 1, and note `git rev-parse HEAD` at that read.

**Its suppression dual.** Skip the read when this session already read the current text of all
four: `git diff <the HEAD noted at that read> -- <the four paths>` returns empty. Any other result -
a line of diff, or an error such as a path outside the repository - means read them again. After a
context compaction all four are read again, whatever the diff says.

## Step 1 - The roadmap entry

**The start number.** Before anything else, take the COO context size now and keep it for Step 6:
read it from the machine source the project's overrides document names (a file its statusline
writes), when there is one; with no such source, ask nothing here - the start is written as not
measured (Step 6). Never estimate. *Temporary:* the measurement steps of this skill (this one, the
approval number, `## Measurements`) stay until the first plan measured with them has been judged;
then they are removed from this skill.

Open `<plansDir>/ROADMAP.md`. If the goal has an entry, use it; otherwise write one, in exactly this
format, the operator's words verbatim where they are the source:

```markdown
## <ABBR> - <title>
- Goal: <one sentence - what is true when it is done>
- Why: <one sentence; the operator's words verbatim when they are the source>
- Scope: in - <...>; out - <...>
- Size: S (one plan) | M (two or three plans) | L (a sequence; each plan listed below as it is born)
- Plans: <PLAN_<ABBR> or none yet>
- Status: idea | researching | planned | in progress
- Born: <date>, operator word "<quote>"
```

An entry is a goal worth at least one plan; a task of a few lines is not an entry. The roadmap holds
only live entries: the entry leaves it when its last plan is archived, and an idea dropped before
then leaves with one ledger row `<ABBR> dropped: <why>` (`docs/WORKFLOW.md` § Durable development
history).

`<ABBR>` is 2 to 8 uppercase letters `A-Z` and is never reused: Glob `<plansDir>/active/`,
`<plansDir>/archive/` and `<plansDir>/readiness/` for it first, and pick other letters on any hit.
A goal too big for one plan is ONE entry with several plans under it; this skill writes the first
(or the next) of them, against the code as it is after the previous one landed. Set `Status:
researching`.

## Step 2 - Research

Dispatch 1 or 2 read-only scan agents (Agent tool, `model: "sonnet"`, fresh context) with
`${CLAUDE_PLUGIN_ROOT}/templates/briefs/research.md`, filled. Two agents split the surface (for
example code vs. docs and tests) and run in parallel, in one message. They REPLY; they write no file.
A later plan of the same roadmap entry researches the DELTA only: the brief names the earlier plan's
`RESEARCH.md` as the base.

From the replies the COO writes `<plansDir>/drafts/<ABBR>/RESEARCH.md`: the Code Map (file -> role
today), the numbered facts of what the code does today with their pointers, the consumers and
adjacent contracts of every touched surface, and the unknowns. Short; pointers, not prose. A claim
two agents contradict is verified by the COO with one Read before it is written down.

## Step 3 - Decisions

Write `<plansDir>/drafts/<ABBR>/DECISIONS.md` with the operator:

- `## Decisions` - one bullet per decision, `- **D-NN** <text> plan: <ABBR>`, numbered from 01 (a
  later plan of the same entry continues the numbering); the operator's words verbatim where they
  are the source; a decision of another plan is cited as `<X>/D-NN`, never restated. A decision this
  plan only records for a later one carries that plan's name, or `plan: deferred`.
- `## Deferred` - what is consciously left out, each with the condition that brings it back.
- `## Open Questions` - numbered. **An open question STOPS the skill here**: ask the operator (one
  dialog, up to four points, each with its consequence) and continue only after every question is
  answered and its answer is written as a decision. An unknown is never written down as an
  assumption. Engineering choices are the COO's: they are decisions with a one-line why, never
  questions.

When the section reads `None.`, go on.

## Step 4 - The planner

Dispatch the planner through the Agent tool with `subagent_type: "writer"` - the one agent type the
mutation guard lets write - and the text of `${CLAUDE_PLUGIN_ROOT}/templates/briefs/planner.md`,
filled. Pass NO `model` (the Writer's pin applies) and write NO `Ticket:` line: there is no ticket
yet, so the dispatch gate raises ONE dialog per planner dispatch - that click is the gate for a plan
that does not exist yet, not a defect.

The planner writes ONLY under `<plansDir>/drafts/<ABBR>/` - the index `PLAN_<ABBR>.md` and
`tickets/<ABBR>-NNN.md` - and returns the structured handoff the brief defines, never the files'
text. Read the files from disk yourself. A handoff that only says the plan is fine is not a handoff:
send it back with the brief's handoff section quoted.

## Step 5 - The mechanical gate

Stamp first, from `<root>`:

```text
node "${CLAUDE_PLUGIN_ROOT}/scripts/engine/plan-gate.js" --stamp <plansDir>/drafts/<ABBR>
```

It refuses and lists every problem while the folder breaks its contract (index, at most 3 tickets,
6,144 bytes per ticket (its header `Status:` line not counted), the six headings, every `D-NN` of this
plan cited, cross-references, no bare open item, Code Map paths that exist), and writes
`<plansDir>/readiness/<ABBR>/stamp.json` otherwise.
A refusal goes back to the planner (Step 4, the same dispatch, the problem lines quoted). When the
stamp is written, confirm it:

```text
node "${CLAUDE_PLUGIN_ROOT}/scripts/engine/plan-gate.js" --check <plansDir>/drafts/<ABBR>
```

Exit 0 is the only way into Step 6. After EVERY revision, stamp the folder again before the next
dispatch; a stale stamp makes the wrapper refuse the pass.

## Step 6 - One readiness pass, triage, approval, landing

**Resolve the row.** Run the resolver of `/pnp:review` Step 0b with the class `plan`; `$row.passes`
is the ceiling of readiness passes. At `0` no pass is dispatched: go from Step 5 to the approval.

**Pass 1 rides the standing word** - the operator's word that started this plan; ask for none. Write
`<root>/<scratchDir>/review-brief.txt` (Write tool):

```text
COVERED BY: operator word "<quote>", <date>
Class: plan
PLAN: <plansDir>/drafts/<ABBR>

<the text of templates/briefs/readiness-codex.md, filled>
```

In a LATER tool call, run the wrapper in the BACKGROUND (`run_in_background: true`), stdout to the
round file. **os `windows`:**

```powershell
Get-Content '<root>/<scratchDir>/review-brief.txt' -Raw | `
  & "${CLAUDE_PLUGIN_ROOT}/scripts/native/ps/codex-review.ps1" -ProjectRoot '<root>' -Class plan > '<root>/<scratchDir>/readiness-round.txt'
```

**os `linux` / `macos`:**

```bash
cat '<root>/<scratchDir>/review-brief.txt' \
  | bash "${CLAUDE_PLUGIN_ROOT}/scripts/native/sh/codex-review.sh" --project-root '<root>' \
    --class plan > '<root>/<scratchDir>/readiness-round.txt'
```

The brief path, the background run, the session file and the resume policy are `/pnp:review` Step 3
(codex branch); pass 1 is always cold. A Claude-hosted plan row dispatches the `reviewer` agent with
the same brief - `/pnp:review` Step 3 (claude branch). Read the result with Grep - the `^BLOCKERS:`
line and the table rows - never whole.

**Triage.** Write `<plansDir>/readiness/<ABBR>/round-<N>.md`: one header line (engine, model, cold or
resumed, the tokens as the engine printed them, the verdict line), the auditor's findings table
VERBATIM, plus a `disposition` column the COO fills per row - `fixed` / `rejected: <why>` /
`deferred` / `asked`. INFO rows never trigger a revision. A row that disputes a recorded decision
or a design choice the operator approved is `asked` - it goes to the operator in plain words, not
into a revision.

**Revision.** The planner revises (Step 4, the same dispatch over the round file); the COO re-stamps
(Step 5). At most 2 revisions. A revision that does not reduce the BLOCKER count stops the cycle and
goes to the operator with the numbers.

**Pass 2 - only on the operator's own word, and only when** pass 1 returned a BLOCKER that reverses a
`D-NN`, or the COO names a risk (security, tenancy, concurrency, transactions) after a substantive
revision, and `$row.passes` is at least 2. Ask for it in one sentence naming the trigger. Its brief
carries `round-1.md` verbatim - findings and dispositions - and requires every NEW finding to declare
why pass 1 could not see it (`docs/WORKFLOW.md` § Fail aggregation). A resumed pass 2 needs that word
too and its compensations (`/pnp:review` Step 3).

**Approval.** Report to the operator in a few lines: the tickets and their order, the passes run with
their BLOCKER counts and dispositions, what is deferred, and the folder path - never the plan itself.
Take the approval number the same way, from the machine source; with none, ask the operator once,
in this report, for the COO context size on their statusline - the only question this measurement
asks per plan. Wait for the approval word.

**Measurements - on the approval.** Write into the index `<plansDir>/drafts/<ABBR>/PLAN_<ABBR>.md` a
section `## Measurements` with one table `| idea -> approved plan | cycle spend |` and one value row:
(1) the approval number minus the start number of Step 1, or the approval number alone marked
`start not measured` when Step 1 had no source; (2) the sum of every subagent's tokens as each
completion notification reported them, plus every Codex pass's tokens as the `round-<N>.md` headers
recorded them. Under the table, list the parts of (2) one per line - agent or pass, tokens - and name
the source of every value: `file`, `notification`, `round header` or `operator`. No part is
estimated: a part nobody printed is named as missing, never guessed.

**Roadmap entry - on the approval.** With `## Measurements`, write into the same index a section
`## Roadmap entry`: the entry's `Goal:` and `Why:` lines from `<plansDir>/ROADMAP.md`, verbatim. The
roadmap entry leaves the roadmap when its last plan is archived; this copy is what keeps its goal and
reason beside the plan.

**Landing - on the approval, in the same session.** The Measurements and Roadmap entry writes
changed the index, so stamp the folder again BEFORE the move:

```text
node "${CLAUDE_PLUGIN_ROOT}/scripts/engine/plan-gate.js" --stamp <plansDir>/drafts/<ABBR>
```

Then move the untracked folder with the shell (not a git verb: nothing tracked is touched) - os
`windows`:
`Move-Item <plansDir>/drafts/<ABBR> <plansDir>/active/<ABBR>`; os `linux`/`macos`:
`mv <plansDir>/drafts/<ABBR> <plansDir>/active/<ABBR>`. Update the roadmap entry's `Plans:` and
`Status: planned` lines. Under the ledger's `## Plans` - `<ledger>` below is its path, resolved as
`docs/WORKFLOW.md` § The ledger states - write the plan's line:
`<ABBR> - readiness/<ABBR>/, active/<ABBR>/records/`. Then `git add <plansDir>/active/<ABBR>
<plansDir>/readiness/<ABBR> <plansDir>/ROADMAP.md <ledger>` and ONE docs commit (native dialog). The stamp survives the move byte for byte;
a `--check` over `<plansDir>/active/<ABBR>` after the move confirms it.

Each ticket is then started on its own word; the Writer brief is
`${CLAUDE_PLUGIN_ROOT}/templates/briefs/writer-dispatch.md`. Each ticket closes with its completion
record `<plansDir>/active/<ABBR>/records/<REF>.md`, written on
`${CLAUDE_PLUGIN_ROOT}/templates/briefs/record.md` (`docs/WORKFLOW.md` § Durable development history).
