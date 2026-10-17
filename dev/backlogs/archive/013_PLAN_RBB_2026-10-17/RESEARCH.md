# RESEARCH - plan RBB (REBUILD plan B: the cycle as a skill and as doctrine)

Two `sonnet` scan agents, 2026-10-17, read-only over the tree at `a716b5c`. Pointers, not prose; a
line number is what the agent saw at that commit and is re-verified by whoever acts on it. Research
delta against plan A: `archive/012_PLAN_RBA_2026-10-17/RESEARCH.md` is the base; what A changed is
in its three records (the roadmap seed, the folder predicate, the rewritten `plan-gate.js`).

## Code Map (file -> role today)

| file | role |
|---|---|
| `skills/review/SKILL.md` | 810 lines. Step 0 :31-47; 0b resolver :49-92; 0c classes :93-120; 1 scope :121-131; 2 brief :132-196 (`Class:` :141); **2a** ledger+scan :197-266 (files :256-257); **2b** fact-check gate :267-352 (gaps list :326,:332; `fact-check-r<N>.md` :343); **2c** scan :353-385; **2d** own pass :386-445 (`own-pass.md` :394; `--hash` :408; gate text :422-441); **2e** where artifacts live :446-519 (draft :449, lock :450,:466-467, `.aiwf/plan/<ABBR>/` :483-493, `revisions.md` :463,:491); **plan-readiness mode** :520-594 (verdict PASS/NEEDS-FIX :542,:591; `PREVIOUS PASS BLOCKERS` :547-549; brief lines `Class: plan`/`PLAN:`/`TICKETS:`/`CONSEQUENCE SCAN:`/`OWN PASS:` :554-565; passes ceiling :577-586); 3 codex :598-746 (brief file :605; ps1 command :611-614; sh :618-622; separate tool calls :634-636; background :652-661; resume :669-680,:693-725, readiness pass 1 always cold :698; `last-review-session.txt` :683); 3 claude :747-794 (`reviewer` :749; alias-vs-exact-id :758-765; pin mismatch :767-773); 4 relay :795-810. No `COVERED BY:` line anywhere in the file |
| `scripts/native/ps/codex-review.ps1`, `scripts/native/sh/codex-review.sh` | flags: `-ProjectRoot` (mandatory), `-Class`, `-Resume`, `-ResumeId`, prompt on stdin (ps1 :58-64,:210-212; sh :57-73); NO `-Model`/`-Effort` (row from the resolver, sh :107-125); stdout/stderr untouched - the full verdict prints to the caller (sh :243-249, recipe :92-98); the only file written is `<scratchDir>/last-review-session.txt` (ps1 :126, sh :166); plan-gate brief mode on stdin with `--plan-class` (ps1 :215-231, sh :227-241), exit 2 `plan-class pass refused` |
| `scripts/engine/plan-gate.js` | `readFolder` :245-262: `plansDir` = the folder's GRANDPARENT (:254), so `drafts/<ABBR>/` resolves `readiness/<ABBR>/` and the xrefs exactly as `active/<ABBR>/` does; `examine` :390-403 checks only "directory + basename `[A-Z]{2,8}`", never the `active` segment; stamp path :383 |
| `scripts/engine/pretooluse-mutation-guard.js` | Gate 1: `agent_type === "writer"` allow :328; main session :331; every other subagent identity DENIED :333-341, no path exemption - a planner subagent cannot Write anywhere, scratch included |
| `scripts/engine/pretooluse-dispatch-gate.js` | `reviewer` agent type :74; `Class: plan` branch runs plan-gate brief mode |
| `scripts/selfcheck/aiwf-selfcheck.js` | skills enumeration :6719-6751: every `skills/<n>/SKILL.md` has `name:` = dir, `description:`, matches `Step 0`, `git rev-parse --show-toplevel`, `aiwf.config.json`, `/pnp:setup` (:6729-6736); every skill but `update`/`selfcheck` matches `scripts/update/aiwf-update.mjs` and `--check` (:6742-6747); cross-ref scan :6758-6790 (every `docs/*.md`, `schema/`, `scripts/`, `templates/...(tmpl|json)` named in skills/docs/templates/migrations must exist - `templates/*.md` NOT covered :6764); provenance walk :6896-7075 (`PROV_AREAS` :6936 incl. `skills`, `templates`; `.md` scanned; Cyrillic :6963, emails :6959, abs paths allowlist :6946-6958; canaries :7149-7187); `OP_TYPES` copy :7328 = FOUR; `example-bump-ops-types` :7545-7549 ("ALL FOUR" :7548, :8468) |
| `scripts/update/validate-payload.mjs` | `OP_SPECS` :105-163 (`seed-file` :152-162; `OP_TYPES` :190 = FIVE); seed checks :447-458, `<plansDir>` token :165,:174-189; rerender op :393-430 (template required, `#region` checked); manifest: id regex :268, no gaps :274, monotonic :284, last entry == plugin.json :295-299; `NOTES.md` required :330-331; ops.json wrapper :343-351 |
| `scripts/update/migrate.mjs` | `seed-file` dispatch :400 -> `planSeedFile` :487-499; `resolveSeedTarget` :505-530; exclusive create :554; never recorded |
| `scripts/update/test-update.mjs` | skills mirror :382-390; "four" prose :13,:272,:313; seed-file suite :1459-1600 |
| `scripts/setup/test-setup.mjs` | plansDir dirs `active/ archive/ drafts/ readiness/` :187-188 (+ negative control :200-208); ORCHESTRATOR render :249-262; AGENTS headings :273-285; template contracts :1323-1334 |
| `scripts/setup/generate.mjs` | managed renders :1030-1064 (reviewer/qa `ifRecorded` :1056); seeded once :1151 (overrides), :1173 (transfer surface), :1188 (roadmap); `readMemorySeeds` :1345-1350 (no fixed list) |
| `scripts/ci/run-example-cycle.mjs` | 8 steps :454-607; repo byte-identical :627-632; `DOCUMENTED_COMMANDS` :57-58 |
| `scripts/ci/example-bump.mjs` | numbers the example bump as manifest length + 1 at the next minor |
| `examples/example-project/bump/example-bump/ops.json`, `NOTES.md` | 5 ops (idx 0 `add-config-key` answered by the cycle; 4 `rerender` writer.md); "all four" :23; NOTES :4 "five operations" |
| `templates/ORCHESTRATOR.md.tmpl` | :184-185 § References only names ledger, consequence scan, own pass, "Steps 2a-2d" - MANAGED (re-render op owed) |
| `templates/CLAUDE.md.tmpl` | changed in `b67d93c` (off-plan text, 6 lines) after migration 0024 (`8bef63f`) with NO re-render op - MANAGED region `aiwf-core` |
| `templates/PROJECT_OVERRIDES.md.tmpl` :171, `templates/roles.json.tmpl` :6 | `review.plan.passes` (seeded once / placeholder) - no artifact-term hits; zero hits in `AGENTS.md.tmpl`, `agents/*.tmpl`, `memory-seeds/*` |
| `templates/README.md` | :1-43; seeds :38-42; no rule on a run-time-read directory; no manifest or fixed list of templates |
| `docs/WORKFLOW.md` | 1152 lines. § Plan readiness review :391-555 (own pass :449-491, ledger :432-450, plan-gate :481-489, classes 14/15 :442,:546); § Planning lock :351-390 (draft+readiness exception :370-371); § Loop shape :302-350 (artifacts :317-325, fact-check :332,:339,:348); § Roles :33; § write boundary :152,:156; § not arbitrate :170; guard (e) :248; § brief contract :628; § Durable history :684-824 (layout :767, artifact list :778); § transfer surface :825-855 |
| `docs/LOOP.md` | 338 lines. :32 Step 2b; :153-154 Gate 2 denies on missing artifacts |
| `docs/REVIEW_CHECKLIST.md` | 235 lines. § Plan readiness :16-37 (hits :18,:22,:26,:28,:32); § Given per brief :49 |
| `docs/OPERATOR_PROTOCOL.md` :47-50,:102,:115; `docs/CODEX_REVIEW_QA_RECIPE.md` :201-202; `docs/READINESS_CLASSES.md` :9-10 (31 lines, the 15 classes); `docs/README.md` :16-17 | old-flow sentences |
| `README.md` (root) | § Status :20-104 (`v0.2.20` :22; "Twelve commands as skills" list); :43 and :218-220 name the old artifacts; commands table :190-211 |
| `CHANGELOG.md` | header :1-4; 0.2.20 block :6-59 (summary, `**Before you run**` :12-14, `### Changed/Added/Removed`, `Retires local rules: none` :59; the convention defined :29) |
| `migrations/index.json`, `migrations/0024_thin-rendered-files/{ops.json,NOTES.md}`, `migrations/README.md` | last entry `0024` / 0.2.20; 0024 = six `rerender-managed-region` ops, no `note`; NOTES sections: summary, What changes, What this migration does, Superseded local rules; README op table still "four operation types" (no `seed-file` row) |
| `.claude-plugin/plugin.json` :3 | `"version": "0.2.20"` |
| other skills | `mission` :40, `work` :47, `setup` :76 (plansDir dirs incl. `drafts/`, `readiness/`); `loop` :62,:89; `roles` :118-123,:145-146; `brief` :36 - pointer-level; NO hits for own pass / ledger / Steps 2a / `TICKETS:` / `/pnp:plan` outside review |
| `.claude/hooks/context-gate.mjs` | HARD-024 lives in the self-install layer only; payload has zero hits for `checkpoint.md`, `400k`, `950k` |

