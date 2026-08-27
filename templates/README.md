# templates/

Rendered-into-the-project artifacts: the managed CLAUDE.md region, agent files,
the project overrides document, roles, the permission ask-ruleset, memory seeds.

The placeholder syntax is exactly what `scripts/setup/generate.mjs` implements and nothing more:
`{{config.<dotpath>}}`, the render-time `{{resolvedRoot}}` (never render `config.project.root` raw -
its default is the literal string `"auto"`), `{{#each <path>}}...{{/each}}` with `{{this}}`, and the
inverse block `{{^<path>}}...{{/<path>}}`. An unresolvable path is a render ERROR, not an empty
string.

`memory-seeds/` holds one lesson per file. `/pnp:setup` PRINTS them for the operator's own memory
tool at the end of a run and never writes them into any store: the store's format and location are
machine-local and are not the plugin's to assume. Seeds marked `[R]` are deliberate reinforcements
of a payload doctrine rule with a history of being violated - they point at the doctrine section
rather than restating it.
