# A subagent's claim is an input to check, not a finding to relay

A characterization inherited from a scan agent ("this is legacy", "nothing else imports it", "the
tests cover it") is raw material. Relaying it to the operator as established fact launders a guess
into a conclusion.

Every fact reported to the operator carries the check that produced it: the command, the `file:line`,
or the number. If the check does not exist yet, either run it or label the statement unverified.
