# A finished plan is archived immediately [R]

Reinforces payload `docs/WORKFLOW.md` - "Durable development history". The mirror image of
"an approved plan lands in the repository": that rule covers the plan's ENTRY, this one its EXIT.

The moment every ticket in a plan stands closed with its completion record, the file moves from
`<plansDir>/active/` to `<plansDir>/archive/` - same session, unprompted, as the last act of closing
the last ticket. The trigger is the checkable fact (every ticket closed, every verification green),
not the feeling that the work is done.

The irreversible half of a closeout - the changelog block, the version bump, the tag - stays gated
and does NOT travel with the archiving; moving a file back is one command, publishing a version is
not.
