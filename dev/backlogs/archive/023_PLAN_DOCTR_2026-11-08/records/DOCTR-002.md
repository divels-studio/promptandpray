# DOCTR-002 - release 0.3.16: migration 0041, the note, the bump, the changelog; the roles note of D-04

Route R2 (code + release), the Writer, `review.code` pass 1, on an Opus 5.5 COO (D-25). Operator
word for the ticket: "dawaj" (2026-11-08). Scope guard: HEAD `138ed67`.

## What landed

- `72ccbe8` (the one code commit, the Writer's, local) - nine files:
  - W1 `migrations/0041_doctrine-wording/ops.json` (new) - six `rerender-managed-region` ops
    (`.claude/aiwf-native/ORCHESTRATOR.md`, `doctrine/work.md`, `doctrine/ticket.md`,
    `doctrine/plan.md`, `.claude/agents/writer.md` as whole files; `CLAUDE.md` region `aiwf-core`),
    no `createIfAbsent`, no `ifRecorded`; one `note` `doctrine-wording-0-3-16` with the word-gate
    sentence verbatim, four `docRefs`, `supersedes: ["question-to-the-operator-is-a-dialog"]`;
  - W2 `migrations/0041_doctrine-wording/NOTES.md` (new) - the four sections;
  - W3 `migrations/index.json` - the 0041 entry at 0.3.16, last;
  - W4 `.claude-plugin/plugin.json` - `"version": "0.3.16"`;
  - W5 the roles note "a reversed operator decision or a named risk" in
    `scripts/setup/aiwf-roles.mjs:577`, its pin `scripts/setup/test-setup.mjs:1497` and the sample
    `skills/roles/SKILL.md:118`;
  - the COO's R1 prose in the same commit: the `CHANGELOG.md` block `## [0.3.16] - 2026-11-08`
    ending `Retires local rules: overrides § Communication: A question to the operator is a dialog`,
    and `README.md:22` `**v0.3.16. Public since 0.2.0.**`.
- This record's commit (docs) - the self-install on 0.3.16 (`/pnp:update --apply`: the six
  re-rendered files and the config stamps); `dev/PROJECT_OVERRIDES.md` § Communication loses the
  retired dialog rule (D-20); the plan archived as `archive/023_PLAN_DOCTR_2026-11-08/` with this
  record and the review brief; `readiness/DOCTR/ledger.md`; ROADMAP § DOCTR out; the CANDIDATES
  rows marked; the ledger line. The release tag `v0.3.16` lands on this commit, on the operator's
  word.

## Decisions and deviations

- F1, the COO's diff read: the note text said "the four escalation checks are read after the
  discovery scan"; they are the four COO routing checks. One micro-round to the live Writer
  (resumed by message) changed exactly those words; `validate-payload` re-run exit 0. Before the
  first verdict, so not a correction round.
- The self-install's config diff carries, besides the two stamps the plan names
  (`installedPluginVersion`, `lastMigrationApplied`), the six `managedRegions` entries of the
  re-rendered files moved to `0.3.16` - the engine's own bookkeeping for the files it wrote; the
  plan's ":4-5" under-named it.
- The CANDIDATES rows were already marked `taken up -> ROADMAP § DOCTR`; each now also names where
  it closed (the archive and the release), row 349 the move to § CODEX - the pointer would otherwise
  dangle once the entry left the roadmap.
- ROADMAP § SETUP's language-question line pointed "(with § DOCTR)"; it now says the doctrine half
  stands since 0.3.16 (DOCTR/D-21); the interview half stays there.
- The Writer could not see whether the commit's native dialog was shown to the operator: the
  commit returned without a prompt in its own channel. Recorded as reported, not verified.

## Events

None.

## Verification (what actually ran)

At the hand-back, Portion 1 as ONE parallel background batch (cwd `.`, logs in the session
scratchpad outside the repository; node `v24.12.0` at `C:\Program Files\nodejs\node.exe`):

| command | exit | summary |
|---|---|---|
| `node scripts/update/test-update.mjs` | 0 | 495 `[PASS]` lines, 0 `[FAIL]` |
| `node scripts/setup/test-setup.mjs` | 0 | 481 `[PASS]` lines, 0 `[FAIL]` |
| `node scripts/update/validate-payload.mjs --plugin-root .` | 0 | `valid: 41 migration(s) in D:\promptandpray, payload version 0.3.16` |
| `node scripts/selfcheck/aiwf-selfcheck.js --plugin-root .` (CI form) | 0 | `==== 1762/1762 assertions passed ====` |

