# PromptAndPray Consolidation implementation — 0.2.7 → 0.2.8 (PLAN_CONS) — r10 (арбитраж 2026-09-18: CONS-011 пренаписан по доказателства, Решение 17 отменено изцяло, A-2 без placeholder; r10 = пас-5 блокерите затворени)

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
17. **[r9 — ОТМЕНЕНО ИЗЦЯЛО 2026-09-18, арбитраж (readiness пас 4 блокер 3).]** Първоначалният
    текст („CONS-006 ПРЕДИ CONS-005; последният кодов commit на изданието е CONS-005 → тагът върху
    него") не важи в нито една от двете си половини: CONS-006 отпадна по арбитраж (предпоставката
    му беше невалидна) и не предхожда нищо — изпълнителният ред го показва задраскан; CONS-011 се
    роди СЛЕД CONS-005 и носи поправка, без която изданието е счупено на POSIX. **Валидното
    твърдение:** последният КОДОВ commit на 0.2.7 е този на CONS-011 и тагът `v0.2.7` отива върху
    него. Тагът, сложен на 2026-09-18 върху `a445cbf` (кодовия commit на CONS-005), сочи издание
    БЕЗ поправката и се мести по стратегия (A) — избрана от оператора (дума 2026-09-18) — по реда
    А-2 в CONS-007, СЛЕД зелен `ubuntu`, с отделните думи на стъпка 5.
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
**[ОБНОВЕН 2026-09-18, readiness пас 3 блокер 3]**
CONS-001 → 002 → 003 → 004 → ~~006~~ (отпаднал по арбитраж) → 005 → **011** → 007 (+release 0.2.7)
→ 008 → 009 → 010 (+release 0.2.8) → [PLAN_HARD: HARD-011 → 0.2.9].
**CONS-011 стои МЕЖДУ 005 и 007** и е предпоставка за 007: фаза А на 007 иска зелени блокиращи
крака, а `ubuntu` е червен точно заради дефекта, който 011 поправя. Предишният ред слагаше 007
веднага след 005 и изобщо не познаваше 011 — това беше противоречие с всичко останало по-долу.
**CONS-012 е ПАРКИРАН извън реда** — собствен readiness цикъл след отпушването на 0.2.7; не е
предпоставка за нищо. D26 пилот: след ъпдейта на консуматорите.

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

### CONS-011 [R2 code] — POSIX-005: изходът на self-check-а се къса на POSIX (роден 2026-09-18 от червен CI на 0.2.7) — r9, пренаписан по арбитраж

> **ЧАКА ОПЕРАТОРСКА ДУМА ЗА СТАРТ.** Роден след стояща дума, извън записания изпълнителен ред —
> нула мутации по него до собствената му дума (guard (b)). **Одит: ДА** (операторска дума
> 2026-09-18, P-D8): readiness цикъл преди старта, code пас след изпълнението.
> **Readiness до тук:** пасове 1–5, всичките NEEDS-FIX (редовете са на transfer surface). Пас 4 беше
> над тавана `passes + 1 = 3`; **операторско решение 2026-09-18 (арбитраж):** всеки пас над
> контракта е операторска дума, по една на пас, без промяна на конфига — тоест пас 4 е легитимен
> по думата, а не нарушение, и всеки следващ върви на същата база. Записано и в event ledger-а.
> Пас 5 (върху r9) затвори трите блокера на пас 4 и върна 5 нови, всичките в acceptance
> механиката на r9 — затворени в r10 (self-validating WSL команди, без `rm`, литерална guard
> мутация, chain ред 12 от entry point-а). Пас 6 (върху r10) затвори четири от тях и остави ЕДИН
> остатък — chain ред 12 да тръгва от литералните CLI entry point-ове; anchor-ите на Одитора са
> проверени срещу дървото и редът е пренаписан. **COO решение (арбитраж):** без пас 7 — единственият
> остатък беше документационен anchor, не решение; code пасът след изпълнението одитира истинския
> диф. **Следваща стъпка:** думата за СТАРТ.

**Контекст (измерено, не предположено).** CI на `v0.2.7` (`35316398052`, на `a445cbf`) и на `main`
(`35316388955`, на `8959be9`): `ubuntu` failure, `macos` failure (съвещателен, `ci.yml:126`),
`windows` success. И на двата POSIX крака пада ЕДНО И СЪЩО единствено твърдение:
`test-update.mjs:1583-1584` — „the self-check's own output reached the operator verbatim"
(`r.out.includes('roles.json') && r.out.includes('FAILURES:')`). Редовете `[FAIL] roles.json ...
low` в лога НЕ са дефект: `test-update.mjs:1580` ги произвежда нарочно (сценарият sc-red).
Липсва ОПАШКАТА на уловения изход: в CI лога уловеният stdout свършва на
`...the shipped manifest and every ops.json are accepted, an` и веднага следва
`self-check: FAIL (exit 1)...` — това е stderr вердикта, слепен от `test-update.mjs:178`
(`out = stdout + stderr`). Не е race между два потока; е отрязан stdout + цял stderr.

**История (`gh run list --branch main`, 14 рънa общо):** `macos` е червен на ВСИЧКИТЕ 14, от
0.2.0 насам. `ubuntu` е зелен от 0.2.1 (2026-09-03) до 2026-09-16 и става червен с push-а от
2026-09-18, който носи CONS-001…005 наведнъж. macOS е показвал същия клас дефект от самото
начало; Linux се присъедини, когато изходът на self-check-а порасна (`aiwf-selfcheck.js`
6893 → 8283 реда през CONS-001…005; проверимо от git). Нито един от петте тикета не носи
логическа грешка.

**ПРИЧИНАТА — ДОКАЗАНА (арбитражна сесия 2026-09-18; discovery, НЕ изпълнение — артефактите са в
scratchpad-а на сесията, не в дървото; изпълнението ги произвежда наново със същите команди).**

