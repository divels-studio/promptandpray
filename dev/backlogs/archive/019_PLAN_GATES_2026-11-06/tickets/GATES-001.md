# GATES-001 [R2 code] - the habit guard denies every `git -C` and reads through a leading operator

Implements: D-01, D-02, D-11.
COO: Opus - because all four no.
Branch: `main`. Scope guard: `HEAD <hash>` at the dispatch. Depends on: nothing.

## Outcome

The habit guard carries a sixth shape: `git -C <path> <anything>` and `git -C<path> ...` denied on
both tools for every actor, with D-01's hint verbatim. `Push-Location`, `Pop-Location` and `popd`
change the directory, and a leading `&`, `{`, `(`, `$(` or `.` is read through (D-02). The six
`git -C <projectRoot>` ask rules stay (D-01).

## Scope

The worklist; every row at its `file:line`.

- A1 `scripts/engine/pretooluse-git-verb-guard.js`: D-01's hint as a constant beside `HINT_DIRECTORY`
  `:528`; a `HABITS` entry beside `gitDashC` `:535`, shape label `git -C`; `Push-Location`,
  `Pop-Location`, `popd` appended to `HABIT_DIRECTORY_CHANGERS` `:544`; in `habitOf`, before `first`
  is taken (`:608-610`), leading `&`, `{`, `(`, `$(`, `.` are read through, repeatedly (`& {` is two);
  an opener glued to the word (`$(cd`, `(cd`, `{Push-Location`) comes off as a prefix, while `.` is
  skipped only as a whole word (`./x.ps1` is a path); the match beside `:618`: first word one of
  `HABIT_GIT_PROGRAMS` `:548`, second word `-C` or `-C<path>`, never case-folded (as `-c` is not).
- A2 the same file's prose: header `:8-31` (six shapes, the read-through, the quotes limit restated
  with the new forms), `:515-516`, comments `:179-180`, `:204-208`, `:215-219`, `:491`.
- A3 `scripts/selfcheck/aiwf-selfcheck.js`: hint matrix `:1811-1849` gains DENY rows for
  `git -C <path>`, `git -C<path>`, `git.exe -C`, on both tools, and for the D-02 forms; PASS twins
  `:1851-1892` - `:1866`, `:1877` become DENY rows, new twins `echo git -C /p log`, `git log -C`, a
  quoted `"git -C /p"`, `. ./x.ps1`; pure rows `:2133-2141` - at `:2137`,
  `habitOf('git -C /p log') === null` becomes shape `git -C`; hook rows with a `-C` form
  `:1612-1619`, `:1685`, `:1776`, `:1779` expect the habit deny (D-01); `:1486`, `:1935`, `:1989`,
  `:2022`, `:9143`, `:9152` unchanged (they call `recognisedVerb` / `shippedRuleMatches` or the
  ruleset directly).
- A4 `scripts/spike/run-spikes.mjs`: Bash `:443-446`, `:481`, PS `:576-577`, `:587`, `:604` expect
  `deny`; comments `:517`, `:595` say six shapes; new rows for the D-02 forms on both tools; `:608`
  (`echo X & cd scripts`) stays silent under D-02 - its first word is `echo` (RESEARCH's "flips" line
  predates D-02).
- A5 prose that states what a `-C` form gets: `docs/LOOP.md:81-86`, `:112`, `:118-132`;
  `templates/ORCHESTRATOR.md.tmpl:463` ("The `-C` forms ask by construction"); `README.md:48`;
  `docs/OPERATOR_PROTOCOL.md:66`; `hooks/hooks.json:2`; `scripts/engine/aiwf-lib.js:21`.
- A6 unchanged: `templates/settings.ask-ruleset.json:66-68`, `:120-122` and `ownedAskRules` (D-01);
  `habitSegmentsOf` `:552-581` (the PS `&` stays a non-separator, D-02); the ask-reason text `:697-706`.

## Acceptance

From the repository root, on the Bash tool; the output after the dash means broken.

