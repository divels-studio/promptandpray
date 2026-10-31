---
name: feedback-session-start-from-root
description: "Stratex sessions start from D:\\Stratex (root), NOT from silerax\\ - otherwise the ask dialogs stay silent"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 0d1f858c-dbc3-4878-bb85-6af364ed8995
  modified: 2026-10-16T16:10:56.749Z
---

[REJECTED by PnP 2026-10-14] Stays local.

A session started from `D:\Stratex\silerax` does NOT load the permission rules from
`D:\Stratex\.claude\settings.json` - the whole pnp ask ruleset (commit/merge/push/destructive
dialogs) is silent and auto mode approves everything quietly. Diagnosed on 2026-09-12 after three
wrong hypotheses (auto mode, Bash(*) allow, bypass mode); proof: a parallel session with the
same config + a root start raises the dialogs.

**Why:** the click gate is half of the commit/push authority model; without it only
the word in the chat remains.

**How to apply:** check at session start that the primary working directory is `D:\Stratex`
(the scratchpad path gives the start away: `D--Stratex-silerax` = wrong start). On a wrong start: tell
the operator at once and work with word-as-gate for every gated operation until a restart. Related:
[[feedback_git_discipline]].
