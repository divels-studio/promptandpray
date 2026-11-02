# docs/

The generic doctrine shipped as plugin payload. Project-specific direction never lives here -
it lives in the generated project overrides document (`paths.overridesDoc`).

- `WORKFLOW.md` - the map: the stage files every rule of the loop stands in (rendered into the
  project from `templates/ORCHESTRATOR.md.tmpl` and `templates/doctrine/`), the step that reads
  each, and reproducibility.
- `LOOP.md` - the role hosts, the enforcement hooks (Gate 1-4 and the habit guard), the commit gate
  and the honest security model.
- `REVIEW_CHECKLIST.md` - a pointer stub: the verdict rules are the review stage file.
- `CODEX_REVIEW_QA_RECIPE.md` - how the Codex-hosted review roles are invoked, and why each locked
  flag is locked.
- `QA_BROWSER_INVESTIGATION.md` - the conclusion the QA/QAL split rests on.
- `OPERATOR_PROTOCOL.md` - the operator's entry page: the three doors and what the gates guarantee.
- `SESSION_BRIEF_RECIPE.md` - the recipe `/pnp:brief` applies.
- `READINESS_CLASSES.md` - the blocker classes a readiness pass keeps finding, one question per
  class; the readiness brief of `/pnp:plan` cites them, and the auditor names one per finding.

Development of the plugin itself lives in `dev/` at the repo root - not payload, not shipped, and
outside the provenance scan. A project installs the plugin from the GitHub marketplace
(`/plugin marketplace add divels-studio/promptandpray`, `/plugin install pnp@promptandpray`;
later `/plugin marketplace update` + `/plugin update pnp@promptandpray`, `/reload-plugins` -
which a running session needs to leave the version it started on - then `/pnp:update`). A local
checkout of the repository is the same path with `<path-to-this-repo>` as the marketplace.
