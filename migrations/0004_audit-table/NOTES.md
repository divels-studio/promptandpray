# 0004_audit-table

**The review audit stops being a rule and becomes a setting you can see.** Until now, who audits
what was spread across doctrine text: "docs-class tickets go to a Claude host", "plan readiness has
two passes", "a third pass needs your word". None of it was in your config, so none of it could be
changed without editing the payload's own documents. This migration puts it in one table.

Seven operations, and **not one of them asks you a question**.

| # | op | what it does here |
|---|----|-------------------|
| 0-2 | `add-config-key` | adds `review.plan`, `review.code` and `review.docs` with the factory values `{ "passes": 2 }`, `{ "passes": 1 }` and `{ "passes": 1 }`. `askOperator` is false: these are the defaults the payload's own schema declares, and a question whose only sensible answer is the default is noise in front of the gates that matter. |
| 3 | `rerender-managed-region` | re-renders `.claude/aiwf-native/roles.json`, which now carries the effective row for each class next to the three roles. If you have not edited that file - and almost nobody has, it is machine-rendered - the new version is applied **silently**, reported as `the payload version applied (you had not edited it)`. |
| 4 | `rerender-managed-region` | re-renders `.claude/agents/reviewer.md`, and **only where it exists**. On a codex-configured project there is no Claude reviewer agent at all, so the operation reports `.claude/agents/reviewer.md: not on this installation (no record) - skipped` and the migration carries on. |
| 5 | `rerender-managed-region` | re-renders the `aiwf-core` region of your root `CLAUDE.md` - see below. Everything outside the two markers is yours and is not touched. |
| 6 | `note` | one sentence about your own overrides document - see below. |

## What is in your config now

```json
"review": {
  "productBoundaryChecks": [ ... ],
  "plan": { "passes": 2 },
  "code": { "passes": 1 },
  "docs": { "passes": 1 }
}
```

A row with only `passes` **inherits the Reviewer role whole** - engine, model and effort together.
That is why nothing about who audits your code changed when this migration ran: the same host that
was reviewing before is reviewing now, and the table simply says so out loud.

A row can also carry its own host, and then it is one of exactly two shapes:
`{ passes, engine: "claude", model }` or `{ passes, engine: "codex", model, effort }`. There is no
field-by-field inheritance on purpose - half a Reviewer plus half a row is how a configuration ends
up naming a Claude tier with a Codex model id, which resolves to nothing.

`passes` is what the number means everywhere: `plan` 0-3 readiness passes (one MORE is always
available with your explicit word, so the hard maximum is `passes + 1`), `code` and `docs` 0-2
(`1` = one Reviewer pass, `2` = a second full pass after the first returns `pass`, `0` = no
auditor). The fact-check gate is **not** in the table: it runs before every pass above the scan
tier, over a diff or over a plan, and it is not configurable. The one case it is skipped in is the
one where it protects nothing - a reviewer that itself runs on a scan-tier model.

## Two things that were rules and are now values

**Docs no longer go to a Claude host by themselves.** `review.docs` starts out inheriting exactly
the same auditor as `review.code`. If you want a cheaper host for documentation diffs, that is now
one command - and, more importantly, it is now visible: `/pnp:roles` shows who audits what.

**Plan readiness no longer has a hardcoded pass count.** It has `review.plan.passes`, which happens
to start at 2, and one pass beyond it still needs your explicit word.

## What changes in your `CLAUDE.md` region

Operation 5 re-renders the `aiwf-core` region only - the block between the two markers that
`/pnp:setup` wrote and every update since has owned. Three passages in it changed:

- the operator gate that used to read "a third readiness pass" now reads "a pass beyond
  `review.plan.passes`" - the number is yours, the gate above it is not;
- the dispatch section now says where the answer lives: **who audits this ticket, on which engine
  and with how many passes, is the audit table - `/pnp:roles`** - and that the review brief carries
  `Class: plan | code | docs` to name the row;
- the "countable tripwires" list gained a third entry (running a mechanical procedure is a
  subagent's job, not the orchestrator's).

If you have never edited inside the markers - and the region exists to be machine-owned - this is
applied silently and listed in the CHANGES report. If you HAVE edited inside them, you get the one
dialog this engine still raises, because that is content only you can decide about. Anything you
wrote outside the markers is never read and never touched.

## The new command

```
/pnp:roles                            the whole table on one screen
/pnp:roles --set docs.engine=claude   give documentation diffs their own Claude host
/pnp:roles --reset docs               and put them back on the Reviewer
```

`--set` refuses rather than guesses: a result your schema rejects, an artifact you edited by hand or
hold through an override, and a stale agent file without `--confirm-remove-stale` all end the run
with **nothing written**. It is plan-before-write, not a transaction: if it is interrupted between
two files, run the same command again - it finishes what it started and says so.

## One thing only you can do

Operation 6 is a note, and it is a note because this file is yours and no migration edits it: your
**overrides document** most likely still carries a Loop-shape line saying plan readiness keeps its
own two-pass contract. That contract is now `review.plan.passes`. Edit that line yourself - the
document belongs to you, and an update that rewrote it would be exactly the silent overwrite this
engine exists to prevent.

## If you are updating from 0.1.0 or 0.1.1

`0002_operator-word-and-hygiene` and `0003_quiet-rerender` still apply first, each with its own
operations and its own notes; this migration follows them.