1. *Документиран механизъм* (nodejs.org/api/process.html, „A note on process I/O", дословно):
   „Pipes (and sockets): synchronous on Windows, asynchronous on POSIX" и „Calling process.exit()
   will force the process to exit as quickly as possible even if there are still asynchronous
   operations pending ... including I/O operations to process.stdout and process.stderr."
2. *Микротест, WSL Ubuntu (Node v22.23.2; числата са от изхода на агентния рън, БЕЗ запазен
   лог — възпроизвеждат се с командите тук):* `node -e "process.stdout.write('x'.repeat(1<<22));
   process.exit(0)" | wc -c` → 1 048 576 (от 4 194 304); същото с `process.exitCode=0` → 4 194 304;
   вложено през `spawnSync` с `encoding:'utf8'` (производствената форма): дете с `process.exit(1)`
   след 1 MiB запис → уловени 146 176 байта, маркерът в края липсва; с `process.exitCode=1` →
   цяло. На Windows и четирите варианта са цели. (Вложеният вариант е наблюдение от агентния
   рън без запазен инструмент — число, на което нищо тук не стъпва; двата директни pipe реда са
   литерални и се възпроизвеждат за 1 секунда.)
3. *Контрола / интервенция върху самия suite* (WSL, копие от `git archive HEAD`, tmpfs):
   контрола → `checks: 518, failures: 5`, твърдението `[FAIL]`; интервенция = ЕДИН ред,
   `aiwf-update.mjs:220` `process.exit(main())` → `process.exitCode = main()` → `checks: 518,
   failures: 4`, СЪЩОТО твърдение `[PASS]`. Детерминистично НА ТИХА МАШИНА (r11: под 4 паралелни Windows suite-а контролата веднъж върна 0 провала — race под натоварване, съвместим с причината; контролата е наблюдение, поправката не зависи от товара): 3 контролни и 2 интервенционни
   рънa, байт-еднакъв FAIL набор във всяко рамо.
4. *Остатъчните 4 провала в WSL НЕ са в CI и НЕ са дефект:* като root всичките са „a bare
   -Resume against an UNWRITABLE state file exits 2" (root пише в chmod-нат файл; GitHub runner-ът
   е non-root); като `nobody` те изчезват, но snap `pwsh` не тръгва без home (stderr на агентния
   рън, незапазен: `cannot create snap home dir: mkdir /nonexistent`) и self-check-ът отчита
   `powershell host : (none found)` (в запазения лог, 2 пъти). Оттам прекондицията по-долу —
   ИЗПЪЛНЕНА 2026-09-18 от оператора: `useradd -m -s /bin/bash pnp` → uid 1000; под `pnp`
   `pwsh -NoProfile -Command 'Write-Output ok'` → `ok`.

