# <REF> - <title>

<The ticket's completion record, written by the COO immediately after the ticket's commit
(`ticket.md` § Durable development history). Fill every section; a section with nothing to
say carries `None.`. Keep pointers, not retellings.>

## What landed

<The commit hashes and what each carries: actual changes, file by file or item by item of the
ticket's scope.>

## Decisions and deviations

<Material decisions taken during the work and every deviation from the ticket's contract, each with
its one-line why.>

## Events

<One row per rule-class event inside this ticket - a violation, a catch, or an operator
correction - shaped `| <date> | <rule or D-id> | violation|catch|operator-correction | <pointer> |`,
or `None.`. A ticket's events live here, not on the ledger (`plan.md` § The ledger).>

## Verification (what actually ran)

<Every command that ran, literally, with its exact exit code or count line; the Reviewer/QA
verdict with its engine and pass number, or `no auditor` and why.>

## Remaining debt

<What is left and where it went - a ticket, the roadmap, the ledger - or `None.`; never an
invented follow-up.>

## Diff review

<The COO's reading of the whole diff, folded in from `<scratchDir>/<REF>-diff-review.md`
(`ticket.md` § The COO write boundary runs along artifact class, not size).>

## Scratch

<What evidence moved out of the scratch directory (`paths.scratchDir`) and where - into this record
or the plan's `readiness/<ABBR>/`. Then the directory is emptied of everything but the route state
and the files of a ticket or plan still in flight - this ticket's files, the review and QA brief
files and any leftover of earlier work alike - with no chat question; the delete dialog is the gate.
Before a delete, every file is kept or moved first: its content is found standing in the tree - a
grep of its headings and items, never its name - or it is moved into git first (ticket evidence to
this record or `readiness/<ABBR>/`, anything else beside the plan it belongs to, a ledger row when it
belongs to no plan); a file whose content stands nowhere else is never deleted unmoved. One line
per file: where it moved, or where it already stood, then deleted. The session's own temporary
directory outside the repository is not covered.>

## Closing checklist

<Each line answered before the record's commit, or `n/a` with its why:>

- the operator's own run on a real input, their words quoted - when the outcome is visible in the
  running product; or the operator's waiver of that run in words, quoted, the outcome marked as
  not seen by the operator;
- the diff review folded in above;
- the ticket's finding lines on their roadmap area entry marked `done <commit>` or removed (the
  fifth roadmap write, `ticket.md` § Durable development history);
- every out-of-scope finding registered: a line on its area's roadmap entry, or a new ticket that
  waits for its own word;
- every scratch file found standing in the tree or moved into git before its delete - a file whose
  content stands nowhere else is never deleted unmoved - and the rest deleted, each named with its
  destination (§ Scratch);
- the next ticket: this session or a fresh one, one line.

## Measurements

| pnp-measure | ticket | <REF> | code pass: code defect <n> / test defect <n> / record or form only <n> - or no auditor | correction rounds <n> | effort: test Writers / production Writers / fact-check <figures or -> | defects after the close <n> | plan wrong at execution <n> |

<Under it, one sentence per "plan wrong at execution": where the ticket as written could not run or
was wrong, and what it cost. A defect after the close is an Events row when the operator reports
it; nobody asks him.>

<The COO fills them from figures it already holds; an unknown figure is `-`, never asked. The kinds
are counted from the verdicts as returned: a blocker that names a defect in production code or
product behavior, one that names how a test fails to prove its claim, one that names only a missing
record or form. Notes are not counted; a blocker carried to a later pass counts once. The effort
figures are copied from the usage each agent reported, never estimated; a ticket with one Writer
for code and tests carries `-`. The defects after the close are `0` at the close,
raised when one arrives: a defect the operator meets after the close - a live-look correction, a
fix after release - is written as an Events row of this record when it arrives, and the count
follows it. The code-pass kinds and the defects after the close are read together across tickets:
the volume of tests may go down while the code defects fall and the defects after the close do not
rise.>
