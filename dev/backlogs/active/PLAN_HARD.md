# PromptAndPray Hardening — 0.2.3 → 0.2.6 (PLAN_HARD)

> **РЕКОНСИЛИРАН СЛЕД КОНСОЛИДАЦИЯТА (операторска дума 2026-09-16; решенията: D1–D26 приети,
> PLAN_CONS одобрен и активен).** Състояние на остатъка: **HARD-010 е СГЪНАТ в CONS-004**
> (изречението за отделния docs commit пътува с доктрина пакета); **HARD-013 е ПОГЪЛНАТ от
> CONS-002** (същият обхват + двете измерени exit лица — указателят е натам); **HARD-011
> остава ТУК**, размразява се СЛЕД release 0.2.8 на PLAN_CONS, издание **0.2.9** (README-то
> документира финалното състояние, вкл. 12-те команди). **HARD-014 отпадна** — темата „одитор
> с resume" е погълната от PLAN_CONS (CONS-003 + METRICS политиката). Изпълнителният ред
> оттук: [PLAN_CONS: CONS-001…010] → HARD-011 (+release 0.2.9) → архивиране на двата плана.
> **[2026-09-21, операторска дума]** Два дефекта в шипнатата 0.2.8 влизат ПРЕДИ HARD-011 като
> HARD-015 и HARD-016 (HARD-014 е отпаднал номер и не се преизползва): редът става
> HARD-015 → HARD-016 → HARD-011 (+release 0.2.9). Двата минават readiness цикъла на този план
> (пас 1 на думата за тях, всеки следващ с отделна дума) преди диспач; кодов пас по таблицата (1).
> **[2026-09-21, вечер] УСЛОВИЕТО ЗА РАЗМРАЗЯВАНЕ Е НАСТЪПИЛО.** Release 0.2.8 е издаден: таг
> `v0.2.8` на `6feeb47`, `main` качен, двата CI рънa зелени на трите крака, двата консуматора
> обновени (по 3 операции, нула конфликта). PLAN_CONS е затворен и архивиран като
> `dev/backlogs/archive/005_PLAN_CONS_2026-09-21.md`. Този план е **РАЗМРАЗЕН**; следващият тикет е
> HARD-015 и чака собствената си операторска дума — размразяването не е диспач. Едно условие на
> изданието важи дотук: до 0.2.9 НИЩО не се пушва, само локални комити (операторска дума), затова
> следваща сесия ще завари локални комити пред `origin` — нарочно, не пропуск.

> Роден от `dev/backlogs/PROPOSAL_PNP_HARDENING.md` (операторски одобрено разпределение,
> 2026-09-12) по операторската дума за планова сесия. Дума 2026-09-12 = readiness (COO
> self-pass → fact-check → 2 Codex паса по `review.plan` реда, пас 2 носи листата на пас 1) +
> копие тук (guard (e)). Изпълнение — отделна операторска дума след readiness; всеки тикет чака
> собствена дума за диспач. Котва при диспач: `git rev-parse HEAD` в брифа.
>
> **Именуване (операторска дума 2026-09-13, преди първия одиторски пас):** един префикс —
> тикетите са `HARD-001`…`HARD-011` по изпълнителния ред; заварените кандидатски имена остават
> ВТОРИ имена (в скоби в заглавията; в текста се срещат и двете, таблицата долу е картата).
> Файлът е `PLAN_HARD.md`, за да работи lookup-ът „HARD-003 → PLAN_HARD.md" — планът изпълнява
> правилото, което HARD-009 внася в payload-а. Commit съобщенията носят `HARD-NNN`.
> Кандидатите RENAME-001 и „истинският macOS дефект" НЕ са тук — отложени по операторско
> решение, остават в CANDIDATES.md.

