# skills/

The operator-facing commands ship here, one directory per command, each holding a
`SKILL.md` with an explicit `name:` frontmatter that yields `/pnp:<name>`.

Shipped: `loop`, `review`, `qa`, `qal`, `brief`, `mission`, `work`. Every one of them opens with
the same Step 0 contract - resolve the project root, read
`.claude/aiwf-native/aiwf.config.json`, stop toward `/pnp:setup` when it is missing - because a
skill in a plugin has no project context of its own.

Still to come: `setup`, `update`, `selfcheck`.
