# scripts/ci/

| file | what it is |
|---|---|
| `run-example-cycle.mjs` | The end-to-end gate: install -> simulated version bump -> update (with a real conflict) -> self-check, run against the committed data in `examples/example-project/`. Nine steps, an assertion at each. `[--work-dir <dir>] [--keep] [--quiet]`; exit 0 = every check passed, 1 = at least one failed, 2 = could not start. |

Two properties this directory exists to hold:

- **The commands are not restated here.** `DOCUMENTED_COMMANDS` inside the driver is the single
  source for what the cycle runs AND for what `examples/example-project/README.md` shows the
  reader; the self-check compares those two sets in both directions, so a quickstart that documents
  one thing while CI runs another fails a gate instead of misleading someone.
- **Nothing is written inside the repository.** The payload and the seed project are COPIED into a
  work directory outside it, and the cycle hashes the repository's raw bytes before and after itself
  and asserts it is byte-identical.
- **The work directory is judged before it is created, and removed by ownership.** It is refused
  (exit 2, nothing created) when it is the repository, inside it, an ancestor of it, reachable into
  it through a symlink or junction, not a directory, not empty, or when its parent does not exist -
  because this directory is deleted when the run ends, and a path judged after the fact is a path
  already lost. A directory the run created is removed whole; a directory you supplied keeps its
  identity, and only the entries the run created inside it are removed and named. The self-check
  spawns this driver with each of those bad paths and requires exit 2 with nothing created.

`.github/workflows/ci.yml` runs this driver alongside the payload validator, both acceptance
suites, the hook spikes and the self-check.
