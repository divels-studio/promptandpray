# 0029_info-contract

**The plan-readiness blocker contract names INFO explicitly, so a pass stops filing wording as a
BLOCKER.**

## What changes

- `templates/briefs/readiness-codex.md` § THE BLOCKER CONTRACT gains one explicit line - wording,
  formatting and `file:line` precision are INFO, never BLOCKER - the one test for a row (executed
  exactly as written, would a ticket fail, land wrong or leave a decision open?) and six INFO
  examples. Every readiness pass measured so far returned INFO: 0.
- `docs/REVIEW_CHECKLIST.md` § Plan readiness carries the same test in one sentence and points at
  the brief for the examples.

## What this migration does

- One `note` (`info-contract-0-3-4`): `/pnp:update` prints it with the CHANGELOG block of 0.3.4 and
  stamps the version. No file of the installation is written: the brief is payload, read at every
  pass.

## What it leaves alone

Every config key, every managed region, the ask-ruleset and every operator-owned file.

## Superseded local rules

None.
