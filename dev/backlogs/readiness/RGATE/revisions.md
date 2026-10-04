# PLAN_RGATE - revisions

## r0 -> r1 (2026-10-02, after Step 2a ledger + Step 2c scan, before the fact-check)

Inputs: ledger.md (44 rows), consequence-scan.md (39 rows), the claude-code-guide answer on
PreToolUse deny for `Agent` (generic decision contract, no Agent-specific statement, ask observed
live in Gate 2's header, deny not).

- r1 - D5: plan pass recognised by the class flag OR a column-0 `Class: plan` brief line; the
  wrappers pass every brief through the checker (single source of the decision, `--plan-class` flag).
  Scan 1, 2, 3, 7.
- r2 - D6 / 5(b)/(k): all five lines at column 0, the class line exactly `Class: plan`. Scan 7, 27;
  ledger 18.
- r3 - checker: TICKETS alphabet = Gate 2's TICKET_LINE; `refRegex`/`escapeRe` move to aiwf-lib.js.
  Scan 11, 12; ledger 19.
- r4 - hash over LF-normalised UTF-8 text, compared lowercase. Scan 13; ledger 22, 23.
- r5 - table cells: `\|` unescaped after split; lines split on `\n`, trailing `\r` dropped. Ledger 20.
- r6 - `scan-open-row` names the file line, not the `#` cell. Ledger 21.
- r7 - CLI reads stdin with `lib.readStdin()`. Ledger 17.
- r8 - Gate 2 plan branch: lazy `require('./plan-gate')`; no CLAUDE_PROJECT_DIR -> ask. Scan 9;
  ledger 25, 26.
- r9 - PS: root resolved before Set-Location for every class; refusal on `-not $? -or
  $LASTEXITCODE -ne 0`. Ledger 6, 8.
- r10 - tests: W probes on the codex-fixture stub runners; W3 with an explicit resume id; W5-W7,
  M21-M24, G5, G6 added; control copies keep the engine path; ids in check names. Scan 28; ledger
  6, 13, 29, 31, 32, 34, 44.
- r11 - D4 states the borrowed promise (deny on `Agent` = documented contract, not observed). Guide
  answer.
- r12 - spikes: G1/G2 in a per-case-project list. Scan 29; ledger 36.
- r13 - worklist additions: SKILL 2a :202-204, 2b :311-312, mode :332-336, interrupted pass
  :489-495; WORKFLOW :297-298, :300 list, :386, :441-443; ORCHESTRATOR :183-186; README :11;
  hooks.json description; loop skill :115-117; native README + Codex recipe; aiwf-lib comments;
  OPERATOR_PROTOCOL block moved next to Gate 2. Scan 4, 10, 14-18, 20-24, 26, 31.
- r14 - honest limit in block D gains: substituted agent, continuation by message, deny borrowed.
  Scan 3, 5, 6, 8.

## r1 -> r2 (2026-10-02, after the Step 2b fact-check: ticket 117 claims 6 FALSE 4 UNVERIFIABLE,
## gaps A12 B8 C5; shared 151 claims 5 FALSE 18 UNVERIFIABLE, gaps A11 B6 C4)

FALSE rows fixed: self-check reviewer case `:839` -> `:845`; PS pin span -> `:2335-2839`; STDIN
regex -> `:2358`; sh span -> `:2868-3283`; gate2ModeCases -> `:274`; Block D "Step 3 above" ->
"below"; Block O anchor -> `:45/:46`; overrides anchor -> `:119-149` (`:132-134`, `:142-144`); Test
policy "templates row" -> explicit union; COO routing check 2 -> "no" after the open path was fixed.

A and B gaps closed:
- overrides edit under Gate 3 -> worklist 14, written by the Writer in the code commit; the
  completion record after route-state `{}` (dry trace 2).
- `D:\pnp-live` refresh -> the literal `git -C` command under the CLAUDE.md standing rule.
- Step 0 interlock -> ONE path: the 0.2.14 wrapper on the operator's word for that case.
- own-pass hash for this plan -> interim node command, same normalisation.
- pass 2 -> delta scan, delta fact-check, own pass redone, restamped.
- acceptance -> every id, a Risk-threshold-to-id map, Bash forms, no exit echo; the
  "valid fixture" CLI half dropped (M1 carries it).
- empty TICKETS -> `tickets-empty`, M25; coverage comparison = trim equality; excluded refs.
- `--apply` precedes VERIFY and acceptance (self-check version check, `aiwf-selfcheck.js:4909-4911`).
- throw -> ask -> G7 (Gate 2 run from an engine copy without plan-gate.js).
- PS stdin encoding -> paths ASCII and relative by rule; the root goes by argv (D6).
- fixture builder `writePlanFixture` + runner `prepare` callback named; ids literal.
- Block D template double prefix -> `<64 hex digits>` plus the sentence naming the command.
- `-not $?` -> static pin + ctl-6 + `[NOTE]` (no executed probe; reason stated).
- 5(b) join -> standalone paragraph; `:340-341` sentence rewritten.
- presence greps labelled as presence; behavior carried by M/W/G.
- internal-error cannot refuse a non-plan brief (checker contract).
- D2 -> "zero third-party".
- deny on `Agent` -> doc section and date pinned in D4.

## r2 -> r3 (2026-10-02, after Codex readiness pass 1: NEEDS-FIX, 9 blockers; 181,444 tokens)

Pass 1 blockers, verbatim in substance, and what closed each (all nine are author defects; none
disputes a design decision):
1. a ref merely mentioned in the plan counted as a ticket -> TICKETS refs must be a ticket HEADING
   (`^#{1,6}` line); fixture: `### LEGACY-7` heading, `NOTE-9` prose-only; M34.
2. scan closure blacklist; empty cells passed -> closure WHITELIST (`plan:` / `no defect:`), every
   other cell non-empty (`scan-empty-cell`), `none` in a none-found row's violation cell; M7, M30.
3. five lines mandatory but four checked; duplicate semantics open -> all five checked
   (`line-missing:Class`, `class-not-plan`); a duplicated line yields no value and its dependent
   checks are skipped; M31-M33.
4. `-Class code` + `Class: plan` brief untested -> W8 on both channels.
5. node-not-starting refusal unexecuted -> W9-ps (PATH without node) asserting exit 2 and the
   refusal line; ctl-6 flips W9; the static pin dropped.
6. blocks O and T overclaimed "made over the text" for the scan -> only the own pass is
   hash-bound; the scan is presence and closure; wording fixed.
7. no QA classification -> D13: R2 non-runtime, no QA (E2E disabled; gate behavior proven by
   executed self-check/spike probes per the hooks/gates Test policy row).
8. pnp-live refreshed only after the tag -> after EVERY commit on main (plan landing, code, docs +
   archive, release record).
9. archive late and unchecked -> archive in the docs commit that carries the completion record,
   with the rule-class grep and its positive control (precedent 006_PLAN_RDY:401-402).

(r2, carried) Closed as no defect / narrative: consumer measurements in W1/W2 are narrative numbers about the
history of the work (WORKFLOW § Durable development history allows them), sourced in this plan's
context (the consumer session's report, 2026-10-02); the acceptance greps are executed checks, not
reading (precedent: HARD-021 acceptance); operator quotes are the consumer's.

## r3 -> r4 (2026-10-02, after the delta scan rows 40-65 and the delta fact-check over r3:
## 50 claims, 1 FALSE, gaps A3 B3 C2)

Closes only what the delta instruments handed over; adds no new surface:
- heading rule tightened: the ref is the heading's FIRST token, headings inside fenced blocks are
  skipped (scan 41); archive plans verified to pass (scan 42).
- D13 reworded: the ticket has observable behavior; QA has no E2E artifacts to judge; the probes are
  the proof (scan 51).
- every pnp-live refresh preceded by `git -C D:\pnp-live status --porcelain` (scan 54).
- blocks O and T name exactly what is checked (scan 56; fact-check B1, C2: "the plan file the brief
  names" in both).
- W9-ps: pwsh directory located at probe time, win32 only, `[NOTE]` otherwise (scan 59, 62).
- `internal-error` stated as the one token without an M case, `[NOTE]` (scan 64).
- controls ctl-7..ctl-11 for the r3 checks (fact-check A2, B2); acceptance accepts the W9-ps /
  ctl-6 / internal-error `[NOTE]` lines (A1, C1).
- `escapeRe` moves with `refRegex` (A3); WORKFLOW citation `:674-677` (B3).
- this plan's own scan file: rows 35-39 carry `none` in the violation cell (scan 48, 49).

## r4 -> r5 (2026-10-02, after Codex readiness pass 2: NEEDS-FIX - 7/9 closed, #2 and #7 open,
## 2 new born of r4; 136,667 tokens)

- p1 #2 (not closed): the scan table header is now EXACTLY the six Step 2c columns; a four-column
  table is `scan-no-table` (M35).
- p1 #7 (not closed, a DISPUTED design decision): went to the operator, who decided 2026-10-02
  "QA няма да има" - D13 records the word; no round spent on it.
- p2 new #1 (born of r4): fences are ``` or ~~~ runs of three or more, closed by the same marker of
  at least the same length; headings inside are skipped (M36 covers both).
- p2 new #2 (born of r4): the control model is stated - every M case pairs with M1 (one-fact
  fixture, the self-check's matrix pattern at aiwf-selfcheck.js:792-969), and the sabotage
  controls ctl-1..ctl-11 cover what a pair cannot (wiring and seven checker branches).

## r5 -> r6 (2026-10-02, after the delta scan rows 66-86 and the delta fact-check over r5:
## 33 claims, 5 FALSE, gaps A5 B6 C4)

- FALSE fixed: WORKFLOW `:739` -> `:742`; qa SKILL `:55` -> `:59`; "пас 2 #2" -> "пас 1 #2,
  незатворен след пас 2"; the pair claim rewritten (below); "разделите :792-969" -> the section
  `:793-969` with the pattern stated at `:790-791`.
- D13 names itself a recorded operator exception to the five rules that would order QA; the ruling
  is in dev/backlogs/CANDIDATES.md § Ruling ledger (scan 66-70; fact-check B6, C1).
- fence grammar completed: up to three leading spaces, info strings, closer = same marker at least
  as long with nothing else, inner shorter fence does not close, unclosed runs to EOF; M36 variants
  and M37 passing side; the base fixture carries the fenced FENCE-1 and AFTER-1 (scan 71-73, 85;
  A1, C3).
- every table with the six-column header is read, rows pooled (M38); digit-led rows without a pipe
  inside a scan table are `scan-row-shape` (M39); block C records rows with pipes (scan 76, 77; A2,
  A3).
- usage exit 2 is M40; unreadable-stdin pass is a `[NOTE]` (scan 86; A4).
- control model: fixture family with a flipping counterpart; refusing cases on M1's fixture with
  the named damage; passing cases name their counterparts; sabotage controls stated as additional
  (scan 80-84; A5, B4, B5, C4).
- the Gate 2 lookup difference is stated as intended (scan 74; C2).

## r6 -> r7 (2026-10-02, after Codex readiness pass 3 - the hard maximum: NEEDS-FIX, every pass-2
## blocker closed, 2 new born of r5/r6; 125,912 tokens; operator word "1": close them, no further pass)

- p3 new #1: a table whose header starts with `#` and `ticket` but is not exactly the six columns
  is `scan-bad-header` instead of being skipped next to a valid table; M41.
- p3 new #2: the base fixture carries `### NOROW-1` with no scan or own-pass rows; M33 is
  `TICKETS: FIX-001` + `TICKETS: NOROW-1`; ctl-11 replaces the skip with "use every TICKETS line",
  so NOROW-1 yields the coverage tokens and M33 goes red.
- r7 delta (scan rows 87-95, fact-check 15 claims 0 FALSE, gaps A1 B3 C4) closed in place: any
  `# | ticket` header line outside a fence, with or without a separator, is a scan header; a
  non-six one is `scan-bad-header`, its rows unchecked, and it suppresses `scan-no-table`; M35 and
  M41 assert exactly that token; ctl-12 flips M41; block C tells the COO that every `# | ticket`
  table repeats the exact header. Token figures are the wrapper's `tokens used` footer of each run.
