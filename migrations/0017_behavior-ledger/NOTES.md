# 0017_behavior-ledger

**A readiness pass was being paid to find what the plan's author remembered wrong about the code.**
The instruments before a readiness pass could be satisfied by EXISTENCE - a pointer resolves, a
command exists - without anyone reading BEHAVIOR: what a link validates, rejects or overwrites, what it closes over, what it does at N
rows and under concurrent callers, what the library underneath it does. The fact-check gate of
`/pnp:review` Step 2b returned only the claims it found false or unverifiable, so nothing showed
which claims it had opened; a gate that samples looks exactly like one that does not, and a claim
about a hook could be checked against a document that describes the hook instead of against its
code.

## What changes

- **Behavior ledger** (`/pnp:review` Step 2a, new): before the first paid readiness pass - and,
  when no auditor pass is configured, before the plan is presented for execution approval - the
  COO dispatches one scan-tier agent per ticket with a fixed task: one row per link of every chain
  the ticket's Outcome passes through, read in the code by a second context. A link the plan
  creates is a `NEW` row with its contract; a link the agent could not open is an `UNREAD` row the
  COO closes before the pass. The COO's own pass reads the rows, not the pointers.
- **Per-claim fact-check** (`/pnp:review` Step 2b, rewritten): the agent returns a ledger with one
  row per claim - verified, false or unverifiable - ending with a `CLAIMS:` count line. No
  sampling: a claim it did not open is unverifiable with the reason "not opened", and an output
  that spot-checks or carries no count line is re-dispatched. A claim about a hook or an engine is
  verified in its code, a claim about a library in the installed package. Over a plan the document
  is split: one agent per ticket section plus one for the shared sections.
- **Readiness classes** (`docs/READINESS_CLASSES.md`, new): fourteen blocker classes a readiness
  pass keeps finding, one question each; the fact-check agent applies every class to every ticket
  before a readiness pass and names a gap by class number.
- `docs/WORKFLOW.md` describes the same gate output, the own pass over the ledger, and one new
  rule: the revision after a pass closes the blockers it was handed and adds nothing new.

## What this migration does

- **Re-renders `.claude/aiwf-native/ORCHESTRATOR.md`**: the chain-trace duty becomes the behavior
  ledger duty. An installation that never edited the file gets the new render silently; an edited
  file raises the usual conflict question; an artifact held through an override is not applied -
  the new render is recorded as upstream.
- **One `note`** saying the above. Everything else is in the plugin payload
  (`skills/review/SKILL.md`, `docs/WORKFLOW.md`, `docs/READINESS_CLASSES.md`) and is read from
  there. Nothing that was valid before this release becomes invalid.

## Superseded local rules

A local memory or rule for an own pass over a ledger, a chain-trace evidence pack for readiness,
or a blocker-class replay before a pass can become a one-line pointer to these payload homes.