| Тикет | Второ име | Издание |
|---|---|---|
| HARD-001 | PS-001 | 0.2.3 |
| HARD-002 | UPD-001 | 0.2.3 + release |
| HARD-003 | SETUP-001 | 0.2.4 |
| HARD-004 | GATE-002 | 0.2.4 + release |
| HARD-005 | READY-002 | 0.2.5 |
| HARD-006 | READY-003 | 0.2.5 |
| HARD-007 | READY-001 | 0.2.5 + release |
| HARD-008 | ROLES-001 | 0.2.6 |
| HARD-009 | REF (един префикс на план) | 0.2.6 |
| HARD-010 | DOC-001 | 0.2.8 (преместен, операторска дума 2026-09-16) |
| HARD-011 | README-001 | 0.2.8 + release (преместен, същата дума) |
| HARD-012 | — (вердикт-докладът, роден 2026-09-13) | 0.2.5 |
| HARD-013 | — (bash по голо име, роден 2026-09-15) | 0.2.7 (ЗАМРАЗЕН) |
| HARD-014 | — ОТПАДНАЛ (2026-09-16; темата „одитор с resume" — след консолидацията) | — |
| HARD-015 | — (двете врати не казват за рендерираната роля, роден 2026-09-21) | 0.2.9 |
| HARD-016 | — (seed-ът печата отменено четене на guard (b), роден 2026-09-21) | 0.2.9 |

## Context (discovery 2026-09-12: 4× Explore/sonnet + claude-code-guide; котви проверявани при диспач)

**Състояние.** 0.2.2 издадена (tag `v0.2.2` @ `0e1c9a3`), дърво чисто на `main`,
`origin/main...main` = `0 2` (два непушнати dev commit-а: `b389b58` proposal, `c11e9f8` PS-EOL
кандидат — пушват се с операторска дума, най-късно с release push-а на 0.2.3), interlock „up
to date … 0.2.2", манифестът носи 6 миграции
(`migrations/index.json:1-7`, последна `0006_git-verb-gate` → 0.2.2), fixture-ът е
`0007_example-bump`. CI: windows/ubuntu блокиращи зелени, macos advisory. Одитната таблица:
reviewer/qa codex `gpt-5.6-sol`/high; plan 2, code 1, docs 1; cap 2.

**PS-001 повърхността (агент 1 + claude-code-guide).**
- `templates/settings.ask-ruleset.json:12-67` — **54** ask правила (преброено с node тази
  сесия), всичките `Bash(...)`; `allow: ["Bash(*)"]` — един запис (`:8-10`); коментарът на `:4`
  мотивира отказа на blanket `git -C`; `_osComment` (`:5`) — рулсетът е ЕДИН OS-неутрален
  superset, инертните форми не струват нищо (същият аргумент носи и огледалата).
- `hooks/hooks.json:23-31` — Gate 4 е на matcher `"Bash"`; **никакъв `PowerShell` matcher**.
- Gate 4 (`scripts/engine/pretooluse-git-verb-guard.js`): команден стринг `commandOf()`
  `:377-381` (`tool_input.command`); verb списъци `GIT_ASK_VERBS :143-147`,
  `EXE_RULE_VERBS :154`; `-C` разпознаване `verbAfterGit() :253-266`; deny за не-writer
  `:409-420`; byte-exact passthrough `shippedRuleMatches() :353-360` +
  `everyGitFormIsRuleMatched() :369-373`; ask fallback `:426-434`; разделители
  `subcommandsOf() :298-314` (`:161-162`).
- **Външен източник — официалната Claude Code документация (permissions.md/hooks.md), четена
  2026-09-12 през claude-code-guide агент; НЕ е в това дърво и Колегата я препроверява срещу
  живите docs при диспач:** `PowerShell(git push:*)` е валидна ask форма със същата `:*`
  семантика; PowerShell командите се разлагат по AST на подкоманди (`;`, `|`, и на PS7+
  `&&`/`||`) и правилото трябва да мачне всяка; hook matcher `"Bash|PowerShell"` е документиран
  ТОЧЕН списък (не regex); payload полето е същото `tool_input.command`. **Двата caveat-а:**
  (а) за PowerShell НЯМА документирано обелване на обвивки/`NAME=value` — третира се като
  отсъстващо; (б) мачването е case-insensitive с alias канонизация. Трети инструмент: `Monitor`
  изпълнява команди ПОД Bash правилата (няма собствен namespace) — не иска отделни правила.
- Selfcheck пиновете, които PS-001 пипа: `GIT_RULE_FORM` regex закован на `^Bash\(`
  (`aiwf-selfcheck.js:725-734`), `formCoverage()` `:739-762` + assertions `:936-965`;
  `'Gate 4 matcher is exactly "Bash"'` `:1471-1472`; `BLANKET_GIT_C_RULE` `:3331` + doctrine
  assertions `:3647-3656`; spike матрицата `run-spikes.mjs:296-416` е само Bash envelope.
- Седемте „second shell tool" honest-limit сайта (грепнато, точно 7): `docs/LOOP.md:212,265`,
  `docs/OPERATOR_PROTOCOL.md:61,77`, `docs/WORKFLOW.md:674`, `skills/loop/SKILL.md:123`,
  `README.md:50`; + същият лимит в `CHANGELOG.md:104` (история, не се пипа) и
  `migrations/0006_git-verb-gate/ops.json:8` (история, не се пипа).
- **READY-004 фактът, който третото лице на PS-001 надценява:** `git -C <path> <verb>` от
  main/Writer през **Bash** ДНЕС пада в ask клона (selfcheck `:816-819` го доказва: „-C … reset
  → ASK", „-C … push → ASK"); от не-writer subagent → deny преди формата (`:884-886`). Тоест
  cross-repo дупката на Bash канала е ЗАТВОРЕНА от 0.2.2; наблюдаваният тих `git -C D:/<чуждо>
  restore` (2026-09-12) е консистентен с втория tool, не с Bash. Остатъкът на READY-004 =
  вторият shell tool (PS-001 го затваря) + доктринното изречение (проза, тук).

**UPD-001 повърхността — четено първолично тази сесия.**
- `planAskRules()` е ЕДНА функция в `generate.mjs:484-502` (export `:484`); `migrate.mjs` я
  импортва (`:86`) и я вика (`:716`). `toAdd = desired − actual − suppressed`
  (`generate.mjs:490`) — **ownership НЕ участва в добавянето**, а `:491` прави добавените
  правила owned. Това опровергава претенцията на кандидата („при `ownedAskRules: []` reconcile
  няма да добави нищо"): липсващо payload правило СЕ добавя и там. Остава за мерене с тест:
  двете реални лица — липсващо правило (добавя се) и присъстващо-но-чуждо (`desired ∩ actual`,
  не в owned — не се пипа, не се притежава, и никой не го казва). Докладът се строи върху
  доказаното.
- Tombstones: `owned − actual` → suppressed (`generate.mjs:488-489`); removals: само owned &
  no-longer-desired (`:492-493`); summary редовете `migrate.mjs:734-741` („foreign rules
  untouched"); CHANGES редът за op-а е гол (`:1124`, `assembleChanges() :1061-1131`); update
  отчетът към оператора: `aiwf-update.mjs:205,208-209`; skill отчетът:
  `skills/update/SKILL.md:114-120`.
- Тестови домове: `test-update.mjs:642` (секция 5 — ownership без takeover; `:648,657,660`),
  `:328` (секция 2 — пълният ъпгрейд с CHANGES asserts).

**SETUP-001 повърхността (агент 2).** Schema defaults: `plansDir` „docs/backlogs"
(`schema/aiwf.config.schema.json:341`), `overridesDoc` „docs/ai/PROJECT_OVERRIDES.md" (`:347`).
Интервюто: `interview.mjs:189-191` (двата въпроса, секция `-- paths --`); `text()` helper
`:89-97` е мястото за предупреждение. Директориите: `generate.mjs:1191` създава
`active/`/`archive/` само ако липсват — **нула проверка за заварени `PLAN_*.md`**. Skill прозата:
`skills/setup/SKILL.md:83-86`. Тестови домове: `test-setup.mjs:511` (секция 12, defaults
`:533`), `:548` (секция 13), `:481` (секция 10 — pre-existing artifact прецедент).

**GATE-002 повърхността (агент 3).** Двете места на клик-претенцията: `docs/LOOP.md:227-229`
(„No approval token, no state file, no HEAD/content binding") и `docs/WORKFLOW.md:643`; никое не
казва какво покрива кликът при post-commit автоматика. Шаблоните мълчат също
(`templates/CLAUDE.md.tmpl:62-70`, `templates/PROJECT_OVERRIDES.md.tmpl:50-51`).

**READY-001/002/003 повърхността (агент 3).**
- § Plan readiness: `docs/WORKFLOW.md:293-359` (self-pass `:313-323`; цикълът `:324-336`; шестте
  проверки `:348-355`). § Fail aggregation: `:617-621` — забрана без механизъм.
  `docs/REVIEW_CHECKLIST.md:205-211` (същото), `:16-34` (PASS/NEEDS-FIX), `:213-224` (вердикти).
- Мястото на READY-002 механизма: `skills/review/SKILL.md:211-240` (plan-readiness режимът;
  `:234-236` е изречението, което днес НЕ носи „подай листата на предишния пас"); бриф полетата
  `:129-169`; fact-check Step 2b `:174-209`.
- **Selfcheck НЕ пин-ва fail-aggregation текста никъде** (грепнато: нула) — новият контракт иска
  собствен assertion + flipping контрол. Съседните доктринни пинове: `:3389-3392` (self-pass),
  `:3401-3416`, `DOCTRINE_FACTCHECK_SITES :3443-3458`, `DOCTRINE_READING_SKILLS :3326`.
- Петте brief-authoring грешки: `docs/WORKFLOW.md:407-429`; proof-surface: `:447-463`.

**ROLES-001 повърхността (агент 4).** `aiwf-roles.mjs`: `showLines() :551-599` — редовете са
голи `{label,host,model,effort,passes,notes}` без machine-readable ВИД (roles `:555-566`, класове
`:574-587` през `CLASS_LABEL :568`/`CLASS_NOTE :569-573`, fact-check hardcoded `:588`, R1 `:589`,
header `:591`, подравняване `:592-598`). Selfcheck пиновете са ФРАЗОВИ, не snapshot:
`:2618-2632` (header regex + присъствие на редове), `:2634-2642`, `:2643-2653`. Skill-овете:
`mission:52-55` и `roles:125-126` вече казват „verbatim"; **`work:38-41` и `setup:153-160` не
казват** — двата за затягане. (Живият прецедент: сесия на втория консуматор пре-рендира 7 реда
без `fact-check` и `R1`.)

**REF-001 повърхността (агент 3).** Ref правилото живее САМО в `docs/WORKFLOW.md:537-544`
(`ABC-001` — двата примера в docs/skills/templates/README; трето срещане има във fixture
prompt в `aiwf-selfcheck.js:483` — тестов вход, не доктрина, не се пипа) + archive конвенцията
`:506-512` + guard
(b) `:184-196`; огледалото на guard (b) в managed региона: `templates/CLAUDE.md.tmpl:35-38` →
промяната иска `rerender-managed-region CLAUDE.md#aiwf-core`. Gate 2 lookup-ът чете ЦЯЛАТА
`active/` (`pretooluse-dispatch-gate.js:118-122`, филтър `:139`, whole-identifier regex
`:130-136`, цикълът `:137-147`) — насочен lookup е възможен. Selfcheck няма никакво PLAN-naming
покритие (грепнато: нула).

**README-001 повърхността (агент 4 + fact-check корекция).** **14** payload README-та
(`git ls-files` без `dev/`: root, `docs/`, `skills/`, `templates/`, шестте `scripts/*/`,
`migrations/`, `schema/`, `examples/`, `examples/example-project/`) + 11 skill-а; единственият
студен вход е root `README.md:1-17`; § Status `:19-102`, „Eleven commands" `:31` (верен), FAQ
`:215-242`. Всичките извън root-а — insider тон; `docs/OPERATOR_PROTOCOL.md` е единственият,
писан за пръв поглед.

**Release механика (образецът 004/POSIX-002, проверен).** Всяко издание: миграция
`NNNN_<slug>` + манифестен запис + `plugin.json` bump + CHANGELOG блок + fixture rename +
self-install apply + `CHANGES_x-to-y.md` + commit (клик) + tag (дума) + push (дума + диалог) +
CI + consumer proof (relay запис в completion record). `validate-payload` право: последен
манифестен запис == payload версия (`validate-payload.mjs:251-256`), префикс == позиция
(`:231`), op речник `:100-141`. Fixture каскадата: 0.2.3→`0008_example-bump`,
0.2.4→`0009`, 0.2.5→`0010`, 0.2.6→`0011`; сайтове на всяко rename:
директорията, `bump/bump.json:2`, `ops.json:2`, `NOTES.md:1,16,31`,
`examples/example-project/README.md:17,45,78,79`, **и негативният контрол
`aiwf-selfcheck.js:4991`**, който hardcode-ва `'0009_example-bump'` като „нарочно грешен" при
база 0007 — при 0.2.4 (fixture 0009) той би станал ВЕРЕН: контролът се преизчислява при всяко
rename (или става относителен веднъж, в HARD-001).

## Решения (COO; отворените въпроси от PROPOSAL — решени тук)

1. **READY-002 остава в 0.2.5.** Механизмът се прилага ОПЕРАТИВНО от тази сесия нататък във
   всеки readiness/review бриф на самата мисия (вкл. readiness на този план), така че
   издърпването му в 0.2.4 не купува нищо измеримо — payload промяната има значение чак при
   следващ консуматорски план, а и двете издания излизат преди такъв.
2. **0.2.5 и 0.2.6 НЕ се сливат.** Операторски одобреното разпределение е default-ът; всяко
   издание е една миграция + един proof, а слятото би било 7-тикетно издание с двусмислен
   consumer proof. Сливане само по изрична операторска дума.
3. **Миграции:** 0.2.3 РЕАЛНА (`reconcile-ask-ruleset` + note); 0.2.4 и 0.2.5 note-only (по
   образеца `0005_posix-legs` — code/doctrine се доставя с `/plugin update`, манифестният запис
   е заради last==version); 0.2.6 note + `rerender-managed-region CLAUDE.md#aiwf-core` (guard
   (b) текстът в региона се мени от HARD-009; регионът е записан на всяка инсталация — без
   `ifRecorded`). Всяка миграция се авторства в ПЪРВИЯ тикет на изданието заедно с bump +
   fixture rename + self-install apply (образецът AUD-001); по-късен op в същото издание се
   пре-прилага с `--resolve` + resolution файл (образецът AUD-002 §3).
4. **Маршрут: всичко е R2.** HARD-001 не сменя fail-direction на никой гейт (единственото, което
   доктрината вдига до R3) — прецедентът е GATE-001 (нов гейт, R2 code-class). Docs-class са
   само HARD-010 и HARD-011 (нула изпълним артефакт в диффа им).
5. **READY-004 е сгънат в HARD-001 + едно доктринно изречение.** Bash пътят вече пита за всяка
   `-C` форма (доказано, selfcheck `:816-819`); остатъкът е вторият tool (кодът на HARD-001) и
   правилото „сесия не мутира чуждо repo без изрична дума" (проза в WORKFLOW, в диффа на
   HARD-001).
6. **HARD-002 (UPD-001) първо мери, после докладва.** Кодът е четен първолично тази сесия
   (`generate.mjs:490-491`): `toAdd` не гледа ownership и добавеното става owned — претенцията
   на кандидата „ownedAskRules:[] → нищо не се добавя" е опровергана по четене. Тикетът все пак
   започва с тест (production path, не преразказ), покрива и лицето „присъстващо-но-чуждо", и
   докладните редове се пишат по измереното; ръчният пас на втория консуматор се решава по
   доказаното, не по кандидата.
7. **Именуване на самия план (операторска дума 2026-09-13, преди първия одиторски пас):** един
   префикс `HARD`, тикети HARD-001…HARD-011 по изпълнителния ред, файлът `PLAN_HARD.md`;
   заварените кандидатски имена остават втори имена (таблицата под header-а). Планът така
   изпълнява правилото, което HARD-009 внася в payload-а; PLAN_PNP_PUBLIC остава последният
   зоопарк.
8. **Gate 2 получава насочен lookup в HARD-009** — `<ABBR>` от ref-а → първо `PLAN_<ABBR>.md`,
   пълният scan остава fallback за заварени планове; и нов selfcheck assertion за
   `## <REF>` ↔ име на файл, ограничен до планове с име `PLAN_<ABBR>.md` където ABBR мачва
   `^[A-Z]{2,8}$` (заварените PLAN_PNP_HARDENING/PLAN_PNP_PUBLIC не мачат → честно извън
   обхвата на assertion-а, не лъжливо зелени).
9. **Планова дисциплина на самата мисия:** COO self-pass преди платен пас; fact-check с „every
   acceptance command exists and can fail"; пас 2 носи блокер-листата на пас 1 (READY-002
   приложен предварително); дъмп на плана за Одитора през `.aiwf/review-brief.txt`, wrapper във
   фон; двата example цикъла и `test-update` във фон (>600s), без паралелни редакции по време на
   example цикъл; docs commit отделен от кодовия; нула Claude trailers.
10. **Одитна икономика (операторска дума 2026-09-15, до края на този план; измерено на
    Furnissimo PROJ-001):** (а) **evidence pack** на всеки ПЪРВИ code-class review пас —
    1 sonnet агент вади консуматори/съседни договори по диффа (`file:line`), review брифът носи
    пакета + ИЗРИЧНО право и задължение за spot-check (пакетът е селекция от одитираната страна);
    docs-class пасовете — без пакет. (б) **resume верификация** само за верификационен пас след
    кодова корекция: `codex exec resume <session-id> -` (бриф по stdin; постурата през
    `-c sandbox_mode="read-only" -c approval_policy="never" -c model="gpt-5.6-sol"
    -c model_reasoning_effort="high"`; wrapper-ът няма resume — гола CLI инвокация, обявява се в
    completion record-а); session id-то се записва от header-а на студения пас 1 ОЩЕ ТОГАВА.
    Readiness пасовете остават студени. (в) **Гейт затегнат при ограничена квота: И ПАС 1 не се
    диспачва без изрична операторска дума** — операторът първо проверява квотата, после дава
    разрешение за одита; fact-check гейтът (sonnet) върви преди искането на думата.

## 0.2.3 — Security · tag `v0.2.3`

### HARD-001 (PS-001) [R2 code-class] — вторият shell tool: огледални PowerShell правила + Gate 4 на двата matcher-а

**Outcome:** обявената гаранция „всеки гейт е native диалог" е вярна и на Windows консуматор:
целият ask списък и Gate 4 покриват и `PowerShell` tool-а; cross-repo `-C` мутация пита и там;
седемте honest-limit сайта казват новата истина.

**Обхват:**
1. `templates/settings.ask-ruleset.json` — огледално `PowerShell(<X>)` правило за ВСЯКО от 54-те
   `Bash(<X>)` ask правила (1:1, същият ред), + `PowerShell(*)` в `allow` до `Bash(*)` (`:8-10`);
   `_comment` блоковете казват огледалната инварианта (и че superset аргументът от `_osComment`
   я покрива — инертни на POSIX). **Тестът на factory posture-а влиза в обхвата:**
   `test-setup.mjs:234-235` днес assert-ва allow == точно `["Bash(*)"]` — очакването става
   двата blanket allow-а, иначе setup суитът пада по конструкция.
2. Gate 4: `hooks/hooks.json:23-31` matcher → `"Bash|PowerShell"` (документиран точен списък);
   `pretooluse-git-verb-guard.js` чете `tool_name` от payload-а и клони: PS клон със собствени
   разделители (`;`, `|`, `&&`, `||`, нови редове — БЕЗ `&`, което в PS е call operator), БЕЗ
   обелване на обвивки (недокументирано → не се моделира: разпознат глагол извън точна шипната
   форма → ask), case-insensitive нормализация на `git`/`git.exe` токена (PS мачва
   case-insensitive); byte-exact passthrough само срещу формите, които payload-ът реално шипва
   като `PowerShell(...)`; deny клонът за не-writer subagent — идентичен, преди формата.
   Header-ът се дописва (двата tool-а, PS caveat-ите).
3. Selfcheck: `GIT_RULE_FORM`/`formCoverage` (`:725-762`) научават `PowerShell(` формите;
   огледална инварианта ДВУПОСОЧНО — „за всяко Bash ask правило съществува PowerShell огледало
   И за всяко PowerShell ask правило съществува Bash база" + два flipping контрола (махнато
   огледало в копие → FAIL; добавено сираче `PowerShell(...)` без Bash база в копие → FAIL); `'Gate 4 matcher is exactly "Bash"'`
   (`:1471-1472`) → двата tool-а; `BLANKET_GIT_C_RULE` доктрината (`:3331,:3647-3656`) —
   огледално за PowerShell; PS клонове на `sectionGate4()` (deny/ask/passthrough/fail-closed).
   Негативният контрол `:4991` става относителен спрямо текущия fixture номер (виж Context —
   иначе гние на всяко rename).
4. Spikes: `powershellEnvelope()` до `bashEnvelope()` (`run-spikes.mjs:296-305`) + PS матрица по
   образеца на `gate4Cases` (`:323-416`): bare verb, `;`-compound, pipeline, `&&` (PS7),
   call operator `& git push`, case варианти (`GIT Push`), `-C <path>` форми, не-writer deny,
   не-git passthrough, празен/малформен stdin deny.
5. Доктрина и диагностика — ПЪЛЕН sweep на Bash-only претенциите, не само седемте маркирани
   сайта. Седемте „second shell tool" сайта (`docs/LOOP.md:212,265`,
   `docs/OPERATOR_PROTOCOL.md:61,77`, `docs/WORKFLOW.md:674`, `skills/loop/SKILL.md:123`,
   `README.md:50`) пренаписани честно: двата shell tool-а покрити; остатъкът е „инструмент,
   който нито слой вижда" като клас (Monitor е документирано ПОД Bash правилата — казва се).
   Плюс останалите Bash-only повърхности (пас-1 инвентар): `README.md:43`,
   `docs/WORKFLOW.md:33,662,707`, `docs/LOOP.md:145`, `scripts/engine/aiwf-lib.js:13`,
   `scripts/engine/pretooluse-mutation-guard.js:4,55` — и **runtime диагностиката на Gate 4**:
   „Blocked Bash command" (`pretooluse-git-verb-guard.js:391,414`) назовава РЕАЛНИЯ tool от
   payload-а; spike/selfcheck assertion: deny/ask през PowerShell payload носи „PowerShell" в
   текста си (flipping контрол). Финалният sweep: `git grep -niE "bash-only|only the bash
   tool|second shell tool" -- docs skills templates scripts README.md` → нула останали неверни
   претенции (всяко останало съвпадение е новата честна формулировка — показва се поименно в
   handback-а).
   READY-004 изречението — в `docs/WORKFLOW.md` § Branch policy, краят на секцията (мястото
   фиксирано тук; НЕ в § Operator-interaction guards, чийто брой „Five rules" е пин-нат в
   собственото му въведение): сесия не изпълнява мутираща git/filesystem операция срещу repo
   извън project root-а без изрична операторска дума за точно нея; `-C` формите питат по
   конструкция на двата tool-а.
6. Миграция `migrations/0007_powershell-ask-ruleset/` (`reconcile-ask-ruleset` op + `note` op с
   docRefs CHANGELOG/LOOP) + 7-и манифестен запис 0.2.3 + `plugin.json` 0.2.3 + CHANGELOG блок
   `## [0.2.3]` (§ Added: PowerShell mirror rules + Gate 4 second tool; § Security изречението)
   + fixture → `0008_example-bump` (всички сайтове от Context) + self-install `--check`
   (exit 1 pending) → `--dry-run` → `--apply` (reconcile добавя 54-те огледала тук; брой
   диалози се записва) + `CHANGES_0.2.2-to-0.2.3.md`.
   **Операционна бележка (от Furnissimo, платена):** редакцията на consumer `settings.json`
   иска auto mode ИЗКЛЮЧЕН при apply.

**Извън обхват:** HARD-002 отчетът (следващият тикет); поведението на трети инструменти отвъд
прозата; RENAME-001; adversary-proof shell семантика (N4-R остава в сила); трите codex `.ps1`
EOL дрейфа (PS-EOL е кандидат, не тук — не се комитват).
**Acceptance (буквално, Windows канал, cwd = repo root):**
- `node -e "const r=require('./templates/settings.ask-ruleset.json');const a=r.permissions.ask;const b=a.filter(x=>x.startsWith('Bash('));const p=a.filter(x=>x.startsWith('PowerShell('));const miss=b.map(x=>'PowerShell('+x.slice(5)).filter(x=>!p.includes(x));if(b.length!==54||miss.length){console.error(b.length,miss);process.exit(1)}"`
  → exit 0 (54 Bash базови, нула липсващи огледала); обратната посока, литерално:
- `node -e "const r=require('./templates/settings.ask-ruleset.json');const a=r.permissions.ask;const b=new Set(a.filter(x=>x.startsWith('Bash(')));const orph=a.filter(x=>x.startsWith('PowerShell(')).map(x=>'Bash('+x.slice(11)).filter(x=>!b.has(x));if(orph.length){console.error(orph);process.exit(1)}"`
  → exit 0 (нула PowerShell сирачета без Bash база).
- `node -e "process.exit(require('./templates/settings.ask-ruleset.json').permissions.allow.includes('PowerShell(*)')?0:1)"`
  → exit 0.
- `git grep -F -n "\"matcher\": \"Bash|PowerShell\"" -- hooks/hooks.json` → 1 hit (`-F`:
  `|` е литерален).
- `git grep -n "second shell tool" -- docs skills templates README.md` → празно, exit 1.
- `node scripts/spike/run-spikes.mjs` → exit 0, таблицата носи PS редовете; selfcheck → exit 0.
- `node scripts/update/validate-payload.mjs --plugin-root .` → exit 0, `7 migration(s)`.
- `node scripts/update/aiwf-update.mjs --check --project-root .` → exit 0, „up to date … 0.2.3".
- `git grep -n "0007_example-bump" -- . ":(exclude)dev" ":(exclude)CHANGELOG.md"` → празно, exit 1.
- Осемте VERIFY → exit 0; Cyrillic grep по payload пътищата → празно, exit 1.
**Risk threshold:** блокира промяна на fail-direction на който и да е гейт; клон, в който
не-writer subagent с разпознат глагол получава allow на КОЙТО И ДА Е от двата tool-а; нов диалог
по днешната bare Bash форма; отслабване на N4-R записа; всеки VERIFY ≠ 0.
**Stop condition:** VERIFY + acceptance зелени → Одиторът спира.
**Review:** `Class: code` → Codex (`gpt-5.6-sol`/high), fact-check преди; cap 2.
**Assignee:** Колега. Branch `main`. Котва при диспач: в брифа.

#### HARD-001 — Completion record (2026-09-13)

**Commit `5fe0bb4f2406bb420e4695f13e28b790c9805acc`** върху котвата `1a4e117` (branch `main`,
локален, непушнат): 26 файла, 1064+/200− (`git show --stat 5fe0bb4`); едноредово съобщение, нула
trailers (`git log -1 --format=%b` празно); PLAN файлът и `dev/`/`.aiwf/` извън commit-а; трите
codex `.ps1` не дрейфнаха тази сесия (нула в `git status`). Изпълнено по обхвата §1–6: 54-те
`PowerShell(<X>)` огледала + `PowerShell(*)` в allow; Gate 4 на matcher `"Bash|PowerShell"` с
DIALECTS таблица (PS: `;`/`|`/`&&`/`||`, `&` е call operator, нула обелване, case-fold само в
разпознаването; непознат tool → по-строгия диалект); диагностиката именува реалния tool;
selfcheck: per-tool coverage ×2 + двупосочна огледална инварианта с два flipping контрола +
16 PS hook реда с Bash контроли + 6 dialect пина + относителен `example-bump-id` контрол; spikes
+34 PS реда (318 checks); пълният доктринен sweep (7-те сайта + pass-1 инвентарът + 4 открити в
полет); READY-004 изречението в § Branch policy; миграция `0007_powershell-ask-ruleset`
(reconcile + note), bump 0.2.3, fixture → `0008_example-bump`, self-install apply (+54,
ownedAskRules 54→108, 0 диалога), `CHANGES_0.2.2-to-0.2.3.md`.

**Отклонения (приети от COO):** (1) case-fold само в разпознаването, никога в rule теста —
passthrough не стъпва на ненаблюдавана канонизация; (2) непознат `tool_name` → PS диалектът
(по-строгият по всяка ос); (3) 4 sweep сайта отвъд pass-1 инвентара; (4) две
fixture-precondition тестови очаквания станаха derived с non-vacuous гард (`<projectRoot>`
броят per tool; `changeRuleset` мести двойката); (5) нула Claude trailers въпреки harness
reminder-а — проектното правило печели, обявено, не мълчаливо.

**Ревю:** fact-check над диффа (Explore/sonnet) — 0 находки, вкл. независим пълен VERIFY рън.
Codex `gpt-5.6-sol`/high, `Class: code`: пас 1 **`pass-with-notes`, нула блокери** — първият
тикет от раждането на loop-а с чист първи пас. Четирите бележки: 3 текстови (LOOP.md:196
matcher-ът; selfcheck банер/COVERAGE проза; `[0.2.3]` link ref) взети в микро-рунд преди
commit-а и проверени първолично от COO + бързото трио; 4-тата (R100 стейджнати rename-ове) —
без действие. Корекционната делта е само проза → втори пас не се дължи по правилото.

**Верификация (точни кодове):** Колегата 8/8 exit 0 И независим COO-диспачнат рън 8/8 exit 0
(validate-payload „7 migration(s) … 0.2.3"; test-setup 316/0; test-update 468/0; example cycles
2×44/0; spikes 318/0; plugin validate ✔; `aiwf-update --check` „up to date … 0.2.3"); acceptance
командите — буквално, вкл. двете mirror one-liner-а и празните grep-ове (exit 1). **Selfcheck на
финалното дърво: 975/975** (3 последователни рънa, детерминистично; независимият междинен рън
отчете 978 — разликата е NOTE-деградации, зависими от среда/fixture: 24 NOTE реда тук, част от
тях само защото reviewer/qa са codex-hosted и Windows chmod е advisory — записано, не гонено).

**Инцидент (средата, не тикетът):** D: удари 0 байта свободни по средата (един Edit умря с
ENOSPC, нула частичен запис); възстанови се; операторът освободи до 1.8 GB. Пробният
`spacetest.bin` изтрит с операторска дума. Останал дълг: няма. Tag `v0.2.3`/push/consumer proof
се возят в HARD-002 по плана.

### HARD-002 (UPD-001) [R2 code-class] — ъпдейтът казва какво НЕ е добавил; release 0.2.3

**Outcome:** `/pnp:update` не оставя оператора да мисли, че е покрит, когато не е: отчетът и
CHANGES файлът назовават payload правилата, които този проект няма да получи автоматично и защо;
реалната семантика на `planAskRules` е доказана с тест, не преразказана. 0.2.3 е издадена.

**Обхват:**
1. **Пръв тест, после продукт:** тест в `test-update.mjs` (дом: секция 5, `:642`) с fixture
   `ownedAskRules: []` и payload правило, липсващо от `actual` — заковава дали `toAdd` го добавя
   (по кода на `migrate.mjs:490` — да). Двете разклонения се покриват: липсващо → какво става;
   присъстващо-но-чуждо (`desired ∩ actual`, не в owned) → не се пипа и не се притежава
   (`:648,657,660` е прецедентът).
2. `planAskRules()` (`generate.mjs:484-502` — единственият дом) връща и
   `presentForeign = desired ∩ actual − owned` (и каквото тестът от т.1 покаже за още
   недокладвано състояние); `reconcile-ask-ruleset` summary-то (`migrate.mjs:734-741`) добавя
   частта „N payload rule(s) present but not owned here - hand-edited, the engine will never
   touch them"; `assembleChanges()` (`:1061-1131`, редът `:1124`) изписва списъка поименно в
   CHANGES; `skills/update/SKILL.md:114-120` — отчетният контракт получава реда.
3. CHANGELOG `[0.2.3]` допълнен (§ Added: update отчита неприбраните правила); NOTES.md на
   `0007_powershell-ask-ruleset` — изречението за консуматор с ръчни правила.
4. **Release 0.2.3 (тук, след ревюто):** tag `v0.2.3` (дума) → push main + tag (дума + диалог)
   → CI (двата блокиращи leg-а) → consumer proof: `/plugin update` + `/pnp:update` на
   консуматор (relay в completion record-а; очаквано по кода: 54-те огледала се ДОБАВЯТ навсякъде,
   където липсват от `actual` — вкл. при `ownedAskRules:[]`) + проверка на втория консуматор по
   доказаното от т.1: какво reconcile е добавил там и какво стои „present but not owned" —
   операторска стъпка, записва се измереното.
**Извън обхват:** нова op семантика (добавяне/махане на правила остава каквото е); интервю
въпроси; какъвто и да е друг отчетен канал.
**Acceptance (буквално):**
- Новите тестове в `test-update.mjs` → suite exit 0 с вдигнат брой checks (числото се записва).
- Фикстурният рън печата „present but not owned" реда с точния брой; flipping: fixture без
  чужди правила → редът отсъства.
- `git grep -n "present but not owned" -- scripts/update` → ≥1 hit; VERIFY 8/8 exit 0;
  Cyrillic grep празно.
- След release стъпките: `git ls-remote --tags origin v0.2.3` → hash-ът на кодовия commit;
  `git rev-list --left-right --count origin/main...main` → `0 0`.
**Risk threshold:** блокира промяна на add/remove/tombstone СЕМАНТИКАТА (тикетът само докладва);
отчетен ред, който не идва от измерено множество; всеки VERIFY ≠ 0.
**Stop condition:** VERIFY + acceptance зелени → стоп.
**Review:** `Class: code` → Codex, fact-check преди; cap 2. **Assignee:** Колега. Branch `main`.

#### HARD-002 — Completion record, кодовата половина (2026-09-13)

**Commit `240337d7d9e43aabdab11074ded571337a002cf2`** върху котвата `1514e65` (branch `main`,
локален, непушнат): 6 файла, 239+/5− (`git show --stat 240337d`); едноредово съобщение, нула
trailers (`git log -1 --format=%b` празно); дърво чисто след commit-а. Изпълнено по обхвата
§1–3: `planAskRules` връща адитивно `presentForeign = (desired ∩ actual) − owned` в payload ред
(инвариантно през reconcile-а — аргументът в header-а на `generate.mjs`); reconcile summary-то
носи „N payload rule(s) present but not owned here…" само при N > 0; `assembleChanges` ги
изписва поименно през `measureForeignAskRules()` — мери от ФИНАЛНОТО състояние (не акумулатор;
нечетимост → `ctx.warn`, никога тихо „няма чужди"); skill отчетният контракт носи реда;
CHANGELOG `[0.2.3]` § Added + NOTES.md двете последствия за ръчни списъци. Без миграция/bump —
вози се в 0.2.3.

**Доказаното от тестовете (три fixture-а на реалния entrypoint, update suite 468 → 490):**
кандидатската претенция „ownedAskRules:[] → reconcile не добавя нищо" е ОПРОВЕРГАНА — липсващо
правило се добавя независимо от ownership и engine-ът притежава точно каквото е вкарал (3 от 3);
ръчно махнато никога-owned правило се ВРЪЩА (tombstone пази само owned премахване); present-
but-not-owned е инертно (не пипнато/не осиновено/не tombstone-нато) и вече се докладва с брой +
поименно в CHANGES (105 измерени в wiped-ownership fixture-а, в payload ред); flipping: без
чужди правила редът отсъства, не е „0". Следствие за втория консуматор: `/pnp:update` ще добави
всяко липсващо огледало и там; каквото е имал в точното payload изписване, излиза поименно в
CHANGES и остава негово за поддръжка.

**Отклонения (приети от COO):** (1) „днес не се докладва" assertion-ът в позитивната си
пост-тикетна форма + flipping за отсъствие; (2) `presentForeign: []` в setup fallback литерала
(shape-only); (3) CHANGES списъкът нарочно без cap — имената са стойността; (4) измереният брой
се печата като PASS detail на един check.

**Ревю:** fact-check над диффа — 1 находка (NOTES.md изречение, обещаващо защита за never-owned
ръчни премахвания, каквато формулата не дава) → микро-рунд, изречението поправено. Codex
`gpt-5.6-sol`/high, `Class: code`: пас 1 **`pass`, нула находки** — втори пореден чист първи
пас.

**Верификация (точни кодове):** пълни 8/8 exit 0 на финалното дърво — validate-payload
„7 migration(s) … 0.2.3"; test-setup 316/0; **test-update 490/0** (+22); example cycles 2×44/0;
selfcheck 975/975; spikes 318/0; plugin validate ✔; acceptance grep-овете точно по плана
(„present but not owned" 10 hits в scripts/update; Cyrillic празно exit 1). Записана
out-of-scope находка (не пипната): след crash-resume загубеният ownership delta законно ще
издуе „present but not owned" броя — консистентно с warn-а на engine-а;
`run-example-cycle.mjs:584` не следи новата част (update suite я покрива).

**Release 0.2.3 — изпълнено (2026-09-13):** tag `v0.2.3` @ `240337d` (дума) + `git push origin
main` (`6fd2512..f3c4cac`, 7 commit-а) + push на тага (думи + диалози); `git ls-remote --tags
origin v0.2.3` → `240337d…`; `origin/main...main` = `0 0`. **Consumer proof (Furnissimo, relay):**
`/plugin marketplace update` (само вдига плъгина — измерено още 2026-09-13) → `/reload-plugins` →
`/pnp:update` 0.2.2 → 0.2.3: apply exit 0, **+54 PowerShell огледала, 0 конфликта, 0 диалога,
selfcheck там PASS 979/979**; CHANGES файлът именува **точно 54-те „present but not owned" Bash
правила поименно в payload ред, вкл. трите рендирани `git -C D:\Furnissimo` форми** — setup и
update рендерът на `<projectRoot>` съвпадат на реален консуматор. Ръчен пас НЕ потрябва —
огледалата влязоха автоматично (доказаното от HARD-002 т.1, на терен). Онзи apply не беше
комитнат и е бил дискарднат; финалният consumer proof мина на 2026-09-14 като 0.2.2 → 0.2.4 с
един update (виж HARD-004 record-а) — commit там `2a7dbb83`. **CI run 34762983709: windows ✔ + ubuntu ✔ (двата блокиращи,
~17m), macos advisory-red на update суита** (известният проследен дефект; run-ът общо success —
`continue-on-error` държи).

## 0.2.4 — Correctness на реален консуматор · tag `v0.2.4`

### HARD-003 (SETUP-001) [R2 code-class] — setup вижда заварения `<plansDir>/active/`

**Outcome:** инсталация в заварен проект не осиновява тихо чужда планова директория: интервюто
предупреждава на самия въпрос, а dry-run-ът/планът го казва още веднъж; операторът решава с
пълна информация, схемата не се пипа.

**Обхват:**
1. `interview.mjs:189-191`: преди/при въпроса за `paths.plansDir` — проверка на кандидат-пътя
   (default-ът и въведеното): съществуващ `<path>/active/` с `PLAN_*.md` файлове → предупредителен
   ред на място („N съществуващи PLAN_*.md в <path>/active/ — Gate 2 off-plan ще ги чете като
   активни pnp планове; друг път, ако не са такива") + повторение на проверката върху финалния
   отговор. Същата проверка за `paths.overridesDoc` — съществуващ файл, който setup НЕ би
   написал → казва се (документът се сийдва само веднъж).
2. `generate.mjs` (план фазата, около `:1191` и dry-run отчета `:1368-1393`): непразен заварен
   `active/` влиза в плана/отчета като предупредителен ред (не блокер — операторът може да го
   иска нарочно).
3. `skills/setup/SKILL.md:83-86` — прозата казва и предупреждението, и защо има значение
   (Gate 2 off-plan семантиката).
4. Тестове: `test-setup.mjs` — нова секция до 12/13 (`:511,:548`): fixture със заварени
   `PLAN_*.md` → предупреждението присъства в изхода на интервюто И в dry-run отчета; чист
   fixture → отсъства (flipping); default-ите непроменени (`:533` остава верен).
5. Миграция `migrations/0008_consumer-correctness/` (note-only) + 8-и запис 0.2.4 +
   `plugin.json` 0.2.4 + CHANGELOG `## [0.2.4]` + fixture → `0009_example-bump` (вкл.
   преизчисленият негативен контрол, ако HARD-001 не го е направил относителен) + self-install
   apply + `CHANGES_0.2.3-to-0.2.4.md`.
**Извън обхват:** промяна на schema default-ите (`:341,:347` остават); блокиране на
инсталацията; ре-интервю на инсталирани проекти.
**Acceptance (буквално):**
- Новата test-setup секция → suite exit 0 (брой checks записан); предупреждението — точният
  стринг, показан от двата пътя (интервю + dry-run), с flipping контрол.
- `git grep -n "PLAN_" -- skills/setup/SKILL.md` → носи предупредителния ред.
- `validate-payload` → `8 migration(s)`; `aiwf-update --check` → „up to date … 0.2.4";
  старият fixture id grep → празно; VERIFY 8/8; Cyrillic grep празно.
**Risk threshold:** блокира схема промяна, блокираща инсталация semantics, пипане на Gate 2.
**Stop condition:** VERIFY + acceptance зелени → стоп.
**Review:** `Class: code` → Codex, fact-check преди; cap 2. **Assignee:** Колега. Branch `main`.

#### HARD-003 — Completion record (2026-09-13)

**Commit `d137f87d1bf577c1c70fbc41300a571df48b6558`** върху котвата `c0cd8b7` (branch `main`,
локален, непушнат): 15 файла, 336+/54− (`git show --stat d137f87`); едноредово съобщение, нула
trailers; дърво чисто; двата fixture rename-а записани като rename. Изпълнено по обхвата §1–5:
`existingPlansWarning`/`existingOverridesWarning` — споделени exported helper-и (предикатът
byte-for-byte този на Gate 2, fact-check потвърдено срещу кода); интервюто предупреждава на
default-а И на отговора (без повторение; `runInterview` с `projectRoot` + инжектируем `out` —
предупреждението е тестваемо на production пътя); генераторът повтаря plans реда като note в
плана/отчета (покрива `--dry-run` и `--answers-file`); skill прозата с Gate 2 обосновката; тест
секция 12b (12 checks: брои 2 от 4 decoy-а — точно Gate 2 множеството; двата пътя; dry-run пише
нула; clean flipping контрол); release 0.2.4 отворен: миграция `0008_consumer-correctness`
(note-only), 8-и манифестен запис, `plugin.json` 0.2.4, fixture → `0009_example-bump`
(относителният selfcheck контрол от HARD-001 не поиска пипане — точно за каквото беше направен),
self-install apply (1 note, 0 диалога), `CHANGES_0.2.3-to-0.2.4.md`.

**Отклонения (приети от COO):** (1) инжектируем `out` на `runInterview` (иначе тестът мери
огледална логика); (2) секция `12b`, не преномериране (прецедент 6b); (3) scripted ask вдигнат
на module scope, секция 12 байт-идентична; (4) генераторът повтаря само plans предупреждението —
overrides note-ът вече съществува там и не се дублира; (5) нула пипнати съществуващи assertions.

**Ревю:** fact-check над диффа — 0 находки (вкл. предикатът срещу dispatch-gate кода и „six
times" срещу git историята; setup suite независимо ре-рънната 328/0). Codex `gpt-5.6-sol`/high,
`Class: code`: пас 1 **`pass`, нула находки** — трети пореден чист първи пас.

**Верификация (точни кодове):** пълни 8/8 exit 0 — validate-payload „8 migration(s) … 0.2.4";
**test-setup 328/0** (+12, секция 12b); test-update 490/0; example cycles 2×44/0; selfcheck
975/975; spikes 318/0; plugin validate ✔; `aiwf-update --check` „up to date … 0.2.4"; acceptance
grep-овете точно по плана (стар fixture id празно; Cyrillic празно, exit 1).

**Записани out-of-scope находки (не пипнати):** (а) ре-интервю на инсталиран проект винаги ще
види plans предупреждението (default-ът е собствената му plansDir) — изречението остава вярно
(условната клауза), потискане би скрило реда точно при смяна на пътя; (б) `assembleChanges`
печата безусловно изречение за рендирани артефакти, невярно за note-only release
(`CHANGES_0.2.3-to-0.2.4.md:6`, заварено). Останал дълг: няма. Release опашката на 0.2.4 (tag,
push, consumer proof) — в HARD-004 по плана.

### HARD-004 (GATE-002) [R2 code-class] — честният лимит на commit клика; release 0.2.4

**Outcome:** доктрината казва точно какво одобрява кликът (извикването, не крайното съдържание,
когато проектът носи post-commit автоматика), а selfcheck-ът показва като `[NOTE]` проект с
hook, който пише файлове. 0.2.4 е издадена.

**Обхват:**
1. Едно изречение на двете места на претенцията: `docs/LOOP.md:227-229` и
   `docs/WORKFLOW.md:643` — кликът одобрява ТОВА извикване; проект с post-commit/pre-commit
   автоматика, която amend-ва или дописва, разминава одобрено и легнало, и всеки guard от вида
   „тикетът пипна точно тези файлове" (вкл. петата brief-authoring грешка, `:407-429`) става
   грешен по конструкция — измерено на реален консуматор. Огледално изречение в
   `templates/CLAUDE.md.tmpl:62-70` НЕ влиза (региона го пипа HARD-009 в 0.2.6 — едно
   пре-прилагане, не две; отбелязва се в NOTES).
2. Selfcheck `[NOTE]` (не FAIL — такъв hook е легитимен): проверка на project fixture-а за
   изпълним не-sample `.git/hooks/pre-commit`/`post-commit` и за `core.hooksPath` → `[NOTE]` с
   изречението от т.1; негативен контрол (fixture без hook-ове → нула NOTE).
3. CHANGELOG `[0.2.4]` допълнен (§ Added: honest limit + selfcheck note).
4. **Release 0.2.4:** tag `v0.2.4` (дума) → push (дума + диалог) → CI → consumer proof
   (`/plugin update` + `/pnp:update`, relay).
**Извън обхват:** каквото и да е обвързване на клика със съдържание (token/state — отказано по
дизайн); блокиране на проекти с hook-ове; шаблонният регион (HARD-009).
**Acceptance (буквално):**
- `git grep -n "approves the invocation" -- docs/LOOP.md docs/WORKFLOW.md` → по 1 hit във всеки
  (или еквивалентната финална формулировка — двата сайта, показани поименно).
- Selfcheck на fixture с инжектиран post-commit hook → `[NOTE]` редът; без → липсва; exit 0 в
  двата случая.
- `validate-payload` → `8 migration(s)`; VERIFY 8/8; Cyrillic grep празно; след release:
  `git ls-remote --tags origin v0.2.4` → hash; `origin/main...main` → `0 0`.
**Risk threshold:** блокира FAIL вместо NOTE; всяка промяна на commit механиката.
**Stop condition:** VERIFY + acceptance зелени → стоп.
**Review:** `Class: code` (selfcheck е код) → Codex, fact-check преди; cap 2.
**Assignee:** Колега. Branch `main`.

#### HARD-004 — Completion record (2026-09-14)

**Commit `8ab2af0fa57c73b368172b22c4040e7087287c59`** върху котвата `6152c7d` (branch `main`,
локален, непушнат): 4 файла, 550+/2− (`git show --stat 8ab2af0`); едноредово съобщение, нула
trailers; дърво чисто. Изпълнено по обхвата §1–4: честният лимит „the click approves the
invocation, not the final tree content" на двата сайта (`docs/LOOP.md:246`,
`docs/WORKFLOW.md:656`, по 1 hit точно); selfcheck секция COMMIT AUTOMATION — `[NOTE]`-клас
`observation()` канал (никога FAIL; отделен от `note()`, за да не лъже „not exercised");
детекторът: commondir резолюция за linked worktree, gitfile за submodule, hooksPath като
ефективна стойност (character-wise парсер: коментари навсякъде извън кавички, четирите escape-а,
continuation, последна стойност печели, точна секция, плоски include-и с дълбочина 3,
`config.worktree` слой, `~/` през homedir), `.sample` изключени, win32 честност; заявени
non-claims: `includeIf`, `~user/`, `extensions.worktreeConfig` не се чете, „какво ПРАВИ hook-ът"
не се твърди. CHANGELOG `[0.2.4]` допълнен. Без нова миграция/bump (0008 легна в HARD-003).

**Ревю (пълна история):** fact-check над диффа — 0 находки. Codex `gpt-5.6-sol`/high, `Class:
code`: пас 1 `fail` (2 блокера P2, един клас — git-dir/config резолюцията: worktree hooks живеят
в commondir; hooksPath парсерът бъркаше subsection/first-wins/includes) → корекционен рунд 1 →
пас 2 `fail` (1 блокер: стойностният парсинг — коментари, escape-и, `~/`; блокер 1 приет, нула
нови, договорът спазен) → корекционен рунд 2 (cap изчерпан). **Пас 3 НЕ е пуснат — операторско
решение (2026-09-14).** На негово място, всичко записано: (а) **диференциален тест срещу ЖИВ
git** — 6/6 MATCH (`git hook run` + `git config --file` върху 6 fixture случая: коментар без
интервал, quoted `\t` — реален TAB байт-идентичен, continuation, subsection decoy + last-wins,
include, `~/`); (б) делта fact-check ×2 (рунд 1 и рунд 2) — 0 находки, selfcheck 993/993
независимо потвърден; (в) първоличен COO прочит на парсера. Страничен жив резултат: Gate 4
ДЕНАЙНА `git config` на диференциалния субагент — deny клонът, доказан в production употреба.

**Процесен инцидент (записан честно):** пас 2 беше диспачнат на доктринния default („кодова
корекция → верификационен пас на стоящата дума") БЕЗ изрична операторска дума — операторът
отхвърли това четене; действащото правило оттук: **пас 1 е в думата за тикета; всеки следващ
пас — изрична дума, всеки поотделно**; „прецедентна" аргументация не е договор. Доктрналният
default подлежи на корекция с тикет (виси за операторско решение).

**Верификация (точни кодове):** закриващи пълни 8/8 exit 0 — validate-payload „8 migration(s) …
0.2.4"; test-setup 328/0; test-update 490/0; example cycles 2×44/0; **selfcheck 993/993** (991
на hooked fixture с `[NOTE]` реда; sabotage flip-proof: 6/7 нови проверки падат при revert в
копие, седмата е с обратна посока); spikes 318/0; plugin validate ✔. Записан остатък (COO
прочит, не гонен): конфиг файл с невалидна стойност — git отказва целия файл, детекторът
продължава да сканира; приближение в NOTE-клас, недостижимо от валиден конфиг. Останал дълг:
няма. **Release 0.2.4 — tag/push изпълнени (2026-09-14, дума „1, после 3"):** tag `v0.2.4` @
`8ab2af0` на remote (`git ls-remote` потвърдено), push `f3c4cac..b5d4b16`,
`origin/main...main` = `0 0`; **CI run 34813275023: windows ✔ (27m) + ubuntu ✔, macos
advisory-red на update суита** (известният дефект; overall success). **Consumer proof (relay
2026-09-14):** 0.2.2 → 0.2.4 през публичния път (`/plugin marketplace update` → `/reload-plugins`
→ `/pnp:update`): 3 операции (0007 reconcile +54 + note; 0008 note), нула конфликти, нула пипнати
чужди правила, **selfcheck там PASS 997/997**, commit там `2a7dbb83`. Двете издания
consumer-доказани с един update.

## 0.2.5 — Review-loop прецизност · tag `v0.2.5`

### HARD-005 (READY-002) [R2 code-class] — fail aggregation става инструментиран договор (котвата, 9/9 доказано)

**Outcome:** пас N+1 в plan-readiness НОСИ блокер-листата на пас N в брифа си, и всеки нов
блокер декларира произхода си (роден от ревизията / нов факт); блокер без декларация е нарушение
на договора, докладвано отделно. Договорът е в скилa, в доктрината и под selfcheck пин.

**Обхват:**
1. `skills/review/SKILL.md:211-240` (plan-readiness режимът, изречението на `:234-236`):
   брифът на пас N+1 задължително носи (а) пълната блокер-листа на пас N дословно, (б)
   инструкцията към Одитора. Договорната фраза, ЕДНА и съща на трите сайта (литерална, за
   grep-а): "the pass N+1 brief carries pass N's blocker list verbatim, and every NEW blocker
   declares why it was not visible on the previous pass - a blocker with no declaration is a
   contract violation, reported separately from the verdict". Двете доказани истории (9/9 на
   консуматора; GATE-001 петият блокер въпреки забраната) мотивират защо е ПОДАВАНЕ на
   листата, не забрана — влизат в прозата съкратено.
2. `docs/WORKFLOW.md:617-621` § Fail aggregation + `:324-336` (цикълът) — механизмът, не само
   забраната; `docs/REVIEW_CHECKLIST.md:205-211` — редът за Одитора (декларацията е негово
   задължение на пас ≥2).
3. Selfcheck: нов доктринен assertion (до `:3389-3416`) — пин на договорната фраза в трите
   сайта + flipping контрол (днес fail-aggregation няма никакъв пин — грепнато нула). Същият
   механизъм пин-ва и HARD-004 изречението „approves the invocation" на двата му сайта
   (`docs/LOOP.md` § Commit gate, `docs/WORKFLOW.md` § Commit & Push Authority) с контрол —
   записаната дупка от HARD-004 handback-а (изречението няма пин и може да гние тихо).
4. CHANGELOG `[0.2.5]` допълнен. (Release механиката на изданието — миграция 0009, bump,
   fixture → 0010, apply — легна в HARD-012, който отваря 0.2.5.)
**Извън обхват:** имплементационният (`pass/fail`) режим отвъд редa в REVIEW_CHECKLIST (fail
aggregation важи и там, договорът за листата е readiness-специфичен — имплементационните пасове
са 1 по подразбиране); пас броячи/конфигурация.
**Acceptance:** `git grep -L "carries pass N's blocker list verbatim" -- skills/review/SKILL.md
docs/WORKFLOW.md docs/REVIEW_CHECKLIST.md` → празно, exit 1 (трите носят фразата; wrap се
проверява с collapseWs в selfcheck assertion-а, не с grep-а); selfcheck exit 0 с новия
assertion + контрол; `validate-payload` → `9 migration(s)`; `aiwf-update --check` „up to date …
0.2.5"; стар fixture id grep празно; VERIFY 8/8; Cyrillic празно.
**Risk threshold:** блокира отслабване на съществуващ пас договор; нов блокер клас без контрол.
**Stop condition:** VERIFY + acceptance зелени → стоп.
**Review:** `Class: code` (selfcheck код в диффа) → Codex, fact-check преди; cap 2.
**Assignee:** Колега. Branch `main`.

#### HARD-005 — Completion record (2026-09-14)

**Commit `a7f3950ad842a9d44bfb997de82bf225a369844b`** върху котвата `e792583` (branch `main`,
локален, непушнат): 7 файла, 125+/2− (`git show --stat a7f3950`); едноредово съобщение, тяло
празно, нула trailers; дърво чисто след commit-а. Изпълнено по обхвата §1–4: P3 договорната
фраза дословно на ТОЧНО трите сайта (`skills/review/SKILL.md:234-236` в One-invocation bullet-а;
`docs/WORKFLOW.md:651-653` § Fail aggregation — механизмът + двете истории съкратено, +
cross-ref изречение в readiness цикъла `:347-348`; `docs/REVIEW_CHECKLIST.md:215-217` —
одиторската origin duty от пас 2 + missing-list precondition правилото); selfcheck: нов
`DOCTRINE_CONTRACT_SURFACES` (5 пина: P3×3 + „The click approves the invocation, not the final
tree content"×2 — записаната дупка от HARD-004) с per-entry replacement контроли (P3 →
колапс до голата забрана; P4 → „approves the final tree content that lands"), нула колизия с
COMMIT_AUTOMATION_LIMIT (различен стринг, доказано); CHANGELOG `[0.2.5]` § Added допълнен.

**COO scope решения при диспач (вписани):** (1) reviewer шаблонът получи duty параграфа в
readiness секцията си БЕЗ P3 като substring (пин сайтовете остават три) — вози се БЕЗПЛАТНО в
съществуващия 0009 rerender op (`ifRecorded`), без нова миграция; note текстът на op-а обявява и
третата промяна (едно-стрингова редакция). (2) `skills/review/SKILL.md` имплементационният режим
остава голата забрана — договорът за листата е readiness-специфичен по плана (имплементационен
пас N+1 с блокери не съществува по конструкция: fail → корекционен рунд, а code pass 2 идва само
след `pass`); не е дълг, решение по същество.

**Отклонения (приети от COO):** (1) пиновете в нов масив `DOCTRINE_CONTRACT_SURFACES`, не в
PASS_SURFACES — контрактният коментар на PASS_SURFACES щеше да стане неверен; (2) Writer отказа
неверифицируемото „9/9" в payload прозата → „ran to 9 blockers" (наративен клас, прецедентът
10/8/14/11); (3) един `; echo "exit=$?"` рефлекс — самоуловен, заменен със scratchpad runner;
(4) в корекционния рунд Колегата самоинициативно парафразира и P4 от CHANGELOG (същият дефектен
клас като B1) — обявено, прието.

**Ревю (пълна история):** fact-check над диффа — 0 находки (P3 стринг==константата, контролите
non-vacuous, P4 дословно на двата сайта). Codex `gpt-5.6-sol`/high, `Class: code`, пас 1
(изрична дума при ограничена квота): **`fail`, 2 блокера, нула бележки** — и двата прозаична
прецизност: P3 дословно и в CHANGELOG (4-то копие извън пиновете) + note op-ът още „two
things/both" при обявена трета промяна → корекционен рунд 1: CHANGELOG парафразиран (P3 и P4),
note-ът „three things/all three" с изброено трето. Делтата САМО проза → верификационен пас НЕ
се дължи по правилото: делта fact-check (независим, 0 находки — фразови броячи потвърдени:
P3 три сайта + план + константа; P4 два сайта + константа) + първоличен COO прочит на двата
текста — двете записани тук.

**Верификация (точни кодове):** пълни 8/8 exit 0 на дървото преди корекцията — validate-payload
„9 migration(s) … 0.2.5"; test-setup 328/0; test-update 490/0; example cycles 2×44/0;
**selfcheck 1013/1013** (5-те нови контрола „FAIL as required"); spikes 318/0; plugin validate ✔;
след прозаичната корекция — бързото трио + фразовите grep-ове (validate-payload 0, selfcheck
1013/1013, plugin validate 0; P3 CHANGELOG grep 0 hits exit 1; трите -L сайта exit 1).
`aiwf-update --check` „up to date … 0.2.5". Без commit автоматика (selfcheck: нула NOTE) —
одобреното дърво == легналото. Останал дълг: няма.

### HARD-006 (READY-003) [R2 code-class] — интеграционен инвентар преди първата чернова

**Outcome:** § Plan readiness иска: преди първата чернова COO диспачва евтин scan (sonnet),
който за всяка пипната колона/permission/команда/договор вади консуматорите и съседните
договори; черновата ги адресира преди първия платен пас (≈12 от 15-16 дефекта в измерения цикъл
бяха интеграционни, на един grep разстояние).

**Обхват:** `docs/WORKFLOW.md:293-359` (нов параграф в § Plan readiness, до self-pass
`:313-323`) + § COO owns broad scans препратка; `skills/review/SKILL.md` plan-readiness
преамбюлът го споменава като предпоставка на добра чернова; литералната фраза на двата сайта:
"before the first draft, a consumer-inventory scan: for every touched column, permission,
command or contract, the consumers and adjacent contracts, harvested at scan tier"; selfcheck
пин + контрол (по механизма от HARD-005 т.3); CHANGELOG `[0.2.5]` допълнен.
**Извън обхват:** нов скил/инструмент — това е доктрина за съществуващия Explore механизъм.
**Acceptance:** `git grep -L "consumer-inventory scan" -- docs/WORKFLOW.md
skills/review/SKILL.md` → празно, exit 1; selfcheck exit 0 с пина + контрола; VERIFY 8/8;
Cyrillic празно.
**Risk threshold / Stop:** като HARD-005. **Review:** `Class: code` → Codex; cap 2.
**Assignee:** Колега. Branch `main`.

#### HARD-006 — Completion record (2026-09-14)

**Commit `4e6d12ec9cd4488a8df22c7653c2c779ae444de9`** върху котвата `6dfcd2d` (branch `main`,
локален, непушнат): 4 файла, 53+/5− (`git show --stat 4e6d12e`); едноредово съобщение, тяло празно
(`git log -1 --format=%b` празно, проверено с `cat -A` от Колегата и първолично от COO); нула
trailers; дърво чисто след commit-а; PLAN файлът, `dev/` и `.aiwf/` извън commit-а; трите codex
`.ps1` не дрейфнаха тази сесия. Изпълнено по обхвата: новият параграф „The inventory comes before
the draft" в § Plan readiness review (`docs/WORKFLOW.md:325-335`), непосредствено ПРЕДИ COO
self-pass параграфа — редът е инвентар → чернова → self-pass → fact-check → платен пас; нов ПРЪВ
bullet в plan-readiness списъка на `/pnp:review` (`skills/review/SKILL.md:219-223`), формулиран
като предпоставка на COO, не като проверка на паса; selfcheck — `DOCTRINE_CONSUMER_INVENTORY` +
`DOCTRINE_CONSUMER_INVENTORY_GENERIC` и два записа в `DOCTRINE_CONTRACT_SURFACES` (генеричният
assertion и генерираните per-entry контроли ги поемат без нова машинария), header-ът „TWO
CONTRACTS" → „THREE" с трети bullet, коментарът на `DOCTRINE_CONTROLS` изравнен; CHANGELOG
`[0.2.5]` § Added. Без миграция/bump/fixture rename — вози се в отвореното 0.2.5.

**COO решения при диспач (вписани):** (1) препратката към § COO owns broad scans стои САМО в новия
параграф — второ споменаване вътре в самата секция би дублирало „Discovery precedes dispatch"; (2)
пиновете влизат в съществуващия `DOCTRINE_CONTRACT_SURFACES`, не в нов масив (прецедентите
HARD-005/HARD-012 родиха нови масиви, защото контрактният коментар щеше да стане неверен — тук той
е поправим с брой + трети bullet, и формата е идентична); (3) мотивиращото изречение остава БЕЗ
брой: планoвото „≈12 от 15-16" не е проверимо от това дърво и не влиза в payload-а (прецедентът е
отказът на „9/9" в HARD-005).

**Отклонения (приети от COO):** (1) Колегата преобърна реда при fact-check фиксовете и изпусна по
една дума на два сайта — самоуловено и поправено в същия рунд, проверено първолично; (2) exit
кодовете на `git grep` проверките са мерени през scratchpad probe скрипт (harness-ът не връща exit
код за `git`) — извън repo-то, диффгардът потвърждава; (3) COO пряка редакция (docs class,
обявена): CHANGELOG изречението „A measured readiness cycle is dominated by integration defects"
генерализираше еднократно измерване в сегашно време → минало време, конкретно, + пренавиване; (4)
нула Claude trailers въпреки harness reminder-а — проектното правило, обявено.

**Ревю (пълна история):** discovery преди брифа — 2 Explore/sonnet агента (selfcheck пин-механизъм;
геометрия на прозата), брифът тръгна с `file:line` worklist. Fact-check над диффа (Explore/sonnet)
— **5 находки, всичките реални**: три грешни цитата на секция („§ Plan readiness" вместо
„§ Plan readiness review" — payload-ската конвенция е пълното име, `docs/WORKFLOW.md:609`), едно
невярно разстояние („two sections away"; реалното е шест `##` заглавия — заменено с назоваване на
секцията, без брой, за да не гние при следващо заглавие) и един измислен цитат (стринг в кавички,
представен като съществуваща доктрина, който не съществува никъде) → микро-рунд към живия Колега,
петте поправени, проверени първолично. Codex `gpt-5.6-sol`/high, `Class: code`, пас 1: **`fail`,
1 блокер, нула бележки.** Блокерът: дословната фраза се среща три пъти в дървото, не два —
третото е `dev/backlogs/active/PLAN_HARD.md:686`.

**COO арбитрация на блокера (нула корекционен рунд, нула промяна по диффа):** това е дефект на
БРИФА, не на тикета — в review брифа бях написал абсолютното „must NOT appear verbatim anywhere
else" вместо „извън двата payload сайта", и Одиторът го прочете буквално и правилно. Редът в плана
е самата спецификация на тикета („литералната фраза на двата сайта: …"), съществува от преди
котвата, `dev/` не е payload, пиновете четат само payload файлове и нито един контрол не става
vacuous. Прецедентът е записан в HARD-005 („фразови броячи — P3 три сайта + план + константа",
прието; реалният блокер там беше четвърто копие в CHANGELOG — тук проверено, няма). Съдържателната
част на паса е чиста и е записана: параграфите описват вярно съществуващия scan механизъм, местенето
е правилно, selfcheck записите са с правилна форма и реалистично отслабване, генерираните контроли
падат както трябва, нула промяна по гейт/вердикт/пас брой/одитна таблица.

**Верификация (точни кодове):** Колегата пълни 8/8 exit 0 — validate-payload „9 migration(s) …
0.2.5"; test-setup 328/0; test-update 490/0; example cycles 2×44/0; **selfcheck 1017/1017** (1013
преди тикета: +2 пина, +2 генерирани контрола, и двата печатат „FAIL as required"); spikes 318/0;
plugin validate ✔. След всяка по-късна редакция (микро-рундът и COO редакцията) — бързото трио
ре-рънато зелено, вкл. независим COO рън: selfcheck 1017/1017, validate-payload „9 migration(s) …
0.2.5", `aiwf-update --check` „up to date … 0.2.5". Acceptance дословно: `-L` grep-ът празен exit 1;
фразата на двата сайта whitespace-collapsed exit 0; нула дословно копие в CHANGELOG exit 0;
Cyrillic grep празен exit 1; диффгардът при котвата exit 0.

**Процесен инцидент (записан честно):** Колегата редактира `CHANGELOG.md` докато двата example
цикъла вървяха → и двата паднаха с „the repository is byte-identical … CHANGELOG.md" (exit 1). Това
е точно предупреждението в брифа, не средови дефект; цикълът и всички останали суити бяха ре-рънати
на замразено дърво и числата горе са от тях. **Записан остатък (не гонен):** одиторската
read-only клетка не може да пуска temp-пишещите суити (`mkdtemp` → EPERM) — очаквано, докладът на
COO рънa е източникът. Останал дълг: няма.

### HARD-007 (READY-001) [R2 code-class] — плановата прецизност: литерални proof-ове, процесен trace, adjacency; release 0.2.5

**Outcome:** трите правила от консуматорския proof са доктрина: (1) verify команда в ПЛАН
документ е литерална и може да падне — proof без изписуема команда е discovery ред, не
acceptance; (2) преди всеки платен readiness пас COO прави сух trace на тикетния ПРОЦЕС срещу
гейтовете (commit/push/QA ред, състояние на дървото) — fact-check хваща факти, не процесни
дефекти; (3) adjacency чеклист в brief контракта (dependency пин → lockfile в worklist-а;
deploy промяна → deployment канонът в scope). 0.2.5 е издадена.

**Обхват:** (1) → `docs/WORKFLOW.md:348-355` (шестте readiness проверки — проверка 5 се
усилва) + § Ticket brief contract „A verify command must be able to fail" (`:447-463`) получава
литералното "this holds for the PLAN document itself: a proof without a writable command is a
discovery row, not acceptance"; (2) → нов параграф в § Plan readiness до self-pass-а
(`:313-323`), литералната фраза: "before every paid readiness pass, a dry process trace of the
ticket's PROCESS against the gates - commit/push/QA order, the state of the tree - because the
fact-check gate catches facts, not process defects"; (3) → шестата brief-authoring грешка в
списъка `:407-429` — adjacency: "an adjacent contract rides with the change it depends on: a
dependency pin pulls the lockfile into the worklist, a deploy change pulls the deployment canon
into scope" (＋ count-neutral проверка: `git grep -n "Five brief-authoring" -- docs` → празно
след смяната); selfcheck пинове + контроли за новите фрази; CHANGELOG `[0.2.5]` допълнен;
**Release 0.2.5:** tag (дума) → push (дума + диалог) → CI → consumer proof (relay).
**Извън обхват:** промяна на пас броя/таблицата; нов гейт код.
**Acceptance:** `git grep -n "Five brief-authoring" -- docs` → празно, exit 1 (списъкът е
шест); `git grep -n "a discovery row, not acceptance" -- docs/WORKFLOW.md` → ≥1 hit;
`git grep -n "dry process trace" -- docs/WORKFLOW.md` → ≥1 hit; `git grep -n "pulls the
lockfile into the worklist" -- docs/WORKFLOW.md` → 1 hit; selfcheck exit 0 с пиновете +
контролите; VERIFY 8/8; Cyrillic празно; след release: `git ls-remote --tags origin v0.2.5` →
hash; `origin/main...main` → `0 0`.
**Risk threshold / Stop:** като HARD-005. **Review:** `Class: code` → Codex; cap 2.
**Assignee:** Колега. Branch `main`.

#### HARD-007 — Completion record, кодовата половина (2026-09-14)

**Commit `5ad3a63009573d3cef03aa332f8f9419c3cbc63d`** върху котвата `1f017bb` (branch `main`,
локален, непушнат): 5 файла, 131+/15− (`git show --stat 5ad3a63`); едноредово съобщение, тяло
празно (`git log -1 --format=%b | cat -A` → един `$`), нула trailers; дърво чисто след commit-а;
PLAN файлът, `dev/` и `.aiwf/` извън commit-а. Изпълнено по обхвата: **(1)** readiness проверка 5
пренаписана — „acceptance criteria are sufficient, and every verification command is literal and
can fail - runnable as written rather than described, with a named output that would mean
'broken'" (`docs/WORKFLOW.md:397-398`), списъкът остава шест и „the six readiness checks" на `:337`
остава вярно; § Proof-surface feasibility bullet-ът получава плановото изречение (`:509-513`);
**(2)** нов параграф в § Plan readiness review (`:347-358`), ТОЧНО след COO self-pass параграфа —
редът е инвентар → чернова → self-pass → процесен trace → платен пас; параграфът изброява кои
гейтове върви trace-ът и защо дефектът е РЕД, а не твърдение; **(3)** „Five" → „Six brief-authoring
failures" (`:451`) + шести bullet (`:474-478`), петте заварени непипнати. Selfcheck: нов масив
`DOCTRINE_PLAN_PRECISION_SURFACES` (три едно-сайтови правила, стандартната 5-полева форма) с
собствен header коментар защо НЕ е в `DOCTRINE_CONTRACT_SURFACES`; един цикъл в
`payloadDoctrineFindings` и един `.map` spread в `DOCTRINE_CONTROLS` по съседния образец, нула
bespoke assertion; `'Five brief-authoring'` добавено в `DOCTRINE_RETIRED_PATTERNS` (18 patterns).
CHANGELOG: bullet за HARD-007 + **пренаписано интро на `[0.2.5]`** (описваше само първия тикет на
изданието). `migrations/0009_readiness-discipline/ops.json` note-ът и `NOTES.md` — доведени до
истина за цялото издание. Без нова миграция/bump/fixture rename.

**COO scope решения при диспач (вписани, извън буквалния плановен обхват):** (1) интрото на
`[0.2.5]` и note текстът на `0009` се коригират ТУК — изданието още не е тагнато и непушнато, а
това е прозата, която всеки консуматор чете при apply; да тръгне с „two live operator corrections"
и „three things the loop DOES" при пет реални промени би било невярно твърдение, изнесено навън;
(2) `'Five brief-authoring'` в retired patterns — механизмът за count-neutrality вече съществува
(`'Four brief-authoring'` от AUD-002) и без новия запис връщане към „Five" минава тихо; (3)
пиновете в НОВ масив, не в `DOCTRINE_CONTRACT_SURFACES` — онзи header изрично е за изречение,
повторено в няколко документа, а тези три са едно-сайтови (прецедентът на HARD-005/012 е същият:
нов масив, когато съществуващият коментар би станал неверен).

**Записана out-of-scope находка (нарочно НЕ пипната):** `CHANGES_0.2.4-to-0.2.5.md:10` още казва
„0.2.5 changes two things the loop DOES" — генериран отчет на реален локален apply рън, който
наистина е отпечатал това; ръчна редакция би фалшифицирала изход на рън, а консуматорът генерира
своя от коригирания `ops.json`. Одиторът прегледа решението изрично: „honest provenance, not a
release blocker".

**Отклонения (приети от COO):** (1) шестият bullet е с частичен bold lead (образецът на bullets 3
и 4), за да остане закованата фраза байт-идентична в дадената малка буква; (2) NOTES.md получи
повече от корекцията на броя — същото остаряло твърдение стоеше в таблична клетка и в двуелементен
списък; (3) интрото на CHANGELOG изпусна думата-брой „the two managed artifacts" (броят е верен, но
вторият rerender е условен); (4) exit кодовете на `git grep` проверките пак минаха през scratchpad
probe (harness-ът не връща exit код за `git`); (5) нула Claude trailers въпреки harness reminder-а.

**Ревю (пълна история):** discovery преди брифа — 2 Explore/sonnet агента (жива геометрия на
`docs/WORKFLOW.md`; count sweep + одит на release състоянието), които намериха и двете заварени
неверни твърдения за 0.2.5 и съществуващия count-neutrality механизъм. Fact-check над диффа
(Explore/sonnet, с изричен акцент върху ординали, обратни препратки и release метаданни) —
**0 находки**. COO първоличен прочит на целия дифф + собствен сух процесен trace на остатъка от
тикета (commit клик → tag върху КОДОВИЯ commit → push → CI → consumer proof) — правилото, което
самият тикет въвежда, приложено на него. Codex `gpt-5.6-sol`/high, `Class: code`: пас 1 **`pass`,
нула находки** — „all three rules are executable, correctly placed, and each pinned sentence occurs
exactly once in the payload; both affected lists still contain exactly six items; the controls are
non-vacuous with realistic weakenings; the 0.2.5 release prose, migration operations, ordinals and
back-references are consistent with this tree; no changed line alters gate fail direction, verdict
vocabulary, pass counts, or the audit table". Прие изрично и двете COO решения (новия масив;
непипнатия CHANGES файл). Одиторът записа и една честна граница: sweep-ът на retired patterns има
ЕДИН фиксиран негативен контрол, така че новият запис се вози на него — прието като достатъчно
(контролът доказва посоката на падане, а стрингът мачва точно сценария на връщане на броя).

**Верификация (точни кодове):** пълни 8/8 exit 0, пуснати последователно на замразено дърво (след
инцидента в HARD-006) — validate-payload „9 migration(s) … 0.2.5"; test-setup 328/0; test-update
490/0; example cycles 2×44/0 + „repository byte-identical"; **selfcheck 1023/1023** (1017 преди
тикета: +3 пина, +3 генерирани контрола, всеки печата „FAIL as required"); spikes 318/0; plugin
validate ✔; `aiwf-update --check` „up to date … 0.2.5". Дванадесетте acceptance проверки — с точни
кодове: „Five brief-authoring" в `docs` празно exit 1; „Six brief-authoring" 1 hit; трите фразови
броя по 1; двата node one-liner-а exit 0, доказано fail-capable (обратните посоки върнаха exit 1);
Cyrillic празно exit 1; диффгардът при котвата exit 0. Останал дълг: няма.

#### HARD-007 — Release 0.2.5 (2026-09-15, операторска дума „давай от 1 до 3, 4 съм аз")

**Независим COO рън ПРЕДИ тага (планът го изисква; и самият тикет кодифицира, че редът е дефект
сам по себе си — тагване преди собствена проверка е такъв ред):** 9/9 exit 0 на HEAD `72e8864`,
дървото с ЕДИН И СЪЩ хеш и чисто в двата края на рънa — validate-payload „9 migration(s) … 0.2.5";
test-setup 328/0; test-update 490/0; example cycles 2×44/0 („repository byte-identical");
**selfcheck 1023/1023**; spikes 318/0; plugin validate ✔; `aiwf-update --check` „up to date …
0.2.5"; нула `[FAIL]` реда.

**Процесен инцидент при самата проверка (записан честно, защото касае гейт за таг):** първият
делегиран рън (general-purpose/sonnet) СПРЯ по средата — агентът фонира команда и приключи хода си,
оставяйки собствени суити да текат в дървото; вторият (COO scratchpad runner) беше УБИТ от
системата за недостиг на памет по време на `example-linux`, при това детето му оцеля като осиротял
процес. Нито един частичен отчет не беше приет: рънът беше разделен на две половини (1–4 и 5–9),
всяка с изчакване „нищо друго не тече в дървото" и с печатане на HEAD + `git status` в двата края,
за да е доказуемо, че двете описват едно дърво. Поука за следващи release тикети: пълните 8/8 се
пускат ЕДНА команда наведнъж, не два цикъла успоредно.

**Tag:** `v0.2.5` → `5ad3a63` (кодовия commit на HARD-007, НЕ докс commit-а — образецът на
0.2.3/0.2.4), лек таг като останалите (`git cat-file -t` → `commit`).
**Push:** `git push origin main` (`b5d4b16..72e8864`) + `git push origin v0.2.5`, всяка с
операторска дума и собствен диалог; `git ls-remote --tags origin v0.2.5` → `5ad3a63…`;
`origin/main...main` = `0 0`; дърво чисто.
**CI:** два рънa — `34932042954` (клон `72e8864`) и `34932055005` (таг `5ad3a63`); **и двата
общо `success`, windows ✔ + ubuntu ✔ (блокиращите) и в двата**; macos `failure` в двата, advisory
(`continue-on-error`). Проверено поименно: пада update суита на проверката „the self-check's own
output reached the operator verbatim" — същият leg, същият клас и същият известен проследен дефект
като при 0.2.3 (run 34762983709) и 0.2.4 (run 34813275023); нов сигнал няма.

**Consumer proof: зелен, с числа** (операторски relay, 2026-09-15). Публичният път
`/plugin marketplace update` → `/reload-plugins` → `/pnp:update`, 0.2.4 → 0.2.5, една миграция
`0009_readiness-discipline`, **3 операции, нула конфликта, selfcheck там PASS 1027/1027**:
(1) note op-ът `verdict-report-and-one-word-per-pass`; (2) `CLAUDE.md#aiwf-core` — приложен
БЕЗ диалог, защото регионът не е пипан там (точно проектираното поведение: диалог само върху
редактиран артефакт); (3) `.claude/agents/reviewer.md` — **отчетен като skipped**, защото онзи
Одитор е Codex-hosted и файл изобщо не е рендиран. Третата операция е тази, която пас 1 на HARD-012
роди като блокер B3 и която получи `ifRecorded: true` — конструкцията се доказа на реален
консуматор, а не само в суита. Нула задържани артефакти; отчетът там е
`CHANGES_0.2.4-to-0.2.5.md`. Диффът на консуматора още НЕ е комитнат (минава през неговия
commit gate) — затова тук няма commit хеш оттам, за разлика от записите на 0.2.3/0.2.4.

**Странична измерена находка (за HARD-011):** `/plugin marketplace update` отговори „pnp is already
at the latest version (0.2.5)" — потвърждава измереното на 2026-09-13, че marketplace update сам
вдига инсталирания плъгин и отделната `/plugin update` стъпка е поне отчасти излишна; README-то
трябва да казва каквото живият хост прави.

**Консистентност на selfcheck сумите:** консуматорът отчита +4 спрямо тукашния рън (1027 срещу
1023) — същата разлика като при 0.2.3 (979/975) и 0.2.4 (997/993); стабилен модел, не сигнал.

**С това HARD-007 е затворен изцяло и 0.2.5 е издадена и consumer-доказана.**

### HARD-012 [R2 code-class] — вердиктът на Одитора се докладва по същество (роден 2026-09-13, операторска дума)

**Контекст:** операторска корекция на живо — вердиктите се подминаваха с половин ред по пътя към
следващата стъпка. Правилото трябва да е в payload-а, не в паметта на една сесия: 7 проекта
ползват плъгина.

**Outcome:** доктрината и скиловете изискват: всеки Reviewer/QA вердикт се докладва на оператора
с вердикта + 1–2 изречения по същество (какво потвърди / какви са блокерите или бележките) —
никога голо „pass, продължавам", никога ферман; ПРЕДИ следващата диспач стъпка.

**Обхват:** `skills/review/SKILL.md` (отчетната стъпка след вердикта) + `skills/qa/SKILL.md`
(същото) + `docs/WORKFLOW.md` § How the COO speaks to the operator (нова точка 4, литералната
фраза за grep: "the verdict plus one or two sentences of its substance, before the next
dispatch"); selfcheck пин + flipping контрол по механизма на доктринните фрази; CHANGELOG
`[0.2.5]` § Added. **ПЪРВИ в 0.2.5 (операторска дума 2026-09-14) — отваря изданието и носи
release механиката му:** миграция `migrations/0009_readiness-discipline/` (note op за изданието
+ `rerender-managed-region CLAUDE.md#aiwf-core` за гейт редовете — регионът се прилага директно
с apply-а, без `--resolve`, защото миграцията и промяната са в един тикет), 9-и манифестен
запис 0.2.5, `plugin.json` 0.2.5, fixture → `0010_example-bump` (сайтовете от Context),
self-install apply + `CHANGES_0.2.4-to-0.2.5.md`.

**Втора половина (операторска дума 2026-09-14, роденa от HARD-004 инцидента): доктринният
default за пасовете пада.** Днешното „a second pass above the scan tier after a correction
round that touched code runs on the ticket's standing word" се заменя с: **пас 1 е в думата за
тикета; ВСЕКИ следващ одиторски пас — вкл. верификационният след кодова корекция — се диспачва
само с изрична операторска дума, една дума на пас.** Сайтове: `docs/WORKFLOW.md` § operator
gates (клаузата „the passes the route already prescribes… the second pass above the scan tier…"
се пренаписва) и § Loop shape (правилото „A second pass above the scan tier only when…" става
„a code-touching correction round WARRANTS a verification pass; dispatching it takes the
operator's explicit word — one word per pass"); `templates/CLAUDE.md.tmpl` гейт редовете
(managed регион → миграцията на 0.2.5 получава `rerender-managed-region CLAUDE.md#aiwf-core`
op + self-install re-apply през `--resolve`, механиката на AUD-002 §3); литералната фраза за
grep/пин: "one word per pass"; selfcheck пин + контрол. Прозаичното изключение остава: корекция
само в проза не иска пас (fact-check + COO проверка, както днес).
**COO scope решение при диспач (2026-09-14):** падащият default се пренаписва на ВСЕКИ payload
сайт, който го твърди — не само двата named: + `docs/WORKFLOW.md:328-337` (readiness цикълът),
`docs/REVIEW_CHECKLIST.md:22` (само изречението за standing word — вердиктният формат остава),
`skills/review/SKILL.md:64,107-109,226-228`, `skills/roles/SKILL.md:109`,
`skills/work/SKILL.md:59`, `docs/OPERATOR_PROTOCOL.md:98`, `schema/aiwf.config.schema.json:367`
(само description), `aiwf-roles.ps1:26`/`aiwf-roles.sh:27` (header коментари),
`templates/PROJECT_OVERRIDES.md.tmpl:172` (бъдещи инсталации; заварените overrides документи са
операторски — казва се в NOTES). Причина: иначе `/pnp:review` и одитната доктрина сами
инструктират отмененото правило. Guard (b) сайтовете („a standing word covers the work it was
given for") и историята (CHANGELOG, migration NOTES) НЕ се пипат; таблицata на `--show` остава
байт-идентична. CHANGELOG получава и липсващия `[0.2.4]` link ref покрай новия `[0.2.5]`.

**Извън обхват:** формат на самите вердикти (REVIEW_CHECKLIST — само standing-word изречението
на `:22`, нищо друго); операторският език; ретроактивни промени по вече затворени тикети.
**Acceptance:** `git grep -L "one or two sentences of its substance" -- docs/WORKFLOW.md
skills/review/SKILL.md skills/qa/SKILL.md` → празно, exit 1; `git grep -n "one word per pass"
-- docs/WORKFLOW.md templates/CLAUDE.md.tmpl` → ≥1 hit всеки; `git grep -n "standing word"
-- docs/WORKFLOW.md` → нула останали в контекста на втория пас (показва се поименно);
selfcheck exit 0 с двата пина + контролите; Cyrillic празно; регионът приложен на
self-install-а (bookkeeping upstream==local); `validate-payload` → `9 migration(s)`;
`aiwf-update --check` → „up to date … 0.2.5"; стар fixture id grep (`0009_example-bump` извън
dev/CHANGELOG) → празно, exit 1; пълни 8/8 (release-отварящ тикет).
**Risk threshold:** блокира промяна на вердиктната семантика (pass/fail/PASS/NEEDS-FIX);
note-only за формулировка. **Stop condition:** acceptance зелен → стоп.
**Review:** `Class: code` (selfcheck в диффа) → Codex, fact-check преди; cap 2.
**Assignee:** Колега. Branch `main`.

#### HARD-012 — Completion record (2026-09-14)

**Commit `b1b62350c1e0a88b75256be2279da146d6250345`** върху котвата `79b8b1e` (branch `main`,
локален, непушнат): 27 файла, 340+/68− (`git show --stat b1b6235`); едноредово съобщение, нула
trailers (`git log -1 --format=%b` празно, проверено с `cat -A`); PLAN файлът и `.aiwf/` извън
commit-а; трите codex `.ps1` не дрейфнаха. Изпълнено по обхвата (a)–(d) + COO scope решението:
P1 фразата на трите сайта (WORKFLOW точка 4 в § How the COO speaks, review/qa Step 4); падащият
default пренаписан на ВСИЧКИ payload сайтове, които го твърдяха — WORKFLOW (гейт клаузата :150,
loop-shape bullet-ът, readiness цикълът :333-347 И стартовото изречение :308, пас-1 корекция),
REVIEW_CHECKLIST:22, OPERATOR_PROTOCOL:98, README:215, CLAUDE.md.tmpl гейт редовете,
PROJECT_OVERRIDES.md.tmpl сийд редът, reviewer.md.tmpl:106-113, review/roles/work скиловете,
schema description-ът, двата resolver header-а; guard (b) сайтовете и историята непипнати,
`--show` таблицата байт-идентична. Selfcheck: нов `DOCTRINE_PASS_SURFACES` (5 пина: P1×3,
"one word per pass"×2) + генеричен assertion + 5 авто-генерирани flipping контрола, всеки
саботира с реалната регресия. Release 0.2.5 отворен: миграция `0009_readiness-discipline`
(note + rerender `CLAUDE.md#aiwf-core` + rerender `.claude/agents/reviewer.md` c
`ifRecorded: true` — третият op роден от пас-1 блокер B3), 9-и манифестен запис, bump 0.2.5,
fixture → `0010_example-bump` (относителният контрол от HARD-001 пак не поиска пипане),
self-install apply (2 операции, 0 диалога, регионът директно — bookkeeping upstream==local;
третият op е no-op тук: reviewer-ът е codex-hosted, запис няма), `CHANGES_0.2.4-to-0.2.5.md`.

**Отклонения (приети от COO):** (1) пиновете в нов масив `DOCTRINE_PASS_SURFACES`, не в
`DOCTRINE_TABLE_SURFACES` (контрактът на таблицата е "кой одитира"; същият механизъм); (2)
template ref-ът на региона с `#aiwf-core` суфикс по образеца 0004 (без него op-ът пише целия
шаблон в региона — проверено срещу `migrate.mjs:334-347`); (3) fixture rename-ът staged с
`git mv` (unstage би бил `git reset` — операторски клас); (4) две fixture сайта отвъд плановия
списък (examples README :78-79); (5) CHANGELOG получи и липсващия `[0.2.4]` link ref; (6) при
commit-а: двата RM fixture файла имаха unstaged content-делта върху staged rename — стейджнати
с обявление (иначе `ops.json` ляга с грешен migration id); (7) нула trailers въпреки harness
reminder-а — проектното правило, обявено.

**Ревю (пълна история):** fact-check над диффа (Explore/sonnet) — 0 находки (вкл. override/skip
клоновете срещу `migrate.mjs`, "seven times", сийд цитата). Codex `gpt-5.6-sol`/high,
`Class: code`: пас 1 **`fail`, 3 блокера, един клас** — заварена проза с отменения модел без
фразата "standing word" (WORKFLOW:308 „no intermediate human permission"; README:215;
reviewer.md.tmpl:107 — рендира се у консуматори) → корекционен рунд 1: трите пасажа пренаписани
+ COO решение: трети op в миграцията (`ifRecorded` rerender на reviewer.md, образецът 0004);
note текстът и CHANGELOG направени верни за трите op-а. Делта fact-check — 0 находки. Пас 2
(верификационен, **изрична операторска дума „пускай" — първият пас, диспачнат по правилото,
което самият тикет вкарва**): **`pass`, нула находки** — B1–B3 решени, третият op проверен и по
journal-recovery пътя.

**Верификация (точни кодове):** пълни 8/8 exit 0 на финалното дърво (двукратно: след рунд 0 и
след рунд 1) — validate-payload „9 migration(s) … 0.2.5"; test-setup 328/0; test-update 490/0;
example cycles 2×44/0; **selfcheck 1003/1003** (`node scripts/selfcheck/aiwf-selfcheck.js
--plugin-root . --project-fixture .`; 5-те нови контрола „FAIL as required"); spikes 318/0;
plugin validate ✔; `aiwf-update --check` „up to date … 0.2.5". Acceptance дословно: P1 grep-ът
-L празен exit 1; "one word per pass" ≥1 hit в WORKFLOW и CLAUDE.md.tmpl; останалите
"standing word" в WORKFLOW само guard (b) (:188, wrap-нат) и двете изречения на НОВОТО правило
(:152, :337); Cyrillic празно exit 1; стар fixture id празно exit 1. Останал дълг: няма.
Release опашката на 0.2.5 (tag, push, CI, consumer proof) — в HARD-007 по плана.

## 0.2.6 — Legibility & housekeeping · tag `v0.2.6`

### HARD-008 (ROLES-001) [R2 code-class] — одитната таблица се чете от човек и не се пре-рендира

**Outcome:** `--show` групира/етикетира четирите ВИДА ред (роли / review класове /
неконфигурируем гейт / рут), така че празна клетка е очевидно структурна; скилoвете, които я
показват, печатат буквалния изход — всичките, не два от четири.

**Обхват:**
1. `aiwf-roles.mjs showLines() :551-599`: редовете получават вид и изходът ги показва в четири
   блока, всеки предшестван от етикетен ред и разделен с празен ред — `-- roles (who does the
   work) --`, `-- review classes (what gets audited, how many passes) --`, `-- always-on gate
   --`, `-- routes --` (точните етикети — тези; header редът и СЪДЪРЖАНИЕТО на 9-те реда
   непроменени: същите стойности и маркери — `(below the top tier)`, `(the Reviewer's …)`,
   `no auditor`, `always/not configurable`).
2. Selfcheck пиновете `:2618-2653` — пренаписани към новия формат (пак фразови: header-ът,
   присъствието и групите; плюс контрол, че двата неконфигурируеми реда НЕ могат да липсват —
   живият дефект от втория консуматор).
3. `skills/work/SKILL.md:38-41` и `skills/setup/SKILL.md:153-160` → „print the tool's literal
   output (verbatim)" — изравнени с `mission:52-55`/`roles:125-126`.
4. Миграция `migrations/0010_plan-prefix-legibility/` се авторства ТУК (note op; REF-001 добавя
   rerender op-а си) + 10-и запис 0.2.6 + `plugin.json` 0.2.6 + CHANGELOG `## [0.2.6]` +
   fixture → `0011_example-bump` + self-install apply + `CHANGES_0.2.5-to-0.2.6.md`.
**Извън обхват:** промяна на СТОЙНОСТИ или семантика на таблицата; нови колони/конфигурация;
интервюто.
**Acceptance:** `node scripts/setup/aiwf-roles.mjs --show --project-root . --plugin-root .` →
exit 0, изходът носи групите/етикетите и ВСИЧКИТЕ 9 реда (fact-check + R1 присъстват —
показва се буквално в handback-а); selfcheck exit 0 с пренаписаните пинове + новия контрол;
`git grep -c "verbatim" -- skills/work/SKILL.md skills/setup/SKILL.md` → ≥1 всеки;
`validate-payload` → `10 migration(s)`; `aiwf-update --check` „… 0.2.6"; VERIFY 8/8; Cyrillic
празно.
**Risk threshold:** блокира смяна на стойност/маркер семантика; изпуснат ред; счупен пин без
замяна.
**Stop condition:** VERIFY + acceptance зелени → стоп.
**Review:** `Class: code` → Codex, fact-check преди; cap 2. **Assignee:** Колега. Branch `main`.

#### HARD-008 — Completion record (2026-09-15)

**Commit `530b9d4952439ad2b3f24c0a42fdc2b8ab97e4a8`** върху котвата `f0ed8c5` (branch `main`,
локален, непушнат): 18 файла, 432+/61− (`git show --stat 530b9d4`); едноредово съобщение, тяло
празно (`cat -A` → един `$`), нула trailers; дърво чисто; двата fixture файла записани като
rename (90% / 96%); PLAN, `dev/` и `.aiwf/` извън commit-а. **Половина А:** `showLines()` печата
header, после четири етикетирани блока — деветте реда са БАЙТ-ИДЕНТИЧНИ (доказано механично срещу
снимка отпреди редакцията, не твърдяно); етикетите се емитват извън padding-а (иначе
57-знаковият етикет би разширил първата колона от 12 на 57); трите заварени `--show` пина
пренаписани към новата форма + нов пин за двата неконфигурируеми реда с двукрак контрол;
`/pnp:work`, `/pnp:setup` и (от пас 1) `/pnp:roles` печатат буквалния изход. **Половина Б:**
0.2.6 отворена — миграция `0010_plan-prefix-legibility` (само `note` op; HARD-009 допълва),
10-и манифестен запис, `plugin.json` 0.2.6, fixture → `0011_example-bump`, self-install apply
(1 операция, 0 диалога), `CHANGES_0.2.5-to-0.2.6.md`.

**COO scope решения (вписани):** (1) празен ред след header-а НЯМА — header-ът е легенда на
колоните, не блок, така празният ред означава точно едно нещо: граница между видове; (2) слугът
`0010_plan-prefix-legibility` държи засега само audit-table бележката — условие върху HARD-009,
не дълг: ако HARD-009 отпадне, слугът се преименува преди тага; (3) в корекционния рунд разширих
обхвата с два елемента (образецът в `skills/roles/SKILL.md` и поправката на генератора) — и двата
с обосновка по-долу.

**Ревю (пълна история):** discovery преди брифа — 2 Explore/sonnet агента (геометрия на рендерера
и всичко, което assert-ва изхода му; пълна release механика по образеца `b1b6235`). Fact-check
пас 1 над диффа — 1 находка („55-character label" при реални 57) → микро-рунд заедно с едно
прозаично затягане (COO). Codex `gpt-5.6-sol`/high, `Class: code`, пас 1: **`fail`, 5 блокера,
нула бележки** — (B1) новият контрол можеше да мине празно, защото `nonConfigurableRowFindings('')`
връща находки; (B2) `skills/roles/SKILL.md` още показваше стария неразделен образец — **пропуск на
моя бриф**, не на Колегата; (B3) `CHANGES_0.2.5-to-0.2.6.md` твърдеше приложен артефакт при
миграция само с note op; (B4) „no other assertion would have missed them" — обърнато твърдение;
(B5) `docRefs` сочеше `docs/WORKFLOW.md:249`, което казва, че таблицата „does NOT contain" fact-check
гейта. Корекционен рунд 1 затвори и петте.

**Пас 2 НЕ е пуснат — операторско решение (ограничена квота, 2026-09-15).** На негово място, по
изричното указание, петте проверки, всичките зелени и всичките първолични: (1) делта fact-check над
поправената проза — **0 находки**, проследил в кода, че единственият път без bookkeeping запис е
`ifRecorded` клонът; (2) COO прочит на цялата делта; (3) независим COO рън — **деветте команди
exit 0**; (4) прочит на двата крака на контрола: (а) иска чистото релокирано копие да върне нула
находки, (б) иска саботираното да падне ТОЧНО с `the fact-check row is absent` и shape-ът да назове
само гейта — празен изход вече чупи (а) и не минава (б); (5) **пряко извикване на
`assembleChanges`** в три случая: note-only → няма изречение, rerender със запис → има,
rerender без запис (`ifRecorded` skip) → няма. Плюс историческото потвърждение: `0008` е note-only
и отчетът му носи лъжата, `0009` рендира и там е вярна, `0010` е чист. Остатъчният клас, който
остава на COO преценка и се казва вместо да се крие: дали изречението да зависи и от
`reconcile-ask-ruleset` — не, текстът говори за рендиран артефакт, а reconcile има собствен отчетен
ред от HARD-002.

**Верификация (точни кодове):** Колегата пълни 8/8 exit 0 (test-setup 328/0; **test-update 495/0**
(+5); example cycles 2×44/0; **selfcheck 1026/1026**; spikes 318/0; plugin validate ✔;
validate-payload „10 migration(s) … 0.2.6"; `aiwf-update --check` „up to date … 0.2.6").
Независимият COO рън повтори деветте на същото дърво със същите числа.

**Средови инцидент (записан, не изчистен):** машината изчерпа паметта три пъти подред и уби три
фонови рънa, всеки оставяйки осиротяло дете. В един от тези рънове осиротелият `example-linux`
отчете **2 провала** — в ЗАВАРЕНИ spawn-тежки контроли (`EXAMPLE FIXTURE CONTROLS` /
`PROJECT LAYER` / `NEGATIVE CONTROLS`), НЕ в новия контрол (проверено поименно:
„the control copy is clean before any sabotage" е заварена проверка на `:1744/2412/4806`). Същият
цикъл е зелен три пъти при налична памет. Приписано на средата с това доказателство; ако се повтори
при свободна памет, е находка. Оттук нататък: пълните 8/8 — една команда наведнъж.

**Записана бележка за реда (от Колегата):** от този хеш дървото твърди 0.2.6, докато `0010` носи
само note op-а. Междинен `/pnp:update` срещу това дърво би маркирал консуматор като текущ на 0.2.6,
и rerender op-ът на HARD-009 после иска `--resolve` върху вече приложена миграция вместо свеж
apply — точно механиката, която планът предвижда (Решения т.3, образецът AUD-002 §3). Останал дълг:
няма. Tag/push на 0.2.6 — на последния тикет от изданието (HARD-011).

### HARD-009 (REF) [R2 code-class] — един префикс на план: ref-ът е lookup, не описание

**Outcome:** доктрината носи четирите операторски точки (план = `PLAN_<ABBR>.md`; тикет =
`<ABBR>-<NNN>` пореден, неизползван повторно; новороденото в полет взима СЪЩАТА абревиатура;
кандидат НЯМА ref); Gate 2 прави насочен lookup с fallback; selfcheck-ът държи правилото
проверимо за планове, родени след него. НЕ е ретроактивно.

**Обхват:**
1. `docs/WORKFLOW.md`: § Durable development history `:537-544` (ref правилото — четирите
   точки, `ABC-001` примерите остават като форма `<ABBR>-<NNN>`), archive конвенцията
   `:506-512` (`<NNN>_PLAN_<ABBR>_<YYYY-MM-DD>.md`), guard (b) `:184-196` („написан в PLAN-а"
   → „…със същата абревиатура и следващия номер").
2. `templates/CLAUDE.md.tmpl:35-38` (guard (b) огледалото в региона) → миграцията на изданието
   получава `rerender-managed-region CLAUDE.md#aiwf-core` op; self-install пре-прилагане през
   `--resolve "CLAUDE.md#aiwf-core"` + resolution файл (AUD-002 §3 механиката, `--resolve`
   винаги пита без файл).
3. Gate 2 (`pretooluse-dispatch-gate.js:130-147`): от `<REF>` се вади `<ABBR>` → първо се чете
   `PLAN_<ABBR>.md` ако съществува; пълният scan по `:139` остава fallback (заварени планове);
   нула промяна на решението ask/silent — само редът на четене.
4. Selfcheck: нов assertion — за всеки файл `<plansDir>/active/PLAN_<ABBR>.md` с ABBR мачещ
   `^[A-Z]{2,8}$`, всяко заглавие от вида `^#{2,4} <PREFIX>-\d{3}` носи `<PREFIX> == <ABBR>`
   (нивото на заглавието е свободно; текст след номера — вкл. второ име в скоби — е позволен) —
   + flipping контрол (несъответстващ ref в синтетичен fixture → FAIL); заварените имена с `_`
   в темата не мачат шаблона и са извън assertion-а по конструкция. Живият пример е самият
   `PLAN_HARD.md`.
5. `skills/mission/SKILL.md:38` / `skills/work/SKILL.md:51,62` — прозата споменава конвенцията
   където описва PLAN/ref; CHANGELOG `[0.2.6]` допълнен.
**Извън обхват:** преименуване на заварени планове/refs (изрично НЕ-ретроактивно;
PLAN_PNP_PUBLIC остава последният зоопарк; настоящият план прие правилото още в планирането —
операторска дума 2026-09-13, с вторите имена като преход); commit съобщения от историята.
**Acceptance:** `git grep -n "ABC-001" -- docs skills templates README.md` → нула ИЛИ само като
`<ABBR>-<NNN>` формата (финалните примери се показват). Насоченият lookup се доказва на
production helper-а, не с нечетим straggler (пас-1 корекция: пълният scan и днес прескача
нечетими файлове, а на Windows нечетимостта е NOTE — такъв fixture не различава нищо):
`pretooluse-dispatch-gate.js` изнася lookup helper-а под `require.main === module` (прецедентът
на Gate 4 от GATE-001, отклонение 2) и той връща и СПИСЪКА прочетени файлове; тест 1 — fixture
с `PLAN_AB.md` (носи `AB-001`) + втори `PLAN_ZZ.md`, който СЪЩО съдържа стринга `AB-001`:
helper-ът за `AB-001` връща hit с прочетени файлове == точно `['PLAN_AB.md']` (наличието на
`PLAN_ZZ.md` в списъка = FAIL — насоченият път не е enumerate-нал); тест 2 (fallback) — ref
само в заварен `PLAN_LEGACY_NAME.md` → hit през пълния scan, решението silent непроменено;
selfcheck exit 0 + naming assertion контролът; VERIFY 8/8; Cyrillic празно.
**Risk threshold:** блокира промяна на ask/silent семантиката на Gate 2; ретроактивно
преименуване; фалшиво зелен assertion (без работещ контрол).
**Stop condition:** VERIFY + acceptance зелени → стоп.
**Review:** `Class: code` → Codex, fact-check преди; cap 2. **Assignee:** Колега. Branch `main`.

#### HARD-009 — Completion record (2026-09-15)

**Commit `82f702b0a7c322edc4c153cf96f52352b9e41378`** върху котвата `d69b42b` (branch `main`,
локален, непушнат): 11 файла, 547+/84− (`git show --stat 82f702b`); едноредово съобщение, тяло
празно (scratchpad probe, `%b` празно, байтово потвърдено през `git cat-file`), нула trailers
(проектното правило бие harness reminder-а — обявено); дърво чисто след commit-а освен PLAN
файла; трите codex `.ps1` не дрейфнаха. Изпълнено по обхвата (a)–(e): четирите операторски
точки + граматиката (ABBR = 2–8 главни `A-Z`, NNN тризначен) в § Durable development history;
archive конвенцията `<NNN>_PLAN_<ABBR>_<YYYY-MM-DD>.md`; placeholder унификация `PLAN_<ABBR>.md`
(двете заварени изписвания); guard (b) „със същата абревиатура и следващия номер" + огледалото в
`templates/CLAUDE.md.tmpl`; `0010` получи безусловен `rerender-managed-region CLAUDE.md#aiwf-core`
op (БЕЗ нова миграция — Решения т.3; note op id-то остава стабилно при разширен текст: приложен
op на реални инсталации); self-install re-apply през `--resolve` + resolution файл (take-new,
bookkeeping upstream==local `e51e8f97…`, override false); Gate 2 рефакториран по Gate 4
прецедента — `lookupTicketRef` изнесен, hook-ът под `require.main === module`, насочен прочит с
`lstat().isFile()` eligibility + names-only парити probe, fallback пълният scan, нула промяна на
ask/silent повърхността; selfcheck: нова секция ONE PREFIX PER PLAN (+15 проверки: targeted
proof `read==['PLAN_AB.md']` с first-sorting decoy, directory контроли на двата пътя + жив
subprocess, legacy fallback, naming findings fail-closed с двукрака контрола; реалният план — 23
заглавия); skills/mission + skills/work конвенцията; CHANGELOG интрото поправено (носеше вече
невярната „само note" претенция) + три Added bullet-а.

**COO решения (вписани):** (1) строг паритет микро-рунд ПРЕДИ ревюто — първата резба на
насочения път пропускаше readdir и обръщаше екзотичен вход (traverse-without-list ACL) от ask към
silent; арбитрирано към probe, blocking формулировката на risk threshold-а печели; (2) ABC-001
остава като илюстрация на формата (acceptance-ът го позволява изрично); (3) Writer-ското fixture
подсилване прието — плановият fixture (ZZ след AB) не различаваше targeted от scan, decoy-ят
PLAN_AA.md сортира първи.

**Ревю (пълна история; първият тикет по Решения т.10 — одитната икономика):** evidence pack
(1 sonnet, 7 секции + gaps) в review брифа с изричен spot-check дълг; fact-check пас 1 —
0 находки. Codex `gpt-5.6-sol`/high, `Class: code`, пас 1 (изрична дума; старт/стоп
100→95% 5ч / 88→87% седм.; **92,248 токена**): **`fail`, 2 блокера P2** — (B1) targeted път без
isFile eligibility: symlink дава silent при стар ask (одиторска собствена read-only проба:
old=ask/new=silent); (B2) naming assertion false-green: граматиката липсваше в прозата + нечетим
applicable план се прескачаше тихо. И двата блокера от собствените проби на одитора, не от
пакета — независимостта издържа и тук. Корекционен рунд 1: lstat eligibility + directory
контроли; граматиката в прозата (и в CHANGELOG/NOTES — един ред надолу, същото правило);
fail-closed находки + контроли. Делта fact-check — 0 находки. **Верификационен пас = codex exec
resume** (сесия `01a0a5fc…fd60`, гола CLI извън wrapper-а — обявено; изрична дума): **`pass`,
нула находки**, блокерите потвърдено затворени с одиторска собствена helper проба; клетката не
пусна суитите (`mkdtemp` EPERM, известният лимит) — рънът на Колегата е източникът. **Икономика,
измерено:** сесиен брояч 195,445 → инкремент **103,197 токена**, но квотна цена старт/стоп
**71→68% 5ч (3 п.п.) / 83→83% седм. (0 п.п.)** срещу 5 п.п./1 п.п. за студения пас — кешираният
вход тежи по-леко от нов студен контекст; операторска преценка: тактиката работи. Всяка цена е
мерена като старт/стоп двойка на самия пас (между пасовете други сесии теглят от същата квота).

**Верификация (точни кодове):** пълни 8/8 exit 0 на финалното дърво (една команда наведнъж) —
validate-payload „10 migration(s) … 0.2.6"; test-setup 328/0; test-update 495/0; example cycles
2×44/0; **selfcheck 1041/1041** (1026 преди тикета; контролите „FAIL as required"); spikes 318/0;
plugin validate ✔; `aiwf-update --check` „up to date … 0.2.6"; acceptance дословно: ABC-001 grep
→ 2 хита, двата формата (`docs/WORKFLOW.md:593,:612`); Cyrillic празно exit 1; насоченият lookup
доказан на production helper-а с точния списък прочетени файлове. Останал дълг: няма. Tag/push
на 0.2.6 — на HARD-011 по плана.

#### Release 0.2.6 — изпълнен (2026-09-16, самостоятелен: операторска дума „издаваме 2.6"; съдържание HARD-008 + HARD-009)

**Независим COO рън ПРЕДИ тага:** 9/9 exit 0 на HEAD `1381ecf`, дървото байт-идентично в двата
края (HEAD + porcelain еднакви) — validate-payload „10 migration(s) … 0.2.6"; test-setup 328/0;
test-update 495/0; example cycles 2×44/0; selfcheck 1041/1041; spikes 318/0; plugin validate ✔;
`--check` „up to date … 0.2.6". Процесен инцидент (записан): harness-ът авто-фонира суита след
120s и агентът приключи ход върху poll — коригиран на място, остатъкът строго foreground;
selfcheck exit кодът от рънa беше ИЗВЕДЕН (отрязан изход) → затворен с директен COO рън,
exit 0 наблюдаван, 1041/1041.

**Tag:** `v0.2.6` → `82f702b` (кодовият commit на HARD-009, не докс commit-ите — образецът), лек
таг (`git cat-file -t` → `commit`). **Push:** main `72e8864..9bd5119` + тагът, всяко със свой
диалог; `git ls-remote --tags origin v0.2.6` → `82f702b…`; `origin/main...main` = `0 0`.

**CI:** два рънa — main `35058688980` (26m) и таг `35060957246`; **и двата overall `success`,
windows ✔ + ubuntu ✔ (блокиращите) в двата**; macos advisory-failure в двата (известният
проследен дефект, нов сигнал няма).

**Consumer proof (операторски relay, 2026-09-16): зелен, с числа.** Публичният път, 0.2.5 →
0.2.6, миграция `0010` с **2 операции, нула конфликта**: note op-ът + `CLAUDE.md#aiwf-core`
пре-рендиран **БЕЗ диалог** (регионът непипан там, local==upstream — проектираното поведение,
второ доказателство на терен след 0.2.5). **Новата naming проверка се доказа веднага:** хвана
две реални префиксни разминавания на консуматора (план с тикети `CUTP-*` в файл с друга
абревиатура; `PLAN_PROJECTS.md` с тикети `PROJ-*`) — консуматорският COO преименува ФАЙЛОВЕТЕ,
не реферите (стабилни идентификатори), точно посоката на правилото; план с `_` в темата остана
извън граматиката по конструкция. Финален selfcheck там **1046/1046 exit 0** (междинно
1045/1046 с реалната находка). Диффът на консуматора некомитнат (неговият gate) — без хеш
оттам. **Данна точка за HARD-013:** първият `--apply` там върна exit 1 при ЛЕГИТИМНО червен
self-check — двете лица на отворения въпрос „exit код при приложени миграции + червен
self-check" (средово-фалшиво червен: 2026-09-15; реално червен: тук) вече са наблюдавани по
веднъж и влизат в брифа на HARD-013 като измерени факти.

**С това 0.2.6 е издадена и consumer-доказана.** HARD-010/011 не са част от изданието
(преместени в 0.2.8 с думата от 2026-09-16).

## 0.2.8 — Docs & README · tag `v0.2.8` (тикетите по-долу ПРЕМЕСТЕНИ от 0.2.6 с операторска дума 2026-09-16; изпълняват се СЛЕД 0.2.7 — файловият ред тук не е изпълнителният, той е в „Ред и гейтове". Първият тикет на изданието авторства миграцията/bump-а му по Решения т.3)

### HARD-010 (DOC-001) [R2 docs-class] — докс commit-ът е отделен от кодовия, записано

**Outcome:** payload-ът казва явно това, което трите проекта правят по подражание: кодовият
commit носи само работата по тикета; записът за нея (PLAN completion record, статус редове)
ляга в отделен docs commit — за да е ясно кое е одитирано и кое е бележка след това.

**Обхват:** едно изречение с обосновката в `docs/WORKFLOW.md` § Durable development history
(до „writes this record immediately after the ticket's commit") И § Commit & Push Authority
(`:639-681`); литералната фраза на двете места: "the docs commit is separate from the code
commit: the code commit carries only the ticket's work, and the record about it lands in its
own commit, so what was audited and what is a note after it stay distinguishable"; съгласуване
с `docs/LOOP.md` § Commit gate ако дублира; нула шаблонни огледала (нула съществуват —
грепнато; регионът не се пипа). CHANGELOG `[0.2.6]` допълнен.
**Извън обхват:** нов гейт/enforcement; шаблоните.
**Acceptance:** `git grep -c "the docs commit is separate from the code" -- docs/WORKFLOW.md`
→ 2; **дифф гард (fail-capable, котва = литералният `git rev-parse HEAD` при диспач, вписан в
брифа):**
`node -e "const{execSync}=require('child_process');const sh=c=>execSync(c).toString().trim();const A='<КОТВА>';const ch=sh('git diff --name-only '+A).split(/\r?\n/).filter(Boolean);const un=sh('git status --porcelain').split(/\r?\n/).filter(l=>l.startsWith('??')).map(l=>l.slice(3));const ok=f=>f.startsWith('docs/')||f==='CHANGELOG.md';const bad=ch.filter(f=>!ok(f)).concat(un.filter(f=>!(ok(f)||f.startsWith('dev/')||f.startsWith('.aiwf/'))));if(bad.length){console.error(bad);process.exit(1)}"`
→ exit 0 (покрива и tracked промени, и untracked файлове; всичко извън allowlist-а → exit 1 с
имената); VERIFY 8/8; Cyrillic празно.
**Risk threshold:** блокира какъвто и да е не-docs файл в диффа (гардът горе е механизмът).
**Stop condition:** acceptance зелен → стоп.
**Review:** `Class: docs` → Codex (`gpt-5.6-sol`/high, 1 пас), fact-check преди; cap 2.
**Assignee:** Колега. Branch `main`.

### HARD-011 (README-001) [R2 docs-class] — публичното repo се обяснява на студен посетител; release 0.2.8

**Outcome:** непознат програмист, отворил repo-то в GitHub, получава в този ред: къде се
намирам, какво прави плъгинът, как го прави, какви команди има и за какво е всяка — от root
`README.md` надолу, без да му трябва предварително познаване на loop-а. Улегнал продукт:
върви СЛЕД всичко останало в плана (операторско решение 2026-09-12). 0.2.8 е издадена.

**Обхват:**
1. Root `README.md` (245 реда; студеният вход е само `:1-17`): преработка по въпросите на
   студения посетител; § Status `:19-102` остава верен-по-конструкция; „Eleven commands" `:31`
   → списък „коя команда за какво" с по един ред човешки език; FAQ `:215-242` подравнен.
   Update пътят се препроверява срещу живото поведение: измерено от оператора (2026-09-13),
   `/plugin marketplace update promptandpray` сам актуализира инсталирания плъгин — отделната
   `/plugin update pnp@promptandpray` стъпка е поне отчасти излишна; README/docs казват
   каквото живият хост прави, не по-дългата церемония.
   **[ВТОРО ИЗМЕРВАНЕ 2026-09-21, операторски екран от сесия на консуматор.]** Церемонията, която
   операторът кара всеки път, е ТРИ команди, не четирите на `README.md:127-129`:
   `/plugin marketplace update promptandpray` → `/reload-plugins` → `/pnp:update`. Изходът на
   първата е `Updated 1 marketplace (1 plugin bumped)`, тоест плъгинът вече е обновен и
   `/plugin update pnp@promptandpray` няма какво да свърши — този път доказано от самия изход, не
   само от наблюдение. **Плюс аргумента:** README пише командата ГОЛА, а гола тя отваря диалог за
   избор какво да се обнови; с `promptandpray` отива право на целта и хостът сам дописва аргумента
   с tab, тоест по-правилната форма е и по-малко писане. Документираната форма е по-неудобната от
   двете. Тикетът пише и трите факта: аргументът, отпадането на втората стъпка, три стъпки вместо
   четири. `:133-135` (защо `/reload-plugins` не е опционален) остава вярно и се пази.
2. Останалите 13 payload README-та (`docs/`, `skills/`, `templates/`,
   `scripts/{ci,native,selfcheck,setup,spike,update}/`, `migrations/`, `schema/`, `examples/`,
   `examples/example-project/` — 14 общо с root) — всяко отваря с едно изречение „какво е това
   и за кого", после днешното съдържание; `docs/OPERATOR_PROTOCOL.md` (единственият студен
   документ) се сочи от root README като втората врата.
3. Скил прозата: description/H1 редовете на 11-те `SKILL.md` — един човешки ред преди жаргона
   (R1/R2/R3, engine-neutral и пр. се дефинират с препратка, не предполагат).
4. `dev/README.md` НЕ е payload — извън обхвата на провenance правилата, пипа се само ако
   нещо в него е станало невярно.
5. Release 0.2.8: CHANGELOG финализиран; tag `v0.2.8` (дума) → push (дума + диалог) → CI →
   consumer proof (relay). (Беше „release 0.2.6" — 0.2.6 се издаде самостоятелно след HARD-009
   с операторска дума 2026-09-16.)
**Извън обхват:** нова функционалност/команди; смяна на технически претенции (само формулиране
за студен читател — фактите остават каквито selfcheck-ът ги пази); Cyrillic/origin
имена/абсолютни пътища (provenance гейтът важи с пълна сила).

**[ДОПИСАНО 2026-09-20, при затварянето на CONS-007]**
6. **macOS: отпадналото основание се маха, support tier-ът НЕ се пипа.** Два текста твърдят
   нещо, което вече не е вярно: `README.md` § Status `:83-84` и `:96-102` („carries a known
   unfixed defect", „one measured defect stands unfixed: on macOS the self-check's captured
   output truncates partway through and the run ends without its tally"), и коментарът на
   `macos` job-а в `.github/workflows/ci.yml:115-123` („one measured defect stands unfixed
   here… The key comes off the day macOS is either fixed or dropped"). Дефектът е поправен от
   CONS-011 и `macos` мина изцяло зелен на двата рънa на 0.2.7 (`35431474157`, `35433501937`) —
   първи път от 0.2.1. **Пипа се само основанието.** `continue-on-error` ОСТАВА, support tier-ът
   остава best-effort, поддържан канал не се обявява: операторска дума 2026-09-20 —
   преразглеждане в отделна сесия след затварянето на PLAN_CONS (ruling ledger). `CHANGELOG.md`
   блокът на 0.2.2 е история и НЕ се пренаписва; корекцията отива в блока на изданието, което
   носи този тикет. `ci.yml` не е payload, но язди с README-а, защото носи същата предпоставка —
   съседен договор, който се движи с промяната, от която зависи.
7. **Целта на изданието е `v0.2.9`, не `v0.2.8`** (PLAN_CONS Решение 19б: `HARD-011 → 0.2.9`;
   0.2.8 е изданието на CONS-010). Заглавието на секцията и т.5 по-горе носят старото число и
   се четат през тази бележка.
**Acceptance:** всяко от 14-те payload README-та отваря с ориентиращо изречение (списъкът
файл-по-файл в handback-а; броят се проверява:
`git ls-files "*README.md" ":(exclude)dev" | Measure-Object -Line` → 14); `git grep -nP
"[\x{0400}-\x{04FF}]" -- docs skills templates scripts schema hooks migrations examples
README.md` → празно; selfcheck exit 0 (README пинове, ако някой се пипа — `README.md:31` броят
остава верен); дифф гардът от Risk threshold-а → exit 0;
VERIFY 8/8; след release: `git ls-remote --tags origin v0.2.8` → hash; `origin/main...main` →
`0 0`.
**Risk threshold:** блокира невярна претенция, вкарана в името на четимостта; какъвто и да е
не-docs файл в диффа (изпълним артефакт → рекласификация към code loop по правилото). Дифф
гард (литерален; котва = `git rev-parse HEAD` при диспач, вписана в брифа):
`node -e "const{execSync}=require('child_process');const sh=c=>execSync(c).toString().trim();const A='<КОТВА>';const ch=sh('git diff --name-only '+A).split(/\r?\n/).filter(Boolean);const un=sh('git status --porcelain').split(/\r?\n/).filter(l=>l.startsWith('??')).map(l=>l.slice(3));const ok=f=>f.startsWith('docs/')||f.endsWith('README.md')||(f.startsWith('skills/')&&f.endsWith('/SKILL.md'))||f==='CHANGELOG.md';const bad=ch.filter(f=>!ok(f)).concat(un.filter(f=>!(ok(f)||f.startsWith('dev/')||f.startsWith('.aiwf/'))));if(bad.length){console.error(bad);process.exit(1)}"`
→ exit 0; всичко извън allowlist-а (tracked: `docs/**`, `**/README.md`, `skills/**/SKILL.md`,
`CHANGELOG.md`; untracked: плюс `dev/**`, `.aiwf/**`) → exit 1 с имената.
**Stop condition:** acceptance зелен → стоп.
**Review:** `Class: docs` → Codex (1 пас), fact-check преди; cap 2.
**Assignee:** Колега. Branch `main`.

## 0.2.9 — двата дефекта на 0.2.8, преди README-то (операторска дума 2026-09-21; записани и СПРЕНИ — диспач след readiness и дума per тикет)

### HARD-015 [R2 code-class] — двете операторски врати изброяват три документа за preflight, регионът — четири; изброяването получава пин (роден 2026-09-21, от арбитража с Furnissimo)

**Outcome:** сесия, влязла през `/pnp:mission` или `/pnp:work`, чете същите четири документа,
които managed регионът на `CLAUDE.md` изисква — включително `.claude/aiwf-native/ORCHESTRATOR.md`;
и трите дома на изброяването се държат заедно от self-check-а, така че четвърти артефакт в
списъка да не може да мине покрай два от тях.

**Наблюдение (проверено първолично, 2026-09-21):** `templates/CLAUDE.md.tmpl:58-61` — четири
документа; `skills/mission/SKILL.md:33-37` и `skills/work/SKILL.md:32-35` — три, без ролята.
`grep -rn "Doctrine preflight" skills/ templates/ docs/` → 3 дома; `grep -rln
"aiwf-native/ORCHESTRATOR.md" skills/` → само `setup`. Консуматор (Furnissimo, 2026-09-20/21)
влезе през `/pnp:mission` и цял ден работи по остарял preflight — дефектът произведе собствения
си свидетел. Трети екземпляр на похвата „изброяване с няколко дома, обновен един" (вж. CONS-009
и `docs/LOOP.md` § Role boundaries).

**Обхват:**
1. `skills/mission/SKILL.md:33-37` и `skills/work/SKILL.md:32-35`: изброяването става четири —
   payload `docs/WORKFLOW.md`, payload `docs/LOOP.md`, `{{config.paths.overridesDoc}}` И
   `.claude/aiwf-native/ORCHESTRATOR.md` — със същата формулировка като региона („your rendered
   standing rules"), не с нова.
2. Структурен пин в `scripts/selfcheck/aiwf-selfcheck.js`: една фразова константа за preflight
   списъка, броена на трите дома (`templates/CLAUDE.md.tmpl`, `skills/mission/SKILL.md`,
   `skills/work/SKILL.md`) по механизма на `DOCTRINE_CONSOLIDATION_SURFACES` (CONS-005/CONS-009),
   с негативна контрола, която маха артефакта от ЕДИН дом и очаква FAIL.
3. `skills/README.md` / `docs/README.md` — само ако някой ред там повтаря изброяването (closing
   grep за `Doctrine preflight` и за `ORCHESTRATOR.md` в `skills/ docs/ templates/` първо УДРЯ
   трите дома, после връща нула извън тях).
**Извън обхват:** нов документ в preflight-а; промяна на самото съдържание на ролята; миграция
(скиловете не са managed артефакти — промяната пътува с версията на payload-а, която носи
release-ът на HARD-011).
**Acceptance:** `grep -rn "aiwf-native/ORCHESTRATOR.md" skills/mission/SKILL.md skills/work/SKILL.md`
→ по 1 ред във всеки; `node scripts/selfcheck/aiwf-selfcheck.js --plugin-root .` → exit 0, с
новата находка и нейната контрола в изхода („FAIL as required"); мутация (махни
`ORCHESTRATOR.md` от `skills/work/SKILL.md` на работно копие) → selfcheck exit 1 с името на дома;
VERIFY 8/8 exit 0 (по каданса: пълните при затваряне).
**Risk threshold:** блокира различна формулировка на списъка в двата скила спрямо региона; пин,
който минава зелен при махнат дом; какъвто и да е файл извън `skills/mission`, `skills/work`,
`scripts/selfcheck/`, `skills/README.md`, `docs/README.md`, `CHANGELOG.md` в диффа.
**Stop condition:** acceptance зелен → стоп.
**Review:** `Class: code` → Codex (1 пас), fact-check преди; cap 2.
**Assignee:** Колега. Branch `main`.

### HARD-016 [R2 docs-class] — seed-ът `dispatch-waits-for-operator-word` печата отменено четене на guard (b); операторска реплика става правило само по негова дума (роден 2026-09-21, операторска дума)

**Outcome:** нищо, което `/pnp:setup` печата в паметта на нова инсталация, не казва обратното на
доктрината; guard (b) се чете еднозначно до „една дума на пас"; guard (g) казва изрично, че
произходът „операторът го каза" не освобождава записа от гейта.

**Наблюдение (проверено първолично, 2026-09-21):** `templates/memory-seeds/dispatch-waits-for-operator-word.md`
завършва с „a notification, not a question" — четене, което `docs/WORKFLOW.md:210-214` обявява
за REVOKED; seed-ът е `[R]` (`templates/README.md:32-34`: „point at the doctrine section rather
than restating it"), а преразказва отменената версия. Второто му изречение „After the word, the
loop runs to the end without asking again" стои и в самия guard (b) (`:202`) до „една дума на
пас" (`:157-162`). Механизмът, назован от оператора: ситуативна негова реплика, записана като
стоящо правило (Furnissimo — пет такива записа, проверени на 2026-09-21). Останалите 16 seed-а
са прегледани: без друг сблъсък.

**Обхват:**
1. Seed-ът става указател по `[R]` определението: две-три изречения, сочат guard (b), без
   „notification" и без „runs to the end" като самостоятелно правило.
2. `docs/WORKFLOW.md:202`: „After the word, the loop runs to the end of what the word covers
   without asking again - every further paid pass takes its own word (§ The operator does not
   arbitrate engineering decisions)" — едно уточнение, нищо друго в guard (b).
3. `docs/WORKFLOW.md` guard (g), едно изречение: операторска реплика е стоящо правило само когато
   операторът я обяви за такава; записът на правило казва чие е обобщението; произходът
   „операторът го каза" не освобождава от гейта — той е причината записът да е опасен.
   **[ОПЕРАТОРСКА ДУМА 2026-09-21, механизмът за случайния потребител:]** дефолтът е „за момента";
   когато COO би записал операторска реплика като правило, пита ВЕДНЪЖ, на място — „за този
   тикет, или отсега нататък?" — и само „отсега нататък" минава през guard (g) (показан текст,
   одобрение) към овъррайд документа или плана, никога тихо в паметта. Един въпрос, само в този
   момент; нищо не се гадае от контекста. Инстанции: Furnissimo (4 промоции, 2026-09-21),
   Silerax `feedback_review_cadence.md:11-13` („за момента", записано като правило).
4. `docs/WORKFLOW.md` § COO owns broad scans, tripwire (4): seed-овете под `templates/memory-seeds/`
   са дом на изброяването при всяка доктринна промяна — closing grep-ът ги обхваща.
5. `CHANGELOG.md` — ред в блока на 0.2.9 (`### Fixed`).
6. **[ДОБАВЕНО 2026-09-21, находка на Furnissimo COO при прегледа на списъка]** `docs/WORKFLOW.md:311-314`
   (§ Planning lock: „It may also update its own agent-local memory… these memory updates need no
   separate approval") противоречи на guard (g) в същия файл. Решение (COO, 2026-09-21): guard (g)
   е по-новото (0.2.7, D10) и по-тясното (правило-носещи записи) — печели; `:311-314` получава
   едно уточнение: без отделно одобрение са ФАКТИТЕ и предпочитанията, а правило-носещ запис в
   паметта минава през guard (g) и под planning lock. Acceptance: `grep -n "need no separate
   approval" docs/WORKFLOW.md` → редът носи уточнението „(facts and preferences; a rule-bearing
   memory write goes through guard (g))" или еквивалент, проверен от fact-check гейта.
**Извън обхват:** останалите seed-ове; `templates/CLAUDE.md.tmpl` (регионът вече казва вярното);
код — ако някоя пинната в self-check-а фраза (`DOCTRINE_*` константите) се промени с тези редове,
тикетът се рекласифицира в code-class по правилото и пинът пътува с текста.
**Acceptance:** `grep -rn "notification, not a question" templates/memory-seeds/` → празно;
`grep -rn "runs to the end without asking again" templates/memory-seeds/` → празно;
`grep -n "Reinforces payload" templates/memory-seeds/dispatch-waits-for-operator-word.md` → 1 ред;
`grep -n "declares it so" docs/WORKFLOW.md` → ред в guard (g); `grep -n "every further paid
pass takes its own word" docs/WORKFLOW.md` → ред в guard (b);
`node scripts/update/validate-payload.mjs --plugin-root .` → exit 0; selfcheck exit 0 (или
рекласификация, ако пин мръдне).
**Risk threshold:** блокира seed, който пак преразказва вместо да сочи; второ копие на правило от
guard (g) другаде; какъвто и да е файл извън `templates/memory-seeds/`, `docs/WORKFLOW.md`,
`CHANGELOG.md` в диффа (изпълним артефакт → code loop).
**Stop condition:** acceptance зелен → стоп.
**Review:** `Class: docs` → Codex (1 пас), fact-check преди; cap 2.
**Assignee:** Колега. Branch `main`.

## 0.2.7 — Environment correctness · tag `v0.2.7` (операторска дума 2026-09-16: HARD-013; ЗАМРАЗЕНО до края на консолидацията. HARD-014 ОТПАДНА — беше „Одитор с resume на сесията"; темата отива където консолидационното решение я прати)

### HARD-013 [R2 code-class] — self-check-ът хваща кой да е `bash` от PATH; на WSL bash пада 52 пъти и `--apply` връща 1 въпреки приложените миграции (роден 2026-09-15 от консуматорски рън, ЧАКА ОПЕРАТОРСКА ДУМА)

**Наблюдение (консуматор Furnissimo, 2026-09-15).** `/pnp:update` 0.2.4 → 0.2.5: `--check` чист,
трите операции приложени чисто (регионът пре-рендиран без диалог, reviewer.md пропуснат), нула
конфликта — но self-check-ът отчете **52 FAIL, всичките в bash канала**, и `--apply` излезе с
**exit 1**. Съобщенията: `/bin/bash: C:Usersdyosi.claudepluginscache…codex-review.sh: No such file
or directory` — Windows пътят стига до bash с изядени разделители.

**Диагноза (COO, първолично, 2026-09-15).** НЕ е абсолютният път: рън тук с
`--plugin-root "D:\promptandpray"` (абсолютен, с backslash-ове) дава **1026/1026, нула FAIL**, и
сh-каналните EXECUTED тестове се изпълняват и минават. Причината е **кой `bash` се хваща**: машината
носи три — `C:\Program Files\Git\usr\bin\bash.exe` (MINGW64, преобразува Windows пътища),
`C:\Windows\System32\bash.exe` (WSL) и WindowsApps alias-ът. Self-check-ът вика `bash` по ГОЛО ИМЕ и
наследява PATH-а на сесията: при Git bash тестовете минават, при WSL bash пътят е безсмислен низ и
падат. Това обяснява и противоречието в записите: consumer proof-ът от 2026-09-14 отчете
`PASS 1027/1027` на същата машина и същата версия, а днешният — 52 FAIL. Не е недетерминизъм.

**Две половини (втората е по-тежката):**
1. sh-каналните EXECUTED тестове се въртят безусловно, щом СЪЩЕСТВУВА някакъв `bash` — а на проект
   с `os: windows` sh-каналът не е работният; PowerShell-каналните и hook тестовете са минали.
2. **`--apply` пропагира exit 1 СЛЕД като миграциите вече са приложени** — консуматорът вижда
   „провален" ъпдейт, който е успял; бookkeeping-ът и `--check` след това са чисти.

**Извън обхват до операторска дума:** какъвто и да е код. Тикетът е вписан и СПРЯН по guard (b).
**Открити въпроси за брифа (не решавани сега):** дали sh-каналът се пропуска като `[NOTE]` на
win32, когато разрешеният `bash` не вижда Windows пътища, или пътищата се подават POSIX-конвертирани
на всеки bash; и отделно — какъв да е exit кодът на `--apply`, когато миграциите са приложени, а
self-check-ът е червен (днес: 1; кандидат: успех + видимо предупреждение, защото откатът не се
случва).

## Ред и гейтове

**COO модел за останалите тикети (операторско решение 2026-09-14, по COO препоръка):** Опус като
COO е приемлив за HARD-006, HARD-008, HARD-010 и HARD-011 (доктрина/докс обем + release-open по
записания двукратен образец) и приемлив с внимание за HARD-007 (release церемонията на 0.2.5 е
записана в records 0.2.3/0.2.4 — рискът е гейтова дисциплина, не код); HARD-009 остава на Fable
(единственият enforcement-код тикет: Gate 2 lookup, изнесен production helper, `--resolve`
re-apply, naming assertion). Одиторът е Codex на всички → „auditor never below author" не се
засяга; Writer pin-ът и fact-check tier-ът не зависят от COO модела.

Изпълнителен ред: HARD-001 → HARD-002 (+release 0.2.3) → HARD-003 → HARD-004 (+release 0.2.4)
→ **HARD-012 (пръв в 0.2.5 — операторска дума 2026-09-14: коригиращият доктрината тикет не чака
козметиката)** → HARD-005 → HARD-006 → HARD-007 (+release 0.2.5) → HARD-008 → HARD-009 →
**release 0.2.6 (самостоятелен, операторска дума 2026-09-16 — HARD-010/011 излязоха от
изданието)** → [ЗАМРАЗЕНО ОТТУК: HARD-013 → HARD-010 → HARD-011 (+release 0.2.8); HARD-014
отпадна] — редът след замразяването се потвърждава от консолидационното решение. Вторите
имена — в таблицата под header-а.

Гейтове: всеки тикет — собствена дума за диспач; commit — клик (стейдж по изрични пътища,
едноредово съобщение, нула trailers, PLAN файлът и трите EOL-дрейфащи `.ps1` извън кодовия
commit); docs commit отделен; tag/push — дума + диалог всеки; пас над таблицата или рунд над
cap 2 — отделна дума всеки. Route-state при всеки диспач, `{}` при close; completion record
веднага след commit-а, същата сесия. Верификация: рънът на Колегата + независим COO-диспачнат
рън (Одиторската клетка не пуска суитите — не се приема отчет); двата example цикъла и
`test-update` във фон, без паралелни редакции. **VERIFY каданс (COO решение 2026-09-13):**
пълните 8/8 гейтват затварянето на тикета (преди commit клика) — веднъж, с точни кодове;
междинен корекционен рунд ре-рънва само засегнатите суити; доктрина/docs тикети въртят на рунд
бързите три (selfcheck, validate-payload, plugin-validate), а пълните 8/8 — на release тикета
на изданието преди tag-а.

Readiness на този план: COO self-pass (шестте проверки, отделен ход) → fact-check (+ „every
acceptance command exists and can fail") → Codex pass 1 (`Class: plan`, `gpt-5.6-sol`/high) →
ревизия → pass 2 (брифът носи листата на pass 1; нов блокер декларира произход) → при
остатък: дума за pass 3 (hard max). Планът се копира в `dev/backlogs/active/` с операторската
дума (guard (e)) и се комитва сам преди първия тикет (образецът 004 т.10).

## Verification (края на мисията)

- VERIFY 8/8 exit 0 на `main` @ closeout hash; Cyrillic grep празно; `claude plugin validate .`.
- `git ls-remote --tags origin` носи v0.2.3/v0.2.4/v0.2.5/v0.2.6/v0.2.7/v0.2.8 на кодовите им
  commit-и; `origin/main...main` = `0 0`; CI: windows+ubuntu зелени (macos advisory).
- `node scripts/update/aiwf-update.mjs --check --project-root .` → „up to date …" на финалната
  версия (0.2.8); `validate-payload`: последният манифестен запис == финалната версия; fixture —
  поредният `_example-bump` на финалното издание.
- Consumer proof записан per издание в completion record-ите (вкл. ръчния пас на втория
  консуматор за 0.2.3).
- Архивиране: `git mv` към `dev/backlogs/archive/<NNN>_PLAN_HARD_<YYYY-MM-DD>.md` (датата на
  архивиране; конвенцията, която HARD-009 внася) в мига на последния затворен тикет (същата
  сесия, неподканено).
