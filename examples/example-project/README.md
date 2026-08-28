# example-project - the full cycle, as data you can run

A throwaway host project and a simulated version bump, both checked in. Together they drive the
whole product once: **install -> version bump -> update (with a real conflict) -> self-check**.

Nothing here is written to at run time. Everything runs against COPIES in a work directory outside
the repository; the cycle asserts that the repository is byte-identical afterwards.

## What is in here

| path | what it is |
|------|------------|
| `answers.json` | a complete, non-interactive answers file for `/pnp:setup` (Windows channel, both review roles claude-hosted on tier aliases, QAL off). It is also a valid config body: the self-check validates it against `schema/aiwf.config.schema.json`. |
| `answers-linux.json` | the same answers on the `linux` OS channel, and nothing else changed. It is what the ubuntu and macos CI legs run the cycle with: the channel decides which wrapper paths get RENDERED into the project, and rendering is pure file writing, so this file runs on any host - including Windows. |
| `seed/` | the host project BEFORE the install: its own `CLAUDE.md` prose, its own `.claude/settings.json` with one foreign permission rule, and `src/hello.mjs` - the target of the configured VERIFY command. The install must append beside all three, never over them. |
| `bump/` | the simulated `0.1.0 -> 0.2.0` release: the manifest entry (`bump.json`), the migration itself (`0002_example-bump/`, one operation of each of the four types), and the schema property that migration introduces (`schema-key.json`). |

## The cycle

This is exactly the sequence `scripts/ci/run-example-cycle.mjs` runs, and exactly the sequence CI
runs on every push. Substitute the four paths and you can run it by hand:

- `<repo>` - this repository
- `<work>` - any empty directory OUTSIDE it
- `<payload>` - `<work>/payload-0.1.0`, a copy of `<repo>`
- `<payload2>` - `<work>/payload-0.2.0`, that copy with `bump/` overlaid onto it
- `<project>` - `<work>/project`, a copy of `seed/`
- `<answers>` - `<repo>/examples/example-project/answers.json`, or the file passed to `--answers`
  (CI's POSIX legs pass `answers-linux.json`)

(Quote any path that contains a space.)

**1. Install into the seed project.** The install runs the self-check itself and prints
`self-check: PASS`; your own `CLAUDE.md` prose stays above the managed region and your own
permission rule stays in `settings.json`.

```
node <payload>/scripts/setup/interview.mjs --answers-file <answers> --plugin-root <payload> --project-root <project> --no-seeds
```

exit 0

**2. Validate the bumped payload.** Copy `<payload>` to `<payload2>`, set its `plugin.json` version
to `0.2.0`, append `bump/bump.json` to `migrations/index.json`, copy `bump/0002_example-bump/` into
`migrations/`, and splice `bump/schema-key.json` into the schema. Then:

```
node <payload2>/scripts/update/validate-payload.mjs --plugin-root <payload2>
```

exit 0

**3. The version interlock.** Non-zero is the point: it is what every `/pnp:*` skill branches on.

```
node <payload2>/scripts/update/aiwf-update.mjs --check --plugin-root <payload2> --project-root <project>
```

exit 1 - one migration pending

**4. Edit the managed region of `<project>/CLAUDE.md` by hand,** so the update meets a real conflict.

**5. Preview.** A dry run never prompts and never writes: it stops at the first decision it would
need and names its address.

```
node <payload2>/scripts/update/aiwf-update.mjs --dry-run --plugin-root <payload2> --project-root <project>
```

exit 1 - and the project is byte-identical afterwards

**6. Apply.** Write `<work>/resolutions.json` first - one record per address:

```json
{
  "0002_example-bump/0/enforcement.dispatchGate": { "kind": "answer", "value": false },
  "0002_example-bump/1/CLAUDE.md#aiwf-core": { "kind": "conflict", "resolution": "keep-mine" }
}
```

```
node <payload2>/scripts/update/aiwf-update.mjs --apply --plugin-root <payload2> --project-root <project> --resolution-file <work>/resolutions.json
```

exit 0 - your edit survives, the artifact is now held (`override: true`), the other three operations
applied, `CHANGES_0.1.0-to-0.2.0.md` appears at the project root, and the update runs the self-check
itself

**7. Leave the override.** `--resolve` reopens one artifact at any time; no version bump is needed.
With `<work>/resolve-take-new.json` = `{ "CLAUDE.md#aiwf-core": { "kind": "conflict", "resolution": "take-new" } }`:

```
node <payload2>/scripts/update/aiwf-update.mjs --resolve CLAUDE.md#aiwf-core --plugin-root <payload2> --project-root <project> --resolution-file <work>/resolve-take-new.json
```

exit 0 - the payload render is back and `override` is false again

**8. The self-check, on its own.**

```
node <payload2>/scripts/selfcheck/aiwf-selfcheck.js --plugin-root <payload2> --project-fixture <project>
```

exit 0

## Or just run it

```
node scripts/ci/run-example-cycle.mjs
```

`--work-dir <dir>` picks the directory, `--answers <file>` picks the answers file (default
`answers.json`; CI's ubuntu and macos legs pass `examples/example-project/answers-linux.json`),
`--keep` leaves it behind to inspect, `--quiet` prints only failures and the summary. Exit 0 = every
check passed, 1 = at least one failed, 2 = it could not start.
