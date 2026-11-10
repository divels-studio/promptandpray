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

**Preconditions.** An open R2/R3 route of another ticket (`<scratchDir>/route-state.json` naming
it) does not stop this skill: planning is not execution, and Gate 3 lets the plan's own folders
through - `<plansDir>/drafts/<ABBR>/`, `<plansDir>/readiness/<ABBR>/`, the roadmap and the ledger
(`ORCHESTRATOR.md` § Branch policy). One thing waits while that route is open: an edit of a LANDED
plan under `<plansDir>/active/` (behind the guard). The readiness pass of Step 6 does not wait: its
brief and session-state files are keyed by the readiness brief's `PLAN:` folder's last segment,
`<ABBR>` (`<scratchDir>/<ABBR>-review-brief.txt`), and its log and `-o` file are the run's own under
`<temp>/pnp-codex/` with `<ABBR>` in their name, so it is dispatched and runs beside the ticket's pass
(`ORCHESTRATOR.md` § Branch policy). The
planning lock holds for the whole skill (`plan.md` § Planning lock): until the landing in
Step 6 the only files written are the
plan's own - `<plansDir>/drafts/<ABBR>/`, `<plansDir>/readiness/<ABBR>/`, the roadmap entry - and
the scratch brief. A readiness cycle starts in a fresh session.

## Step 0.5 - Doctrine preflight

Read `.claude/aiwf-native/ORCHESTRATOR.md` (the core: your rendered standing rules),
`.claude/aiwf-native/doctrine/plan.md` (the plan stage: the planning lock, the readiness cycle, the
durable history and the ledger) and this project's `{{config.paths.overridesDoc}}` IN FULL before
Step 1, and note `git rev-parse HEAD` at that read.

**Its suppression dual.** Skip the read when this session already read the current text of all
three: `git diff <the HEAD noted at that read> -- <the three paths>` returns empty. Any other result -
a line of diff, or an error such as a path outside the repository - means read them again. After a
context compaction all three are read again, whatever the diff says.

## Step 1 - The roadmap entry

**The start number.** Before anything else, take the COO context size now and keep it for Step 6:
read it from the machine source the project's overrides document names (a file its statusline
writes), when there is one; with no such source, ask nothing here - the start is written as not
measured (Step 6). Never estimate. *Temporary:* the measurement steps of this skill (this one, the
approval number, `## Measurements`) stay until the first plan measured with them has been judged;
then they are removed from this skill.

**The recorded state comes first.** Before the entry is written, read what is already recorded on
the goal: its roadmap entry, the DECISIONS of the earlier plans on its area, and the project's status
documents (named in its overrides document). This step asks the operator nothing: the questions
on the goal are answered after the research (Step 2).

Open `<plansDir>/ROADMAP.md`. If the goal has an entry, use it; otherwise write one, in exactly this
format, the operator's words verbatim where they are the source. An entry and a finding line carry
the problem, its evidence, the operator's words and the scope, never how it is fixed: that is the
planner's work (`ticket.md` § Durable development history).

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
then leaves with one ledger row `<ABBR> dropped: <why>` (`plan.md` § Durable development
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
adjacent contracts of every touched surface, what already exists for the goal, the paths the goal
touches without naming them, and the unknowns. Short; pointers, not prose. A claim
two agents contradict is verified by the COO with one Read before it is written down.

**The three questions, after the research.** The COO answers
which real inputs exist, what must stay, what retires
from the research (its "what already exists" and "unknowns" sections) and the recorded state of
Step 1, and writes each answer with its pointer into `DECISIONS.md`. Only what stays unanswered goes
to the operator, in ONE dialog (`ORCHESTRATOR.md` § How the COO speaks to the operator, rule 9),
before Step 3. **Its suppression dual:** when every answer stands, ask nothing and cite where each
one stands. The answers are data for the decisions, never a word to start.

## Step 3 - Decisions

Write `<plansDir>/drafts/<ABBR>/DECISIONS.md` with the operator:

- `## Decisions` - one bullet per decision, `- **D-NN** <text> plan: <ABBR>` (the gate also reads
  `- **D-NN <title>**`, the form of plans written under an earlier version; a new plan keeps
  `- **D-NN** <text>`), numbered from 01 (a later plan of the same entry continues the numbering);
  the operator's words verbatim where they are the source; a decision of another plan is cited as
  `<X>/D-NN`, never restated. A decision this plan only records for a later one carries that plan's
  name, or `plan: deferred`.
- `## Deferred` - what is consciously left out, each with the condition that brings it back.
- `## Open Questions` - numbered. **An open question STOPS the skill here**: ask the operator (the
  dialog of `ORCHESTRATOR.md` § How the COO speaks to the operator, rule 9) and continue only after every question is
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

Before the dispatch, fill the brief's `TICKET COUNT`: the COO decides the plan's ticket count from
the roadmap entry's Size and the research - a decision with one reason, `<n> - <reason>` (an integer
1-99), or `default`. The planner copies it verbatim into the index as the line
`Tickets: <n> - <reason>`, which the gate of Step 5 enforces; on `default` the index carries no
such line and the cap is 3.