## What the code does today (the facts the decisions rest on)

1. Skills are auto-discovered: no list in `plugin.json`, `marketplace.json` or `hooks.json`; the
   self-check asserts the frontmatter and the Step 0 phrases above per skill, no count.
2. A `templates/briefs/*.md` file trips no check: the provenance walk scans it (English, no abs
   path), the cross-ref scan ignores `templates/*.md`, nothing enumerates `templates/`. There is no
   precedent of a skill reading a `templates/` file at run time (skills read `docs/*.md` by name).
3. The Codex wrappers print the whole verdict on stdout and write no verdict file; model/effort come
   from the class row, never from a flag.
4. Gate 1 denies Edit/Write to every subagent but `writer`; a planner agent cannot write a plan file.
5. `plan-gate.js` accepts any `<X>/<ABBR>` folder whose grandparent is plansDir: `drafts/<ABBR>/`
   passes `--check`/`--stamp` with the stamp in `readiness/<ABBR>/`; Gate 2 off-plan looks only in
   `active/`, so a ticket of a drafted plan raises the dialog.
6. Two managed templates changed since migration 0024 with no re-render op: `CLAUDE.md.tmpl`
   (`b67d93c`); `ORCHESTRATOR.md.tmpl` is unchanged but its :184-185 name the struck artifacts.
7. `OP_TYPES` is five in the validator and four in the self-check's example-bump copy; the example
   bump must use every type of the self-check's list; `migrations/README.md` names four.
8. No self-check or suite pins a doctrine sentence of `docs/*.md`, `CHANGELOG.md` or a template
   body, except: skills' Step 0 phrases, the cross-ref existence scan, AGENTS' four headings,
   `test-setup.mjs:187-188` (plansDir has `drafts/` and `readiness/`).

## Unknowns left to the executing session (confirm before acting; none changes a decision)

- Whether `skills/README.md` or `hooks/hooks.json` name the old artifacts (not grepped).
- The 0.2.19 CHANGELOG block's end line (the 0.2.20 block is the model).
- The exact wording of `skills/roles/SKILL.md` :118-123 (hit, not read).
