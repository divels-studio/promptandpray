# schema/

`aiwf.config.schema.json` - JSON Schema (draft 2020-12) for the generated project config, and the
**single authority** for its shape. The config's own `$schema` field points back at this file, and
`/pnp:setup` writes nothing until the config it assembled validates.

It is interpreted by `scripts/setup/validate-config.mjs`, which supports exactly the keyword subset
used here and throws on anything else - so a constraint added to this file without teaching the
interpreter fails loudly instead of being silently ignored. The self-check runs the validator at its
CLI entrypoint in both directions: a healthy config is accepted, and the mistakes an interview can
produce (unknown OS channel, empty project name, a claude-hosted role pinned to a full model id, a
scratch directory moved away from `.aiwf`) are rejected.

Two constraints in here are worth reading before changing anything:

- **`roles.<reviewer|qa>.model` is conditional on the engine.** A claude-hosted role takes a tier
  alias only (`fable|opus|sonnet|haiku`), because it is dispatched through the Agent tool's `model`
  override; a codex-hosted role takes any non-empty engine atom.
- **`effort` is deliberately not an enum.** Both consumers accept a free string and neither
  publishes a closed set: a claude host renders it into agent frontmatter, a codex host passes it as
  `model_reasoning_effort` to an external engine that owns its own vocabulary. The role resolver
  states the same contract and rejects only a non-string or an empty one.
