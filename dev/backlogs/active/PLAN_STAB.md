# PromptAndPray — стабилизация, план А: текстът на доктрината (PLAN_STAB)

> **ОДОБРЕН 2026-10-14 (операторска дума „р2 без пас, след това одобрение на плана и комит“).**
> Readiness: пас 1 NEEDS-FIX 6 (затворени в r3), пас 2 NEEDS-FIX - шестте CLOSED + 1 нов (R2 срещу R3),
> решен от оператора: R2, без пас 3 (D1). Own pass печат над r3 `be4591a1…3889`; текстът след него се
> различава само по изречението за R2 в D1 и тази бележка (`dev/backlogs/readiness/STAB/revisions.md`).
> Изпълнението на STAB-001 - отделна дума.

> **ЧЕРНОВА r3 — 2026-10-14:** r2 → r3 затваря шестте блокера на readiness пас 1 (Codex, NEEDS-FIX):
> code-class с един Codex пас (D1), COO top (D2), H само след Reviewer `fail`, Y проверен цял, pnp-live
> след последния commit; делта scan (редове 28-45) добави G3 (commit гейтът на `/pnp:loop` стъпка 6) -
> 33 блока, 36 проверени + 8 отсъстващи; делта fact-check `fact-check-r2.md` - затворен тук (`revisions.md`).
>
> **ЧЕРНОВА r2 — 2026-10-14, HEAD `bc8c9a4`.** r0 → r1 след Step 2a (ledger 28 реда + scan 27 реда);
> r1 → r2 след Step 2b (`fact-check-r1.md`: 167 твърдения, 12 FALSE, 10 UNVERIFIABLE, пропуски A=18
> B=13 C=8) - всички FALSE, A и B затворени тук, C подравнени (`revisions.md`). Роден от
> `dev/backlogs/CANDIDATES.md` § „Инвентар 2026-10-14“ (фаза „стабилизация“: план А - текстът, 0.2.18;
> план Б - кодът, 0.2.19). Inventory в тази сесия: три `Explore`/sonnet агента над payload-а.
>
> Издание: **0.2.18**, вози се на единствения тикет. План Б (0.2.19) и HARD-011 (0.3.0) не се пипат.
>
> Указателна дисциплина: `file:line` само в worklist-а и acceptance-а, към HEAD `bc8c9a4` (commit-ите след
> него - `fe98aac` и т.н. - са само `dev/`, payload-ът е същият); редовете се местят - Колегата съди по
> ИЗРЕЧЕНИЕ, котвата е за намиране.

## Контекст

- Фазата е „стабилизация“ (операторско решение 2026-10-14): плъгинът се стабилизира, после първият
  консуматор минава на него, после вторият го догонва. Всяко локално правило на консуматор, което
  payload-ът поеме, е едно правило по-малко за ръчно пренасяне.
- Операторът се пази от раздуване на доктрината. Затова блоковете са кратки (1-3 изречения), без нов
  раздел; J1 и S1 са нови абзаци в съществуващи раздели; обемът се отчита (D11).
- Пинове: self-check-ът пинва ПЕТ изречения, whitespace-tolerant - „one word per pass“, изречението за
  въпроса при нов тикет, host-precedence и rule-bearing write gate (в `docs/WORKFLOW.md`) и „A
  readiness pass after the first may resume only with its compensations, and only on the operator's
  word“ (`skills/review/SKILL.md`); плюс „Four countable tripwires“ в `templates/CLAUDE.md.tmpl`
  (`scripts/update/test-update.mjs`, REGION_NOW). Нито един блок не пипа тези изречения.
  ORCHESTRATOR рендерът е пиннат == шаблона (`scripts/setup/test-setup.mjs`).
- Провенанс: payload-ът, CHANGELOG, CHANGES файлът, NOTES.md и бележката не съдържат кирилица и имена
  на консуматорите (denylist по digest в self-check-а) - пише се „a consumer“.

## Решения (COO; всяко с един ред защо)

- **D1 — един тикет, code-class (r3, readiness пас 1 блокер 1):** операциите в `ops.json` се изпълняват
  от migration engine-а и пишат в инсталирани файлове - „anything that runs“ (WORKFLOW § R1) и `Class:
  code` (§ R2). Затова одитът е ред `review.code`: един Codex пас над дифа, на думата за тикета, с
  fact-check gate преди него. r2 го класифицираше docs - грешка на COO, хваната от пас 1. Маршрутът е R2
  по операторско решение (2026-10-14, „р2 без пас“), след блокера на readiness пас 2: WORKFLOW § R3 и
  LOOP.md (таблицата на маршрутите) слагат „migrations“ в R3 без уточнение, а всяко издание с payload
  миграция от 0.1.1 насам е минало като R2 на `main`. Разминаването в текста е кандидат за следващия план.