**Поправени твърдения от по-ранните версии на този тикет** (всяко проверено срещу лог или дърво):
мястото на сплайса не е „EMPTY value. A" (то е `[PASS]` ред); `pwsh` СЪЩЕСТВУВА в WSL
(`/snap/bin/pwsh`) и 4-те локални провала бяха от root, не от липсващ pwsh; `CHANGELOG.md:521-530`
(записът на POSIX-005 в блока на **0.2.2** — r11 поправка: r9/r10 казваха „0.2.1", Колегата провери: `CHANGELOG.md:405` е `## [0.2.2]`, `:532` е `## [0.2.1]`) ВЕЧЕ назовава верния механизъм — „buffered stdout being dropped
when a process ends while its stdout pipe is asynchronous" — и честно казва, че мястото е
„unpinned"; `spawnSync` без `maxBuffer` е споменат там като контекст, не като причина. Онзи
запис е история на 0.2.2 и НЕ се пренаписва; новият запис в блока на 0.2.7 заковава мястото.

**Мястото:** детето е коректно (`aiwf-selfcheck.js:8280` завършва с `process.exitCode`).
`run-selfcheck.mjs:98-99` пише уловения stdout на детето в СВОЯ `process.stdout` (async pipe на
POSIX) и връща код; ЧЕТИРИМАТА викащи го превръщат в `process.exit(...)` и убиват недоизточения
запис. Множеството е затворено с ЛИТЕРАЛНИЯ grep `grep -rn "finishWithSelfCheck(" scripts
--include=*.mjs` → 5 попадения: дефиницията `run-selfcheck.mjs:74` + четирите call site-а
`aiwf-update.mjs:159` (обвит в `finish`, консумиран от `main()`), `generate.mjs:1700`,
`interview.mjs:324`, `aiwf-roles.mjs:723`; голият символ дава 10 (+4 import реда и прозата в
`test-setup.mjs:762`), затова скобата е част от grep-а. Местата на ИЗЛИЗАНЕТО, които се сменят:
`scripts/update/aiwf-update.mjs:220`, `scripts/setup/generate.mjs:1700`,
`scripts/setup/interview.mjs:336`, `scripts/setup/aiwf-roles.mjs:734`.

**Прекондиция (машина на оператора, еднократна, system-changing → операторска дума, ПРЕДИ
диспача):** non-root потребител в WSL с home, под който snap `pwsh` работи. Предложена форма:
`wsl.exe -e sh -lc "useradd -m -s /bin/bash pnp"`. Проверка от COO преди диспача (fail-capable):
`wsl.exe -u pnp -e sh -lc "id -u; pwsh -NoProfile -Command 'Write-Output ok'"` → uid ≠ 0 и `ok`.
Без нея POSIX acceptance-ът долу не може да бъде зелен и тикетът не тръгва.
**Квотинг капан, важи за всяка команда, която носи `$?`:** в double quotes той се разгъва от
ВЪНШНИЯ shell на Bash tool-а преди да стигне WSL (наблюдавано: `suite_exit=0` при реален exit 1).
Затова acceptance командите с `$?` са в single quotes; команди без `$?` (като двете по-горе) могат
да са в double quotes.

Outcome: изходът на червен self-check стига до викащия ЦЯЛ през цялата вложена верига, на POSIX и
на Windows, по ВСИЧКИТЕ четири пътя, и регресия на този клас гърми в suite-а.
Обхват:
(1) четиримата викащи излизат през `process.exitCode = <код>` вместо `process.exit(<код>)` —
    същите кодове, нищо друго не мърда; `run-selfcheck.mjs` header (точка 4 на договора) казва
    защо: викащият връща кода през `process.exitCode`, никога през `process.exit()`, който на
    POSIX изхвърля недоизточения pipe запис;
(2) СТРУКТУРЕН guard в `scripts/setup/test-setup.mjs` (решено: това е suite-ът, който вече
    покрива interview → finishWithSelfCheck червения клон, `:762`, и върви на всеки CI крак),
    с ТОЧНОТО име `every caller of finishWithSelfCheck returns its code through process.exitCode,
    never process.exit()`: статично твърдение, че във всеки файл под `scripts/`, който импортира
    `finishWithSelfCheck` от `run-selfcheck.mjs` (четирите по-горе; списъкът е изписан в теста, не
    открит), редът/изразът, който консумира резултата му, не съдържа `process.exit(`; затварящият
    grep първо ХВАЩА четиримата известни, после връща нула извън списъка (P-D11); guard-ът се
    показва червен в мутация по литералната команда в Acceptance;
(3) `CHANGELOG.md`, блокът на 0.2.7, `### Fixed`: `- **The self-check's output no longer
    truncates on POSIX (CONS-011)** - ...` — заковава мястото (четиримата викащи, `process.exit`
    след async pipe запис), казва, че 0.2.2-ият запис на POSIX-005 сочеше улавянето, а мястото
    беше излизането на викащите, и че macOS показваше същия дефект от 0.2.0 (CI доказателството
    за macOS идва с CONS-007, не се обещава тук).
Извън обхвата: смаляване на изхода; промяна на самите проверки; семантиката на exit кода на
червен self-check (HARD-013/CONS-002 я закова — кодовете остават байт за байт); другите
`process.exit(` в тези файлове, които НЕ консумират `finishWithSelfCheck` (грешкови пътища с
кратък изход); блокът на 0.2.2 в CHANGELOG; каквото и да е в WSL (прекондицията е операторска);
migration/version bump (няма managed артефакт в диффa).

Acceptance (литерално, fail-capable; **всяка WSL команда е self-validating — exit кодът на
`wsl.exe` Е доказателството**, без `; echo X=$?` суфикси (правилото на CLAUDE.md); Bash tool,
single quotes към WSL; НИЩО не се трие — `mktemp -d` дава нова директория, пътят ѝ ляга в
`/tmp/pnp-011.dir` и всяка следваща команда го чете оттам; tmpfs се чисти сам при рестарт на WSL):
- Windows: VERIFY 8/8 (командите от `aiwf.config.json`) → exit 0 всяка; CYR grep празен.
- Подготовка (root; control = HEAD без поправката, fix и mut = работното дърво С поправката и
  guard-а):
  `wsl.exe -e sh -lc 'D=$(mktemp -d /tmp/pnp-011.XXXXXX) && echo "$D" > /tmp/pnp-011.dir && chmod 644 /tmp/pnp-011.dir && mkdir "$D/control" "$D/fix" "$D/mut" && cd /mnt/d/promptandpray && git archive HEAD | tar -x -C "$D/control" && tar --exclude=.git -cf - . | tar -x -C "$D/fix" && tar --exclude=.git -cf - . | tar -x -C "$D/mut" && chown -R pnp:pnp "$D" && echo "$D"'`
  → exit 0, печата пътя.
- Контрола (очаквано: suite exit 1 И твърдението `[FAIL]` точно веднъж; `.` в pattern-а стои на
  мястото на апострофа в `self-check's`):
  `wsl.exe -u pnp -e sh -lc 'D=$(cat /tmp/pnp-011.dir) && cd "$D/control" && node scripts/update/test-update.mjs > "$D/control.log" 2>&1; [ $? -eq 1 ] && [ "$(grep -c "^  \[FAIL\] the self-check.s own output reached the operator verbatim" "$D/control.log")" -eq 1 ]'`
  → exit 0 (контролата възпроизвежда дефекта). Exit ≠ 0 = контролата НЕ възпроизвежда → стоп,
  средата се установява преди всичко друго.
- Интервенция (очаквано: suite exit 0, tally `failures: 0`, твърдението `[PASS]` точно веднъж):
  `wsl.exe -u pnp -e sh -lc 'D=$(cat /tmp/pnp-011.dir) && cd "$D/fix" && node scripts/update/test-update.mjs > "$D/fix.log" 2>&1 && grep -q "checks: [0-9]*, failures: 0" "$D/fix.log" && [ "$(grep -c "^  \[PASS\] the self-check.s own output reached the operator verbatim" "$D/fix.log")" -eq 1 ]'`
  → exit 0.
- Setup suite-ът под pnp (домът на guard-а и на interview викащия, `test-setup.mjs:762`); guard-ът
  се казва ТОЧНО `every caller of finishWithSelfCheck returns its code through process.exitCode,
  never process.exit()`:
  `wsl.exe -u pnp -e sh -lc 'D=$(cat /tmp/pnp-011.dir) && cd "$D/fix" && node scripts/setup/test-setup.mjs > "$D/setup.log" 2>&1 && grep -q "\[PASS\] every caller of finishWithSelfCheck returns its code through process.exitCode, never process.exit()" "$D/setup.log"'`
  → exit 0.
- Guard-ът пада нарочно (в `mut` копието един викащ е върнат на `process.exit`; очаквано: suite
  exit 1 И точно този guard `[FAIL]`):
  `wsl.exe -u pnp -e sh -lc 'D=$(cat /tmp/pnp-011.dir) && cd "$D/mut" && sed -i "s/process.exitCode = main()/process.exit(main())/" scripts/update/aiwf-update.mjs && grep -q "process.exit(main())" scripts/update/aiwf-update.mjs && node scripts/setup/test-setup.mjs > "$D/mut.log" 2>&1; [ $? -eq 1 ] && grep -q "\[FAIL\] every caller of finishWithSelfCheck returns its code through process.exitCode, never process.exit()" "$D/mut.log"'`
  → exit 0 (guard-ът е червен точно на мутацията).
- Числата от discovery-то по-горе са ИСТОРИЯ на тикета (наблюдения, всяко с командата си), не
  acceptance и не се „възпроизвеждат": условията са други (root срещу `pnp`, един ред срещу пълната
  поправка + guard). Acceptance-ът произвежда СВОИТЕ числа — контрола exit 1 + `[FAIL]`×1,
  интервенция `failures: 0` + `[PASS]`×1, guard червен ×1 — и те лягат в completion record-а с
  командата си.
Risk threshold: поправка, доказана само на Windows; по-малко от четиримата викащи; промяна в exit
кодовете; смаляване на изхода вместо поправка; редакция на блока на 0.2.2; guard, който никой не е
видял червен.
**Stop: локалното POSIX доказателство е налице** — контрола червена / интервенция зелена под
non-root WSL, guard-ът показан червен в мутация, 8/8 на Windows, CHANGELOG редът в блока на 0.2.7.
**Зеленият `ubuntu` НЕ е stop на този тикет** — той е acceptance на CONS-007 (тикет не може да
иска доказателство, което идва след собственото му затваряне). Ако CI падне въпреки зелен локален
рън, това е нов тикет, не пре-отворен.
Review: Class code. Assignee: Колега. **Блокира CONS-007 фаза А** и с това 0.2.7.

