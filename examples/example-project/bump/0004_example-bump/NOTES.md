# 0004_example-bump

The simulated version bump of the example cycle: the shipped payload version -> `0.3.0`, five
operations - one of each operation type the migration format has, plus a second
`rerender-managed-region` that demonstrates the OTHER outcome of a re-render.

| # | op | what it does here |
|---|----|-------------------|
| 0 | `add-config-key` | adds `enforcement.exampleToggle` - a demonstration-only key the shipped schema does not carry - and **asks** for the value (`askOperator: true`). The cycle answers `false`, so the assertion afterwards distinguishes the operator's answer from the op's `default: true`. The schema that admits the key travels with this migration, in `../schema-key.json`. |
| 1 | `rerender-managed-region` | re-renders `CLAUDE.md#aiwf-core`. The cycle edits that region by hand first, so this operation meets a **real conflict** and is resolved `keep-mine`. |
| 2 | `reconcile-ask-ruleset` | reconciles `.claude/settings.json` against the payload ruleset. The project's own foreign rule is never touched, and no rule this installation did not insert is ever removed. |
| 3 | `note` | text with `docRefs`, which the runner collects into `CHANGES_<installed>-to-0.3.0.md`. It applies nothing; it is how a release tells the operator what to re-read. |
| 4 | `rerender-managed-region` | re-renders `.claude/agents/writer.md`, which the cycle never touches. The bumped payload changes that template, so the render really is different - and because nothing of the operator's is at stake, it is applied **without a dialog** and reported as `payload-current`. Operation 1 and this one are the two halves of the same rule: a dialog exactly where you edited, none where you did not. |

**Why this one is appended at the end.** The cycle addresses the first two operations by index
(`0004_example-bump/0/...`, `0004_example-bump/1/...`) in its resolution file. A new operation
inserted anywhere else would renumber them, so a demonstration added later goes last.

This migration is **not** part of the shipped payload. It is data under `examples/`, overlaid onto a
throwaway copy of the payload by `scripts/ci/run-example-cycle.mjs`; the shipped
`migrations/index.json` never mentions it.

**It is numbered to follow the shipped manifest.** The cycle APPENDS this entry to the real
`migrations/index.json`, and the payload validator requires the numeric prefixes to ascend by
exactly 1 - so the day the payload ships another migration, this directory, `bump.json` and the
`migration` field above move up one number together. The failure is loud and immediate (the cycle
stops on `carries the number N but sits at position N+1`), which is why it is left as a rename to
do rather than a number computed at run time: the example is meant to read like a real release,
and a real release names its own migration. That day has come once already: the payload shipped
`0003_quiet-rerender`, so this fixture was renamed `0003_example-bump` -> `0004_example-bump`.

The target version leaves a gap on purpose. The self-check runs against payload COPIES that already
carry a fixture migration of their own (the acceptance suites build them at `0.2.0`), and it holds
this bump to "strictly greater than the entry it declares itself to follow" in every one of them -
so the version here sits above anything those fixtures use.
