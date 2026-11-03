# AIWF Workflow

The map of the loop's doctrine. Every rule of the loop stands in exactly one stage file, rendered
into your project as a managed artifact - not in this payload document. Your project's **overrides
document** (identity + hard rules; its path is `paths.overridesDoc` in `aiwf.config.json`) stands
beside them.

Durable knowledge lives in Git. Live process state (delegation, review rounds, correction
cycles) lives in the in-session orchestration of the main Claude Code session - not in
Markdown state files and not in an external runtime.

The model is a light four-role loop: **Orchestrator -> Implementer -> Code Reviewer -> QA**, run
**natively inside Claude Code**. A project may run it lighter than the generic defaults
(`ticket.md` § Loop shape and its overrides).

## The stage files

| stage file (rendered into the project) | what it carries | read IN FULL by |
|---|---|---|
| `.claude/aiwf-native/ORCHESTRATOR.md` - the core | the COO's own standing rules; roles; COO owns broad scans; the operator's gates and how the COO speaks to the operator; the operator-interaction guards; verifying failure claims; out-of-scope failures found during work; the status / release docs policy; branch policy; escalation and the arbiter; commit & push authority | every entry door, at its first step |
| `.claude/aiwf-native/doctrine/work.md` | routes R1/R2/R3 and COO routing; routing mapped to native; tests | `/pnp:work` Step 1 |
| `.claude/aiwf-native/doctrine/ticket.md` | the ticket brief contract and proof-surface feasibility; the COO write boundary; role boundaries; loop shape and its overrides; fail aggregation; the ticket boundary; the ticket's record and its closeout; the archive of a finished plan and the roadmap writes | `/pnp:work` when the task routes R2/R3; `/pnp:mission` before the dispatch; `/pnp:review`, `/pnp:qa` and `/pnp:qal` at their first step |
| `.claude/aiwf-native/doctrine/plan.md` | the planning lock; plan readiness review; durable development history - the plan and its folder; the ledger | `/pnp:plan` Step 0.5 |
| `.claude/aiwf-native/doctrine/review.md` | the Reviewer/QA verdict rules: plan readiness, the review dimensions by defect class, QA, fail aggregation, the verdict | the auditor - `/pnp:review` and `/pnp:qa` hand it over, the reviewer and qa agents name it |

Each door's read carries its suppression dual: skipped when `git diff <HEAD at the read> -- <paths>`
is empty, read again after a context compaction - the reason the stage files are rendered into the
project rather than read from the plugin root, where no diff can see them.

The templates are `templates/ORCHESTRATOR.md.tmpl` and `templates/doctrine/<stage>.md.tmpl`:
`/pnp:setup` renders them, `/pnp:update` re-renders them. Each stage file ends with a project
additions block, carried across every re-render: a local rule stands there, beside the rule it
modifies, opening with that rule's heading.

The rest of the payload doctrine: `docs/LOOP.md` - the role hosts, the enforcement hooks, the commit
gate and the honest security model; `docs/OPERATOR_PROTOCOL.md` - the operator's entry page;
`docs/CODEX_REVIEW_QA_RECIPE.md` - the Codex-hosted review roles.

## Reproducibility

The loop is reproducible from Git plus the plugin payload - no external runtime required:

- **Writer:** `.claude/agents/writer.md`, rendered by `/pnp:setup` from
  `templates/agents/writer.md.tmpl`.
- **Reviewer / QA:** engine-neutral, the host per role in `.claude/aiwf-native/roles.json`
  (rendered from `aiwf.config.json.roles.*`), resolved by `scripts/native/ps/aiwf-roles.ps1`
  (`-Role <r> -RolesPath <p> -AsJson`) or `scripts/native/sh/aiwf-roles.sh` (`--role <r>
  --roles-path <p> --as-json`); a missing config file falls back to the factory
  `claude`/`opus`/`high` record, and the reviewer-only `-Class` / `--class` flag resolves one
  audit-table row, adding `passes`. The Codex path needs the Codex CLI (recipe:
  `docs/CODEX_REVIEW_QA_RECIPE.md`). Hosts: `docs/LOOP.md` § Role hosts; boundaries: `ticket.md`
  § Role boundaries.
- **Enforcement:** Gate 1-4 through the plugin's `hooks/hooks.json` (three hook files, four
  responsibilities) plus the `ask` rules merged into `.claude/settings.json` from
  `templates/settings.ask-ruleset.json` (`docs/LOOP.md` § Enforcement of Writer-only writes).
- **The doctrine:** the core and the four stage files above, rendered from
  `templates/ORCHESTRATOR.md.tmpl` and `templates/doctrine/`. Regression: the selfcheck engine under
  `scripts/selfcheck/`.

No adapter framework, no lifecycle wrapper, no runtime state in Git.
