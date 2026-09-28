# 0016_readiness-gaps-instruction

**A readiness pass was being paid to find the author's own gaps.** The fact-check gate of
`/pnp:review` Step 2b - one scan-tier agent, run before every reviewer pass above the scan tier,
over a diff or over a plan - verified facts: paths, line numbers, counts, commands. A plan whose
facts were all true could still hand the paid readiness pass a design the Writer could not
execute: a check that could not fail, a decision left open, a gate the process never named, two
places in the plan contradicting each other. Those are the six readiness checks, and the author's
own pass was the only thing reading for them.

## What changes

- For a readiness pass the fact-check agent's task now carries THREE extra instructions: the
  acceptance-command line and the chain-table line as before, and the six readiness checks applied
  adversarially, returned as a second list of gaps - A (the Writer cannot execute, or the check
  cannot fail or cannot pass), B (a false or unverifiable claim), C (consistency) - beside the
  false-claims list, with no verdict. The COO closes every A and B item before the pass.
- The gaps list is not the COO's own pass and does not stand in for it, and it is never counted as
  a pass. The own pass in a separate turn, the process dry run and the chain table stay the COO's
  duties exactly as `docs/WORKFLOW.md` § Plan readiness review states them; that paragraph now also
  says the own pass runs every command on the real tree, never on a stub.
- Two sentences in `docs/WORKFLOW.md` that described the gate as returning only claims, or as
  unable to see process, are corrected to match.

## What this migration does

Nothing to your project files: two `note` operations only. The change is in the plugin payload
(`skills/review/SKILL.md`, `docs/WORKFLOW.md`, `scripts/selfcheck/aiwf-selfcheck.js`) and is read
from there. Nothing that was valid
before this release becomes invalid.

## Also in this release

The self-check no longer pins doctrine SENTENCES: of its 96 doctrine checks it keeps five
operator-gate sentences (one home each) and four mechanical checks, and deletes the rest. A
prose-only change now ships as a version bump, a CHANGELOG line and a note-only migration, verified
by CI on the pushed commit rather than by a local run of every suite.