- **D2 — COO routing: top (r3, пас 1 блокер 2).** Проверка 2 буквално е „да“: worklist 14(g)-(h) са
  команди без `file:line` котва (WORKFLOW § COO routing: „any worklist item without a `file:line`
  anchor“). Проверка 1 („the ticket writes migration / access-policy / grants / auth / permission-model
  code“) е спорна - `0022` е payload миграция от rerender операции, не код; маршрутът е top и без нея.
  Проверка 3: escalation клас няма. Проверка 4: противоречието на H с WORKFLOW `:317`/`:323` и с commit
  гейта на `/pnp:loop` стъпка 6 е затворено (D9, G3); днешните event редове (CANDIDATES `fe98aac`) са от
  консуматор и не стоят на пътя на този тикет.
- **D3 — една миграция `0022_stab-prose`:** rerender на `CLAUDE.md#aiwf-core`, `.claude/agents/writer.md`,
  `.claude/agents/reviewer.md` (`ifRecorded: true` - тук го няма, Reviewer-ът е codex; операцията се
  пропуска като „no record“) и `.claude/aiwf-native/ORCHESTRATOR.md` + `note`. Това НЕ е prose-only
  издание по overrides § Release discipline (там миграцията е само `note`), защото четири рендерирани
  шаблона се сменят - а managed artifact не се сменя тихо.
- **D4 — извън плана; при приземяването COO ги мести в отложените на CANDIDATES § „Инвентар“ (docs
  commit-а на приземяването):** trace по подразбиране `retain-on-failure` (бие се със
  `skills/qa/SKILL.md` Step 2 - `--trace on` е там, за да не се самоблокира QA при зелен пуск); копие на
  E2E отчета от Колегата (по доктрината E2E го пуска COO); „E2E преди кодовия одит“ (пренарежда R2
  маршрута); chain-trace в evidence pack-а (кандидатът сам чака данни - CANDIDATES § „Веригата“);
  „доктринно изречение, което изброява света“ (наблюдение, не правило).
- **D5 — т. 7 (платен преглед извън двата стандартни) без ново спиране:** планът го записва с обхват и
  приблизителна цена, одобрението на плана Е думата му и се цитира в реда COVERED BY. Защо: доктрината
  вече иска дума за „pass beyond the contract“, а операторът отказа спиране по средата.
- **D6 — т. 5 (умрял платен пас):** възстановяването остава bare resume, но е платен диспач - казва се
  какво е известно за умрелия пас и се иска дума. Настройката stop/resume е код - не тук.
- **D7 — „Editing is not a shell job“ (т. 12 + (k))** отива там, където живее „Reading is not a shell
  job“ за ролите: `templates/CLAUDE.md.tmpl`, `docs/LOOP.md`, `templates/agents/writer.md.tmpl`. Деветте
  Step 0 копия в skills не се пипат (те са за четенето в самия skill). Правилото е за TRACKED файловете;
  агент-процедура, който трябва да остави файл (скрипт, измерване), пише само в scratch директорията на
  пътя от брифа - Gate 1 му забранява Write, така че shell-ът е единственият му път (блок A).
- **D8 — т. 16:** описанията на механизма („the operator clicks **Yes**“) в docs/skills остават - те
  описват диалога, не казват на оператора какво да прави.
- **D9 — всички блокове са правила (guard (g)):** текстът им е тук дословно и одобрението на плана е
  одобрението на текста. Блок H е ИЗРИЧНО изключение от изречението преди него („The moment a
  correction round changes code the pass is warranted“) и изключва петте повърхности на COO routing
  check 1; WORKFLOW `:165-170`, `templates/CLAUDE.md.tmpl:30-33` и `skills/review/SKILL.md:695` говорят
  за пас, който СЕ диспачва (дума, resume) - при малкия кръг пас няма, затова те остават верни; commit
  гейтът на `/pnp:loop` стъпка 6 („every required role returns `pass`“) получава G3.
- **D10 — VERIFY:** редовете на overrides § Test policy за този диф - „update engine / migrations /
  examples“ (`update-suite`, `validate-payload`, `example-cycle-windows`, `selfcheck`) и „docs / skills
  prose“ (`validate-payload` + провенанс grep-а; `selfcheck`, защото дифът пипа `templates/`) - плюс две
  добавки с причина: `setup-suite` (пинът „ORCHESTRATOR рендер == шаблона“ живее там) и
  `plugin-validate` (`plugin.json` се сменя). Без `spikes` (hooks непроменени). Една паралелна партида,
  СЛЕД `--apply`, без редакции в дървото докато върви (`dev/VERIFY_RUNBOOK.md`).
- **D11 — обемът се отчита, не е проверка:** handback-ът носи броя думи преди/след на докоснатите
  doctrine файлове (командата е в acceptance-а). Съкращаването на доктрината е отделна, отложена работа.

## Тикет

### STAB-001 [R2 code-class] — текстът на доктрината: 33 блока от приема и инвентара; release 0.2.18

**COO:** top, because check 2 (worklist 14(g)-(h) are commands without a `file:line` anchor) (D2).

