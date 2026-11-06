COVERED BY: operator word "пускай", 2026-11-06
Review the diff for ticket GATES-003 on branch main.

Class: code
Ticket: GATES-003

SCOPE / DIFF:
The working diff against HEAD 5eee86492354301b85f469d3b48883b568f8db92, reproduced by
`git diff -- scripts templates` from the repository root (4 files: scripts/engine/plan-gate.js,
scripts/selfcheck/aiwf-selfcheck.js, templates/briefs/planner.md, templates/doctrine/plan.md.tmpl).
The contract: dev/backlogs/active/GATES/tickets/GATES-003.md (Outcome, Scope C1-C4, Acceptance, Risk
threshold, Stop condition, Code Map) and dev/backlogs/active/GATES/DECISIONS.md D-04, D-11.
Note: the ticket's selfcheck pointers (:4871-4930, :4986, :5009-5081, :5278-5279, :5293, :5392)
predate GATES-001/002 (commits 4122b27, 2c1ad1d), which shifted the file by about +150 lines; the
same blocks now stand at ~:5017-5090 (PG_INDEX :5017), :5137, ~:5150-5330 (M57 :5313),
PG_CONTRACT_TOKENS :5463-5466, [plan-gate-tokens] :5479, the controls ~:5575-5610 (ctl-sbs-mask :5610).

CARRIED BLOCKERS
none - this is pass 1

EVIDENCE PACK (a selection made by the audited side - read past it, run your own probes):
- plan-gate.js: three tokens in the header; `SIDE_BY_SIDE_KEY` / `SIDE_BY_SIDE_PREFIX` /
  `SIDE_BY_SIDE_REF = /^[A-Z]{2,8}-\d{3}$/` (the grammar of aiwf-lib.js `PLAN_TICKET_FILE_RE`);
  `declaredSideBySide(model)` beside `declaredTicketCap` (column 0, the fence mask, split on ", ",
  two or more refs, no upper bound, trailing blanks trimmed); `mapPathKey` / `sharedMapPath`
  (equality, or containment in either direction, the longer path returned, the root '' contains
  all); in `examine` after the codemap-path-missing loop: malformed -> one problem, skip;
  unknown/duplicate -> one problem per line, skip; pairs of ONE line only, each shared path one
  problem, de-duplicated per token. `stampPlanFolder` unchanged.
- selfcheck: M57-M61 appended after M56 (M1-M56 and their exactly(...) sets untouched); FIX-002
  and src/two.js written in each case's `after` (pgSideBySide / pgTicketWithMap); five named-fault
  controls (ctl-sbs-malformed, -unknown, -shared, -contain, -mask); the three tokens in
  PG_CONTRACT_TOKENS. COO note: the containment control covers the "first entry contains the second"
  branch (M60); the symmetric branch has no case of its own.
- Templates: the planner brief's folder contract and plan.md.tmpl § Plan readiness review name the
  line and the check, with no plan or project name. The template reaches installations through
  GATES-005's migration 0037 (D-10) - not this ticket's.
- COO Verify at the hand-back (Portion 1, logs outside the repository): selfcheck exit 0
  (`==== 1666/1666 assertions passed ====`, `[plan-gate-tokens] ... 19 tokens`, the five ctl-sbs
  controls "FAIL as required"); spikes exit 0 (`checks: 478, failures: 0`); validate-payload exit 0;
  render dry-run (generate.mjs, example answers, scratch root) exit 0, the rendered
  doctrine/plan.md carries "Side by side:" once and no `{{`.
- Acceptance one-liners: `sidebyside-` count 6; "Side by side:" once in each template;
  `--check dev/backlogs/active/GATES` prints only `stamp-mismatch` (the folder gained records after
  its stamp - pre-existing, outside this ticket), no `sidebyside-` token; a scratch copy with
  `Side by side: GATES-001, GATES-002` prints four sidebyside-shared-path problems
  (aiwf-selfcheck.js, run-spikes.mjs, docs/LOOP.md, hooks/hooks.json); the Writer ran the
  unknown-ref, one-ref malformed, four-refs not malformed and containment rows on copies, each as
  expected; provenance grep empty.

PRODUCT BOUNDARY CHECKS:
- Payload stays generic: no origin-project names, no Cyrillic, no absolute paths (the provenance section of the self-check is the gate)
- A managed-artifact change ships as a migration + version bump, never silently
- Every operator gate that can be a native dialog is a native dialog

RISK THRESHOLD: block on: a folder that passed before refused with no `Side by side:` line in its
index; a problem token outside D-04's three, or a token name changed; the stamp written while a
side-by-side problem stands; a line inside a fenced block read; a containment missed, or reported
under the shorter path; a line refused for its number of refs above one; a pair reported for refs of
two different lines; the existing M-cases' sets changed; a named-fault control that cannot fail; a
path or project name in the payload. Note-only: message wording, the order of problems within the
new group.
STOP CONDITION: stop once every changed file is reviewed against the ticket's Acceptance and Risk
threshold and D-04; do not propose redesigns or the Deferred items of DECISIONS.md.
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