**CONS-011 CLOSED 2026-09-19 — code commit `ef95d88`** (7 файла, 145+/5−; арбитражната сесия
`promptandpray-fe` довърши изпълнението по операторска дума след handover от `promptandpray-f3`).
- *Промени:* четиримата викащи → `process.exitCode` (`aiwf-update.mjs:224`, `generate.mjs:1704`,
  `interview.mjs:340`, `aiwf-roles.mjs:738`; редовете са изместени спрямо r10 от WHY коментарите);
  `run-selfcheck.mjs` договор т.4 казва защо; guard в `test-setup.mjs:791-894` — **BYTE PIN-ове**, не
  текстов анализ (виж отклонение); CHANGELOG `## [0.2.7]` `### Fixed` един запис; блокът на 0.2.2
  непипнат.
- *Отклонение (COO, архитектурно):* планът искаше „статично твърдение над consuming реда". Кръг 1
  построи текстов анализатор (normaliser + value tracker); verification пас 2 го счупи с 3 P2
  (template literal с `process.exit`, alias `result = code`, regex текст, shadowed `code`, computed
  import, `.js` извън `scripts/`). Решение: JS по текст без AST е безкрайна пътечка (класът, който
  Gate 4 отказа, LOOP.md § Commit gate) → кръг 2 замени guard-а с byte pin-ове: `present` ред ×1,
  `absent` ред ×0 по trimmed-line равенство за всеки от четиримата + count pin `finishWithSelfCheck(`
  = 5 в `scripts/` + `hooks/` (`*.mjs|js|cjs`); три контроли през същата `pinViolations(sources)`
  върху собствена fixture. Sound по конструкция, непълен по декларация (нов викащ не се открива —
  count pin-ът е backstop-ът); CHANGELOG вече НЕ обещава „пети викащ пада". Константата
  `CALL_SITES = 5` е декларираният дизайн: легитимен пети call site прави suite-а червен, докато
  таблицата не се обнови.
- *Verification (точни exit кодове):* Windows 8/8 един паралелен батч → 0 всяка (test-setup 455/0,
  test-update 518/0, selfcheck 1275/1275, cycles 44/0 ×2, spikes PASS, validate 11 миграции 0.2.7,
  plugin validate OK); CYR grep празен. WSL под `pnp`: CONTROL (HEAD) exit 1, 518/1, единственият
  провал = твърдението; E exit 0, 518/0, `[PASS]` ×1 (тиха машина); F exit 0, 453/0, guard + 3
  контроли PASS; G (мутация `sed` в `mut` копие) exit 0: suite 453/1, единственият червен ред е
  guard-ът с `aiwf-update.mjs: present 1 got 0 | absent 0 got 1`; closing grep 5 (run-selfcheck:80,
  aiwf-roles:723, generate:1704, interview:324, aiwf-update:159).
- *Одит:* pass 1 cold `fail` (1 блокер: guard-ът четеше сурови редове, 4 контрапримера) →
  корекция 1 (текстов анализатор) → verification pass 2 cold (кешът изтекъл) `fail` (3 P2, всичките
  по guard-а) → корекция 2 = капът (pin-ове) → fact-check гейт чист → verification pass 3 resume
  **`pass`, нула находки** (одиторът изпълни `pinViolations` сам: 0 / точно 2 / `count 5 got 6` / 0).
- *Среда, за следващия читател:* (1) `snap` pwsh под `pnp` пада с `FileLoadException` след много
  паралелни pwsh spawn-а (self-check-ът) — състоянието е в `~/.cache/powershell`, лекува се с
  `rm -rf /home/pnp/.cache/powershell` (операторска дума, два пъти през тикета), HEAD без дифа
  пада със същите 5 PowerShell-channel реда; (2) WSL `/tmp` е tmpfs и се трие при idle — prep +
  run в ЕДНА инвокация; (3) гол `/tmp/...` аргумент към `wsl.exe` от Git Bash се пренаписва в
  Windows път и pwsh го чете относително → роди untracked `C:` директория в корена, която
  provenance секцията на self-check-а хвана (изтрита с дума); (4) Windows 8/8 + WSL suite-ове
  едновременно → memory kill от harness-а: VERIFY върви на ПОРЦИИ (PROJECT_OVERRIDES § Test policy).
- *Наблюдение, не тикет:* `aiwf-roles.mjs:708` `--show` печата таблицата и `process.exit(0)` —
  същият POSIX клас, извън guard-а; кандидат на transfer surface.

### CONS-012 [ПАРКИРАН — собствен readiness цикъл, не в текущия] — VERIFY порасва с POSIX крак

> **ПАРКИРАН 2026-09-18 след readiness пас 2.** Не е в обхвата на текущия readiness цикъл и НЕ
> тръгва с CONS-011. Изважда се, защото три от петте блокера на пас 2 бяха негови вътрешни
> противоречия, а той не блокира релийза — да виси над спряно издание само вдига цената на всяка
> грешка в него. Получава СОБСТВЕН readiness цикъл, когато 0.2.7 е отпушена.
> **Текстът по-долу е КОНСТАТАЦИЯ и суровина, НЕ договор.** Предишната му версия носеше избрана
> архитектура редом със стари, противоречащи ѝ редове (клас „решава се в readiness" срещу
> „code/Колега"; „Acceptance draft" срещу изписан acceptance). Тези редове са премахнати изцяло,
> вместо да бъдат оставени да си противоречат — точно дефектът, който пас 2 хвана.

**Констатацията (измерена, остава вярна независимо от архитектурата):** осемте команди в
`verify.commands` са ВСИЧКИТЕ Windows процеси. Онова, което изглеждаше като Linux покритие —
`example-cycle-linux` — е Windows процес с linux-образни ОТГОВОРИ: проверява, че генераторът рендира
за `os: linux`, НЕ че кодът работи на Linux. POSIX каналът е бил покрит единствено от CI, след push,
с един съвещателен крак (macOS), червен от 0.2.1. CONS-011 е цената. Машината има работещ WSL2
Ubuntu с Node v22.23.2 и `pwsh` на `/snap/bin/pwsh` — покритието е било на една команда разстояние.

**Съседни договори, намерени от инвентара — всеки щеше да е блокер, нито един не гърми при дрейф:**
- `templates/PROJECT_OVERRIDES.md.tmpl:110-113` рендира `verify.commands` безусловно, без OS
  разклонение — но от НЕГОВИЯ конфиг на всеки проект, тоест наш запис не достига консуматор.
