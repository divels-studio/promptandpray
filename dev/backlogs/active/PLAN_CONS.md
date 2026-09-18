# PromptAndPray Consolidation implementation — 0.2.7 → 0.2.8 (PLAN_CONS) — r8 (финален; сляти корекции от двата pass 4 одита)

## Контекст (git, 2026-09-16; проверен от двата паса)
`main`, чисто дърво, `origin/main...main` = `0 13` (dev commits вкл. D25 поправката 3334100 — возят се с push-а на 0.2.7);
`v0.2.6` @ `82f702b`; манифест последен `0010` → 0.2.6; fixture `0011_example-bump`.
PLAN_HARD замразен (HARD-011 → 0.2.9). Дефиниции, реферирани по име от тикетите:
- **VERIFY** = осемте команди от `aiwf.config.json verify.commands`, точни кодове. **[SUPERSEDED
  2026-09-17, операторска дума: „една наведнъж" отпада — всичките ОСЕМ ПАРАЛЕЛНО** (Start-Process
  с редиректнати логове ИЗВЪН repo-то, реалните exit кодове от Process обектите; RAM е грижа на
  оператора). Измерено: 10.4 мин чист тест; 589.1 s / 545.3 s живите batch-ове на CONS-001.]
  `node scripts/update/validate-payload.mjs --plugin-root .`; `node scripts/setup/test-setup.mjs`;
  `node scripts/update/test-update.mjs`; `node scripts/ci/run-example-cycle.mjs`;
  `node scripts/ci/run-example-cycle.mjs --answers examples/example-project/answers-linux.json`;
  `node scripts/selfcheck/aiwf-selfcheck.js --plugin-root . --project-fixture .`;
  `node scripts/spike/run-spikes.mjs`; `claude plugin validate .`.
- **Трио** = validate-payload + selfcheck + plugin validate (горните форми).
- **CYR** = `git grep -nP "[\x{0400}-\x{04FF}]" -- docs skills templates scripts schema hooks
  migrations` → празно, exit 1.
- **INTERLOCK** = `node scripts/update/aiwf-update.mjs --check --project-root .`.
- **ANCHOR** = литералният `git rev-parse HEAD` в момента на диспач, вписан в брифа — единствената
  доктринно-санкционирана диспач-времева стойност в команди (§ Ticket brief contract).

## Pre-dispatch checklist (всеки одиторски пас, до кацането на релсите в CONS-005/008; после
се пенсионира по нормалния supersede път) — [операторска дума през мастър сесията, 2026-09-17;
заменя отменената свидетелска стража]

- D21 evidence pack + ИЗРИЧНОТО изречение, даващо на одитора ПРАВО И ДЪЛГ да проверява дървото
  отвъд пакета (пакетът е селекция на одитираната страна).
- D13 chain редовете на тикета, обновени към ИМПЛЕМЕНТИРАНАТА file:line реалност.
- D23 previous-blockers блок само от pass 2 нататък (дословният списък; на pass 1 отсъства).
- Class / risk threshold / stop condition дословно от тикета; `Class:` на свой ред.
- Session id уловен от plain header-а на студения рън (ръчно до CONS-003).
- Брояч старт двойка ОТ оператора ПРЕДИ диспача; stats ред на таблото след вердикта.
- Fact-check verdict + substance line in the brief (pre-verified, never authority).

## Решения (COO, финални)

1. Две издания: 0.2.7 „Sync & economics"; 0.2.8 „Roles".
2. HARD-010 се сгъва в CONS-004; HARD-011 остава в PLAN_HARD за 0.2.9.
3. D4 = optional `supersedes` поле на note op + assembleChanges печат. Не нов op тип.
4. Таблото (D1): НЕуправляван one-time seed по generate.mjs:1175 механизма (липсва → пише;
   съществува → не пипа; нула bookkeeping, нула RESOLVABLE, нула миграционни op-ове — никога).
   Заварена инсталация: ЛЕНИВО създаване по доктрина (скелетът е записан в WORKFLOW).
   Пътят: optional `paths.transferSurface` (без schema default; резолюция: конфигурираният път,
   при липса `<plansDir>/PNP_CANDIDATES.md`). **[r6] Кой чете ключа:** SETUP го чете (за сийд
   мястото + containment проверката на generate.mjs:924, която СЕ разширява с ключа); СКИЛОВЕТЕ
   и доктрината го четат; UPDATE ENGINE и HOOKS — никога (негативният grep покрива точно тях).
5. **РЕШЕНО (операторска делегация 2026-09-16, авторитетът поправен — commit 3334100):**
   терминът е „COO routing"; „tier" остава запазен за модел-речника (scan/top tier).
   Негативният acceptance grep за „COO tier" стои.
6. Оркестраторът: managed artifact `.claude/aiwf-native/ORCHESTRATOR.md` ←
   `templates/ORCHESTRATOR.md.tmpl`; модел-агностичен; managed/re-render Е коректното тук.
7. „Four countable tripwires" + „Three countable" в retired patterns.
8. Заварените находки: skills/README.md:6 → CONS-005; README.md:31 → CONS-009 (грепове по
   ТОЧНИТЕ нови редове, изписани в тикетите).
