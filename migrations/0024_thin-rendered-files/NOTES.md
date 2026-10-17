# 0024_thin-rendered-files

**The rendered files go thin: project data, the role's own contract, and a pointer to the payload
document that holds each rule.**

## What changes

- The managed `CLAUDE.md` region, `.claude/aiwf-native/ORCHESTRATOR.md`, `.claude/agents/writer.md`,
  `.claude/agents/reviewer.md`, `.claude/agents/qa.md` and `AGENTS.md` stop restating doctrine. What
  stays is the project data (name, paths, roles, model pins, the Gate 2 mode, the product boundary
  checks), each role's behaviour contract, and one pointer per dropped rule cluster to its section in
  the payload `docs/` - so a rule fix reaches an installation with the plugin, with no re-render.
- Every whole-file Markdown artifact ends with an empty project additions block
  (`<!-- project additions -->` ... `<!-- /project additions -->`). Text you write between those two
  lines is carried over by every re-render; everything else in a managed file is overwritten.
- The Writer agent no longer inlines a test routing of its own: it points at the `§ Test policy`
  section of your overrides document, the one home of that routing in your project.

## What this migration does

Six `rerender-managed-region` operations, nothing else: the `aiwf-core` region of `CLAUDE.md`,
`ORCHESTRATOR.md`, the Writer agent and `AGENTS.md` on every installation; the Reviewer and QA agents
only where the installation has them (`ifRecorded: true` - a codex-hosted role has no agent file).
No `note`: the CHANGELOG block of this version is what an update prints.

## Superseded local rules

None retired by name. An edit you made to one of these files - or a file you held through the old
keep-mine resolution - is overwritten by this update: move the text you want to keep into the file's
project additions block or into your overrides document BEFORE running `/pnp:update`.