**Outcome:** 33-те блока A–X са в payload-а дословно (сравнени при нормализирани интервали), на местата
от worklist-а, а заменените изречения ги няма; `0022_stab-prose` пре-рендерира три artifact-а тук
(`reviewer.md` се пропуска - няма запис) и четири при консуматор с claude Reviewer; версията е 0.2.18
(bump, index, NOTES, CHANGELOG, README печат - текстовете са блокове тук); самоинсталацията е на 0.2.18
(`--apply`, вкл. CHANGES файла).

**Scope:** файловете в worklist-а + изданието + самоинсталацията (`CLAUDE.md` регионът,
`.claude/agents/writer.md`, `.claude/aiwf-native/ORCHESTRATOR.md`, `aiwf.config.json`) и
`CHANGES_0.2.17-to-0.2.18.md` от `--apply` (предшествениците му са commit-нати). **Out of scope:** D4;
код под `scripts/`, `hooks/`, `schema/`; деветте Step 0 копия; описанията на диалога (D8); `dev/`.
**Branch:** `main`; commit-ът носи само тези файлове.

**Risk threshold:** блокира - текст, различен от блока; заменено изречение, което е останало; пин, който е
изчезнал; кирилица или име на консуматор в payload-а, CHANGELOG, CHANGES файла или NOTES.md; рендер,
различен от шаблона; миграция, която validate-payload отхвърля. Бележка - стил.
**Stop condition:** `check-blocks.mjs` → `36/36 present, 8/8 old texts gone`, VERIFY 6/6 exit 0,
acceptance изпълнен; без редизайн на формулировките.

**Worklist (котви към HEAD `bc8c9a4`; всеки блок се вмъква ДОСЛОВНО, пренасянето - по ширината на
файла, ~100 колони):**

1. **`docs/WORKFLOW.md`**
   - (a) `:98` в tripwire (3), след „...the second is the pattern.“ → **A**.
   - (b) `:104` в tripwire (4), след „...never an ambient duty.“ → **B**.
   - (c) `:179-182` точка 1 „**Plainly.**“, в края → **C1**; `:192-196` точка 4, в края → **C2**.
   - (d) `:173` в края на абзаца, след „...is a workflow defect, not politeness.“ → **D**.
   - (e) `:313` в края на bullet-а „**Only the operator lifts the correction-round cap.**“ → **G1**.
   - (f) `:324` в края на bullet-а „**A code-touching correction round WARRANTS ...**“ → **H**
     („one word per pass“ на `:320` остава).
   - (g) `:540` целият ред `Verify policy      - checks/proof required, by risk` → **X**.
   - (h) `:667-668` цялата точка 3 → **E**.
   - (i) `:672` в точка 4, след „...and tracking it is never the operator's job.“ → **K**.
   - (j) `:279` след първия абзац на § Verifying failure claims (преди „**VERIFY honesty.**“) → **J1** като
     нов абзац.
   - (k) `:874-875` „(or, for an unplanned R2, in the brief)“ → **W**.
   - (l) `:880` след „ALL "no" puts it on the cheap COO.“ → **F**.
   - (m) `:924` в края на абзаца „**A session does not mutate a repository outside its own project
     root.**“ → **V**.
   - (n) `:1009` началото на bullet-а „- **Commit:** Writer only, local only, after the review route
     passes AND a human explicitly“ → **I** (останалото непроменено).
2. **`docs/LOOP.md`** — (a) `:48` в Writer bullet-а, след „(the initial PLAN write, an accepted-closeout
   section).“ → **L**; (b) `:109` в края на абзаца „**Reading is not a shell job (all roles).**“ → **M1**.
3. **`docs/REVIEW_CHECKLIST.md:69`** в края на bullet-а „Assertions must be unconditional. ...“ → **O1**.
4. **`templates/CLAUDE.md.tmpl`** — (a) `:87` в края на bullet-а „**Reading is not a shell job.**“ → **M1**;
   (b) `:98` в края на bullet-а „**Verify the failure claim before proposing a cause.**“ → **J2**.
   „Four countable tripwires“ (`:106`) не се пипа.
5. **`templates/agents/writer.md.tmpl`** — (a) `:68` в края на bullet-а „**Reading is not a shell job.**“
   → **M2**; (b) след `:130` (първият VERIFY bullet, „...is not the command that was verified.“) → **N**
   като нов bullet.
6. **`templates/agents/reviewer.md.tmpl:68`** в края на реда → **O2** (извън TEMPLATE CONTRACT блока).
7. **`templates/ORCHESTRATOR.md.tmpl`** — (a) `:160` в края на въпрос 2 на филтъра → **P2**; (b) `:221`
   след „...the absence of rows is never read as evidence.“ (преди „One row per event, on the transfer
   surface:“) → **P1**.
8. **`skills/review/SKILL.md`** — (a) `:629-630` цялото изречение „The brief must never be empty - ...
   Write the file first, then invoke.“ → **R1**; (b) `:711` след „...never a fresh dispatch carrying the
   full brief again.“ → **Q**. Изречението за компенсациите (`:700-701`) не се пипа.
