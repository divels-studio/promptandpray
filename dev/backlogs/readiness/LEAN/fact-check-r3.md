# Fact-check r3 - PLAN_LEAN (Step 2b, delta over the r3 draft)

One Explore/sonnet agent, 2026-10-04, HEAD 77936fc, over the parts r3 changed (D6, D7, D8, 2(d), F1,
6(a), 7, 8(a), 9(a), S7, the acceptance greps) with the three extra readiness instructions. It ran the
plan's helper code as written (node v24.12.0, win32; the other platforms simulated) over the ten
matrix inputs and the non-listed inputs `''`, `.`, `./`, `.aiwf/`, `./.aiwf/plans`, `/.aiwf/plans`,
`../.aiwf/plans`.

CLAIMS: total=119 verified=102 false=8 unverifiable=9 - GAPS: A=3 B=3 C=3

Measured facts kept by the plan: `.git/config:7 ignorecase = true` in this repo and
`git check-ignore -v .AIWF/plans` matching `.gitignore:1:.aiwf/` (D6); the interview's `warn(value)`
contract unbroken by a destructured option (7(b)); `path` imported at generate.mjs:97 and required at
aiwf-selfcheck.js:60; the two acceptance greps for the bullet opening (new -> no output rc=1 today;
old -> `docs/WORKFLOW.md:1` today).

## FALSE rows and their closure

| # | claim (r3) | correct value | closure |
|---|---|---|---|
| 1 | revisions r3 "closes exactly the two blockers, nothing new" | r3 added a host-platform default on two helpers, host-dependent test expectations, a Gate 3 "safe direction" sentence and a platform proxy for git's core.ignoreCase; left ledger A5/B6 and scan row 20 stale | r4/r5: the design replaced (declared-os flag, default false); revisions r3 says so; A5/B6 and row 20 rewritten |
| 2 | ledger A5 DOES: two-field signature | three fields (then `foldCase`, now `windowsPaths`) | ledger A5 rewritten to the r4/r5 contract |
| 3 | ledger A5 NOTE (b): unconditional lower-casing, `.AIWF/plans` under | folding conditional | rewritten |
| 4 | ledger A5 NOTE: "eight-case matrix" | ten inputs | rewritten |
| 5 | ledger B6 DOES: two parameters | three | rewritten |
| 6 | ledger B6 NOTE: "mirrors A5's norm exactly - lower-case" | conditional | rewritten |
| 7 | ledger B6 NOTE: "eight-case matrix is S7's second half" | ten inputs | rewritten |
| 8 | scan row 20 closure: unconditional `toLowerCase()` "as Gate 3 does", `.AIWF/plans` under | the fold is conditional and linux differs | row 20 re-closed in r4 |

## Gaps and their closure

A1 (block F1 shown flush-left, the Writer must choose the indent) - r4: F1 is the WHOLE bullet with
the list indent. A2 (the two greps pass if the retained tail or the second sentence is dropped) - r5:
greps for `or is marked explicitly` -> 1 and `before writing a factual claim it acts on` -> 1, and the
byte-for-byte diff of the bullet against `<OUT>/lean-block-F1.txt`. A3 (the default-platform matrix
case mirrors the implementation) - r4: no `process.platform` anywhere; explicit flag faces and the
`os`-wired fixture faces. B1 (platform as a proxy for `core.ignoreCase`; darwin/linux unverifiable) -
r4/r5: the flag follows the project's declared `os`, folds for windows only, where the repo measured
git folding; macOS and linux compare as written, with the limit stated in D6; the comments carry no OS
facts beyond "compared as written". B2 ("folding is the safe direction" is evaluative; the guard calls
it leniency) - r5: D6 says the guard's own comment calls it a leniency, which an allowlist can afford
and a reported fact cannot. B3 (revisions r3 "nothing new" false) - revisions r3 reworded. C1 (ledger
A5/B6 stale) - rewritten. C2 (scan row 20 stale) - re-closed. C3 (no delta scan / restamp recorded) -
delta scans 2 and 3, `fact-check-r3.md`, `fact-check-r4.md` and the second stamp recorded in
revisions.md.

Readiness classes named: 14 (the r3 closure added surface - replaced), 2 (library/OS behavior
asserted from memory - the comments no longer assert it), 12 (the F1 indent - closed), 8 (the greps
that could pass on a partial replacement - closed by the diff instrument), 7 (stale ledger pointers -
rewritten).
