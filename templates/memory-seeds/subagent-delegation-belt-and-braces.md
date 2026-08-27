# Repeat the delegation policy in every handoff prompt [R]

Reinforces payload `docs/WORKFLOW.md` - "COO owns broad scans".

The cheap-subagent policy (an explicit model always; mechanical scans at the cheapest tier;
evidence-with-judgment one tier up; the top tier never delegated for scans) is written into EVERY
prompt that starts a new session or hands work over. A policy that lives only in the doctrine is
read once at session start and forgotten by the third turn.

The delegation trigger is not only "3+ files": an open-ended investigation that has already cost
two lookups without an answer is a dispatch, and anything outside the repository is agent work per
se.
