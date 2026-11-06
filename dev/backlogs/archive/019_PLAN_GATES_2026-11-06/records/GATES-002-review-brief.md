COVERED BY: operator word "puskaj", 2026-11-06
Review the diff for ticket GATES-002 on branch main.

Class: code
Ticket: GATES-002

SCOPE / DIFF:
The working diff against HEAD c4ff1c1fb904d0b59a1322d5b34b7227f0825b89, reproduced by
`git diff -- docs hooks scripts` from the repository root (5 files:
scripts/engine/pretooluse-mutation-guard.js, scripts/selfcheck/aiwf-selfcheck.js,
scripts/spike/run-spikes.mjs, docs/LOOP.md, hooks/hooks.json).
The contract: dev/backlogs/active/GATES/tickets/GATES-002.md (Outcome, Scope B1-B4, Acceptance, Risk
threshold, Stop condition, Code Map) and dev/backlogs/active/GATES/DECISIONS.md D-03, D-11.
Note: the ticket's selfcheck pointers ":2176-2191" / ":2185" and spike ":631" / ":635" predate
GATES-001 (commit 4122b27), which shifted those files; the main-session / Gate 3 rows are now in
`sectionGate3` (selfcheck ~:2300 onward) and the spike Gate 1 title is :674.

CARRIED BLOCKERS
none - this is pass 1

EVIDENCE PACK (a selection made by the audited side - read past it, run your own probes):
- Guard: new `projectRelative(projectDir, target)` (`path.resolve` + `path.relative`; `outside` =
  absolute rel or first segment `..`; the root itself not outside), used by `mainSessionDecision`
  (which keeps `rel === '' || outside`, its old logic) and by the new `everyTargetOutside(toolInput,
  projectDir)` over `NON_WRITER_PATH_FIELDS = ['file_path','notebook_path']`, own properties only;
  true only when >= 1 field present and EVERY present field is a non-empty string resolving outside.
  The non-writer branch calls it before the deny and returns `lib.allowPassthrough()`; the deny text
  is unchanged; `targetPathOf` unchanged; the route state is not read on this branch.
- The passthrough is "no decision": the harness's own permission rules still judge the write.
- Known limit by D-03: no realpath, so an outside path that is a junction/symlink into the repo is
  judged by its lexical form. D-03 and the ticket's stop condition name exactly path.resolve +
  path.relative; judge whether this limit is stated honestly, not whether to add realpath.
- The passthrough also covers incomplete identity (agent_id without agent_type, or agent_type null):
  the same non-writer branch D-03 names.
- Selfcheck `sectionGate1Identity`: 13 rows (outside rel/abs/NotebookEdit/captured payload ->
  passthrough; inside rel/abs, root ".", {}, "", array tool_input, mixed, notebook_path 42, notebook_path
  "" -> the deny, text compared byte for byte) and two named-fault controls on hook copies
  (`g1-ctl-outside`: helper forced outside -> g1-in red; `g1-ctl-first`: only file_path read ->
  g1-mixed red). Spikes `gate1Cases`: outside passthrough, inside deny, mixed deny.
- COO Verify at the hand-back (Portion 1, logs outside the repository): selfcheck exit 0
  (`==== 1656/1656 assertions passed ====`, both controls "FAIL as required"); spikes exit 0
  (`checks: 478, failures: 0`); validate-payload exit 0. The ticket's Acceptance one-liners ran with
  no "broken" output (outside rows empty, inside/root/{}/mixed/42 rows carry the Gate 1 tag, the deny
  text grep hits :436, "inside the project root" once in each of the three files, provenance empty).

PRODUCT BOUNDARY CHECKS:
- Payload stays generic: no origin-project names, no Cyrillic, no absolute paths (the provenance section of the self-check is the gate)
- A managed-artifact change ships as a migration + version bump, never silently
- Every operator gate that can be a native dialog is a native dialog

RISK THRESHOLD: block on: a non-writer write INSIDE the root passes, through any path field, or an
unreadable / unresolvable / unparseable target passes (a fail-direction flip); `targetPathOf`
changed; the deny text changed by a byte; a main-session or Gate 3 decision changed; Gate 3's route
state read for a non-writer; any schema change; a path or project name in the payload; a
named-fault control that cannot fail. Note-only: comment and description wording.
STOP CONDITION: stop once every changed file is reviewed against the ticket's Acceptance and Risk
threshold and D-03; do not propose redesigns, realpath, or the Deferred items of DECISIONS.md.
BUDGET TARGET: keep the brief dense and return ALL material blockers in ONE round - aim for a
single round. (This is a throughput target only; it does NOT change the authority minimums -
the correction-round cap and the `review.plan.passes` ceiling are unchanged.)

OUTPUT CONTRACT (single round - return ALL material blockers at once; a later round may not
raise a blocker that was already visible):
  First line: exactly one of `pass` / `pass-with-notes` / `fail`
  (per the review stage file at D:/promptandpray/.claude/aiwf-native/doctrine/review.md,
  read IN FULL before the pass).
    - `pass`            = no blocker at or above the risk threshold; nothing left to note.
    - `pass-with-notes` = acceptable now; only narrow, local, non-blocking notes remain.
    - `fail`            = at least one blocker at/above threshold. List blockers first (each with
                          file:line and why it blocks), then non-blocking notes, then the exact
                          next action.
  Do not fix anything - you are read-only. Report only.
