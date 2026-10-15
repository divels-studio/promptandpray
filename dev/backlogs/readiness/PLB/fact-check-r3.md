# PLAN_PLB - fact-check gate, round 3 (Step 2b), over r6 and r7 -> closed in r8

Two `sonnet` Explore agents after readiness pass 1: one over the r6 revisions (200 claims), one over
the r7 pointers (91 claims). Both lists folded into r8; the delta consequence scan (rows 117-160)
ran in between.

| document | CLAIMS total | verified | false | unverifiable |
|---|---|---|---|---|
| r6 revisions (Decisions + revised passages) | 200 | 185 | 8 | 7 |
| r7 pointers (D1/D4/D10, resolver, PLB-002 (a)(b), PLB-003 CHANGELOG sentence, PLB-004 (c)) | 91 | 77 | 8 | 6 |
| **total** | **291** | **262** | **16** | **13** |

## FALSE rows and their closure

| claim | correct value | closed by |
|---|---|---|
| check 1 at `WORKFLOW.md:906` | `:905` | corrected |
| `REVIEW_CHECKLIST.md:53` names product boundary checks | `:58-59` | corrected |
| D10 "nothing changes a hook" (r6) | PLB-002 r6 edited `aiwf-lib.js` | r7: helpers moved to `scripts/setup/`; the claim holds again |
| `skipWhen: process.platform ...` on a selfcheck row | `skipWhen` exists only on `DOCTRINE_CONTROLS` (`:6545-6546`) | one row whose expected decision is computed from `process.platform` |
| "the eight literals" | six refused + one accepted | "seven literals", `C:x` added |
| hashes at `:603`, journal at `:985`, `configHash` at `:191` | `:613`, `:996`, `projectionText :195-202` | corrected |
| `scanSupersededLegacy` treats every engine file name as a hook name (as a reason for an `.mjs`) | only `*.js` (`generate.mjs:748`) | reason restated: `scripts/engine/` is the hooks' directory |
| `observation()` at `:111-115` | `:113-116` | corrected |
| "every `/pnp:*` skill" runs `--check` | eleven do; `update` and `selfcheck` are the exceptions | corrected in two places |
| review Step 2e "rewritten" | it carries no allowlist sentence today | "GAINS one", sentence given |
| Execution order "two commits" | three (D10) | corrected |

## Gaps closed

- A: the hook has no `module.exports` / `require.main` guard (siblings do) - PLB-001 worklist adds
  both so the resolver rows can `require` it; `C:x` drive-relative refused; `$schema` never
  refreshed with a journal present (closed in r7, confirmed here); PLB-002 spikes - moot after the
  helper left `scripts/engine/`; PLB-004 (c) fixture rows outside the S6 fixtures (`o.grew !== 4`,
  `:5685-5686`).
- B: "case-sensitive filesystems" wording; Step 2e sentence.
- C: deny-text clause only when `extra` was passed; two containment rules differ on purpose
  (security allowlist vs report location; the hook is CJS); trim divergence stated.