9. **`skills/qa/SKILL.md`** — (a) `:94` след „Run the scoped suite from the main session and let it write
   **persistent** artifacts.“ → **U**; (b) `:207-208` скобата „(Write tool - an empty brief makes the
   wrapper exit 2, so write the file first)“ → **R2**; (c) `:292` след „...never a fresh dispatch carrying
   the full brief again.“ → **Q**.
10. **`skills/loop/SKILL.md`** — (a) `:76-77` „(one round = COO -> Writer -> COO)“ → **G2**; (b) `:85` след
    „(only a `fail` blocks; a QA `BLOCKED` pauses for the precondition above).“ → **G3** (r3, делта scan ред 36:
    без него commit гейтът на стъпка 6 не може да мине след малък кръг по H).
11. **`skills/mission/SKILL.md:48-49`** „From memory: the resume point and machine-local facts.“ → **T**.
12. **`skills/roles/SKILL.md:94`** след абзаца под „### The honest guarantee about writing“ (`:87`; след
    „...completes the stamp.“) → **S1** като нов абзац.
13. **`skills/update/SKILL.md:82`** точката в края на bullet-а „- if the process dies mid-run, just run it
    again: ... so no question is asked twice.“ става „;“, и след него нов последен bullet → **S2**.
14. **Изданието** - в този ред:
    - (a) `.claude-plugin/plugin.json:3` `"version": "0.2.17"` → `"0.2.18"`.
    - (b) `migrations/index.json:22` - запетая в края на реда `0021_lean-readiness`, после нов последен ред
      `  { "id": "0022_stab-prose", "targetPluginVersion": "0.2.18" }`.
    - (c) нов `migrations/0022_stab-prose/ops.json` = **Y** дословно.
    - (d) нов `migrations/0022_stab-prose/NOTES.md` = **NOTES** дословно.
    - (e) `CHANGELOG.md:7` - над `## [0.2.17] - 2026-10-14` нов блок: ред `## [0.2.18] - <датата на
      commit-а на кода, YYYY-MM-DD>`, празен ред, **CHANGELOG** дословно, празен ред.
    - (f) `README.md:22` „**v0.2.17.“ → „**v0.2.18.“.
    - (g) `node scripts/update/aiwf-update.mjs --dry-run --project-root .` → exit 0 и план за 1 миграция;
      после `node scripts/update/aiwf-update.mjs --apply --project-root .` → exit 0 („updated: 0.2.17 ->
      0.2.18“; пре-рендерира самоинсталацията, пише `CHANGES_0.2.17-to-0.2.18.md` в корена). При какъвто и
      да е друг exit (конфликт, червен интегриран self-check, отказ от хоста - S2) Колегата СПИРА и връща
      `BLOCKED` с изхода дословно; без `--resolution-file`, без повторен опит.
    - (h) `git add` САМО на файловете от worklist 1–14 и на CHANGES файла (нищо под `dev/`).

**Блоковете.** Заглавието казва ID → файловете, в които блокът трябва да е след `--apply` (`check-blocks.mjs`
ги чете оттук); ID с „!“ отпред е СТАРИЯТ текст, който трябва да го няма. Текстът е английски.

#### A → docs/WORKFLOW.md
```text
A scan agent's output contract is its reply: it writes no file. A procedure agent that must leave a file - a helper script, a measurement - writes it only under the scratch directory, at the absolute path its brief names; a shell write anywhere else is a write no gate sees.
```

#### B → docs/WORKFLOW.md
```text
A permission gate is made to fail on a copy - a fixture project or a scratch copy of its settings, as the self-check does - never by weakening the live gate.
```

#### C1 → docs/WORKFLOW.md
```text
A dialog is named by what it approves - "the commit of the ticket's code" - and the operator is never told which button to press: the gate is their decision.
```

#### C2 → docs/WORKFLOW.md
```text
A pass is named by role, number and engine - "auditor pass 2 (Codex)" - a request for a word names exactly the pass it unlocks, and a verdict names who gave it ("the auditor confirmed ..."), never a bare verb the operator could read as addressed to them.
```

#### D → docs/WORKFLOW.md
```text
A blocker that demands more than the product needs - a precision, a scale or a guarantee beyond the business scope - is a product choice of exactly this kind, and the plan cannot go on without its answer: it goes to the operator early, in plain words, before a revision or a pass is spent on it.
```

#### E → docs/WORKFLOW.md
```text
3. an executable ticket ledger: stable Ticket Ref, context/problem, outcome, scope, dependencies, affected areas, acceptance criteria, and verification; a paid review the plan schedules beyond the readiness passes and the diff audit - a cold audit of existing code, say - is written into its ticket with its scope and estimated cost, and the plan's approval is then that pass's word, quoted in its COVERED BY line;
```

#### !E → docs/WORKFLOW.md
```text
acceptance criteria, and verification; 4. after each ticket is accepted
```

#### F → docs/WORKFLOW.md
```text
The plan records the answer in each ticket's entry as one line - `COO: top|cheap, because <check N | all four no>` - so the operator sees at approval which session each ticket needs.
```

