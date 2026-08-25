# Review & QA Checklist

Verdict authority for the **Reviewer** (code/design) and **QA** (runtime/UI). Both roles are
**engine-neutral**: the host is data in the project's `.claude/aiwf-native/roles.json` (resolved by
`scripts/native/ps/aiwf-roles.ps1`). `/pnp:review` and `/pnp:qa` dispatch either the read-only Codex
wrappers `scripts/native/ps/codex-review.ps1` / `scripts/native/ps/codex-qa.ps1` (brief on **stdin**
under an OS `--sandbox read-only` boundary they cannot escape; recipe:
`docs/CODEX_REVIEW_QA_RECIPE.md`) **or** the `reviewer` / `qa` Claude subagents (`Read/Grep/Glob`
only - read-only by Gate 1 + the tool allowlist, with no OS cell; the hard OS boundary applies only
on the codex path). Either way they report; they do not fix, stage, commit, or push. Routing and the
ticket-brief contract live in `docs/WORKFLOW.md`; the native mapping is `docs/LOOP.md`.

## Plan readiness (before implementation)

For durable R2 and all R3 plans, the Reviewer performs two full read-only passes before execution
approval. Pass one finds all visible material gaps; after the COO revises, pass two re-reads the
entire plan. If blockers remain, the COO may revise once more and run one final third pass - but
only with the **operator's explicit permission, requested before the dispatch**: any pass beyond the
standard two is a budget/limits-gated operator decision, whatever engine hosts the Reviewer. Three
passes are the hard maximum; if the plan still does not pass, stop and return the unresolved
blockers to the operator. The Planner/COO never approves its own plan.

Check only that the plan matches the repository, has clear scope, contains no hidden discovery or
unresolved architecture, sequences executable work correctly, uses real acceptance/verification, and
has valid branch/worktree/Git prerequisites. Return only `PASS` or `NEEDS-FIX` with concise
actionable blockers. Do not require a universal DoR/DoD, create an audit document, or review
formatting for its own sake.

## Given per brief: risk threshold + stop condition

Every R2/R3 brief hands the Reviewer and QA:

- a **risk threshold** - the defect severity that blocks. Block at or above it; record anything
  below it as a non-blocking note, not a blocker.
- a **stop condition** - when enough evidence exists and the role must stop.

Neither role is obligated to invent findings; absence of defects at the given threshold is a valid
`pass`. Stop when the stop condition is met - do not keep digging. The implementation loop is capped
at `loop.correctionRoundsCap` correction rounds; plan readiness follows its separate two-pass
contract above.

---

## Reviewer - code & design correctness (NOT runtime QA)

Priority: correctness -> security/tenant isolation -> product-boundary alignment -> missing tests ->
stale/contradictory docs. Style is secondary unless it affects maintainability.

The product-boundary slot is deliberately empty in the payload: its content is the project's
`review.productBoundaryChecks` (empty by default), which is also rendered into the reviewer agent.
If that list is empty, there is no project-specific boundary to enforce and the priority order is
otherwise unchanged.

- Read the **actual diff**, not the summary. Do not accept optimistic prose.
- Every acceptance criterion maps to a proof. A missing proof surface is a completion blocker even
  if existing tests are green.
- Proof for algorithmic/matcher/routing/transform/parser logic MUST exercise the production function
  or an extracted production helper - mirrored test-local logic is not proof.
- Assertions must be unconditional. `expect()` wrapped in an `if` that passes silently when false is
  rejected.
- A runtime check gated only behind an optional flag/param/shape, skipped on the default path, is
  incomplete implementation.
- Tenancy/security/i18n: every tenant-owned query carries the project's tenant key; new
  tables/endpoints have their access policy; server-only code (providers, external APIs, model
  calls) does not leak into the client bundle; no hardcoded user-facing strings, labels,
  aria-labels, toasts, or error text - new hardcoded user-facing text is a fail condition.
  Migrations live in the correct dir, correctly named, incremental to scope.

The Reviewer does not reproduce runtime behavior - that is QA's job.

## Review dimensions by defect class

Read the diff against each class below. Not a flat pass; group findings by the class they belong to.

### Regression & back-compat

- A pre-existing happy path breaks.
- Silent behavior change for legacy payloads/state.
- Old->new path drift without explicit migration/compat handling.

### State & data safety

- Stale state / cache / template / derived-data reuse.
- A null/undefined/empty path that now throws, skips, or silently blocks.
- A duplicate/conflict path with unclear precedence.

### Logic & contract

- Edge cases break the contract under a green happy path.
- First-match / last-match / overwrite without explicit authority.
- Unstable ordering; result depends on input/token order under ambiguity.
- An enum/status/value silently dropped.
- Warning/error semantics redefined locally.
- A promised field missing from the real exported type.
- Multi-row source reduced to the first item without authority.
- Empty/null/malformed input unhandled; invalid values passing silently.
- Type-level compatible but runtime-incompatible for existing consumers.

### UI & runtime

