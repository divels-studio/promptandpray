# Fact-check r1 - PLAN_LEAN (Step 2b, over the r1 draft)

Two Explore/sonnet agents, 2026-10-04, HEAD 77936fc, each with the three extra readiness
instructions and `D:\pnp-live\docs\READINESS_CLASSES.md`: agent T over the ticket section (with the
behavior ledger rows A-B beside it), agent S over the shared sections (header, Контекст, Решения) and
ledger chains C-H. Both ran read-only commands (git grep, awk|diff, a Node run of the path matrix, an
orderConfig round-trip, sha256 of the installed ORCHESTRATOR.md) beside Read.

CLAIMS (T): total=190 verified=167 false=14 unverifiable=9
CLAIMS (S): total=202 verified=184 false=10 unverifiable=8 (shared 143 = 130/5/8; ledger rows 59 = 54/5/0)
GAPS (T): A=9 B=11 C=9 - GAPS (S): A=10 B=14 C=7 (overlapping; every A and B closed in r2 below)

## FALSE rows and their closure (r2)

| # | agent | claim | correct value | closure |
|---|---|---|---|---|
| 1 | T, S | block 2(a) keeps "the same context that writes the behavior ledger" on one line | split across the block's lines 2/3 | plan: block re-wrapped, literal on one line |
| 2 | T, S | block F2 keeps "629 pointers resolved through three agents" on one line | split | plan: block re-wrapped; wording changed (row 8) |
| 3 | T | 8(b) pattern :640-642; the ask answers the question `paths.plansDir` | :640-644; the ask receives the question TEXT "Plans directory (the PARENT of ...)" | plan: 8(b) names `ask = (q) => q.startsWith('Plans directory') ? '.aiwf/plans' : scriptedAsk(q)` and says the ask gets the text, not the key |
| 4 | T | 8(c) pattern :662-667 | :659-666 | plan: corrected |
| 5 | T, S | 8(d) clean-project check :680-691 | :681-683 inside the block :673-686 | plan: corrected |
| 6 | T | SCRIPTED_ANSWERS change flips :608, :653, :677 | :608, :653 assertions; :677 is `const said = []`, the assertion is :681-683 | plan: corrected |
| 7 | T, S | 12(a) after: 5 hits | 6 - block C adds "one agent per ticket, two tables, no second dispatch" | plan: 12(a) says 6 and names block C |
| 8 | T, S | "629 pointers resolved through three agents ... auditor blockers design and concurrency" (F2, M, D8) | CANDIDATES.md:73 records 629 opened by agents in the own pass and 4 FALSE, no agent count; :51 records pass 1 = 11 blockers, 4 design/races + 2 accepted residuals | plan: F2 and M say "629 pointers opened by scan agents in the own pass ... mostly design and concurrency"; D8 cites CANDIDATES § PUR v3 with the 4+2 of 11 |
| 9 | T | 12(d) after: 3 hits | 4 - block O3 puts "start/stop" into templates/ORCHESTRATOR.md.tmpl | plan: 12(d) lists the fourth hit |
| 10 | T | acceptance "class 15" in SKILL -> 2 | 3 (1(d), 1(e), 1(h)) | plan: 3 |
| 11 | T | five ops.json grep -c commands given without a file operand | they read stdin | plan: `migrations/0021_lean-readiness/ops.json` added to each |
| 12 | T | second provenance grep over CHANGELOG.md -> empty | CHANGELOG.md:4 (`https://` matches `[A-Za-z]:[\\/]`), :899-901, :1153-1162 (repo name) hit on the anchor | plan: CHANGELOG.md dropped from that grep; the new block alone is extracted with awk and grepped |
| 13 | T | acceptance note: the blocks already keep every literal on one line | false for 2(a) and F2 | plan: fixed by rows 1-2; the note stands |
| 14 | S | D13 "decisions cite by section and symbol" | D4 carried `plan-gate.js:333-336` | plan: D4 cites `own-checks-empty-cell` in `checkPlanBrief` |
| 15 | S | D4 "a reviewer.md.tmpl change would be a rerender of the three agent files" | one rerender op for `.claude/agents/reviewer.md` (ops are per file) | plan: D4 reworded |
| 16 | S | D7 names the test-setup text as the "раздел 12b" comment | it is the file-header item 10 at :31-33 | plan: D7 and 8(f) say header item 10 |
| 17 | S | D9 "three places" in the ORCHESTRATOR template | four (:50 added in r1) | plan: D9 says four |
| 18 | S | COO routing check 2 = "не" | the countable rule also counts an unresolved marker (2a's "или еквивалентната дума") and anchorless worklist items (new files) | plan: 2a names the exact words after which the parenthesis goes; check 2 restated with the exemptions (new files are literal texts, closing greps are instruments) - the answer stays "не", check 1 routes top tier anyway |
| 19 | S | ledger C7 config pointer :5-6 | :4-5 | ledger: corrected |
| 20 | S | ledger C8 record pointer :22-26 | :23-27 | ledger: corrected |
| 21 | S | ledger F8 "the gate uses .aiwf/plan/<ABBR>/" | fixtures FIX/, spikes SPK/; the dispatch gate hard-wires no directory | ledger: reworded |
| 22 | S | ledger G4 pointers into example-bump.mjs | CMD_BUILD and the checks are run-example-cycle.mjs:58, :505-521; version logic example-bump.mjs:128-130 | ledger: repointed |
| 23 | S | ledger H14 "literals stay on one line" | 2(a) and F2 were split | ledger: r2 note added |
| 24 | S | ledger A5/B6 NEW rows carried the r0 contract (no case folding, no `..`) | the r1 helper folds both | ledger: rewritten to the r1 contract |

## UNVERIFIABLE rows (left as they are, marked)

Probe-measured values (dry-run rc 0 / no note / four mkdirs; awk mutation `3c3`; Node v24.12.0 - the S
agent re-ran node and awk and confirmed them); CI run ids (recorded in commit 283c054); the inventory
count 232; the consumer files and their bullets (outside the repository - CANDIDATES.md:92-98 carries
the fact that both consumers hold the points with an expiry clause); the session model; the harness
timeout; "the second agent opened the files the first had just read" (D1 now points at
`readiness/DRAFTS/ledger.md` A1 and `consequence-scan.md` row 1, both over generate.mjs); the commit
line rule (the plan now states it: ref in the subject, no trailers by operator rule, no `Refs:` body
line because the subject carries the ref); "Без статистика на пасовете" (outside the repository).

## Gaps and their closure (r2)

A1 (T) five grep -c commands read stdin -> operands added. A2 (T) provenance grep cannot be empty over
CHANGELOG.md -> CHANGELOG.md out of that grep, the new block extracted and grepped. A3 (T) class 15
count 2 -> 3. A4 (T, S) two literals split -> re-wrapped. A5 (T) `<котва>` placeholder -> the header
says the brief substitutes the literal HEAD hash. A6 (T) risk-threshold items without an observer ->
commands added: `git diff -U0 ... | grep -c repo-match` -> 0 (own-pass header in fixtures),
`... test-setup.mjs | grep -c SCRIPTED_ANSWERS` -> 0, `git grep -nE "three$|three project-layer"` ->
empty, start/stop via 12(d); the update-rewrites/creates-directories sentence has no mechanical
observer and the plan says so (Codex code pass). A7 (T, S) the ask predicate -> named. A8 (T, S) S7
name and the "Four fixtures" wording -> named ("Six fixtures ..."; S7 one check with the matrix). A9
(T) VERIFY vs acceptance redirects -> the header says the redirects ARE the batch's setup-suite and
selfcheck outputs, one run each. A10 (S) 2a insertion point -> the exact words ("after `unresolved
architecture`"). B1-B14 -> the FALSE rows above and: probe/external claims marked; D1 rationale given
its in-repo evidence. C1 (T, S) D9 three -> four. C2 (T, S) D4 by symbol. C3 (T) landing item is a
COO act -> the acceptance header says so (trace step 1). C4 (T, S) CL date -> the block header says
the date in the block is illustrative, the Writer writes the code-commit day, the regex accepts any.
C5 (T) D7 wording -> header item 10. C6 (T, S) routing check 2 -> restated with exemptions. C7 (T)
commit line vs WORKFLOW "Refs:" -> the plan states which rule governs. C8 (T) ledger header LIB ->
"no installed library; node core where named". C9 (T) D12 row name -> "update engine / migrations /
examples". C4 (S) D2/block C vs block A delta text -> block C defines the SCAN-half dispatch (the
Step 2a task with its LEDGER paragraph removed, first paragraph "Return ONE table under a line that
reads exactly `SCAN`", inputs unchanged). C6 (S) 12(d) four hits -> listed. C7 (S) acceptance
instruments vs "Reading is not a shell job" -> the header says instruments are execution of a check
with a named output, not reading.

Readiness classes named by the agents: 7 (identifier does not exist - the stale line pointers, all
corrected), 8 (command cannot fail - the stdin greps and the CHANGELOG grep, corrected), 12 (open
decision - the ask predicate, S7 name, 2a words, corrected), 13 (risk item without an observer -
commands added, one declared Codex-only), 14 (the r1 CHANGELOG grep added surface - removed), 1
(unread consumers - setupFlagFindings, doctrine pins, REVIEW_CHECKLIST readers - ledger I1-I3 added;
no plan change needed: the edits touch none of what they read).
