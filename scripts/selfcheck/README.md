# scripts/selfcheck/

`aiwf-selfcheck.js` - the self-check engine. It separates two things and never confuses them:

- **payload invariants** - the two enforcement hooks EXECUTED as the harness launches them, the
  role resolver EXECUTED at its real entrypoint, the Codex wrappers checked statically for
  their locked flags, their stdin-only prompt delivery and their ASCII-only source, and the
  EXAMPLE FIXTURE (`examples/example-project/`, its cycle driver and the CI workflow, compared
  against each other in both directions so committed data cannot rot unnoticed);
- **project-layer invariants** - the owned/suppressed ask-rule bookkeeping, the rendered
  artifacts (roles.json, agent frontmatter) agreeing with `aiwf.config.json`, and the version
  bookkeeping.

`run-selfcheck.mjs` - the shared step that makes `/pnp:setup` and `/pnp:update` run the engine
above themselves, instead of telling an agent to. One module, so the spawn, the exit-code contract
and the wording cannot drift between the three CLIs that finish a write.

```
node scripts/selfcheck/aiwf-selfcheck.js [--plugin-root <dir>] [--project-fixture <dir>]
```

`--project-fixture` may point at a real installation or at an empty/absent directory, in which
case a synthetic TEST fixture is written there. When the fixture is authored by the run, its
checks prove the checker works rather than that an install is healthy - so the run says so and
skips the self-confirming version comparison.

The NEGATIVE CONTROLS section then synthesises a **separate** fixture of its own - never a copy of
whatever `--project-fixture` pointed at, which may be a real project - sabotages it one way per
project-layer check, and requires each check to actually FAIL. Controls target checks by a stable
id, so none of them silently stops targeting anything when a fixture value changes. Checks with no
control are named individually with the reason, and a check this run could not exercise is
reported as a `[NOTE]` - never counted as a pass. Exit 0 = all assertions held; 1 = at least one
failed; 2 = the run could not start.

The EXAMPLE FIXTURE section carries its own controls in the same shape: they sabotage a COPY of the
payload one way per assertion and require each to fail. Every one of those checks is phrased so it
still holds when `--plugin-root` points at a payload copy that already carries a fixture migration
- which is exactly what the acceptance suites and the example cycle do.

Where it runs: `/pnp:setup` and `/pnp:update` run it themselves as their last step (see
`run-selfcheck.mjs`), `scripts/ci/run-example-cycle.mjs` runs it against the project it built, and
`.github/workflows/ci.yml` runs it against the payload on every push.
