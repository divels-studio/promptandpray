# A worktree isolates code, not data

A second worktree gives a second checkout. It does not fork the database, the containers, the ports,
the caches or the external services. Everything shared stays shared, and the shared parts are where
parallel sessions collide.

The realistic throughput multiplier is also capped by the human integration gate: the operator still
reviews and approves serially. Plan parallel work along file boundaries, not along wishes.