- `dev/PROJECT_OVERRIDES.md:172-180` е РЪЧНО огледало; няма генератор, няма синхронизация.
- `.github/workflows/ci.yml` не чете `verify.commands`; ubuntu job-ът дублира командите ръчно.
  Конвенцията на файла е изключенията да се ИМЕНУВАТ с коментар (`:63-66`, `:80-83`).
- `scripts/setup/interview.mjs:194-205` — при повторен рън неотговорен въпрос пада обратно на
  съществуващата стойност; кракът трябва да преживее повторно интервю.
- `schema/aiwf.config.schema.json:289-311` — `run` е `string, minLength 1` и нищо повече: няма
  проверка, че командата е изпълнима на конфигурирания `os`.

**Отворени въпроси за неговия readiness (изписани като отворени, а не престорени на решени):**
носителят; какво точно значи „изпълнява суитите" (кои команди); поведението при липсващ WSL или
`pwsh` (отказ на глас е очевидният отговор, но не е доказан); дали деветият крак променя ГЛОБАЛНАТА
дефиниция на VERIFY в хедъра на този план (пас 2, блокер 2 — „пълен VERIFY" днес значи осем);
и границата payload/доктрина, при положение че `scripts/ci/` Е payload, дори когато никой освен наш
конфиг ред не го вика.

### CONS-007 [release, ДВУФАЗЕН — Решение 16] — release 0.2.7

> **ЗАТВОРЕН 2026-09-20 — виж completion record-а след acceptance списъка. Блокът отдолу е
> историята на рестарта и се чете като такава, не като текущо състояние.**
>
> **СЪСТОЯНИЕ 2026-09-18: фаза А е ИЗПЪЛНЕНА ВЕДНЪЖ И СПРЯНА НА ЧЕРВЕН CI.** Независимият рън мина
> (8/8, `TREE_IDENTICAL=yes`), `gh auth status` exit 0, тагът `v0.2.7` легна на `a445cbf`, двата
> push-а минаха (`0 0`), и CI върна `ubuntu` **failure** на двата рънa — блокиращ крак. Причината е
> CONS-011. Фаза А се **РЕСТАРТИРА ОТ НУЛАТА** след неговото затваряне: нов независим рън, нов push,
> нов CI.
>
> **Тагът е горе и сочи commit БЕЗ поправката.** Стратегията, решена при readiness на CONS-011 и
> чакаща операторска дума в момента на изпълнение: **(A) преместване** — `git tag -f v0.2.7 <новия
> кодов commit>` + `git push --force origin v0.2.7`. Преместване на публикуван таг е лоша практика
> по принцип, но тук е оправдано по факти: консуматорите са ЗАМРАЗЕНИ до своя 0.2.7 ъпдейт и нито
> един не го е консумирал, а публикуване към външни потребители не е започвало (чака доказан update
> път, P8) — тоест никой не държи този таг. Алтернативите: **(B)** изтегляне и ново издание под
> същия номер (същата необратима операция плюс изтрит таг в историята), **(C)** 0.2.7 остава счупена
> и поправката излиза в 0.2.8 (нула необратими операции, но публикувано издание с известен POSIX
> дефект и чужд товар върху „Roles"). **(A) е избрана от оператора (дума 2026-09-18,
> арбитраж)**; изпълнява се СЛЕД зелен `ubuntu`, по А-2 стъпка 5, с отделна дума за тага и отделна
> дума + диалог за force push-а в момента на изпълнение.

**Фаза А — ОПЕРАТИВНИЯТ РЕД, пренаписан 2026-09-18 (readiness пас 3 блокер 3: старият ред нареждаше
таг преди push и CI и показваше обикновен таг push, което противоречеше на статус блока отгоре).**
Двата случая са различни и се изписват поотделно:

**А-1. Първо издание (какъвто беше редът преди 2026-09-18) — вече НЕ приложим за 0.2.7**, защото
тагът съществува. Пази се като образец за 0.2.8 и нататък: независим рън → tag върху кодовия commit
(дума) → `git push origin main` + `git push origin <таг>` (дума + диалози) → CI → consumer proofs.

**А-2. ПОВТОРНО издание на вече тагнат номер — това е пътят за 0.2.7 сега.** Тагът `v0.2.7` е горе
върху `a445cbf` и сочи издание БЕЗ поправката на CONS-011. Редът е:
  1. CONS-011 е затворен с кодов commit — той става последният КОДОВ commit на изданието.
  2. Независим COO рън (VERIFY + INTERLOCK, HEAD+porcelain еднакви в двата края, нула worktree дифф).
  3. `git push origin main` (дума + диалог). Тагът ОЩЕ не мърда.
  4. CI върху новия връх на `main` — `windows` и `ubuntu` зелени. **Ако `ubuntu` е червен, спира се
     тук**; тагът не се мести върху непроверено издание.
  5. ЧАК СЕГА тагът се мести, по стратегия (A). Целта НЕ е placeholder, а деривация: кодовият
     commit на CONS-011 е ЕДИНСТВЕНИЯТ commit на `origin/main`, чийто subject започва с
     `CONS-011:` (конвенцията на repo-то: `CONS-005: ...` за кода, `dev: CONS-005 closed ...` за
     записа). `git log --format=%H --grep=^CONS-011: origin/main` → точно един ред, `<H>`; после
     `git tag -f v0.2.7 <H>` (**отделна дума**) → `git push --force origin v0.2.7` (**втора
     отделна дума** + диалог; force push е необратим и не се вози на думата за тага). Ако
     командата върне 0 или 2+ реда — стоп, нищо не се тагва.
  6. CI върху таг рънa. Двата рънa вече съществуват, всеки върху своя SHA — acceptance командата
     по-долу ги проверява и двата.
  7. consumer proofs relay (двата ъпдейта;
CHANGES там носи Supersedes редовете; консуматорите изпълняват D4 чистенето си — тяхна
страна). Фаза Б (allowlist dev/** + памет): release записът, отделен docs commit.
Acceptance (литерално, fail-capable — деривирани стойности в ЕДНА команда, без плейсхолдъри):
- Прекондиция (Решение 21): `gh auth status` → exit 0 (невалиден токен → СТОП преди тага).
- `git cat-file -t v0.2.7` → commit.
- `node -e "const{execSync}=require('child_process');const s=c=>execSync(c).toString().trim();const local=s('git rev-list -n1 v0.2.7');const r=s('git ls-remote --exit-code --tags origin refs/tags/v0.2.7');if(!r.startsWith(local)){console.error('tag hash mismatch',local,r);process.exit(1)}"`
  → exit 0 (пада при липсващ таг ИЛИ различен хеш).
- **[r9, readiness пас 4 блокер 2]** Тагът сочи КОДОВИЯ commit на CONS-011, не просто „същия хеш в
  двата края":
  `node -e "const{execSync}=require('child_process');const s=c=>execSync(c).toString().trim();const tag=s('git rev-list -n1 v0.2.7');const want=s('git log --format=%H --grep=^CONS-011: origin/main').split(/\r?\n/).filter(Boolean);if(want.length!==1){console.error('expected exactly one CONS-011: commit on origin/main, found',want.length);process.exit(1)}if(want[0]!==tag){console.error('v0.2.7 is on',tag,'not on the CONS-011 code commit',want[0]);process.exit(1)}console.log('v0.2.7 sits on the CONS-011 code commit',tag)"`
  → exit 0. Fail-capable днес: пада с `found 0` (няма CONS-011 commit), а с таг на грешен commit —
  с `v0.2.7 is on ...`.
- `git rev-list --left-right --count origin/main...main` → `0 0`.
- **[ПОПРАВЕНО 2026-09-18, наблюдавано на живо + readiness пас 2 блокер 5]** Предишната команда
  търсеше ДВА рънa върху SHA-то на ТАГА, с довода „push-ът на main и на тага правят два рънa на
  същия SHA". Това е вярно само ако тагът седи на върха на `main`. По Решение 17 тагът седи на
  КОДОВИЯ commit, а `main` върви напред с docs commit-и — тоест двата push-а раждат рънове на ДВА
  РАЗЛИЧНИ SHA-та и командата можеше само да пада. Наблюдавано на живо на 2026-09-18: таг рън
  `35316398052` върху `a445cbf`, main рън `35316388955` върху `8959be9`.
  Новата команда проверява ДВАТА рънa, всеки по собствения си SHA:
  `node -e "const{execSync}=require('child_process');const s=c=>execSync(c).toString().trim();const tag=s('git rev-list -n1 v0.2.7');const tip=s('git rev-parse origin/main');const runs=JSON.parse(s('gh run list --limit 40 --json databaseId,headSha,conclusion,status'));const need=[['tag',tag],['main',tip]];for(const [what,sha] of need){const r=runs.find(x=>x.headSha===sha);if(!r){console.error('no CI run for',what,sha);process.exit(1)}if(r.status!=='completed'){console.error(what,'run still',r.status);process.exit(1)}const jobs=JSON.parse(s('gh run view '+r.databaseId+' --json jobs')).jobs;for(const n of ['windows','ubuntu']){const j=jobs.find(x=>x.name===n);if(!j||j.conclusion!=='success'){console.error(what,'run',r.databaseId,n,j?j.conclusion:'ABSENT');process.exit(1)}}}console.log('both runs, both SHAs: blocking legs green')"`
  → exit 0. Пада при липсващ рън за който и да е от двата SHA, при незавършил рън, и при червен или
  липсващ блокиращ leg. `macos` НЕ се проверява — той е `continue-on-error` по конструкция
  (`ci.yml:126`).
- Consumer proofs записани с числа (relay) — вкл. конфиг обвързването им (Решение 19в).
Risk threshold: tag преди независимия рън или преди gh auth exit 0; push без дума; дифф във
фаза А; фаза Б извън allowlist-а. Stop: acceptance зелен + записът легнал. Assignee: COO.

**CONS-007 CLOSED 2026-09-20 — release `v0.2.7` на `ef95d88`** (фаза А по път А-2, рестартирана
от нулата след затварянето на CONS-011; фаза Б = този запис).
- *Независим COO рън (стъпка 2), INTERLOCK:* `HEAD=4442b55` в двата края, `git status` празен,
  нула worktree дифф. **Порция 1** (Windows, един паралелен батч, 8/8 exit 0): validate-payload
  11 миграции 0.2.7, test-setup 455/0, test-update 518/0, cycle-windows 44/0, cycle-linux 44/0,
  selfcheck 1275/1275, spikes 318/0, plugin validate OK. **Порция 2** (WSL под `pnp`, отделен
  батч, огледало на `ubuntu` leg-а от `ci.yml`, 7/7 exit 0): shellcheck, validate-payload,
  test-setup 453/0 (self-check 1281/1281), test-update 518/0 (1280/1280), spikes 318/0,
  cycle-linux 44/0 (1283/1283), selfcheck 1280/1280.
- *Отклонение (COO, секвенсиране):* порция 2 не е в записания образец на стъпка 2 — предният рън
  на фаза А е записан като „8/8". Добавена, защото фаза А се рестартира заради червен `ubuntu`:
  POSIX кракът се доказва ПРЕДИ думата за push, не след нея.
- *Дефект на измервателния инструмент, хванат на живо:* първият WSL батч върна 4 червени (setup 5,
  update 4, cycle 7, selfcheck 5 провала). Причината не беше кодът — COO-то беше пренасочило изхода
  в `*.log` ВЪТРЕ в работното копие, а provenance секцията изброява payload дървото и пада на
  некласифициран тип файл (`files of an unclassified type: cycle.log, selfcheck.log, setup.log,
  spikes.log, update.log`). СПРЯНО на червено по операторска дума, нула опити за поправка; ре-рън с
  логове извън дървото (ново `mktemp` копие, нищо изтрито) → 7/7. Правилото „VERIFY, паднал по
  средова причина, спира и пита оператора" свърши точно своята работа.
- *Гейтове, по една дума на операция:* `git push origin main` (`8959be9..4442b55`; после
  `origin/main...main` = `0 0`) → CI → `git tag -f v0.2.7 ef95d88` → `git push --force origin
  v0.2.7` (`a445cbf...ef95d88`, forced update). Деривацията върна точно един ред
  (`git log --format=%H --grep=^CONS-011: origin/main`), `gh auth status` exit 0 преди тага.
- *CI, двата рънa, всеки по своя SHA:* main `35431474157` (`4442b55`) и таг `35433501937`
  (`ef95d88`) — и двата `windows` ✅ `ubuntu` ✅ `macos` ✅; acceptance командата върна
  `both runs, both SHAs: blocking legs green`.
- *macOS зелен за първи път от 0.2.1:* предишният рън `35316388955` даде `macos` job
  `conclusion: failure` на `update acceptance suite`, останалите стъпки skipped; сега всяка стъпка
  success. Причината е CONS-011: известният macOS лимит (CHANGELOG 0.2.2 § Known limits — скъсан
  self-check изход без tally) е същият `process.exit` след асинхронен POSIX pipe write. Една
  причина, два симптома на двата POSIX канала; само единият беше в обхват. Два зелени рънa не са
  support tier — ruling ledger 2026-09-20: само дописване, `continue-on-error` остава,
  преразглеждане в отделна сесия след затварянето на плана, текстовете се возят в HARD-011.
- *Consumer proofs (стъпка 7, релей от двете сесии по D5, оператор не е куриер):* **Силеракс**
  `0.2.6`/`0010_plan-prefix-legibility` → `0.2.7`/`0011_transfer-surface`, 2 операции, нула
  конфликта, self-check 1279/1279; страница `dev/backlogs/PNP_CANDIDATES.md` (`beecb461`), после
  ключ `paths.transferSurface = "dev/backlogs/PNP_CANDIDATES.md"` (`6ffeff5e`), self-check след
  ключа 1279/1279 exit 0; D4 изпълнено срещу отпечатания отчет — 1 коригиран, 4 изтрити, по един
  ред на ID. **Фурнисимо** същите печати, 2 операции, нула конфликта, self-check 1280/1280;
  `paths.transferSurface` **unset по преценка**, страницата на дефолтния
  `docs/backlogs/PNP_CANDIDATES.md`; D4 отложено от неговия оператор (три от петте ID-та живеят в
  `PLAN_PROJ.md` § Процес, под stop gate от 2026-09-16).
- *Решение 19в — изпълнено по същество, с назовано отклонение:* обвързването е налице и на двата,
  Силеракс изрично, Фурнисимо по дефолтна резолюция (`<plansDir>/PNP_CANDIDATES.md` резолвира
  дословно до същия път). Ключът там не е пропуснат, а невъзможен без странично действие: писането
  в `.claude/aiwf-native/aiwf.config.json` не е в allowlist-а на Gate 3, а неговият
  `route-state.json` още държи отворен R2 маршрут. Опционалността на ключа е това, което спасява
  случая — кандидат на transfer surface.
- *D4 доказан на две инсталации с различен layout:* петте `Supersedes:` реда са отпечатани в
  `CHANGES_0.2.6-to-0.2.7.md:14-18` и в двата проекта. Силеракс отказа да чисти по собствените си
  бележки и работи само по отчета — включително остави два записа със СОБСТВЕНИ supersede бележки,
  чиито ID-та не бяха сред петте. Точно това е механизмът: отчетът е авторитетът, не бележката.
- *Наблюдение, не тикет:* списъкът на `0011` не назова локалния дубликат на новородения въпрос,
  който същата миграция рендерира в `CLAUDE.md#aiwf-core` — кандидат на transfer surface.

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

**CONS-008 CLOSED 2026-09-21 — code commit `6c8d714`** (24 файла, 1526+/44−; този запис е отделният
docs commit).
- *Реални промени:* `createIfAbsent` на rerender op-а — validate-payload: optional boolean, отказ по
  ПРИСЪСТВИЕ на двете полета (`ifRecorded`+`createIfAbsent`), отказ при `region ≠ null` (whole-file
  only); migrate.mjs: createIfAbsent клонът в `planRerender` (файл липсва → creation; файл ==
  рендера → creation без запис; различен → отказ), `created: true` в плана, в stage metadata-та и
  в re-plan-а след recovery, `writeCreatedTarget` (hard-link публикуване, EEXIST = отказът, друга
  грешка = явен UpdateError, БЕЗ fallback), `assertNoForeignFileAtCreationTarget` (ранната
  проверка; гаранцията е syscall-ът), `recover` тройно правило преди hash клоновете (липсва →
  replay/re-plan; == postHash → наш, щампова; различен → отказ), `createdOps` per-операция за
  CHANGES етикета `created (no record, no file)`; `templates/ORCHESTRATOR.md.tmpl` (198 реда,
  model-agnostic, без frontmatter) → `.claude/aiwf-native/ORCHESTRATOR.md`, безусловен addArtifact,
  RESOLVABLE ключ; `CLAUDE.md.tmpl` preflight bullet-ът назовава ролята (единствената промяна в
  региона); миграция `0012_orchestrator-role` (note със `supersedes`, createIfAbsent rerender,
  region rerender); index 12; plugin 0.2.8; fixture → `0013_example-bump`; CHANGELOG `[0.2.8]`;
  self-install приложен (`CHANGES_0.2.7-to-0.2.8.md` проследен); selfcheck: needle, cover set +
  контрола за ключа, 5 doctrine пина с генерирани контроли (data discipline, verdict/dispatch,
  form check, duals, ledger row), `doctrine-orchestrator-model-agnostic` с 3 контроли (roles ключ,
  model/effort поле, frontmatter fence), 2 validator refusal контроли; test-setup +4 checks (459→460);
  test-update секция 15 (10 лица + crash матрица + in-process production dispatch тест с patch-нат
  `fs.linkSync`; 538→591); README.md:169, skills/setup/SKILL.md:3 и :43 — по една клауза за ролята;
  migrations/README.md — полето и двата отказа.
- *Решения и отклонения:* (1) `created: true` вместо `preHash === null` — resolved take-new/merge над
  липсващ файл също носи null preHash (Колегата, с доказателство); (2) `region: null` по fixture
  образеца; (3) `createdKeys` по ключ → `createdOps` по операция (два rerender-а на един ключ в един
  рън); (4) 0012 повтаря `orchestrator-regulation-v2-seed` — 0011 го обяви, тук каца заместителят
  (текстът го казва); (5) без P-D6 word-gate изречение — ролята не въвежда гейт; (6) CHANGELOG
  стеснен до пиннатото; (7) отказът НЕ препоръчва `/pnp:setup --adopt` на инсталиран проект (adopt
  отказва `_aiwf`; `ADOPT_ALREADY_INSTALLED`) — „move it aside or remove it, then run the update
  again"; 0.1.0 блокът в CHANGELOG, който назовава `--adopt`, е released история и остава; (8) journal
  състояние `written` въведено в рунд 2 и МАХНАТО в рунд 3 (при „идентичен = наш" recovery се решава
  по байтове, състоянието беше излишно и създаваше orphan прозорец); (9) contract коментарът на
  шаблона: „two kinds" — D12 правилата се ИЗПИСВАТ (ролята е техният дом), D17 четирите са само
  референции; секциите canon-conflict/doctrine-writes свити до частта на COO + указател; guard (f)
  е прецедентно правило, не стоп правило (fact-check catch).
- *Операторско решение (ruling ledger 2026-09-21):* байт-идентично съдържание на creation target-а
  = запис на engine-а; `.claude/aiwf-native/` е папка на плъгина, чужд файл там е проблем на автора
  му; threshold = загуба на данни ИЗВЪН папката на плъгина. Одиторът четеше „никакво осиновяване,
  дори равни байтове" и това четене доведе до рунд 2 + вер. 2 — арбитраж при оператора СЛЕД
  нарушение на D18 т.4 от COO-то (event ledger).
- *Одит:* fact-check (1 невярна претенция) → cold p1 `fail` 1 P1 + 6 P2 (всички приети) → рунд 1 →
  resume v1 `fail` (5/7 затворени; B1 прозорци, B3 `--adopt`) → рунд 2 = капът → resume v2 `fail`
  (B1: stage без `created`; нов P1: publish преди journal `written` → orphan) → операторски арбитраж
  → рунд 3 на дума (протоколът по решението) → cold пас с ТЕСЕН обхват `fail` (1 нов: няма тест за
  продукционния диспач) → рунд 4 test-only на дума → resume v4 **`pass`, нула блокери**. Codex сесии:
  `01a0bfe4-b7f3-7f31-acfa-c3209734e92a` (p1–v2), `01a0c285-a671-76e1-bddb-a3a215d51832` (cold + v4).
  Всеки нов инструмент видян червен на sabotage копие (записано по рундове в handback-ите).
- *VERIFY, финално дърво:* Порция 1 (Windows, един паралелен батч, 8/8 exit 0): validate-payload
  12 миграции 0.2.8, test-setup 460/0, test-update 591/0, cycle-windows 44/0, cycle-linux 44/0,
  selfcheck 1292/1292, spikes 318/0, plugin validate OK. Порция 2 (WSL под `pnp`, 4/4 exit 0):
  selfcheck 1296/1296 (CI форма), test-setup 458/0, test-update 591/0, cycle-linux 44/0.
- *Два средови капана, хванати на живо:* (а) порция 2 selfcheck трябва да е в CI формата
  `--plugin-root .` БЕЗ `--project-fixture .` — копирано дърво + шестте root-bound owned rules на
  self-install-а = фалшиво червено (дефект на брифа ми, доказан с контрола върху HEAD); (б) snap
  `pwsh` кешът под `pnp` умря след паралелните spawn-ове в рунд 4 — Колегата спря, изчистване по
  операторска дума → 4/4.
- *Остатъчен дълг:* няма. Наблюдение, не тикет: `newRender` се хешира суров, а се пише `lf()` —
  предсъществуваща конвенция в целия engine, шаблоните са `eol=lf`.
- *За CONS-010:* консуматорите нямат файл на пътя → 0012 го създава; ако имат — стопът с „move it
  aside".

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
CHANGELOG. **[2026-09-21, операторска дума, роден от CONS-008 — кандидатът „Разногласието не е
блокер" (CANDIDATES.md):]** абзац към § Escalation на `templates/ORCHESTRATOR.md.tmpl` — оспорено от
Одитора ДИЗАЙНЕРСКО решение на COO не се решава с корекционен рунд и пас: COO спира, записва спора в
две-три изречения на човешки език (какво иска всяка страна, какво губи операторът при всеки избор)
и го дава на оператора; рунд едва след думата му; рунд, който имплементира оспорено решение, е
нарушение на D18 — плюс изречение в `skills/review/SKILL.md` Step 4 („a disputed blocker is parked
for the operator, not implemented in a correction round"), двете пиннати с контрола. Консуматорите
получават новия рендер през 0012 (createIfAbsent рендира ТЕКУЩИЯ шаблон при ъпдейта); този repo
се ре-синква с `--resolve` take-new. Acceptance: `git grep -cF "disputed blocker" --
skills/review/SKILL.md templates/ORCHESTRATOR.md.tmpl` → ≥2.
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
| 12 | [r10] червен self-check стига цял (CONS-011) | ENTRY (update пътят, изписан докрай): aiwf-update.mjs:220 `if (isMain()) process.exit(main())` → main():136 → `return finish(...)` :193/:211 → closure :159 → finishWithSelfCheck run-selfcheck.mjs:74 → CALL runSelfCheck :84 → :49-57 (`spawnSync` улавя детето през pipe) → CHILD aiwf-selfcheck.js:8275-8279 печата тялото и FAILURES блока, :8280 `process.exitCode` → RETURN в run-selfcheck.mjs:98-99 уловеният stdout се пише в async pipe на POSIX, :106 връща 1 → EXIT обратно в aiwf-update.mjs:220 `process.exit(1)` — ТУК недоизточеният запис умира; поправката: `process.exitCode = main()`, Node източва и излиза сам. Другите три входа, същата форма: generate.mjs:1672 `if (isMain())` → :1700 `process.exit(finishWithSelfCheck(...))`; interview.mjs:251 `if (isMain())` → :324 `code = finishWithSelfCheck(...)` → :336 `process.exit(code)`; aiwf-roles.mjs:688 `if (isMain())` → :723 `const code = finishWithSelfCheck(...)` → :734 `process.exit(code)` — и трите → `process.exitCode`. CONSUMER: test-update.mjs:172-178 улавя stdout+stderr цели → :1583-1584 [FAIL]→[PASS] под non-root WSL → нов: guard-ът в test-setup.mjs (статичен, над четирите call site-а, червен в мутация) → CHANGELOG.md блокът на 0.2.7 `### Fixed` | test+render |

## Сух процесен trace
Одобрение → PLAN_CONS.md в active/ (guard (e), docs commit) → per ticket: дума → route-state →
Writer (ANCHOR, Ticket ред) → handback → pack (code) + fact-check → дума pass 1 → [fail →
рунд ≤2 → делта fact-check → дума за resume верификация] → commit клик → completion record
(отделен docs commit) → route-state {}. Release: двуфазният договор. CONS-004: --resolve
re-apply НА 0011. Нула редакции при example цикли. 13-те dev commits се пушват с 0.2.7.

## Отворени точки
Нула. (Resume формата замразена в Решение 12; -m фактът признат и решен.)
