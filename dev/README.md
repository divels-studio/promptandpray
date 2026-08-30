# dev/ - where the plugin develops itself

This directory is the plugin's own development zone. It is NOT payload: nothing under `dev/` is
shipped as a plugin component, the provenance scan of the self-check skips it by name, and it may
carry things the payload never may (the operator's language, machine-local paths, plan history).

## How a development session runs

- Start Claude Code **from the repo root** with the hot working copy as the plugin:
  `claude --plugin-dir <repo-root>`. You develop the thing you are running.
- Enter with `/pnp:mission`. The active mission is whatever `dev/backlogs/active/PLAN_*.md` matches
  the branch; the skill reconstructs state from the PLAN, memory and git and then waits for the
  operator's word. New tickets are announced and wait for a word too.
- The repo is also self-installed (`.claude/aiwf-native/`, `.claude/agents/`, `.claude/settings.json`,
  root `CLAUDE.md`) so the gates and roles apply to the plugin's own work. The self-install config
  points `paths.plansDir` at `dev/backlogs` and `paths.overridesDoc` at `dev/PROJECT_OVERRIDES.md`;
  the payload defaults (`docs/...`) would collide with the payload itself.

## Plans

- `dev/backlogs/active/` - open plans; `dev/backlogs/archive/` - finished ones (and a pointer to
  where the extraction history lives).

## The payload is code

Every change under `skills/`, `docs/`, `templates/`, `scripts/`, `schema/`, `hooks/`, `migrations/`,
`examples/` or `.claude-plugin/` is **R2** - it goes through the Writer and a Reviewer pass, never
directly from the main session. Nothing is deleted from `docs/` without a migration. The payload
stays generic: no origin-project names, no Cyrillic, no absolute paths - the provenance section of
the self-check enforces that, with negative controls.

## VERIFY (run from the repo root, every ticket)

```
node scripts/update/validate-payload.mjs --plugin-root .
node scripts/setup/test-setup.mjs
node scripts/update/test-update.mjs
node scripts/ci/run-example-cycle.mjs
node scripts/ci/run-example-cycle.mjs --answers examples/example-project/answers-linux.json
node scripts/selfcheck/aiwf-selfcheck.js --plugin-root . --project-fixture .   # the real self-install, not a synthetic fixture
node scripts/spike/run-spikes.mjs
claude plugin validate .
git grep -nP "[\x{0400}-\x{04FF}]" -- docs skills templates scripts schema hooks migrations   # must print nothing (by code point; a byte-range class also matches em-dashes)
```

## Release

A release is: `version` bump in `.claude-plugin/plugin.json` + a migration under `migrations/` for
every managed artifact that changed + a `CHANGELOG.md` block + a git tag (the tag and the push are
separate operator words). A managed-artifact change never ships silently.

## How a project consumes the plugin

A consumer project installs the plugin from this repo as a **local marketplace**
(`.claude-plugin/marketplace.json`, `source: "./"`), at project scope:

```
/plugin marketplace add <path-to-this-repo>
/plugin install pnp@promptandpray
/pnp:setup
```

The install is a snapshot copy. Claude Code picks up a new version **only when `version` in
`plugin.json` changes**:

```
/plugin marketplace update
/plugin update pnp@promptandpray
/pnp:update
```

Project scope matters: a consumer's installed `pnp` must not be active inside this repo, where the
hot copy is loaded through `--plugin-dir` - two copies of the same plugin is the one setup nothing
here is designed for.