#### G1 → docs/WORKFLOW.md
```text
A correction round is counted from an auditor's verdict: the Writer's fixes before the first verdict - a fact-check micro-round, the COO's own notes - are ticket work, not rounds against the cap.
```

#### G2 → skills/loop/SKILL.md
```text
(one round = a `fail` verdict -> Writer -> COO; fixes before the first verdict are not rounds)
```

#### G3 → skills/loop/SKILL.md
```text
A Reviewer `fail` closed by a small round under the suppression dual of `docs/WORKFLOW.md` § Loop shape counts as passed on the fact-check gate and the COO's recorded first-hand check of the delta.
```

#### !G2 → skills/loop/SKILL.md
```text
(one round = COO -> Writer -> COO)
```

#### H → docs/WORKFLOW.md
```text
**Its suppression dual, an exception to the sentence before it:** a code round answering a Reviewer `fail` whose whole delta is at most ~10 lines, in files the previous pass already audited, and which carries a unit test seen red before the fix, warrants no verification pass - so there is no word to ask and nothing to resume - unless the delta touches a surface of COO routing check 1 (migration, access policy, grants, auth, permission model), where the pass stays warranted. A QA `fail` is closed only by a QA run. The fact-check gate and the COO's first-hand check of the delta are recorded as for a prose round.
```

#### I → docs/WORKFLOW.md
```text
- **Commit:** the Writer commits the ticket's code and the COO commits what it writes itself - the completion record, the plan landing, R1 work; local only, after the review route passes AND a human explicitly
```

#### !I → docs/WORKFLOW.md
```text
- **Commit:** Writer only, local only
```

#### J1 → docs/WORKFLOW.md
```text
The same holds for every claim the COO relays to the operator, its own or an agent's: it is checked against the tree first, or it reaches the operator marked unverified.
```

#### J2 → templates/CLAUDE.md.tmpl, CLAUDE.md
```text
The same for any claim you relay to the operator - checked first, or marked unverified.
```

#### K → docs/WORKFLOW.md
```text
Two acts ride the record. The scratch directory goes back to the live loop mechanics: evidence worth keeping moves into the record or the plan's `readiness/<ABBR>/`, and what is left to delete is listed beside the record's commit, because a delete is the operator's dialog. And the COO says in one line whether the next ticket stays in this session or wants a fresh one - a recommendation, not a stop: compaction is tolerable inside a ticket, while a plan's planning and readiness are not a boundary.
```

#### L → docs/LOOP.md
```text
Several Writers may run on ONE ticket when its worklist splits into file sets that do not overlap: the brief records the split, and one VERIFY and one commit close the ticket. The Agent tool's `isolation: "worktree"` is not the instrument for it - its copy was observed on a consumer to start from the default branch, not from the branch checked out.
```

#### M1 → docs/LOOP.md, templates/CLAUDE.md.tmpl, CLAUDE.md
```text
Editing is not a shell job either: change tracked files with Edit / Write, never `sed -i`, a heredoc or a redirect - a shell edit can stall on a dialog nobody is watching, and a file whose text names a gated git verb trips Gate 4 when it is written through the shell.
```

#### M2 → templates/agents/writer.md.tmpl, .claude/agents/writer.md
```text
Editing tracked files is not one either: Edit/Write, never `sed -i`, a heredoc or a redirect.
```

#### N → templates/agents/writer.md.tmpl, .claude/agents/writer.md
```text
- **A command that can outrun the foreground cap runs in the background** (`run_in_background: true`) with the timeout the brief names: a foreground shell call is capped (`docs/CODEX_REVIEW_QA_RECIPE.md` names 10 minutes) and a killed run is lost. A background task that starts a server may never report completion - watch its log for the finish marker rather than waiting for the notice.
```

#### O1 → docs/REVIEW_CHECKLIST.md
```text
An assertion that cannot fail at all is rejected the same way: `expect(true)`, a count asserted `>= 0`, an exit code swallowed by `|| true`.
```

#### O2 → templates/agents/reviewer.md.tmpl
```text
So is an assertion that cannot fail at all (`expect(true)`, `>= 0` on a count, `|| true`).
```

#### P1 → templates/ORCHESTRATOR.md.tmpl, .claude/aiwf-native/ORCHESTRATOR.md
```text
An incident recorded only in the COO's memory is not recorded: the row goes on the transfer surface, and the memory points at it.
```

#### P2 → templates/ORCHESTRATOR.md.tmpl, .claude/aiwf-native/ORCHESTRATOR.md
```text
A question the operator must answer before work goes on is raised only when the ticket cannot continue without it; any other - outside the ticket, or a finding beyond its scope - is listed and asked at the ticket's close, and the work goes on.
```

#### Q → skills/review/SKILL.md, skills/qa/SKILL.md
```text
The recovery is still a paid dispatch: tell the operator what is known of the dead pass - how long it ran, and its cost where the engine reported one - and take their word before it; never re-dispatch on your own.
```

#### R1 → skills/review/SKILL.md
```text
The brief must never be empty - an empty brief makes the wrapper exit 2. Write the file first and invoke in a LATER tool call, never in the same message: calls in one message may start together, and a wrapper that reads the file before the write lands audits the previous brief.
```