9. HARD-013: легитимно червен self-check → --apply остава exit 1.
10. Дисциплина: chain-trace преди pass 1 (изпълнено); всяка дума по стоящите правила; D16
    event ledger от тази мисия — секцията се СЪЗДАВА при одобрението на плана (заедно с
    lazy-create на повърхността за тази инсталация, Решение 19) и ПЪРВИТЕ редове лягат тогава
    (вкл. операторската корекция за старт двойката — записана в сесията, ляга при създаването;
    претенция „вече съществува ред" НЕ се прави — пас 3 topъл я хвана като невярна).
11. `createIfAbsent` на rerender op-а: собственик е CONS-008 изцяло (OP_SPECS поле +
    migrate.mjs клонът + test-update лицата + selfcheck) — единственият ползвател е
    ORCHESTRATOR.md. Семантика: без запис + без файл → рендер + stamp; без запис + файл →
    отказ с adopt hint; със запис → нормален път, полето игнорирано. **[r7]
    `ifRecorded`+`createIfAbsent` в ЕДИН op = валидаторен ОТКАЗ** (противоположни поведения за
    незаписан артефакт — skip срещу create/refuse; прецеденс не се дефинира, комбинацията се
    забранява) + негативен тест. migrations/README.md:32 op-таблицата документира И двете
    полета (+ supersedes реда за note — в CONS-001).
12. Resume постурата: `codex exec resume <id> -c sandbox_mode="read-only" -c
    approval_policy="never" -c model="<role.model>" -c model_reasoning_effort="<role.effort>" -`
    с бриф по stdin; cwd → ProjectRoot преди инвокация; БЕЗ -C/--sandbox (не съществуват на
    resume); **[r6] `-m` СЪЩЕСТВУВА на живия help, но НАРОЧНО не се ползва** — една униформна
    -c постура за всичките четири стойности (effort бездруго няма флаг); session id от PLAIN
    header реда `session id:` (без --json — изходът остава човешки). **[r6] State файловете са
    ПО РОЛЯ:** `<scratchDir>/last-review-session.txt` (само codex-review) и
    `<scratchDir>/last-qa-session.txt` (само codex-qa) — QA рън не може да отвлече Reviewer
    resume; -Resume без аргумент чете СВОЯ файл.
13. Арбитър брифът: `<scratchDir>/arbiter-brief.txt`; COO пише; скилът чете регламент → ledger
    → бриф; липсва → отказ с точното съобщение "no parked escalation brief found at
    <path> - the COO parks the brief before /pnp:arbiter is opened"; колизия: последният
    презаписва; ruling реда пише изпълняващата сесия.
14. Supersede id-тата — генерични: `orchestrator-regulation-v2-seed`,
    `local-multisession-invariant`, `local-resume-economics`, `local-chain-trace-duty`,
    `local-stats-methodology` (консуматорите мапват своите записи; NOTES конвенцията го казва).
15. Класове: CONS-006 чист docs; всички пинове на изданието — в CONS-005 (code); release
    тикетите (007/010) — пълни договори, двуфазни (Решение 16).
16. **[r6] Release тикетът е ДВУФАЗЕН:** фаза А „замразена церемония" (независим рън → tag →
    push → CI → consumer proofs) с НУЛА worktree дифф; фаза Б „записи" — release записът в
    PLAN_CONS + памет, allowlist само dev/** и памет, отделен docs commit. Двете фази в един
    тикет, границата изрична.
17. **[r6] Изпълнителният ред мести CONS-006 ПРЕДИ CONS-005** (пиновете на METRICS фразите
    искат файла да съществува); последният КОДОВ commit на изданието е CONS-005 → тагът на
    0.2.7 е върху него.
19. **[r8] Обвързване + реконсилация, РАЗЦЕПЕНИ по клас (пас 4 x2: config-ът е ИЗПЪЛНИМ
    артефакт и schema ключът още не съществува — approval binding би счупил interlock-а,
    доказано на живо от двата одита):** (а) config обвързването на ТОЗИ repo
    (`paths.transferSurface: "dev/backlogs/CANDIDATES.md"`) се мести В CONS-001 — СЛЕД/СЪС
    schema промяната, под code review; (б) ПРИ ОДОБРЕНИЕТО остават само docs действията:
    lazy-create на секциите Ruling ledger / Pass statistics / Event ledger в CANDIDATES.md +
    първите D16 редове + D2 pointer за самия план + PLAN_HARD реконсилацията (HARD-010
    „сгънат в CONS-004", HARD-011 → 0.2.9, HARD-013 → указател към CONS-002, редът поправен);
    (в) конфиг обвързването на ДВАТА консуматора — изрично в CONS-007 proof обхвата (тяхна
    страна, техните думи, СЛЕД техния ъпдейт до 0.2.7 — тогава схемата им го познава).
    **D16 ред-форматът (дефиниран ТУК, ползван от одобрението):**
    `| <дата> | <правило/D-номер> | violation|catch|operator-correction | <указател> |`.
20. **[r7] Скилови четци на пътя — именувани:** review скилът (Step 4 stats редът) и arbiter
    скилът четат `paths.transferSurface` с fallback резолюцията — имплементира се в CONS-005
    (review) и CONS-009 (arbiter), с acceptance grep по резолюционната фраза във всеки скил.
21. **[r7] gh auth е release прекондиция:** жив факт от пас 3 — токенът на машината е
    НЕВАЛИДЕН; CONS-007/010 фаза А започва с `gh auth status` (exit 0 изискан) ПРЕДИ тага;
    невалиден → стоп и дума към оператора (re-auth е негов).
18. **D6 warning-ът пътува през note op-а** (единственото, което стига CHANGES —
    migrate.mjs:1134/:1164): литералният ред влиза в ТЕКСТА на note op-а на `0011` (и на всяка
    бъдеща word-гейт миграция — конвенцията записана в migrations/README.md): "If this release
    introduces a word-gate: check your local rules for self-initiated dispatch or remediation -
    a rule written before this gate may contradict it."

## Изпълнителен ред
CONS-001 → 002 → 003 → 004 → **006** → **005** → 007 (+release 0.2.7) → 008 → 009 → 010
(+release 0.2.8) → [PLAN_HARD: HARD-011 → 0.2.9]. D26 пилот: Silerax след ъпдейта им.

## COO routing по D25 (операторска дума 2026-09-17; моделът на сесията, която операторът
отваря за тикета — Writer пинът и одитната таблица НЕ мърдат)
- **Fable** (двигателен/enforcement код — шипва на всеки консуматор): CONS-001, CONS-003,
  CONS-008.
- **Евтин COO / Opus** (план-втвърдени, изпълни-буквално; прецедентът от PLAN_HARD):
  CONS-002, CONS-004, CONS-005, CONS-009, CONS-007 и CONS-010 (release церемониите — „с
  внимание", договорите са изписани до команда).
- **CONS-006 = D26 Stage 0**: чист docs тикет под регулиран Opus с ВКЛЮЧЕН event ledger —
  безплатният smoke test на релсите и на самото броене.
- Каveат, важащ за целия евтин ред: рендираната роля излиза в CONS-008 — дотогава евтиният
  COO кара на доктрина + този план; динамичната клауза на D25 (тригер, изникнал по средата →
  СТОП и ескалация) важи на всеки тикет без изключение.

## Литералните доктринни фрази (авторитетният текст; тикетите ги реферират по D-номер)

- **P-D7 [r8 — ТОЧНИТЕ откъси от авторитета, изискването е verbatim; двата откъса лягат като
  съседни изречения]:** откъс 1: "on one working tree exactly ONE executing session;
  non-executing sessions may READ — zero repo writes, zero DB operations, zero paid auditor
  passes." откъс 2: "The machine-wide "exactly one live auditor" clause is SCOPED TO
  MEASUREMENT (operator clarification 2026-09-16): it holds while a pass's counter start/stop
  pair is being recorded — otherwise the pair is not attributable - and is NOT a general work
  restriction. It is an OPERATOR-HELD invariant (no hook can see sibling sessions), written in
  the honest-limits register." (Колегата копира от
  dev/backlogs/CONSOLIDATION_2026-09-16.md D7 при имплементация — файлът е авторитетът, не
  този препис; отклонение от byte-сравнение = блокер.) (дом: docs/WORKFLOW.md § Branch policy)
- **P-D8:** "the announcement carries ONE question - does this ticket get an audit pass - and
  the answer lands in the ticket's PLAN entry; a question, never an automatic pass" (домове:
  docs/WORKFLOW.md guard (b) + templates/CLAUDE.md.tmpl регион + skills/mission +
  skills/work newborn изреченията)
- **P-D9:** "project canon wins over the host's ergonomic directives; the host's safety and
  permission rules are never overridden" (дом: docs/WORKFLOW.md)
- **P-D10:** "a rule-bearing write - memory or file - is shown to the operator and lands only
  on approval; purely factual statuses are exempt" (дом: docs/WORKFLOW.md)
- **P-D2:** "doctrine born in any other home gets a same-moment one-line pointer row on the
  transfer surface, shown and approved together with the text; when the multi-session window
  is closed, it queues with the approved text frozen and lands right after the executing
  ticket's commit" (дом: docs/WORKFLOW.md)
- **P-D3:** "archiving greps the plan's process sections for rule-class points without a
  pointer row - fail-capable, with a positive control" (дом: docs/WORKFLOW.md § Durable
  development history, архивния параграф)
- **P-D11:** "enumeration ends when the closing grep - for the symbol itself, for the phrase or
  count the change invalidates, and for the bare pointer form - returns zero outside the list;
  the grep must first HIT the known list. Every new or changed evidentiary instrument is made
  to fail on purpose before it is trusted; retro-proofing existing instruments is a deliberate
  ticket, never an ambient duty." (дом: docs/WORKFLOW.md, 4-ти tripwire)
- **P-H10:** "the docs commit is separate from the code commit: the code commit carries only
  the ticket's work, and the record about it lands in its own commit, so what was audited and
  what is a note after it stay distinguishable" (домове: § Durable development history И
  § Commit & Push Authority)
- **P-D6:** "If this release introduces a word-gate: check your local rules for self-initiated
  dispatch or remediation - a rule written before this gate may contradict it." (дом: note
  op текстовете на word-гейт миграции; конвенцията в migrations/README.md)
- **README-ред (CONS-009):** "- **Twelve commands** as skills: `loop`, `brief`, `mission`,
  `work`, `review`, `qa`, `qal`, `roles`, `arbiter`, `setup`, `update`, `selfcheck`"
- **skills/README-ред (CONS-005):** "Shipped: loop, review, qa, qal, brief, mission, work,
  roles, setup, update, selfcheck." (CONS-009 после добавя arbiter → 12)
- **Дифф гард (CONS-006, ANCHOR по дефиницията):**
  `node -e "const{execSync}=require('child_process');const sh=c=>execSync(c).toString().trim();const A='<ANCHOR>';const ch=sh('git diff --name-only '+A).split(/\r?\n/).filter(Boolean);const un=sh('git status --porcelain').split(/\r?\n/).filter(l=>l.startsWith('??')).map(l=>l.slice(3));const ok=f=>f.startsWith('docs/')||f==='CHANGELOG.md';const bad=ch.filter(f=>!ok(f)).concat(un.filter(f=>!(ok(f)||f.startsWith('dev/')||f.startsWith('.aiwf/'))));if(bad.length){console.error(bad);process.exit(1)}"`

## 0.2.7 — Sync & economics · tag v0.2.7

### CONS-001 [R2 code] — таблото (seed) + supersedes (D1, D4, D6)

Outcome: fresh install сийдва таблото небукирано; setup чете и удържа (containment) пътя;
note op-ът декларира supersedes и CHANGES ги печата; D6 редът пътува през note op-а.
Обхват: (1) schema — optional `paths.transferSurface`, description с резолюционното правило,
БЕЗ default; (2) `templates/PNP_CANDIDATES.md.tmpl` — скелетът (header + конвенция + ЧЕТИРИ
празни секции: Candidates / Ruling ledger / Pass statistics / Event ledger — [r8] Решения 10
и 19б сийдват и четвъртата); същият скелет дословно в WORKFLOW
(lazy-create образецът; координация: CONS-004 пише секцията около него); (3) generate.mjs —
сийд по :1175 механизма на РЕЗОЛВНАТИЯ път (конфигуриран или default) + `transferSurface` в
containment проверката :924; (4) validate-payload :139-144 — note optional `supersedes`
(array of non-empty strings, проверка по образеца docRefs :365-366); (5) migrate.mjs
assembleChanges :1164-1171 — печат `Supersedes: <id>`; (6) миграция `0011_<slug>`: note op с
текста на изданието + `supersedes` (генеричните id-та, Решение 14) + P-D6 реда в текста;
`plugin.json` 0.2.7; fixture → `0012_example-bump` (сайтовете: bump.json:2; ops.json:2;
NOTES.md:1,16,31; examples README:17,45,78-79; относителният контрол :6288-6293 непипнат);
CHANGELOG `## [0.2.7]`; self-install apply; CHANGES; (7) тестове: test-update (supersedes
печат/липса flipping; не-масив отказ; CHANGES носи P-D6 реда — assertion срещу генерирания
файл); test-setup (нова секция: fresh сийд на default път; сийд на конфигуриран път;
съществуващ файл непипнат; повторен рън нулев дифф; containment отказ за път извън root-а);
selfcheck (таблото извън managed множеството + контрол: инжектиран запис в копие → FAIL);
(8) [r8] локалното config обвързване (Решение 19а): добавя
`"transferSurface": "dev/backlogs/CANDIDATES.md"` в `.claude/aiwf-native/aiwf.config.json` —
СЛЕД т.1 (схемата познава ключа), изпълним артефакт под code review.
Извън обхват: createIfAbsent (CONS-008); ролевата употреба; пълнене на таблото; четене на
ключа от update engine/hooks.
Acceptance (литерално): `node scripts/update/validate-payload.mjs --plugin-root .` → exit 0,
„11 migration(s) … 0.2.7"; `node scripts/update/test-update.mjs` → exit 0 (брой записан);
`node scripts/setup/test-setup.mjs` → exit 0; per-file: `git grep -n "transferSurface" --
schema/aiwf.config.schema.json` → ≥1 И `git grep -n "transferSurface" --
scripts/setup/generate.mjs` → ≥1 И `git grep -n "transferSurface" -- docs/WORKFLOW.md` → ≥1;
негативно: `git grep -n "transferSurface" -- scripts/update scripts/engine hooks` → празно,
exit 1 (плюс hooks — пас 3: Решение 4 обещава и тях); [r8] локалното обвързване: ТИКЕТЪТ
ПИШЕ `"transferSurface": "dev/backlogs/CANDIDATES.md"` в `.claude/aiwf-native/aiwf.config.json`
СЛЕД/СЪС schema стъпката, под code review (Решение 19а — обхватен елемент 8);
проверката: `git grep -n "transferSurface" -- .claude/aiwf-native/aiwf.config.json` → 1 И
INTERLOCK → exit 0 СЛЕД записа (схемата вече познава ключа);
`git grep -n "Supersedes" -- scripts/update` → ≥1; `git grep -nF "check your local rules for
self-initiated dispatch" -- migrations` → ≥1 (P-D6 в op текста); `git grep -n
"0011_example-bump" -- . ":(exclude)dev" ":(exclude)CHANGELOG.md"` → празно exit 1; INTERLOCK
→ „up to date … 0.2.7"; VERIFY; CYR.
Risk threshold: блокира bookkeeping/managed/RESOLVABLE за таблото; op за таблото; семантична
промяна на 4-те op-а; containment пробив; VERIFY≠0. Stop: acceptance зелен.
Review: Class code, pack + fact-check преди. Assignee: Колега.

**ЗАПИС ЗА ИЗПЪЛНЕНИЕ (затворен 2026-09-17): commit `f21b2b0`** (родител = ANCHOR `10c370a`),
21 файла, 889+/19− (`git diff --cached --shortstat` преди commit-а). Изпълнено по договора —
всичките 9 обхватни точки; acceptance зелен изцяло. Одитният цикъл: pass 1 студен **fail**
(2 P1, и двата от собствените проби на одитора — колизия с setup-owned дестинации; лексикален
containment), корекционен рунд 1, resume верификация **fail** (блокер 1 остава — йерархични
колизии), корекционен рунд 2 (капът), resume верификация 2 **pass** (нула находки; одиторът с
собствени проби потвърди петте конфликтни случая блокират с нула действия). Материални решения
отвъд плана, наложени от одита: destination guard с ТРИ клона (exact / таблото-предшественик /
таблото-в-owned-файл), слизане в owned ДИРЕКТОРИЯ нарочно позволено (default-ът живее в
plansDir); `canonicalPath()` през най-близкия съществуващ предшественик (сродство с
run-example-cycle.mjs:178-191); `samePath` case-fold само win32; `..`-префиксът segment-aware.
Проверка: VERIFY 8/8 exit 0 — ПАРАЛЕЛЕН batch (финален wall 545.3 s; команди от
`verify.commands`); setup-suite 356→446 checks, update-suite 518, selfcheck 1044/1044;
негативните грепове exit 1/празно през spawn-and-read-status (харнесът не показва код при
празен изход). Fact-check преди pass 1: NO FALSE CLAIMS; двата делта fact-check-а хванаха
дрейфнали line цитати в handback-ите (кодът верен; коригирани преди платените пасове).
Остатъчен дълг → кандидат на таблото, без ref: junction дупката в заварения лексикален
containment за scratchDir/plansDir/overridesDoc — нарочно неландната (би отказала работещи
инсталации); таблото е защитено през canonical проверката на резолвнатия път (доказано от
junctioned-plansDir тестовото лице). Статистика: трите паса в Pass statistics на таблото;
Codex сесията `01a0ae26-bdc3-7700-ae7c-20b9ba0f14e3` остава resume-ваема.

### CONS-002 [R2 code] — HARD-013 (D24)

Outcome: self-check не зависи от PATH реда; WSL bash не дава 52 фалшиви; exit семантиката явна.
Обхват: findBash :237-249 — Git bash абсолютните пътища ПРЕД голото име + функционална проба
(`bash -c 'test -f <познат Windows път през своя mount>'` или еквивалент — кандидатът вижда
Windows пътища), не само exit 0; NOTE ред с избрания път; run-selfcheck.mjs :91-99 — червеният
клон остава exit 1, съобщението разграничава (проверка + пин); тестове: fixture с wsl-like
stub пръв в PATH → изборът го прескача, selfcheck зелен; flipping: копие само с голо име +
stub-ът → пада; NOTES: трите инстанции (52 FAIL 2026-09-15; 1026/1026 Git bash; 992/52
exit 127 `/bin/bash: C:Usersdyosi...` 2026-09-16).
Извън обхват: POSIX path конвертиране за WSL; success-при-червено.
Acceptance (литерално): `node scripts/selfcheck/aiwf-selfcheck.js --plugin-root .
--project-fixture .` → exit 0 на тази машина + изходът носи NOTE реда (показва се);
test suite-ът с новите проверки → exit 0 (брой записан); VERIFY; CYR.
Risk threshold: смяна на exit семантика към success-при-червено; регресия на sh-канала.
Stop: acceptance зелен. Review: Class code. Assignee: Колега.

**ЗАПИС ЗА ИЗПЪЛНЕНИЕ (затворен 2026-09-17): commit `d3f946a`** (родител = ANCHOR `b9495a0`),
5 файла, 315+/13− (`git diff --cached --shortstat` преди commit-а). Обхватът изпълнен изцяло:
findBash с Git абсолютните пътища ПРЕД голото име + функционална проба (пътят пътува като argv
атом, четен обратно като `$1` — нула shell quoting); NOTE ред с избрания хост; червеният клон на
run-selfcheck.mjs остава exit 1 и вече разграничава двете значения на червен вердикт; тестовете;
NOTES с трите измерени инстанции. Дефектът беше възпроизведен на живо ПРЕДИ диспача: WSL bash
минава старата проверка (`-c 'exit 0'` → 0) и пада на функционалната (→ 1).

Решения на COO-то отвъд плана: (1) **провенанс над буквата на плана** — третата инстанция се
записва по ФОРМА (`"/bin/bash: <a Windows absolute path with its separators stripped>"`), не с
литерала от плана, който носи drive-letter път и потребителско име; числа и дати дословно.
(2) **Обхватът разширен от три на пет файла** — `skills/setup/SKILL.md` и `skills/update/SKILL.md`
описваха вердикта на споделения `finishWithSelfCheck` само с първото му значение; съседният
контракт пътува с промяната (микрорунд преди платения пас, вместо корекционен рунд след него).
(3) **Нула миграция и нула bump** — `skills/**` и `scripts/**` са payload, не рендирани артефакти;
managed множеството е това, което `templates/` рендира + ask-ruleset-ът + CLAUDE.md регионът
(`_aiwf.managedRegions`). Прецедент: CONS-005 пипа skills/review/SKILL.md без миграция.
(4) **Нула CHANGELOG ред** — не е в обхвата/acceptance на тикета; блокът на 0.2.7 легна при bump-а
в CONS-001. (5) Червеното дете в test-setup е **stub**, не реалният двигател — предмет на теста е
формулировката на `finishWithSelfCheck`, реалният червен път е покрит от `sc-red` в
test-update.mjs:1569-1593, а реалният двигател би струвал на суита измерени ~105 s.

Одитният цикъл: pass 1 студен **fail** — два P1 блокера, и двата верни: (а) доказателството на
пробата е ЦИРКУЛЯРНО (двойникът разпознаваше пробата през изхода на `bashProbeArgv()`, а слепотата
се решаваше от производствения `bashProbe`, тоест тестът падаше само при ИЗТРИВАНЕ на пробата, не
при отслабването ѝ); (б) редът не се доказва през производствения избор (всички лица инжектираха
кандидати; плюс сравнение на голото име с абсолютни пътища, което никога не съвпада). Корекционен
рунд 1 (от кап 2): ръчно изписан `EXPECTED_PROBE_ARGV` + лице, което ПИНВА производствения argv
срещу него; `directProbe` мери слепота независимо; двойникът ключова по литерала; голото име се
резолвва през PATH преди сравнение; ново лице през `findBash` БЕЗ инжектирани кандидати. Шест лица
станаха осем. Resume верификация pass 2 **pass** (нула находки; одиторът с собствени проби
потвърди двата хост-гейта неотслабени, exit семантиката непомръднала, и прекара добавените редове
през собствен провенанс скан).

Материално отклонение от спецификацията на COO-то, прието: в лицето през производствения избор
ДВАТА хоста отговарят на пробата. При „голото име = сляпо" (както COO-то го специфицира) лицето НЕ
може да хване обърнат ред — голото се прескача защото е сляпо, не защото е последно, и findBash
пак връща Git пътя. С два еднакво работещи хоста редът е единственото, което решава. Доказано с
мутация M3, не с аргумент.

Проверка: VERIFY 8/8 exit 0 — ПАРАЛЕЛЕН batch; selfcheck 1044→1052, setup-suite 446→451,
update-suite непроменен; CYR exit 1/празно през spawn-and-read-status. Всяко лице е верифицирано
с МУТАЦИЯ на производствените функции в копие извън repo-то (M0 базов зелен; M1 — точният
сценарий на одитора, `bashProbeArgv → ['-c','true']` — вече exit 1 с три червени лица; M2-M6
всяко хванато от поне едно лице; нула мутации оставят рънa зелен). Fact-check: два гейта преди
платените пасове + един делта — хванаха ТРИ свръх-обобщаващи изречения в прозата (верни за едно
лице, написани сякаш покриват съседните); третото оцеля цял корекционен рунд, чийто предмет беше
точно това. Остатъчен дълг: нула. Статистика: двата паса в Pass statistics на таблото (студен 4пп,
resume 2пп); Codex сесията `01a0aecd-0629-7c70-8327-5e54ff3641f6` остава resume-ваема.

### CONS-003 [R2 code] — wrapper resume (D20; Решение 12)

Outcome: 4-те wrapper-а улавят session id (по роля) и приемат -Resume/--resume със замразената
постура; изходът към викащия байт-идентичен.
Обхват: [а] tee + парс на `session id:` реда → `<scratchDir>/last-review-session.txt` (review
двата) / `<scratchDir>/last-qa-session.txt` (qa двата); [б] -Resume (ps) / --resume (sh),
optional аргумент (без аргумент → своя state файл; с id → изричен); resume argv по Решение 12;
cwd → ProjectRoot; [в] flag-lock пинове за ДВЕТЕ форми + negative controls (dropArgLine/
replaceArgLine образците :2542-2548 + ps аналозите); [г] EXECUTED stub probe (:2405-2433
образецът) за двете форми — точно argv сравнение; [д] skills/review/SKILL.md Step 3 — resume
опцията за верификационни пасове.
Извън обхват: readiness resume политиката (текстът е в CONS-006); QAL.
Acceptance (литерално): stub probe: студен argv == точния заварен масив И resume argv ==
`['exec','resume','<id>','-c','sandbox_mode=read-only','-c','approval_policy=never','-c',
'model=<m>','-c','model_reasoning_effort=<e>','-']` (показва се); [r8] per-file, осем команди (пас 4: агрегатните минаваха с една повърхност):
`git grep -cF "Resume" -- scripts/native/ps/codex-review.ps1` → ≥1; `git grep -cF "Resume" --
scripts/native/ps/codex-qa.ps1` → ≥1; `git grep -cF -- "--resume"
scripts/native/sh/codex-review.sh` → ≥1; `git grep -cF -- "--resume"
scripts/native/sh/codex-qa.sh` → ≥1; `git grep -cF "last-review-session" --
scripts/native/ps/codex-review.ps1` → ≥1; `git grep -cF "last-review-session" --
scripts/native/sh/codex-review.sh` → ≥1; `git grep -cF "last-qa-session" --
scripts/native/ps/codex-qa.ps1` → ≥1; `git grep -cF "last-qa-session" --
scripts/native/sh/codex-qa.sh` → ≥1 (state имената в правилния чифт — кръстосан hit =
блокер); selfcheck exit 0 (пинове + контроли „FAIL as required"); spikes exit 0; VERIFY; CYR.
Risk threshold: промяна на студената форма; resume с -C/--sandbox/-m; не-plain изход;
кръстосан state файл. Stop: acceptance зелен. Review: Class code. Assignee: Колега.

**ЗАПИС ЗА ИЗПЪЛНЕНИЕ (затворен 2026-09-17): commit `7840167`** (родител = ANCHOR `6588b94`),
8 файла, 1721+/16− (`git log -1 --stat`). Обхватът изпълнен + два съседни договора, сгънати с
микрорунд ПРЕДИ платения пас (CONS-002 прецедентът): `skills/qa/SKILL.md` и
`docs/CODEX_REVIEW_QA_RECIPE.md` описват wrapper повърхността и получиха resume формата.

Материални решения отвъд плана, наложени от одита: (1) **PS повърхността е `-Resume` (switch) +
`-ResumeId <id>`** — PowerShell не изразява опция с опционален аргумент; bash получи `--resume-id`
като огледало на изричната форма. (2) **Capture механизмът НЕ е парс на изхода.** Pass 1 доказа
(срещу codex-rs източника И на живо върху собствения ни диспач): `session id:` банерът е на
STDERR, а всяко докосване на поток променя видимите байтове (PS декодира и ре-терминира — измерен
дифф в hex). Финалът: нула докосване на потоците; студен рън се идентифицира в собствения session
store на codex (`$CODEX_HOME/sessions/**/rollout-*.jsonl`, `session_meta.session_id`) по mtime
маркер + fingerprint на брифа (≥24 печатни ASCII, „точно един оцелял"); без fingerprint или при
двусмислие — нищо не се записва; **resumed рън записва id-то, което вече знае** (store-ът бездруго
не може да отговори — rollout-ът е надраснал 512KB четения прозорец; наблюдавано на живо).
(3) **Неидентифициран студен рън ЧИСТИ state файла** (delete-first, верифициран с ре-четене;
оцелял id → ERROR с името му, никога „успех"), а **гол resume отказва незаписваем state файл**
(exit 2) — stale resume е структурно невъзможен. (4) Изрично празно id отказва (exit 2). Честни
лимити: store подредбата е недокументиран codex договор (отказът е ГЛАСЕН — clear + stderr ред);
2 s freshness slack; `--ephemeral` → без capture; clear-failure клонът е невъзпроизводим на този
хост (пиннат source+control, последствието му — executed).

Одитният цикъл: pass 1 студен **fail** (2 P1 — capture на грешния поток + нарушена байт-чистота;
и двата верни, потвърдени на живо: собственият ни диспач остави stale id в state файла).
Корекционен рунд 1 (механизмът заменен из корен). Resume верификация **fail** — 2 НОВИ P1, с
декларирани произходи (родени от рунда): fingerprint-less бриф разширяваше кандидатското
множество до „всичко прясно"; clear-ът се твърдеше без верификация. Корекционен рунд 2 (капът).
Resume верификация 2 **pass** (нула находки; остатъчният риск заявен: store поведението без
платен рън, clear-failure клонът без възпроизводство). Един диспач между двата verify паса е
**убит от оператора по невнимание** (~5пп, нула вердикт) — НЕ е engine/wrapper дефект.

Проверка: VERIFY 8/8 exit 0 — ПАРАЛЕЛЕН batch (финален wall 860.6 s; команди от
`verify.commands`); selfcheck 1052→1209, нула неконтролирани находки; acceptance греповете:
Resume ps 31/30, --resume sh 17/17, state имена 3/3/3/3 в правилния чифт, четирите кръстосани
грепа exit 1/празно; CYR exit 1/празно. Живо доказателство след commit-а: resume пасът записа
известното си id — `.aiwf/last-review-session.txt` носи `01a0af78-...` (stale състоянието
поправено от самия механизъм). Fact-check: 1 гейт + 2 делта гейта; хванаха 2+4 дрейфнали line
цитата в COO брифовете (кодът верен, поправени преди платените пасове); стойностните и
поведенческите твърдения — потвърдени верни и трите пъти.

Остатъчен дълг: нула. Codex сесията `01a0af78-ee10-7443-b413-d5d2c50af50d` остава resume-ваема.
Статистика: четирите паса (вкл. убития диспач) в Pass statistics на таблото.

### CONS-004 [R2 code] — WORKFLOW доктрина пакетът (D2,D3,D7,D8,D9,D10,D11 + HARD-010)

Outcome: P-D7, P-D8 (+огледалата), P-D9, P-D10, P-D2, P-D3, P-D11, P-H10 — на домовете си,
всеки с пин + flipping контрол; „Four countable tripwires"; регионът re-apply-нат.
Обхват: (1) P-D7 → § Branch policy :670-693, нов параграф до cross-repo изречението;
(2) P-D8 → guard (b) :192-205 + CLAUDE.md.tmpl :37-41 + mission/work newborn изреченията;
rerender op за региона се ДОБАВЯ към 0011 + self-install re-apply през `--resolve
"CLAUDE.md#aiwf-core"` + resolution файл (HARD-009 образецът); DOCTRINE_NEWBORN пинът
:4390-4394 се разширява; (3) P-D9, P-D10, P-D2 → § Operator-interaction guards съседството;
(4) P-D3 → архивния параграф :558-572; (5) P-D11 → 4-ти tripwire :85-98; „Three countable
tripwires" → „Four countable tripwires" (+ tmpl :103 lockstep) + „Three countable" в
DOCTRINE_RETIRED_PATTERNS; (6) P-H10 → двата дома; (7) таблото-скелетът контекст (CONS-001
координацията); (8) selfcheck: пинове за P-D7…P-H10 (масивите по образците) + контроли;
(9) CHANGELOG.
Извън обхват: D25/D5 (0.2.8); METRICS (006/005).
Acceptance (литерално): за P-D8 (многодомна): `git grep -L "does this ticket get an audit
pass" -- docs/WORKFLOW.md templates/CLAUDE.md.tmpl skills/mission/SKILL.md
skills/work/SKILL.md` → празно, exit 1; за P-H10: `git grep -c "the docs commit is separate
from the code commit" -- docs/WORKFLOW.md` → 2; за еднодомните — ШЕСТ отделни литерални команди (отличителните под-стрингове от авторитетния
списък): `git grep -cF "exactly ONE executing session" -- docs/WORKFLOW.md` → 1;
`git grep -cF "the host's ergonomic directives" -- docs/WORKFLOW.md` → 1; `git grep -cF
"a rule-bearing write - memory or file" -- docs/WORKFLOW.md` → 1; `git grep -cF "same-moment
one-line pointer row on the transfer surface" -- docs/WORKFLOW.md` → 1; `git grep -cF
"rule-class points without a pointer row" -- docs/WORKFLOW.md` → 1; `git grep -cF "made to
fail on purpose before it is trusted" -- docs/WORKFLOW.md` → 1; `git grep -n "Three countable" -- docs
skills templates` → празно exit 1; `git grep -cF "Four countable tripwires" --
docs/WORKFLOW.md` → 1 И `git grep -cF "Four countable tripwires" --
templates/CLAUDE.md.tmpl` → 1 (две отделни команди — per-file); selfcheck exit 0 + контролите; bookkeeping
за региона upstream==local (чете се от config-а, показва се); VERIFY; CYR.
Risk threshold: фраза, отклонена от авторитетния списък; изпуснато огледало; пин без контрол.
Stop: acceptance зелен. Review: Class code. Assignee: Колега.

