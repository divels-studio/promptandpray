# Parallel sessions share one local stack - serialize what touches it

Two sessions on one machine share the same database, the same containers and the same ports. A live
background process and a gated test suite must never run against them at the same time.

When rows, jobs or files "disappear" during such a run, check the shared stack FIRST: a teardown
cascade from the other session explains it far more often than a bug in the code under test. Verify
the claim about the failure before proposing a cause for it.