After F1 the Writer ran `validate-payload` once - exit 0, the same line. Portion 2 (WSL) not run -
not a release gate; CI runs the full set on the pushed commit.

- The fact-check gate (`/pnp:review` Step 2b, one `sonnet` Explore agent over NOTES.md, the note
  text, its docRefs, the six ops and the CHANGELOG block): `CLAIMS: total=109 verified=109 false=0
  unverifiable=0`.
- Auditor pass 1 (Codex), `class=code -> review.code: codex gpt-6-sol/xhigh, 1 pass`, cold, on the
  ticket's word: `pass` - "No findings in the scoped diff or untracked migration files"; tokens
  43,881; log `C:\Users\dyosi\AppData\Local\Temp\pnp-codex\DOCTR-002-code-20261108-130417-22720.log`;
  session `01a1bad4-9eae-7613-882a-341b4064bf62`. The brief: `DOCTR-002-review-brief.md` beside
  this record.
- Acceptance, run by the COO: A1 6; A2 the six templates; A3 6 file hits, no forbidden token; A4 one
  note, the word-gate sentence once, the supersedes id in ops.json and NOTES.md; A5 4 headings; A6
  `index.json:42` the 0041 entry before `]`; A7 `plugin.json:3`; A8 `CHANGELOG.md:7` the block,
  `:62` the Retires line, the last non-blank line above `:64` `## [0.3.15]`; A9 `README.md:22`; A10
  "a reversed decision" 0 hits, the new string 1 per file in the three; A11 `migrations/index.json`
  and the new folder only; A12 nothing; A13 exit 0; A14 the table above; A15 `git grep` empty and
  the then-untracked folder checked with `rg` - empty.
- The self-install: `node "D:/pnp-live/scripts/update/aiwf-update.mjs" --apply --project-root
  "D:/promptandpray"` (after the live copy moved to `72ccbe8`) - exit 0, `updated: 0.3.15 ->
  0.3.16, 7 operation(s) applied.`, `self-check: PASS - ==== 31/31 assertions passed ==== (project
  layer only ...)`; the dry run before it - exit 0, the same seven operations.
- A16: `aiwf.config.json:4` `0.3.16`, `:5` `0041_doctrine-wording`; `AskUserQuestion` 1 hit in the
  rendered `ORCHESTRATOR.md`; `SendMessage` 1 hit in the rendered `doctrine/ticket.md`.

## Remaining debt

None.

## Diff review

Folded from `.aiwf/DOCTR-002-diff-review.md`. The whole diff against `138ed67` - seven tracked
files plus the then-untracked `migrations/0041_doctrine-wording/` - read by the COO first-hand, one
line per acceptance criterion:

- A1/A2/A3 - the six ops at `ops.json:5-10` match the six templates of `1e7f785` one for one, in
  the 0036 whole-file shape and the 0033 region shape; no flag.
- A4/A5 - one note; its text names each rule 001 wrote with its home file, the two seeds that reach
  no installed copy, the re-rendered files, the optional deletion of the dialog rule, and ends with
  the word-gate sentence of `migrations/README.md` verbatim; NOTES.md has the four sections.
- A6/A7 - the manifest and `plugin.json` agree at 0.3.16.
- A8/A9 - the CHANGELOG block on top, five entries of at most four sub-items, the Retires line last;
  the README line.
- A10 - the roles note moved in its three places together; the pin keeps its other three conditions.
- A11/A12 - no shipped migration, template, doc or rendered copy in the diff.
- The narrowed-test grep (`skip|only|todo` over the scripts diff): two hits, the word "only" in the
  asserted note string - not a narrowed test.
- Finding F1 above; nothing else.

## Scratch

- `.aiwf/DOCTR-002-review-brief.txt` - moved to `records/DOCTR-002-review-brief.md` (this folder),
  then deleted.
- `.aiwf/DOCTR-002-diff-review.md` - folded into § Diff review above, then deleted.
- `.aiwf/last-review-session.DOCTR-002.txt` - the session id, standing in `readiness/DOCTR/ledger.md`
  and above, then deleted.
- `.aiwf/route-state.json` - cleared to `{}` at the ticket's close; stays.
- `.aiwf/checkpoint.md` - the gate checkpoint, rewritten whole after this commit; stays.
- The session scratchpad (the batch logs, the render dry-run script) is outside the repository.

## Plan archive and the roadmap entry

