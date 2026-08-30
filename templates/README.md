# templates/

Rendered-into-the-project artifacts: the managed CLAUDE.md region, agent files,
the project overrides document, roles, the permission ask-ruleset, memory seeds.

The placeholder syntax is exactly what `scripts/setup/generate.mjs` implements and nothing more:
`{{config.<dotpath>}}`, the render-time `{{resolvedRoot}}` (never render `config.project.root` raw -
its default is the literal string `"auto"`), `{{overridesDocPath}}`, `{{wrappers.<key>}}`,
`{{#each <path>}}...{{/each}}` with `{{this}}`, and the inverse block `{{^<path>}}...{{/<path>}}`.
An unresolvable path is a render ERROR, not an empty string. Both engines build the context through
one exported function (`templateContext()`), so setup and update cannot render the same template
into different bytes.

`{{overridesDocPath}}` is the project's overrides document as ONE absolute path in the native
separator of `config.os`. Never compose that path in a template out of `{{resolvedRoot}}` and
`{{config.paths.overridesDoc}}`: that joins a Windows root to a POSIX separator and ships a
mixed-slash path.

A template may open with an HTML comment starting `<!-- TEMPLATE CONTRACT` - notes for whoever
edits the template (why the file is conditional, which placeholder is render-time). The engine
**strips that block, and only that block, out of the render**: it is addressed to the template's
editor and has no reader in the rendered artifact. Placeholders inside it are never substituted,
so the contract can name a placeholder literally.

`{{wrappers.*}}` is the OS channel, COMPUTED from `config.os` by `wrapperContext()` (both engines
import the same function): `dir`, `ext`, `shell`, and the payload-relative path of each wrapper -
`roles`, `review`, `qa`, `qal`. A template names a wrapper by ROLE and never by OS, because the
engine has no conditional block - the branch is taken in code, once.

`memory-seeds/` holds one lesson per file. `/pnp:setup` PRINTS them for the operator's own memory
tool at the end of a run and never writes them into any store: the store's format and location are
machine-local and are not the plugin's to assume. Seeds marked `[R]` are deliberate reinforcements
of a payload doctrine rule with a history of being violated - they point at the doctrine section
rather than restating it.
