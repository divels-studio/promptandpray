# example-project - the full cycle, as data you can run

A throwaway host project and a simulated version bump, both checked in. Together they drive the
whole product once: **install -> version bump -> update (every rendered artifact overwritten, the
project's own additions block carried, one config key answered) -> self-check**.

Nothing here is written to at run time. Everything runs against COPIES in a work directory outside
the repository; the cycle asserts that the repository is byte-identical afterwards.

## What is in here

| path | what it is |
|------|------------|
| `answers.json` | a complete, non-interactive answers file for `/pnp:setup` (Windows channel, both review roles claude-hosted on tier aliases, QAL off). It is also a valid config body: the self-check validates it against `schema/aiwf.config.schema.json`. |
| `answers-linux.json` | the same answers on the `linux` OS channel, and nothing else changed. It is what the ubuntu and macos CI legs run the cycle with: the channel decides which wrapper paths get RENDERED into the project, and rendering is pure file writing, so this file runs on any host - including Windows. |
| `seed/` | the host project BEFORE the install: its own `CLAUDE.md` prose, its own `.claude/settings.json` with one foreign permission rule, and `src/hello.mjs` - the target of the configured VERIFY command. The install must append beside all three, never over them. |
| `bump/` | the simulated next release, as a template the harness numbers: its slug (`bump.json`), the migration itself with no number and no version (`example-bump/`, one operation of each of the four types plus a second `rerender-managed-region` over `.claude/agents/writer.md`, where the cycle keeps a project additions block), and the schema property that migration introduces (`schema-key.json`). `scripts/ci/example-bump.mjs` builds it into a payload copy as migration `<NNNN>_example-bump` (that payload's manifest length + 1), targeting that payload's next minor version. |

## The cycle

This is exactly the sequence `scripts/ci/run-example-cycle.mjs` runs, and exactly the sequence CI
runs on every push. Substitute the four paths and you can run it by hand:

- `<repo>` - this repository
- `<work>` - any empty directory OUTSIDE it
- `<payload>` - `<work>/payload-shipped`, a copy of `<repo>`
- `<payload2>` - `<work>/payload-bumped`, a second copy of `<payload>`, into which step 2 builds `bump/`
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

**2. Build and validate the bumped payload.** Copy `<payload>` to `<payload2>`, then build the
simulated release into it. The builder numbers the migration `<NNNN>_example-bump` (the manifest
length + 1), raises `plugin.json` to the payload's next minor version, appends the manifest entry,
copies `bump/example-bump/` into `migrations/<NNNN>_example-bump/` with both values written into its
`ops.json`, and splices `bump/schema-key.json` into the schema. Nothing under `examples/` is written.

```
node <repo>/scripts/ci/example-bump.mjs --payload <payload2> --example <repo>/examples/example-project
```

exit 0 - it prints `migration: <NNNN>_example-bump` and `targetPluginVersion: <target>`, the two
values the later steps use. Then append a line to `<payload2>/templates/agents/writer.md.tmpl` so that
artifact's render really changes, and validate:

```
node <payload2>/scripts/update/validate-payload.mjs --plugin-root <payload2>
```

exit 0

**3. The version interlock.** Non-zero is the point: it is what every `/pnp:*` skill branches on.

```
node <payload2>/scripts/update/aiwf-update.mjs --check --plugin-root <payload2> --project-root <project>
```

exit 1 - one migration pending

**4. Put your own text where an update meets it.** Write a line into the empty project additions
block at the end of `<project>/.claude/agents/writer.md` - the one place in a rendered file whose
text survives every update (a second block beside it would be malformed and stop the update):

```
<!-- project additions -->
This project's own rule for its Writer, kept across every update.
<!-- /project additions -->
```

and, to see the other half of the rule, edit a line INSIDE the managed region of
`<project>/CLAUDE.md`.

**5. Preview.** A dry run never prompts and never writes. It prints the CHANGELOG blocks between the
installed and the target version, then every operation it would apply, and lists the new config
key's question as `would ask: <NNNN>_example-bump/0/enforcement.exampleToggle`.

```
node <payload2>/scripts/update/aiwf-update.mjs --dry-run --plugin-root <payload2> --project-root <project>
```

exit 0 - and the project is byte-identical afterwards

**6. Apply.** Write `<work>/resolutions.json` first - the answer to that one question, where
`<NNNN>_example-bump` is the migration id step 2 printed:

```json
{
  "<NNNN>_example-bump/0/enforcement.exampleToggle": { "kind": "answer", "value": false }
}
```

One record for six operations: the value of a new config key is the only thing an update asks.
Everything it renders it overwrites.

```
node <payload2>/scripts/update/aiwf-update.mjs --apply --plugin-root <payload2> --project-root <project> --resolution-file <work>/resolutions.json
```

exit 0 - the CHANGELOG blocks are printed first; your edit inside the `CLAUDE.md` region is replaced
by the payload render while your prose outside the markers stays; the Writer agent takes the payload
version and keeps your project additions block verbatim ("the payload render written (project
additions carried)"); the note's text is printed; the other operations applied; and the update runs
the self-check itself

**7. The self-check, on its own.**

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
