# scripts/setup/

The installer engine behind `/pnp:setup`. No dependencies, Node stdlib only.

| file | what it is |
|---|---|
| `validate-config.mjs` | A subset JSON-Schema interpreter driven by `schema/aiwf.config.schema.json`. It supports exactly the keyword subset that schema uses and **throws on any keyword it does not implement** - an unimplemented keyword silently ignored would turn a real constraint into decoration. Also a CLI: `node validate-config.mjs <config.json> [--schema <file>]` -> exit 0 valid / 1 invalid / 2 could not run. |
| `interview.mjs` | The question flow (project identity, OS channel, operator language and nicknames, roles, VERIFY commands, E2E surface, paths, product-boundary lines). Defaults come from the schema, or from the installed config on a re-run, so a hand-edited value survives a re-interview. `--answers-file <json>` skips the questions for CI. All three OS channels ship (`windows` renders the PowerShell wrappers, `linux`/`macos` the bash ones); anything outside that enum is refused fail-closed, because an installation this version cannot run is worse than a refusal. `--adopt` / `--adopt-file <json>` install over a legacy AIWF surface, and `--adopt` is refused before the first question on a project that already carries an `_aiwf` key. A successful install that really wrote something RUNS the self-check as its last step (`--no-selfcheck` skips it, out loud). |
| `generate.mjs` | The renderer and writer: plans everything first, writes only if nothing blocks. Template syntax is exactly what the shipped templates use (`{{config.<dotpath>}}`, `{{resolvedRoot}}`, `{{#each}}`, `{{^inverse}}`); an unresolvable path throws rather than rendering an empty string into a doctrine file. Also the home of **adopt mode** (the classification, the two-word resolution vocabulary and its adapters, the advisory superseded-legacy scan). Also a CLI for the scripted path: `node generate.mjs --answers-file <json> [--project-root <dir>] [--dry-run] [--confirm-remove-stale] [--adopt] [--adopt-file <json>] [--no-seeds] [--quiet] [--no-selfcheck]`, which finishes with the same self-check step. |
| `dialog.mjs` | The two primitives an operator dialog needs - a synchronous stdin prompt and a content preview - shared by setup's adopt dialog and the update CLI's conflict dialog, so the two cannot describe the same file differently. Imports nothing of either engine. |
| `test-setup.mjs` | The acceptance and idempotency suite. Runs the real entrypoint against throwaway projects under the system temp dir and leaves nothing behind: fresh install -> the self-check passes against it; re-run -> zero diff; edits outside the markers -> preserved; edits inside a managed artifact -> conflict, nothing overwritten; the conditional agent render in both directions; the stale-render removal gate; refusals (unsupported OS, schema-invalid answers) before a single write; foreign permission rules untouched and tombstones not forced back; the integrated self-check step - a green run reports PASS, `--no-selfcheck` says it skipped, and a self-check that cannot be run at all makes the install exit 1; and the full adopt matrix (identical/different/absent, keep-mine and take-new, an unanswered decision, an unconsumed address, `merge` refused, an already-installed project refused, the untouched pre-adopt blockers, and the advisory list). |

## The properties worth knowing

- **Plan, then write.** Any blocker is found before the first byte is written, so a blocked run
  leaves the project exactly as it was - no half-installed state.
- **No silent overwrite, ever.** A managed artifact carries two hashes (`upstream` = what the
  payload last rendered, `local` = what was last accepted). A hand edit (`actual != local`) is a
  conflict resolved by `/pnp:update`, never by an overwrite here. A file setup did not write is
  never taken over by accident - `--adopt` is the one deliberate way, and it decides per file, out
  loud. A DELETED artifact - or a marker region removed out of a live file - is the same
  conflict, not an invitation to recreate it: silently re-rendering it would also wipe an
  `override` record, undoing an operator decision without asking.
- **Adopt bootstraps ownership; it never takes it.** With `--adopt`, an unrecorded file whose
  content already equals the render is adopted clean and in silence (`local = upstream`,
  `override: false`); one that differs is an operator decision with exactly two words - `keep-mine`
  (nothing written, `local` = what is on disk, `upstream` = the render, `override: true`) or
  `take-new` (the render applied, recorded clean). `merge` is not offered: it belongs to
  `/pnp:update --resolve <key>`, which can reopen any adopted artifact afterwards. A decision nobody
  can answer stops the run with every address named and nothing written, a `--adopt-file` entry
  nobody asked about is refused by name, a project that already has an installation is refused
  outright, and adopt DELETES NOTHING - the superseded-legacy list it prints is advisory text.
- **The operator's zone is untouchable - byte for byte.** Text outside the `aiwf-core` markers in
  `CLAUDE.md`, an existing overrides document, foreign permission rules, and any `settings.json` key
  outside `permissions.ask` are read-only to this engine. `CLAUDE.md` is the one managed file that
  also holds the operator's own text, so every branch that writes it (append, re-render, adopt
  take-new) splices the existing bytes and renders only the region, in the line-ending convention
  that file already uses. Hashing stays LF-normalised - that is how a CRLF checkout avoids reading
  as an edit - but normalising what gets WRITTEN would rewrite every line around the markers.
- **Deleting is gated three times over.** A stale Claude agent file (left next to a role that became
  codex-hosted) is removed only when it is recorded as ours, its content still hashes to the render
  we recorded, AND the operator passed `--confirm-remove-stale`. A foreign or hand-edited file at
  that path blocks instead: the flag confirms removing the render setup reported, nothing else.
- **Memory seeds are printed, never written.** The memory store's format and location are
  machine-local and are not the plugin's to assume.
- **The self-check is a step, not a reminder.** A run that wrote something ends by running
  `scripts/selfcheck/aiwf-selfcheck.js` against the project. A red one makes the command exit 1
  while saying plainly that the files WERE written and nothing was rolled back; a self-check that
  cannot be started is also exit 1, because "could not check" is never reported as "checked". The
  shared contract lives in `scripts/selfcheck/run-selfcheck.mjs`.
