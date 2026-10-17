# scripts/update/

The update engine behind `/pnp:update`.

| file | what it is |
|---|---|
| `validate-payload.mjs` | the shared, fail-closed validator of `migrations/` (manifest + every ops.json). BOTH the runner and setup call it before their first write; also a CLI (`--plugin-root`), which is how the self-check exercises it. |
| `migrate.mjs` | the engine: loading (with the legacy bookkeeping normalised in memory), preflight invariants, the CHANGELOG blocks between the installed and the payload version, per-operation planning and applying, one config write per migration. Importable; no CLI of its own. |
| `aiwf-update.mjs` | the CLI: `--check` (the version interlock every skill runs in Step 0; a project that is behind also gets a `behind:` line), `--dry-run`, `--apply`, plus `--resolution-file`, `--quiet` and `--no-selfcheck`. Exit 0 = success / already current / a clean dry run, 1 = blocked, 2 = could not start. An `--apply` that really applied migrations runs the self-check as its last step; a red or unrunnable one is exit 1 with the writes left standing. |
| `test-update.mjs` | the acceptance suite: real entrypoints, temp projects, real payload copies with a bumped version, the overwrite and additions-carry contract, legacy bookkeeping, the CHANGELOG print, an interrupted migration re-run, and the integrated self-check step in all its states (PASS, skipped, unrunnable, RED after a successful apply). |

Two properties everything here exists to protect:

- **an update overwrites what it renders, and keeps the consumer's two homes.** Every managed
  artifact - an edited one, a deleted one, one this installation never recorded - is written from
  the payload render without a question; the consumer's own text lives in the overrides document
  (never touched) and in ONE `<!-- project additions -->` ... `<!-- /project additions -->` block
  per rendered Markdown file, carried byte for byte. A malformed block stops the run naming the
  file. Text outside the `aiwf-core` markers of `CLAUDE.md` is kept byte for byte.
- **a stop is a re-run, not a recovery.** Each migration's bookkeeping and stamps are written once,
  after its last operation; a run that stops inside a migration leaves the stamps at the previous
  one, and the next run runs that migration again - every operation is idempotent (a re-render
  overwrites, a present config key is skipped, the ask ruleset reconciles).

The one question an update can ask is the value of a config key a migration marks `askOperator`:
answered interactively, through `--resolution-file` (`{ "kind": "answer", "value": <json> }` per
`<migration>/<opIndex>/<key>` address), or - in a dry run - listed as `would ask: <address>`.
