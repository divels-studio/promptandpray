# Fact-check r1 - PLAN_DRAFTS (Step 2b over the r1 draft, 2026-10-02)

Two Explore/sonnet agents: (A) the ticket section, handed the decisions and ledger.md; (B) the
shared sections + the behavior ledger rows. VERIFIED rows are not copied here (they changed
nothing); every FALSE, UNVERIFIABLE and gap row is, with the COO's closure (where it landed in r2).

## Agent A - ticket section: CLAIMS total=83 verified=70 false=10 unverifiable=3

FALSE / UNVERIFIABLE rows:
| doc line (r1) | claim | finding | closure in r2 |
|---|---|---|---|
| 218-221 | sabotage string `path.join(merged.paths.plansDir, 'drafts')` removes the array entry | FALSE - occurs twice after worklist 5 (containment ~:1055 first) | worklist 6(d): the exact two-element array substring, exactly-one-occurrence guard, `node --check` |
| 267 | CLAUDE.md.tmpl:124-126 and :72 "true" (unchanged) | FALSE - :124 says "copied into" while 3(a)/seed say moved | D7 reworded: the region says WHERE, not how; guard (e)/seed say "lands in active/ (moved from drafts/)"; tmpl:126 added to the closing-grep exceptions |
| 273-276 | "the nine places above + ..." hit `archive/` | FALSE - the real hit list differs (WF:667, tmpl:126, no seed hit for approved-plan, SC:5417) | worklist 8: explicit hit list of 14 lines |
| 299-300 | dev/README.md:11,21 list active/archive | FALSE - :11 names only active/ | worklist 11(d): :21 only |
| 363-364 | CL "deleted at landing" | FALSE vs block E/D3 "moved" | CL: "moved to active/ at landing" |
| 371-373 | CL "the three places" | FALSE - six sentences | CL and D6: six |
| 389-390 | `is gitignored` = 3 hits | FALSE - 4 (RS:232, :358, :547, qa:311) | acceptance baseline 4 |
| 391-392 | test-setup prints `FAIL as required` | FALSE - test-setup prints only `[PASS|FAIL] <name>` | acceptance: `[PASS] [setup-drafts-ctl-1] sabotage detected` |
| 403-405 | `git status -- dev` = only PROJECT_OVERRIDES | FALSE - dev/README.md changes; drafts/readiness untracked today | acceptance: two ` M` lines; drafts/readiness committed at landing before dispatch |
| 407-410 | VERIFY rows include plugin-validate | FALSE - not in any Test policy row | VERIFY: plugin-validate by COO decision (skills change; RGATE precedent) |
| 334-335 | "git does not keep an empty directory" | UNVERIFIABLE (read-only role) | kept as git behavior, stated as such in D3 |
| 345-350 | W "three trees / two consumer installations" | UNVERIFIABLE (operator testimony) | W reworded: "this repository and, as its operator reported, two consumer installations" |
| 393-397 | selfcheck prints `present` here | UNVERIFIABLE (depends on landing state) | acceptance: `present` or `not created yet` for drafts; `present` for readiness |

Gaps A (12): control output literal (closed, acceptance); sabotage string twice (closed, 6(d));
`ignored` substring of `NOT ignored` (closed, 7(d) exact equality/prefix); block E "is gitignored"
lands in RS so the absence grep cannot pass (closed, block E reworded without the phrase; baseline
4); drafts/ at VERIFY (closed, either text accepted); literals not fixed - observation names, main()
call site, HIERARCHY row, ops.json shape and note text (closed, 7(b)-(d), 6(c), 10 + block N);
diff guard dev/ (closed); provenance on untracked + abs path/project name grep (closed, `--untracked`
and the second grep); risk-threshold observability - schema diff, op-set, prose (closed, acceptance
"Risk threshold, наблюдаем"); "дословно" blocks unchecked (closed, one fixed line per block);
PO:321 (closed, 11(c)); validate-payload `<root>` placeholder (closed, fixed parts).
Gaps B (6): counts and lists above (closed). Gaps C (5): CL deleted/moved (closed); CLAUDE.md.tmpl
(closed by D7 wording + exception); closing grep exceptions (closed, three named); "Gate 3 out of
scope" vs prose edits (closed, out-of-scope says hook code); gitignored count (closed, six everywhere).

