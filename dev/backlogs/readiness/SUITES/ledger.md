# SUITES - rulings, passes, events

One row per ruling, pass or event of the plan; the tickets' own events live in their records
(`archive/021_PLAN_SUITES_2026-11-07/records/`). The CI step seconds of the release's pushed commit
(D-07) land here as ONE row, with the command, written by the session that first sees that run
finished - never from a run that has not finished.

| date | kind | text | pointer |
|---|---|---|---|
| 2026-11-07 | pass | readiness pass 1, Codex gpt-6-sol/xhigh, cold: 8 BLOCKER / 2 INFO, all fixed; 117,873 tokens | `round-1.md` |
| 2026-11-07 | pass | readiness pass 2, Codex gpt-6-sol/xhigh, resumed on the operator's word „Да, пусни пас 2 (препоръчвам)": 7 CLOSED, 1 OPEN + 3 new, all fixed; 192,056 tokens cumulative over the session (includes pass 1's figure) | `round-2.md` |
| 2026-11-07 | pass | SUITES-001 code row, Codex gpt-6-sol/xhigh, cold, on the ticket's word „добре, пускай": `fail` - 1 blocker in the COO's prose (`dev/VERIFY_RUNBOOK.md:33`), 1 note; correction round 1 prose-only, no verification pass; 73,355 tokens | `archive/021_PLAN_SUITES_2026-11-07/records/SUITES-001-review-brief.md` |
| 2026-11-07 | pass | SUITES-002 code row, Codex gpt-6-sol/xhigh, cold, on the ticket's word „da": `pass`, no findings; 0 correction rounds; 105,657 tokens | `archive/021_PLAN_SUITES_2026-11-07/records/SUITES-002-review-brief.md` |
| 2026-11-07 | record | CI step seconds of the release's pushed commit `ce9cf46` (D-07), run 42406267228, conclusion success (windows and ubuntu green; the advisory macos leg red at its example-cycle step, its self-check skipped), each step `completedAt - startedAt` from `gh run view 42406267228 --json status,conclusion,jobs`: windows - setup suite 21, update suite 58, spikes 10, example cycle 319, self-check 325, job 751 (19:27:08 -> 19:39:39 UTC); ubuntu - setup 8, update 25, spikes 5, example cycle 189, self-check 186, job 420; macos - setup 10, update 22, spikes 8, example cycle 152 (failure), job 198. Before this plan (RESEARCH § Timings, run 42263924346 on 0.3.12): the self-check step 793 s on windows and 516 s on ubuntu | this row; `archive/021_PLAN_SUITES_2026-11-07/RESEARCH.md:133` |
| 2026-11-07 | record | local numbers (D-07): SUITES-001 batch 776.1 s with the serial self-check 775.0 s; SUITES-002 batch 401.1 s with the parallel self-check 400.2 s beside four other rows, the serial `--jobs 1` run alone 602.3 s, the parallel fixture-copy run alone 306.3 s - each from its suite's own `slowest sections:` block or the batch script's wall clock | the two records § Verification |
