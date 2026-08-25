# SESSION_BRIEF_RECIPE - the session-to-session brief

> Executed by the **`/pnp:brief`** skill. This document is the recipe's authority; the skill only
> applies it to the current state.
>
> **Principle:** *maximum quality at minimum cost / context / tokens.* The session brief carries
> FACTS and POINTERS, not file contents. Everything the new session would otherwise burn tokens
> rediscovering (machine-local facts, commands that work, decisions taken) goes in verbatim;
> everything durable stays in Git / memory and is merely pointed at.

## What a session brief is, and who writes it

The session brief is the prompt with which the operator opens a **fresh session** on the active
mission. The **COO of the current session** writes it (via `/pnp:brief`); the operator only reviews
and pastes it. That way every session starts from ONE recipe instead of being improvised again.

- **Language:** the operator channel language from `operator.language`; technical terms in English.
- **A separate rule, do not confuse the two:** the briefs to the AGENTS inside a session
  (Writer/Reviewer/QA) are always in English.
- **Length:** dense, no ballast - about a screen and a half. The length is earned by verbatim
  commands and gates, not by retelling.

## Structure - mandatory sections, in this order

1. **Title.** Mission + ticket + "(fresh session)".
2. **Context.** The executing authority with EXACT paths (the active PLAN + any operator-approved
   specifications); branch + **HEAD SHA** + tree state; which tickets are CLOSED ("nothing is
   replanned and nothing is reopened").
3. **Domain gate.** Which document is the operator's final decision on the domain vocabulary; the
   brief to the Writer carries it verbatim, with no engineering "improvements"; on a NEW domain
   question - STOP and ask (memory seed: `domain-review-gate`).
4. **Task.** Ticket ID + [R-class] + the scope condensed into lettered items (a/b/c/d) from the PLAN
   section; risk threshold / stop condition / VERIFY - "from the PLAN, verbatim in the brief".
5. **Machine-local facts.** Everything that has already cost a lost pass: environment quirks + the
   **working commands VERBATIM** (copy-paste ready, marked where they are the operator's to run,
   including why). An explicit order: "do not rediscover these".
6. **Gates (R2/R3).** Database/system commands - reported immediately before execution and waiting
   for the operator's Yes/No dialog; commit - approved by the native dialog on the commit attempt
   and by nothing else (the operator clicks and types nothing), staged by explicit paths; push and
   merge - not at all without an explicit word in chat AND their own dialog; docs checkpoint - the
   completion record in the PLAN ledger IMMEDIATELY after the commit, same session, without a
   reminder.
7. **Loop.** The Writer's model pin (and "NEVER pass `model` when dispatching it"); the requirement
   of an **exhaustive Writer brief on the first try** (the checklist below); the review path
   (`/pnp:review`, the brief at the fixed path `<scratchDir>/review-brief.txt`, the wrapper in the
   background); the correction-round cap; extra review passes - only with the operator's word BEFORE
   the dispatch; QA yes/no and why.
8. **Subagent policy - MANDATORY clause** (memory seed: `subagent-delegation-belt-and-braces`),
   verbatim:
   > Subagent policy (mandatory): all routine checks, grep/inventory sweeps, existence/counts,
   > mechanical scans AND open-ended research dives go to CHEAP subagents with an EXPLICIT model -
   > `haiku` for purely mechanical work, `sonnet` for evidence-with-judgment (the default). Never
   > silently inherit the session model; the synthesis stays with the COO. The loop roles
   > (Writer/Reviewer/QA) run ONLY through the Agent tool / the `/pnp:*` skills, never inline.
   > Maximum quality at minimum cost / context / tokens.
9. **Memory pointers.** Which memory entries carry the resume point and the domain/machine-local
   rules (names only, not contents).

## The Writer-brief recipe - what "exhaustive on the first try" means

The goal is **zero correction rounds and a review pass in the first round**. Correction rounds and
repeat reviews are the most expensive part of the cycle; the brief to the Writer removes them in
advance:

- ticket + branch + working directory;
- the authority documents that BIND it, plus the order: approved fields/semantics are not to be
  "improved"; on a domain ambiguity - return the question, do not decide alone;
- **precedents by path plus what exactly to copy from them** (a schema pattern, an access-policy
  shape, a grants block, a test preamble trick - by name, not "see how it is done over there");
- deliverables by number, specified down to the column/constraint/index/name;
- **the engineering decisions taken by the COO in advance** and recorded in the brief; the Writer is
  left no choices to make;
- the VERIFY commands verbatim plus the requirement of exact exit codes ("a claimed exit 0 is not
  authority - the actual run is");
- what it must **NOT touch** (an explicit list) and what it must **NOT run** (the gated commands);
- the required response format: files, VERIFY output, **every deviation flagged explicitly**
  ("deviations are not allowed silently").

The same discipline applies to the review brief: full scope, risk threshold + stop condition from
the ticket, a list of "known and accepted things - do not raise these as blockers", and the OUTPUT
CONTRACT.

## Anti-patterns

- File contents inside the brief - NO; point at paths (the new session has Read/Grep).
- Retelling Git history or already-recorded completion records - NO; point at the PLAN ledger.
- "Work it out yourself" for something the current session already knows - NO; that is a burned pass.
- A missing subagent clause or a missing Writer-brief requirement - NO; those are the mandatory
  sections 7-8.
- A missing HEAD SHA or tree state - NO; the new session must be able to verify that it is standing
  where the brief claims.
