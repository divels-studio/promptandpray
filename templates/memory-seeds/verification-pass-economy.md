# Never repeat a failed pass against an unchanged failure set

Re-running the same expensive verification (an external review engine, a full E2E suite, a long
build) without having changed anything it complained about buys nothing and spends real quota.

Two rules that follow: resolve every KNOWN precondition before the FIRST pass, not between passes;
and when a pass fails, change the input before the next one - the diff, the brief, or the
environment. If nothing changed, the second pass is a copy of the first.