The planner writes ONLY under `<plansDir>/drafts/<ABBR>/` - the index `PLAN_<ABBR>.md` and
`tickets/<ABBR>-NNN.md` - and returns the structured handoff the brief defines, never the files'
text. Read the files from disk yourself. A handoff that only says the plan is fine is not a handoff:
send it back with the brief's handoff section quoted.

## Step 5 - The mechanical gate

Stamp first, from `<root>`:

```text
node "${CLAUDE_PLUGIN_ROOT}/scripts/engine/plan-gate.js" --stamp <plansDir>/drafts/<ABBR>
```

It refuses and lists every problem while the folder breaks its contract (index, the declared ticket
count - `Tickets: <n> - <reason>` in the index, 3 when there is none, a malformed line refused -
the configured ticket byte cap per ticket - `plan.ticketByteCap`, factory 6,144, its header `Status:`
line not counted - the six headings, every `D-NN` of this plan cited, cross-references, no bare open
item, Code Map paths that exist), and writes
`<plansDir>/readiness/<ABBR>/stamp.json` otherwise.
A refusal goes back to the live planner, the problem lines quoted. A gate refusal, a command that
cannot run and every revision go to the dispatched planner by a message (the harness's agent-message
tool, `SendMessage` in Claude Code), never a fresh dispatch while that agent lives; a fresh dispatch,
with its dialog (Step 4), only when it has ended. When the stamp is written, confirm it:

```text
node "${CLAUDE_PLUGIN_ROOT}/scripts/engine/plan-gate.js" --check <plansDir>/drafts/<ABBR>
```

Exit 0 is the only way into Step 6. After EVERY revision, stamp the folder again before the next
dispatch; a stale stamp makes the wrapper refuse the pass.

**Runnability pre-pass.** Between the stamp and the paid pass, dispatch one scan-tier agent (Agent
tool, `model: "sonnet"`, read-only) over every `## Acceptance` command of the tickets and every
procedure of the index: it runs each read-only command as written (a mutating one is checked for
existence only) and replies with the ones that cannot run and why. A command that carries a test
filter (`-t`, `-k`, `-g`, `--grep`, a spec path) is also checked to select at least one test: a filter that
selects no test is reported as "cannot fail" (class 8, `docs/READINESS_CLASSES.md`) and is treated
like a command that cannot run. The check runs over the tree as it stands at the stamp; a filter
that names a test the ticket itself creates is exempt here - the ticket's worklist names that test
as new, and the Writer's own first run of the tests it adds, seen failing, is its proof (`work.md`
§ Tests). A command that cannot run goes back to the live planner and the folder is stamped again;
the auditor never pays for it.

## Step 6 - One readiness pass, triage, approval, landing

**Resolve the row.** Run the resolver of `/pnp:review` Step 0b with the class `plan`; `$row.passes`
is the ceiling of readiness passes. At `0` no pass is dispatched: go from Step 5 to the approval.

