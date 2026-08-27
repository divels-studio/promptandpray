# Never mirror config content into memory - point at the file

Copying settings, permission rules, model pins or path lists into an agent memory store creates a
second source that silently goes stale, and stale config is worse than no config: it is confidently
wrong.

Memory holds the pointer and the reason ("the ask rules live in `.claude/settings.json`; they are
owned by setup"), never the content. Durable, shareable knowledge belongs in the repository; memory
is for what is specific to this machine or this operator.
