# AGENTS - PromptAndPray

## Who reads this

This file is read by the Codex-hosted auditor that PromptAndPray dispatches with `codex exec -C <project root>` under a read-only sandbox. The auditor reads and reports; it never edits, commits or pushes.

## Where the contract is

The brief is the contract - the wrapper reads it from the file its `-BriefFile` / `--brief-file` flag names (stdin is the fallback) and hands it to the engine; it names the review stage file and the verdict vocabulary of the pass, and nothing here overrides it.

## Where the project's canon is

- `dev/PROJECT_OVERRIDES.md` - the project's identity, hard rules and product truth
- `.claude/aiwf-native/ORCHESTRATOR.md` and `.claude/aiwf-native/doctrine/` (`work.md`, `ticket.md`, `plan.md`, `review.md`) - the rendered doctrine; the brief names the stage file a pass reads
- `.claude/aiwf-native/aiwf.config.json`
- `.claude/aiwf-native/roles.json`
- `CLAUDE.md`

<!-- project additions -->
<!-- /project additions -->
