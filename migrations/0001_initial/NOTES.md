# 0001_initial (0.1.0)

The baseline. It carries **no operations** and is never executed: a fresh install already generates
the current state, and setup stamps the LAST manifest entry as `_aiwf.lastMigrationApplied` without
running anything.

It exists because the runner's invariants need a name for "this project is at 0.1.0":

- `lastMigrationApplied` must exist in the manifest - a stamp that names nothing would fail the very
  first `/pnp:update`;
- the last manifest entry's `targetPluginVersion` must equal the payload version, so
  "no unapplied migrations" and "installed == payload version" can never disagree.

Nothing to review here, and nothing for an operator to do.
