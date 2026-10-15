# PLAN_PLB - fact-check gate, round 1 (Step 2b), over draft r3 -> closed in r4

Six `sonnet` Explore agents, 2026-10-15, one per section (shared; PLB-001; PLB-002; PLB-003;
PLB-004; PLB-005+006), each handed the Decisions section, its ledger rows and the three readiness
instructions. Full per-claim ledgers are in the agents' handbacks (session transcript); this file
keeps the counts, every FALSE row and every A/B/C gap with its closure in the draft.

| section | CLAIMS total | verified | false | unverifiable | GAPS A | B | C |
|---|---|---|---|---|---|---|---|
| shared | 61 | 53 | 4 | 4 | 4 | 5 | 3 |
| PLB-001 | 46 | 36 | 1 | 9 | 7 | 7 | 2 |
| PLB-002 | 57 | 53 | 3 | 1 | 12 | 5 | 5 |
| PLB-003 | 62 | 56 | 4 | 2 | 11 | 5 | 3 |
| PLB-004 | 49 | 33 | 11 | 5 | 4 | 3 | 2 |
| PLB-005/006 | 45 | 36 | 5 | 4 | 9 | 5 | 3 |
| **total** | **320** | **267** | **28** | **25** | **47** | **30** | **18** |

Unverifiable rows are of two kinds: future state the plan creates (to-be-written identifiers, tests,
files) and consumer facts outside this tree (now marked "as reported" in the draft).

## FALSE rows and their closure (draft r4)

| section | claim (r3) | correct value | closed by |
|---|---|---|---|
| shared | "DRAFT r3" with no r3 row in revisions.md | - | revisions.md rows r3, r4 |
| shared | D6 grep "hits every home, nothing outside" | at HEAD: misses OPERATOR_PROTOCOL + review Step 2e, hits selfcheck:1794 + generate.mjs:1099 | D6 + PLB-001 acceptance: exact 12-file set, common phrase rewrite |
| shared | D8 "brief names every doctrine file" | brief names REVIEW_CHECKLIST (+ classes doc) | D8 restated |
| shared | "PLAN_HARD archived in the 0.3.x cycle" | header `:26-29`: active until HARD-011 closes | § Scope |
| shared | "PLB-002 d" for the README step | it is Outcome (c) | § Scope |
| PLB-001 | acceptance grep claim | as above | rewritten |
| PLB-001 | `gate3ToggleCases :190` / README `:77-79` / test-setup `:225-230` | `:189`, `:77-80`, `:225-227` | corrected |
| PLB-002 | interview "beside `:213`" | paths questions `:220-229`; `:213` is e2e outputDir | corrected, literal question fixed |
| PLB-002 | `--resolve` at `:1519-1529` | `resolveArtifact :1581`, `writeConfig :1661`; `:1519-1529` is `createdOps` | corrected |
| PLB-002 | five suites "all exit 0" at ticket time | selfcheck on `.` red after the bump until the self-update (`version-stamp :5445-5447`) | deferred item (D10) |
| PLB-003 | consumer file 273 lines | 272 | corrected |
| PLB-003 | "four required fields" incl. `createIfAbsent` | required: op, file, region, template; `createIfAbsent` optional (`:131-135`) | corrected |
| PLB-003 | "QA brief its own" | `skills/qa/SKILL.md:191` names the same REVIEW_CHECKLIST | corrected |
| PLB-003 | self-update after PLB-002 creates AGENTS.md | op appended to an applied migration is never pending (`migrate.mjs:515-525`) | D10 rewritten: ONE self-update after PLB-003; order PLB-002 -> PLB-003 |
| PLB-004 | `:745-747`, `:957-962`, `:709`, `:494`, "nothing follows the exit(0)" | `:746-749`, `:962-963`, `:708`, no `:494`; the write path follows and is unreachable | corrected |
| PLB-004 | validate-config/validate-payload "end-of-script" | mid-block, error path follows | dropped from the ticket |
| PLB-004 | `addObservation` at `:113` | function-local `:5150`; `observation()` `:111-115` | corrected |
| PLB-004 | `--answers-file :265-270` | `:291-296` | corrected |
| PLB-004 | D3 "PLB-004 adds a CHANGELOG entry" vs Stop | - | (d) added to Outcome/Stop |
| PLB-005 | "overrides § Hard rules allows `dev/` through the Writer" | `:71-72`: "R1 docs unless the ticket says otherwise" | quoted; the ticket is the "otherwise" |
| PLB-005 | "at most 5 lines" Cyrillic bound | cross-reference lines stay Bulgarian; count depends on wrapping | allowed-literal grep (`grep -v -E ...` exits 1) |
| PLB-006 | `git mv` from `active/` while the plan is an untracked draft | lands in `active/` at approval (guard (e)) | header sentence |
| PLB-005/006 | readiness artifacts "exist" | fact-check-r1 / own-pass not yet on disk | § Readiness artifacts wording |
| ledger row 36 | `guard.js:267-269` | file has 246 lines; `:207-215`, `:236` | ledger fixed |

## Gaps closed (A/B/C) - by closure, not restated per row

- Acceptance that could not fail or pass: PLB-001 grep (exact file set), PLB-002 selfcheck (deferred
  after D10), PLB-003 template grep (positive control + widened pattern + tracked file), PLB-004 (a)
  commands (`grep -c`, `git diff --exit-code`), PLB-005 Cyrillic bound (literal allowlist, `(was:)`
  per title), PLB-006 (acceptance block added).
- Hidden decisions fixed: PLB-001 normalisation + deny literal + no-lock statement; PLB-002 preflight
  refuse point + refusal form + absent key + interview literal + in-place `$schema` + no-op print +
  slug `0023_changes-dir-and-agents` + op order + CHANGELOG date; PLB-003 template contract (five
  sections), empty-ground test recipe, foreign-file setup case, RECIPE anchor, other readers listed;
  PLB-004 check ids and control labels, helper home `scripts/engine/e2e-trace-note.js`, fixture rows;
  PLB-005 quote convention, baseline = HEAD before the commit, 20 titles recorded by the Writer.
- Order/gates: D9 (route cleared after the code commit; record after), D10 (single self-update after
  PLB-003; pnp-live exception for two commits), Execution order rewritten, PLB-006 tag -> push ->
  refresh with words named, D2 for PLB-006 (docs, no suite), D7 routing lines written.
- Consistency: "three/four ledgers" (four), "22/20 open sections" (20, recomputed at ticket start),
  PLB-001 CHANGELOG conditional removed, PLB-004 title ("one Writer, sequential"), D6 and PLB-001
  derive from one set.
- Left open on purpose, named in the draft: Codex reading `AGENTS.md` is Codex behaviour observed
  from the binary's strings and the consumer's use, not executed here; the resume session's reads
  are Codex-internal.
