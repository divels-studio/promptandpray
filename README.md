# PromptAndPray

PromptAndPray (`pnp`) is a Claude Code plugin that packages a disciplined
four-role working loop: an Orchestrator/COO who plans and arbitrates, a Writer
that is the only role writing implementation code in reviewed cycles, and
adversarial Reviewer + QA gates. Operator gates - commit, push, Writer dispatch
- are native Yes/No dialogs and PreToolUse hooks, so protection does not depend
on a model remembering the rules.

> Status: **v0.1.0, pre-release, private.** This repository currently contains
> the plugin skeleton and the two enforcement hooks (Gate 1, Gate 2). The full
> README - positioning, install, quickstart and FAQ - is written in a later
> phase (P5).
