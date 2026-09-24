# schema/

`aiwf.config.schema.json` - JSON Schema (draft 2020-12) for the generated project config, and the
**single authority** for its shape. The config's own `$schema` field points back at this file, and
`/pnp:setup` writes nothing until the config it assembled validates.

It is interpreted by `scripts/setup/validate-config.mjs`, which supports exactly the keyword subset
used here and throws on anything else - so a constraint added to this file without teaching the
interpreter fails loudly instead of being silently ignored. The self-check runs the validator at its
CLI entrypoint in both directions: a healthy config is accepted (a claude-hosted Reviewer on an exact
model id among them), and the mistakes an interview can produce (unknown OS channel, empty project
name, a scratch directory moved away from `.aiwf`) are rejected.

Two constraints in here are worth reading before changing anything:

- **A claude-hosted `roles.<reviewer|qa>.model` is a tier alias or an exact model id.** A tier alias
  (`fable|opus|sonnet|haiku`) is passed as the Agent tool's `model` at dispatch; an exact id (e.g.
  `claude-opus-5-5`) is not passed at all, so the pin in the rendered agent's frontmatter applies -
  the Writer's pattern. A codex-hosted role takes any non-empty engine atom. One rule sits OUTSIDE
  this schema because it compares two fields: a claude-hosted review row shares the ONE reviewer
  agent file, so it takes a tier alias or exactly `roles.reviewer.model` (a tier alias when the
  Reviewer is codex-hosted and the file carries `fable`). That is `claudePinErrors` in
  `scripts/setup/role-rules.mjs`, and setup, the update engine and `/pnp:roles` all call it before
  their first write.
- **`effort` is deliberately not an enum.** Both consumers accept a free string and neither
  publishes a closed set: a claude host renders it into agent frontmatter, a codex host passes it as
  `model_reasoning_effort` to an external engine that owns its own vocabulary. The role resolver
  states the same contract and rejects only a non-string or an empty one.
