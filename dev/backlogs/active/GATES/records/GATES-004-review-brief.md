COVERED BY: operator word "ok", 2026-11-06
Review the diff for ticket GATES-004 on branch main.

Class: code
Ticket: GATES-004

SCOPE / DIFF:
The working diff against HEAD 03e1309f949d9fa9872bc96b36760220b2aa341b - reproduce it with
`git diff` plus the one untracked new file `scripts/native/codex-capture.mjs` (read it whole; it is not
staged, so `git diff` does not show it). Changed: scripts/native/ps/codex-review.ps1,
scripts/native/ps/codex-qa.ps1, scripts/native/sh/codex-review.sh, scripts/native/sh/codex-qa.sh,
scripts/selfcheck/aiwf-selfcheck.js, docs/CODEX_REVIEW_QA_RECIPE.md, skills/review/SKILL.md,
skills/qa/SKILL.md, skills/plan/SKILL.md, scripts/native/README.md, and the plan writes
dev/backlogs/active/GATES/DECISIONS.md (D-12) and dev/backlogs/active/GATES/tickets/GATES-004.md
(§ Amendment D-12).

The contract is the ticket `dev/backlogs/active/GATES/tickets/GATES-004.md` - its frozen sections AND its
`## Amendment D-12 (2026-11-06, after D0)` - with DECISIONS D-05..D-12 and § Deferred
(`dev/backlogs/active/GATES/DECISIONS.md`). Read both in full.

What happened before this pass: the ticket's D0 step 1 STOPPED it as designed - a 447-byte UTF-8 emitter
under Windows PowerShell 5.1 `*>` came back as a 1796-byte UTF-16LE log (mojibake, LF->CRLF, a
NativeCommandError record). D-09 left the fallback to be chosen then; the COO chose D-12 (a node capture
helper for the PS channel only; the sh channel keeps `> "$log" 2>&1`). Judge D-12's implementation against
D-12 as written; if you think D-12 itself is the wrong design, say so as a disputed design decision
(separately from defects), not as a defect.

CARRIED BLOCKERS
none - this is pass 1

EVIDENCE PACK (a selection made by the audited side - read past it):
- Helper: scripts/native/codex-capture.mjs - resolveCodex :75-100, capture :108-139 (spawn :117,
  exclusive log :112), --print :102-106, argv parsing :141-150.
- PS review wrapper (codex-review.ps1): run files from :240 ($env:TEMP fallback), -o in $codexArgs :298
  and $resumeArgs :315, warnings to stderr :402 and :455, helper path :518, collision refusal :526,
  invocation :533, --print :539, tokens parse :549, capacity only on non-zero exit :553, log line :575,
  exit :581.
- sh review wrapper (codex-review.sh): run files from :295, -o :331 and :348, invocation :528
  (`> "$LOG_FILE" 2>&1`), stdout cat :533, awk tokens parse :538, capacity :539, log line :565,
  exit :571.
- QA twins mirror both (codex-qa.ps1 / codex-qa.sh), incl. the sh `record_session_id` `||` -> `if`
  change so RECORDED_ID is set.
- Selfcheck: STDIN_CAPTURE / LAST_MESSAGE_PAIR flag locks; ps-/sh- stream-purity, stdout-verdict,
  last-message and their controls; ps-/sh-exec-*-bytes; the npm-shim stub layout in runPsWrapperWithStub;
  section 5d output contract (outProbesFor, outVerdict, outRun, psOutControls, shOutControls - W-/Q- probes
  with 13 named-fault controls per wrapper per channel); section 5e capture helper (captureFindings,
  captureControls: cap-static/resolve/exe/unresolvable/exclusive/bytes).
