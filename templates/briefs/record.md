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

## Scratch

<What evidence moved out of the scratch directory and where; what is left to delete there, listed
for the operator's delete dialog.>

## Measurements

| correction rounds | COO session at close | source |
|---|---|---|
| <n, counted from an auditor's verdict> | <tokens, or `-` when no source> | <file or `-`> |

<Correction rounds are counted from an auditor's verdict (`docs/WORKFLOW.md` § Loop shape and its
overrides); a ticket with no auditor carries `0 (no auditor)`. The session size is read from the
machine source the project's overrides document names (a file its statusline writes); with no such
source it is `-` - never asked at a record's close, never estimated. Temporary: this row stays until
the first plan measured with it has been judged, then it is removed from this skeleton.>
