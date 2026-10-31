Ticket: <REF>
Read `<plansDir>/active/<ABBR>/tickets/<REF>.md` and the files its Code Map names; that ticket is the whole contract - outcome, scope, acceptance, risk threshold, stop condition, verify.
Stop conditions in every ticket: a file outside the Code Map, an old test's expectation or a recorded bar - stop and hand back before any write; the COO escalates and amends the ticket text at the close.
Scope guard: HEAD <literal hash, `git rev-parse HEAD` at this dispatch> - the diff you hand back is the diff against it.
No dialogs: you work without them; a dialog stands only at a gate - the commit, push/merge/rebase, a destructive or system-changing operation. A question the ticket cannot continue without: stop and hand back now; every other question goes into the hand-back's list.
Long commands: a command expected to run over about five minutes runs in the background (`run_in_background: true`) with a timeout of at least 3600000 ms, awaited by its notification; a run killed by the cap is reported, never restarted.
Reply: about 25 lines - blockers, deviations, failed checks and the VERIFY exit codes; the diff stays in the tree.
Commit: when the COO says so, the local `git commit` by explicit paths through its native dialog, the body carrying `Refs: <REF>`; a docs commit is separate from the code commit.
Project lines: <this project's own rules for every Writer brief, or `none`>