**Pass 1 rides the standing word** - the operator's word that started this plan; ask for none. Write
`<root>/<scratchDir>/<ABBR>-review-brief.txt` (Write tool; `<ABBR>` is the `PLAN:` folder's last
segment - the wrapper's session-state key):

```text
COVERED BY: operator word "<quote>", <date>
Class: plan
PLAN: <plansDir>/drafts/<ABBR>

<the text of templates/briefs/readiness-codex.md, filled>
```

In a LATER tool call, run the wrapper in the BACKGROUND (`run_in_background: true`). **os `windows`:**

```powershell
& "${CLAUDE_PLUGIN_ROOT}/scripts/native/ps/codex-review.ps1" -ProjectRoot '<root>' -Class plan -BriefFile '<root>/<scratchDir>/<ABBR>-review-brief.txt'
```

**os `linux` / `macos`:**

```bash
bash "${CLAUDE_PLUGIN_ROOT}/scripts/native/sh/codex-review.sh" --project-root '<root>' --class plan --brief-file '<root>/<scratchDir>/<ABBR>-review-brief.txt'
```

The brief path, the background run, the session file and the resume policy are `/pnp:review` Step 3
(codex branch); pass 1 is always cold. A Claude-hosted plan row dispatches the `reviewer` agent with
the same brief - `/pnp:review` Step 3 (claude branch). The wrapper's stdout is the final message,
and the same bytes stand in its `-o` file, `<same stem as the log>.last.txt`, beside the log its
`codex-review: log <path>` stderr line names: read THAT file with Grep - the `^BLOCKERS:` line and the
table rows - never whole, and never redirect the wrapper's stdout inside PowerShell (Windows
PowerShell 5.1 re-encodes a redirected stream as UTF-16LE).

**Triage.** Write `<plansDir>/readiness/<ABBR>/round-<N>.md`: one header line (engine, model, cold or
resumed, the tokens as the engine printed them, the verdict line - the wrapper's `codex-review:`
stderr lines carry model, effort, cold/resumed, the tokens figure (cumulative on a resume), a
capacity refusal, the log path, exit and session id; the `-o` file beside that log holds only the
final message),
the auditor's findings table
VERBATIM, plus a `disposition` column the COO fills per row - `fixed` / `rejected: <why>` /
`deferred` / `asked`. INFO rows never trigger a revision. A row that disputes a recorded decision
or a design choice the operator approved is `asked` - it goes to the operator in plain words, not
into a revision.

**Revision.** The live planner revises over the round file (Step 5); the COO re-stamps
(Step 5). At most 2 revisions. A revision that does not reduce the count of carried OPEN rows stops
the cycle and goes to the operator with the numbers; a blocker born of added scope is named
separately, never counted as carried.

**Pass 2 - only on the operator's own word, and only when** pass 1 returned a BLOCKER that
reverses a decision the operator made (a `D-NN` carrying the operator's words or a dialog answer;
`plan.md` § Plan readiness review), or the COO names a risk (security, tenancy, concurrency, transactions) after a substantive
revision, and `$row.passes` is at least 2. Ask for it in one sentence naming the trigger. Its brief
carries `round-1.md` verbatim - findings and dispositions - and requires every NEW finding to declare
why pass 1 could not see it (`ticket.md` § Fail aggregation). A resumed pass 2 needs that word
too and its compensations (`/pnp:review` Step 3).

**Approval.** Report to the operator in a few lines: the declared ticket count and its reason, the
tickets and their order, the COO tier of each ticket (its `COO: <model> - because <check>` line),
the passes run with their BLOCKER counts and dispositions, what is deferred, and the folder path -
never the plan itself.
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
`Status: planned` lines - the roadmap is written at exactly three events and never otherwise
(`ticket.md` § Durable development history): the entry's birth (`idea`; `researching` when
Step 2 dispatches the research agents), this landing (`planned`; the first ticket's dispatch - the
route-state write - sets `in progress`), and the archiving of its last plan (the entry leaves). Under
the ledger's `## Plans` - `<ledger>` below is its path, resolved as
`plan.md` § The ledger states - write the plan's line:
`<ABBR> - readiness/<ABBR>/, active/<ABBR>/records/`. Then `git add <plansDir>/active/<ABBR>
<plansDir>/readiness/<ABBR> <plansDir>/ROADMAP.md <ledger>` and ONE docs commit (native dialog). The stamp survives the move byte for byte;
a `--check` over `<plansDir>/active/<ABBR>` after the move confirms it.

The landing ends with the scratch cleanup under the ticket-end rule (`ticket.md` § Durable
development history): a planning session closes no ticket and fills no record, so the rule is
applied here directly - every file this cycle left in `<scratchDir>` is found standing in the tree
(a grep of its headings and items, never its name - the readiness folder holds the round files) or
is moved into git first; a file whose content stands nowhere else is never deleted unmoved; then
the rest is deleted, the delete dialog the gate, no chat question.

Each ticket is then started on its own word; the Writer brief is
`${CLAUDE_PLUGIN_ROOT}/templates/briefs/writer-dispatch.md`. Each ticket closes with its completion
record `<plansDir>/active/<ABBR>/records/<REF>.md`, written on
`${CLAUDE_PLUGIN_ROOT}/templates/briefs/record.md` (`ticket.md` § Durable development history).
