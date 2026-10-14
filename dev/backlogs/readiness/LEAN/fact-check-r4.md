# Fact-check r4 - PLAN_LEAN (Step 2b, delta over the r4 draft)

One Explore/sonnet agent, 2026-10-04, HEAD 77936fc, over the parts r4 changed (header, D6, D7, D8,
2(d), F1, 6(a), 6(b), 7(b), 8(a), 9(a), 9(b), 9(c) S7, blocks E1/M/N/CL, the acceptance lines, the
one-line-literal list, revisions.md r4, the closure cells of scan rows 38-57, ledger A5/B6), with the
three extra readiness instructions. The document drifted while it worked (the COO closed delta scan 3
and rewrote A5/B6 in the same window); it checked the plan as it stood at the end (1091 lines). It ran
the ten 8(a) inputs through the exact 6(a) code and the ten S7 inputs through the exact 9(a) code: all
twenty results as the plan states (string/null, true/false); `.AIWF/plans` + `os: windows` -> under,
`c.os = 'linux'` -> outside through the helper; `git check-ignore -v .AIWF/plans` re-run: rc=0,
`.gitignore:1:.aiwf/`; the three bullet greps over docs/WORKFLOW.md today: new opening no output
rc=1, old opening `1`, old middle `1`.

CLAIMS: total=141 verified=117 false=11 unverifiable=13 - GAPS: A=7 B=10 C=4

## FALSE rows and their closure (r5)

| # | claim (r4) | correct value | closure |
|---|---|---|---|
| 1 | D6 names the unusable text `config paths unusable - nothing to observe` | 9(b) prints `config paths or os unusable - nothing to observe` | plan: D6 aligned to 9(b)'s text and says why it differs from the neighbours |
| 2 | D7's interview snippet omits `windowsPaths` | 7(b) passes `windowsPaths: os === 'windows'` | plan: D7 snippet carries it |
| 3 | 1(c) sentence at SKILL.md:381-382 | it starts at :380 | plan: `:380-382` |
| 4 | 9(c) "S8 reads the S2-base finding and runs no new projectLayerFindings" | `byId` (:5537) re-runs it on every lookup | plan: S8 = `byId(s2, 'plans-under-scratch')`, one more call, the S1/S2 shape; the git-spawn cost stated |
| 5 | acceptance hunk guard `^@@ -578,4 \+[0-9]+,8 @@` -> 1 | the correct replacement yields TWO hunks under -U0 (`@@ -578 +578 @@`, `@@ -581 +581,5 @@`) because :579-580 are byte-identical | plan: replaced by `awk ... \| diff - <OUT>/lean-block-F1.txt` (the bullet from its new opening to the next bullet, byte for byte against the pinned block) |
| 6 | revisions r4 "11 with a surface, 9 none found / no defect" | 16 rows with a violating surface, 4 `none found`; 11 `plan:` and 9 `no defect:` closures | revisions.md r4 corrected |
| 7 | D6 states "a mount whose case rule differs from the declared os" (scan row 45 closure, revisions r4) | no such sentence existed | plan: D6 carries the mount sentence; row 45 closure says r5 |
| 8 | revisions r4 "Nothing else changed" | delta scan 3, the 9(b) guard, S8, the hunk guard and A5/B6 were post-r4 | revisions.md: r5 section records them |
| 9 | scan row 57 closure quotes the comment as "as that file system and git's ignore matching fold them" | the comment wording had changed | row 57 re-closed with the r5 wording |
| 10 | ledger A14 "skills/setup/SKILL.md is not edited and the diff guard does not list it" | 7a edits it and the diff guard lists it | ledger A14 rewritten |
| 11 | ledger A5 "fact-check r3 ran the ten-case matrix" (no such file) | the run was this agent's and r3's; the files are now `fact-check-r3.md` / `fact-check-r4.md` | ledger A5 cites `fact-check-r4.md` |

## UNVERIFIABLE rows (marked, left as they are)

OS facts outside the tree (linux/macos directory case, Windows trailing dot/space and 8.3 names) -
the r5 comments carry none of them and D6 states them as honest limits; the r1 probe's dry-run (not
re-run); "scan agents" (CANDIDATES.md:73 says "агенти") - r5 says "agents"; the no-trailers rule
(now cited to the COO memory `no-claude-trailers-in-git`); the session brief (not in the tree);
`valid: 21 migration(s)` (20 today, as the plan says).

## Gaps and their closure (r5)

A1 the hunk guard cannot pass -> replaced by the byte-for-byte diff (row 5). A2 S8's mechanism ->
`byId(s2, ...)`. A3 8(b)/(c) project not named -> new block 12c over `project('under-scratch')`
after :686. A4 the `unusable` branch without a flipping fixture -> S7 gains `delete c.os` -> the
unusable text. A5 the two `os` call sites untested -> 8(g): two dry-runs (`os: windows` -> note, `os:
linux` -> none) and two scripted interviews (`Operating system` answered linux / windows) over
`.AIWF/plans`, lexical and deterministic on every leg. A6 `"op":` 2 + rerender 1 admits a wrong
second op -> `"op": "note"` -> 1. A7 "redirects under the repo" unobserved -> the example cycle's
byte-identity check is named as the observer. B1 "fact-check r3" cited -> the files exist now. B2
"scan agents" -> "agents" (F2, M, D8, the grep, the list). B3 macOS default volume case-insensitive
-> D6: macOS compared as written, the honest limit stated; the comments keep OS facts out. B4/B5
revisions counts and "nothing else changed" -> corrected; r5 recorded. B6 the mount sentence -> in
D6. B7 row 57's quote -> re-closed. B8 1(c) -> `:380-382`. B9 the no-trailers rule -> cites the
memory. B10 ledger A14 -> rewritten. C1 the two unusable texts -> aligned. C2 D7 snippet ->
`windowsPaths` added. C3 header/revisions vs the files -> r5 header and section; second stamp follows.
C4 ledger B6/B14 -> updated.

Class 14 note from the agent, kept as the record of what r4 had opened: macOS compared as written
(the opposite of r3's fold) - now stated as a limit, not hidden; the os flag through three call sites
with two untested - now tested in 12c; the `unusable` branch without a fixture - now S7; S8 vs `byId`
- now `byId`; the hunk guard that cannot pass - replaced; E1/M/N/CL assert a platform rule to
consumers - deliberately, in one sentence each; the mount limit promised but absent - now in D6;
delta scan 3 unrecorded - recorded in r5.