#### !R1 → skills/review/SKILL.md
```text
Write the file first, then invoke.
```

#### R2 → skills/qa/SKILL.md
```text
(Write tool - an empty brief makes the wrapper exit 2, so write the file first and invoke in a later tool call, never in the same message)
```

#### !R2 → skills/qa/SKILL.md
```text
so write the file first)
```

#### S1 → skills/roles/SKILL.md
```text
**When the host refuses the write.** In an auto-approving permission mode, Claude Code's own classifier may refuse the write to `aiwf.config.json` as self-modification, whatever the operator said. That is the host's rule and this command does not work around it: the refusal is an interruption like the one above - run the same command in a mode that asks, and it finishes.
```

#### S2 → skills/update/SKILL.md
```text
- in an auto-approving permission mode the host may refuse the engine's write to `.claude/settings.json` or `aiwf.config.json` as self-modification; that is an interruption like any other - run it again in a mode that asks, and it resumes from the journal.
```

#### T → skills/mission/SKILL.md
```text
From memory: the resume point and machine-local facts. The resume point is a status of at most ~10 lines, rewritten WHOLE whenever it changes and never appended to - history lives in git and the PLAN, and an appended note grows into a start-up cost of its own.
```

#### !T → skills/mission/SKILL.md
```text
the resume point and machine-local facts. From git:
```

#### U → skills/qa/SKILL.md
```text
After a correction round the re-run is scoped to what the round touched - the specs over the changed files - and the full ticket scope is the fallback when that set cannot be named.
```

#### V → docs/WORKFLOW.md
```text
A product named in a request is not a path: when "write it into X's file" can mean two trees - a plugin's own repository and a consumer's copy - the COO settles which tree before writing, and asks when the tree cannot settle it.
```

#### W → docs/WORKFLOW.md
```text
(or, for a non-durable R2 that has no plan section, in the brief)
```

#### !W → docs/WORKFLOW.md
```text
(or, for an unplanned R2, in the brief)
```

#### X → docs/WORKFLOW.md
```text
Verify policy      - checks/proof required, by risk; the project's VERIFY runbook, when it has one
```

#### !X → docs/WORKFLOW.md
```text
Verify policy - checks/proof required, by risk Assignee
```

#### NOTES → migrations/0022_stab-prose/NOTES.md
```text
# 0022_stab-prose

**Doctrine text tightened where consumers found it silent or wrong.** Every change is one to three sentences inside an existing section; no hook, matcher, ask rule, schema key or script changes.

## What changes

- **Editing is not a shell job either** (`docs/LOOP.md`, the managed `CLAUDE.md` region, the Writer agent): tracked files change through Edit/Write, never `sed -i`, a heredoc or a redirect. A scan agent returns its result in its reply; a procedure agent that must leave a file writes it only under the scratch directory (`docs/WORKFLOW.md` § COO owns broad scans). A permission gate is made to fail on a copy, never by weakening the live gate.
- **Dialogs and the channel** (`docs/WORKFLOW.md` § The operator does not arbitrate engineering decisions and § How the COO speaks to the operator, `ORCHESTRATOR.md` § The operator-channel filter): a dialog is named by what it approves, never by which button to press; passes are named by role, number and engine; a verdict names who gave it; a question that stops work is raised only when the ticket cannot continue without it, the rest is asked at the ticket's close; a blocker beyond the business scope goes to the operator early.
- **Passes** (`docs/WORKFLOW.md` § Loop shape, `/pnp:review`, `/pnp:qa`, `/pnp:loop`): a correction round is counted from an auditor's verdict; a small code round answering a Reviewer `fail` (at most ~10 lines, in audited files, with a unit test seen red) warrants no verification pass unless it touches migration, access policy, grants, auth or the permission model, and a QA `fail` is closed only by a QA run; a paid pass that dies is resumed only on the operator's word; the review brief is written before the dispatch, in a separate tool call; a paid review beyond readiness and the diff audit is written into its plan with scope and cost.
- **Plans and close** (`docs/WORKFLOW.md`): each ticket records its COO routing in one line; the Writer commits code and the COO commits its own records; at a ticket's close the scratch directory goes back to the live mechanics and the COO recommends staying in the session or a fresh one; every claim relayed to the operator is checked first or marked unverified; a product named in a request is not a path.
- **Smaller**: several Writers may share one ticket over disjoint files; a long command runs in the background; a test that cannot fail is a finding; the `/pnp:mission` resume point is rewritten whole; an incident recorded only in memory is not recorded; `/pnp:roles` and `/pnp:update` say what to do when the host refuses a self-modifying write.

## What this migration does

- **Re-renders** the managed `CLAUDE.md` region, `.claude/agents/writer.md`, `.claude/aiwf-native/ORCHESTRATOR.md`, and `.claude/agents/reviewer.md` where your installation has it (a codex-hosted Reviewer with no claude row has none, and that operation is reported as skipped). An installation that never edited these files gets the new render silently; an edited file raises the usual conflict question; an artifact held through an override is not applied - the new render is recorded as upstream.
- **One `note`** saying the above.

## Superseded local rules

A local rule for editing only through Edit/Write, for dialogs only when the ticket cannot continue, for counting correction rounds from a verdict, for the small round without a verification pass, for a paid pass that died, for naming passes, for the COO routing line, for who commits what, or for cleaning the scratch directory at close can be removed or become a one-line pointer to `docs/WORKFLOW.md` or `docs/LOOP.md`.
```

