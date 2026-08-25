# scripts/selfcheck/

`aiwf-selfcheck.js` - the self-check engine. It separates two things and never confuses them:

- **payload invariants** - the two enforcement hooks EXECUTED as the harness launches them, the
  role resolver EXECUTED at its real entrypoint, and the Codex wrappers checked statically for
  their locked flags, their stdin-only prompt delivery and their ASCII-only source;
- **project-layer invariants** - the owned/suppressed ask-rule bookkeeping, the rendered
  artifacts (roles.json, agent frontmatter) agreeing with `aiwf.config.json`, and the version
  bookkeeping.

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

Wiring it into setup/update and into CI happens in later phases; this is the engine only.
