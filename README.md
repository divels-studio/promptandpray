# PromptAndPray

PromptAndPray (`pnp`) is a Claude Code plugin that packages a disciplined
four-role working loop: an Orchestrator/COO who plans and arbitrates, a Writer
that is the only role writing implementation code in reviewed cycles, and
adversarial Reviewer + QA gates. Operator gates - commit, push, Writer dispatch
- are native Yes/No dialogs and PreToolUse hooks, so protection does not depend
on a model remembering the rules.

> Status: **v0.1.0, pre-release, private.** This repository contains the plugin
> skeleton, the enforcement hooks (Gate 1 + the route-state guard, Gate 2), and the
> ported payload: seven skills (`/pnp:loop`, `review`, `qa`, `qal`, `brief`,
> `mission`, `work`), the PowerShell role resolver and Codex wrappers, the generic
> doctrine under `docs/`, the setup templates under `templates/`, and the self-check
> engine.
>
> Not here yet: the interview, the config schema, the generate/update engines and the
> migration runner - so nothing installs itself into a project yet. The full README -
> positioning, install, quickstart and FAQ - is written in a later phase (P5).
