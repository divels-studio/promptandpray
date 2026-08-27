# scripts/setup/

The installer engine behind `/pnp:setup`. No dependencies, Node stdlib only.

| file | what it is |
|---|---|
| `validate-config.mjs` | A subset JSON-Schema interpreter driven by `schema/aiwf.config.schema.json`. It supports exactly the keyword subset that schema uses and **throws on any keyword it does not implement** - an unimplemented keyword silently ignored would turn a real constraint into decoration. Also a CLI: `node validate-config.mjs <config.json> [--schema <file>]` -> exit 0 valid / 1 invalid / 2 could not run. |
| `interview.mjs` | The question flow (project identity, OS channel, operator language and nicknames, roles, VERIFY commands, E2E surface, paths, product-boundary lines). Defaults come from the schema, or from the installed config on a re-run, so a hand-edited value survives a re-interview. `--answers-file <json>` skips the questions for CI. Refuses `os` other than `windows` fail-closed. |
| `generate.mjs` | The renderer and writer: plans everything first, writes only if nothing blocks. Template syntax is exactly what the shipped templates use (`{{config.<dotpath>}}`, `{{resolvedRoot}}`, `{{#each}}`, `{{^inverse}}`); an unresolvable path throws rather than rendering an empty string into a doctrine file. Also a CLI for the scripted path: `node generate.mjs --answers-file <json> [--project-root <dir>] [--dry-run] [--confirm-remove-stale] [--no-seeds]`. |
| `test-setup.mjs` | The acceptance and idempotency suite. Runs the real entrypoint against throwaway projects under the system temp dir and leaves nothing behind: fresh install -> the self-check passes against it; re-run -> zero diff; edits outside the markers -> preserved; edits inside a managed artifact -> conflict, nothing overwritten; the conditional agent render in both directions; the stale-render removal gate; refusals (unsupported OS, schema-invalid answers) before a single write; foreign permission rules untouched and tombstones not forced back. |

## The properties worth knowing

- **Plan, then write.** Any blocker is found before the first byte is written, so a blocked run
  leaves the project exactly as it was - no half-installed state.
- **No silent overwrite, ever.** A managed artifact carries two hashes (`upstream` = what the
  payload last rendered, `local` = what was last accepted). A hand edit (`actual != local`) is a
  conflict resolved by `/pnp:update`, never by an overwrite here. A file setup did not write is
  never adopted. A DELETED artifact - or a marker region removed out of a live file - is the same
  conflict, not an invitation to recreate it: silently re-rendering it would also wipe an
  `override` record, undoing an operator decision without asking.
- **The operator's zone is untouchable.** Text outside the `aiwf-core` markers in `CLAUDE.md`, an
  existing overrides document, foreign permission rules, and any `settings.json` key outside
  `permissions.ask` are read-only to this engine.
- **Deleting is gated three times over.** A stale Claude agent file (left next to a role that became
  codex-hosted) is removed only when it is recorded as ours, its content still hashes to the render
  we recorded, AND the operator passed `--confirm-remove-stale`. A foreign or hand-edited file at
  that path blocks instead: the flag confirms removing the render setup reported, nothing else.
- **Memory seeds are printed, never written.** The memory store's format and location are
  machine-local and are not the plugin's to assume.
