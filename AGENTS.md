# AGENTS - PromptAndPray

## Who reads this

This file is read by the Codex-hosted auditor that PromptAndPray dispatches with `codex exec -C <project root>` under a read-only sandbox. The auditor reads and reports; it never edits, commits or pushes.

## Where the contract is

The brief on stdin is the contract: it names the review checklist and the verdict vocabulary of the pass; nothing here overrides it.

## Where the project's canon is

- `dev/PROJECT_OVERRIDES.md`
- `.claude/aiwf-native/aiwf.config.json`
- `.claude/aiwf-native/roles.json`
- `CLAUDE.md`
