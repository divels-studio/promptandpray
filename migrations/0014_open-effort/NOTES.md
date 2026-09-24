# 0014_open-effort

**A limit narrower than the engine's was a product defect.** The audit table's three rows carry an
optional `effort`, and until this release the schema pinned it to `low|medium|high`. A row is a
host, and a host is an external engine: the wrapper hands the value to it as
`-c model_reasoning_effort=<value>`. When an engine release added efforts beyond those three, the
configuration an operator had MEASURED as the best one for their auditor could not be written down -
`/pnp:roles --set code.effort=<the measured value>` exited 1 with
`must be one of "low", "medium", "high"`, and the only way to use it was to go around the wrapper,
which is also the thing that keeps a session id.

`roles.writer|reviewer|qa|qal.effort` never had that limit, and the reason it did not is the reason
the rows lose it now: the value is passed straight to whichever engine hosts the role, and a list
kept in this schema can only ever be narrower than the list that engine accepts. The rows are now
`{"type": "string", "minLength": 1}`, the same shape as the roles.

## What this changes on your installation

Nothing is written. No managed artifact is re-rendered, no config key is added, no permission rule
is reconciled, no default moves - and no configuration that was valid before this release becomes
invalid, because the set of accepted values only grew.

| # | op | what it does here |
|---|----|-------------------|
| 0 | `note` | one entry in your `CHANGES_*.md`: the rows take any non-empty effort, who owns the vocabulary, and the two commands whose answer changes. It applies nothing. |

Two commands answer differently from today on:

- `/pnp:roles --set <row>.effort=<value>` accepts any effort your engine accepts, instead of the
  three this plugin used to list.
- `/pnp:roles --set <row>.engine=codex` copies the Reviewer's host WHOLE - model and effort
  together - and that copy can no longer fail schema validation because the Reviewer's own effort
  was outside a list the row did not share.

## What is still refused

- The EMPTY value: `--set <row>.effort=` is a usage error (a value is missing), and the schema's
  `minLength` refuses an empty effort written into the config by any other route.
- An effort on a CLAUDE row (exit 1). Every claude-hosted pass is dispatched through the one
  rendered reviewer agent, whose frontmatter effort is `roles.reviewer.effort`, because the Agent
  tool has no per-invocation effort - so a per-row effort there would be a setting nothing reads.
- A value your engine does not know. It is not enum-checked anywhere in this plugin any more; the
  engine rejects it VISIBLY at call time, which is the same contract
  `docs/CODEX_REVIEW_QA_RECIPE.md` already states for the roles.

## If you are updating from 0.1.x or 0.2.x

`0002_operator-word-and-hygiene` through `0013_preflight-and-word-gate` still apply first, each with
its own operations and its own notes; this one follows them.