#### CHANGELOG → CHANGELOG.md
```text
Doctrine text tightened where consumers found it silent or wrong: shell edits, dialogs, how passes are counted and named, a paid pass that dies, who commits what, and what a ticket's close leaves behind. ### Changed - **Editing is not a shell job (STAB-001)** - tracked files change through Edit/Write; scan agents answer in their reply; a procedure agent writes only under the scratch directory; a permission gate is tested on a copy, never weakened. - **Dialogs and the operator channel (STAB-001)** - a question stops work only when the ticket cannot continue; dialogs are named by what they approve; passes by role, number and engine; verdicts by who gave them. - **Passes (STAB-001)** - a correction round counts from a verdict; a small code round after a Reviewer fail needs no verification pass outside migration, access policy, grants, auth and the permission model, and a QA fail is closed only by a QA run; a dead paid pass resumes on the operator's word; the review brief is written before the dispatch. - **Plans and close (STAB-001)** - a ticket's COO routing line; the Writer commits code and the COO its records; the close cleans the scratch directory and recommends the session; relayed claims are checked or marked unverified. - **Smaller rules (STAB-001)** - parallel Writers over disjoint files, background long commands, tests that cannot fail, the resume point rewritten whole, incidents in the ledger, host refusals of self-modifying writes. - **Migration `0022_stab-prose` (STAB-001)** - re-renders the managed CLAUDE.md region, the Writer agent, ORCHESTRATOR.md and, where present, the Reviewer agent.
```

(CHANGELOG се пише като Markdown - абзацът, празен ред, `### Changed`, празен ред, шестте реда `- **...** - ...`
един под друг; тук е на един ред, защото проверката сравнява при нормализирани интервали.)

**Y — `migrations/0022_stab-prose/ops.json`, дословно (check-blocks го сравнява целия - r3, пас 1 блокер 4):**

#### Y → migrations/0022_stab-prose/ops.json
```text
{
  "migration": "0022_stab-prose",
  "targetPluginVersion": "0.2.18",
  "operations": [
    { "op": "rerender-managed-region", "file": "CLAUDE.md", "region": "aiwf-core", "template": "templates/CLAUDE.md.tmpl#aiwf-core" },
    { "op": "rerender-managed-region", "file": ".claude/agents/writer.md", "region": null, "template": "templates/agents/writer.md.tmpl" },
    { "op": "rerender-managed-region", "file": ".claude/agents/reviewer.md", "region": null, "template": "templates/agents/reviewer.md.tmpl", "ifRecorded": true },
    { "op": "rerender-managed-region", "file": ".claude/aiwf-native/ORCHESTRATOR.md", "region": null, "template": "templates/ORCHESTRATOR.md.tmpl" },
    {
      "op": "note",
      "id": "stab-prose",
      "text": "Doctrine text, tightened where consumers found it silent (STAB-001). EDITING is not a shell job either: tracked files change through Edit/Write, never sed, a heredoc or a redirect. DIALOGS: a question that stops work is raised only when the ticket cannot continue without it; the rest is asked at the ticket's close. PASSES: a correction round is counted from an auditor's verdict; a small code round answering a Reviewer fail (at most ~10 lines, in audited files, with a unit test seen red) warrants no verification pass unless it touches migration, access policy, grants, auth or the permission model; a QA fail is closed only by a QA run; a paid pass that dies is resumed only on the operator's word; a paid review beyond readiness and the diff audit is written into its plan with scope and cost; passes are named by role, number and engine. PLANS: each ticket records its COO routing in one line. COMMITS: the Writer commits code, the COO commits its own records. CLOSE: the scratch directory goes back to the live mechanics, and the COO recommends staying in the session or a fresh one. Re-rendered here: the CLAUDE.md managed region, .claude/agents/writer.md, .claude/aiwf-native/ORCHESTRATOR.md, and .claude/agents/reviewer.md where your installation has it. YOUR LOCAL RULES for any of these can be removed or become a one-line pointer to docs/WORKFLOW.md or docs/LOOP.md.",
      "docRefs": ["CHANGELOG.md", "docs/WORKFLOW.md", "docs/LOOP.md"]
    }
  ]
}
```

**Acceptance (литерални, Bash от repo root, СЛЕД `--apply`; „счупено“ = различният изход):**

- `node dev/backlogs/readiness/STAB/check-blocks.mjs <планът>` → exit 0 и `blocks: 36/36 present, 8/8 old
  texts gone`. Счупено: exit 1 с ред `MISSING`/`DUPLICATE`/`STILL PRESENT <ID> in <file>` за всеки пропуск.