- All claimed states actually render (empty/loading/success/error/blocked).
- Hidden state that never becomes actionable.
- The user can actually complete the flow.
- A disabled/blocking state without a working resolution path.
- Stale parent/child props/state.
- A UI action not backed by actual data.
- Route exit/remount/refresh regression.
- Selection/state cleanup drift; stale browser/session/local storage.
- Visible copy contradicting actual behavior/state.

### Persistence & consistency

- Claimed metadata/decision actually persisted where stated.
- Create/load round-trip mismatch.
- Legacy rows/templates/profiles reinterpreted incorrectly.
- Nullable/non-null drift without defensive handling.

### Tenancy

- Cross-tenant leak via reuse paths (template/profile/row reuse as a leak vector) - complements the
  positive tenant-scoping rule above.

### Scope integrity

- Hidden coupling to an adjacent module/consumer not proven.
- A broad claim in the report backed by narrow proof.

### Verify truthfulness

- Required verify commands executed literally.
- Reported result matches the actually executed command.
- "Tests written but not run" is not proof.

### Proof adequacy

- When the brief requires real fixture/input/data proof, the tests must actually use it - synthetic
  builders/mocks that hide the required proof surface, and green synthetic-only scenarios, are not
  proof.
- An obvious missing unhappy-path test is a named blocker.
- Extraction remedy: if the production surface is not directly testable, extract a contract-safe
  helper/module and test that - never a mirrored algorithm in the test file.

### Test quality

- Behavior over implementation detail.
- No blind snapshot/fixture update without a real contract assertion.
- No stale test names/expectations.
- A Contract Justification is required whenever a failing assertion is adjusted.
- Named-fixture mismatch -> STOP and report, never silently redefine the expectation.

### Verdict discipline

- A runtime crash, a typecheck failure, or an in-scope assertion failure is a completion blocker -
  `pass` with "fix later" is forbidden.
- Invalid partial completions (all invalid): a UI-only fix for a data/service/model-layer problem; a
  model/service change without behavioral proof; page-load/smoke-only tests where behavior proof is
  required; "almost done" with a known core gap.
- i18n carve-out: internal-only diagnostic strings (logs, debug fields never rendered) are
  acceptable if clearly separated from the user-facing contract.
- On zero findings, state explicitly "No findings" and list residual risks / testing gaps.

### Severity scale

- **P1** - correctness / security / data-loss / runtime-breaking.
- **P2** - a material contract/behavior defect.
- **P3** - narrow local polish.

Each finding carries a one-line "why this is not minor polish"; briefs' risk thresholds reference
this scale.

### Routing note

- UI / route / navigation -> UI & runtime class.
- Data / auth / multi-tenant / server actions -> tenancy + persistence classes.
- Helpers / transforms / analyzers / matching -> logic & contract class.

## QA - real, observable behavior

Engages only when the brief declares observable runtime/UI behavior (never R1, never non-runtime
R2).

- Verify what the software DOES against the acceptance criteria, not code style.
- QA is an **artifact judge**, not a live browser. QA never drives a browser and never starts a dev
  server (a Codex-launched browser cannot run under the read-only sandbox - see
  `docs/QA_BROWSER_INVESTIGATION.md`). Instead: the Writer authors an E2E `.spec` from the acceptance
  criteria, the orchestrator runs the configured test runner, and QA reads the resulting artifacts
  (JSON report, traces, screenshots) and judges them against the criteria. On the **codex** host that
  read is under a hard OS `--sandbox read-only` cell; on the **claude** host QA is a
  `Read/Grep/Glob`-only subagent held read-only by its tool allowlist + Gate 1, with no OS cell. (For
  live exploratory browsing there is a separate, operator-gated surface - QAL - which is NOT
  read-only; never invoke it from the QA role.)
- Never claim PASS without a real reproduction backed by concrete artifact evidence: exact
  test/flow, account/tenant context if relevant, expected vs actual result, the JSON assertion or
  trace/screenshot that shows it. "Looks correct" is not a pass.
- If the run produced no usable artifacts (missing/empty/unreadable), report `BLOCKED` as a
  precondition - do not silently pass and do not use `BLOCKED` to defer a real defect.

## Fail aggregation (both roles)

On `fail`, list ALL already-visible material blockers in the SAME round. A material blocker is any
real product/runtime/contract/proof/i18n/UX issue that by itself prevents an honest `pass`. Do not
serialize fail reasons across rounds; a later round may not raise a "new" blocker that was already
visible. For each blocker: name the exact failing surface and require proof on that exact surface;
forbid proxy closure (adapter-only, type-only, unit-only, prose-only, generic green test).

## Verdict (both roles)

Return exactly one:

- `pass` - sufficient at the given risk threshold (Reviewer: code/docs; QA: runtime proof present).
- `pass-with-notes` - acceptable now; narrow, local, non-blocking notes remain.
- `fail` - a material blocker at or above the risk threshold prevents an honest pass.

List blockers first, then non-blocking notes, then the exact next action (the literal missing
command when the blocker is a verify mismatch). Return to the COO. Never declare a patch accepted
while required runtime proof is missing, a blocker remains, docs contradict the implementation, a
security boundary is only assumed, or a test failure was ignored.