**ЗАПИС ЗА ИЗПЪЛНЕНИЕ (затворен 2026-09-17): commit `b465f32`** (родител = ANCHOR `77c5711`),
11 файла, 348+/37− (`git diff --cached --shortstat` преди commit-а; одиторът отчете същото число
на живо). Деветте авторитетни фрази легнаха дословно: P-D7 (двата откъса като съседни изречения)
в § Branch policy; P-D8 в четирите си дома; P-D9/P-D10/P-D2 като нови guards (f)/(g)/(h); P-D3 в
архивния параграф; P-D11 като четвърти трипуайър; P-H10 — два пъти. Acceptance зелен изцяло
(15 критерия), selfcheck 1209→1235, update-suite 518, VERIFY 8/8 exit 0 паралелно (wall 860.2 s),
CYR празно/exit 1.

Материални решения на COO-то отвъд плана: (1) **P-D7 ляга с ASCII тирета, не с em-dash-овете на
авторитета** — payload-ът няма нито един em-dash (единственият не-ASCII знак в `docs/ skills/
templates/` е `§`), а собствената acceptance на плана греп-ва `"a rule-bearing write - memory or
file"` с ASCII тире, което би паднало при дословно копие; „verbatim" = думите. Прецедент по клас:
CONS-002 решение (1), провенанс над буквата на плана. (2) **P-D9/P-D10/P-D2 стават летерирани
guards (f)/(g)/(h)**, а не съседни параграфи, и `docs/WORKFLOW.md:192` „Five rules" → „Eight rules"
в lockstep — броят е пин-нат в собственото си въведение и никъде другаде (грепнато, не предположено).
(3) **P-H10 се пинва по БРОЙ, не по присъствие** — генеричният луп е substring тест (`:5784`), тоест
два записа за същия файл и същата фраза биха минали и с една инстанция; вместо това отделна находка
`doctrine-cons-docs-commit-two-homes` брои === 2 и собствена литерална контрола маха САМО първата
инстанция (не-глобален regex), така че броят пада 2→1 с правилото още в файла. Инструментът е нов,
затова беше накаран да падне нарочно — самият закон, който тикетът приземява. (4) **Обхватът
порасна от 7 на 11 файла**, и двата добавъка са съседни договори, хванати от discovery ПРЕДИ
диспача: `scripts/update/test-update.mjs:1696-1697` (фикстурата състарява региона през фразата и
ХВЪРЛЯ гласно на :1719 — без нея update суитът става червен) и `migrations/0011_transfer-surface/
NOTES.md` (твърденията „a single `note` operation" и „no managed artifact is re-rendered" стават
неверни с новия op).

