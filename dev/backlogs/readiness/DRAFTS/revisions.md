# Revisions - PLAN_DRAFTS

## r0 (2026-10-02) - first draft

Written after the consumer inventory (1x Explore/sonnet, ~190 hits / 33 files): one ticket
DRAFTS-001 [R2 code-class], release 0.2.16; decisions D1-D10.

## r1 (2026-10-02) - after Step 2a ledger 1 and Step 2c scan 1

Scan 1: 35 rows, 20 closed as `plan:` (lines changed), 15 as `no defect:`. Ledger 1: 43 rows, 0
UNREAD inside the repo, 0 CHAIN ENDS EARLY; 9 anchor corrections (ANCHOR). Changes in r1:

- D2: `own-pass.md` is one file per plan, rewritten at every stamp; the earlier counts go to
  `revisions.md` (scan 3; Step 2d's "one per pass" is rewritten in worklist 1(c)).
- D3: the draft is MOVED with `git mv` at landing (byte-identical, the stamp verifies against the
  active plan; the approval note is the only later edit, recorded here) (scan 5); readiness/ not
  moved at archiving gets its own WORKFLOW sentence (scan 7, worklist 3(d)); an empty drafts/ is not
  tracked (scan 6) -> observations, not checks.
- D5/D6 and worklist 7: the self-check rows are `addNote` OBSERVATIONS with flipping texts (present /
  not created yet; ignored / NOT ignored / not a git tree), never `add` - the NEGATIVE_CONTROLS driver
  cannot cover a never-failing check (ledger B4); S1<->S2 and S3<->S4 are each other's control;
  `drafts-ctl-1` dropped; `scratch-ignored` runs only when the directory exists and spawns git in
  projectRoot (ledger B5 - the self-check's first git spawn; S3 fixtures `git init`).
- Worklist 6: test-setup control `setup-drafts-ctl-1` on the payload-copy model (ledger A7); the
  COLLISIONS rows are label/value pairs; the ancestor table gains a row (scan 1, 34).
- Worklist 1: (e) anchor :463-471 (ledger E4); (g) Step 2b pointer to fact-check-r<N>.md (scan 4);
  Step 2c grammar kept (ledger E2).
- Worklist 2: qa SKILL:114 "gitignored path" added (scan 17).
- Worklist 3: (a) guard (e) rewritten around `git mv`; (e) the planning lock's readiness exception
  names the draft and readiness files as the planning's own untracked files (scan 8); (f) Gate 3
  sentence on a plansDir outside docs/ (scan 9); (c) anchor :536-537.
- Worklist 5: interview.mjs :219 only (ledger D2).
- Worklist 8: every prose place quoted with its own sentence (ledger D3/G1/H1-H3: none of them is the
  literal "parent of active/ and archive/"; setup:87 "creates both" -> "creates all four"); closing
  grep redesigned around `archive/` with every hit read (scan 25); selfcheck :5416/:5419 text added.
- Worklist 9: README :22 (ledger C9). Worklist 10: note-only model 0016 (ledger C1), version-stamp
  anchor :5394-5402 (ledger B7), `--apply` / `--check` output phrases (ledger C7/C8).
- Worklist 11: dev/PROJECT_OVERRIDES.md:275 and dev/README.md:11,21 added (scan 32); the HARD-023
  text pointer made explicit.
- Outcome (4): "two templates" corrected to PROJECT_OVERRIDES.md.tmpl + two seeds + two selfcheck
  strings (ledger H4).
- Block E: `git mv` sentence; honest limit "nothing checks the move" (scan 11); the observation
  wording. Acceptance: exact output phrases; S1-S4 texts; grep baselines (5 literal hits, not >= 8).
- Dry trace: landing = `git mv` + approval note + `git add readiness/DRAFTS/`.

(Correction: ledger 1 has 49 rows, not 43 - counted by fact-check r2; two of them - A10, A11 - were
added after fact-check r1. The `archive/` closing-grep baseline is 15 lines, not 14.)

## r2 (2026-10-02) - after Step 2b fact-check r1 (two agents)

Agent A (ticket): 83 claims, 10 FALSE, 3 UNVERIFIABLE, gaps A12 B6 C5. Agent B (shared + ledger):
155 claims, 24 FALSE, 11 UNVERIFIABLE, gaps A8 B18 C4. Every row and gap is in `fact-check-r1.md`
with its closure. The substantive changes of r2 (a full rewrite of the draft, every section):

- D3 rewritten: the draft is UNTRACKED under the planning lock (new D11), moved at landing with a
  plain rename (`git mv` refuses an untracked file - measured exit 128), then `git add`; the
  approval note changes the hash, so `revisions.md` records both hashes (the stamp and the landed
  plan) and the difference between them is that note - honest limit stated in D3, block E, the trace.
- D5/D6/worklist 7: the self-check rows are a third kind of finding - OBSERVATIONS (`addObservation`,
  printed by the global `observation()` without "not exercised"); S1-S4 test the printer's text
  flipping with fixtures; `scratch-ignored` has four texts; `NEGATIVE_CONTROLS` untouched.
- D7 rewritten: CLAUDE.md.tmpl:124-126 says where the plan lands, not how - stays; guard (e) and the
  seed say "lands in active/ (moved from drafts/)".
- D11 (new): the planning lock and the untracked draft/readiness files; worklist 3(e) writes it into
  WORKFLOW's readiness exception; trace step 0.
- COO routing: check 1 = yes (migration 0020) -> top tier.
- Worklist 6(d): the sabotage replaces the exact two-element array substring, guards exactly one
  occurrence, runs `node --check`; the control's printed line named.
- Worklist 8: the closing grep carries the explicit 14-line hit list and three exceptions.
- Worklist 10: ops.json verbatim + block N (the note text); worklist 11: PO:321, dev/README.md:21.
- Acceptance: one fixed line per block (E, W, CL); risk-threshold observability (schema diff,
  op-set, hooks/templates stat); `--untracked` provenance + abs-path/project-name grep; exact output
  phrases; S1-S4 lines; dev/ diff guard with two files.
- Block E, W, CL reworded (moved, six sentences, "kept out of git by the project's own .gitignore",
  operator testimony); Context: 42 files, anchors corrected, the gitignored sentences listed by
  wording, the layout pointers split into "say parent" / "describe only active/archive".
- Trace: step 0 (lock, tree SHAs), brief fields (PREVIOUS PASS BLOCKERS, BUDGET TARGET), landing
  sub-steps, pnp-live refresh with its Gate 4 dialog, the tag-before-CI operator exception.

## r3 (2026-10-02) - after the Step 2b delta fact-check over r2

208 claims, 20 FALSE, 11 UNVERIFIABLE, gaps A8 B12 C4 - every row in `fact-check-r2.md` with its
closure. Pointwise edits: anchors (mutation-guard :71, driver :7898-7936 / :7927, OP_SPECS :105-156,
hash compare :313-318, WORKFLOW :342-343 / :346-348, 1(g) :312-314); 5(a) states the verbatim
inserted text (0 today, exactly 1 after); 7(a) `findingLine(f, selfAuthored)` pure printer + S5;
7(b)/(c) printed names and the four texts with the full status map; worklist 8 mission sentence
as it stands, the 15-line baseline, three exceptions by content judged per sentence; block M
(NOTES.md verbatim); acceptance: one literal per line, greps over `.aiwf/*-out.txt`, the CL grep
without the day, block N / M greps, the "not exercised" grep; out-of-scope: managedRegions
untouched; new "Ескалация" paragraph (trigger 1 examined - none fired); routing 2-4 with reasons;
trace: 49 rows, delta scan before the stamp, CANDIDATES pointer row at landing.

## r4 (2026-10-02) - after delta consequence scan 2 (rows 36-62 over the r2/r3 changes)

27 rows, 12 with a defect, closed in r4: the printer choice (`printerFor`, not a pure line
function - the global printers keep their own bookkeeping); `&& !f.observation` in the controls
driver's "NOTEs on the control fixture" list; type guards on the observations; `scratch-ignored`
texts say "by git" (check-ignore answers from any ignore source; 128 on dubious ownership) and the
fixtures neutralise the global excludes (`-c core.excludesFile=<empty>` through
`scratchIgnored(..., gitArgs)`); selfcheck SKILL/README get one sentence on observations (worklist
12); COVERAGE prose sentence; acceptance output files renamed `drafts-*-out.txt`; block E: a pass
over a landed plan stamps the active plan afresh, and one `<ABBR>` is one plan for good; the
Ескалация paragraph examines RGATE D8 (no reversal - RGATE's own landing practice); D7 FLIPPED:
`templates/CLAUDE.md.tmpl:124` says "lands in active/ (moved there from its draft)" and migration
0020 carries a rerender of `CLAUDE.md#aiwf-core` beside the note (model 0019) - ops count 2,
diff guard adds `CLAUDE.md`, CL gains a bullet; WORKFLOW 3(g) `:345`, 3(h) Branch policy, 3(i)
`:698`; out-of-scope: CHANGELOG date check is manual at the tag.

(Corrections: r3 named two closing-grep exceptions, not three; delta scan 2 had 15 `plan:` closures
and 12 `no defect:`/none rows, not "12 with a defect".)

## r5 (2026-10-02, evening) - after the Step 2b delta fact-check over r4

155 claims, 14 FALSE, 14 UNVERIFIABLE, gaps A9 B8 C5 - every row in `fact-check-r3.md` with its
closure. The one that mattered: 40 of 62 scan closures were in a grammar the plan gate refuses
(`plan (r4):`, `none`), normalised to `plan: ...` / `no defect: ...` - 62 rows, 0 open by the
checker's own rule. Plan edits: ops.json `"template": "templates/CLAUDE.md.tmpl#aiwf-core"` with its
acceptance grep (the region op as in 0012); D5 reworded (fixtures prove text and choice, the
real-run grep proves the printer path); the ABBR rule gets a home (worklist 3(j), WORKFLOW ABBR
grammar); HIERARCHY row literal; the finished-plan seed's full sentence; the CLAUDE.md.tmpl:124
wrap; 7(c) guard text; worklist 12 quotes README:38-41 as it stands and names the three rows;
block M gains the CLAUDE-region bullets; acceptance: content greps on the template and on the
self-install CLAUDE.md after --apply, "двете" exceptions, prose risk items declared Codex-only;
routing check 2 reason; "пет" checks.

**Operator word 2026-10-02 (evening): "спри преди собственият проход" / "ревизираш факт чека и
спираш" / "сесията е пълна, прохода трябва да мине в нова сесия".** This session ends at r5. The
NEXT session: Step 2d (own pass as a file, in a turn of its own) over THIS text - no further
revision unless the operator asks - then pass 1 on the operator's word.

## r6 (2026-10-02, session "PNP 0.2.16") - after the Step 2d own pass

Own pass in a turn of its own (`own-pass.md`): BLOCKERS FOUND 2, both applied here - (1) the
planning-lock exception paragraph is `docs/WORKFLOW.md:348-350`, not `:346-348` (D11 paragraph);
(2) the Acceptance header states the `git grep -c` output form (`<file>:<count>`; nothing + `rc=1`
for zero) with the two measured anchor values. One correction without a defect: `.aiwf` holds 43
files today, not 42 (the session brief was added). Instruments: every acceptance command run on
the real tree and given a broken face; the anchor sweep (~215 anchors) found nothing else.

Stamps: r5 `cc25b75792928ba5f96bbf41f99e197700c86580880155917641d42eb95018e5` (handover, no own
pass over it); r6 `60276712bdfebbcd164bebb835059e37fe632d47fa4ab093231091616d8581a9` (the own
pass, the text pass 1 is dispatched over).

## Pass 1 (2026-10-02, session "PNP 0.2.16") - Codex gpt-6-sol/xhigh, cold, over r6 (stamp `60276712...81a9`)

Operator word: "пускай прохода". Brief `.aiwf/review-brief.txt` (COVERED BY line, Class: plan, the
five fixed lines); the 0.2.15 plan gate in `D:\pnp-live` accepted it (first live use). Tokens used
133,112. Verdict verbatim:

```
NEEDS-FIX

1. **The first scratch fallback conflicts with Branch policy.** The plan says a non-executing session writes readiness artifacts under `.aiwf/plan/<ABBR>/` while another session holds the tree (plan:116, plan:514). But `.aiwf` is inside the project (schema:306), and Branch policy permits non-executing sessions **zero repository writes** (WORKFLOW:878). The instructed fallback cannot be executed under the rule it cites.

2. **The local rule the Writer must copy contradicts D4's second fallback.** D4 permits scratch readiness files when Gate 3 blocks writes to `plansDir` (plan:118). Worklist 11(a) orders a verbatim copy of the HARD-023 rule (plan:465), which says those files are written to `.aiwf/` **only** while another session holds the tree (PLAN_HARD:3007). The Writer cannot satisfy both instructions; the resulting project rule would deny the Gate 3 case.

3. **Landing acceptance cannot catch an incomplete readiness history.** The plan promises the fixed files in `readiness/<ABBR>/` and admits that nothing checks a move from scratch (plan:94, plan:121). The post-landing status check expects only two modified `dev/` files (plan:677); it can pass with an artifact still in ignored `.aiwf/`. The plan gate reads whichever artifact paths the brief names and does not verify their later committed location (plan-gate:204). Thus a missing committed ledger or pass record can escape acceptance.

4. **The observation fixtures do not prove the production print path, and two may turn into accepted skips.** S1/S2 inspect finding data, S3/S4 call `scratchIgnored` directly, and S5 tests `printerFor`; none runs `sectionProjectLayer` on both sides of the fixture changes (plan:361, self-check:5466). The real-tree greps see only this tree's states (plan:662). Further, a `check-ignore` error in S3/S4 becomes an uncounted `[NOTE]`, and acceptance explicitly allows three passes instead of five (plan:371, plan:663, self-check:104). Broken fixture argument handling can therefore leave the required flip unproved while acceptance passes.

5. **Acceptance does not enforce the template edit boundary.** The risk threshold forbids changes to `templates/CLAUDE.md.tmpl` outside the specified sentence (plan:408, plan:693). Its checks only count "the plan lands in" and "is copied into" (plan:652). An unrelated edit elsewhere in the same template, such as its Gate 2 line (template:72), would satisfy both counts.

**Non-blocking notes:** The draft SHA-256 matches `own-pass.md`; the tree is on `main` at `2e1521d`, with the draft and readiness directory untracked. No files were changed.

**Disputed decision:** The trace applies the tag-before-green-CI practice to 0.2.16 (plan:748). The 0.2.15 record documents an operator exception and says its rule text still awaits approval (PLAN_RGATE:901); the current written release rule still puts the tag after green CI (PROJECT_OVERRIDES:81). The plan should state the authority for carrying that exception into this release.

**Next action:** Revise the plan to close all five blockers and resolve the release-order authority, then repeat the delta consequence scan, fact-check, own pass and hash stamp before requesting the separate operator word for pass 2.
```

## r7 (2026-10-02) - after pass 1

Closes exactly the five blockers and the disputed decision, nothing new:

- Blocker 1 - D4, block E/W/N/M/CL, worklist 1(a): the scratch directory stands in for readiness
  artifacts in ONE case (Gate 3); a session that does not hold the tree writes nothing under the
  repository, scratchDir included, and keeps its draft outside the repo (guard (e)); the held-tree
  case is listed under "Отхвърлени".
- Blocker 2 - worklist 11(a): block P (the `.aiwf/` row of PROJECT_OVERRIDES § Workspace paths,
  verbatim, aligned with Step 2e) replaces the copy of the HARD-023 text; the HARD-023 entry gets a
  one-line "superseded by PLAN_DRAFTS block P" pointer at landing (trace step 1).
- Blocker 3 - D4, block E, acceptance "Лендингът на този план", trace step 1: the landing checks the
  fixed names with `test -f` (+ at least one fact-check-r*.md) before `git add`, and after the
  commit nothing under `readiness/` or `drafts/` is untracked.
- Blocker 4 - D5, worklist 7(d), acceptance: S6 runs the real `sectionProjectLayer` over S1/S2 with
  `console.log` captured; S3/S4 are hard checks (no note fallback; git is a loop prerequisite);
  acceptance `S[1-6]` -> 6, FAIL/NOTE -> 0.
- Blocker 5 - acceptance: `git diff <anchor> -U0 -- templates/CLAUDE.md.tmpl` -> exactly one hunk
  whose header starts at old line 124.
- Disputed decision - trace step 2 follows § Release discipline (push main -> CI green -> date check
  -> tag, the tag word covering the tag push); the one-push practice of 0.2.15 is named as an
  operator exception given at the tag, not a plan rule.
- Scan rows 11, 41, 58 re-closed to r7. Delta scan 3 (rows 63-84) and delta fact-check r4 (76
  claims, 6 FALSE, gaps A5 B4 C3) ran over r7 and were closed INSIDE r7 before the stamp: S6 drops
  the `notes +0` claim, snapshots and truncates the three global arrays and restores
  `currentSection`; the hunk regex accepts `@@ -124 +124,2 @@`; the draft itself has a scratch home
  in the Gate 3 case; HARD-023 gets three pointer lines at landing (acceptance (3), the rule,
  worklist 3); fixture spawns strip GIT_DIR / GIT_WORK_TREE / GIT_INDEX_FILE; block M states the
  git-on-PATH prerequisite; the date-check step is attributed to the RGATE record; the 0.2.15
  practice is described as the record describes it (a proposed replacement pending guard (g)).
- Own pass restamped over r7 (second stamp, BLOCKERS FOUND 6 - the six applied above).

Stamps: r6 `60276712bdfebbcd164bebb835059e37fe632d47fa4ab093231091616d8581a9` (pass 1 was
dispatched over it); r7 `e81cd4299b9bdc9989a83d60e4932286a0beaa3bcc133fb7043f919b0dc141b4` (the
text pass 2 is dispatched over, on the operator's own word).

## Pass 2 (2026-10-02, session "PNP 0.2.16") - Codex gpt-6-sol/xhigh, cold, over r7 (stamp `e81cd429...41b4`)

Operator word: "пускай". Brief carried pass 1's five blockers verbatim + the origin duty; the gate
accepted it. Tokens used 125,694. Verdict verbatim:

```
NEEDS-FIX

1. **The template edit boundary is still unenforced.** The r7 check accepts one `-U0` hunk starting at old line 124 and permits an old-line count of three (plan:721). The intended replacement is at template:124; an adjacent edit to the archive instruction at line 126 can join that hunk and satisfy both counts. Acceptance can therefore pass a change outside the permitted sentence. **Origin:** carried blocker 5; r7's attempted closure is insufficient.

2. **The new Git prerequisite turns a valid setup or update into a failure.** r7 makes S3/S4 hard failures when Git is unavailable (plan:385) while also calling a consumer without Git legitimate (plan:173). Setup accepts an explicit project root when Git cannot resolve one (setup skill:15); setup and update then run the self-check and propagate its failure (run-selfcheck:2, run-selfcheck:16). A successful write on that supported path would exit red solely because the self-check's own fixtures need Git. **Origin:** born of r7's removal of the S3/S4 note fallback.

3. **The one-case Gate 3 rule misses an allowed `plansDir`.** r7 says a `plansDir` outside `docs/` is held out by Gate 3 and uses that as the condition for its sole scratch fallback (plan:116, block E:558). The schema permits a relative value such as `.aiwf/plans` (schema:311), but Gate 3 expressly allows `.aiwf/**` (guard:93) and this repository ignores `.aiwf/` (.gitignore:1). In that configuration the stated fallback never applies, while the draft and readiness history go to an ignored location and the prescribed ordinary `git add` cannot land them. The plan leaves this supported path without a scope boundary. **Origin:** born of r7's exclusive "one case" rule and its stated `outside docs/` condition.

**Carried-list status:** 1 CLOSED; 2 CLOSED; 3 CLOSED; 4 CLOSED; 5 STILL OPEN (blocker 1 above).

**Non-blocking notes:** The r7 plan hash matches `own-pass.md`. The tree remains on `main` at `2e1521d`, with the draft and readiness files untracked.

**Disputed decision:** The release-order defect is resolved for this plan: its trace follows the written push -> green CI -> tag rule. Whether to adopt the recorded one-push practice as a general rule remains an operator decision.

**Next action:** Return these blockers to the COO for an r8 revision, delta consequence scan, fact-check, and new own-pass stamp. Any pass beyond the configured two requires the separate operator word and budget/limits gate.
```

The configured passes (2) are exhausted. Pass 3 = the hard maximum, only on the operator's own word.

## r8 (2026-10-02) - after pass 2

Closes exactly the three blockers:

- Blocker 1 (carried 5) - acceptance: the hunk may have at most TWO old lines (`:124` and its wrap
  `:125`), and a CONTENT guard: every removed line must be one of the two allowed lines (contains
  "the plan is copied into" or "every ticket in it is closed with its completion record"); an edit
  to `:126` measured on a scratch copy: one hunk `-124,3` -> regex 0, content guard 1.
- Blocker 2 - worklist 7(d), D5, block M, acceptance: S3/S4 keep ONE fallback named by code - a
  missing git binary (`spawnSync('git', ['--version'])` -> `r.error.code === 'ENOENT'`) makes them
  notes with the reason "git is not on PATH", so a setup/update on a host without git stays green;
  every other deviation is FAIL (a broken fixture never yields ENOENT); on this machine the
  acceptance is `6` / `0` with no alternative.
- Blocker 3 - D1, block E (new last paragraph), "Извън обхват": the rule assumes a tracked
  plansDir (the Git canon); a plansDir under scratchDir or any ignored path is outside the rule by
  construction and said so in one sentence; a self-check observation for it is a candidate.
- Delta scan 4 (rows 85-105) and delta fact-check r5 (39 claims, 5 FALSE, gaps A3 B4 C1) ran over
  r8 and were closed INSIDE r8 before the stamp: the added side of the template diff is bounded
  (count 2-3, the :125 continuation kept, `moved there from its draft` present, `is copied into`
  gone from the self-install CLAUDE.md and the seed after `--apply`); fixture spawns get
  `GIT_CONFIG_NOSYSTEM=1` + `GIT_CONFIG_GLOBAL=<empty>`; the probe runs without cwd and the fixture
  is created first; block M describes a git-less host as it is; "this skill" -> "this rule"; the
  plansDir description says "a tracked path"; the boundary names both mechanisms (`.aiwf`: Gate 3
  never holds; another ignored path: Gate 3 holds, `git add` refuses); the plansDir detection is a
  candidate written to CANDIDATES at landing; four anchors corrected.
- Own pass restamped over r8 (third stamp, BLOCKERS FOUND 6).

Stamps: r6 `60276712bdfebbcd164bebb835059e37fe632d47fa4ab093231091616d8581a9` (pass 1); r7
`e81cd4299b9bdc9989a83d60e4932286a0beaa3bcc133fb7043f919b0dc141b4` (pass 2); r8
`5440f80091b4f433fcb5dd6b73fa2cbcdf2be0ad30d1467581a162533aa75a28` (the text pass 3 is
dispatched over, on the operator's own word - the hard maximum).

Gate event (for CANDIDATES § Event ledger at landing, a CATCH): the r8 gate run refused the brief
first - six delta-scan rows (87, 94, 95, 96, 104, 105) carried seven cells (a surface cell beside
"none found"), `scan-row-shape` x6 - fixed, re-run exit 0; the tampered-hash face exit 2. The first
live refusal of the 0.2.15 gate on a real defect, spending nothing.

## Pass 3 (2026-10-02, session "PNP 0.2.16") - Codex gpt-6-sol/xhigh, cold, over r8 (stamp `5440f800...5a28`) - the hard maximum

Operator word: "добре нека да има трети пас, само че това е тавана и се постарай да минеш одитор".
Brief carried pass 2's three blockers verbatim + the carried-list status + the origin duty; the gate
accepted it (after the six scan-row-shape fixes above). Tokens used 92,438. Verdict verbatim:

```
NEEDS-FIX

1. **The template edit boundary is still unenforced.** Plan:760-763 accepts one hunk with two removed lines and **three added lines**. In the template:124-126, a patch can replace the permitted lines 124-125, insert an unrelated third line before the unchanged archive instruction, and still satisfy the hunk, content, phrase, and count checks. Acceptance can therefore pass content outside the permitted sentence. **Origin:** carried blocker 1 from pass 2 (pass 1's blocker 5); r8's added-side guard does not close it.

**Carried-list status:** 1 **STILL OPEN** for the reason above; 2 **CLOSED** - the `ENOENT`-only Git fallback keeps a host without Git green while other fixture failures remain failures; 3 **CLOSED** - r8 states the ignored-`plansDir` scope boundary and its two Gate 3 cases.

**Non-blocking notes:** The plan hash matches the third own-pass stamp. The tree is on `main` at `2e1521d`; the draft and readiness files remain untracked. No files were changed.

**Disputed decision:** The release trace follows the written push -> green CI -> tag rule. Adopting the recorded one-push practice generally remains an operator decision outside this plan.

**Next action:** Return the remaining template-boundary blocker to the operator. This was the authorized hard-maximum pass; there is no pass 4 in this cycle.
```

Cycle state: pass 1 NEEDS-FIX 5, pass 2 NEEDS-FIX 3 (4 of 5 closed), pass 3 NEEDS-FIX 1 (2 of 3
closed). The one open blocker was returned to the operator with the COO's proposed closure (pin the
added template lines literally in the acceptance); no pass 4 exists in this cycle.

## r9 (2026-10-02) - after pass 3, on the operator's word "1" (close on the COO's account, approve without a further pass)

Closes the one blocker and nothing else: worklist 8's CLAUDE.md.tmpl bullet names the two old
lines (:124-125) and the three new ones verbatim - block T - and the acceptance compares the diff's
added side byte for byte against block T (`.aiwf/drafts-block-T.txt`) and requires the hunk header
`@@ -124,2 +124,3 @@` exactly; `every ticket in it is closed with its completion record` (now split
across two lines) is replaced as the kept-continuation grep by `completion record, it is moved to`.
Measured on a scratch copy both ways (own-pass.md, fourth stamp). No auditor pass follows; the
next audit is the code pass over the Writer's diff.

Stamps: r6 `60276712bdfebbcd164bebb835059e37fe632d47fa4ab093231091616d8581a9` (pass 1); r7
`e81cd4299b9bdc9989a83d60e4932286a0beaa3bcc133fb7043f919b0dc141b4` (pass 2); r8
`5440f80091b4f433fcb5dd6b73fa2cbcdf2be0ad30d1467581a162533aa75a28` (pass 3); r9
`30ec628e47d42acc4d91316c55dd13571ac90d291b2b15247057a4fcc4bd5ccd` (the approved text, stamped
before the landing; the landed plan's hash - after the approval note in the header - is recorded
below at the landing).

Verdicts: pass 1 NEEDS-FIX, pass 2 NEEDS-FIX, pass 3 NEEDS-FIX (all above, verbatim). Approved by
the operator ("1") after r9 closed pass 3's one remaining blocker on the COO's account.

## Landing (2026-10-02)

`mv dev/backlogs/drafts/PLAN_DRAFTS.draft.md dev/backlogs/active/PLAN_DRAFTS.md` (plain rename -
`git mv -n` on the untracked draft = 128); approval note added to the header; names check before
`git add`: `test -f` on the four fixed names - nothing MISSING; `ls fact-check-r*.md` = 5; no
scratch artifacts to move (`.aiwf/plan/` holds RDY and RGATE only - HARD-023's inventory).

Hashes (D3 - the only difference between them is the approval note):
- stamp over the audited r9 draft: `30ec628e47d42acc4d91316c55dd13571ac90d291b2b15247057a4fcc4bd5ccd`
- `plan-gate.js --hash dev/backlogs/active/PLAN_DRAFTS.md` after the note: `0f2a0f7fb3398b898c2d742eb681172ae57cbc789edf9b54a9fbbaca95fd0801`

Docs commit: the plan, `readiness/DRAFTS/` (9 files - the first readiness history in git),
CANDIDATES rows (pointer, candidate, three pass rows, two event rows, one D2 pointer row) and the
three HARD-023 pointer lines in PLAN_HARD - commit `c0dc0cc`.

Post-landing edit (2026-10-02, same session): the operator changed the release rule by guard (g)
("да за правилото" - tag locally + main and the tag in one push, CI after; home
`dev/PROJECT_OVERRIDES.md` § Release discipline + § Test policy, D2 pointer row in CANDIDATES); the
plan's trace step 2 gained a one-line bracketed note saying execution follows the new text. The
active plan's hash after that note: `5a63c52bb44782b951df5a399d64494ab336a3dbd14588f0b6bb6f9b8b1e8c84`
(the difference from the landed hash above is that note alone; the audited text is unchanged).
