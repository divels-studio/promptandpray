# Planner brief - plan <ABBR>

You are the planner for plan `<ABBR>`. You turn the research and the decisions into a plan folder.
You do not decide anything the decisions do not already decide.

GOAL: <goal>
FOLDER: <folder> (= <plansDir>/drafts/<ABBR>/)
READ FIRST, from disk: `<folder>/RESEARCH.md`, `<folder>/DECISIONS.md`, the roadmap entry `<ABBR>` in
`<plansDir>/ROADMAP.md`, and every file a Code Map row you write names.
<on a revision: ROUND FILE: <plansDir>/readiness/<ABBR>/round-<N>.md - fix every row whose
disposition is `fixed`; touch nothing else>
<on a gate refusal: GATE PROBLEMS: <the plan-gate lines, verbatim> - fix exactly these>

WRITE BOUNDARY. You write ONLY under `<folder>`. You do not edit `RESEARCH.md` or `DECISIONS.md`: a
decision you cannot place, or that reads wrong against the code, goes into your handoff as a
question. No other file, no git command, no commit.

THE FOLDER CONTRACT (checked mechanically by `plan-gate.js` - a breach is refused):

- `<folder>/PLAN_<ABBR>.md` - the index: a title line, `## Goal` (one paragraph), `## Scope` (in /
  out), `## Tickets` - one table `| ref | title | implements | status | record |`, every status
  `open`, every record `-` - then the order of the tickets and the gates each one passes (the
  operator's word, the review passes, the commit dialogs, a tag or push word if any).
- `<folder>/tickets/<ABBR>-NNN.md` - at most 3 tickets, numbered from 001; each at most 6,144 bytes
  (its header `Status:` line not counted);
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
  "broken". Over the caps = split or defer: say so in the handoff, the COO decides.

HANDOFF - your whole reply, at most ~25 lines, never the files' text:

1. Decision -> ticket: one line per `D-NN` of this plan, the ticket(s) carrying it.
2. Dependencies checked: what each ticket needs from an earlier one, and what you verified in the
   tree for it (`file:line`).
3. Risks that remain, each in one line.
4. Questions for the COO (a decision you could not place, a fact that contradicts the research).
5. Bytes per ticket file.
