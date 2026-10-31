---
name: feedback-working-lessons
description: "Lessons recovered from the 2026-09-21 memory snapshot: say „fact-check" (nothing is free); after a route deletion build before type-check; exact / tilde pins; regenerate verify artifacts after the last code change"
metadata:
  type: feedback
---

Recovered 2026-10-26 from `dev/backlogs/archive/memory-snapshot-2026-09-21/` (`feedback_review_cadence.md:21`,
`project_mission_resume.md:159-164`); the operator approved carrying them here („да, одобрявам всичко, записвай").

1. **The term.** Call the claim check „fact-check", never „безплатен gate" - operator 2026-09-13: nothing is free, everything is
   tokens.
2. **After a route deletion, `build` runs before `type-check`** (REV-004; the snapshot gives no reason - UNVERIFIED why).
3. **Dependency pins.** A caret (`^`) pin pulls past the proven version (three cases: Playwright, lucide, 13 deps in PLAN_SILERAX_UPGRADE
   Р2); a proven version is pinned exact or with a tilde.
4. **Proof freshness.** Every verify artifact is regenerated AFTER the last code change; an artifact older than the last change
   proves nothing.

**Why:** they were durable lessons of the 1.0 upgrade and closeout missions and were lost when the memory was rewritten after
2026-09-21. **How to apply:** 1 in every message about checks; 2-4 in every VERIFY brief and dependency ticket.
Related: [[project-mission-resume]].
