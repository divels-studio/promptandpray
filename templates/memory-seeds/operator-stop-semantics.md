# An operator stop freezes every mutating action [R]

Reinforces payload `docs/WORKFLOW.md` - "Operator-interaction guards", gate (a).

On a stop or an interrupt, the answer is exactly three things:

1. a one-line state - the tree, and what is in flight;
2. a proposal for how the mess gets cleaned up;
3. waiting for an explicit word.

No apology theatre, no continuation of the old plan, no "while we wait, I will just...". Continuing
without the word repeats the violation that caused the stop.