- `node -e "JSON.parse(require('fs').readFileSync('migrations/0022_stab-prose/ops.json','utf8'))"` → exit 0
  (валиден JSON; с `check-blocks` - съдържанието е Y дословно). Счупено: exit 1 и `SyntaxError`.
- `git grep -c "^## \[0.2.18\] - 20[0-9][0-9]-[0-9][0-9]-[0-9][0-9]$" -- CHANGELOG.md` → `CHANGELOG.md:1`;
  `git grep -c "v0.2.18" -- README.md` → `README.md:1`; `git grep -c '"version": "0.2.18"' --
  .claude-plugin/plugin.json` → `.claude-plugin/plugin.json:1`. Счупено: без изход, exit 1.
- Пиновете (наблюдават ги `selfcheck` - doctrine-* проверките - и `update-suite` в VERIFY; тук броят):
  `git grep -c "one word per pass" -- docs/WORKFLOW.md` → `docs/WORKFLOW.md:4`;
  `git grep -c "may resume only with its compensations" -- skills/review/SKILL.md` → `skills/review/SKILL.md:1`;
  `git grep -c "Four countable tripwires" -- templates/CLAUDE.md.tmpl` → `templates/CLAUDE.md.tmpl:1`.
- Провенанс, СЛЕД `git add` от worklist 14(h): `git grep -nP "[\x{0400}-\x{04FF}]" -- docs skills templates scripts schema hooks migrations examples README.md CHANGELOG.md CHANGES_0.2.17-to-0.2.18.md .claude-plugin`
  → без изход, exit 1. Счупено: всеки ред с кирилица. (Имената на консуматорите ги хваща `selfcheck`.)
- Обемът (D11, отчет, не проверка): `for f in docs/WORKFLOW.md docs/LOOP.md docs/REVIEW_CHECKLIST.md templates/CLAUDE.md.tmpl templates/ORCHESTRATOR.md.tmpl templates/agents/writer.md.tmpl templates/agents/reviewer.md.tmpl skills/review/SKILL.md skills/qa/SKILL.md skills/loop/SKILL.md skills/mission/SKILL.md skills/roles/SKILL.md skills/update/SKILL.md; do echo "$f $(git show bc8c9a4:$f | wc -w) $(wc -w < $f)"; done`
  - изходът в handback-а.

**VERIFY (D10; една паралелна партида, СЛЕД `--apply`, без редакции докато върви; runbook
`dev/VERIFY_RUNBOOK.md`):** `validate-payload`, `setup-suite`, `update-suite`, `example-cycle-windows`,
`selfcheck`, `plugin-validate` - командите са в overrides § Test policy; всяка → exit 0, всеки друг код е
счупено.

**Ред и гейтове (dry trace):** одобрение на плана (думата на оператора) → приземяване от COO: `mv` в
`dev/backlogs/active/PLAN_STAB.md`, бележка в хедъра, двата хеша в `revisions.md` (печатът на own pass
над черновата и `node D:/pnp-live/scripts/engine/plan-gate.js --hash dev/backlogs/active/PLAN_STAB.md`
над приземения план), D4 в отложените на CANDIDATES, `test -f` на `dev/backlogs/readiness/STAB/`
`ledger.md`, `consequence-scan.md`, `own-pass.md`, `revisions.md`, `fact-check-r1.md`, `fact-check-r2.md`,
docs commit (клик) → pnp-live опресняване (`git -C D:\pnp-live
checkout --detach main` - диалог; стоящо указание в `CLAUDE.md` § This repository is the plugin) → думата
на оператора за STAB-001 → `git rev-parse HEAD` в брифа, ред `Ticket: STAB-001` (Gate 2 off-plan: refs в
`active/` минават тихо; думата за STAB-001 покрива и `--apply` над самоинсталацията - тя е част от
тикета) → `.aiwf/route-state.json` = `{"ticket":"STAB-001","route":"R2"}` → Колега (worklist 1–14, VERIFY,
acceptance) →
handback → COO чете целия diff → fact-check gate (един sonnet агент над прозата на diff-а) → микро-кръг,
ако има FALSE → Codex code пас 1 (`Class: code` → `review.code`, на думата за тикета, първият ред на брифа
`COVERED BY:` с нея; D1) → корекционен кръг, ако има `fail` (верификационният пас - своя дума; малък кръг
по H - без пас, COO записва fact-check-а и проверката си на делтата, G3; след всеки кръг Колегата пуска
отново VERIFY и `check-blocks.mjs`, а ако редакция на шаблон е оставила рендерираното копие назад -
`MISSING` в `CLAUDE.md`/`.claude/**` или drift в selfcheck - връща `BLOCKED` и COO решава) → commit на кода от Колегата (клик) → pnp-live опресняване
(диалог) → route-state `{}` → запис за приключване + архив на плана (docs commit от COO, клик) → pnp-live
опресняване (диалог; r3, пас 1 блокер 5) → дума за тага → таг локално → дума за push → main + таг в един push → CI след него (не е гейт).
