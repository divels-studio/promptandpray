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

## Verification (what actually ran)

<Every command that ran, literally, with its exact exit code or count line; the Reviewer/QA
verdict with its engine and pass number, or `no auditor` and why.>

## Remaining debt

<What is left and where it went - a ticket, the roadmap, the transfer surface - or `None.`; never an
invented follow-up.>

## Scratch

<What evidence moved out of the scratch directory and where; what is left to delete there, listed
for the operator's delete dialog.>

## Measurements

| correction rounds | COO session at close |
|---|---|
| <n, counted from an auditor's verdict> | <tokens, asked of the operator off the statusline at the close> |

<Correction rounds are counted from an auditor's verdict (`docs/WORKFLOW.md` § Loop shape and its
overrides); a ticket with no auditor carries `0 (no auditor)`. The session size is the value the
operator reads off the statusline when asked at the close - never estimated: a number only the
operator can see is asked for.>
