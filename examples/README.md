# examples/

`example-project/` - the CI fixture that runs the full setup -> version bump ->
update -> selfcheck cycle, and doubles as the README quickstart.

It holds four things, all of them data: `answers.json` (a complete non-interactive
answers file), `seed/` (the host project as it looks BEFORE the install, with its
own CLAUDE.md prose, its own permission rule and its own source file), `bump/`
(the simulated next release, targeting 0.3.0: manifest entry, a migration with one
operation of each of the four types plus a second `rerender-managed-region` over an
artifact the operator never touched - the one that is applied without a dialog -
and the schema property that migration introduces), and `README.md` (the
quickstart, listing exactly the commands the cycle runs).

`scripts/ci/run-example-cycle.mjs` drives it. Nothing under `examples/` is ever
written to at run time: the payload and the seed project are COPIED into a work
directory outside the repository, and the cycle asserts the repository is
byte-identical when it finishes.
