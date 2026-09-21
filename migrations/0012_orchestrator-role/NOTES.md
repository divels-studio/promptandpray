# 0012_orchestrator-role

**The main session gets a rendered rules file, and the re-render operation learns how to put a
brand-new artifact on an installation that has never had one.** Two changes, one release. The first
is an artifact - the second operation creates it here - and the second is a field on the operation
format, which is what makes that creation possible without an update ever adopting a file it did not
write.

## The Orchestrator role

`.claude/aiwf-native/ORCHESTRATOR.md`, rendered from `templates/ORCHESTRATOR.md.tmpl`, managed with
the same two-hash bookkeeping as every other artifact this plugin renders.

- **What it is.** The COO's standing rules in one place, written as DATA rather than as a second
  doctrine: data discipline, the coverage line that goes into a brief before a paid dispatch, the
  separation of a verdict from the next dispatch, what a canon conflict does to the work, the
  doctrine-write participation, the four countable escalation triggers, the four-question
  operator-channel filter, the chain-trace duty and its honest limit, the duals law and its scope,
  the event-ledger row format, and four rules named as references only. Two kinds, and the
  difference is where each rule LIVES: a rule whose home is a payload document is pointed at and not
  restated, while the COO's own working rules have no other home and are stated here in full.
- **Why it is rendered rather than seeded.** A seeded file is written once and then belongs to the
  operator forever, which is right for an overrides document and wrong for a rule set the payload
  keeps developing: a seeded copy of these rules would freeze on the day it was written and the next
  release would have no way to correct it. Managed and re-rendered is the correct treatment here,
  and holding your own version stays available at any time through `/pnp:update --resolve
  .claude/aiwf-native/ORCHESTRATOR.md`.
- **It pins no model and names no role host.** The template reads no `config.roles.*` key and
  renders no `model` or `effort` field. Who audits what, on which engine and with how many passes,
  is the audit table (`/pnp:roles`) - a value you can see and change - and a model pinned in a
  rendered document would state as doctrine exactly what that table decides.
- **It is unconditional.** Every installation has a main session, whatever its review hosts are, so
  there is no configuration in which this artifact is legitimately absent. That is why the operation
  below carries `createIfAbsent` and not `ifRecorded`.

## `createIfAbsent` on `rerender-managed-region`

An optional boolean for an artifact the payload has only just STARTED rendering. An installation
older than the artifact has no bookkeeping record of it, and without the field a re-render of an
unrecorded artifact throws - correctly, because that throw is the invariant "an update never adopts
a file it did not write". `createIfAbsent` does not relax that invariant; it splits the unrecorded
case in two:

| state | what happens |
|---|---|
| no record, **no file** | rendered, written and stamped: `<key>: created (no record, no file) - rendered and recorded` |
| no record, **a file there that IS the render** | ours - the artifact lives in the plugin's own folder - so nothing is written and the artifact is simply recorded |
| no record, **a file there that DIFFERS** | the run STOPS: `<key>: this installation has no record of it but a file is standing at that path - an update never adopts a file it did not write; move it aside or remove it, then run the update again`. It stops at planning, at the last read before the write, at the write itself (which is no-clobber at the syscall), and in the recovery of an interrupted creation |
| a record already there | the ordinary re-render, and the field is invisible |

The refusal is the half that matters. A file standing at a managed path that this engine has no
record of is somebody else's content - a hand-written file, a leftover, an earlier tool's output -
and writing a render over it is the one thing no operation here may do. It says to move the file
aside rather than to adopt it, deliberately: setup's adopt mode bootstraps a project that has NO
installation and is refused on one that already has it, so a project running `/pnp:update` cannot
take that door and would be sent to a closed one.

**A file that IS the render is ours.** The artifact lives in `.claude/aiwf-native/`, the plugin's
own folder, so content byte-identical to what this release renders came from a run of this engine -
an interrupted one, or the same version applied twice. Nothing is written over it and nothing is
asked: it is simply recorded, and the update goes on. Only a file that DIFFERS is somebody else's,
and only that one stops the migration.

**`ifRecorded` and `createIfAbsent` may not travel in one operation**, whatever their values. They
answer the same question - what happens to an artifact this installation has no record of - in
opposite directions, skip versus create-or-refuse. The validator refuses the pair on PRESENCE: an op
that carries both still states both answers, and the edit that flips a `false` to a `true` would
otherwise turn a legal payload into an undefined one with nobody reviewing the combination. No
precedence is defined between them on purpose: a precedence rule would make a migration's intent
depend on which field its reader remembers first, and an author who wrote both has not decided yet.

## What the region re-render carries

One sentence of the doctrine inside the managed `aiwf-core` region of your `CLAUDE.md` changes with
this release: the **doctrine-preflight** bullet now names the rendered role beside the two payload
documents and your overrides document, so the session that reads the region is told where its own
standing rules are. That is the whole delta of the region; everything else between the markers is
the text you already have, and everything outside them is untouched.

The operations.

| # | op | what it does here |
|---|----|-------------------|
| 0 | `note` | one entry in your `CHANGES_*.md`: what the Orchestrator role is, that this migration creates it on your installation, what happens instead if a file is already standing at that path, the one new sentence in your `aiwf-core` region, the new `createIfAbsent` field with both of its faces and its refusal to travel with `ifRecorded`, and the id this release retires. It applies nothing - a note that announces an operation is not the note performing one. |
| 1 | `rerender-managed-region` | creates `.claude/aiwf-native/ORCHESTRATOR.md` from `templates/ORCHESTRATOR.md.tmpl` with `createIfAbsent: true`: rendered and stamped where nothing is on disk, recorded without a write where the render is already there, and the refusal where something that differs is. |
| 2 | `rerender-managed-region` | re-renders the `aiwf-core` region of your `CLAUDE.md` from `templates/CLAUDE.md.tmpl#aiwf-core`: the doctrine-preflight bullet now names the rendered role. Everything outside the markers is left as it is. |

## What does NOT change

No config key is added - the role is model-agnostic and reads nothing new from your config. No
permission rule is reconciled. No word gate is introduced by this release, which is why the note
carries no word-gate sentence: that sentence belongs to a release that introduces one, and writing
it where nothing gates would train a reader to skip it. The four operation types keep their exact
semantics - `createIfAbsent` is an optional field on one of them, not a fifth type - and no
operation here or in any later release addresses the transfer surface.

## If you are updating from 0.1.x or 0.2.x

`0002_operator-word-and-hygiene` through `0011_transfer-surface` still apply first, each with its own
operations and its own notes; this one follows them.
