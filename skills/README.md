# skills/

The operator-facing commands ship here, one directory per command, each holding a
`SKILL.md` with an explicit `name:` frontmatter that yields `/pnp:<name>`.

Shipped: `loop`, `review`, `qa`, `qal`, `brief`, `mission`, `work`, `setup`, `selfcheck`. Every one
of them opens with the same Step 0 contract - resolve the project root, read
`.claude/aiwf-native/aiwf.config.json`, stop toward `/pnp:setup` when it is missing - because a
skill in a plugin has no project context of its own. Two documented exceptions to the last part:
`setup` treats a MISSING config as the normal fresh-install path (it is what creates it), and
`selfcheck` is a version-interlock exception - a diagnostic that refuses to run when something is
out of date is a diagnostic you cannot use when you need it.

Still to come: `update`.
