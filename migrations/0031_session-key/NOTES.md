# 0031_session-key

**The Codex session-state file is keyed per ticket: a ticket's pass and a plan's readiness pass on one
working tree keep their own resume ids.**

## What changes

- `scripts/native/ps/codex-review.ps1`, `scripts/native/sh/codex-review.sh`,
  `scripts/native/ps/codex-qa.ps1`, `scripts/native/sh/codex-qa.sh`: each wrapper reads a KEY from
  the brief on stdin - the first `Ticket: <REF>` line, else the last segment of the first
  `PLAN: <folder>` line (trailing separators stripped, split on `/` and `\`), else no key - and
  records and resumes the session in `<scratchDir>/last-review-session.<key>.txt` (QA:
  `last-qa-session.<key>.txt`), the same way on a cold run and on a bare resume. A brief with
  neither line keeps the unkeyed `last-review-session.txt` / `last-qa-session.txt`, exactly as
  before. A key must be 1-64 characters of `A-Za-z0-9_.-` starting with a letter or digit; a
  `Ticket:` or `PLAN:` line that fails the rule is a refusal (exit 2) naming the line, before any
  state read and any engine start - never a fall-back to another state file. The fixed brief file paths the skills write (`review-brief.txt`, `qa-brief.txt`),
  the run header and footer lines, the argv and the read-only posture do not change.
- The doctrine (in the tree before this release): `docs/CODEX_REVIEW_QA_RECIPE.md` § the state file
  is per role and per ticket, `docs/WORKFLOW.md` § Branch policy, and the review, qa and plan
  skills - the review and QA brief templates there carry the `Ticket: <REF>` line.

## What this migration does

- One `note` (`session-key-0-3-6`): `/pnp:update` prints it with the CHANGELOG block of 0.3.6 and stamps the version - the two bookkeeping fields of the config (`installedPluginVersion`, `lastMigrationApplied`), plus the config's `$schema` pointer when it is stale, are the only writes. The wrappers are payload, run from the plugin root.

## What it leaves alone

Every config key you set (the `$schema` pointer is refreshed when stale), every managed region, the ask-ruleset, `hooks/hooks.json`, an existing unkeyed
session-state file (still read by a brief with no `Ticket:` or `PLAN:` line) and every operator-owned
file.

## Superseded local rules

None.
