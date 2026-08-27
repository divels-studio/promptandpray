# scripts/update/

The update engine behind `/pnp:update`.

| file | what it is |
|---|---|
| `validate-payload.mjs` | the shared, fail-closed validator of `migrations/` (manifest + every ops.json). BOTH the runner and setup call it before their first write; also a CLI (`--plugin-root`), which is how the self-check exercises it. |
| `migrate.mjs` | the engine: preflight invariants, per-operation planning, the two-hash conflict state machine, the write-ahead journal + recovery, the durable stage, and the CHANGES assembly. Importable; no CLI of its own. |
| `aiwf-update.mjs` | the CLI: `--check` (the version interlock every skill runs in Step 0), `--dry-run`, `--apply`, `--resolve <key>`. Exit 0 = success / already current, 1 = blocked, 2 = could not start. |
| `test-update.mjs` | the acceptance suite: real entrypoints, temp projects, real payload copies with a bumped version, and crash recovery proven by really killing the process. |

Two properties everything here exists to protect:

- **no silent overwrite.** A conflict is raised when EITHER the project edited an artifact or the
  payload changed it; the operator picks take-new / keep-mine / merge, and a held artifact is never
  re-applied by a later update.
- **deterministic recovery.** The accepted result of each operation is staged before the journal
  records it, so a process killed at any write boundary resumes into the same end state without
  asking the same question twice. `PNP_UPDATE_CRASH_AT="<migration>/<opIndex>/<boundary>"` is the
  test-only injection point (production-inert) the suite uses to prove it.
