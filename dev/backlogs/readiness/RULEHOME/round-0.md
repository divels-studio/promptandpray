# RULEHOME - round 0 (the COO's own pre-pass, before the paid pass 1)

Engine: the COO session (Claude Fable 5.1), 2026-10-31, cold; no auditor tokens - two scan agents
(sonnet): a pointer sweep of the index and the three tickets against the tree at `465e580` (167
pointers, 167 hold - the one "missing" verdict, `docs/CODEX_REVIEW_QA_RECIPE.md:74-76`, is the
stdin-only sentence D-13 changes, so it holds by meaning) and a documentation check of the RESEARCH
§ S4 harness claims (now written there as VERIFIED). Stamp at the pre-pass: `--check` exit 0.
Operator word for the pre-pass: „прегледай плана и виж дали няма да намериш забелжки" (2026-10-31).

| # | severity | where | finding | disposition |
|---|---|---|---|---|
| 1 | BLOCKER | 001 worklist T6, Q4 / `docs/WORKFLOW.md:562-573` | the record skeleton's checklist gets "the roadmap line marked or removed with its pointer" while WORKFLOW says the roadmap is written at exactly three events (+ the growth write) and never otherwise - 001 would ship the contradiction D-01 forbids | fixed: D-16 (a) - 001 adds the fifth write to WORKFLOW with an acceptance grep |
| 2 | BLOCKER | 002 closing half | 0.3.7 retires rules this repository's own overrides, memory and CLAUDE.md zone carry (Q2, Q3, Q4, C-002, the auto-mode apply line, the `last-review-session.txt` path, the memory file); 003 sweeps Silerax only | fixed: D-16 (c) - the sweep in 002's closing half, R1 in `dev/` |
| 3 | BLOCKER | 002 habit guard (D-05 (c)) | the recogniser is undefined: what is "a test run", a `cd` inside a quoted nested shell (the runbook's Portion 2 command), the PowerShell aliases, which `git -c`; hidden discovery, readiness check 3 | fixed: D-14 - the matrix; the index row and the ticket cite it |
| 4 | INFO | RESEARCH § S4, 002 rows | the harness claims entered 002 unverified: `onFailure` (now VERIFIED, per hook command object, failure = cannot start / exit other than 0 or 2 / timeout / invalid output); `CLAUDE_BASH_MAINTAIN_PROJECT_WORKING_DIR` is documented for the MAIN SESSION only and no op carries a settings `env` block - D-04 resolves to "the guard denies the prefix" with near certainty, the spike stays; Monitor hooks run but the `tool_name` is undocumented; `InstructionsLoaded` exists, its firing in a subagent is not documented | fixed: RESEARCH § S4 VERIFIED block (COO); D-14 (d) Monitor = Bash dialect; the spike (a) text names the doc fact |
| 5 | BLOCKER | 002 Acceptance / Verify | `claude plugin validate .` is missing - hooks.json gains a new key; it is one of the eight VERIFY commands | fixed: a literal acceptance row, exit != 0 = broken |
| 6 | BLOCKER | D-13 / 002 | (a) `skills/plan/SKILL.md:197`, :205 - the round file `readiness-round.txt` stays a fixed path; (b) the `-BriefFile` CLI contract (flag absent, both given, empty file) is unnamed; (c) the "allow rule" D-13 keeps constant is consumer-local, the payload ships only the blanket allow - the consumer is not told the launch form changes | fixed: D-15 - key the round file, the contract, one CHANGELOG line |
| 7 | INFO | D-08 | 001 routes to Opus, 002 to Fable, one session S3 carries both | fixed: D-08 - S3a Opus for 001, S3b fresh Fable for 002 |
| 8 | INFO | 001 gates | R1 with no auditor over ~35 doctrine rows with pointers - no fact-check of the prose | fixed: D-16 (b) - one scan-tier fact-check before the commit |
| 9 | INFO | 002 size | one Writer, eight scope items across hooks, four wrappers, 25 prose pointers, self-check rows, migration, changelog | rejected: the split is the S3b COO's call at dispatch (overrides § Test policy, parallel Writers); the plan does not record it |

BLOCKERS: 6 INFO: 3 - all `fixed` through D-14, D-15, D-16 and the D-08 amendment (DECISIONS.md,
COO) and the planner's revision of the index and tickets over this file.
