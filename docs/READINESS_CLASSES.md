# Readiness classes - the blockers a readiness pass keeps finding

The classes below were measured on the readiness cycles of consumer projects: the first thirteen
classes were each a paid pass-1 blocker at least once, most of them in more than one project; the
fourteenth was measured between passes, on the blockers a revision itself created.

`/pnp:review` Step 2b hands this file to the fact-check agent; a class present in a plan is a gap,
named by number. Step 2c's consequence scan asks classes 1, 10 and 14 from the other side - from
each decision of the plan out to the tree. The list grows with a release, never with a session.

| # | class | the question to ask of every ticket |
|---|---|---|
| 1 | unread consumer | Which code reads the column, permission, command or contract this ticket changes - and has every one of those readers been opened? |
| 2 | library or hook behavior asserted from memory | Is every claim about what a library or a hook does verified in its code (the installed package, the hook source), not in a document or in recollection? |
| 3 | closure / memo / lifecycle | What state does each touched function, memo or module capture, when is it recreated, and does the plan's change survive that lifecycle? |
| 4 | concurrency / lock order | What happens when two callers run the changed path at once - which lock is taken first, and can the order invert anywhere else? |
| 5 | state enumeration (empty / one / N / error / rerun / open-closed) | Does the plan say what happens at empty, one and N, on the error path, on a rerun, and in the open and the closed state? |
| 6 | data shape the read path already admits | Which shapes does the existing read path already accept - legacy rows, nulls, older formats - and does the change handle every one of them? |
| 7 | identifier that does not exist | Does every file, function, key, flag, command and table the plan names exist in the tree today, or is it declared as created by this ticket? |
| 8 | command not literal or cannot fail | Is every verification command runnable as written, and is there a named output that would mean broken? |
| 9 | test that cannot prove (a mock stands in for the property) | Does each proof test exercise the property through the production path, or does a mock stand in for exactly what it claims to prove? |
| 10 | permission / render-gate consistency across surfaces | Where one surface gates or hides something, do all the other surfaces that reach the same thing gate it the same way? |
| 11 | process order / actor | Is every step done by the actor allowed to do it, in an order where the state it assumes is the state the previous step leaves? |
| 12 | open decision left to the Writer | What would the Writer still have to decide - a name, a layout, a flag, an order - that the plan does not fix? |
| 13 | acceptance misses a risk-threshold item | Does every item of the risk threshold have an acceptance check that observes it? |
| 14 | fix after a pass adds new surface | Does the revision after a pass only close the blockers it was handed, or does it open surface the previous pass never saw? |

This is a corpus, not a theory - a class not listed is not proven absent.
