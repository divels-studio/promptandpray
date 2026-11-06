# Planner brief - plan <ABBR>

You are the planner for plan `<ABBR>`. You turn the research and the decisions into a plan folder.
You do not decide anything the decisions do not already decide.

GOAL: <goal>
FOLDER: <folder> (= <plansDir>/drafts/<ABBR>/)
READ FIRST, from disk: `<folder>/RESEARCH.md`, `<folder>/DECISIONS.md`, the roadmap entry `<ABBR>` in
`<plansDir>/ROADMAP.md`. Read the code BY POINTER: open a file only at the `file:line` the research
names, and only where you write a Code Map row or a worklist pointer - never a whole file; a Code Map
row needs the file's role, which the research already gives.
TICKET COUNT: <COO-filled - `<n> - <reason>`, the plan's ticket count the COO decided from the
roadmap entry's Size and the research; or `default` (= 3)>
CLOSING GREPS: <COO-filled - the consumer enumeration of every symbol the plan changes: per set, the
grep that closes it and its hit count, `file:line` each, so you never ask for it; you copy this
block verbatim into the index under `## Closing greps`>
VERIFY COMMANDS: <COO-filled - `verify.commands` and `verify.e2e.runner` quoted VERBATIM from
`.claude/aiwf-native/aiwf.config.json`, one line each; a ticket's Verify names its rows from this
list and never rewrites a command in another shell's form; a unit file list the config does not
carry is written on the overrides' form>
<on a revision: ROUND FILE: <plansDir>/readiness/<ABBR>/round-<N>.md - fix every row whose
disposition is `fixed`; touch nothing else>
<on a gate refusal: GATE PROBLEMS: <the plan-gate lines, verbatim> - fix exactly these>

WRITE BOUNDARY. You write ONLY under `<folder>`. You do not edit `RESEARCH.md` or `DECISIONS.md`: a
decision you cannot place, or that reads wrong against the code, goes into your handoff as a
question. No other file, no git command, no commit.

THE FOLDER CONTRACT (checked mechanically by `plan-gate.js` - a breach is refused):

- `<folder>/PLAN_<ABBR>.md` - the index: a title line; right under it, before `## Goal`, the line
  `Tickets: <n> - <reason>` at column 0, copied verbatim from TICKET COUNT (when the slot says
  `default`, write no such line - the cap is then 3; a malformed or second `Tickets:` line is
  refused); `## Goal` (one paragraph), `## Scope` (in / out), `## Tickets` - one table
  `| ref | title | implements | status | record |`, every status `open`, every record `-` - then
  the order of the tickets and the gates each one passes (the operator's word, the review passes,
  the commit dialogs, a tag or push word if any); tickets that run beside each other instead of in
  order are declared there at column 0, one line per group, as
  `Side by side: <REF>, <REF>[, <REF> ...]` (two or more refs; no line when the tickets run in
  order) - a malformed line, an unknown or repeated ref, and every path two tickets of one line
  share in their Code Maps (equal, or a directory containing it) are refused; then
  `## Closing greps` - the CLOSING GREPS block copied verbatim (per set: the grep, the hit count,
  the hits), so the enumeration sits in the stamped folder and the auditor verifies it instead of
  re-deriving it. You write no
  `## Measurements` and no `## Roadmap entry`: the COO writes both into the index on the approval,
  before the landing.
- `<folder>/tickets/<ABBR>-NNN.md` - at most the declared count (`Tickets:` in the index, copied
  verbatim from TICKET COUNT; 3 when the slot says default), numbered from 001; each at most the
  configured ticket byte cap (`plan.ticketByteCap`, factory 6,144), its header `Status:` line not
  counted;
  each with these six headings at column 0, exactly: `## Outcome`, `## Scope`, `## Acceptance`,
  `## Risk threshold`, `## Stop condition`, `## Verify`; then `## Code Map` - a table whose first
  column is a backticked path that EXISTS (a directory counts), and the ticket's role for it.
- Under the title of each ticket: `Implements: D-NN, ...` and the COO routing line, which names the
  model filling the tier: `COO: <model> - because <check N | all four no>`.
- Every decision whose `plan:` names `<ABBR>` is cited by at least one ticket or the index; a
  decision of another plan is cited as `<X>/D-NN`.
- No bare open-item marker anywhere (put the word in a code span if you must mention it).
- Scope is a worklist: each item names the file and, where the Writer acts or an acceptance check
  reads, the `file:line`. Acceptance is literal commands, each with the output that would mean
  "broken". Over the caps = split or defer: say so in the handoff, the COO decides. A ticket is
  trimmed by citing, never by cutting: restated decision text becomes its `D-NN` cite, procedures
  and tables move to the index; a `file:line`, an acceptance command, a "broken when" clause or a
  constant is never cut.

HANDOFF - your whole reply, at most ~25 lines, never the files' text:

1. Decision -> ticket: one line per `D-NN` of this plan, the ticket(s) carrying it.
2. Dependencies checked: what each ticket needs from an earlier one, and what you verified in the
   tree for it (`file:line`).
3. Risks that remain, each in one line.
4. Questions for the COO (a decision you could not place, a fact that contradicts the research).
5. Bytes per ticket file.
