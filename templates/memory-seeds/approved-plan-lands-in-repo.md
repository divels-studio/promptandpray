# An approved plan lands in the repository immediately [R]

Reinforces payload `docs/WORKFLOW.md` - "Operator-interaction guards", gate (e).

At the moment of approval, in the same session, without being reminded: the plan is copied into the
plans directory (`<plansDir>/active/`) as the Git canon, and any plan-mode file outside the
repository becomes a pointer to it.

The principle "durable knowledge lives in Git" was never the missing part. The missing part was the
mechanical moment: approval.
