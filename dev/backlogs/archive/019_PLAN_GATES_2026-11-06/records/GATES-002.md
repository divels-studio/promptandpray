# GATES-002 - Gate 1 passes a non-writer's write outside the project root

## What landed

`2c1ad1d` (code, Writer, `Refs: GATES-002`; 5 files, +139/-13):
- `scripts/engine/pretooluse-mutation-guard.js` - `projectRelative(projectDir, target)` (`path.resolve` +
  `path.relative`; `outside` = an absolute relative path or a first segment `..`; the root itself not
  outside), used by `mainSessionDecision` (`rel === '' || outside`, its old logic) and by the new
  `everyTargetOutside(toolInput, projectDir)` over `NON_WRITER_PATH_FIELDS = ['file_path',
  'notebook_path']`, own properties only: true only when at least one field is present and every
  present field is a non-empty string resolving outside. The non-writer branch passes through on it
  before the deny; the deny text, `targetPathOf`, the main session's decisions and Gate 3 unchanged.
  Header: "inside the project root".
- `scripts/selfcheck/aiwf-selfcheck.js` `sectionGate1Identity` - 13 rows (outside relative / absolute /
  NotebookEdit / the captured general-purpose payload -> passthrough; inside relative / absolute, the
  root `.`, `{}`, `""`, an array `tool_input`, the mixed payload, `notebook_path` 42 and `""` -> the
  deny, its text compared byte for byte) and two named-fault controls on hook copies
  (`g1-ctl-outside`, `g1-ctl-first`).
- `scripts/spike/run-spikes.mjs` `gate1Cases` - outside passthrough, inside deny, mixed deny; the Gate 1
  title.
- `docs/LOOP.md` § Enforcement of Writer-only writes and `hooks/hooks.json` - "inside the project root".

The live copy `D:\pnp-live` was refreshed to `2c1ad1d` after the commit.

## Decisions and deviations

- The passthrough also covers incomplete identity (`agent_id` without `agent_type`, or `agent_type`
  null): the same non-writer branch D-03 names.
- The passthrough is "no decision" (`lib.allowPassthrough()`): the harness's own permission rules
  still judge a write outside the repository.
- Known limit, by D-03: the path is judged lexically (no realpath), so a junction or symlink outside
  the root that points into it is judged by its outside form. The auditor named it as the residual
  limit, no fix required.
- The ticket's selfcheck and spike pointers into the Gate 3 rows and the spike title predated
  GATES-001's shift; the brief named the moved lines.

## Events

None.

## Verification (what actually ran)

COO, Portion 1, logs outside the repository (session scratchpad `verify-gates002/`):
- `node scripts/selfcheck/aiwf-selfcheck.js --plugin-root . --project-fixture .` exit 0,
  `==== 1656/1656 assertions passed ====`, both named-fault controls "FAIL as required";
- `node scripts/spike/run-spikes.mjs` exit 0, `checks: 478, failures: 0`;
- `node scripts/update/validate-payload.mjs --plugin-root .` exit 0, `valid: 36 migration(s) in
  D:\promptandpray, payload version 0.3.11`.
- The ticket's Acceptance one-liners (Bash, `CLAUDE_PROJECT_DIR` the repository root): the two outside
  payloads printed nothing; the inside, root, `{}`, mixed and `notebook_path` 42 payloads each printed
  the deny with `[AIWF-N3 gate 1: non-writer subagents cannot write]`; `may not write to the repo` hit
  at `pretooluse-mutation-guard.js:436`; "inside the project root" once in each of the three files;
  the provenance grep empty; no probe file on disk.
- Narrowed-test grep over the added lines (`.skip`, `.only`, `todo`, `skip(`): no hit.
- Fact-check gate (`/pnp:review` Step 2b, one Explore agent on sonnet): `CLAIMS: total=33 verified=31
  false=1 unverifiable=1` - the selfcheck comment "this file stays ASCII" was false (the file carries
  `§`), the spike comment about the reference hook unverifiable; both reworded by the Writer before
  the pass (comments only, `node --check` exit 0, no suite re-run).
- Auditor: Codex code pass 1 (gpt-6-sol / xhigh, cold, session `01a1b0d1-7789-77b1-a8b1-87a38e79a184`),
  covered by the operator word "puskaj" (2026-11-06): `pass`, no findings; residual limit named:
  lexical path resolution. `tokens used 57,143`. The review brief: `GATES-002-review-brief.md` beside
  this record.

## Remaining debt

None.

## Diff review

- Read whole at the hand-back (5 payload files) and the fact-check micro-round's two comment lines.
- Per acceptance criterion, the defect each proof sees: the outside passthrough missing -> a `deny` on
  the two outside payloads; an inside, root, empty, mixed or non-string target passing -> the Gate 1
  tag absent; the deny text moved -> no hit for `may not write to the repo`; a description not
  updated -> a file with no "inside the project root"; a vacuous row or control -> selfcheck/spikes
  exit != 0; Cyrillic -> a provenance hit.
- Notes: none beyond § Decisions and deviations.

## Scratch

- `.aiwf/GATES-002-diff-review.md` - folded into § Diff review, § Verification and § Decisions above,
  then deleted.
- `.aiwf/GATES-002-review-brief.txt` - moved verbatim to `records/GATES-002-review-brief.md`, then
  deleted.
- `.aiwf/last-review-session.GATES-002.txt` - its one line (the session id) stands in § Verification
  above, then deleted.
- `.aiwf/checkpoint.md` and `.aiwf/route-state.json` (cleared to `{}`) stay.

## Closing checklist

- the operator's own run on a real input: n/a - no product UI; the hook's behaviour is proven by the
  selfcheck and spikes rows through the real hook process (overrides § Test policy);
- the diff review folded in above: yes;
- the ticket's finding line on ROADMAP § GATES (the Gate 1 line, harvest F41) marked `done 2c1ad1d`;
- out-of-scope findings: none;
- scratch: § Scratch above;
- the next ticket: GATES-003 can run in this session (COO session at 300,000 tokens).

## Measurements

| correction rounds | COO session at close | source |
|---|---|---|
| 0 | 300,000 tokens (30% of 1,000,000) | `~/.claude/ctx/b1055be9-1bbc-46c6-bbe2-399302ca2b5f.pct` and `.size` |
