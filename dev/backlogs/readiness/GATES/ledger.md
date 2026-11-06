# GATES - rulings, passes, events

One row per ruling, pass or event of plan GATES that belongs to no ticket's record. The round files beside this one hold the auditor's tables and the COO's dispositions.

## Passes

| date | pass | engine / model / effort | cold or resumed | tokens (the engine's print) | verdict | word | pointer |
|---|---|---|---|---|---|---|---|
| 2026-11-06 | readiness 1 | codex / gpt-6-sol / xhigh | cold | 105,488 | BLOCKERS 5 INFO 1 - all `fixed` in revision 1 | the plan's standing word „Един план върху ROADMAP § GATES и § CODEX, с деклариран брой тикети, release 0.3.12." | `round-1.md`; session `01a1b013-8ee5-7660-83ae-4ec4913ddbe6` |
| 2026-11-06 | readiness 2 | codex / gpt-6-sol / xhigh | resumed (compensations: re-read from disk, independent consumer search, round-1 carried) | 172,490 cumulative over the session (no increment derived) | CLOSED 4 OPEN 1 NEW 1 INFO 2 - all `fixed` in revision 2 | operator's own word „Първо пас 2" (approval dialog 1) | `round-2.md` |
| 2026-11-06 | readiness 3 - BEYOND `review.plan.passes` = 2 | codex / gpt-6-sol / xhigh | resumed (round-2 carried) | 287,816 cumulative | CLOSED 4 OPEN 0 NEW 3 (B7-B9, the tail of the `cmd.exe /c` fallback of revision 2) INFO 1 | operator's own word „Пас 3 извън тавана" (approval dialog 2) | `round-3.md` |

## Rulings and events

| date | rule or D-id | kind | text | pointer |
|---|---|---|---|---|
| 2026-11-06 | `plan.ticketByteCap` (project config) | operator decision | The ticket byte cap of this project raised 6,144 -> 61,440 during the readiness pass, on the operator's dialog word („не искам да се режат тикети заради някакъв лимит, за мен 6К е много малко и практиката до сега го доказа"; dialog answer "61 440 байта, като Silerax"); Silerax carried 61,440 already, Furnissimo raised it the same day on its own operator's word (their commit `b1da7f87`); the payload's factory value stays 6,144. Revision 1 moved the per-ticket worklists from the index back into the tickets. | `.claude/aiwf-native/aiwf.config.json` `plan.ticketByteCap`; this plan's landing commits |
| 2026-11-06 | `/pnp:plan` Step 6 "At most 2 revisions" / `plan.md` § Pass economy | operator decision | After pass 3 returned three new blockers with the two revisions spent, the cycle stopped and the operator chose „Ревизия 3: махам cmd /c, ландвам": a third revision that REMOVES the mechanism of revision 2 (the `cmd.exe /c` fallback and its character rule) and no pass 4. | `round-3.md`; DECISIONS D-09 and § Deferred |
| 2026-11-06 | GATES-004 D7 ("Step 6's redirect unchanged") / escalation trigger 4 | operator decision | Codex code pass 1 (session `01a1b17f-4910-70e3-bd15-32fe749da13e`) failed GATES-004 on one P2 blocker: `/pnp:plan` Step 6 redirects the PS wrapper with `>`, which Windows PowerShell 5.1 writes as UTF-16LE, so the round file is not the `-o` bytes. The COO held it pre-existing and outside the ticket (D7 froze the redirect) - a written disagreement with the auditor, escalated to the operator. Ruling, dialog answer "Оправяме го сега" (fix it now): a prose correction round - Step 6 reads the verdict from the wrapper's `-o` file instead of redirecting stdout; D7's freeze of that redirect is lifted; no code changes, so no verification pass (`ticket.md` § Loop shape: a prose-only round). | `records/GATES-004.md` (at the close) |
| 2026-11-06 | D-09 (the COO's own) | catch | The COO designed a fallback launch form (`cmd.exe /c`) in revision 2 before the measurement that says whether `*>` needs one; the auditor's pass 3 returned its tail (B7-B9) - the ALOG pattern (a mechanism admitted mid-cycle, its tail one piece per resumed pass). Lesson recorded in DECISIONS § Deferred: measure first, decide the fallback with the number. | `round-3.md`; `dev/backlogs/ROADMAP.md` § BRIEFS (the ALOG measurement line) |
