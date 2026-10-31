# Brief to the Silerax session - clean the PnP transfer surface after the 2026-10-14 intake

STATUS: SENT 2026-10-14 to session "Silerax UI 050" on the operator's word (+ an FYI line on the stabilization phase).

---

From: the PromptAndPray (PnP) session, on the operator's instruction.

On 2026-10-14 the PnP session read your PnP-bound items (`dev/backlogs/PNP_CANDIDATES.md`, `dev/PROJECT_OVERRIDES.md`,
`dev/CANDIDATES.md`, `AGENTS.md`, `.aiwf/`, and your memory `C:\Users\dyosi\.claude\projects\D--Stratex\memory\`) and
went through them item by item with the operator. The result lives in the plugin repo:
`D:\promptandpray\dev\backlogs\CANDIDATES.md` § „Прием от Silerax“ (items 1-32, plus a rejected list) - read that
section first; it is the authority for what PnP took.

## The operator's rule for this cleanup

1. **Everything PnP took is MARKED, not deleted** (operator: they stay as historical records for now; deletion
   is a later, separate step). Each candidate entry in your `PNP_CANDIDATES.md` that PnP took gets a prefix
   `[ПРЕНЕСЕН в PnP 2026-10-14 - CANDIDATES § „Прием от Silerax“ т. <N>]`; an entry PnP already shipped gets
   `[ПУСНАТ в PnP <version>]`. Ledger rows (Ruling ledger, Pass statistics, Event ledger) are history and are
   not touched.
2. **Every pointer that treats a marked entry as an open candidate is fixed** - in `PROJECT_OVERRIDES.md`,
   `AGENTS.md`, plans, readiness documents, `.aiwf/checkpoint.md` and memory. Point it to
   `D:\promptandpray\dev\backlogs\CANDIDATES.md § „Прием от Silerax“ т. <N>`.
3. **A candidate that drives your daily work is a mistake as a candidate.** If you follow it in your work, it
   leaves the candidates and becomes a LOCAL RULE in `dev/PROJECT_OVERRIDES.md`, marked
   `expires when PnP ships it - PnP CANDIDATES § „Прием от Silerax“ т. <N>`.
4. **When a PnP version ships an item, its local rule is removed.** Precondition: you are on that version
   (`/pnp:update`). You are on 0.2.16 now; 0.2.17 is released and ships the readiness ceremony your overrides
   carry as "expires with 0.2.17" (`SO:428-445` - one scan agent, no counter pair, concurrency class 15, own
   pass by action, file:line only where the Writer acts). After the update, remove those local rows.
5. **The same holds for your memory - marked, not deleted.** A memory file whose substance PnP took gets a
   first line `[ПРЕНЕСЕН в PnP 2026-10-14 - т. <N>]`; if it drives daily work, the rule ALSO lands in
   `PROJECT_OVERRIDES.md` as a local rule (point 3) and the memory file points there. `MEMORY.md` index
   lines get the same mark.
6. **Rejected items** (PnP will not take them - list below): marked `[ОТХВЪРЛЕН от PnP 2026-10-14]`, not
   deleted. If you use one in daily work, it stays a local rule for good (no expiry).

## What PnP took (PnP item -> your source; line numbers approximate, match by substance)

| PnP т. | substance | your source |
|---|---|---|
| 1 | CHANGES report path hardcoded to the repo root | SP:34, `dev/pnp-changes/README.md` |
| 2 | AGENTS.md not rendered/refreshed by PnP; cache paths pinned to 0.2.16 | `AGENTS.md:28-31`, checkpoint's hardcoded `pnp/0.2.16` wrapper path |
| 3 | `$schema` in aiwf.config.json pinned to 0.2.1 | `.claude/aiwf-native/aiwf.config.json:2` |
| 4 | agent hooks get the main session_id (STOP hits subagents) | CE ~820, `.claude/hooks/context-gate.mjs` |
| 5 | paid pass dies -> report and wait for a word | M feedback_paid_pass_death.md |
| 6 | what counts as a correction round | M feedback_correction_round_counting.md, event ledger ~306 |
| 7 | a non-standard paid review states scope and cost in the plan | M feedback_codex_after_code_only.md |
| 8 | auditor re-raises blockers visible on pass 1 | SP:52 |
| 9 | Codex session state file per ticket | SP:44, SO:416-427 |
| 10 | brief write confirmed before dispatch | event ledger ~243 |
| 11 | blocker beyond business scope -> operator early | M feedback_scope_question_early.md |
| 12 | editing is not a shell job | SP:47, SO:66-70 |
| 13 | auto mode refuses agent edits to settings/config | M project_e2e_local_lessons.md #7 |
| 14 | negative control of a gate on a copy, never the live gate | event ledger ~294, ~323 |
| 15 | scan agents return results in the answer, no shell writes | event ledger ~229, ~299 |
| 16 | COO never says what to click | SP:36, SO:351 |
| 17 | mission resume note rewritten whole, never appended | SP:42, M feedback_resume_rewrite_not_append.md |
| 18 | shorter first-read doctrine (replaces the digest idea) | CE:790 (digest - REJECTED in this form) |
| 19 | plan as a folder, ticket per file (to be discussed at planning) | SP:68-75, CE:792-800, SO:472 |
| 20 | one-line stay / new-session recommendation at ticket close | M feedback_session_per_ticket.md, SO:479-485 |
| 21 | every incident is an event-ledger row | event ledger ~215 |
| 22 | parallel Writers allowed (not default) + worktree-from-main pitfall | SP:25, SO:464, M feedback_parallel_eval.md, project_e2e_local_lessons.md #15 |
| 23 | tests that cannot fail are findings | SP:48 |
| 24 | long commands only in background + server-task notification pitfall | SP:60, SO:76, project_e2e_local_lessons.md #16-17 |
| 25 | passes named by role+number; a verdict names its subject | SP:26, SO:350, event ledger ~249 |
| 26 | dialogs ONLY when the ticket cannot continue; other questions batched to ticket close | M feedback_decision_dialogs.md |
| 27 | "COO: <model>, because ..." line per ticket | SP:51, SO:460 |
| 28 | commit authority text: code - Writer, records/docs - COO | SP:41, SO:41-48 |
| 29 | `.aiwf` cleanup as part of ticket close | SP:40 (cleanup half), M project_aiwf_cleanup_pending.md |
| 30 | relayed claims verified first, else "unverified" | M feedback_no_assumptions.md |
| 31 | known-red baseline (low priority) | SO:226-248 |
| 32 | canon vs mockup (very low, may stay yours) | SP:24, SO:486 |
| — | small correction round without a verification pass - already a PnP candidate (UIR-003 block), priority raised | SO:446-455 |

**Carried over earlier (already in PnP; mark if still listed as open candidates):** context ceiling / checkpoint /
SessionStart:compact (SP:20, SP:68, SP:76), the QA gate lost as an "or" (SP:76), git verbs in heredoc text and Gate 4
(SP:77), the readiness ceremony (SP:45 - shipped in 0.2.17), E2E hygiene (SP:46), draftsDir in the repo (SP:40 -
shipped in 0.2.16), verdict in its own message / consequence scan / own-pass artifact (SP:37, SP:39, SP:43 - shipped
in 0.2.14/0.2.15), warm vs cold, GO-word, chain-trace in the evidence pack, evidence pack, E2E before the code audit,
readiness pre-read.

**Rejected by PnP (mark in the transfer surface; keep as a permanent local rule only if you use it):**
doctrine digest at start (CE:790); DB-writing script without a dialog (CANDIDATES:397-409 - yours); QA off by
default (SO:456-459 - decide per ticket in the plan instead); "E2E: yes/no" brief line (SO:169-199); mixed Writer
model (`dev/EXP_WRITER_MODEL.md`); session started from a subfolder (M feedback_session_start_from_root.md - the
operator says it does not happen); PQA § 5 B/C/D; migrations check before push (SO:71).

Legend: SP = `dev/backlogs/PNP_CANDIDATES.md`, SO = `dev/PROJECT_OVERRIDES.md`, CE =
`dev/backlogs/readiness/UIR/context-ceiling-2026-10-10.md`, M = your memory directory.

## Order and output

1. `/pnp:update` to 0.2.17 first, if the operator gives the word (point 4 depends on it).
2. Then the cleanup, in one docs pass (Edit/Write only, no shell edits). One docs commit on the operator's click.
3. Report back to the operator in one short list: marked candidate entries, entries moved into local rules (with
   their expiry pointer), pointers fixed, memory files marked / moved, anything you could not place. Nothing is
   deleted in this pass.
