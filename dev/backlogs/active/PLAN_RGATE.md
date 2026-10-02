# PromptAndPray — readiness артефактите стават условие за платения пас (PLAN_RGATE)

> **ОДОБРЕН 2026-10-02** (операторска дума „да“) след readiness пасове 1–3 (Codex `gpt-6-sol`/xhigh: NEEDS-FIX 9 → 4 → 2, последните два затворени в r7 без пас по операторска дума „1“). Чернова и артефакти: `.aiwf/plan/RGATE/` (ledger, consequence-scan, own-pass, revisions). Изпълнението на RGATE-001 чака собствена дума.

> Роден 2026-10-02 от предложението на консуматора (сесия „Silerax Plan Session 02“, cross-session
> съобщение същия ден, с измервания от неговото дърво) и от становището на COO-то в отговор.
> Операторска дума 2026-10-02 „пускай плана“ = планова сесия: inventory → чернова → behavior ledger →
> consequence scan → fact-check → own pass → readiness пас 1 (`Class: plan`, Codex `gpt-6-sol`/xhigh,
> студен). Пас 2 — само на отделна операторска дума. Изпълнението чака отделна дума след readiness;
> планът влиза в `dev/backlogs/active/` при одобрение (guard (e)).
>
> Издание: **0.2.15**, вози се на единствения тикет. HARD-011 остава 0.3.0 в PLAN_HARD.

## Контекст (inventory 2026-10-02: 3× Explore/sonnet; котвите се проверяват при диспач)

**Проблемът (данни на консуматора, неговото дърво и `.aiwf/`; разказ, не измерване тук):** пет
поредни durable плана върнаха 10+ авторски блокера на readiness пас 1 — 11, 10, 11, 12, 13 — при
приложени Step 2a ledger и Step 2b fact-check (5 агента, 597 твърдения, 62 FALSE, 115 gaps). Блокерите
на пас 1 бяха предимно ЛИПСВАЩИ ПРАВИЛА, не неверни факти; ledger-ът и fact-check-ът проверяват
какво планът КАЗВА и не могат да намерят какво той НЕ казва. Собственият проход на COO-то (WORKFLOW
§ Plan readiness review, „SEPARATE turn“) беше пропуснат или слят с писането в пет цикъла от пет.
Тестван там проектно-локално „consequence scan“ (sonnet агент на тикет, обратна посока — от всяко
решение към дървото): 102 реда над един вече ревизиран план, 4 от тях критични дефекти, които самата
ревизия беше внесла. Принуден собствен проход в отделен ход над същия два пъти ревизиран план: 14
авторски блокера, шест инструмента пуснати с валиден и счупен вход. Операторът там: „аз нямам
инструмент с който да те накарам следващата планова сесия да го направиш“; „аз тези артефакти не ги
чета и нямам намерение да ги чета“.

**Какво има payload-ът днес (verified в inventory):**
- `skills/review/SKILL.md` — Step 2 (`:132-195`, diff скелет; `:141` `Class:`; `:153` `PREVIOUS PASS
  BLOCKERS`), Step 2a behavior ledger (`:197-238`), Step 2b fact-check (`:240-319`, три допълнителни
  реда за readiness `:280-301`), Plan-readiness mode (`:321-376`; предусловие `:326-331`; бриф
  `:338-348`), Step 3 codex (`:380-514`; брифът във фиксиран файл `:387`, команди `:393-404`), Step 3
  claude (`:516-558`; брифът е `prompt` на Agent-а, файл не се пише).
- Плановият бриф днес НЕ предписва `Class:` ред (`:338-348`); `COVERED BY` живее само в
  `templates/ORCHESTRATOR.md.tmpl:66-83`. Никой скрипт не парсва ревю бриф (`scripts/`, `hooks/` —
  нула; единственият парсер на бриф ред е `Ticket:` на Gate 2, `scripts/engine/pretooluse-dispatch-gate.js:57`).
- `docs/WORKFLOW.md` § Plan readiness review `:351-466`: inventory `:375-384`, собствен проход
  `:386-404` („SEPARATE turn“ `:388-389`), dry trace `:406-420`, цикъл `:422-453`, шестте проверки
  `:455-463`. Gate 2 в § Roles `:30-32`.
- `docs/LOOP.md` Gate 2 `:128-144`. `docs/OPERATOR_PROTOCOL.md` § What is guaranteed `:30-86` (Gate 2
  `:37-45`). `docs/READINESS_CLASSES.md:7-8`. `README.md:37-42` (Gate 2), `:213-219` (одитна таблица),
  `:21` (версия).
- `templates/ORCHESTRATOR.md.tmpl` § Behavior ledger duty `:171-186` (managed artifact; rerender с
  миграция, образец `migrations/0017_behavior-ledger/ops.json`, `0018_verdict-own-turn/ops.json`).
- Wrapper-ите: `scripts/native/ps/codex-review.ps1` — `$HasClass` `:82`, resume клон `:195-198`
  (`Set-Location` към project root), празен бриф `exit 2` `:200-203`, извикване `$Prompt | & codex
  @codexArgs` `:328`; `scripts/native/sh/codex-review.sh` — `PROJECT_ROOT_ABS` `:161-162` (преди
  `cd`), resume `cd` `:210-213`, `PROMPT="$(cat)"` `:219`, празен бриф `:220-222`, извикване `:336`.
  Няма валидиране на съдържанието на брифа. Няма споделен helper между wrapper-ите.
- Gate 2: `scripts/engine/pretooluse-dispatch-gate.js` (284 реда) — всичко различно от `writer` е
  passthrough на `:270`; режими always/off-plan `:272-280`; fail посоката е ASK (`:32-34`,
  `lib.runFailAsk` `:247`); гейтът днес никога не връща deny. `scripts/engine/aiwf-lib.js` експортира
  `denyPreTool` (`:81`). `hooks/hooks.json` — три hook записа; self-check-ът заковава точно три
  (`aiwf-selfcheck.js` sectionHookWiring `:2205-2250`).
- Тестове: self-check Gate 2 `:729-777`, `:792-969`, `:1044-1233` (reviewer + `prompt:'x'` → silent
  на `:757-758`; reviewer + `Ticket: DEMO-2` → silent на `:845`); spikes `scripts/spike/run-spikes.mjs`
  `gate2Cases` `:217-228` (reviewer `:219`); wrapper статични пинове PS `:2335-2839` (ASCII-only
  `:2370-2378`, STDIN regex `:2358`, `-Class` пинове `:2409-2417`, PS stub `runPsWrapperWithStub`
  `:2712-2793`, винаги `-Class code`
  `:2781`), sh `:2868-3283` (точно четири `.sh` файла `:2929-2930`, LF/ASCII/shebang `:2931-2946`,
  `PROMPT_ON_ARGV`, stub `:3389-3427`, `STUB_EXIT = 7` `:3296`, класови probe-ове `--class docs`
  `:3260`, `--class ''` `:3274`), контроли `:3470-3630`. Нито един probe не подава `plan` на wrapper.
- CI `.github/workflows/ci.yml`: self-check-ът на трите крака пуска и двата канала; shellcheck на
  ubuntu (`:85`). Нов `.mjs`/`.js` не изисква запис в validate-payload; провенанс: `.js` е сканиран.

## Решения (COO; всяко с един ред защо)

- **D1. Payload, не проектно-локално.** Дефектът е общ (правило само в проза, пропускано под натиск),
  а identity-то на PnP казва, че правило, което живее само в документ, където гейт може да го носи,
  е дефект (`dev/PROJECT_OVERRIDES.md` § Identity, „advice“).
- **D2. Един checker, два входа.** `scripts/engine/plan-gate.js` (CommonJS, нула външни
  зависимости: `fs`, `path`, `crypto` и `./aiwf-lib`) — модул за Gate 2 и CLI за wrapper-ите и за
  COO-то (`--hash`). Не в
  `scripts/native/sh/` (каналът е точно четири файла, `aiwf-selfcheck.js:2929-2930`), не като нов
  hook (self-check-ът заковава три).
- **D3. Codex: в wrapper-а, не в Bash hook.** Wrapper-ът вече държи брифа от stdin и се пуска само
  за ревю; hook на `Bash|PowerShell` върви на всяка shell команда, а Gate 4 нарочно не чете файлове.
- **D4. Claude: в Gate 2, като DENY.** Gate 2 вече седи на `Agent`; ask диалог, който операторът
  кликва без да чете, не налага нищо — затова deny. Грешка вътре (throw, нечетим payload) остава ASK:
  посоката при грешка НЕ се обръща (`dev/PROJECT_OVERRIDES.md` § Architecture direction — обръщане е
  R3; това не е обръщане, а ново решение върху четим бриф). **Заето обещание, казано на глас:**
  `ask` на `Agent` е наблюдаван на живо (`pretooluse-dispatch-gate.js:36-39`); `deny` на `Agent`
  почива на общия PreToolUse договор от документацията (hooks reference, „Decision control“:
  `permissionDecision` allow/deny/ask/defer; изключение е само `EndConversation`) — Agent-специфично
  поведение там не е описано (прочетено 2026-10-02 през claude-code-guide агент:
  code.claude.com/docs/en/hooks, „Decision control“ и „Exit code 2 behavior per event“), и нищо в
  това репо не наблюдава хоста. Header-ът на Gate 2 и блок L го
  казват в регистъра на Gate 4 (`docs/LOOP.md:197-204`). Живото наблюдение на един отказан plan
  dispatch е операторско (`dev/PROJECT_OVERRIDES.md` § Hard rules: сесия, пусната да наблюдава гейт
  на живо, е на оператора) и не е условие за изданието.
- **D5. Разпознаване — по флага ИЛИ по реда в брифа.** Ред `Class: plan` се разпознава САМО от
  колона 0 (без водещ интервал; ключът точно `Class:`, стойността без значение на регистъра,
  допуска се краен `\r`) — така отстъпен ред в поставен текст или в diff не прави code бриф на
  plan бриф (scan ред 7). Codex: гейтът тръгва, когато `-Class` / `--class` е `plan` ИЛИ брифът носи
  този ред — затваря безкласовия рецепт и `-Class code` с plan бриф (scan редове 1-3). Claude:
  `subagent_type` е точно `reviewer` И prompt-ът носи този ред. Всичко друго — непроменено поведение.
