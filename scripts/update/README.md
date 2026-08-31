# scripts/update/

The update engine behind `/pnp:update`.

| file | what it is |
|---|---|
| `validate-payload.mjs` | the shared, fail-closed validator of `migrations/` (manifest + every ops.json). BOTH the runner and setup call it before their first write; also a CLI (`--plugin-root`), which is how the self-check exercises it. |
| `migrate.mjs` | the engine: preflight invariants, per-operation planning, the two-hash conflict state machine, the write-ahead journal + recovery, the durable stage, and the CHANGES assembly. Importable; no CLI of its own. |
| `aiwf-update.mjs` | the CLI: `--check` (the version interlock every skill runs in Step 0), `--dry-run`, `--apply`, `--resolve <key>`, plus `--quiet` and `--no-selfcheck`. Exit 0 = success / already current, 1 = blocked, 2 = could not start. The two modes that WRITE (`--apply` that really applied, and `--resolve`) run the self-check as their last step; a red or unrunnable one is exit 1 with the writes left standing. |
| `test-update.mjs` | the acceptance suite: real entrypoints, temp projects, real payload copies with a bumped version, crash recovery proven by really killing the process, and the integrated self-check step in all four of its states (PASS, skipped, unrunnable, RED after a successful apply). |

Two properties everything here exists to protect:

- **nothing of yours is overwritten.** A conflict is raised exactly when there is operator content
  to lose: the project edited the artifact, the artifact is gone, or a held artifact was edited
  again; the operator then picks take-new / keep-mine / merge, and a held artifact is never
  re-applied by a later update. A payload change to an artifact nobody edited is not a conflict -
  it is applied without a dialog and listed in the CHANGES report.
- **deterministic recovery.** The accepted result of each operation is staged before the journal
  records it, so a process killed at any write boundary resumes into the same end state without
  asking the same question twice. `PNP_UPDATE_CRASH_AT="<migration>/<opIndex>/<boundary>"` is the
  test-only injection point (production-inert) the suite uses to prove it.