## Agent B - shared sections + behavior ledger: CLAIMS total=155 verified=120 false=24 unverifiable=11

FALSE rows and closures (r2):
| r1 line | finding | closure |
|---|---|---|
| L10 | "тази чернова се трие" vs D3 git mv | header: "се МЕСТИ" (and D3 rewritten - see A gaps) |
| L20-22 | :379-380 lacks "gitignored" | Context quotes the three sites separately |
| L24-25 | 43 files, actually 42 | Context: 42 (`find .aiwf -type f`) |
| L31, L34 | schema :300-331 / :322-328 | :301-330, :323-329 |
| L38-40 | test-setup :183-185; interview :15 | :183-184; :219 only |
| L36-37 | plan() | planInstall (:928) |
| L54-55 | WF:537 "is gitignored" | quoted as "the gitignored `.aiwf/route-state.json`"; six sentences listed by wording |
| L63 | all pointers say "parent of" | split into two groups |
| L79-83, L440-441, L439-441 | git mv of an untracked draft; approval note breaks the stamp | D3 rewritten: plain rename + git add; both hashes in revisions.md; "историята ѝ остава" dropped; block E and trace say the same |
| L102-105 | driver :7893-7945 | :7898-7938 |
| L105 | "без лъжа" - note() prints "not exercised: present" | D5/7(a): a third finding kind `observation: true` printed by `observation()` - no "not exercised" |
| L108 | "четирите изречения" | six, listed |
| L126 | COO routing check 1 = no | = yes (migration 0020) -> top tier |
| L442-443 | main = origin | main 2e1521d, origin 542c664, stated |
| ledger:13,15,20,27,31 | wrong anchors in ledger.md (check() :60-64; [SKIP] :1649; driver :7898-7938; note spec :145-157 / rules :401-413; --check :164-181) | corrected in ledger.md (see its header note) |
| ledger footer | "CHAIN ENDS EARLY: none" while H5 UNREAD; 47 rows vs 43 in revisions | footer reworded; revisions says 47 |

UNVERIFIABLE (11): operator quotes and consumer testimony (stated as such in r2); "first live use of
the gate" (reworded "по записите няма по-ранна"); own-pass.md / fact-check-r1.md not yet written
(now written); "Write tool creates the parent" (dropped - r2 says the consumer creates them);
`.aiwf/` dir-only pattern (measured by agent A: exit 1 on a nonexistent path - kept); checks 2-4 of
COO routing (depend on the worklist - stated).

Gaps A (8): git mv fails (closed, D3); approval note breaks the stamp (closed, D3 both hashes);
planning lock never named in the trace (closed, trace step 0 + D11 + 3(e)); interlock mechanics only
in archive/007 (closed, Review block restates them); pnp-live refresh after the landing commit + Gate 4
dialog (closed, trace 1); brief spec lacks PREVIOUS PASS BLOCKERS / BUDGET TARGET (closed, trace 1);
who moves the scratch stand-in files (closed, D4 + block E: the COO, as a landing step); observations
cannot fail on broken work (closed, D5: the printer is what S1-S4 can fail).
Gaps B (18): anchors and counts above (closed); ledger rows for existingPlansWarning,
run-example-cycle.mjs:480,618, first-use directory creation, and NEW-row contracts (closed in
ledger.md: rows A10, A11 added; NEW contracts stated in the worklist - Step 2e block E, S1-S4 in
7(d), setup-drafts-ctl-1 in 6(d), COLLISIONS/HIERARCHY rows in 6(b)-(c)).
Gaps C (4): header vs D3 (closed); gitignored counts (closed, six / baseline 4); observations vs
Risk threshold wording (closed, exempted by construction); tag-before-CI vs written rule (closed,
trace 2: operator exception until the § Release discipline text is approved).