- **D6. Петте реда на брифа** (всеки на свой ред, от колона 0, точно веднъж; доктрината пише
  пътищата ASCII и относителни към project root, checker-ът резолвира и абсолютни с
  `path.resolve`): `Class: plan`, `PLAN: <path>`, `TICKETS: <REF>[, <REF>...]`,
  `CONSEQUENCE SCAN: <path>`, `OWN PASS: <path>`. `TICKETS` е обхватът на прохода — така разширен
  план (нов тикет в стар план) не иска редове за затворени тикети. Продължението на прекъснат plan
  пас (`SKILL.md:489-495`) носи същите пет реда — планът не е сменен, хешът важи (scan ред 4).
  Checker-ът ПРОВЕРЯВА и петте (r3, пас 1 #3); `Class: plan` е и редът, по който plan брифът се
  РАЗПОЗНАВА (D5) — на codex клона флагът `plan` пуска проверката и без него, но тогава липсата му е
  `line-missing:Class`, а не пропуск; на claude клона без него няма разпознаване. Пътищата в редовете са ASCII
  и относителни към project root по правило (Step 2d) — абсолютният root минава по argv, не по
  stdin, така че кодирането на stdin на PowerShell не ги докосва (ledger ред 8).
- **D7. Брои се от файла, не от брифа.** Брифът носи само пътища; редовете, затварянията и хеша се
  четат от файловете (самоотчетено число в брифа не доказва нищо).
- **D8. Собственият проход е ПОСЛЕДНИЯТ акт над плана** — след 2a, 2c и 2b — и носи SHA-256 на
  плановия файл. Всяка редакция след него сменя хеша и пасът отказва: така „над текста, който
  тръгва“ е доказуемо, а „отделен ход“ — не (honest limit).
- **D9. Ред на стъпките, без преименуване.** 2a ledger → 2c scan → 2b fact-check → 2d own pass. Step
  2b НЕ се преименува: към него сочат WORKFLOW, LOOP, READINESS_CLASSES и паметите на консуматорите.
- **D10. Скан, не по-висок модел.** Сканът е sonnet (измерено там: той намери дизайн дупките);
  собственият проход остава на COO-то — затварянето на редове и шестте проверки са решения,
  неделегируеми по § COO owns broad scans. Принуденият проход там намери 14 → проблемът е
  пропускането, не слепотата; лекът е принуда, не аутсорс.
- **D11. Инструмент, който не може да падне, се хваща механично:** клетките „valid input“ и „broken
  input“ на един ред не може да са еднакви (tripwire 4 на § COO owns broad scans).
- **D12. Един тикет, едно издание.** Форматите, които checker-ът налага, и прозата, която ги описва,
  са един договор — разделени в два тикета биха се ревюирали поотделно срещу различни истини.
- **D13. Маршрут: R2 без QA стъпка** (пас 1 #7). Тикетът ИМА наблюдаемо поведение — отказът на
  wrapper-а и deny-ят на Gate 2 — но QA в този loop е съдия на артефакти от E2E runner
  (`docs/LOOP.md:72-84`), а E2E е изключен в този проект (`.claude/aiwf-native/aiwf.config.json:229-230`,
  `verify.e2e.enabled: false`), така че QA няма какво да прочете (scan ред 51). Наблюдаемото
  поведение се доказва с изпълнени probe-ове в self-check-а и spikes (M/W/G) — Test policy редът
  „hooks / gates“ (`dev/PROJECT_OVERRIDES.md:190-197`). Маршрут: COO → Колега → `/pnp:review`
  (code) → COO; QA пас няма и не се иска дума за него. **Решено от оператора 2026-10-02** („QA
  няма да има“; записано в `dev/backlogs/CANDIDATES.md` § Ruling ledger), след като readiness пас 2
  оспори D13 (WORKFLOW `:742` насочва наблюдаемо R2 поведение през `/pnp:qa`;
  `skills/qa/SKILL.md:59` казва, че изключен E2E спира QA) — спорното дизайн решение отиде при
  оператора по ORCHESTRATOR § Escalation, не се реши с рунд. D13 е записано операторско изключение
  за ТОЗИ тикет от правилата, които иначе биха поръчали QA: `docs/LOOP.md:15`,
  `skills/loop/SKILL.md:73-74`, `docs/WORKFLOW.md:742` и `:770`, `CLAUDE.md:51`,
  `dev/PROJECT_OVERRIDES.md:297`; правилата не се пипат.
- **COO routing (WORKFLOW § COO routing):** проверка 1 = ДА (Gate 2 е част от permission модела на
  плъгина — hook със ново deny решение); 2 = не (r2: отвореното „решава се на мястото“ от r1 е
  затворено — пътят на кодовия пас е фиксиран в „Ред и гейтове“ т.3), 3, 4 = не → тикетът се води
  от COO на top tier.

**Отхвърлени:** PreToolUse hook на `Bash|PowerShell` (виж D3); ask вместо deny на Claude хоста (D4);
opus агент за собствения проход (D10); броячи `N rows, N closed` в брифа (D7); mtime вместо хеш
(редакциите след fact-check-а са легитимни, но хешът ги прави видими — mtime не различава съдържание);
изискване за покритие на ВСИЧКИ тикети на плана (чупи разширени планове — D6).

## Тикет

### RGATE-001 [R2 code-class] — consequence scan, собственият проход като файл, и гейт преди plan-class пас; release 0.2.15

**Outcome:** (1) `/pnp:review` носи Step 2c (consequence scan) и Step 2d (собственият проход като
файл, със SHA-256 печат), плановият бриф носи петте реда на D6; (2) `scripts/engine/plan-gate.js`
проверява брифа и трите файла и връща всички проблеми наведнъж; (3) `codex-review.ps1`/`.sh` отказват
plan-class рън (по флага или по реда `Class: plan` в брифа) с exit 2 преди engine-а, а Gate 2 отказва
(deny) Claude `reviewer` dispatch с този ред, когато проблем има; (4) WORKFLOW, LOOP,
OPERATOR_PROTOCOL, READINESS_CLASSES, README, `hooks.json` описанието, loop скилът, двата wrapper
документа и ORCHESTRATOR шаблонът казват същото, с honest limit-а; (5) self-check и spikes държат матрицата с
негативни контроли, видени червени; (6) издание 0.2.15 с миграция `0019_plan-readiness-gate`.

**Checker договор (`scripts/engine/plan-gate.js`) — точен:**

- Експорти: `checkPlanBrief(briefText, projectRoot)` → `{ ok: boolean, problems: [{ token, message }] }`
  (всички проблеми, в реда по-долу; `ok` е `problems.length === 0`); `planHash(absPath)` → lowercase
  hex SHA-256 на текста на файла, прочетен като UTF-8 и с `\r\n` → `\n` (LF-нормализиран, както
  всеки хеш в engine-а, `scripts/setup/generate.mjs:142` — CRLF/LF презапис не е редакция; scan ред
  13); `isPlanBrief(text)` → true при ред `Class: plan` от колона 0, точно по
  `/^Class:[ \t]*[Pp][Ll][Aa][Nn][ \t]*\r?$/m` (ключът — точен, стойността — без регистър). Модулът
  изисква `./aiwf-lib` за `readStdin` и `refRegex`; нищо друго. CLI флаг `--plan-class` казва „флагът
  на wrapper-а беше plan“: тогава проверката тече и при бриф без `Class:` ред — който тогава е
  `line-missing:Class` (r3); без флага CLI-ят проверява само ако `isPlanBrief(brief)`, иначе exit 0
  без изход.
- CLI: `node plan-gate.js --project-root <root>` — брифът на stdin, прочетен с `lib.readStdin()`
  (`aiwf-lib.js:64-72`); exit 0 без изход при ok; иначе
  exit 2 и по един ред на проблем на stderr `plan-gate: <token> - <message>`, плюс последен ред
  `plan-gate: refused - see /pnp:review Steps 2c and 2d`. `node plan-gate.js --hash <file>` — stdout
  `PLAN SHA256: <hex>` и exit 0; нечетим файл → exit 2. Друг аргумент → exit 2 с usage. Неочаквана
  грешка → exit 2 с `plan-gate: internal-error - <message>` (wrapper-ът отказва — безопасната посока
  за платен пас).
- Редове на брифа (regex на ред, multiline, ОТ КОЛОНА 0): `^<NAME>:[ \t]*(\S.*?)[ \t]*\r?$` за
  ВСИЧКИТЕ пет — `Class`, `PLAN`, `TICKETS`, `CONSEQUENCE SCAN`, `OWN PASS` (пас 1 #3) — отстъпен
  пример в инструкциите не се брои (ledger ред 18). Липсващ → `line-missing:<NAME>`; повече от един →
  `line-duplicate:<NAME>`; `Class` ред, чиято стойност не е `plan` (без регистър) → `class-not-plan`
  (напр. `--plan-class` + `Class: code`). Дублиран ред не дава стойност: всяка проверка, която
  зависи от него, се пропуска (дублиран `PLAN` → нито `tickets-not-in-plan`, нито хеш; дублиран
  `TICKETS` → нито покритие; дублиран път → нито проверка на този файл).
  `TICKETS` се дели на `,` и интервали; всеки ref трябва да е от азбуката на `TICKET_LINE` на Gate 2
  (`^[A-Za-z0-9][A-Za-z0-9_-]*$`, `pretooluse-dispatch-gate.js:57` — стари планове с други имена
  остават допустими; scan ред 12; иначе `tickets-bad-ref:<text>`) и да е ЗАГЛАВИЕ на тикет в PLAN
  файла: markdown заглавие, чийто ПЪРВИ токен след `#`-овете е ref-ът —
  `^#{1,6}[ \t]+<REF>(?![A-Za-z0-9_-])` — и което стои ИЗВЪН ограден блок. Заглавие, което само
  споменава ref-а (псевдоним в скоби, „Release … HARD-008“), не е тикет (scan ред 41; проверено върху
  архива: `## P8`, `## AUD-001`, `### DEV-001`, `### HARD-021` минават, scan ред 42); споменаване в
  прозата не е тикет (WORKFLOW `:674-677`: ref без ticket section е счупен lookup; пас 1 #1).
  Граматиката на оградите (пас 2 нов #1): отваряща ограда е ред с до три водещи интервала, после три
  или повече ```` ` ```` или три или повече `~`, по желание info низ (```` ```text ````); затваряща е
  ред с до три водещи интервала, същия знак, поне същата дължина и нищо друго освен интервали;
  по-къса ограда вътре в по-дълга не затваря; незатворена ограда тече до края на файла (безопасната
  посока — заглавията след нея не се броят и ref-ът е `tickets-not-in-plan`); всичко между
  отварящата и затварящата се прескача. Разликата с Gate 2 е нарочна: Writer lookup-ът
  (`pretooluse-dispatch-gate.js:115-165`) пита „има ли ref-ът активен план“ и го намира навсякъде в
  текста, а този гейт пита „ref-ът тикет ли е на плана под ревю“. `refRegex` ЗАЕДНО с `escapeRe`, от който зависи, е ПРЕМЕСТЕН от
  `pretooluse-dispatch-gate.js:59` и `:109-117` в `aiwf-lib.js` и експортиран оттам — един източник
  за двамата (scan ред 11; иначе
  `tickets-not-in-plan:<REF>`). Пътят се резолвира с `path.resolve(projectRoot, p)`; не обикновен
  файл → `file-missing:<NAME>`.
- Таблици (markdown): заглавен ред, започващ с `|` (след водещи интервали), следван от разделител
  `|---|...` (по `:?-{3,}:?` на клетка); редовете с данни са следващите редове, започващи с `|`, до
  първия, който не започва. Редовете се делят на `\n` и крайният `\r` се маха. Клетките се делят на
  `|`, освен `\|`; след деленето `\|` става `|`; trim; външните празни клетки от крайните `|` се
  махат. Заглавията се сравняват lowercase след trim.
- CONSEQUENCE SCAN файл: scan таблица е таблица със заглавие ТОЧНО `# | ticket | decision | surface |
  violation | closure` (шест клетки, lowercase след trim — форматът на Step 2c; пас 1 #2, незатворен
  след пас 2: таблица с четири колони, която изпуска `surface` и `violation`, се отказва — виж
  `scan-bad-header` по-долу); няма нито валидна, нито „лоша“ scan таблица → `scan-no-table`. ВСЯКА таблица с това заглавие във файла се чете и редовете им се
  събират (делта сканът добавя нова таблица под заглавие на секция). Всеки ред извън ограден блок
  (същата граматика на оградите като за плана), който започва с `|` и чиито първи две клетки са `#`
  и `ticket`, е заглавие на scan таблица, С ИЛИ БЕЗ разделител под него; ако не е точно шестте
  колони, е `scan-bad-header:<номер на реда>`, редовете под него не се проверяват, и
  `scan-no-table` не се добавя (пас 3 нов #1: четириколонна делта таблица с отворен ред иначе би
  минала тихо до валидна). Ако scan таблица свършва на
  ред, който започва с цифри и `|` без водещ `|` (формата, в която агентът връща редове), това не е
  тих край на таблицата, а `scan-row-shape:<номер на реда>` — Step 2c казва, че COO-то записва
  редовете с водещ и краен `|`. Ред с различен брой клетки от
  заглавието → `scan-row-shape:<номер на реда във файла>`. Празна клетка извън `closure` →
  `scan-empty-cell:<номер на реда>` (пас 1 #2). Closure, която НЕ започва (lowercase, след trim) с
  `plan:` или `no defect:` → `scan-open-row:<номер на реда във файла>` — бял списък, не черен: `later`,
  `n/a` или празно са отворени (не `#` клетката — тя може да се повтаря; ledger ред 21). Всеки ref от
  TICKETS трябва да е в `ticket` клетката на поне един ред → иначе `scan-ticket-missing:<REF>`.
- OWN PASS файл: ред `^PLAN SHA256:[ \t]*([0-9a-fA-F]{64})[ \t]*\r?$` точно веднъж (иначе
  `own-hash-missing`), равен lowercase на `planHash(PLAN)` (иначе `own-hash-mismatch`); ред `^BLOCKERS
  FOUND:[ \t]*([0-9]+)[ \t]*\r?$` точно веднъж (иначе `own-blockers-missing`). Таблица със заглавие точно
  `ticket | repo-match | scope | discovery | order | acceptance | git` (иначе
  `own-checks-table-missing`); ред с друг брой клетки → `own-checks-row-shape:<номер на реда>`; празна
  клетка → `own-checks-empty-cell:<ticket клетката>`; ref от TICKETS без ред → `own-ticket-missing:<REF>`.
  Таблица със заглавие точно `instrument | valid input | broken input` с ≥ 1 ред (иначе
  `own-instruments-missing`); ред с друг брой клетки → `own-instrument-shape:<номер на реда>`; празна
  клетка или `valid input` == `broken input` след trim → `own-instrument-cannot-fail:<пореден номер на
  реда в таблицата, от 1>`.
- `TICKETS` без нито един ref след деленето → `tickets-empty`, и проверките за покритие (scan и own
  pass) се пропускат. Ref с `tickets-bad-ref` или `tickets-not-in-plan` се изключва от проверките за
  покритие (без производни `scan-ticket-missing` / `own-ticket-missing` за него). `ticket` клетката
  се сравнява с ref-а по равенство след trim (не „съдържа“).
- Ред на проверките (и на изхода): редовете на брифа → TICKETS → файловете → scan → own pass. Ако
  липсва ред или файл, проверките, които зависят от него, се пропускат (не се трупат производни
  проблеми); всичко независимо се проверява.
- Не-plan бриф без `--plan-class` → exit 0, преди всяка друга работа. `internal-error` (exit 2) е
  само по пътя на plan бриф; грешка при четене на stdin без `--plan-class` → exit 0 и един ред
  `plan-gate: brief unreadable, not a plan-class run - passing` на stderr — дефект в checker-а не
  може да откаже code пас (Risk threshold).

**Worklist (котви от inventory; Колегата ги отваря преди да пише):**

1. **`scripts/engine/plan-gate.js`** — нов, по договора горе. Header коментар в стила на
   `pretooluse-dispatch-gate.js:1-44`: какво доказва, какво не (honest limit-а от т.6 по-долу),
   защо `TICKETS`, защо хеш.
2. **`scripts/native/ps/codex-review.ps1`** — РЕШЕНИЕТО „plan ли е“ Е НА CHECKER-А (D5; един
   източник, без копие на regex-а в двата shell-а): wrapper-ът винаги подава брифа на CLI-я, с
   `--plan-class` когато флагът е `plan`. (a) Непосредствено преди resume клона (`:195`):
   `$PlanGateRoot = (Resolve-Path -LiteralPath $ProjectRoot).ProviderPath` — абсолютен, преди
   `Set-Location` (ledger ред 6); неуспех → `Write-Error` + `exit 2` (недостижимо на практика: без
   project dir резолверът връща фабричния `claude` и wrapper-ът вече е излязъл на `:93-97`). (b) След
   проверката за празен бриф (`:200-203`): `$planGateArgs = @('--project-root', $PlanGateRoot)`; при
   `$HasClass -and $Class -eq 'plan'` се добавя `'--plan-class'`; `$Prompt | & node (Join-Path $PSScriptRoot '..\..\engine\plan-gate.js') @planGateArgs`;
   отказ при `if (-not $? -or $LASTEXITCODE -ne 0)` — node, който не може да тръгне, ОТКАЗВА, не
   пуска (`$LASTEXITCODE` сам би останал от резолвера) → `Write-Error 'plan-class pass refused: the readiness artifacts are missing or incomplete (see plan-gate output above).'`
   и `exit 2`. Коментар над блока: защо тук, че node е предпоставка на плъгина (всеки hook върви на
   него), какво гейтът не доказва. ASCII само. Нищо в `$codexArgs`, `$resumeArgs` и в реда
   `$Prompt | & codex @codexArgs` не се пипа. Header-ът `.PARAMETER Class` (`:26-30`) получава едно
   изречение: брифът минава през plan gate; при `plan` клас или ред `Class: plan` липсващи артефакти =
   exit 2.
3. **`scripts/native/sh/codex-review.sh`** — след проверката за празен бриф (`:220-222`):
   `GATE_ARGS=(--project-root "$PROJECT_ROOT_ABS")`; при `[ "$HAS_CLASS" -eq 1 ] && [ "$CLASS" = 'plan' ]`
   → `GATE_ARGS+=(--plan-class)`; после
   `printf '%s\n' "$PROMPT" | node "$HERE/../../engine/plan-gate.js" "${GATE_ARGS[@]}" || fail 'plan-class pass refused: the readiness artifacts are missing or incomplete (see plan-gate output above).'`
   (`PROJECT_ROOT_ABS` е изчислен на `:161-162`, преди `cd`). Коментар над блока. Header `--class`
   (`:23-25`) — същото изречение като в PS. LF, ASCII, shellcheck-чист; никакъв нов `.sh` файл.
4. **`scripts/engine/pretooluse-dispatch-gate.js`** — преди `:270`: ако `ti.subagent_type === 'reviewer'`
   и `typeof ti.prompt === 'string'` → `const planGate = require('./plan-gate')` (ВЪТРЕ в клона, не
   на върха на файла: грешка при зареждане е throw в `runFailAsk` → ask, а не CRASH преди решение;
   ledger ред 25); ако `planGate.isPlanBrief(ti.prompt)`: (i) `CLAUDE_PROJECT_DIR` празен или липсващ
   → `lib.askPreTool('Cannot verify this plan-readiness pass: CLAUDE_PROJECT_DIR is not set, so the paths its brief names cannot be resolved. [AIWF gate 2: plan pass]')`
   — fallback-ът на `projectDirOf()` към корена на плъгина (`:70-73`) не се ползва тук (scan ред 9);
   (ii) иначе `checkPlanBrief(ti.prompt, process.env.CLAUDE_PROJECT_DIR)`; ok →
   `lib.allowPassthrough()`; иначе `lib.denyPreTool('Plan-readiness pass refused: <n> problem(s) - <token>: <message>; ... Fix them (see /pnp:review Steps 2c and 2d) and dispatch again. [AIWF gate 2: plan pass]')`.
   Не-plan reviewer prompt → passthrough, както днес. `refRegex` и `escapeRe` (`:59`, `:109-117`)
   се местят в `aiwf-lib.js` и се експортират оттам; гейтът ги ползва през `lib`. Header коментарът
   (`:21-34`) казва новия клон, че deny-ят е решение върху четим бриф, а посоката при грешка остава
   ASK. `module.exports` не губи нищо.
4a. **`scripts/engine/aiwf-lib.js`** — `refRegex`/`escapeRe` (от т.4) в експортите (`:107-109`);
   коментарите за асиметрията (`:11`, `:26-33`, `:60-61`, `:87-88`, `:102`), които казват, че Gate 2
   никога не блокира, получават: при грешка Gate 2 пита; plan-pass deny-ят е решение върху четим
   бриф, не грешков път (scan ред 10).
5. **`skills/review/SKILL.md`**:
   - (a) предусловието `:326-331`: изречението „- and, before this pass, the behavior ledger of Step
     2a.“ става „- and, before this pass, Steps 2a, 2c, 2b and 2d in that order: the behavior ledger,
     the consequence scan, the fact-check gate and the COO's own pass. Steps 2c and 2d leave the
     files the brief names, and a plan-class pass does not start without them (Step 2d).“
   - (b) брифът `:338-348`: изречението на `:340-341` „The readiness brief carries one more field
     than the diff template above, and it is a fixed artifact rather than a reminder - write it into
     every brief of the cycle, filled in:“ става „The readiness brief carries more than the diff
     template above, and each addition is a fixed artifact rather than a reminder - write the field
     below into every brief of the cycle, filled in:“ (ledger/fact-check C4); след блока
     `PREVIOUS PASS BLOCKERS` и изречението след него (`:347-348`) се добавя като самостоятелен
     абзац, дословно:

         Beside it, every readiness brief carries five fixed lines, each on a line of its own,
         starting at the first column, exactly once - the class line reads exactly `Class: plan` -
         which `scripts/engine/plan-gate.js` reads before the pass is spent (Step 2d); the paths are
         plain ASCII, relative to `<root>`:

             Class: plan
             PLAN: <the plan file>
             TICKETS: <the refs this pass audits, comma-separated>
             CONSEQUENCE SCAN: <the Step 2c file>
             OWN PASS: <the Step 2d file>

   - (c) нов раздел `## Step 2c - Consequence scan before a readiness pass` между `:319` и `:321`,
     дословно блок C по-долу; (d) нов раздел `## Step 2d - The COO's own pass, as a file` веднага
     след него, дословно блок D по-долу.
   - (e) codex клонът, след `:416-417` („The brief must never be empty ...“): „The wrapper passes
     every brief through the plan gate of Step 2d before the engine starts: for `-Class plan` /
     `--class plan`, or a brief carrying the `Class: plan` line, it refuses (exit 2), naming every
     problem, while the readiness artifacts are missing or incomplete; a refusal spends nothing - fix
     what it names and invoke again.“
   - (f) claude клонът, след `:518-521`: „For a plan-readiness pass the task carries the five fixed
     lines of the readiness brief, `Class: plan` included: Gate 2 runs the plan gate of Step 2d on
     that dispatch and denies it while an artifact is missing or incomplete.“
   - (g) Step 2a `:202-204`: „the COO's own pass over it plus the fact-check gate is then the whole
     contract“ става „the consequence scan (Step 2c), the fact-check gate and the COO's own pass
     over all of it (Step 2d) are then the whole contract“ (scan ред 16).
   - (h) Step 2b `:311-312`: „and **only then** dispatches the pass, over the corrected tree.“ става
     „and **only then** goes on - to the COO's own pass (Step 2d) before a readiness pass, or to the
     dispatch of a diff pass - over the corrected tree.“ (scan ред 14).
   - (i) Plan-readiness mode `:332-336`: след „...runs before every one of these passes above the
     scan tier (Step 2b - skipped only when the reviewer itself runs on a scan-tier model)“ се добавя
     „, and that a plan-class pass does not start without its readiness artifacts (Step 2d)“ (scan
     ред 26).
   - (j) прекъснат пас `:489-495`: след „...re-invoke the block, which keeps the command text in the
     fixed set a permission rule matches.“ се добавя „For a plan-class pass the continuation prompt
     carries the five fixed lines of the readiness brief as well - the plan has not changed, so the
     own pass's hash still holds, and the plan gate checks the continuation like any other plan
     brief.“ (scan ред 4).
   - (k) блокът на 5(b) казва изрично, че `Class:` редът е точно `Class: plan` и че петте реда
     започват от колона 0 (scan ред 27).
6. **`docs/WORKFLOW.md`**:
   - (a) `:30-32`: след „per `enforcement.dispatchGate`.“ се добавя „The same hook denies a
     Claude-hosted plan-readiness pass whose readiness artifacts are missing (§ Plan readiness
     review).“
   - (b) нов параграф между `:384` и `:386`, дословно блок W1 по-долу;
   - (c) в `:388-389` изречението „Once the draft is "finished", the COO re-reads it in a SEPARATE
     turn against the six readiness checks below, before any auditor is dispatched:“ става „It is the
     LAST act over the plan before an auditor is dispatched - after the consequence scan and the
     fact-check gate are closed - and the COO does it in a SEPARATE turn against the six readiness
     checks below:“;
   - (d) нов параграф между `:404` и `:406`, дословно блок W2 по-долу;
   - (e) удебеленото начало `:386` „**The COO's own pass comes first, and it is not one of the
     counted ones.**“ става „**The COO's own pass comes before every counted pass, and it is not one
     of them.**“ (scan ред 15);
   - (f) `:297-298` „What the table does NOT contain is the fact-check gate: it runs before every
     pass above the scan tier, over a diff or a plan, and it is not configurable.“ става „What the
     table does NOT contain is the fact-check gate - it runs before every pass above the scan tier,
     over a diff or a plan - nor the plan gate, which keeps a plan-class pass from starting without
     its readiness artifacts (§ Plan readiness review); neither is configurable.“; списъкът след
     `:300` („Not configurable, and enforced here regardless of the project:“) получава нов първи
     bullet: „- **A plan-class pass does not start without its readiness artifacts** - the
     consequence scan and the COO's own pass, files the brief names (§ Plan readiness review).“ (scan
     ред 24);
   - (g) `:441-443` „at `0` the plan gets no auditor at all and the COO's own pass over the behavior
     ledger plus the fact-check gate is the whole contract“ става „at `0` the plan gets no auditor at
     all and the consequence scan, the fact-check gate and the COO's own pass over the behavior
     ledger are the whole contract“ (scan ред 17).
7. **`docs/LOOP.md`** — нов параграф след `:144` (края на абзаца „Every other state of the key...“),
   дословно блок L по-долу.
8. **`docs/OPERATOR_PROTOCOL.md`** — нов bullet между `:45` и `:46` (веднага след Gate 2, преди
   Gate 3 — до bullet-а, който казва „it gates the Writer path“, а не след Gate 4; scan ред 23),
   дословно блок O по-долу. `:90-93` не се пипа: описва двата реда, които `/pnp:roles` печата.
9. **`docs/READINESS_CLASSES.md:7-8`** — изречението става: „`/pnp:review` Step 2b hands this file to
   the fact-check agent; a class present in a plan is a gap, named by number. Step 2c's consequence
   scan asks classes 1, 10 and 14 from the other side - from each decision of the plan out to the
   tree. The list grows with a release, never with a session.“
10. **`README.md`** — (a) `:39-42`: след „...names no ticket in an active PLAN“ се вмъква „, and which
    denies a Claude-hosted plan-readiness pass whose readiness artifacts are missing“; (b) `:218-219`:
    изречението завършва „... over a diff or a plan - nor the readiness artifacts a plan-class pass
    does not start without: the consequence scan and the COO's own pass, files the brief names
    (`docs/WORKFLOW.md` § Plan readiness review).“; (c) `:21` → `v0.2.15`; (d) `:11` „one deciding
    which Writer dispatch becomes a click,“ става „one deciding which Writer dispatch becomes a click
    and which plan-readiness pass may start,“ (scan ред 20).
11. **`templates/ORCHESTRATOR.md.tmpl`** — след `:186` нов параграф, дословно блок T по-долу; и в
    `:183-186` „then the COO's own pass over the ledger plus the fact-check gate is the whole
    contract“ става „then the consequence scan, the fact-check gate and the COO's own pass over the
    ledger are the whole contract“ (scan ред 18).
11a. **`hooks/hooks.json:2`** (`description`) — след „per enforcement.dispatchGate“ се вмъква „, and
    which denies a Claude-hosted plan-readiness pass whose readiness artifacts are missing“; matcher-ите
    и командите — байт по байт непроменени (scan ред 21; `aiwf-selfcheck.js:2205-2250`).
11b. **`skills/loop/SKILL.md:115-117`** — „Gate 2 reads the project config and the active PLANs,“
    става „Gate 2 reads the project config, the active PLANs and, for a plan-class reviewer
    dispatch, the files its brief names,“ (scan ред 22).
11c. **`scripts/native/README.md:18-26`** и **`docs/CODEX_REVIEW_QA_RECIPE.md:195-200`** — по едно
    изречение: „The review wrapper passes every brief through `scripts/engine/plan-gate.js`: a
    `plan`-class run, or a brief carrying a `Class: plan` line at its first column, is refused
    (exit 2) while its readiness artifacts are missing or incomplete (`/pnp:review` Step 2d).“ (scan
    редове 1, 31).
12. **Тестове** (матрицата е договор; id-тата са ДОСЛОВНО: `plan-gate-M1` … `plan-gate-M41`;
    `plan-gate-W1-ps` … `plan-gate-W9-ps` и `plan-gate-W1-sh` … `plan-gate-W8-sh`; `gate2-plan-G1` …
    `gate2-plan-G7`; контроли `plan-gate-ctl-1` … `plan-gate-ctl-12`; в spikes `gate2-plan-G1`,
    `gate2-plan-G2`):
    - **fixture builder** в self-check-а: `writePlanFixture(projectDir, variant)` — пише в
      `projectDir` план `.aiwf/plan/FIX/PLAN_FIX.md` (с заглавия `### FIX-001` и `### LEGACY-7`, ред
      `NOTE-9` само в прозата, и ограден блок ```` ```text ```` с ред `### FENCE-1` вътре, след който
      идва затворен ```` ``` ```` и после заглавие `### AFTER-1`, и заглавие `### NOROW-1`, за което
      НЯМА редове нито в scan-а, нито в own pass-а), `consequence-scan.md` (по един
      затворен ред за `FIX-001`, `LEGACY-7` и `AFTER-1`, closure `no defect: fixture`) и
      `own-pass.md` (по един ред за същите три), подпечатан с
      `planHash` от `require` на payload-ния `scripts/engine/plan-gate.js`; връща текста на валидния
      бриф (петте реда от колона 0, `TICKETS: FIX-001`); `variant` нанася точно назованата повреда
      на всеки M случай (обикновено един факт; M7 и M17 назовават два). Stub runner-ите на двата канала (т. по-долу) получават незадължителен
      `prepare(projectDir)` callback, който се пуска преди wrapper-а — така W2/W5 пишат артефактите в
      проекта на probe-а. Spikes носят собствен малък builder със същия изход (spike файлът е
      самостоятелен).
    - self-check, нов раздел за checker-а (CLI през `process.execPath`, проектът от builder-а):
      M1 валиден → exit 0, празен stderr; M2 без `OWN PASS` → `line-missing:OWN PASS`; M3
      два `PLAN` реда → `line-duplicate:PLAN`; M4 `TICKETS` с `XX-999` → `tickets-not-in-plan:XX-999`;
      M5 `TICKETS: -bad` → `tickets-bad-ref:-bad`; M6 `OWN PASS` към липсващ файл →
      `file-missing:OWN PASS`; M7 scan ред с closure `later` и друг с празна → два `scan-open-row`
      с номерата на редовете във файла;
      M8 scan без ред за тикет → `scan-ticket-missing:<REF>`; M9 scan без заглавие → `scan-no-table`;
      M10 план, редактиран след печата → `own-hash-mismatch`; M11 без хеш ред → `own-hash-missing`;
      M12 без `BLOCKERS FOUND` → `own-blockers-missing`; M13 празна клетка → `own-checks-empty-cell:<REF>`;
      M14 тикет без own-pass ред → `own-ticket-missing:<REF>`; M15 инструмент с еднакви клетки →
      `own-instrument-cannot-fail:1`; M16 без инструменти → `own-instruments-missing`; M17 два
      независими проблема → двата токена в един рън; M18 `\|` в клетка на инструмент → валиден; M19
      `--hash` == SHA-256 на LF-нормализирания текст (хелперът `sha256` на self-check-а, `:161`), и
      същият файл с CRLF дава същия хеш; M20 `--hash` на липсващ файл → exit 2; M21 бриф без `Class:`
      ред и без `--plan-class` → exit 0, празен stderr (не-plan бриф не се проверява); M22 същият бриф
      с `--plan-class` → exit 2 с `line-missing`; M23 отстъпен `  PLAN: x` + валидните редове от
      колона 0 → валиден (отстъпеният не е дубликат); M24 `TICKETS: FIX-001, LEGACY-7` (наследен
      ref, заглавие в плана, с scan и own-pass ред) → валиден; M25 `TICKETS: ,` → `tickets-empty`; M26 scan
      ред с клетка в повече → `scan-row-shape:<ред>`; M27 own-checks ред с клетка по-малко →
      `own-checks-row-shape:<ред>`; M28 инструмент ред с клетка в повече →
      `own-instrument-shape:<ред>`; M29 own pass без таблицата на шестте проверки →
      `own-checks-table-missing`; M30 scan ред с празна `surface` клетка → `scan-empty-cell:<ред>`;
      M31 `--plan-class` + бриф без `Class:` ред → `line-missing:Class`; M32 `--plan-class` +
      `Class: code` → `class-not-plan`; M33 два `TICKETS` реда — `TICKETS: FIX-001` и `TICKETS:
      NOROW-1` → `line-duplicate:TICKETS` и НИКАКЪВ `scan-ticket-missing`/`own-ticket-missing`
      (зависимите проверки са пропуснати; без прескачането NOROW-1 би дал двата токена — пас 3 нов
      #2); M34
      `TICKETS: NOTE-9` (ref само в прозата, не заглавие) → `tickets-not-in-plan:NOTE-9`; M35 scan
      таблица с четири колони `# | ticket | decision | closure` като единствена → точно
      `scan-bad-header:<ред>`; M36 `TICKETS:
      FENCE-1` (заглавието е само в оградения ```` ```text ```` блок на базовия план) →
      `tickets-not-in-plan:FENCE-1`, и същият случай с оградата сменена на `~~~` и на ```` ```` ````
      с вътрешна ```` ``` ```` (по-късата не затваря); M37 `TICKETS: AFTER-1` (заглавие СЛЕД затворена
      ограда) → валиден — минаващата страна на M36; M38 две scan таблици с еднакво заглавие в един файл,
      отворен ред във втората → `scan-open-row:<ред>`; M39 ред `7 | FIX-001 | ...` без водещ `|`
      вътре в scan таблицата → `scan-row-shape:<ред>`; M40 непознат CLI аргумент → exit 2 с usage;
      M41 валидната шестколонна таблица на базовия fixture плюс втора таблица `# | ticket | decision
      | closure` с отворен ред → точно `scan-bad-header:<ред>` и нищо друго (редовете на лошата
      таблица не се проверяват; минаващата страна е M1 — една валидна таблица) (пас 3 нов #1).
      Пътят „нечетим stdin без `--plan-class` → exit 0“ няма вход, който self-check-ът да построи
      надеждно — `[NOTE]` с причината, като `internal-error`. Всеки токен
      на договора има поне един M случай, ОСВЕН `internal-error` — няма вход, който да го предизвика
      при работещ checker; self-check-ът печата това като `[NOTE]` с причината (scan ред 64).
    - self-check, двата wrapper канала със stub codex — на stub runner-ите с codex fixture
      (`runPsWrapperWithStub` `:2712-2793`, sh runner `:3345-3445`), НЕ на claude fixture-а на
      `:2426-2454` (той излиза на engine проверката преди гейта; scan ред 28): W1 `plan` + бриф без
      редовете → exit 2, stderr с `line-missing`, stub-ът НЕ е извикан (sh: `atoms === null`; PS:
      няма rollout файл и няма stub байтове в stdout — PS stub-ът не записва argv, ledger ред 31);
      W2 `plan` + валиден бриф (артефактите в проекта на probe-а) → stub извикан, exit = `STUB_EXIT`,
      а на sh и locked argv на plan реда; W3 `plan` + resume с ИЗРИЧНО id (`-ResumeId` / `--resume
      <id>`, иначе отказът идва от липсващия state файл — ledger редове 6, 13) + невалиден бриф →
      exit 2 с `line-missing`, stub не е извикан; W4 `code` + бриф без редовете → stub извикан; W5
      `plan` + resume с id + валиден бриф → stub извикан; W6 без клас (sh: без `--class`; PS: runner-ът
      без `-Class`) + бриф с ред `Class: plan` от колона 0 и без артефакти → exit 2, stub не е извикан;
      W7 `code` + бриф с отстъпен `  Class: plan` и без артефакти → stub извикан; W8 `code`
      (`-Class code` / `--class code`) + бриф с ред `Class: plan` от колона 0 и без артефакти → exit 2,
      stub не е извикан (пас 1 #4 — комбинацията, която D5 обещава); W9-ps (само PowerShell канала,
      само на `win32`) `plan` + бриф без редовете, с PATH, построен от директорията на `pwsh` и bin-а
      на stub-а, БЕЗ директорията на node — директорията на `pwsh` се намира в момента на probe-а
      (`where pwsh`; self-check-ът днес знае само името, `findPwsh` `aiwf-selfcheck.js:210-217`), а
      ако `PWSH` не е `pwsh`, lookup-ът не успее или платформата не е `win32` (на POSIX махането на
      директорията на node може да махне и `/usr/bin`), случаят е `[NOTE]` с причината (scan редове
      59, 62) → exit ТОЧНО 2 и stderr с `plan-class pass refused` (пас 1 #5 — отказът при
      node, който не тръгва, е изпълнено доказателство; W9 гледа exit кода и реда на отказа, НЕ следа
      от stub-а, защото stub-ът сам върви на node и без node не би оставил следа дори ако бъде
      извикан). PS runner-ът (`:2781`
      подава винаги ` -Class code`) получава параметър за класа (вкл. „без клас“) и за PATH.
      Контролните копия на каналите (`copyPsChannel`, `copyShChannel`) пазят относителния път до
      `scripts/engine/plan-gate.js` и `scripts/engine/aiwf-lib.js` (иначе W2 на копие пада по грешна
      причина; ledger редове 32, 34); новите executed контроли влизат в `PS_EXEC_IDS`/`SH_EXEC_IDS`.
    - self-check Gate 2 (нов раздел, по образеца на `mkProject` `:792-969` за fixture-и с артефакти):
      G1 `reviewer` + `Class: plan` + без артефакти → deny с `[AIWF gate 2: plan pass]` и
      `line-missing`; G2 същото с валидни артефакти (CLAUDE_PROJECT_DIR = fixture) → passthrough; G3
      `reviewer` + `Class: code` → passthrough; G4 `Class: Plan` без артефакти → deny; G5 `Class: plan`
      без CLAUDE_PROJECT_DIR → ask; G6 отстъпен `  Class: plan` → passthrough; G7 Gate 2, пуснат от
      копие на `scripts/engine/` БЕЗ `plan-gate.js`, + plan бриф → ask (грешката при зареждане е в
      `runFailAsk`, не CRASH и не deny — Risk threshold); съществуващите reviewer случаи
      (`:757-758` с `prompt:'x'`, `:845` с `Ticket: DEMO-2`) и writer случаите остават зелени без
      промяна.
    - spikes: G1 и G2 в НОВ списък с проект на случай, по образеца на `gate2ModeCases` (`:274`,
      цикъл `:562-570`) — `gate2Cases` (`:548-549`) не чете проект на случай (scan ред 29).
    - **моделът на контролите (пас 2 нов #2):** всяка проверка има минаваща и отказваща страна,
      по модела на self-check-а за матрици — семейство fixture-и с обръщащ се двойник
      (`aiwf-selfcheck.js:790-791`, раздела `:793-969`). Отказващите случаи (M2–M17, M22, M25–M36,
      M38–M41) вървят върху fixture-а на M1 само с назованата повреда, и M1 е минаващата им страна;
      минаващите случаи имат назован отказващ двойник: M18 ↔ M28 (`\|` срещу непредпазен `|`), M21 ↔
      M22/M31, M23 ↔ M3 (отстъпен срещу втори ред от колона 0), M24 ↔ M34, M37 ↔ M36; M19 ↔ M20 са
      двойката на режима `--hash`. Саботажните контроли по-долу са ДОПЪЛНИТЕЛНИ: те показват, че
      токенът идва от назования клон, а не от съседна проверка, която случайно отказва, и покриват
      окабеляването в wrapper-ите и в Gate 2, което никоя двойка входове не вижда:
    - негативни контроли, видени червени: `plan-gate-ctl-1` махнат гейт блок в PS → W1-ps се
      обръща; `plan-gate-ctl-2` махнат гейт блок в sh → W1-sh се обръща; `plan-gate-ctl-3` махнат plan
      клон в Gate 2 → G1 се обръща; `plan-gate-ctl-4` checker с изключена проверка за хеша → M10 се
      обръща; `plan-gate-ctl-5` с изключена проверка за еднакви клетки → M15 се обръща;
      `plan-gate-ctl-6` `-not $?` махнат от реда на PS отказа → W9-ps се обръща (executed; при
      `[NOTE]`-а на W9 и контролът е `[NOTE]` със същата причина, по правилото „контрол или `[NOTE]`“,
      `dev/PROJECT_OVERRIDES.md:147-149`); проверките на r3 също имат контрол (делта fact-check A2):
      `plan-gate-ctl-7` правилото за заглавие сменено с „споменаване където и да е“ → M34 се обръща;
      `plan-gate-ctl-8` `scan-empty-cell` изключен → M30 се обръща; `plan-gate-ctl-9` белият списък
      на closure сменен с „непразна“ → M7 (`later`) се обръща; `plan-gate-ctl-10` `class-not-plan`
      изключен → M32 се обръща; `plan-gate-ctl-11` прескачането при дубликат сменено с „използвай
      всеки `TICKETS` ред“ → M33 се обръща (NOROW-1 дава `scan-ticket-missing:NOROW-1` и
      `own-ticket-missing:NOROW-1`); `plan-gate-ctl-12` проверката за `scan-bad-header` изключена →
      M41 се обръща.
    - id-тата се пишат в имената на `check(...)` (`check` няма id параметър, `aiwf-selfcheck.js:97-101`;
      ledger ред 29), напр. `[plan-gate-M10] ...`; fixture-ите — без drive-letter пътища, e-mail и
      Cyrillic (провенансът сканира и self-check-а, ledger ред 44).
13. **Издание 0.2.15:** `migrations/0019_plan-readiness-gate/ops.json` по образеца на `0018`:
    `rerender-managed-region` за `.claude/aiwf-native/ORCHESTRATOR.md` (`region: null`, template
    `templates/ORCHESTRATOR.md.tmpl`) + `note` op `plan-readiness-gate` (текстът — гистът на
    CHANGELOG блока + „YOUR ORCHESTRATOR RULES: the first operation re-renders ...“ по образеца на 0018
    + „SUPERSEDED LOCAL RULES: a local rule or hook that refuses a plan pass without these artifacts
    can become a one-line pointer to Step 2d“; `docRefs: ["CHANGELOG.md", "skills/review/SKILL.md"]`);
    `NOTES.md` по образеца на `0018`; `migrations/index.json` запис `0019_plan-readiness-gate` →
    `0.2.15`; `.claude-plugin/plugin.json:3` → `0.2.15`; `CHANGELOG.md` блок дословно блок CL по-долу;
    self-update `node scripts/update/aiwf-update.mjs --apply --project-root .` (ORCHESTRATOR.md
    ре-рендериран, bookkeeping, `CHANGES_0.2.14-to-0.2.15.md`); conflict диалог → СТОП и доклад.
    **РЕДЪТ Е ЗАДЪЛЖИТЕЛЕН:** bump + миграция → `--apply` → едва тогава VERIFY и acceptance —
    self-check-ът на проекта сверява версията на bookkeeping-а с payload-а
    (`aiwf-selfcheck.js:4909-4911`) и е червен между bump-а и `--apply`.
14. **`dev/PROJECT_OVERRIDES.md` § Architecture direction** (`:119-149`) — пише го Колегата, в
    кодовия commit (описва архитектурата, която тикетът сменя; Gate 3 не пуска главната сесия в
    `dev/` докато маршрутът е отворен): (a) `:132-134` „the active PLANs under `plansDir` (Gate 2
    off-plan) and `.aiwf/route-state.json` (Gate 3) - nothing else of the project“ става „the active
    PLANs under `plansDir` (Gate 2 off-plan), the files a plan-class reviewer brief names (Gate 2,
    through `scripts/engine/plan-gate.js`) and `.aiwf/route-state.json` (Gate 3) - nothing else of
    the project“; (b) `:142-144` „Gate 2 (Writer dispatch) ASKS - any unexpected error inside Gate 2
    also resolves to ASK, never to a silent pass.“ става „Gate 2 (Writer dispatch) ASKS, and DENIES
    a Claude-hosted plan-readiness pass whose readiness artifacts are missing - a decision on a
    readable brief; any unexpected error inside Gate 2 still resolves to ASK, never to a silent
    pass.“

**Блок C (skills/review/SKILL.md, Step 2c — дословно):**

```
## Step 2c - Consequence scan before a readiness pass

**Before every paid readiness pass of a durable plan - and, at `review.plan.passes: 0`, before the
plan is presented for execution approval - the COO dispatches ONE scan-tier agent per ticket that
reads the TREE against the plan's decisions.** The behavior ledger (Step 2a) and the fact-check
gate (Step 2b) read what the plan SAYS; this agent looks for what it does not say - a surface that
can violate a decision by a path the plan never opened (`docs/WORKFLOW.md` § Plan readiness review;
it asks classes 1, 10 and 14 of `docs/READINESS_CLASSES.md` from the tree's side).

Dispatch it with the **Agent tool**, `subagent_type: "Explore"` (or whichever read-only scan agent
this harness ships), `model: sonnet` - named explicitly, never inherited - one agent per ticket,
with exactly this task, verbatim:

    You read the TREE against the PLAN's decisions, not the plan's claims. Input: the plan's
    decisions section and one ticket's section, below. For EVERY decision, rule, invariant and
    risk-threshold line that applies to this ticket, search the tree for a surface that can VIOLATE
    it: a screen, an action, an endpoint, a query, an import, a bulk or batch path, a migration, a
    script, a fixture, another command or hook - anything that reaches the same data, permission,
    command or contract by a path the plan does not mention. For every field, file, flag or contract
    the plan locks or changes, find every OTHER path that writes or reads it. Return ONE row per
    surface:
    <#> | <ticket> | <decision, quoted short, with its plan line> | <surface file:line> | <how it
    violates or bypasses the decision, one sentence> |
    (the last cell stays empty - it is the COO's). A decision for which you found no violating
    surface is one row with `none found - <what you searched>` in the surface cell and `none` in
    the violation cell. No verdict, no fixes, no summary; every surface is a row.

    PLAN DECISIONS:
    <the plan's decisions section, pasted>

    TICKET:
    <the ticket section, pasted>

The COO records the rows - each with a leading and a trailing `|` - in ONE file per plan under the
header `| # | ticket | decision | surface | violation | closure |`, numbered from 1 - where the file lives
is the COO's call, and `{{config.paths.scratchDir}}` is gitignored and the natural place - and closes
EVERY row before the pass, in the `closure` cell: `plan: <what changed, with its plan line>` or
`no defect: <why, with file:line>`. Every table in the file that starts with the `#` and `ticket`
columns carries exactly this header - a delta scan repeats it - or the plan gate refuses the file.
A closure that starts with neither is an open row, and no other
cell may be empty - a `none found` row writes `none` in its violation cell; a `|` inside a cell is
written `\|`. Every ticket the pass audits has at least one row: a ticket on which the agent found
no violating surface keeps its `none found` row, closed. Before
every further readiness pass the scan runs again over the decisions the revision changed or added -
the revision is where new surface is born (class 14) - and its rows are APPENDED to the same file:
numbering continues, the earlier rows stay. The scan is not an auditor: it returns no verdict and it
is never counted as a pass.

**Its suppression dual.** Exactly the behavior ledger's: small R1 and non-durable R2 work owe no scan
- they receive no readiness review at all.
```

**Блок D (skills/review/SKILL.md, Step 2d — дословно):**

```
## Step 2d - The COO's own pass, as a file

**The COO's own pass is the LAST act over the plan before a paid readiness pass is dispatched -
after Steps 2a, 2c and 2b are closed - done in a turn of its own and written down.** It is the pass
`docs/WORKFLOW.md` § Plan readiness review describes: every `file:line` opened, every command run on
the real tree, not one "if the Writer finds ...". The file - one per pass; where it lives is the
COO's call, `{{config.paths.scratchDir}}` the natural place - carries:

    PLAN SHA256: <64 hex digits>
    BLOCKERS FOUND: <n - the blockers this pass found and applied to the plan>

    | ticket | repo-match | scope | discovery | order | acceptance | git |
    |---|---|---|---|---|---|---|
    | <REF> | <a finding, or `0 - lines <a>-<b> read`> | ... | ... | ... | ... | ... |

    | instrument | valid input | broken input |
    |---|---|---|
    | `<command>` | <what it returned on the real tree> | <what it returned when made to fail> |

The first line is exactly what `node "${CLAUDE_PLUGIN_ROOT}/scripts/engine/plan-gate.js" --hash
<plan file>` prints - the SHA-256 of the plan's text with line endings normalised to LF, so a
checkout that converts line endings does not read as an edit. The paths on the brief's lines are
plain ASCII, relative to `<root>`.

One row per ticket the pass audits in the first table, every cell filled; the six columns are the
six readiness checks, and `order` carries the dry process trace of the gates. One row per acceptance
command or other instrument in the second, run both ways: an instrument whose broken run reads the
same as its valid run cannot fail, so it is a blocker of this pass, not a row. A `|` inside a cell is
written `\|`. Stamp the hash LAST: any edit to the plan after it changes the hash, and the pass does
not start until the own pass is redone over the text that will be dispatched.

**The gate.** The plan-readiness brief names the plan, the tickets and the two files on its fixed
lines (Plan-readiness mode below), and `scripts/engine/plan-gate.js` checks them before the pass is
spent: on the codex branch the wrapper passes every brief through it and refuses (exit 2) before
the engine starts when the run is `-Class plan` / `--class plan` or the brief carries the
`Class: plan` line; on the claude branch Gate 2 runs it on a `reviewer` dispatch whose prompt carries
that line and denies it. Each refusal names every problem at once - a missing or
duplicated line, a ref that is not a ticket heading of the plan, a missing file, an open,
incomplete or malformed scan row or scan table, a
ticket with no scan row or no own-pass row, an empty own-pass cell, a missing `BLOCKERS FOUND:` line,
an instrument that cannot fail, a hash that does not match the plan. A refusal spends nothing: fix
what it names and dispatch again.

**Honest limit.** The gate proves presence, shape and that the own pass was stamped over the plan
file the brief names. It cannot prove the pass was good, that it ran in a turn of its own, or that a
pass N+1 scan really covered the revision. It recognises a plan pass by the class flag or by the
`Class: plan` line, so a plan brief that carries neither is not recognised; it sits on a NEW `Agent`
dispatch of `reviewer`, so another agent substituted as the auditor (forbidden in Step 3 below) or a
running reviewer continued by a message is not seen; and its deny on the `Agent` tool rests on the
documented PreToolUse decision contract, not on an observation this repository makes. At
`review.plan.passes: 0` nothing is dispatched, so there the duty is doctrine.

**Its suppression dual.** Exactly the behavior ledger's: small R1 and non-durable R2 work owe no
own-pass file - they receive no readiness review at all.
```

**Блок W1 (docs/WORKFLOW.md, между `:384` и `:386` — дословно):**

```
**A decision is also read from the tree's side.** The behavior ledger and the fact-check gate read
what the plan SAYS; neither can find a rule the plan never wrote down. Before every paid readiness
pass, one scan-tier agent per ticket (`/pnp:review` Step 2c) takes every decision, invariant and
risk-threshold line of the ticket and searches the tree for a surface that can VIOLATE it - a
screen, an action, a query, an import, a bulk path, another command - and for every other path that
writes what the plan locks. Each finding is one numbered row in a file, and the COO closes every row
before the pass: a plan change, or a reason the surface is no defect. Before every further readiness
pass the scan runs again over the decisions the revision changed or added, because the revision is
where new surface is born (`docs/READINESS_CLASSES.md` class 14). Measured on a consumer: five
consecutive plans returned 10 to 13 author-side blockers on pass 1 with the behavior ledger and the
per-claim fact-check already applied, and those blockers were mostly missing rules rather than false
claims; one scan over one revised plan returned 102 rows, 4 of them critical defects the revision
itself had introduced. Its suppression dual is the behavior ledger's: owed exactly when the ledger
is owed, and small R1 and non-durable R2 work owe nothing.
```

**Блок W2 (docs/WORKFLOW.md, между `:404` и `:406` — дословно):**

```
**The own pass leaves a file, and a plan-class pass does not start without it.** A rule the
operator would have to read artifacts to enforce is not enforced: on the same consumer the own pass
was skipped or folded into the writing flow in five readiness cycles out of five, and the one time
it was forced into a turn of its own it found 14 author blockers on a plan already revised twice. So
the own pass is written down (`/pnp:review` Step 2d): one row per audited ticket against the six
checks, every instrument with what it returns on valid and on broken input, a `BLOCKERS FOUND:`
count, and the SHA-256 of the plan file it read. The readiness brief names the plan, the audited
tickets, the consequence scan and the own pass on fixed lines, and `scripts/engine/plan-gate.js`
checks them before the pass is spent - the Codex review wrapper refuses a plan-class run (exit 2),
by its class flag or by the brief's `Class: plan` line, and Gate 2 denies a Claude reviewer dispatch
whose brief carries that line - when a file is
missing, a scan row is open, an audited ticket has no row, an instrument returns the same on broken
input as on valid, or the plan changed after the own pass was stamped. Its honest limit, in the same
breath: the gate proves presence, shape and that the own pass was stamped over the plan file the
brief names; it cannot prove the pass was good, that it ran in a turn of its own, or that a pass N+1
scan covered the revision - and at `review.plan.passes: 0` nothing is dispatched, so there the duty
stays doctrine.
```

**Блок L (docs/LOOP.md, след `:144` — дословно):**

```
**A Claude-hosted plan-readiness pass goes through the same hook.** On an `Agent` dispatch of
`reviewer` whose prompt carries the line `Class: plan`, Gate 2 runs `scripts/engine/plan-gate.js`
over the prompt and DENIES the dispatch while the readiness artifacts the brief names are missing or
incomplete (`docs/WORKFLOW.md` § Plan readiness review); with the artifacts in order it stays silent,
and every other reviewer dispatch is untouched. The deny is a decision on a readable brief, not an
error path: an unreadable payload, a throw inside the check, or a session with no
`CLAUDE_PROJECT_DIR` to resolve the brief's paths against still resolves to ask. The Codex host gets
the same check inside `codex-review.ps1` / `codex-review.sh`, which refuse a plan-class run - by the
class flag or by the brief's `Class: plan` line - with exit 2 before the engine starts. **And the
deny borrows a promise, as Gate 4's passthrough does:** `ask` on an `Agent` call was observed live,
while `deny` on it rests on the documented PreToolUse decision contract, which names no exception
for this tool - nothing in this repository observes the host.
```

**Блок O (docs/OPERATOR_PROTOCOL.md, между `:45` и `:46` — дословно):**

```
- **Plan readiness (wrapper + Gate 2)** - a paid readiness pass over a plan does not start until the
  COO's own pass and the consequence scan exist as files the brief names: the Codex review wrapper
  refuses the run, and Gate 2 denies a Claude reviewer dispatch, while one is missing, a scan row is
  still open, or the plan changed after the own pass was stamped. It checks that both files exist,
  that every scan row is closed and every audited ticket has its rows, and that the own pass was
  stamped over the plan file the brief names - not how good either is,
  and not that the scan covered the latest revision - so the step happens without you reading those
  files.
```

**Блок T (templates/ORCHESTRATOR.md.tmpl, след `:186` — дословно):**

```
**The consequence scan and the own pass ride the same duty.** Before the same pass, every decision
of the plan has been read from the tree's side by a separate scan-tier context and every row it
returned is closed (`/pnp:review` Step 2c), and the COO's own pass - the last act over the plan, in
a turn of its own - is a file stamped with the plan's SHA-256 (Step 2d). The brief names both, and a
plan-class pass does not start without them: the Codex wrapper refuses it and Gate 2 denies a Claude
reviewer dispatch. The gate proves that both files exist, that every scan row is closed and every
audited ticket has its rows, and that the own pass was stamped over the plan file the brief names;
it does not prove the work was good, nor that the scan
covered the latest revision. The same suppression dual holds.
```

**Блок CL (CHANGELOG.md, над `## [0.2.14]` — дословно, датата се проверява при тага):**

```
## [0.2.15] - 2026-10-02

A paid readiness pass no longer starts on an own pass nobody wrote down: the consequence scan and
the COO's own pass are files the brief names, and a plan-class pass refuses to start without them.

### Added

- **Consequence scan (RGATE-001)** - `/pnp:review` Step 2c: before every paid readiness pass, one
  scan-tier agent per ticket searches the tree for surfaces that can violate each decision of the
  plan; the COO closes every row in a file before the pass, and the scan runs again over what each
  revision changed.
- **The own pass as a file (RGATE-001)** - Step 2d: the COO's own pass is the last act over the
  plan - one row per audited ticket against the six readiness checks, every instrument run on valid
  and on broken input - stamped with the plan's SHA-256 (`scripts/engine/plan-gate.js --hash`).
- **Plan-pass gate (RGATE-001)** - `scripts/engine/plan-gate.js` checks the brief's `Class:`,
  `PLAN:`, `TICKETS:`, `CONSEQUENCE SCAN:` and `OWN PASS:` lines; `codex-review.ps1` / `codex-review.sh`
  refuse a plan-class run (by the class flag or the brief's `Class: plan` line) with exit 2 and
  Gate 2 denies a Claude reviewer dispatch whose brief carries that line when an artifact is
  missing, a row is open, a ticket is uncovered, an
  instrument cannot fail or the plan changed after the stamp. It proves presence and shape, not
  quality.

### Changed

- **Readiness order (RGATE-001)** - `docs/WORKFLOW.md` and the rendered
  `.claude/aiwf-native/ORCHESTRATOR.md` (re-rendered by migration `0019_plan-readiness-gate`): the
  behavior ledger, the consequence scan, the fact-check gate, then the COO's own pass - last.
```

**Извън обхват:** `docs/REVIEW_CHECKLIST.md` и `templates/agents/reviewer.md.tmpl` (Одиторът не е
гейт, текстът му не се сменя — без rerender на reviewer.md); `templates/CLAUDE.md.tmpl` (регионът
описва двата Writer режима на Gate 2, които остават верни, без „само“ — scan ред 19); `skills/roles`
и `aiwf-roles.mjs` (печатът на таблицата — scan ред 25); QA wrapper-ите; matcher-ите и командите в
`hooks/hooks.json` (без нов hook запис; само описанието — т.11a); SendMessage matcher (scan ред 6);
`docs/OPERATOR_PROTOCOL.md:90-93`; преименуване на
Step 2b (D9); броячи в брифа (D7); доказване на „отделен ход“ и на делта скана (honest limit);
HARD-011; `CHANGELOG.md` история.

**Acceptance (литерални, в Bash — инструментите на Колегата; exit кодът се чете от harness-а,
без `echo`; всичко СЛЕД `--apply` от т.13):**
- `node scripts/engine/plan-gate.js --hash dev/backlogs/active/PLAN_HARD.md` → един ред
  `PLAN SHA256: <64 hex>`, exit 0; `node scripts/engine/plan-gate.js --hash no-such-file.md` → exit 2.
- `printf 'Class: plan\n' | node scripts/engine/plan-gate.js --project-root .` → exit 2 и stderr с
  четирите `line-missing:PLAN`, `line-missing:TICKETS`, `line-missing:CONSEQUENCE SCAN`,
  `line-missing:OWN PASS`; `printf 'x\n' | node scripts/engine/plan-gate.js --project-root .` → exit 0,
  празен stderr (не-plan бриф). Валидният случай е `plan-gate-M1` в self-check-а.
- `node scripts/selfcheck/aiwf-selfcheck.js --plugin-root . --project-fixture .` → exit 0; изходът
  съдържа ВСЯКО id от т.12 (M1–M41, W1–W8 за двата канала, W9-ps, G1–G7, ctl-1…ctl-12); дванадесетте
  контрола са отчетени като видени червени — освен W9-ps и ctl-6, които на машина без отделна
  директория на `pwsh` (или извън `win32`) са приети като `[NOTE] plan-gate-W9-ps …` и
  `[NOTE] plan-gate-ctl-6 …` с причината, и `[NOTE]` за `internal-error` и за пътя „нечетим stdin“ (редовете дословно в
  handback-а; делта fact-check A1). Карта Risk threshold →
  id: plan пас без артефакти по канал → W1, W3, W6, W8, G1, G4; не-plan пас/dispatch не се отказва →
  W4, W7, M21, G3, G6; грешка в Gate 2 пита, не отказва → G5, G7; locked argv непроменен → W2-sh и
  съществуващите пинове (`:2358`, sh `STDIN_PIPE`); контрол за всяка проверка → минаваща и
  отказваща страна за всяка проверка на checker-а (моделът на контролите в т.12) + саботажните
  ctl-1…ctl-12 — за окабеляването (1–3, 6) и за осем клона на checker-а (4, 5, 7–12); PS отказ
  при node, който не тръгва → W9-ps + ctl-6; нов `.sh` → съществуващият
  пин `aiwf-selfcheck.js:2929-2930`; Cyrillic/абсолютен път/име → провенанс grep-ът по-долу и
  провенанс разделът на self-check-а; проза, която твърди повече от гейта → Codex code пасът.
- `node scripts/spike/run-spikes.mjs` → exit 0, с `gate2-plan-G1` и `gate2-plan-G2` в изхода.
- Присъствие (не поведение — поведението носят M/W/G): `git grep -n "^## Step 2c" -- skills/review/SKILL.md`
  → един удар; `git grep -n "Step 2c" -- docs/WORKFLOW.md docs/READINESS_CLASSES.md templates/ORCHESTRATOR.md.tmpl`
  → поне един удар във всеки (на котвата — нула); `git grep -n "AIWF gate 2: plan pass" --
  scripts/engine/pretooluse-dispatch-gate.js` → поне един удар (на котвата — нула).
- `node scripts/update/validate-payload.mjs --plugin-root .` → exit 0, `19 migration(s)`, `0.2.15`.
- `node scripts/update/aiwf-update.mjs --check --project-root .` → „up to date … 0.2.15“.
- Провенанс: `git grep -nP "[\x{0400}-\x{04FF}]" -- docs skills templates scripts schema hooks migrations examples README.md`
  → празно.
- Дифф гард: `git status --short -- . ":(exclude)dev"` → точно worklist файловете + новите
  `scripts/engine/plan-gate.js`, `migrations/0019_plan-readiness-gate/`,
  `CHANGES_0.2.14-to-0.2.15.md` и пре-рендерираните `.claude/aiwf-native/ORCHESTRATOR.md`,
  `.claude/aiwf-native/aiwf.config.json`; `git status --short -- dev` → точно ` M dev/PROJECT_OVERRIDES.md`
  (т.14; PLAN и CANDIDATES са на COO-то и Колегата не ги пипа).

**VERIFY (`dev/VERIFY_RUNBOOK.md`):** обединението на редовете на Test policy
(`dev/PROJECT_OVERRIDES.md:190-197`) — „hooks / gates“ (`selfcheck`, `spikes`) + „update engine /
migrations / examples“ (`update-suite`, `validate-payload`, `example-cycle-windows`, `selfcheck`) —
плюс, по решение на COO-то, `setup-suite` (рендерът на ORCHESTRATOR шаблона се сверява там байт по
байт, `test-setup.mjs:224-243`) и `plugin-validate` (нов файл в payload-а). Изрично: `validate-payload`,
`selfcheck`, `setup-suite`, `update-suite`, `example-cycle-windows`, `spikes`, `plugin-validate` — ЕДНА
паралелна партида, СЛЕД `--apply`, точни exit кодове. POSIX доказателството (sh probe-ове,
shellcheck) — CI на ubuntu след push.

**Risk threshold:** блокира: plan-class пас, който стига до engine-а или до dispatch-а без
артефактите, по който и да е канал (вкл. безкласов рън и resume); нов отказ на не-plan пас при
работещ node (node е предпоставка на плъгина — всеки hook върви на него) или на не-reviewer
dispatch; PS отказ, който пропуска при node, който не тръгва; каквато и да
е промяна в locked argv или в stdin транспорта на wrapper-ите; грешка в Gate 2, която връща deny вместо
ask; проверка без негативен контрол, видян червен; Cyrillic, абсолютен път или име на проект в
payload-а; нов `.sh` файл в `scripts/native/sh/`; проза, която твърди повече, отколкото гейтът доказва.

**Stop condition:** acceptance и VERIFY зелени → стоп.

**Review:** `Class: code`, ЕДИН пас (`gpt-6-sol`/xhigh, Codex) над целия диф срещу котвата при
диспач (вкл. т.14 — overrides текстът е в дървото, когато пасът тръгне); fact-check преди него; cap 2.

**Assignee:** Колега. Branch `main`. Route-state `{"ticket":"RGATE-001","route":"R2"}` при диспач.
Commit: ЕДИН кодов (вкл. `dev/PROJECT_OVERRIDES.md` от т.14), subject `RGATE-001: consequence scan,
the own pass as a file, and a gate before a plan-class pass - released as 0.2.15`, един ред, без
trailers; PLAN и CANDIDATES — отделен docs commit след затварянето.

## Ред и гейтове (dry trace)

1. Readiness (сега): inventory ✓ → чернова ✓ → Step 2a ledger (1 агент) ✓ → Step 2c consequence
   scan (1 агент; първа употреба на собствения формат) ✓ → ревизия r1 ✓ → Step 2b fact-check (2
   агента: тикетът; общите раздели) ✓ → ревизия r2 → собствен проход в отделен ход (файл по формата
   на Step 2d; хешът ПОСЛЕДЕН, с временната команда, защото `plan-gate.js` още не съществува:
   `node -e "const c=require('crypto'),f=require('fs');process.stdout.write('PLAN SHA256: '+c.createHash('sha256').update(f.readFileSync(process.argv[1],'utf8').replace(/\r\n/g,'\n')).digest('hex')+'\n')" .aiwf/plan/RGATE/PLAN_RGATE.md`
   — същата нормализация като договора) → пас 1 (`Class: plan`, студен, Codex, на думата „пускай
   плана“; `COVERED BY:` първи ред; гейтът още не съществува — артефактите са доброволни, по
   собствения формат) → ревизия, която затваря само подадените блокери → преди пас 2: делта скан над
   решенията, които ревизията смени (редове, добавени към същия файл), fact-check над делтата,
   собствен проход наново и нов печат → пас 2 само на отделна дума → одобрение → копие в
   `dev/backlogs/active/PLAN_RGATE.md` (guard (e)) + docs commit (клик).
   Git преди одобрението: `main` е на `bf0f828`, един локален commit пред `origin` (правилото за
   push на тага, 2026-10-01) — нарочно; качва се със следващата дума за push, заедно с docs commit-а
   на плана. Работното дърво носи некомитнатите редове на тази сесия в `dev/backlogs/CANDIDATES.md`
   (event ledger, ruling ledger, pass statistics, правилото за старт→стоп двойките) — те влизат в
   същия docs commit, с който планът се приземява.
2. Изпълнение (отделна дума): `git rev-parse HEAD` в брифа → route-state → диспач на Колегата (Gate 2
   off-plan мълчи — тикетът е в активен план) → Колегата: worklist → bump + миграция → `--apply` →
   VERIFY партида → acceptance → handback → COO чете целия диф → fact-check над прозата на дифа →
   Codex code пас (на думата за тикета; т.3 по-долу) → корекции в cap 2 (verification пас при
   кодов рунд — отделна дума) → commit клик → **опресняване на `D:\pnp-live`** → route-state `{}` →
   **docs commit (клик; Gate 3 вече не държи `dev/`), с архивирането В НЕГО** (WORKFLOW `:625-638`:
   планът се архивира в мига, в който последният тикет има completion record; пас 1 #9):
   completion record в PLAN-а + CANDIDATES редове + проверката за rule-class точки без pointer row —
   `grep -nE "from now on|от сега|винаги|never|правило" dev/backlogs/active/PLAN_RGATE.md | grep -vE "CANDIDATES|pointer|указател"`
   → всеки ред се чете и или има ред в CANDIDATES § D2 pointer rows, или го получава; положителен
   контрол преди него: същият grep над `dev/backlogs/archive/005_PLAN_CONS_2026-09-21.md` → `≥1` ред
   (`0` = инструментът е счупен, стоп; прецедентът — RDY-001, `006_PLAN_RDY_2026-09-30.md:401-402`)
   → `git mv dev/backlogs/active/PLAN_RGATE.md dev/backlogs/archive/007_PLAN_RGATE_<YYYY-MM-DD>.md`
   (датата на архивиране) → commit → **опресняване на `D:\pnp-live`** → push `main` (дума + диалог)
   → CI зелен на трите крака → датата в CHANGELOG срещу деня на тага в пушнатия hash → tag `v0.2.15`
   на hash-а, който CI е доказал (дума; покрива и push-а на тага, диалог) → release record в
   архивирания план (commit, клик) → **опресняване на `D:\pnp-live`**. Всяко опресняване е
   `git -C D:\pnp-live status --porcelain` → празно (иначе СТОП и доклад — външно дърво с промени не
   се пипа), после `git -C D:\pnp-live checkout --detach main` — думата е стоящото правило на
   `CLAUDE.md` § This repository is the plugin „After every commit on main, refresh the live copy“
   (операторската зона; пас 1 #8; scan ред 54), Gate 4 вдига диалог за всяко `git -C`; също и след
   docs commit-а, който приземява плана в т.1.
3. Self-hosted особеност (`dev/backlogs/CANDIDATES.md:632`): след `--apply` репото е 0.2.15, а
   `D:\pnp-live` още 0.2.14 → Step 0 interlock-ът на `/pnp:review` ще откаже кодовия пас.
   Опресняване преди паса е невъзможно (`D:\pnp-live` е worktree на commit-и, а дифът е некомитнат).
   ПЪТЯТ Е ЕДИН: отказът се показва на оператора и кодовият пас тръгва през непроменения 0.2.14
   wrapper на `D:\pnp-live` само на негова дума за този случай (прецедент RDY-001, същият ред на
   CANDIDATES); кодовият пас е `Class: code`, така че новият plan gate не участва в него.
