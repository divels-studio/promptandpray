# skills/

The operator-facing commands ship here, one directory per command, each holding a
`SKILL.md` with an explicit `name:` frontmatter that yields `/pnp:<name>`.

Shipped: `loop`, `review`, `qa`, `qal`, `brief`, `mission`, `work`, `setup`, `update`, `selfcheck`.
Every one of them opens with the same Step 0 contract - resolve the project root, read
`.claude/aiwf-native/aiwf.config.json`, stop toward `/pnp:setup` when it is missing, and run the
version interlock (`scripts/update/aiwf-update.mjs --check`) - because a skill in a plugin has no
project context of its own. The documented exceptions: `setup` treats a MISSING config as the normal
fresh-install path (it is what creates it), and `update` + `selfcheck` are the two version-interlock
exceptions - the one that applies the pending migrations and the diagnostic you need most when
something is out of date cannot be the two commands that refuse to run.
