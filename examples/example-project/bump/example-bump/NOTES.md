# example-bump

The simulated version bump of the example cycle: the payload it is built into -> that payload's next
minor version, five operations - one of each operation type the migration format has, plus a second
`rerender-managed-region` that demonstrates the OTHER outcome of a re-render.

| # | op | what it does here |
|---|----|-------------------|
| 0 | `add-config-key` | adds `enforcement.exampleToggle` - a demonstration-only key the shipped schema does not carry - and **asks** for the value (`askOperator: true`). The cycle answers `false`, so the assertion afterwards distinguishes the operator's answer from the op's `default: true`. The schema that admits the key travels with this migration, in `../schema-key.json`. |
| 1 | `rerender-managed-region` | re-renders `CLAUDE.md#aiwf-core`. The cycle edits that region by hand first, so this operation meets a **real conflict** and is resolved `keep-mine`. |
| 2 | `reconcile-ask-ruleset` | reconciles `.claude/settings.json` against the payload ruleset. The project's own foreign rule is never touched, and no rule this installation did not insert is ever removed. |
| 3 | `note` | text with `docRefs`, which the runner collects into `CHANGES_<installed>-to-<target>.md`. It applies nothing; it is how a release tells the operator what to re-read. |
| 4 | `rerender-managed-region` | re-renders `.claude/agents/writer.md`, which the cycle never touches. The bumped payload changes that template, so the render really is different - and because nothing of the operator's is at stake, it is applied **without a dialog** and reported as `payload-current`. Operation 1 and this one are the two halves of the same rule: a dialog exactly where you edited, none where you did not. |

**Why this one is appended at the end.** The cycle addresses the first two operations by index
(`<NNNN>_example-bump/0/...`, `<NNNN>_example-bump/1/...`) in its resolution file. A new operation
inserted anywhere else would renumber them, so a demonstration added later goes last.

This migration is **not** part of the shipped payload. It is data under `examples/`, built into a
throwaway copy of the payload by `scripts/ci/example-bump.mjs`; the shipped `migrations/index.json`
never mentions it.

**It is a template, and the harness numbers it.** This directory and `../bump.json` carry no
migration number and no version. The builder computes both from the payload it builds into: the id
is the manifest length + 1 (the payload validator requires the numeric prefixes to ascend by exactly
1), the target version is that payload's next minor version, and it writes both into the copied
`ops.json`. A real release that ships another migration therefore changes nothing here.
