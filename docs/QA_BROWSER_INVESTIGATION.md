# QA browser investigation - the load-bearing conclusion

A full sandbox/flag matrix was run against a Codex-launched browser. The conclusion the rest of the
doctrine rests on:

- **A Codex-launched browser cannot run under any restrictive OS sandbox.** Both `read-only` and
  `workspace-write` block the browser at launch *and* at CDP-attach. Only `danger-full-access` (and
  the broader `--dangerously-bypass-approvals-and-sandbox`, which additionally strips the approval
  mechanism) run one at all.
- Therefore **QA is an artifact judge, not a browser driver**: the browser lives in the project's
  test runner, outside the review engine, and QA reads the artifacts it produced under
  `--sandbox read-only`.
- **QAL is the deliberate, operator-gated exception**: it trades the sandbox away
  (`--sandbox danger-full-access`, the minimal non-bypass flag that works) to get a live browser.
  Its containment is cwd/profile hygiene plus the operator gate - never an OS guarantee.

Contracts and brief templates: the `/pnp:qa` and `/pnp:qal` skills; flag rationale:
`docs/CODEX_REVIEW_QA_RECIPE.md`.
