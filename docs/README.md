# docs/

The generic doctrine shipped as plugin payload. Project-specific direction never lives here -
it lives in the generated project overrides document (`paths.overridesDoc`).

- `WORKFLOW.md` - the active authority: roles, routing R1/R2/R3, the ticket-brief contract, the
  planning lock, plan readiness, the operator-interaction guards, commit/push authority.
- `LOOP.md` - the one-page mapping of that workflow onto native Claude Code (roles, the three
  gates, the honest security model).
- `REVIEW_CHECKLIST.md` - the Reviewer/QA verdict rules and defect classes.
- `CODEX_REVIEW_QA_RECIPE.md` - how the Codex-hosted review roles are invoked, and why each locked
  flag is locked.
- `QA_BROWSER_INVESTIGATION.md` - the conclusion the QA/QAL split rests on.
- `OPERATOR_PROTOCOL.md` - the operator's entry page: the three doors and what the gates guarantee.
- `SESSION_BRIEF_RECIPE.md` - the recipe `/pnp:brief` applies.

Development of the plugin itself lives in `dev/` at the repo root - not payload, not shipped, and
outside the provenance scan. A project installs the plugin from this repo as a local marketplace
(`/plugin marketplace add <path-to-this-repo>`, `/plugin install pnp@promptandpray`; later
`/plugin marketplace update` + `/plugin update pnp@promptandpray`, then `/pnp:update`).
