# RULEHOME-002 [R2 code + release] - the habit guard, the gates' guarantees, the per-ticket brief, 0.3.7

Implements: D-02, D-04, D-05, D-06, D-13, D-14, D-15, D-16.
COO: Fable - because check 1.
Branch: `main`. Depends on: RULEHOME-001 committed (its templates ride the migration).

## Outcome

D-04, D-05 (a)-(e), D-06, D-13 (one commit), D-14, D-15 landed; 0.3.7 cut (D-02).

## Scope

Every item is a row of the index § RULEHOME-002 worklist, at its `file:line`.

1. Spikes first, by the index § RULEHOME-002 spikes, results in `records/RULEHOME-002.md` before
   the Writer's dispatch.
2. Habit guard INSIDE `scripts/engine/pretooluse-git-verb-guard.js` (wired at
   `hooks/hooks.json:23-31`, deny via `scripts/engine/aiwf-lib.js:90-92`): the D-14 matrix - the
   five deny shapes and their hints of the index row; quotes / nested shell not judged.
3. `onFailure: "block"` at `hooks/hooks.json:9-10` and :27-28 only; :18-19 (Gate 2) unchanged;
   Monitor at `pretooluse-git-verb-guard.js:486-494` (Bash dialect); spike (c) recorded; LOOP §
   Enforcement names the honest limit.
4. D-13 code: `scripts/native/ps/codex-review.ps1`, `scripts/native/ps/codex-qa.ps1:57`,
   `scripts/native/sh/codex-review.sh:43-45`, `scripts/native/sh/codex-qa.sh:44-45` take
   `-BriefFile <path>` / `--brief-file <path>`, contract D-15: flag = read that path, no flag =
   stdin, both = exit 2, a missing / empty file = exit 2; QAL out; the Writer's closing grep finds
   the other pins (the .ps1 review wrapper, the self-check rows).
5. D-13 prose, the index row's 27 pointers: `docs/WORKFLOW.md:765-770`,
   `docs/SESSION_BRIEF_RECIPE.md:45`, `templates/ORCHESTRATOR.md.tmpl:61`; `skills/plan/SKILL.md:197`,
   :205 -> `<key>-readiness-round.txt` (D-15); the "fixed on purpose" paragraphs
   `skills/review/SKILL.md:319-327`, `skills/qa/SKILL.md:209-210`, :231-234 rewritten to the
   per-ticket file + constant prefix; `scripts/native/README.md:24-26` names the flag.
6. C5 per D-04: `docs/LOOP.md:99-100`, `templates/agents/writer.md.tmpl:103-104`,
   `skills/qa/SKILL.md:103`; the variable ships only through an existing op (overrides § Data
   :124-126).
7. Self-check and spike rows for 2-6, each with its negative control.
8. Release: `.claude-plugin/plugin.json:3`, `migrations/0032_<slug>/` + `migrations/index.json:32`,
   `CHANGELOG.md` `## [0.3.7]` with its `Retires local rules:` line and the D-15 launch-form line,
   `README.md` § Status.

## Acceptance

From the repository root; the output after the dash means broken.

- `node scripts/selfcheck/aiwf-selfcheck.js --plugin-root .` (CI form before the commit, `dev/VERIFY_RUNBOOK.md:21-25`) - exit != 0.
- `node scripts/spike/run-spikes.mjs` - exit != 0.
- `node scripts/update/test-update.mjs` - exit != 0.
- `node scripts/update/validate-payload.mjs --plugin-root .` - exit != 0.
- `claude plugin validate .` - exit != 0.
- `node scripts/setup/test-setup.mjs`, when item 6 shipped the variable - exit != 0.
- `git grep -c -F "onFailure" -- hooks/hooks.json` - any count but 2.
- `git grep -n -C3 -F "pretooluse-dispatch-gate" -- hooks/hooks.json` - an `onFailure` line.
- `git status --short -- scripts/engine hooks` - a `??` line (a new hook file).
- `git grep -c -i "habit" -- scripts/engine/pretooluse-git-verb-guard.js scripts/selfcheck/aiwf-selfcheck.js` - either file missing.
- `git grep -l -F "Monitor" -- scripts/engine/pretooluse-git-verb-guard.js scripts/selfcheck/aiwf-selfcheck.js` - either file missing.
- `git grep -n -F "sh -lc" -- scripts/selfcheck/aiwf-selfcheck.js` - no hit (the PASS case of `dev/VERIFY_RUNBOOK.md:47`, D-14 (b)).
- `git grep -n -F "updatedInput" -- scripts hooks` - any hit (D-06).
- `git grep -nP "(?<!-)(review-brief|qa-brief|readiness-round)\.txt" -- scripts docs skills templates` - any hit.
- `git grep -l -F "BriefFile" -- skills/review/SKILL.md skills/qa/SKILL.md skills/plan/SKILL.md scripts/native/ps` - fewer than 5 files.
- `git grep -n -F -e "do not make the path unique" -e "unique per session or per ticket" -- skills` - any hit.
- `git grep -n -e 'version.*0\.3\.7' -- .claude-plugin/plugin.json` - no hit.
- `git grep -n -F "## [0.3.7]" -- CHANGELOG.md` - no hit.
- `git grep -n -i -e silerax -e stratex -- CHANGELOG.md docs skills templates scripts hooks migrations` - any hit.
- the provenance grep of `dev/PROJECT_OVERRIDES.md:54-55` - any hit.

## Risk threshold

Blocks: a fail direction flipped, Gate 2's above all (overrides :109-111); a fourth hook file; a
habit deny with no hint, on a non-shell tool, or of a form D-14 does not name; a rewritten command; a launch command that loses its
constant prefix; a skill naming a flag the wrappers lack; a managed artifact without a re-render op;
a row without a negative control; a path or project name in the payload. Notes: hint wording.

## Stop condition

Stop and hand back before any write when: no constant-prefix launch form avoids a dialog (D-13 -
the operator decides again); a file outside the Code Map must change. D-04's no-carrier branch is
no stop: the ticket goes on. Stop after the code commit; the closing half (0.3.7 here, the D-16 (c)
sweep of this repository's consumer layer, the record), tag and push are the COO's on the
operator's words.

## Verify

The rows' union (overrides § Test policy :151-165), once: `selfcheck`, `spikes`,
`update-suite`, `validate-payload`, `plugin-validate` (`claude plugin validate .`, hooks.json
changed), `setup-suite` if item 6 touched setup - by the COO in the background (overrides :167-170,
`dev/VERIFY_RUNBOOK.md`).

## Code Map

| path | role |
|---|---|
| `hooks/hooks.json` | 2, 3 |
| `scripts/engine/pretooluse-git-verb-guard.js` | 2, 3 |
| `scripts/native` | 4, 5 |
| `docs` | 3 (LOOP honest limit), 5, 6 |
| `skills` | 5, 6 |
| `templates/ORCHESTRATOR.md.tmpl` | 5 |
| `templates/agents/writer.md.tmpl` | 6 |
| `templates/settings.ask-ruleset.json` | 6 if carried |
| `scripts/setup/generate.mjs` | 6 if carried |
| `scripts/selfcheck/aiwf-selfcheck.js` | 7 |
| `scripts/spike/run-spikes.mjs` | 7 |
| `.claude-plugin/plugin.json` | 8 |
| `migrations` | 8 |
| `CHANGELOG.md` | 8 |
| `README.md` | 8 |
