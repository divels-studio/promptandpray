# 0002_example-bump

The simulated version bump of the example cycle: `0.1.0 -> 0.2.0`, four operations, one of each
operation type the migration format has.

| # | op | what it does here |
|---|----|-------------------|
| 0 | `add-config-key` | adds `enforcement.dispatchGate`, and **asks** for the value (`askOperator: true`). The cycle answers `false`, so the assertion afterwards distinguishes the operator's answer from the op's `default: true`. The schema that admits the key travels with this migration, in `../schema-key.json`. |
| 1 | `rerender-managed-region` | re-renders `CLAUDE.md#aiwf-core`. The cycle edits that region by hand first, so this operation meets a **real conflict** and is resolved `keep-mine`. |
| 2 | `reconcile-ask-ruleset` | reconciles `.claude/settings.json` against the payload ruleset. The project's own foreign rule is never touched, and no rule this installation did not insert is ever removed. |
| 3 | `note` | text with `docRefs`, which the runner collects into `CHANGES_0.1.0-to-0.2.0.md`. It applies nothing; it is how a release tells the operator what to re-read. |

This migration is **not** part of the shipped payload. It is data under `examples/`, overlaid onto a
throwaway copy of the payload by `scripts/ci/run-example-cycle.mjs`; the shipped
`migrations/index.json` never mentions it.
