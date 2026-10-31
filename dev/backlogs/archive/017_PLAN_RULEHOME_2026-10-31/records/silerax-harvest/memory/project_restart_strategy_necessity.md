---
name: project-restart-strategy-necessity
description: "The restart strategy (dev/RESTART_STRATEGY.md) is a HARD NECESSITY for stability and reliability, not a whim; modules are NOT copied; mission 2 (PLAN_AUD, module-by-module audit) is next; the proof - the audit of the sales -> purchases copy (DPU-003, 2026-10-03)"
metadata:
  node_type: memory
  type: project
  originSessionId: de137dec-a39b-43ba-966e-6507a9051f82
  modified: 2026-10-26T06:50:56.053Z
---

**Operator word (2026-10-03, DPU-003, with four exclamation marks):** „стратегията за рестарт не е екзотичен каприз на оператора, а тежка
необходимост от съображения за стабилност и надеждност на системата" (the restart strategy is not an exotic whim of the operator but a
hard necessity for the stability and reliability of the system). Read it every session, not only when planning.

**What the strategy is:** `dev/RESTART_STRATEGY.md` - § 0 Direction (Silerax was written with manual AI orchestration and no independent
auditors; "looks functional, but is not trusted enough to hand to anyone"; the goal is a MEASURABLE reduction of distrust, § 7); § 1 the five
victims (Ж1 regression in production, Ж2 a lost finding, Ж3 a false pass, Ж4 a broken tenant boundary, Ж5 contaminating Furnissimo) and
their preventions; § 9 the stages - Stage 3 = the offensive plan (`PLAN_AUD`, Fable: one audit ticket per module, order A -> B -> C,
a findings register), Stage 4 = module-by-module audit (S0/S1 fixed before the next module). Mission 2 is "next" in § 9 but never
started; the roadmap's order (2026-10-23) parked AUD; the two orders are reconciled at step 4 of the consolidation
(`dev/backlogs/drafts/CONSOLIDATION.md`). Since 2026-10-26 the findings register is history and findings are roadmap lines
(`dev/PROJECT_OVERRIDES.md` § One home for open work). Input for the sales audit: `dev/backlogs/ROADMAP.md` § SLS (ported 2026-10-18 from `dev/CANDIDATES.md`
§ „Продажби — находки от одита на копията (DPU-003)", RESTART_STRATEGY.md:423-425).

**Why modules are not copied (proven on DPU-003, 2026-10-03):** the "Purchases" module (PUR-001..003) was copied from "Sales", which was
never audited. The internal audit of the copy (`.aiwf/dpu003-audit-verdict.md` -> `dev/backlogs/readiness/DPU/`) found 52 findings:
the copy carried over the original's defects (float money, unescaped search, raw error text to the user) AND added its own (client and
server round differently; the notice's VAT locked in the UI only); and the original showed 27 defects, 8 serious (cancellation deletes
received payments; no company check on client ids; `companyId` from the client; a notice against a foreign sale; unvalidated numbers).
A copy of an unaudited module doubles the audit surface instead of reducing it.

**How to apply:**
- A new module modelled on an old one = first an audit of the model (or at least registering its findings), never "copy + rename".
- Planning the next mission without having read the strategy (§ 0, § 1, § 9) is a COO error; `dev/RESTART_STRATEGY.md` is program canon,
  on a par with `dev/PROJECT_OVERRIDES.md`.
- A finding in an old module -> register/candidates with a pointer (Ж2: "a victim without a record is a double victim"), never "pre-existing" without a status.
- Related: [[feedback-codex-after-code-only]], [[feedback-scope-question-early]], [[project-mission-resume]].
