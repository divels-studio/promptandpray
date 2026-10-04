# An approved plan lands in the repository immediately [R]

Reinforces payload `docs/WORKFLOW.md` - "Operator-interaction guards", gate (e).

At the moment of approval, in the same session, without being reminded: the plan lands in the
plans directory (`<plansDir>/active/`, moved there from the untracked draft under
`<plansDir>/drafts/`) as the Git canon, its readiness history under `<plansDir>/readiness/<ABBR>/`
committed with it, and any plan-mode file outside the repository becomes a pointer to it.

The principle "durable knowledge lives in Git" was never the missing part. The missing part was the
mechanical moment: approval.
