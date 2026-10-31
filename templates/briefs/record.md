# <REF> - <title>

<The ticket's completion record, written by the COO immediately after the ticket's commit
(`docs/WORKFLOW.md` § Durable development history). Fill every section; a section with nothing to
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
or `None.`. A ticket's events live here, not on the ledger (`docs/WORKFLOW.md` § The ledger).>

## Verification (what actually ran)

<Every command that ran, literally, with its exact exit code or count line; the Reviewer/QA
verdict with its engine and pass number, or `no auditor` and why.>

## Remaining debt

<What is left and where it went - a ticket, the roadmap, the ledger - or `None.`; never an
invented follow-up.>

## Diff review

<The COO's reading of the whole diff, folded in from `<scratchDir>/<REF>-diff-review.md`
(`docs/WORKFLOW.md` § The COO write boundary runs along artifact class, not size).>

## Scratch

<What evidence moved out of the scratch directory (`paths.scratchDir`) and where - into this record
or the plan's `readiness/<ABBR>/`. Then the directory is emptied of everything but the route state
and the files of a ticket or plan still in flight - this ticket's files, the review and QA brief
files and any leftover of earlier work alike - with no chat question; the delete dialog is the gate.
Name what was deleted. The session's own temporary directory outside the repository is not covered.>

## Closing checklist

<Each line answered before the record's commit, or `n/a` with its why:>

- the operator's own run on a real input, their words quoted - when the outcome is visible in the
  running product; offline proof never replaces it;
- the diff review folded in above;
- the ticket's finding lines on their roadmap area entry marked `done <commit>` or removed (the
  fifth roadmap write, `docs/WORKFLOW.md` § Durable development history);
- every out-of-scope finding registered: a line on its area's roadmap entry, or a new ticket that
  waits for its own word;
- the scratch evidence moved and the rest deleted (§ Scratch);
- the next ticket: this session or a fresh one, one line.

## Measurements

| correction rounds | COO session at close | source |
|---|---|---|
| <n, counted from an auditor's verdict> | <tokens, or `-` when no source> | <file or `-`> |

<Correction rounds are counted from an auditor's verdict (`docs/WORKFLOW.md` § Loop shape and its
overrides); a ticket with no auditor carries `0 (no auditor)`. The session size is read from the
machine source the project's overrides document names (a file its statusline writes); with no such
source it is `-` - never asked at a record's close, never estimated. Temporary: this row stays until
the first plan measured with it has been judged, then it is removed from this skeleton.>