- COO VERIFY at the hand-back (Portion 1): `node scripts/selfcheck/aiwf-selfcheck.js --plugin-root .
  --project-fixture .` exit 0, `==== 1756/1756 assertions passed ====` (cap-bytes: log 447 bytes equal;
  ctl-cap-bytes FAIL as required, 453 bytes, first difference at byte 14); `node
  scripts/update/validate-payload.mjs --plugin-root .` exit 0. The selfcheck's PowerShell host is `pwsh`
  first (findPwsh, aiwf-selfcheck.js:208-215), so its executed PS probes ran on PowerShell 7 on this
  machine, not 5.1.
- Writer deviations the COO accepted (judge them): the helper's `--print <file>` mode (the wrapper's
  stdout must be native bytes for a caller's `> round.txt`); the capacity line only on a non-zero exit
  (codex echoes the brief into the log); the exit line no longer opens with a line break; an existing log
  refused with exit 2; the tokens figure printed as written (`12,345`); `WARNING: ...` on stderr.
- Fact-check gate before this pass (one sonnet scan over the full diff): 261 claims, 248 verified, 2 false
  (both in the ticket's Amendment text, fixed before this pass), 11 unverifiable - closed by COO runs where
  possible (PS 5.1.26100.9444; 5.1 passes the helper's `--`; `Get-Command codex -All` lists codex.ps1
  first). Still UNVERIFIED and judged by you: the helper comment that an interrupt reaches codex directly
  (codex-capture.mjs:122-127), the D-12 rationale that a .NET Process cannot launch a .cmd without cmd.exe
  argument parsing, and "on a resume the tokens figure is the session's running total" (D-07's reading).
- Unchanged by contract: codex-qal.ps1 / .sh; the launch prefix skills/review/SKILL.md:354-368; the
  session-state save/clear path; the roles resolver.

PRODUCT BOUNDARY CHECKS:
- Payload stays generic: no origin-project names, no Cyrillic, no absolute paths (the provenance section of the self-check is the gate)
- A managed-artifact change ships as a migration + version bump, never silently
- Every operator gate that can be a native dialog is a native dialog
(The migration and the bump for this plan are GATES-005's, by DECISIONS D-10 - not this ticket's.)

RISK THRESHOLD: blocks - the wrapper's stdout carrying anything but the -o bytes (a warning included); a
Start-Process invocation; a log or the -o file inside the repository, or one shared by two runs; a lock or
a new write path on the session-state file; a byte between codex and the log (added, dropped or reordered
within one stream); an exit code other than codex's (the pre-engine refusals still 2); the read-only
posture or the stdin-only prompt changed (the flag locks); the .ps1 / .sh mirror broken (flags and lines;
the capture mechanism is the one documented difference); a non-ASCII byte in a .ps1 or in the helper, a CR
in a .sh or in the helper; an increment computed or stored; QAL or a state file changed; a parse pattern
not written from D0's run (the capacity text is D-06's recorded one, declared unmeasured); a shell string
anywhere in the launch; the helper writing to the repository; a .cmd spawned; a selfcheck probe that
cannot fail (a vacuous control). Notes only: comment wording, the timestamp format of the log name.
STOP CONDITION: stop once every changed file and the new helper are reviewed against the ticket's
Acceptance and Risk threshold, frozen and amended; do not propose redesigns beyond naming a disputed
design decision.
BUDGET TARGET: keep the reply dense and return ALL material blockers in ONE round - aim for a single
round. (This is a throughput target only; it does NOT change the authority minimums.)

OUTPUT CONTRACT (single round - return ALL material blockers at once; a later round may not raise a
blocker that was already visible):
  First line: exactly one of `pass` / `pass-with-notes` / `fail`
  (per the review stage file at D:/promptandpray/.claude/aiwf-native/doctrine/review.md, read IN FULL
  before the pass).
    - `pass`            = no blocker at or above the risk threshold; nothing left to note.
    - `pass-with-notes` = acceptable now; only narrow, local, non-blocking notes remain.
    - `fail`            = at least one blocker at/above threshold. List blockers first (each with
                          file:line and why it blocks), then non-blocking notes, then the exact next
                          action.
  Do not fix anything - you are read-only. Report only.
