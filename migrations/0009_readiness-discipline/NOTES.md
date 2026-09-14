# 0009_readiness-discipline

**A verdict that was reported in half a line, and a paid pass that was dispatched without asking.**
Both were observed in a live session, and both used to live only in the memory of the session that
had been corrected. This release writes them into the payload - together with the rest of what
0.2.5 changes around a paid audit pass and around the plan that earns one.

- **The verdict is reported in substance.** Every Reviewer or QA verdict reaches the operator as the
  verdict plus one or two sentences of its substance, before the next dispatch - what the pass
  confirmed, or what its blockers and notes are. Not a wall of text, and not a bare
  "pass, moving on": the second is how an audit the operator paid for disappears on the way to the
  next step.
- **One word per pass.** The doctrinal default "the passes the route already prescribes run on the
  ticket's standing word" is revoked payload-wide. Pass 1 of a route rides the ticket's word; EVERY
  further auditor pass - a further configured readiness pass, the verification pass after a
  correction round that touched code, a pass beyond the review contract, a round past the correction
  cap - is dispatched only on the operator's own explicit word. `review.<class>.passes` is therefore
  a CEILING, not a budget the COO may spend on its own.
- **Fail aggregation is a mechanism.** Inside the plan-readiness cycle the ban on raising an
  already-visible blocker late is instrumented: from pass 2 on, the brief hands the Reviewer the
  blocker list the previous pass returned, and every new blocker declares why that pass could not
  see it - one raised without the declaration is reported as a broken contract, separately from the
  verdict.
- **A plan owes an inventory before it owes a draft.** For everything the plan touches - a column, a
  permission, a command, a contract - one scan-tier agent harvests who consumes it and which
  contracts sit next to it, and the draft answers that list before the first paid pass.
- **A plan owes literal proofs, a process trace and its adjacent contracts.** A verification command
  in a PLAN document is written rather than described; before every paid readiness pass the COO
  walks the ticket's own process against the gates it will hit, in order; and the contract that has
  to move with a change is scoped beside it.

Three operations.

| # | op | what it does here |
|---|----|-------------------|
| 0 | `note` | one paragraph in your `CHANGES_*.md`: what the rules of this release are, and that the doctrine itself ships with `/plugin update` rather than with this migration. |
| 1 | `rerender-managed-region` | re-renders the `aiwf-core` region of your `CLAUDE.md`. That region's operator-gates paragraph stated the revoked default in one line, so it changes here. |
| 2 | `rerender-managed-region` | re-renders `.claude/agents/reviewer.md`, whose plan-readiness section described the same revoked model - the configured passes as granted, only the one beyond them as needing your word. `ifRecorded: true`: on a project whose Reviewer is Codex-hosted no such agent file was ever rendered, and the operation is reported as skipped rather than adopting a file this engine did not write. |

## Why the region and the reviewer agent are re-rendered

The gates paragraph inside the managed region used to end with "the passes the route already
prescribes run on the ticket's standing word" - the sentence this release revokes. A managed region
that keeps instructing the old rule would out-argue the doctrine for the one reader that matters:
the orchestrator session, which reads `CLAUDE.md` at startup. Everything of yours outside the
`<!-- BEGIN aiwf-core -->` / `<!-- END aiwf-core -->` markers is untouched, as always. If you have
edited that region, the update asks before it writes; if you hold it through an override, nothing is
applied and the new render is recorded as upstream, which the CHANGES report states in its own line.

The rendered `reviewer` agent carries the same rule in its plan-readiness section, and a Claude-hosted
Reviewer reads that file rather than this one: leaving it as it was would hand the auditor the revoked
model in writing. It is re-rendered under exactly the same dialog rules as any other managed artifact,
and `ifRecorded: true` means a project that never had a `reviewer.md` - a Codex-hosted Reviewer, the
factory posture of many installations - sees the operation reported as skipped, with no file adopted
and no bookkeeping invented.

## Your overrides document is NOT migrated - and it names the old rule

`/pnp:setup` seeds `paths.overridesDoc` once and no update ever rewrites it: that document is yours.
Its **Loop shape** section was seeded with a line of the form

> Plan readiness runs `review.plan.passes` passes (the audit table, `/pnp:roles`; factory 2) on the
> ticket's standing word, one more with the operator's explicit word - independent of the cap above.

That sentence is now wrong in its middle: the ceiling and the "one more with your explicit word" are
unchanged, but only the FIRST of the configured passes runs on the ticket's standing word. The
template that seeds new installations was corrected in this release; your copy was not, because it
is not ours to edit. If you want it true, change that one line yourself - for example: "Plan
readiness runs `review.plan.passes` passes as a ceiling: the first on the ticket's standing word,
each further one on your own explicit word - one word per pass - and one more beyond the configured
number is always available with that word." Nothing enforces the wording; the payload doctrine is
the authority either way, and an uncorrected line costs you only the contradiction.

## What does NOT change

No config key is added, no permission rule is reconciled, no schema default moves, and the audit
table's numbers are exactly what they were - `review.plan.passes`, `review.code.passes` and
`review.docs.passes` keep their values and their meaning as a maximum. The verdict vocabulary is
untouched as well: `pass` / `pass-with-notes` / `fail` for implementation, `PASS` / `NEEDS-FIX` for
plan readiness. What changed is who releases each pass after the first, how its result is reported
to you, and what a plan owes before a pass is paid for at all.

## If you are updating from 0.1.x or 0.2.x

`0002_operator-word-and-hygiene`, `0003_quiet-rerender`, `0004_audit-table`, `0005_posix-legs`,
`0006_git-verb-gate`, `0007_powershell-ask-ruleset` and `0008_consumer-correctness` still apply
first, each with its own operations and its own notes; this one follows them.
