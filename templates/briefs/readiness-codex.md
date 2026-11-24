Plan-readiness review, pass <N>, of plan <ABBR> - <goal> - on branch <branch> (HEAD <hash>). Read
every file of the folder <folder> from disk: the index PLAN_<ABBR>.md, DECISIONS.md, RESEARCH.md and
every tickets/<ABBR>-NNN.md. The stamp <plansDir>/readiness/<ABBR>/stamp.json is current and the
mechanical gate passes; do not re-check what it checks (caps, headings, citations, Code Map paths).

YOUR TASK. Read the complete plan against the repository and return every material gap at once, in
one pass. A readiness gap is one of the classes of docs/READINESS_CLASSES.md: name the class in each
finding. The questions behind them: does the plan match the tree; are scope and out-of-scope clear;
is any discovery or architecture decision left open (for every write, the lock and what runs beside
it); are the tickets executable in their order; is every ticket one shippable piece with one code
commit - two tickets that are really one, or a plan that is really two missions, is a BLOCKER when
one of them cannot ship alone without a loss, otherwise INFO; can every acceptance command run as
written and fail; are the branch and Git prerequisites valid; does
every consumer of a changed surface move with it - the auditor runs the index's grep and compares
the count; a set missing or a count off is INFO unless a production reader the change breaks is
missed - then a BLOCKER of class 1, named by its loss; does RESEARCH.md carry read / lock / write
rows for every function whose write order, lock or statement set the plan changes, and one sentence
naming the statements for a write that only carries one more column or value through existing
statements (a later write in the same transaction that nobody opened is a finding). Classes 8 and
11 and check 5 read only what the plan itself introduces; the project's cited procedure is not
re-audited.

<pass 2 only - delete on pass 1:
YOUR PASS-1 FINDINGS, carried verbatim with the COO's disposition (also the file
<plansDir>/readiness/<ABBR>/round-1.md):
<the table of round-1.md, verbatim>
For each pass-1 BLOCKER: CLOSED if the revised text really carries the property, OPEN with evidence
if not - a disposition that only names a worklist item is CLOSED only if that item's text carries
the property. A pass-1 BLOCKER disposed `note: land` or `note: drop` is marked NOTED, never OPEN,
and is counted in neither CLOSED nor OPEN. Every NEW finding declares in its evidence cell why
pass 1 could not see it: "origin: born of the revision" or "origin: a fact pass 1 did not open"; a new finding without that origin is
a contract violation, reported separately below the table.>

TEST POLICY: <the path of the project's overrides document and its section "Test policy", plus any
document that section names - or `none` when the project carries no such section>
The project decides what is tested and at which layer; read that policy before you judge a ticket's
tests. A demand for a test the policy excludes is INFO, never a BLOCKER. The floor no policy lowers:
a behavior that writes stored data, computes money, or sits on a migration, access-policy, grants,
auth or permission-model surface always owes its proof.

PRODUCT STAGE: <the overrides document's § Product stage - or none>
**The project's product stage** - its overrides document's § Product stage, named on the brief's
`PRODUCT STAGE:` line - says what this stage does not ask for and what stays mandatory. A finding
about something it lists as not asked is a note, never a blocker; what it lists as mandatory is not
loosened; it never lowers the floor. Where the line reads `none`, the pass is judged without it.

THE BLOCKER CONTRACT. At both audits - plan readiness and code review - a BLOCKER names what is lost
if the work runs exactly as written, with its evidence (`file:line`, opened). The losses: stored
data or money wrong; an access, tenancy or permission hole; a migration that fails, cannot be
applied, or blocks live traffic while it waits for or holds its lock; a race or a lock order that
loses, duplicates or deadlocks a write; something the user sees wrong or cannot do; a decision left
to the Writer; a proof that does not test the ticket's own product property - its assertion stays
green when the property is broken, or it probes another object than the one the ticket changes. The
brief's risk threshold picks which of them block.

A finding about how the plan or the diff is worded, ordered, proven, evidenced or recorded names no
loss: it is a NOTE (an INFO row at readiness). So is a command that cannot run as written, a missing
grep or count, a procedure restated or missing, the form of a table or a row, and the gate that
collects a proof's result - which specs run together, the baseline, what a comparator requires,
which artifacts QA gets. A note opens no revision and no pass: at readiness the live planner lands
it beside a revision, or alone without it counting as one, or the COO drops it; at the code pass it
is listed in the record and settled at the close (§ Test findings on confirmed code). The cost is
accepted: a wrong command is caught when the ticket runs, with the code audit behind it.

**Its suppression dual:** a finding of form whose consequence IS a loss - a step order that fails a
migration, a pointer that sends the Writer to the wrong file, a production reader the change
breaks - is a blocker, named by that loss; a test the change breaks is a note at readiness, because
it fails at the run. Nothing here lowers the floor (§ The project's test policy and the auditor) or
the dual of § Test findings on confirmed code: at the code pass, a test that failed, a test skipped
or narrowed to get green, and a VERIFY row or project verify command that was not run stay
blockers; a missing red run is not one (§ Test quality), whatever the ticket or the brief demands.

INFO never causes a revision. Out of scope: wording, formatting, `file:line` precision in explaining
context, the size of the prose, and the design choices the decisions record as the operator's. The
hint column is a hint; the finding is the property.

Wording, formatting and `file:line` precision are INFO, never BLOCKER. The test for a row: executed
exactly as written, what does the product, its data or its user lose - or what must the Writer
decide alone? A named loss -> BLOCKER. None -> INFO. INFO examples, rows that belong under I<n>
whatever their count:
- a worklist pointer that names the right file and symbol at a line a few lines off;
- a sentence that could be shorter, a heading that could be renamed, a list that could be a table;
- a decision cited by number where the cited text makes the number recoverable;
- an acceptance command whose target is right and whose difference is cosmetic (a flag, an order);
- a risk the plan already names, restated as a reminder;
- an improvement the plan does not need in order to be executable;
- a procedure restated or missing in the plan;
- an acceptance command that cannot run as written;
- a closing-grep set missing where no consumer is missed;
- read / lock / write rows missing for a write whose order, lock and statements do not change;
- the form of a table, a row or a record.
A pass that returns zero INFO over a plan carrying any of the above has misfiled them as BLOCKERs.

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