- `node -e 'const h=require("./scripts/engine/pretooluse-git-verb-guard.js");const D=[["git -C /p status","Bash"],["git -C/p log","Bash"],["git.exe -C /p log","Bash"],["git -C /p status","PowerShell"],["& { Push-Location x }","PowerShell"],["{ Pop-Location }","PowerShell"],["popd","Bash"],["$(cd x)","Bash"],["( cd x )","Bash"],["{ cd x; }","Bash"],[". { sl x }","PowerShell"]];const P=[["echo git -C /p log","Bash"],["git log -C","Bash"],["git -c","Bash"],[". ./x.ps1","PowerShell"],["echo X & cd scripts","PowerShell"],["Write-Output \"git -C /p\"","PowerShell"],["git status","PowerShell"]];for(const[c,t]of D)if(!h.habitOf(c,t))console.log("MISSED",t,c);for(const[c,t]of P)if(h.habitOf(c,t))console.log("FALSE",t,c)'` - any `MISSED` or `FALSE` line.
- `echo '{"tool_name":"Bash","agent_id":"a1","agent_type":"Explore","tool_input":{"command":"git -C .. status"}}' | node scripts/engine/pretooluse-git-verb-guard.js` - output without `habit: git -C`, or without `file tools`.
- `echo '{"tool_name":"PowerShell","tool_input":{"command":"& { Push-Location .. }"}}' | node scripts/engine/pretooluse-git-verb-guard.js` - output without `habit: cd prefix`.
- `git grep -n "five shapes" -- docs scripts hooks README.md` - any hit.
- `git grep -n -F "ask by construction" -- templates docs` - any hit.
- `git grep -c -F "git -C <projectRoot>" -- templates/settings.ask-ruleset.json` - a count other than 7 (the six rules plus the comment at line 5).
- `git grep -c -F "Push-Location" -- scripts/engine/pretooluse-git-verb-guard.js` - no hit.
- `git grep -c -F -e "& {" -e "& (" -- skills` - any hit (0 on 2026-11-06: no skill command the
  read-through would now judge).
- The selfcheck and spikes runs of § Verify - exit != 0, or a row of A3 / A4 still expecting silence
  or ASK for a `-C` form.
- The provenance grep of `dev/PROJECT_OVERRIDES.md:156-157` - any hit.

## Risk threshold

Blocks: a fail direction changed - a shape the guard denied now passes, or Gate 4 judges a non-`-C`
form differently (overrides § Architecture direction); an ask rule removed from the ruleset or from
`ownedAskRules` (D-01); a form inside quotes now judged, or the PS `&` made a separator (D-02); a row
flipped other than A3 / A4's, unreported; a non-ASCII byte or a path in the payload. Notes: comment
and hint wording beyond D-01's text.

## Stop condition

Stop and hand back before writing when: a PASS row off A3 / A4's list would flip (name it); the
read-through needs a change to `habitSegmentsOf` `:552-581`; a file outside the Code Map must change.
Stop after the hand-back; the commit follows the review, on the operator's click.

## Verify

D-11's hooks row plus the union for a template and doc edit (overrides § Test policy): `selfcheck`
(`node scripts/selfcheck/aiwf-selfcheck.js --plugin-root . --project-fixture .`), `spikes` (`node
scripts/spike/run-spikes.mjs`), `validate-payload` (`node scripts/update/validate-payload.mjs
--plugin-root .`), cwd `.`, and one render dry-run of `templates/ORCHESTRATOR.md.tmpl` on a scratch
copy - once, by the COO in the background at the hand-back. Portion 1 only (Portion 2 is not a release
gate); runbook `dev/VERIFY_RUNBOOK.md`; logs outside the repository; a run over ~5 minutes in the
background with a 3600000 ms timeout. The Writer runs only the tests it adds, red then green.

## Code Map

| path | role |
|---|---|
| `scripts/engine/pretooluse-git-verb-guard.js` | A1, A2 |
| `scripts/selfcheck/aiwf-selfcheck.js` | A3 |
| `scripts/spike/run-spikes.mjs` | A4 |
| `docs/LOOP.md`, `docs/OPERATOR_PROTOCOL.md` | A5 |
| `templates/ORCHESTRATOR.md.tmpl` | A5 |
| `README.md` | A5 |
| `hooks/hooks.json` | A5 |
| `scripts/engine/aiwf-lib.js` | A5 |