**Два микрорунда при топъл контекст ПРЕДИ платения пас** (прецедентът CONS-002/003), и първият
поправя дефект в брифа на COO-то, не в работата на Колегата: брифът забрани пипането на текста на
note op-а (за да пази update-suite секция 14), а последицата беше, че 0011 пипа `CLAUDE.md` на
консуматора, докато release бележката, която той чете, мълчи за това — обратното на конвенцията на
0009 и 0010, които обясняват пре-рендера В текста на note-а. Секция 14 пинва само `supersedes` и
word-gate реда, не целия текст, така че допълването беше безопасно (текстът 1.9k→3207 знака, петте
id-та байт-идентични). Вторият микрорунд затвори изброяването на `NOTES.md:90` — Колегата сам го
вдигна като „непълно, не невярно", и беше прав: диф, който приземява „изброяване се затваря с грep",
не може да остави изброяване една грепа по-късо в същия commit. Закрит с грep върху целия файл,
петнайсет реда класифицирани, точно един непълен.

Одитният цикъл: fact-check гейт → **NO FALSE CLAIMS**; pass 1 студен → **pass-with-notes, нула
блокера**. Одиторът потвърди байт-сверката на деветте фрази, четирите дома на P-D8, двата на P-H10,
пълнотата на пиновете и контролите, формата на миграцията, хеша на региона и bookkeeping-а, и
прекара дифа през собствени проби (брой на фразите, `ops.json` shape, lockstep броеве, кирилица,
обхватни гардове) — тоест рови отвъд пакета, както брифът го задължи. Две незаблокиращи бележки:
(а) evidence pack-ът носеше `+346/-35` срещу живите `+348/-37` — остаряло число от МОЯ бриф,
защото двата микрорунда добавиха редове след статистиката на Колегата; промяната е изцяло в
документираните миграционни файлове и не мърда acceptance-а; (б) read-only клетката на одитора не
му позволи да пре-изпълни пишещите VERIFY суити (`EPERM` при временна директория) — доказателството
за 8/8 остава подаденият батч, не негово собствено измерване (същата заварена бележка като на
`CANDIDATES.md:424`).

