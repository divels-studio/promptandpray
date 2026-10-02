# Fact-check r5 - PLAN_DRAFTS (Step 2b delta over the r8 draft, 2026-10-02, session "PNP 0.2.16")

One Explore/sonnet agent over the r8 passages (the template-boundary acceptance lines, worklist
7(d) S3/S4 fallback, D5, block M, D1's boundary sentence, block E's last paragraph, "Извън обхват",
the `S[1-6]` parenthesis) with the three standing extra instructions; ledger rows B2, B4, B5, D1,
A11 re-anchored (no mismatch). CLAIMS: total=39 verified=26 false=5 unverifiable=6. GAPS: A=3 B=4
C=1. Every row and gap closed in r8 (same revision - delta scan 4 and this check ran over r8
before the stamp).

## FALSE rows and closures

| r8 line | finding | closure |
|---|---|---|
| 397 | `run-selfcheck.mjs:16` is contract point 3; the red-child-exits-1 contract is point 4 at `:18` | anchor `:2,18` |
| 399 | "a broken fixture argument never yields ENOENT" - a missing `cwd` gives ENOENT (`syscall 'spawnSync git'`) | 7(d): the `git --version` probe runs WITHOUT `cwd`; the fixture is created before S3; a missing fixture directory is a FAIL of S3, never the fallback |
| 95 | `docs/WORKFLOW.md:665-671` is the archive paragraph; "the Git canon" is guard (e) `:234` (§ Operator-interaction guards), "Git-tracked history" is `:626` (§ Durable development history intro) | D1 and block E cite guard (e) `:234` and § Durable development history `:626` |
| 96-97 | `pretooluse-mutation-guard.js:93` is the `isAllowlisted` head; the `.aiwf` rule is `:98`; the file is under `scripts/engine/` | anchor `scripts/engine/pretooluse-mutation-guard.js:98` |
| 96-97 / block E / 709 | "Gate 3 never holds a session out of it" is true for a plansDir under `.aiwf` only; another ignored path (`build/plans`) IS held out by Gate 3 on an open route | D1 and block E state the two mechanisms separately; both outside the rule by the same result (nothing reaches git, `git add` refuses with exit 1) - gap C closed the same way |
| 396 | `SKILL.md:15` is the sentence head; the explicit-root clause is `:16` | anchor `:15-16` |

UNVERIFIABLE (6): the post-`--apply` grep on `CLAUDE.md` (future state); "everything else is FAIL"
(design of code not yet written); "nothing else in the self-check needs git" (the file was not
audited whole - ledger B5 says no `spawnSync('git'` exists today, which is the whole claim);
`[PASS] [drafts-S1..6]` = 6 (the checks do not exist yet; the command exits 1 today, so it can
fail); the example project's lack of git/.gitignore (ledger A11, verified in r1).

## Gaps and closures

A (3): the `:16` anchor (closed); the ENOENT-by-cwd sentence (closed - probe without cwd, fixture
created first); `S[1-6]` = 6 machine-conditional (closed - the acceptance runs on this machine and
the line says so; a NOTE here is a defect by the plan's words).
B (4): the WORKFLOW anchor; the guard anchor; the "another ignored path" claim; the SKILL.md anchor
- all closed as above.
C (1): D1 / block E / "Извън обхват" vs D4 for non-`.aiwf` ignored paths - closed by stating both
mechanisms (scan row 103).