Every ticket of PLAN_DOCTR is closed with its record, so the plan is archived in this commit.
The archiving grep for rule-class points in the plan's process sections
(`rg -n "operator rule|from now on|standing rule|from this plan on"` over the index, DECISIONS and
tickets): 0 hits; the positive control over `dev/PROJECT_OVERRIDES.md` - 14 lines. The plan's
procedures (the marker rule, the render dry-run) are its own mechanics, not doctrine.

ROADMAP § DOCTR leaves the roadmap with its only plan (`ticket.md` § Durable development history,
event 3). Each of its child lines, checked one by one against the commit that closes it:

| line (its source) | closed by |
|---|---|
| a later remark narrows the standing word (CANDIDATES:60) | `1e7f785` guard (b) - D-09 |
| work the doctrine does not require (CANDIDATES:69) | `1e7f785` rule 7 - D-10 |
| a per-decision escalation line (CANDIDATES:75) | `1e7f785` the `Escalation:` brief and plan line - D-11 |
| R2 vs R3 for payload migrations (CANDIDATES:93) | `1e7f785` work.md R3 - D-03 |
| intake 8, first-pass-visible blockers (CANDIDATES:349) | moved to ROADMAP § CODEX - D-05 (`138ed67`) |
| ALOG pass-economy sentence | `c8ddf63` (already done) |
| ALOG two dispositions | `c8ddf63` (already done) |
| intake 31, known-failing list (CANDIDATES:436) | `1e7f785` the expected red set - D-06 |
| E2E spec before the code audit (CANDIDATES:612) | `1e7f785` work.md § Tests and the routes - D-26 |
| a product name is not a path (CANDIDATES:818) | `1e7f785` § Branch policy - D-08 |
| two names for one set (CANDIDATES:956) | no change - D-02 (`138ed67`) |
| a sentence that enumerates the world (CANDIDATES:966) | `1e7f785` templates/README - D-12 |
| auto mode and the update's config write | `f61817f` (already done) |
| the eight rules of the 2026-10-16 alignment | `1e7f785` C-067 and C-064 homed; C-045, C-071 project-only - D-06, D-07 |
| RDR-003 the "user sees less" stop | `1e7f785` - D-13 |
| PLAN_GRANTS the pass-2 trigger | `1e7f785` plan.md and its consumers; `72ccbe8` the roles note - D-04 |
| a roadmap line carries the problem, never the fix | `1e7f785` - D-14 |
| PLINK-002 / FLT two readiness classes | `1e7f785` classes 17, 18 - D-15 |
| PLINK-002 the exempt list | `1e7f785` - D-16 |
| PLINK-002 the live-Writer resume | `1e7f785` - D-17 |
| the roadmap template's places | moved to ROADMAP § RMAP - D-18 (`138ed67`) |
| the flat defect list | moved to ROADMAP § RMAP - D-18 (`138ed67`) |
| a question to the operator is a dialog (RULEHOME-003) | `1e7f785` rule 9; this commit deletes the local copy - D-20 |
| the language rule per record class | `1e7f785` the doctrine half - D-21; the interview half stays on § SETUP |
| DOCSTAGE-002 review.md stdin | `c8ddf63` (already done) |
| S2 a nested list's parent closes with its last child | `1e7f785` - D-19 |
| S16 the visible-outcome waiver | `1e7f785` - D-22 |
| the Writer's VERIFY contradiction | `c8ddf63` (already done) |
| the overrides seed's restate line | `c8ddf63` (already done) |
| AGENTS.md stdin | `c8ddf63` (already done) |
| F4/F13 the whole-diff read | declined - D-27 (`138ed67`) |
| F7 a drafted record | declined - D-27 (`138ed67`) |
| F15 check 2 after the discovery scan | `1e7f785` - D-23 |
| F24 the hand-edit path | `c8ddf63` (already done) |
| RDR-002 the known-failing baseline | `1e7f785` the expected red set - D-06 |

## Closing checklist

- the operator's own run - n/a: no outcome visible in a running product (payload doctrine and a
  migration; the self-install is this repository's own proof);
- the diff review folded in above - yes;
- the ticket's finding lines - the whole entry closed line by line above;
- out-of-scope findings - none found;
- scratch files - § Scratch;
- the next ticket: none in this plan; the tag and the push are the operator's words. A new session
  starts with `/pnp:mission`.

## Measurements

| correction rounds | COO session at close | source |
|---|---|---|
| 0 | 350,000 | `~/.claude/ctx/4f4c67e9-8d51-4806-bb9e-7e66c3d0d14d.pct` (35) x `.size` (1,000,000) |