Остатъчен дълг: нула правила, една записана наблюдение — `CHANGES_0.2.6-to-0.2.7.md:20-22`
(проследяван в root-а) е замразеният отчет на по-ранния self-install ъпдейт и изброява 0011 само с
note op-а, тоест е с една операция назад спрямо `ops.json`. Файлът сам се обявява на `:3-4` за
еднократна бележка, която нищо не чете обратно, и бъдещ консуматор си генерира верен отчет; не е
дефект на продукта и не отваря тикет — решава се при release церемонията на CONS-007, която
бездруго прави независим рън. Codex сесията `01a0b089-e52e-7820-918c-8cbf4e2cec24` остава
resume-ваема. Статистика: пасът в Pass statistics на таблото.

### CONS-006 [R2 docs — ЧИСТ; ПРЕДИ CONS-005] — docs/METRICS.md (D19/D22/D20 текст)

Outcome: METRICS.md носи: броячни старт/стоп двойки + duration + same-window флаг; токени =
диагностика; resume политиката (default за корекционни верификации; re-architecture → студен/
операторски избор; readiness pass 1 студен; N+1 resume само с компенсации + дума; „resume
answers is the DELTA sound; cold answers is the WHOLE still sound"); one-auditor-while-
measuring; таблицата на таблото, PLAN §Процес само pointer ред; методът и честните лимити.
Обхват: docs/METRICS.md (нов); docs/README.md индексът; WORKFLOW/LOOP препратки (по един
ред). **[r7] Review-скил препратката СЕ МЕСТИ в CONS-005** (пас 3: скил файл в обхвата
правеше docs-гарда вътрешно невъзможен) — CONS-006 пипа САМО docs/** + CHANGELOG.
Извън обхват: всякакъв JS; пинове; skills/**.
Acceptance (литерално): `node -e "process.exit(require('child_process').execSync('git ls-files docs/METRICS.md').toString().trim()==='docs/METRICS.md'?0:1)"` → exit 0 (пада при липсващ файл — голият ls-files минава празен); `git grep -n "METRICS" --
docs/README.md` → ≥1; `git grep -n "METRICS" -- docs/WORKFLOW.md` → ≥1; `git grep -n
"METRICS" -- docs/LOOP.md` → ≥1 (ТРИ команди — [r8] skills/review проверката е на CONS-005,
пас 4: 006 не проверява изход на 005); дифф гардът (литералната команда от списъка, ANCHOR по
дефиницията) → exit 0; трио; CYR.
Risk threshold: изпълним артефакт в диффа (→ рекласификация); token-обещание в текста.
Stop: acceptance зелен. Review: Class docs. Assignee: Колега.

**ЗАПИС ЗА ИЗПЪЛНЕНИЕ (затворен 2026-09-17): ПРЕДПОСТАВКАТА ОТПАДНА ПО АРБИТРАЖ — нула commit-а,
нула одиторски пас.** Работата беше изпълнена и зелена (нов `docs/METRICS.md` 151 реда + четири
препратки, acceptance 7/7, трио exit 0, selfcheck 1235/1235, обхватният гард доказан с нарочна
повреда, fact-check гейт с една хваната невярна препратка), и въпреки това НЕ ляга: тикетът
поиска в payload-а нещо, което payload-ът няма право да носи.

Арбитраж (бриф `.aiwf/arbiter-brief.txt`, тригер D18 (1) — решението обръща записано в плана
решение; операторска дума за сесията същия ден; отсъдил е АВТОРЪТ на D19/D22 и на този тикет,
срещу собственото си решение): **позиция B** — измерването никога не е било тема на payload-а.
D19/D22 са уловили дисциплината на КАМПАНИЯТА D1–D26 — броячът е инструментът, с който РЕШИХМЕ
resume политиката и форматите — а рендирането им като публичен док нарушава границата за
генеричност, която същият документ носи: каквото се качва, трябва да важи за непознат с ЕДИН
проект, а такъв непознат може никога да не пипне codex или да има несравнима квота. Раздуването
на тикета (151 реда, лутането по границата „сочи vs преразказва", и измисленото правило за ресета)
са симптоми на невалидната предпоставка, не нейна причина.

Разпореждане, изпълнено: (1) `docs/METRICS.md` и четирите препратки — изхвърлени от дървото с
операторска дума (разрушителна операция; съседна сесия не може да я разреши); (2) resume/cold
ПОЛИТИКАТА — спасена в обхвата на CONS-005, при механиката, вместо в отделен дом; (3) методологията
на броенето — преместена на таблото като преамбюл на Pass statistics; (4) D22 поправен в авторитета
с цитат на решението, D19 остава като записана практика от dev страната; (5) route-state → `{}`;
изпълнителният ред продължава с CONS-005.

Собствена бележка на COO-то, защото е част от причината тикетът стигна дотук: в хода му измислих
инцидент (двойка, разсечена от прозоречен ресет), който не се е случил — операторът го обори с
фактите: прозорецът се е обърнал ПРЕДИ диспача, пасът е минал изцяло в новия, двойката е чиста.
Ретракцията е направена в същата сесия, но остави след себе си правило (`:57-61` на изхвърления
файл), изведено от несъществуващото събитие. Записано в Event ledger като violation срещу
правилото „източник във всяко твърдение".

**АРБИТРАЖНА ПОПРАВКА КЪМ CONS-005 (2026-09-17, от същото решение):** обхватът на CONS-005 се
РАЗШИРЯВА с кратък пасаж за resume/cold ПОЛИТИКАТА в `skills/review/SKILL.md` И
`skills/qa/SKILL.md` — политиката ляга там, където механиката вече живее, което разтваря точно
онази граница „два дома за един механизъм", която беше най-трудният проблем на CONS-006. Пасажът
носи: pass 1 винаги студен (независимият пълен прочит Е гаранцията, която пасът купува — довод за
НЕЗАВИСИМОСТ, не за икономия); resume за верификациите след корекционен рунд; рунд, който е
ПРЕАРХИТЕКТИРАЛ, пре-задава целия въпрос → студен или операторски избор; топла сесия се пенсионира
при първия си компакт; И правилото за възстановяване след прекъсване (операторско разширение към
решението): **прекъснат платен пас НЕ е загубена работа** — сесията е мъртва в шела, но жива на
диска; възстановяването е `--resume` (state файловете по роля от CONS-003) + КРАТЪК continuation
промпт („continue — you already have the brief and your progress; produce the verdict"), никога
нов диспач с пълен бриф по подразбиране. Това приземява кандидата от `fa5d91a`/`77c5711` в
естествения му дом (две измерени инстанции); редът на таблото се маркира като прехвърлен.
Фатализмът „платен пас си е платен, каквото и да стане" умира заедно с предпоставката.

### CONS-005 [R2 code; СЛЕД CONS-006] — review скилът + ВСИЧКИ пинове на изданието

Outcome: D14 клаузата, D23 блокът, D21 pack редът, D22 nudge-ът — в скила; пиновете на
изданието (METRICS фразите вкл.) — в selfcheck; skills/README поправен.
Обхват: Step 2b :204 — втората extra клауза: "verify the chain table - every Outcome sentence
has a row, every link resolves at its file:line, endpoints are source or render-or-DB-write
surfaces, chains start at the entry point"; Brief bullet :230-232 — литералният блок ДОСЛОВНО по приетия D23 текст (вкл. знакът ≥):
"PREVIOUS PASS BLOCKERS (verbatim; absent or empty on pass ≥2 is a contract violation the
Reviewer reports separately)"; Step 2 :132-176 — pack редът (D21); Step 4 :359-362 — "...and
append the pass's stats row (start/stop pair from the operator) to the transfer surface
table" + [r7] имплементацията на четеца (Решение 20): резолюционната фраза "the configured
paths.transferSurface, or <plansDir>/PNP_CANDIDATES.md when absent" в скила; [r7] METRICS
препратката в review скила (преместена от CONS-006); skills/README.md:6 → новият ред от
списъка (11 имена); selfcheck: пинове за горните
4 фрази + METRICS ключовите фрази (counter правилото; resume политиката; короларият) +
контроли; CHANGELOG.
Извън обхват: arbiter (0.2.8); METRICS съдържанието (легнало в 006).
Acceptance (литерално): `git grep -nF "absent or empty on pass ≥2 is a contract violation" --
skills/review/SKILL.md` → 1 (пълната отличителна част, не само отварящите думи); `git grep -nF "every Outcome sentence has a row" -- skills/review/SKILL.md` → 1;
`git grep -nF "append the pass's stats row" -- skills/review/SKILL.md` → 1; `git grep -nF
"Shipped: loop, review, qa, qal, brief, mission, work, roles, setup, update, selfcheck." --
skills/README.md` → 1; [r8] четецът и METRICS препратката: `git grep -cF
"PNP_CANDIDATES.md when absent" -- skills/review/SKILL.md` → ≥1 (РЕЗОЛЮЦИОННАТА фраза, не
голият ключ — делта fact-check: ключът минава и без fallback) И `git grep -n "METRICS" --
skills/review/SKILL.md` → ≥1; selfcheck exit 0 с пиновете +
контролите „FAIL as required" (брой записан); трио на рунд, VERIFY преди commit; CYR.
Risk threshold: пин без контрол; фразова отлика от списъка. Stop: acceptance зелен.
Review: Class code. Assignee: Колега.

**ЗАПИС ЗА ИЗПЪЛНЕНИЕ (затворен 2026-09-18): commit `a445cbf`** (родител = ANCHOR `f5df765`),
7 файла, 390+/16− (`git diff --cached --shortstat` преди commit-а). Обхватът е този на тикета
МИНУС трите неща, отпаднали по арбитраж и операторска дума (METRICS препратката, stats ред nudge-ът
в Step 4, четецът на `paths.transferSurface` — резолюционното правило си има дом на
`schema/aiwf.config.schema.json:354` от CONS-001), ПЛЮС спасения пасаж за resume/cold политиката в
ДВАТА одиторски скила. Acceptance зелен изцяло; selfcheck 1253→1275; VERIFY 8/8 exit 0 паралелно
(два батча, wall 14.9 и 15.5 мин, и двата на спокойно дърво).

Материални решения на COO-то: (1) **литералът на D23 ляга САМО в readiness формата**
(`skills/review/SKILL.md:257-259`), а шаблонът за имплементационен диф запазва полето си и **сочи**
правилото — копирането в двата шаблона би сложило същия литерал два пъти в ЕДИН файл, което
substring пин не различава и заради което CONS-004 трябваше да си направи отделна проверка по брой;
не създаваме този проблем втори път. (2) **Фатализмът се пиннва като ОТСЪСТВИЕ** — две нови записи
в `DOCTRINE_RETIRED_PATTERNS` (21 общо), защото трите стари дома не бяха формулирани еднакво и един
образец би хванал два, твърдейки три. (3) **Индекс редът се пиннва като литерал**, не структурно —
структурният вариант (редът изброява всяка директория под `skills/`) е по-добър инструмент, но
CONS-009 бездруго пипа този ред и там е естественият му момент; **бележка към CONS-009, не тикет**.

Три от промените в дифа са принудени от МОИ грешки в обхвата на брифовете, и трите излизат
преди платените пасове или в тях: (а) `docs/WORKFLOW.md:374-377` — съседният договор, който
щеше да остане да твърди „една инструкция", докато скилът дава две; (б)
`docs/CODEX_REVIEW_QA_RECIPE.md:78-83` — ТРЕТИ дом на фатализма, намерен от Колегата с грep, който
отказа да го пипне без дума и го върна с готов hunk; (в) анкерът за D23 — посочих шаблона за
имплементационен диф вместо readiness формата, което стана блокер 1 на пас 1.

Одитният цикъл: fact-check гейт (1 невярно твърдение, и то срещу МОЕ твърдение за конвенция, не
срещу дифа) → pass 1 студен **fail** (2 P2: мястото на литерала; покритието на пиновете, плюс
вярната констатация, че `CHANGELOG.md` твърди повече, отколкото е пиннато) → корекционен рунд 1
(масивът 6 правила/9 повърхности → 13/19; фатализмът като отсъствие; CHANGELOG-ът **стеснен**, не
подпрян — твърди „всяко ПРАВИЛО е пиннато" плюс отсъствието, а неприпнатите клаузи са именувани) →
делта fact-check (1 невярно: подзаглавие „four rules" при пет) → resume верификация
**pass-with-notes**, нула блокера, нарушение на контракта: няма. Одиторът потвърди по същество:
литералът стои точно веднъж и на readiness пътя, полето в шаблона се чете като указател, деветнайсетте
записа имат уникални id-та и **нито един `replacement` не присъства предварително — тоест нито една
контрола не е празна операция**.

Мутационно доказателство за новия инструмент (P-D11, приземен в CONS-004): пълно копие на payload-а
извън repo-то — база зелена 1275/1275; три независими мутации, всяка връщаща по един от трите стари
дома към фатализма → exit 1 / 1273, метачът назовава `skills/review/SKILL.md:344`,
`skills/qa/SKILL.md:231`, `docs/CODEX_REVIEW_QA_RECIPE.md:79`.

**ЕДНА КОРЕКЦИЯ СЛЕД ВЕРДИКТА, обявена вместо скрита:** незаблокиращата бележка на паса беше, че
коментар на `scripts/selfcheck/aiwf-selfcheck.js:5783` казва `DOCTRINE_RETIRED_PATTERNS above`, а
декларацията е на `:6002`, тоест ПОД него. Поправено преди commit-а, една дума: `above` → `below`.
Дифът срещу HEAD е байт-идентичен с онзи, който пасът прочете (`390+/16−`), защото целият коментарен
блок е добавка на този тикет. Коментар не носи решение, затова покритието на одита не е отслабено;
записано тук, за да е проверимо какво се е променило след паса, който одобри дървото.

Остатъчен дълг: нула. Статистика: двата паса на таблото (студен 100/51→94/50 = 6пп; resume
94/50→89/49 = 5пп — по-скромна икономия от предишните тикети, записана както е измерена).
Codex сесията `01a0b2bb-d568-72a3-9f38-a9e362672d29` остава resume-ваема.

### CONS-007 [release, ДВУФАЗЕН — Решение 16] — release 0.2.7

Фаза А (нула worktree дифф): независим COO рън (VERIFY + INTERLOCK, HEAD+porcelain еднакви в
двата края) → tag `v0.2.7` върху КОДОВИЯ commit на CONS-005 (дума) → `git push origin main` +
`git push origin v0.2.7` (дума + диалози) → CI → consumer proofs relay (двата ъпдейта;
CHANGES там носи Supersedes редовете; консуматорите изпълняват D4 чистенето си — тяхна
страна). Фаза Б (allowlist dev/** + памет): release записът, отделен docs commit.
Acceptance (литерално, fail-capable — деривирани стойности в ЕДНА команда, без плейсхолдъри):
- Прекондиция (Решение 21): `gh auth status` → exit 0 (невалиден токен → СТОП преди тага).
- `git cat-file -t v0.2.7` → commit.
- `node -e "const{execSync}=require('child_process');const s=c=>execSync(c).toString().trim();const local=s('git rev-list -n1 v0.2.7');const r=s('git ls-remote --exit-code --tags origin refs/tags/v0.2.7');if(!r.startsWith(local)){console.error('tag hash mismatch',local,r);process.exit(1)}"`
  → exit 0 (пада при липсващ таг ИЛИ различен хеш).
- `git rev-list --left-right --count origin/main...main` → `0 0`.
- `node -e "const{execSync}=require('child_process');const s=c=>execSync(c).toString().trim();const sha=s('git rev-list -n1 v0.2.7');const runs=JSON.parse(s('gh run list --commit '+sha+' --json databaseId'));if(runs.length<2){console.error('expected 2 CI runs (main push + tag push) for',sha,'got',runs.length);process.exit(1)}for(const r of runs){const jobs=JSON.parse(s('gh run view '+r.databaseId+' --json jobs')).jobs;for(const n of ['windows','ubuntu']){const j=jobs.find(x=>x.name===n);if(!j||j.conclusion!=='success'){console.error('run',r.databaseId,n,j?j.conclusion:'ABSENT');process.exit(1)}}}console.log('both runs: blocking legs green')"`
  → exit 0 ([r8] пас 4 топъл: push-ът на main И на тага правят ДВА рънa на същия SHA —
  проверяват се ВСИЧКИТЕ, не runs[0]; пада при <2 рънa, липсващ или червен блокиращ leg).
- Consumer proofs записани с числа (relay) — вкл. конфиг обвързването им (Решение 19в).
Risk threshold: tag преди независимия рън или преди gh auth exit 0; push без дума; дифф във
фаза А; фаза Б извън allowlist-а. Stop: acceptance зелен + записът легнал. Assignee: COO.

## 0.2.8 — Roles · tag v0.2.8

### CONS-008 [R2 code] — createIfAbsent + оркестратор-ролята (D12–D17; Решения 6, 11, 14)

Outcome: engine-ът поддържа createIfAbsent (пълната имплементация ТУК); ролята рендирана на
всички инсталации; CLAUDE.md региона я реферира; регламентните правила пиннати.
Обхват: (1) **createIfAbsent изцяло**: migrate.mjs planRerender :544 клонът (трите лица по
Решение 11); validate-payload OP_SPECS rerender optional поле + типова проверка; test-update
ifRecorded секцията (:1841-1853) + новите лица (create на празно; отказ на заварен файл с
adopt текста; записан ключ → игнорирано поле); (2) `templates/ORCHESTRATOR.md.tmpl` →
`.claude/aiwf-native/ORCHESTRATOR.md`: D12 правилата (данни; coverage редът "COVERED BY:
operator word <quote>, <date>" в брифа; verdict≠dispatch; canon-conflict стоп вкл. P-D9;
doctrine-write участие; ескалация по D18 тригерите; каналният филтър — четирите класификатора,
БЕЗ числа); D13 дългът (+ честната извадка: "measured on a small self-classified sample");
D15 dual законът (скопиран: команди — да; забрани/гейтове — не); D16 event ledger формата;
D17 референции (стоп семантика, субагент политика, мултисесийните инварианти, VERIFY honesty
— към payload доковете); (3) generate.mjs addArtifact (безусловен, по :944-945 образеца);
RESOLVABLE ключ `.claude/aiwf-native/ORCHESTRATOR.md`; (4) CLAUDE.md.tmpl :43-63 — една
референция + rerender op към 0012; (5) миграция `0012_<slug>`: rerender op с createIfAbsent
за ролята + region rerender + note (supersedes: `orchestrator-regulation-v2-seed` — генерично,
Решение 14); bump 0.2.8; fixture → `0013_example-bump` (същите сайтове); CHANGELOG `[0.2.8]`;
self-install apply; CHANGES; (6) selfcheck: RESOLVABLE проверката :1781-1783 + новия шаблон;
managed-regions-cover :3795-3799 + ключа; render проверки; пинове за D12/D13/D15/D16 фразите
+ контроли.
Извън обхват: arbiter скилът (009); D25/D5 текстовете (009).
Acceptance (литерално): `node scripts/update/validate-payload.mjs --plugin-root .` → exit 0,
„12 migration(s) … 0.2.8"; `node scripts/update/test-update.mjs` → exit 0 (createIfAbsent
лицата, брой записан); self-install: `.claude/aiwf-native/ORCHESTRATOR.md` съществува +
bookkeeping upstream==local (показва се от config-а); `git grep -cF "ORCHESTRATOR.md.tmpl" -- scripts/setup/generate.mjs` → ≥1;
`git grep -cF "ORCHESTRATOR.md" -- scripts/update/migrate.mjs` → ≥1; `git grep -cF
"ORCHESTRATOR.md.tmpl" -- scripts/selfcheck/aiwf-selfcheck.js` → ≥1; `node -e
"process.exit(require('fs').existsSync('templates/ORCHESTRATOR.md.tmpl')?0:1)"` → exit 0
(per-file, точните имена — пас 3: директорийните грепове минаваха с една повърхност); `git grep -n "Furnissimo" -- docs skills
templates scripts schema hooks migrations examples` → празно, exit 1; `git grep -n
"0012_example-bump" -- . ":(exclude)dev" ":(exclude)CHANGELOG.md"` → празно exit 1; selfcheck
exit 0 + контролите; INTERLOCK → „… 0.2.8"; VERIFY; CYR.
Risk threshold: createIfAbsent, който осиновява съществуващ файл; консуматорско име в payload;
модел ключ за ролята в схемата. Stop: acceptance зелен. Review: Class code. Assignee: Колега.

### CONS-009 [R2 code] — /pnp:arbiter + D25/D5 (Решения 5, 8, 13)

> **Бележка от CONS-005 (2026-09-18), не тикет:** индекс редът на `skills/README.md:6` е пиннат
> ЛИТЕРАЛНО (`doctrine-shipped-commands-line`), тоест лови преформулиране, но НЕ лови дванайсети
> скил, който никой не е вписал в реда. Структурният вариант — пинът да твърди, че редът изброява
> всяка директория под `skills/` — е по-добрият инструмент. CONS-009 бездруго пипа този ред
> (добавя `arbiter` → 12), затова смяната на инструмента върви с него, вместо да отваря свой тикет.

Outcome: скилът диспачваем, cold-start по Решение 13; D18/D5/D25 доктрината на домовете си;
README броят верен.
Обхват: skills/arbiter/SKILL.md — **[r7] allowed-tools: Read, Grep, Glob, Bash** (пас 3 x2:
Step 0 interlock-ът ИЗПЪЛНЯВА git rev-parse + node --check — без shell скилът не може
собствения си договор; read-only-стта е ПОВЕДЕНЧЕСКА: доктрината + D7, не липса на
инструмент — както при всеки друг скил); Step 0 + INTERLOCK текстът по генеричния луп
:5100-5129; стъпките: регламент → ledger секцията (чете `paths.transferSurface` с fallback —
Решение 20) → брифа; отказът с точното съобщение от Решение 13; ruling-ът се връща като
текст, записва го изпълняващата сесия; WORKFLOW: D18 текстът (4-те тригера; no-ruling-without-an-opened-file;
ledger конвенцията; succession) + D5 (тригер = задължителна ескалация без дума; операторската
ръка само отваря сесия при липса) + D25 „COO routing" подсекция в § Routes след :668 (4-те
проверки; динамичната клауза; одит-инвариантът; hardening принципът); README.md:31 → новият
Twelve ред (от списъка); skills/README.md → +arbiter (12); selfcheck: пинове + контроли;
CHANGELOG.
Извън обхват: ролевият рендер (008); каквато и да е arbiter автоматизация отвъд скила.
Acceptance (литерално): `git grep -n "aiwf-update.mjs" -- skills/arbiter/SKILL.md` → ≥1 И
`git grep -n "\-\-check" -- skills/arbiter/SKILL.md` → ≥1; `git grep -nF "no parked
escalation brief found" -- skills/arbiter/SKILL.md` → 1; [r8 — PS-safe, пас 4 студен: backtick
в double-quoted PowerShell се изяжда] пълните редове се проверяват през node, без shell
quoting: `node -e "const t=require('fs').readFileSync('README.md','utf8');process.exit(t.includes('**Twelve commands** as skills')&&t.includes(String.fromCharCode(96)+'arbiter'+String.fromCharCode(96))?0:1)"`
→ exit 0 И `node -e "const t=require('fs').readFileSync('skills/README.md','utf8');process.exit(t.includes('Shipped: loop, review, qa, qal, brief, mission, work, roles, arbiter, setup, update, selfcheck.')?0:1)"`
→ exit 0 (точните финални редове са в Литералните фрази — Колегата сверява срещу тях);
arbiter скилът чете пътя с fallback резолюцията (Решение 20) — `git grep -cF
"PNP_CANDIDATES.md when absent" -- skills/arbiter/SKILL.md` → ≥1 (резолюционната фраза, не
голият ключ); `git grep -n "COO routing"
-- docs/WORKFLOW.md` → ≥1; `git grep -n "COO tier" -- docs skills templates` → празно exit 1;
selfcheck exit 0 (генеричният луп поема скила; пиновете + контролите); VERIFY; CYR.
Risk threshold: скил, който ПИШЕ в repo-то (поведенчески — Bash е само за read-only
interlock/git rev-parse; всяка мутация е блокер); тригер списък, отклонен от D18;
именуване, отклонено от Решение 5 (след операторската дума). Stop: acceptance зелен.
Review: Class code. Assignee: Колега.

### CONS-010 [release, ДВУФАЗЕН] — release 0.2.8

Фаза А (нула worktree дифф): независим COO рън → tag `v0.2.8` върху кодовия commit на
CONS-009 (дума) → `git push origin main` + `git push origin v0.2.8` (дума + диалози) → CI →
consumer proofs relay. Фаза Б (allowlist dev/** + памет): записът + при пълно затваряне
архивиране (`git mv` към `dev/backlogs/archive/<NNN>_PLAN_CONS_<дата>.md`); PLAN_HARD
размразяване за HARD-011 → 0.2.9 (операторска дума).
Acceptance (литерално — [r8] изписани, не „същите"):
- `gh auth status` → exit 0 (прекондиция преди тага).
- `git cat-file -t v0.2.8` → commit.
- `node -e "const{execSync}=require('child_process');const s=c=>execSync(c).toString().trim();const local=s('git rev-list -n1 v0.2.8');const r=s('git ls-remote --exit-code --tags origin refs/tags/v0.2.8');if(!r.startsWith(local)){console.error('tag hash mismatch',local,r);process.exit(1)}"`
  → exit 0.
- `git rev-list --left-right --count origin/main...main` → `0 0`.
- `node -e "const{execSync}=require('child_process');const s=c=>execSync(c).toString().trim();const sha=s('git rev-list -n1 v0.2.8');const runs=JSON.parse(s('gh run list --commit '+sha+' --json databaseId'));if(runs.length<2){console.error('expected 2 CI runs for',sha,'got',runs.length);process.exit(1)}for(const r of runs){const jobs=JSON.parse(s('gh run view '+r.databaseId+' --json jobs')).jobs;for(const n of ['windows','ubuntu']){const j=jobs.find(x=>x.name===n);if(!j||j.conclusion!=='success'){console.error('run',r.databaseId,n,j?j.conclusion:'ABSENT');process.exit(1)}}}console.log('both runs: blocking legs green')"`
  → exit 0.
- Consumer proofs записани с числа (relay).
Risk threshold/Stop: като CONS-007. Assignee: COO.

## Chain-trace таблица (D13; r8 — [r8] линковете file:line или изричен „нов: <път>")

| # | Поведение | Верига | Endpoint |
|---|---|---|---|
| 1 | supersedes → CHANGES | validate-payload:139-144→:363-368 → migrate:1134-1145→:1164-1171→:1330-1335 | render |
| 2 | таблото навсякъде | fresh: generate:1175-клас сийд на резолвнат път (+containment :924); заварена: доктрина lazy-create (скелетът в WORKFLOW) | source |
| 3 | session id → resume | [ИМПЛЕМЕНТИРАНО, commit 7840167 — НЕ tee/парс: нула докосване на потоците, store lookup] codex-review.ps1:60 (param) → :124 (state path) → :176-199 (frozen argv + Set-Location) → :220-274 (Save-CodexSessionId: fingerprint, exactly-one, верифициран clear) → :294/:297 (чиста инвокация + запис); sh огледало codex-review.sh:59/:163/:196/:235-310/:302-303; qa: codex-qa.ps1:59/:106/:162/:240-250/:280, codex-qa.sh:57/:145/:181/:220-295/:287-288 | runtime |
| 4 | работещ bash | findBash :237-249 (ред + функционална проба) → BASH :250 → sh-секциите | test |
| 5 | доктрина пиннати | [ИМПЛЕМЕНТИРАНО, commit b465f32] деветте P-фрази → домовете (docs/WORKFLOW.md, templates/CLAUDE.md.tmpl, skills/mission, skills/work) → фразовите константи aiwf-selfcheck.js:5634-5673 → DOCTRINE_CONSOLIDATION_SURFACES :5674-5740 + countPhrase :5742-5750 → findings лупът :5951-5956 и count находката :5960-5967 → DOCTRINE_CONTROLS spread :6136-6146 и литералната контрола :6152-6158 → „FAIL as required" в sectionPayloadDoctrine | test |
| 6 | review скилът | SKILL :204/:230-232/:132-176/:359-362 → CONS-005 пиновете | test |
| 7 | ролята рендирана | tmpl → generate (:944-945) → RESOLVABLE :113-119 → createIfAbsent op (СОБСТВЕНИК 008) → selfcheck :1781-1783/:3795-3799 → CLAUDE.md.tmpl :43-63 | source+test |
| 8 | arbiter | нов: skills/arbiter/SKILL.md → generic луп aiwf-selfcheck.js:5100-5111 + interlock :5114-5129 → нов: `<scratchDir>/arbiter-brief.txt` (Решение 13) → README.md:31 новият ред | test+render |
| 9 | METRICS | нов: docs/METRICS.md → docs/README.md:1-23 индексът → нови редове в docs/WORKFLOW.md + docs/LOOP.md → skills/review/SKILL.md:359-362 (CONS-005) | render |
| 10 | D6 → консуматора | P-D6 в NOTE OP ТЕКСТА на 0011 (единственото, което стига CHANGES: migrate:1134→:1164) → CHANGES assertion в test-update | render+test |
| 11 | release до края | migrations/index.json:11 → .claude-plugin/plugin.json:3 → fixture сайтовете (bump.json:2; ops.json:2; NOTES.md:1,16,31; examples README:17,45,78-79) → validate-payload.mjs:251-256 (last==version) → CONS-007 фаза А командите (изписани в тикета: gh auth / cat-file / двата node one-liner-а / rev-list) → фаза Б записът в PLAN_CONS | процес → запис |

## Сух процесен trace
Одобрение → PLAN_CONS.md в active/ (guard (e), docs commit) → per ticket: дума → route-state →
Writer (ANCHOR, Ticket ред) → handback → pack (code) + fact-check → дума pass 1 → [fail →
рунд ≤2 → делта fact-check → дума за resume верификация] → commit клик → completion record
(отделен docs commit) → route-state {}. Release: двуфазният договор. CONS-004: --resolve
re-apply НА 0011. Нула редакции при example цикли. 13-те dev commits се пушват с 0.2.7.

## Отворени точки
Нула. (Resume формата замразена в Решение 12; -m фактът признат и решен.)
