Plan-readiness review, pass <N>, of plan <ABBR> - <goal> - on branch <branch> (HEAD <hash>). Read
every file of the folder <folder> from disk: the index PLAN_<ABBR>.md, DECISIONS.md, RESEARCH.md and
every tickets/<ABBR>-NNN.md. The stamp <plansDir>/readiness/<ABBR>/stamp.json is current and the
mechanical gate passes; do not re-check what it checks (caps, headings, citations, Code Map paths).

YOUR TASK. Read the complete plan against the repository and return every material gap at once, in
one pass. A readiness gap is one of the classes of docs/READINESS_CLASSES.md: name the class in each
finding. The questions behind them: does the plan match the tree; are scope and out-of-scope clear;
is any discovery or architecture decision left open (for every write, the lock and what runs beside
it); are the tickets executable in their order; can every acceptance command run as written and
fail; are the branch and Git prerequisites valid; does every consumer of a changed surface move with
it.

<pass 2 only - delete on pass 1:
YOUR PASS-1 FINDINGS, carried verbatim with the COO's disposition (also the file
<plansDir>/readiness/<ABBR>/round-1.md):
<the table of round-1.md, verbatim>
For each pass-1 BLOCKER: CLOSED if the revised text really carries the property, OPEN with evidence
if not - a disposition that only names a worklist item is CLOSED only if that item's text carries
the property. Every NEW finding declares in its evidence cell why pass 1 could not see it: "origin:
born of the revision" or "origin: a fact pass 1 did not open"; a new finding without that origin is
a contract violation, reported separately below the table.>

THE BLOCKER CONTRACT. A BLOCKER = a required property the plan lacks + the evidence (`file:line`,
opened by you). INFO never causes a revision. Out of scope: wording, formatting, `file:line`
precision in explaining context, the size of the prose, and the design choices the decisions record
as the operator's. The hint column is a hint; the finding is the property.

OUTPUT SHAPE - exactly this and nothing else:

| id | class | property the plan must have | evidence | hint |
|---|---|---|---|---|
| B1 | BLOCKER | Class <n>: ... | file:line; ... | ... |
| I1 | INFO | ... | file:line | ... |

BLOCKERS: <n> INFO: <m>
<pass 2 adds: CLOSED: <k> OPEN: <j> - n counts NEW blockers, j the pass-1 blockers still OPEN>

STOP CONDITION. Stop when every file of the folder has been read from disk, every ticket has been
read against the tree it names, and the consumers of every surface the plan changes have been
searched.

RISK THRESHOLD. A BLOCKER (or, on pass 2, an OPEN row) blocks the landing; INFO does not.

Read-only: report; do not edit anything.
