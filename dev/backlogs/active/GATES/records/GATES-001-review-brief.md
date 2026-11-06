COVERED BY: operator word "da", 2026-11-06
Review the diff for ticket GATES-001 on branch main.

Class: code
Ticket: GATES-001

SCOPE / DIFF:
The working diff against HEAD ba3f666eeb147a9687cd21b97c9f5f799586f70f, reproduced by
`git diff -- README.md docs hooks scripts templates` from the repository root (9 files:
scripts/engine/pretooluse-git-verb-guard.js, scripts/engine/aiwf-lib.js, scripts/selfcheck/aiwf-selfcheck.js,
scripts/spike/run-spikes.mjs, hooks/hooks.json, docs/LOOP.md, docs/OPERATOR_PROTOCOL.md,
templates/ORCHESTRATOR.md.tmpl, README.md). `dev/backlogs/ROADMAP.md` also differs (two Status lines,
the COO's bookkeeping) and is OUT of scope.
The contract: dev/backlogs/active/GATES/tickets/GATES-001.md (Outcome, Scope A1-A6, Acceptance, Risk
threshold, Stop condition, Code Map) and dev/backlogs/active/GATES/DECISIONS.md D-01, D-02, D-11.

CARRIED BLOCKERS
none - this is pass 1

EVIDENCE PACK (a selection made by the audited side - read past it, run your own probes):
- The guard: `HINT_FOREIGN_TREE` and `HABITS.gitDashCapitalC` beside `HINT_DIRECTORY` / `gitDashC`;
  `HABIT_DIRECTORY_CHANGERS` gains Push-Location, Pop-Location, popd; new `HABIT_OPENERS` /
  `HABIT_DOT_SOURCE` and `habitReadThrough(words)`; `habitOf` applies the read-through to every
  segment's words before taking `first`; shape (6) = first word in `HABIT_GIT_PROGRAMS` (folded on
  PowerShell only) and `words[1].startsWith('-C')` (never folded). `habitSegmentsOf` and
  `habitWordsOf` unchanged; the ask-reason text unchanged.
- The ruleset `templates/settings.ask-ruleset.json` and `ownedAskRules` are untouched (D-01: the six
  `git -C <projectRoot>` ask rules stay; `git grep -c -F "git -C <projectRoot>" --
  templates/settings.ask-ruleset.json` = 7, the six rules plus the comment).
- Selfcheck/spike rows that pinned a `-C` form as silent or ASK now pin the habit deny; one ASK
  control `echo $(git -C /p push)` keeps the deeper-`-C` ask branch covered.
- One PASS row OFF the ticket's A3/A4 list flipped and was repaired before this pass (the ticket's
  stop condition; COO decision): the `SomeFutureShell` dialect control `npm test |& tail -5` (expected
  silent) is now denied, because in the PowerShell dialect `|` pipes and D-02 reads the call operator
  `&` through (a real pipe into tail). The control now uses `echo X & cd scripts` (silent: one
  segment under PowerShell), and a new row pins `npm test |& tail -5` under SomeFutureShell as the
  habit deny - aiwf-selfcheck.js:1933-1946, run-spikes.mjs:556-557. Judge whether that reading is
  right and whether any other row or real command flips silently.
- COO Verify at the hand-back (Portion 1, logs outside the repository): validate-payload exit 0;
  render dry-run of the templates (generate.mjs, example answers, scratch root) exit 0; after the
  repair selfcheck exit 0 (`==== 1634/1634 assertions passed ====`), spikes exit 0
  (`checks: 456, failures: 0`). The ticket's Acceptance one-liners all ran as specified with no
  "broken" output.

PRODUCT BOUNDARY CHECKS:
- Payload stays generic: no origin-project names, no Cyrillic, no absolute paths (the provenance section of the self-check is the gate)
- A managed-artifact change ships as a migration + version bump, never silently
- Every operator gate that can be a native dialog is a native dialog

RISK THRESHOLD: block on: a fail direction changed - a shape the guard denied now passes, or Gate 4
judges a non-`-C` form differently (dev/PROJECT_OVERRIDES.md § Architecture direction); an ask rule
removed from the ruleset or from `ownedAskRules` (D-01); a form inside quotes now judged, or the
PowerShell `&` made a separator (D-02); a row flipped other than A3/A4's, unreported; a non-ASCII
byte or an absolute path in the payload; a correctness defect in the read-through (a legitimate
command denied that D-01/D-02 do not name, or a named form missed). Note-only: comment and hint
wording beyond D-01's text. The template change ships through GATES-005's migration 0037 (D-10) -
not a blocker of this ticket.
STOP CONDITION: stop once every changed file is reviewed against the ticket's Acceptance and Risk
threshold and D-01/D-02; do not propose redesigns or the Deferred items of DECISIONS.md.
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
