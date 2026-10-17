# scripts/setup/

The installer engine behind `/pnp:setup`. No dependencies, Node stdlib only.

| file | what it is |
|---|---|
| `validate-config.mjs` | A subset JSON-Schema interpreter driven by `schema/aiwf.config.schema.json`. It supports exactly the keyword subset that schema uses and **throws on any keyword it does not implement** - an unimplemented keyword silently ignored would turn a real constraint into decoration. Also a CLI: `node validate-config.mjs <config.json> [--schema <file>]` -> exit 0 valid / 1 invalid / 2 could not run. |
| `role-rules.mjs` | The ONE home of the Claude model-pin rule, which compares two fields and so cannot live in the schema subset. It holds `REVIEW_CLASSES` (the single definition; `generate.mjs` re-exports it), `TIER_ALIASES`, `TOP_TIER`, `isTierAlias()` and `claudePinErrors(config)`: a Claude-hosted review row shares the ONE rendered reviewer agent file, so its model must be a tier alias or exactly that file's pin - `roles.reviewer.model` when the Reviewer is Claude-hosted, `fable` when it is Codex-hosted - because `/pnp:review` omits `model` for an exact id and the file's pin is what runs. Called before any write by `generate.mjs` (next to the schema validation of the resulting config), by the update engine's `preflight` in `scripts/update/migrate.mjs` (right after the project config is loaded), and by `aiwf-roles.mjs` (`rowShapeError`); the self-check's `review-row-shape` runs it through the CLI. Also a CLI: `node role-rules.mjs <config.json>` -> exit 0 the rule holds / 1 violated (reasons on stderr) / 2 the config cannot be read. |
| `interview.mjs` | The question flow (project identity, OS channel, operator language and nicknames, roles, VERIFY commands, E2E surface, paths, product-boundary lines). Defaults come from the schema, or from the installed config on a re-run, so a hand-edited value survives a re-interview. `--answers-file <json>` skips the questions for CI. All three OS channels ship (`windows` renders the PowerShell wrappers, `linux`/`macos` the bash ones); anything outside that enum is refused fail-closed, because an installation this version cannot run is worse than a refusal. A successful install that really wrote something RUNS the self-check as its last step (`--no-selfcheck` skips it, out loud). |
| `generate.mjs` | The renderer and writer: plans everything first, writes only if nothing blocks. Template syntax is exactly what the shipped templates use (`{{config.<dotpath>}}`, `{{resolvedRoot}}`, `{{#each}}`, `{{^inverse}}`); an unresolvable path throws rather than rendering an empty string into a doctrine file. Also the home of the primitives every engine shares: `carryProjectAdditions` (the project additions block a re-render carries) and `normalizeBookkeeping` (a legacy `_aiwf` shape brought to the current one on load). Also a CLI for the scripted path: `node generate.mjs --answers-file <json> [--project-root <dir>] [--dry-run] [--confirm-remove-stale] [--no-seeds] [--quiet] [--no-selfcheck]`, which finishes with the same self-check step. |
| `dialog.mjs` | The synchronous stdin prompt the update CLI uses for the one question an update can ask (the value of an `askOperator` config key). Imports nothing of either engine. |
| `e2e-trace-note.mjs` | The one predicate `tracedOutputDir(projectRoot, e2e)` - true when `verify.e2e` is enabled, its `outputDir` resolves under its `cwd`, and that directory holds a `next.config.*` - and the one sentence `E2E_TRACE_NOTE`, shared by the interview (printed after the outputDir answer) and the self-check (a `[NOTE]` observation, evaluated in a child process because the self-check is CommonJS). An observation, never a failure. |
| `test-setup.mjs` | The acceptance and idempotency suite. Runs the real entrypoint against throwaway projects under the system temp dir and leaves nothing behind: fresh install -> the self-check passes against it; re-run -> zero diff; edits outside the markers -> preserved; edits inside a managed artifact, deleted artifacts and files setup never recorded -> overwritten by the render (the last named `overwrote:`); the project additions block carried verbatim and a malformed one blocking; legacy bookkeeping normalised; the conditional agent render in both directions; the stale-render removal gate; refusals (unsupported OS, schema-invalid answers) before a single write; foreign permission rules untouched and tombstones not forced back; and the integrated self-check step - a green run reports PASS, `--no-selfcheck` says it skipped, and a self-check that cannot be run at all makes the install exit 1. |

## The properties worth knowing

- **Plan, then write.** Any blocker is found before the first byte is written, so a blocked run
  leaves the project exactly as it was - no half-installed state.
- **A render overwrites; nothing asks.** Every managed artifact is written from the render: an
  edited one, a deleted one, a removed `CLAUDE.md` region (appended again), a file this
  installation has no record of. The last is named in the report as `overwrote: <path>` -
  information, not a question. Bookkeeping is one value per artifact: the payload version that
  last rendered it (`_aiwf.managedRegions[key] = "<semver>"`); a legacy two-hash shape is
  normalised on load and written back with the config.
- **The consumer's own text has two homes.** The overrides document (seeded once, never rewritten)
  and ONE project additions block per rendered Markdown file - the lines between
  `<!-- project additions -->` and `<!-- /project additions -->`, each marker on a line of its own -
  which every re-render carries over byte for byte (in place of the render's own block, or appended
  after the render). A malformed block (one marker alone, two blocks) blocks the run naming the
  file; nothing is guessed.
- **The operator's zone is untouchable - byte for byte.** Text outside the `aiwf-core` markers in
  `CLAUDE.md`, an existing overrides document, foreign permission rules, and any `settings.json` key
  outside `permissions.ask` are read-only to this engine. `CLAUDE.md` is the one managed file that
  also holds the operator's own text, so every branch that writes it (append, re-render) splices
  the existing bytes and renders only the region, in the line-ending convention that file already
  uses. Comparison stays LF-normalised - that is how a CRLF checkout avoids reading as a change -
  but normalising what gets WRITTEN would rewrite every line around the markers.
- **Deleting is gated twice.** A stale Claude agent file (left next to a role that became
  codex-hosted) is removed only when its key is recorded as ours AND the operator passed
  `--confirm-remove-stale`. A file at that path setup never recorded is left alone and named
  (`left alone: <path> (not rendered by this configuration)`) - it is not a render of ours to
  delete, and nothing about a file stops the run.
- **Memory seeds are printed, never written.** The memory store's format and location are
  machine-local and are not the plugin's to assume.
- **The self-check is a step, not a reminder.** A run that wrote something ends by running
  `scripts/selfcheck/aiwf-selfcheck.js` against the project. A red one makes the command exit 1
  while saying plainly that the files WERE written and nothing was rolled back; a self-check that
  cannot be started is also exit 1, because "could not check" is never reported as "checked". The
  shared contract lives in `scripts/selfcheck/run-selfcheck.mjs`.
