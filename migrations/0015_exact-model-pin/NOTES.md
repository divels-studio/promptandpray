# 0015_exact-model-pin

**A Claude auditor could not be pinned to the model the operator measured.** A claude-hosted
Reviewer, QA or audit-table row took a tier alias only (`fable|opus|sonnet|haiku`), because the
dispatch always passed the value as the Agent tool's `model`, and that parameter takes the aliases
and nothing else. An alias is a moving target: it points at a newer model with every model release,
silently. The Writer never had the limit - its model is pinned in its agent file's frontmatter,
where an exact id is valid, and its dispatch never passes `model` - so the same pattern now applies
to the Reviewer and QA.

## The dispatch contract

- a **tier alias** is passed as the Agent tool's `model`, which takes precedence over the agent
  file's frontmatter - exactly as before;
- an **exact model id** (e.g. `claude-opus-5-5`) is NOT passed: `model` is omitted, and the pin
  rendered into `.claude/agents/reviewer.md` / `.claude/agents/qa.md` is what runs.

## The one rule that comes with it

The Reviewer has ONE agent file carrying ONE pin, and every claude-hosted row of the audit table is
dispatched through it. An exact id on a row can therefore only run if it is exactly that pin:

- the Reviewer is claude-hosted - a claude row takes a tier alias or exactly `roles.reviewer.model`;
- the Reviewer is codex-hosted (the file carries `fable`) - a claude row takes a tier alias.

The rule compares two fields, so it is not in the schema: it is `claudePinErrors` in
`scripts/setup/role-rules.mjs`, and `/pnp:setup`, `/pnp:update` (in preflight, before any operation)
and `/pnp:roles` all call it before they write. `/pnp:review` additionally fails closed at dispatch:
it compares a row's exact id with the `model:` line of the agent file and stops on a mismatch.

An exact id is never RANKED against the aliases. `/pnp:roles --show` marks it
`(exact id - tier not ranked)` rather than `(below the top tier)`, and the fact-check gate always
runs before a pass on an exact id - it is skipped only for a reviewer on a scan-tier alias
(`haiku`/`sonnet`).

## What this changes on your installation

No configuration that was valid before this release becomes invalid: every claude model you could
write before was a tier alias, and an alias is dispatched exactly as it was.

| # | op | what it does here |
|---|----|-------------------|
| 0 | `note` | one entry in your `CHANGES_*.md`: exact ids are accepted, how they are dispatched, and the one rule for claude rows. It applies nothing. |
| 1 | `rerender-managed-region` `.claude/agents/reviewer.md` (`ifRecorded`) | the agent's own sentence about how it is dispatched now names both halves of the contract. The file is rendered whenever the Reviewer role OR any review row is claude-hosted, so a codex-hosted Reviewer with a claude row has it and gets it re-rendered; only an installation where neither is claude-hosted never had it and sees the operation reported as skipped. |
| 2 | `rerender-managed-region` `.claude/agents/qa.md` (`ifRecorded`) | same, for QA. The file exists only when the QA role is claude-hosted; where QA is codex-hosted it was never rendered and the operation is reported as skipped. |
| 3 | `rerender-managed-region` `.claude/agents/writer.md` | every installation renders the Writer, so a missing record here is a defect and the migration refuses rather than skipping it. |

An agent file you hold through an override is not re-applied: the new render is recorded as
upstream and the CHANGES report says so.

## If you are updating from 0.1.x or 0.2.x

`0002_operator-word-and-hygiene` through `0014_open-effort` still apply first, each with its own
operations and its own notes; this one follows them.
