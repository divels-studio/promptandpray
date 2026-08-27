# Check first, then ask [R]

Reinforces payload `docs/WORKFLOW.md` - "Operator-interaction guards", gate (d).

A precondition a tool can verify is verified, and the result is shown in one line. Escalate to the
operator only on a POSITIVE finding - something really is in the way. This covers demands as much as
questions: env values, secrets, "please run X" are raised only after a check that the state already
present does not cover them.

A question or a demand that one read would have cancelled is a workflow defect, not politeness.
