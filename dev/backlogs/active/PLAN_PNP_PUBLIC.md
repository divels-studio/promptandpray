# PromptAndPray 0.2.0 — одитът става настройка; първото public издание (PLAN_PNP_PUBLIC)

> Роден по операторска дума 2026-08-31 („PLAN_PNP_PUBLIC → започваш планиране; третият tripwire
> влиза в плана"); разширен след операторския стоп от същия ден („силен модел се одитира от
> opus"; „всичко това трябва да влезе в конфиг/settings"). Одобрен 2026-09-01 = дума за readiness
> (fact-check над плана + Codex pass 1/2 на конфигурирания engine) и за копие тук (guard (e)).
> Всеки тикет чака собствена дума за диспач. Readiness: fact-check (2 находки, поправени) → Codex
> pass 1 `NEEDS-FIX` (10 блокера) → pass 2 `NEEDS-FIX` (14, от тях 11 видими в pass 1) → всички 24
> решени долу → Fable self-pass (8, решени) → pass 3 (операторска дума) `NEEDS-FIX` 6, всичките
> решени долу. **Трите паса са изчерпани** (hard max) — планът стои така; следващият вход е
> операторската дума за диспач на AUD-001, не още едно ревю.

## Context (проверено 2026-08-31: Explore ×5, claude-code-guide, history scan)

**Състояние.** 0.1.2 изцяло released (commit `86554c9`, tag `v0.1.2` на origin, Furnissimo
`e32973a4` с 0 диалога); `active/` празна. Remote `https://github.com/divels-studio/promptandpray.git`,
private. `README.md:20` „v0.1.2. Pre-release, private, and not published to any marketplace".

**Одитът днес — какво е в payload-а и какво се е случвало.**
- Вердикт (`pass/fail`, `PASS/NEEDS-FIX`) от Claude е възможен по два пътя: `roles.*.engine:
  claude` (engine-neutral роля, от порта на AIWF — `30bf301`; factory default `claude`,
  `schema:181`) и **`Class: docs` override-ът** (P8, `2ef203d`/`426fc48`): docs-class дифф отива на
  ad-hoc Claude `general-purpose` + `model: "opus"` **независимо от конфига** —
  `docs/WORKFLOW.md:517-533`, `docs/LOOP.md:18-28`, `skills/review/SKILL.md:75-104,275-300`.
  Роден от квота дисциплината (`002_PLAN:91-109`: „един Одиторски пас = ~13% от 5-часовия Codex
  лимит; блокерите — предимно фактически грешки в COO текст"), не от качество.
- В историята на repo-то **нито един вердикт не е идвал от Claude** (DEV-001/002, P8, P9 — всички
  Codex `gpt-5.6-sol`); единственият docs-class тикет (DEV-003) е минал без Одитор.
- **Fact-check гейт** (`skills/review/SKILL.md:161-189`): Explore/sonnet, „върни само невярно/
  непроверимо с file:line" — без вердикт. Операторска оценка след 12 тикета във Furnissimo: върши
  работа, остава задължително и без конфигурация.
- **Pre-pass** (`docs/WORKFLOW.md:282-286`, от P9): същото, но над план, преди readiness pass 1,
  „no verdict". В P9 хвана 5 при 8 за Codex pass 1 — припокриване, защото повечето блокери бяха
  фактически. Не е отделен механизъм; е fact-check над план.
- `model: "opus"` за Claude одитора е pin-нат на три места (`skills/review/SKILL.md:91,291`,
  `docs/WORKFLOW.md:525`, `docs/LOOP.md:23`) — писано когато opus беше най-високият tier. `fable` е
  валиден alias (`schema:204,231`, `interview.mjs:58`).
- Смяна на engine след setup ДНЕС: ре-интервю (`skills/setup/SKILL.md:18-20`; `generate.mjs`
  merge-ва съществуващия конфиг с новите отговори и пре-рендира, `:766-770`)
  или ръчно `aiwf.config.json` + `aiwf-update --resolve .claude/aiwf-native/roles.json` (+
  `--resolve .claude/agents/reviewer.md|qa.md`; `migrate.mjs:1236-1320`,
  `RESOLVABLE_ARTIFACT_TEMPLATES` `:110-118`). `resolveArtifact` само пре-рендира ЗАПИСАН артефакт
  (незаписан → отказ, `migrate.mjs:1280`; един артефакт на извикване; чете `:1303`, пише `:1323`)
  — НЕ създава, не открива и не трие stale agent файл; при claude→codex stale файлът се маха
  единствено през setup (`generate.mjs:808-820` откриване, `--confirm-remove-stale` `:38,90,1115-1128,1338`;
  `interview.mjs:41,268`). Никъде не е описано цялостно; `docs/OPERATOR_PROTOCOL.md` мълчи. Ръчна
  редакция само на `roles.json` работи веднага (resolver-ът е единственият източник за host-а —
  `aiwf-roles.ps1:6`, `aiwf-roles.sh:5`), но selfcheck `roles-match-*`
  (`aiwf-selfcheck.js:1997-2024`) я брои за drift.
- Един Claude agent файл на роля: `templates/agents/reviewer.md.tmpl:10` носи ЕДИН `model` и ЕДИН
  `effort` във frontmatter; Agent tool-ът няма per-invocation effort (`skills/review/SKILL.md:311`),
  `model` може да се подаде при диспач (tier alias).
- „Two passes / third pass" е hardcoded и извън WORKFLOW/LOOP: `docs/REVIEW_CHECKLIST.md:16`,
  `templates/agents/reviewer.md.tmpl:93`, `templates/PROJECT_OVERRIDES.md.tmpl:158`, `README.md:170`,
  `templates/CLAUDE.md.tmpl:29`, `skills/work/SKILL.md:52`, `dev/PROJECT_OVERRIDES.md:244`.
- `planRerender` (`migrate.mjs:544-550`) ХВЪРЛЯ при артефакт без запис в `managedRegions` → rerender
  op за `.claude/agents/reviewer.md` в миграция би счупил apply-а на всяка Codex инсталация (файлът
  не съществува и не е записан).
- Resolver fallback при липсващ файл: `claude/opus/high`, без `class`/`passes` (`aiwf-roles.ps1:94-97`,
  `aiwf-roles.sh:101`); plain режим печата `"engine model effort"` (`aiwf-roles.ps1:172`); wrapper-ите
  ползват само `-AsJson` (`codex-review.ps1:45`). `-RolesPath` е задължителен (`:73`).
- `grep` не съществува на Windows канала (`Get-Command grep` → липсва); каноничният sweep е `git
  grep` (`dev/README.md:43`). `CHANGELOG.md:31` вече съдържа „pre-pass" (история на 0.1.2).

**Механики за преизползване.**
- `templates/roles.json.tmpl:1-5` (reviewer/qa/qal) — mini-Mustache (`generate.mjs:155-231`,
  `{{config.<path>}}`, `{{#each}}`, `{{^}}`; `lookup()` хвърля при липсващ път); рендер
  `generate.mjs:800-802`; agent файлове само за claude-hosted роля (`:805-826`). Exported:
  `renderTemplate` `:304`, `templateContext` `:285`, `sha256` `:134`, `planInstall` `:713`,
  `orderConfig` `:377`, `CONFIG_REL/ROLES_REL` `:109-110`.
- Resolver: `aiwf-roles.ps1:78` `$KnownRoles=@('reviewer','qa','qal')`, чете само
  `engine|model|effort|enabled` (`:136-143`) — **непознати ключове се игнорират**; exit 0/2; JSON
  `{role,engine,model,effort[,enabled]}` (`:169-170`). Огледало `aiwf-roles.sh:93-96,130-146`.
- Схема: root `additionalProperties:false` (`:7`); `review` обект `:353-356+`
  (`productBoundaryChecks`, `additionalProperties:false`); `roles.reviewer` `:173-208` с tier-alias
  `allOf/if/then` (`:195-208`); QAL е codex-only (`:237`). Интервюто е hand-coded
  (`interview.mjs:142-160,193-200`) — нов schema ключ НЕ ражда въпрос сам.
- Миграция `add-config-key` (`validate-payload.mjs:105-120`; `migrate.mjs:499-534`): `askOperator:
  false` → default без диалог; `setConfigPath` (`:309-321`) създава междинните обекти → цял вложен
  обект с една op, после schema валидация (`:520-527`). Rerender на цял файл (`writer.md` в
  `examples/.../0004_example-bump/ops.json`) и на регион (`0003_quiet-rerender/ops.json`).
- Selfcheck: `roles-match-*` `:2001-2024` и `agent-present/effort/model-*` `:2040-2061` — hardcoded
  списъци; skills се откриват по директория (`:2413-2414`); `DOCTRINE_READING_SKILLS` `:2220`
  (seven). `README.md:24` „**Ten commands** as skills" — проза, става eleven.
- Release: `migrations/index.json` 3 записа; `validate-payload.mjs:223-226` префикс == позиция,
  `:245-255` последен == payload версия; example fixture `0004_example-bump` (версия 0.3.0) се
  append-ва към копие на манифеста (`run-example-cycle.mjs:500-501`) → `0005_example-bump`
  (директория, `bump/bump.json:2`, `ops.json:2`, `NOTES.md:1,16,30`,
  `examples/example-project/README.md:17,45,78,79`; `CHANGELOG.md:42` е история — не се пипа).
  `version-stamp` (`aiwf-selfcheck.js:2118-2123`) червен между bump и self-install apply —
  очаквано. Apply: `node scripts/update/aiwf-update.mjs --apply --project-root .` (`--check`,
  `--dry-run` преди това; `aiwf-update.mjs:6-9`).
- Public: `marketplace.json:10` `source: "./"` валиден за git-hosted marketplace; официална форма
  `/plugin marketplace add divels-studio/promptandpray`; `/plugin update` доставя нова версия само
  при bump на `plugin.json.version`; `claude plugin validate .` покрива marketplace + plugin.json;
  LICENSE (MIT) има; `plugin.json` без `repository`/`homepage` (нищо не ги pin-ва).
- Третият tripwire: `docs/WORKFLOW.md:80-86` („Two countable tripwires") и managed регионът
  `templates/CLAUDE.md.tmpl:94-100`; никой друг файл не повтаря текста; никой тест не го pin-ва.
- `README.md:76-80` „no consumer has taken 0.1.2 yet" е невярно (Furnissimo `e32973a4`).

## Решения (COO; продуктовите — операторски, 2026-08-31)

**Продуктови (оператор):** fact-check остава задължителен, без настройка. За план / код (R2-R3) /
докс — платени пасове, engine, модел, effort — настройваеми, сменяеми в началото на сесия с една
команда, без ре-интервю. Effort на всички роли — настройваем. Одитор ≥ COO. Една команда показва
цялата картина на екрана. Без overengineering. Public = public GitHub repo + install от него;
версия 0.2.0; без POSIX proof; proof = Furnissimo през GitHub marketplace.

**Архитектурни (COO):**

1. **Една таблица — `review.plan / review.code / review.docs`** в `aiwf.config.json`. Точно три
   допустими форми на ред, нищо друго не минава:
   - inherited: `{ passes }` — host = Одиторът (`roles.reviewer`) с неговите engine/model/effort;
   - claude: `{ passes, engine: "claude", model: <tier alias> }` — без `effort` (т.4);
   - codex: `{ passes, engine: "codex", model: <string>, effort: <low|medium|high> }`.
   **Схемата стои върху вече поддържаните keyword-и — `oneOf` НЕ се добавя** (валидаторът
   `validate-config.mjs` не го знае, `ASSERTION_KEYWORDS:43-46`, а `collectDefaults:242-255` не
   влиза в него → fresh install нямаше да получи defaults). Формата на реда: `review` става
   `required: ["productBoundaryChecks","plan","code","docs"]`; всеки ред е обект с
   `additionalProperties:false`, `required:["passes"]`, `passes` като `enum` с **`default`** (2/1/1
   — четим от `collectDefaults`, т.е. **fresh setup получава таблицата автоматично**, без нови
   въпроси в интервюто), `engine`/`model`/`effort` незадължителни, и `allOf`+`if/then` (вече
   поддържани, `:43-46`): `engine` present → `required:["model"]`; `engine: "codex"` →
   `required:["model","effort"]`; `engine: "claude"` → `model` е tier alias (правилото на
   `roles.reviewer:195-208`). Забраната „claude ред не носи `effort`" НЕ е в схемата (би искала
   `not`): налага се от `aiwf-roles.mjs --set` (exit 1) и от нов selfcheck assertion
   `review-row-shape` с flipping контрол. `fable` при claude НЕ е schema default — правило на
   `--set` (т.5) и на рендера на `reviewer.md` (т.4). Няма наследяване поле по поле — няма как да
   се получи `claude/gpt-5.6-sol`.
   Factory defaults: `plan {passes:2}`, `code {passes:1}`, `docs {passes:1}` — **докс отива на
   същия Одитор като кода**; „докс → Claude" вече не е правило, а стойност, която виждаш и сменяш.
   `passes`: план ∈ 0..3 = readiness пасове преди да е нужна дума за още един (hard max =
   passes+1); код/докс ∈ 0..2: 1 = един Одиторски пас, 2 = втори пълен пас след `pass`, 0 = без
   Одитор (COO първолично + fact-check; печата се като „no auditor"). Корекционните рундове остават
   `loop.correctionRoundsCap`.
2. **Pre-pass като понятие пада.** Едно правило: **fact-check преди всеки платен пас — над дифф
   или над план.** Същият агент (Explore, sonnet), същият контракт (без вердикт), непроменяем.
3. **`roles.json` носи ефективната таблица** — `review: { plan|code|docs: { passes, engine, model,
   effort } }`, попълнена при рендер (`generate.mjs` слага в `context` ефективния ред: собствен host
   или Одитора). **Resolver контракт** (двата канала, огледално): нов незадължителен `-Class
   plan|code|docs` (`--class`), само с `-Role reviewer` — с друга роля → exit 2; невалиден клас →
   exit 2. С клас: JSON `{role:"reviewer", class, engine, model, effort, passes}`; plain режим
   печата `"engine model effort passes"` (четири токена; wrapper-ите ползват само `-AsJson`).
   `roles.json` присъства, но без `review.<class>` запис (рендер отпреди таблицата) → exit 2 с
   „roles.json predates the audit table - run /pnp:update". Липсващ файл → досегашният fallback
   `claude/opus/high` + `class` + factory `passes` (2/1/1), exit 0 — fallback-ът остава „дефектна
   инсталация, не избор". Без клас — байт-идентичен изход с днешния. **Codex wrapper-ите са
   class-aware:** `codex-review.ps1` получава незадължителен `-Class` (`codex-review.sh`
   `--class`), подава го на resolver-а (`:44-68` / `:52-95`) и ползва model/effort на РЕДА; без
   `-Class` — днешното поведение. `/pnp:review` подава класа при всяко извикване.
4. **Одитор ≥ COO, един agent файл на роля.** Claude-hosted одитор/QA по подразбиране `fable`
   (schema default при `engine: claude` за reviewer/qa и за редовете; QAL е codex-only и не се
   пипа). `reviewer.md` се рендира, когато Одиторът ИЛИ кой да е ред е claude; frontmatter-ът му е
   ЕДИН: `model` = моделът на Одитора, ако той е claude, иначе `fable`; `effort` =
   `roles.reviewer.effort`. При диспач `/pnp:review` подава модела на РЕДА (Agent tool `model`
   override — tier alias), а effort-ът е винаги този от frontmatter-а → **Claude-hosted ред НЕ носи
   собствен effort**: схемата го забранява при `engine: claude` (ред с `engine: codex` го носи —
   wrapper-ът го подава като argv). `/pnp:roles --show` печата за такъв ред „effort: high (the
   Reviewer's - Claude rows share the agent file)"; `--set docs.effort=…` върху claude ред → exit 1
   с това изречение. Трите `model: "opus"` места изчезват; ad-hoc `general-purpose` reviewer пътят
   пада. Factory fallback-ът на resolver-а не се пипа. **QA е извън правилото „≥ COO"** (оператор,
   2026-09-01: QA сравнява артефакти с acceptance критерии, не одитира решения): claude QA на
   `opus` е нормален избор, `--show` НЕ го маркира „(below the top tier)" — маркерът е само за
   Одитора и редовете на таблицата; `fable` остава само default при `--set qa.engine=claude` без
   модел.
5. **`/pnp:roles` = `scripts/setup/aiwf-roles.mjs`, двуфазен, без `resolveArtifact`.**
   Три операции: `--show`; `--set <target>.<field>=<value>` (повече от един в едно извикване;
   `target` ∈ writer|reviewer|qa|qal|plan|code|docs; `field` ∈ engine|model|effort|passes|enabled;
   `passes` → integer, `enabled` → boolean); `--reset <plan|code|docs>` → редът се свива до
   inherited `{ passes }` (единственият път обратно към Одитора). **Exit кодове (един контракт):**
   0 = записано; **1 = отказ** — schema невалиден резултат (вкл. `passes` извън обхват), held,
   edited, stale без флаг, codex без модел; **2 = usage** — непознат флаг/target/field, непарсваема
   стойност (`passes=x`, `enabled=maybe`). Правила при `--set X.engine=…` без `X.model`: claude →
   `model=fable` (печата се); codex → ако Одиторът е codex, взима неговите model+effort, иначе
   exit 1 „codex needs a model id, e.g. X.model=gpt-5.6-sol". Ред с `engine` се записва в пълната
   си форма (т.1). **Фаза 1 (нищо не се пише):** новият конфиг → schema валидация → рендер на
   `roles.json` и agent файловете (`reviewer.md`/`qa.md` по т.4) → за всеки целеви артефакт:
   записан и непипан (`sha(actual)==local`) → rerender; незаписан и липсващ → СЪЗДАВАНЕ (нов запис
   `upstream=local=sha(render)`, `override:false`); записан с `override:true` → exit 1 „held - use
   `aiwf-update --resolve <key>`"; записан и редактиран → **първо** се сравнява с ЖЕЛАНИЯ рендер:
   `sha(actual) == sha(newRender)` → already-applied (само стампът се обновява, файлът не се пипа —
   това е и възстановяването след крах между двата записа), иначе exit 1 „edited - resolve first";
   незаписан, но СЪЩЕСТВУВАЩ файл → същото сравнение: равен на рендера → приема се и се записва;
   различен → exit 1 „a file I did not write is in the way - move it or `--adopt`"; stale
   (записан, съществува, вече не е claude-hosted) → изтриване само с `--confirm-remove-stale`,
   иначе exit 1 с името на файла. Всяка грешка във фаза 1 → exit 1, **нула записи**. **Фаза 2 —
   честната гаранция е plan-before-write, не транзакция** (същата като setup —
   `generate.mjs:1190-1209` е последователен `writeFileSync`/`rmSync`): фиксиран ред — agent
   файлове → `roles.json` → `aiwf.config.json` (конфиг + bookkeeping в един файл, ПОСЛЕДЕН). Крах
   между тях оставя артефакт без стамп; selfcheck го показва като drift, а **повторното същото
   `--set` го довършва по already-applied клона от фаза 1** (равен на рендера → стампва, не пита).
   Без journal, без rollback — записано в header-а на скрипта; crash-injection тест след всеки
   phase-2 запис доказва, че второто извикване приключва с exit 0 и чист selfcheck. После selfcheck, после таблицата. Преизползва
   `renderTemplate`, `templateContext`, `sha256`, `orderConfig`, схемата, stale откриването
   (`generate.mjs:820-826`, exported); нищо копирано. `skills/roles/SKILL.md` го обвива (Step 0
   контракт; изрична дума преди `--confirm-remove-stale`); **`/pnp:mission` и `/pnp:work` печатат
   таблицата в доклада си**. Интервюто НЕ получава нови въпроси (defaults + таблицата в края).
6. **Миграция `0004_audit-table` се авторства в AUD-001** (решено, не оставено на Колегата).
   Артефакт, който съществува само на някои инсталации (`reviewer.md` — само claude-hosted),
   получава **условен rerender**: `rerender-managed-region` приема ново незадължително поле
   `"ifRecorded": true` (`validate-payload.mjs:121-126` `optional`, тип boolean); `planRerender`
   (`migrate.mjs:544-550`) при `ifRecorded && !previous` връща `mode:'none'` със summary
   „`<key>`: not on this installation (no record) - skipped" вместо да хвърля; без полето —
   поведението е днешното (хвърля). Тест в `test-update.mjs`: op с `ifRecorded` върху fixture без
   запис → пропуснат, exit 0; същият op без полето → UpdateError. Op-ове на 0004 в AUD-001:
   3× `add-config-key` (`review.plan/code/docs`, `askOperator:false`); `rerender-managed-region`
   `.claude/aiwf-native/roles.json` (цял файл); `rerender-managed-region`
   `.claude/agents/reviewer.md` `ifRecorded:true`; `note` (id `overrides-loop-shape`: „Your
   overrides document's Loop shape section still says plan readiness has two passes; the contract
   is now `review.plan.passes` (`/pnp:roles`) - edit that line yourself, the document is yours";
   docRefs → `docs/WORKFLOW.md`). Bump 0.2.0 и self-install apply — в AUD-001. AUD-002 ДОБАВЯ
   7-ми op `rerender-managed-region CLAUDE.md#aiwf-core` и пре-прилага региона на self-install-а
   с `--resolve` + resolution файл (AUD-002 §3 — `--resolve` ВИНАГИ отваря диалог,
   `migrate.mjs:1307-1313`; без TTY/файл спира с exit 1, `aiwf-update.mjs:107-120`).
7. Текстът на tripwire (3) — фиксиран (AUD-002 §4).
8. **Sweep-овете са с точни пътища и изключения:** payload sweep = `git grep -nE '<pattern>' --
   docs skills templates README.md` (без `scripts` — fixture `model: opus` в
   `aiwf-selfcheck.js:3732`; без `CHANGELOG.md` — история; без `examples`). Pattern-ът покрива и
   `model: opus` без кавички (`docs/LOOP.md:23`) и всички „two/third pass" формулировки (AUD-002 §5).
9. **COO self-pass преди платен readiness pass 1** (доктрина, влиза в AUD-002 § Plan readiness):
   след като чернова е „готова", COO я препрочита в ОТДЕЛЕН ход срещу шестте readiness проверки —
   всеки `file:line` отворен, всяка команда изпълнима на записания OS канал, нито едно „ако
   Колегата намери…", всяко обещание за гаранция сверено с кода, който я дава; fact-check агентът
   получава и „every acceptance command exists and can fail". Причина: readiness на този план —
   pass 1: 10 блокера, 8 от които авторови (шорткъти, отложено решение, непрочетен код); pass 2:
   14, от които 11 видими още в pass 1 (нарушение на fail-aggregation от Одитора). Платеният пас
   верифицира решения; прецизността се плаща на собствена сметка.
10. **Планът е комитнат сам, преди първия тикет** (dev/ docs, операторски клик 2026-09-02) — за да
    тръгне следващата сесия от tracked файл, а commit-ът на AUD-001 да носи само работата по
    тикета. Closeout `git mv` работи върху tracked файл.

## AUD-001 [R2 code-class] — таблицата на одита: схема, рендер, resolver, `/pnp:roles`, 0004, 0.2.0

**Обхват:**
1. `schema/aiwf.config.schema.json`: `review.required` += `plan/code/docs`; всеки ред по т.1
   (`required:["passes"]`, `passes` enum + `default` 2/1/1, `allOf`/`if/then` за host полетата,
   tier-alias при claude). `validate-config.mjs` НЕ се пипа (никакъв нов keyword).
2. `templates/roles.json.tmpl`: `review` блок с ефективните редове; `generate.mjs` ги изчислява в
   `context` (`templateContext` `:285`); `planInstall` `:805-826`: `reviewer.md` при claude на
   Одитора ИЛИ на ред, frontmatter по т.4; `reviewer.md.tmpl:10` (model/effort източник).
3. Resolver ps + sh по т.3: `-Class`/`--class`, изходи (JSON и plain с 4 токена), exit кодове,
   fallback; `.EXAMPLE` блокове; `scripts/native/README.md`. Без клас: байт-идентичен изход (тест:
   snapshot на днешния). Wrapper-и `codex-review.ps1`/`codex-review.sh`: незадължителен
   `-Class`/`--class`, подаден на resolver-а; `-m` и effort от реда; без клас — днешното.
   `docs/CODEX_REVIEW_QA_RECIPE.md` — редът с флага.
4. `scripts/setup/aiwf-roles.mjs` по т.5 (`--show` / `--set …` / `--reset <row>` /
   `--confirm-remove-stale` / `--project-root` / `--plugin-root`; exit 0 / 1 отказ / 2 usage;
   header-ът казва plan-before-write, без транзакция). `--show` формат (фиксиран):
   ```
   role/class   host    model            effort  passes  notes
   writer       claude  claude-opus-5[1m] high    -       -
   reviewer     codex   gpt-5.6-sol      high    -       -
   qa           codex   gpt-5.6-sol      high    -       runtime/UI tickets only
   qal          off     -                -       -       operator-gated
   plan         codex   gpt-5.6-sol      high    2       +1 with your word; fact-check before each pass
   code (R2/R3) codex   gpt-5.6-sol      high    1       correction rounds cap 2; fact-check before each pass
   docs (R2)    codex   gpt-5.6-sol      high    1       fact-check before each pass
   fact-check   claude  sonnet           -       always  not configurable
   R1           -       -                -       0       no auditor
   ```
   (`(the Reviewer's)` след effort на claude ред; `(below the top tier)` след claude модел ≠ fable;
   `no auditor` при passes 0.)
5. `skills/roles/SKILL.md`; `skills/mission/SKILL.md:50-51` и `skills/work/SKILL.md:40-46` печатат
   `--show`; `skills/setup/SKILL.md` в края печата таблицата и сочи `/pnp:roles`.
6. Selfcheck: `roles-match-*` покрива `review.*` (ефективен ред == конфиг+Одитор); `agent-present-*`
   и **`managed-regions-cover`** (`:2101-2111`, очакваният набор ключове идва само от
   `roles.<role>.engine`; fixture списъкът `:312`) — новото правило (файл/запис при claude Одитор
   ИЛИ claude ред; stale иначе); `aiwf-roles.mjs` върху
   fixture с flipping контроли: drift `review.docs.engine`; `passes=9` → exit 1, `passes=x` → exit
   2; `--set docs.engine=claude` → `reviewer.md` създаден с `model: fable`, `--reset docs` без флаг
   → exit 1 и файлът стои, с `--confirm-remove-stale` → изтрит и редът е `{passes:1}`;
   `override:true` → exit 1 без запис; claude ред + `effort` в конфига → `review-row-shape` FAIL
   (нов assertion + контрол), `--set … effort` върху claude ред → exit 1; фаза-1 грешка при два
   `--set` → нито един записан; crash-injection: изтрит стамп след записан артефакт → повторното
   `--set` завършва exit 0 (already-applied клон) и selfcheck е зелен; чужд файл на мястото на
   agent-а → exit 1; resolver `-Class` върху ps и sh — JSON и plain (валиден, невалиден
   клас, друга роля, липсващ файл, roles.json без `review`); wrapper-ите с `-Class` (spike-ът на
   wrapper флаговете, `scripts/spike/`); `DOCTRINE_READING_SKILLS` += `roles`. `test-setup.mjs`:
   рендер на `review`, претъркаляне claude→codex→claude през `aiwf-roles.mjs`, **fresh install
   proof**: `/pnp:setup` върху чист fixture (без миграции) → `aiwf.config.json` носи
   `review.plan.passes=2`, `code=1`, `docs=1` от schema defaults и `roles.json` показва същото.
   `test-update.mjs`:
   `0004` apply върху fixture без `review` (3 add-config-key без диалог + тих rerender на непипан
   `roles.json` + пропуснат `reviewer.md` „not on this installation" + note), `ifRecorded`
   двойката (виж т.6), `--resolve roles.json` след смяна на ред.
7. Миграция `migrations/0004_audit-table/ops.json` (6 op-а по т.6) + `NOTES.md` (по тона на 0003:
   какво влиза в конфига и защо; тихо пре-рендиране на непипан `roles.json`; `reviewer.md`
   пре-рендиран само там, където съществува; „docs no longer goes to a Claude host by itself -
   `/pnp:roles` shows who audits what"; бележката за overrides документа); `migrations/index.json`
   4-ти запис 0.2.0; `.claude-plugin/plugin.json` 0.2.0; `migrations/README.md` — полето
   `ifRecorded`. Example fixture → `0005_example-bump` (сайтовете от Context; `NOTES.md:30` се
   пренаписва да носи само новото id — „renamed once more for 0.2.0, now `0005_example-bump`" —
   за да остане acceptance grep-ът празен).
   `examples/example-project/answers*.json`: reviewer `fable`; README на примера. CHANGELOG блок
   `## [0.2.0] - <дата>` (§ Added: audit table + `/pnp:roles`, `ifRecorded`; § Changed: Claude
   auditor top tier; § Removed: ad-hoc opus reviewer) — AUD-002 и PUB-001 добавят в същия блок.
   Планът вече е в Git (т.10) — този commit не го носи.
8. Self-install: `node scripts/update/aiwf-update.mjs --check --project-root .` → exit 1 (pending
   0004); `--dry-run` → exit 0, печата 3 add-config-key + `0004_audit-table[3]
   .claude/aiwf-native/roles.json: the payload version applied (you had not edited it)`
   (`migrate.mjs:662`, `aiwf-update.mjs:200`) + `[4] .claude/agents/reviewer.md: not on this
   installation (no record) - skipped` + note-а; `--apply` → exit 0, **0 диалога**;
   `CHANGES_0.1.2-to-0.2.0.md` в commit-а; `aiwf.config.json` стампове 0.2.0 / `0004_audit-table`.
9. Един commit (Колега, операторски клик): `AUD-001: the audit table - review.<class> config,
   /pnp:roles, resolver -Class - 0.2.0`; без trailers.

**Извън обхват:** доктрината и `/pnp:review` четенето на таблицата (AUD-002); интервю въпроси;
public docs.
**Acceptance (буквално, Windows канал, cwd = repo root; всяка команда може да fail-не с
named output):**
- `pwsh -NoProfile -File scripts/native/ps/aiwf-roles.ps1 -Role reviewer -Class docs -RolesPath .claude/aiwf-native/roles.json -AsJson`
  → exit 0, `{"role":"reviewer","class":"docs","engine":"codex","model":"gpt-5.6-sol","effort":"high","passes":1}`;
  `-Class plan` → `"passes":2`; `-Role qa -Class docs` → exit 2; без `-Class` → байт-идентично с
  днешното `{"role":"reviewer","engine":"codex","model":"gpt-5.6-sol","effort":"high"}`.
- `pwsh -NoProfile -File scripts/native/ps/aiwf-roles.ps1 -Role reviewer -Class docs -RolesPath .claude/aiwf-native/roles.json`
  (plain) → exit 0, `codex gpt-5.6-sol high 1` (четири токена).
- `& "C:\Program Files\Git\bin\bash.exe" scripts/native/sh/aiwf-roles.sh --role reviewer --class docs --roles-path .claude/aiwf-native/roles.json --as-json`
  → същият JSON; без `--as-json` → `codex gpt-5.6-sol high 1`. (На тази машина `bash` на PATH е
  WSL — `C:\WINDOWS\system32\bash.exe`; literal пътят до Git bash е задължителен.)
- `node scripts/setup/aiwf-roles.mjs --show --project-root . --plugin-root .` → exit 0, таблицата
  от §4 с Codex на трите реда и 2/1/1. (Round-trip-ът `--set docs.engine=claude` → `--reset docs
  --confirm-remove-stale` се доказва върху fixture в selfcheck/test-setup, §6 — не върху
  self-install-а, чието дърво носи целия дифф на тикета.)
- `node scripts/update/aiwf-update.mjs --check --project-root .` → exit 0, „up to date … 0.2.0".
- `node scripts/update/validate-payload.mjs --plugin-root .` → exit 0, „4 migrations".
- `git grep -n "0004_example-bump" -- . ":(exclude)dev" ":(exclude)CHANGELOG.md"` → празно, exit 1.
- Осемте VERIFY от `aiwf.config.json:127-169` → exit 0 (selfcheck СЛЕД §8); `git grep -nP
  "[\x{0400}-\x{04FF}]" -- docs skills templates scripts schema hooks migrations` → празно.
**Risk threshold:** блокира всяка промяна на fail-direction на гейтовете, всеки запис на
`roles.json`/agent файл извън два-хеш bookkeeping-а, всеки запис при фаза-1 грешка, всеки
VERIFY ≠ 0.
**Stop condition:** VERIFY + acceptance зелени → Одиторът спира.
**Review:** `Class: code` → Codex (`gpt-5.6-sol`/high), fact-check преди това. Cap 2.
**Assignee:** Колега. Branch `main`.

### AUD-001 — Completion record (2026-09-02)

**Commit `93f4510a8035455152dcb04c9eba27c2adaee8f8`** върху котвата `a4f067e` (branch `main`, локален,
непушнат): 35 файла, 2559+/109− (`git diff a4f067e..93f4510 --stat`). Изпълнено по обхвата §1–9:
таблицата в схемата (redove с `required:["passes"]` + `default` 2/1/1, `allOf`/`if/then`, effort
enum на codex ред), ефективни редове в `roles.json`, resolver `-Class`/`--class` (reviewer-only,
байт-идентичен изход без флага), class-aware review wrapper-и, `scripts/setup/aiwf-roles.mjs` +
`skills/roles/SKILL.md` (mission/work/setup печатат таблицата), `ifRecorded` на
`rerender-managed-region`, миграция `0004_audit-table` (6 op-а), fixture → `0005_example-bump`,
bump 0.2.0 + CHANGELOG блок, self-install apply (0 диалога) + `CHANGES_0.1.2-to-0.2.0.md`.

**Отклонения (приети от Одитора):** (1) `review.required` НЕ получи трите реда — per-op
валидацията на `migrate.mjs:524-527` прави тройката несъвместима със собствената 3×add-config-key
миграция на плана; компенсирано със schema defaults (fresh-install proof в `test-setup.mjs` §22) и
selfcheck `review-row-shape` с контроли; мотивът е в `$comment` на схемата. (2) TEMPLATE CONTRACT
блокът на `reviewer.md.tmpl` е обновен още тук (иначе диффът носеше невярно твърдение); тялото
остава за AUD-002.

**Ревю:** fact-check ×2 (Explore/sonnet, prose на диффа и на корекционната делта) — 0 находки.
Codex `gpt-5.6-sol`/high, `Class: code`: pass 1 `fail` с 6 блокера (P1 — трием held stale agent
файл; effort отворено множество; `ifRecorded` recovery осиновява чужд файл; `-Class ''` деградира
до безкласов диспач; ред-зависимост на multi-`--set`; phase-2 ред + crash покритие) → корекционен
рунд 1 (в cap 2), всичките шест поправени с production-path тестове → pass 2
**`pass-with-notes`**, 0 блокера на прага, без регресии. Non-blocking: диагнозата „predates the
audit table" при malformed roles.json в class режим (fail-closed, само неточна); ps каналът
доказва class branch-а с три взаимно изключващи се refusal съобщения (няма codex stub harness на
ps — заварено).

**Верификация (Колегата, точни кодове):** 8-те VERIFY от `aiwf.config.json` → exit 0
(`test-setup.mjs` 311 checks / `test-update.mjs` 445 / example cycle 2×44 / selfcheck 807
assertions на self-install-а, 810 на синтетичния fixture / spikes 99 / `claude plugin validate .`
✔); Cyrillic grep по payload пътищата → празен, exit 1; всички acceptance команди на тикета →
буквално изпълнени, вкл. байт-идентичния безкласов resolver изход и
`aiwf-update --check` → „up to date … 0.2.0".

**История на рунда (наратив):** сесията на Колегата умря два пъти извън кода — веднъж на 100%
пълен `D:` (спря с нула записи, планът за поправките оцеля в контекста; операторът освободи
място), веднъж на session limit по средата на VERIFY (дървото проверено байт-идентично,
довърши след reset-а). Останал дълг: няма.

## AUD-002 [R2 code-class] — доктрината чете таблицата; tripwire (3); регионът в 0004

**Обхват:**
1. `skills/review/SKILL.md`: Step 0c — класът от брифа (`Class: plan|code|docs`, default `code`)
   → resolver с `-Class`; host = Codex wrapper или рендирания `reviewer` агент с `model: <row.model>`
   (ad-hoc `general-purpose`/`opus` пътят `:289-316` пада); readiness цикълът = `passes` + един с
   дума (`:203-208`); code/docs `passes` 0/1/2 семантиката; Step 2b fact-check „over a diff or a
   plan, before every paid pass" (`:161-189`); `:143` съответно. `skills/qa/SKILL.md`: модел от
   `roles.json`, `fable` в примерите. `skills/work/SKILL.md:52` „third readiness pass" → „a pass
   beyond `review.plan.passes`".
2. Доктрина — всяко място, което hardcode-ва „two passes"/„third pass"/„opus"/„pre-pass":
   `docs/WORKFLOW.md` § Routes `:517-533` (→ „engine and pass count come from `review.<class>`;
   factory default is the Reviewer role, one pass; a docs-class ticket on a Claude host is a
   configuration you can see with `/pnp:roles`, not a rule"), § Plan readiness `:269-312`
   (`review.plan.passes`, hard max passes+1, pre-pass параграфът `:282-286` → fact-check над плана),
   § Loop shape `:211-235` (контрактът = таблицата), § operator gates `:135-136` („a third
   readiness pass … the two readiness passes" → „a pass beyond `review.plan.passes`"), § Planning
   lock `:261` („two-pass branch" → „the readiness branch"), `:293,295` („pass two", „standard
   two"), `:522-523` (wrapped „whatever `roles.reviewer.engine` says"), `:525` opus, § COO owns
   broad scans `:80-86` tripwire (3), § Plan readiness — COO self-pass параграфът (Решения т.9);
   `docs/LOOP.md:18-28,23,48-50`; `docs/REVIEW_CHECKLIST.md:16-23,42` („two full read-only
   passes", „pass two", „standard two"); `skills/review/SKILL.md:205` („standard two");
   `templates/agents/reviewer.md.tmpl:15-30`
   (host условието: „this file exists when the Reviewer role OR any review row is Claude-hosted")
   и `:93-102`; `templates/PROJECT_OVERRIDES.md.tmpl:158,171`; `README.md:24` (eleven commands,
   `roles`), `:159-162` (engine абзацът → таблицата), `:170`; `templates/CLAUDE.md.tmpl:29-30`
   (гейтът: „a pass beyond `review.plan.passes`") и `:94-100` (tripwire (3) + „the audit table is
   `/pnp:roles`"); `skills/work/SKILL.md:52-55`; `docs/OPERATOR_PROTOCOL.md` — секция „What audits
   what" → `/pnp:roles`; `dev/PROJECT_OVERRIDES.md:244` (операторски файл — COO R1 docs редакция в
   същия commit, обявена).
3. Миграция `0004_audit-table` получава 7-ми op `rerender-managed-region CLAUDE.md#aiwf-core`;
   `NOTES.md` допълнен (какво се сменя в региона). Self-install (0004 вече е приложена в AUD-001,
   `--resolve` е пътят, и той ВИНАГИ пита): COO пише `.aiwf/resolve-region.json` с
   `{ "CLAUDE.md#aiwf-core": { "kind": "conflict", "resolution": "take-new" } }` (bare key в
   `--resolve` режим, `aiwf-update.mjs:40`), после `node scripts/update/aiwf-update.mjs --resolve
   "CLAUDE.md#aiwf-core" --project-root . --resolution-file .aiwf/resolve-region.json` → exit 0,
   summary „CLAUDE.md#aiwf-core: the payload version applied", root `CLAUDE.md` с новия текст,
   bookkeeping upstream==local. `test-update.mjs`: 0004 със 7 op-а върху fixture — 0 диалога
   (add-config-key ×3 без въпрос, 2 тихи rerender-а, 1 пропуснат, 1 note). CHANGELOG 0.2.0:
   § Added third tripwire, COO self-pass; § Changed docs-class rule → configuration, fact-check
   over plans; § Removed pre-pass as a separate step; § Added „fifth brief-authoring failure: a
   scope guard is anchored to HEAD at dispatch (AUD-002)"; § Changed „the fact-check gate guards
   the expensive pass, whichever engine hosts it (AUD-002)".
4. Tripwire (3) — `docs/WORKFLOW.md:80-86`: „Two" → „Three countable tripwires", „these two
   moments" → „three", след (2): „(3) **Running a mechanical procedure is agent work, not COO
   work.** A helper script, a bulk find/replace, a verify cycle over a fixed list, debugging a
   helper the COO wrote a minute ago - "run this procedure and report" goes to a `general-purpose`
   subagent (`model: sonnet`; `haiku` when the job is counting) with exact inputs (paths, the
   mapping, the expected numbers, the verify commands) and an output contract. The COO decides,
   briefs, reads the result and commits; the SECOND inline fix of the same helper in one session
   is the countable moment - the first was the slide, the second is the pattern." „Both exist" →
   „All three exist". `templates/CLAUDE.md.tmpl:97-100`: „Three countable tripwires", след (2):
   „(3) running a mechanical procedure (helper script, bulk replace, verify cycle, debugging your
   own helper) is a `general-purpose` subagent's job with exact inputs and an output contract - a
   second inline fix of the same helper in one session is one too many."
4b. **Пета brief-authoring грешка — scope guard-ът се закотвя към HEAD при диспач** (урок от
   Furnissimo UIS-013, 2026-09-01, commit `83698ef3` там: guard-ът „кои файлове пипна тикетът"
   беше закотвен към code commit-а на предишния тикет; между него и HEAD стоеше COO commit-ът с
   completion record-а → guard-ът обяви PLAN файла за „outside scope" и VERIFY 10 падна на чист
   дифф; Колегата правилно отказа да „адаптира" командата). `docs/WORKFLOW.md:361-374` § Ticket
   brief contract: „Four brief-authoring failures" → „Five", пети bullet дословно:

   > - **A scope or diff guard is anchored to HEAD at dispatch, never to an older commit.** A
   > guard that asks "what did this ticket touch" must diff against the tree the Writer started
   > from (`git rev-parse HEAD` at the moment of dispatch, written into the brief as a literal
   > hash); anchoring it to "the previous ticket's commit" silently includes every commit made in
   > between - typically the COO's own completion-record commit - and manufactures a false VERIFY
   > failure the Writer cannot (and must not) fix. Guards that intentionally span several tickets
   > (e.g. "no `messages/**` change since `<base>`") stay on their named base, but say so
   > explicitly.

   Огледала: няма — списъкът живее само в `docs/WORKFLOW.md` (haiku scan 2026-09-01: нула hits в
   templates/, skills/, README). Acceptance (exit-sensitive, не текст след стрелка):
   `pwsh -NoProfile -Command "$n=(Select-String -Path docs/WORKFLOW.md -Pattern 'anchored to HEAD at dispatch' -AllMatches).Matches.Count; if ($n -ne 1) { Write-Error \"hits=$n, expected 1\"; exit 1 }"`
   → exit 0; `git grep -n "Four brief-authoring" -- docs` → празно (exit 1). Влиза в
   sweep-а на §5 като pattern `Four brief-authoring`.
4c. **Fact-check гейтът пази СКЪПИЯ пас, не външния engine** (Furnissimo 2026-09-01: Одиторът
   премина на claude/fable след изчерпана Codex квота — fable пас струва повече от Codex пас, а
   текстът казва „skipped when the claude branch resolved (no paid pass to protect)"). Сайтове
   (grep 2026-09-01): `skills/review/SKILL.md:161` (заглавието „before a paid pass" → „before every
   pass above the scan tier"), `:163` („Before dispatching to a paid external engine (the codex
   branch)" → „Before dispatching any reviewer pass whose model is above the scan tier - a codex
   pass, or a claude reviewer on `opus`/`fable`"), `:184-186` (skip клаузата → „The gate may be
   skipped only when the reviewer itself runs on a scan-tier model (`haiku`/`sonnet`) - there is
   nothing more expensive than the gate to protect"); `docs/WORKFLOW.md:120-127` („run BEFORE any
   paid pass" → „run BEFORE every reviewer pass above the scan tier"), `:137` и `:229-235` („second
   PAID pass" → „second pass above the scan tier"; смисълът — квота/цена — непроменен);
   `docs/CODEX_REVIEW_QA_RECIPE.md:76` („before a paid pass is spent" — остава, там е за Codex).
   Selfcheck `doctrine-review-factcheck` (`:2278-2282`) проверява само заглавието Step 2b,
   „fact-check" и дословното задание — не пада; етикетът му `:2279` се преформулира („runs before
   every pass above the scan tier"). Acceptance: `git grep -n "no paid pass to protect" -- skills
   docs` → празно; `git grep -c "above the scan tier" -- skills/review/SKILL.md docs/WORKFLOW.md`
   → ≥1 във всеки (проверено с `git grep -L … → празно`). CHANGELOG § Changed: „the fact-check
   gate guards the expensive pass, whichever engine hosts it (AUD-002)". Влиза в sweep-а на §5 като
   pattern `paid external engine \(the codex branch\)|no paid pass to protect`.
5. Selfcheck: **`doctrine-review-class`** (`:2233-2242,2283-2299`; константите
   `DOCTRINE_REVIEW_*`; 4 flipping контрола `:2367-2374`) pin-ва буквално `regardless of
   `roles.reviewer.engine``, `subagent_type: "general-purpose"` и „it always runs on the
   configured engine Step 0b resolved" — и трите ПАДАТ от `skills/review/SKILL.md` → assertion-ът
   и контролите се пренаписват към новите претенции (class → resolver `-Class`; readiness на
   `review.plan`; Claude host = рендираният `reviewer` агент). Плюс по един assertion с flipping
   контрол за ВСЯКА сменяна повърхност (механизмът на PAYLOAD DOCTRINE секцията; wrapped
   изречения се проверяват от per-surface assertion-ите с `collapseWs`, не от sweep-а):
   `skills/review/SKILL.md` (resolver с class; fact-check over a plan),
   `docs/WORKFLOW.md` (review.<class>; self-pass; Three tripwires), `docs/LOOP.md`,
   `docs/REVIEW_CHECKLIST.md`, `templates/agents/reviewer.md.tmpl`,
   `templates/PROJECT_OVERRIDES.md.tmpl`, `templates/CLAUDE.md.tmpl`, `skills/work/SKILL.md`,
   `README.md` — всеки със стабилна нова фраза; плюс **production sweep** (изпълнява точно):
   `git grep -nE 'model: "?opus"?|pre-pass|whatever `roles\.reviewer\.engine` says|Two countable tripwires|two full passes|two full read-only passes|two-pass|third pass|third readiness pass|two readiness passes|pass two|standard two|minimum of two|Three passes are the hard maximum|Four brief-authoring|no paid pass to protect|paid external engine \(the codex branch\)' -- docs skills templates README.md`
   → празно, exit 1; flipping контрол: копие с върната фраза → FAIL. (Новата формулировка на
   гейта е „a pass beyond `review.plan.passes`" — не съдържа нито един от pattern-ите.)

**Извън обхват:** public docs (PUB-001); интервю; QAL; `scripts/`, `CHANGELOG` история и
`examples/` са извън sweep-а по дизайн (т.8).
**Acceptance (буквално; `git grep -L` печата файловете БЕЗ съвпадение — празно = всички го носят):**
- sweep-ът от §5 → exit 1 (празно).
- `git grep -L "review.plan.passes" -- docs/WORKFLOW.md docs/REVIEW_CHECKLIST.md templates/agents/reviewer.md.tmpl templates/PROJECT_OVERRIDES.md.tmpl templates/CLAUDE.md.tmpl skills/work/SKILL.md README.md`
  → празно.
- `git grep -n "OR any review row" -- templates/agents/reviewer.md.tmpl` → 1 hit.
- `git grep -L "Three countable tripwires" -- docs/WORKFLOW.md templates/CLAUDE.md.tmpl CLAUDE.md`
  → празно.
- `node scripts/update/aiwf-update.mjs --check --project-root .` → exit 0, „up to date … 0.2.0".
- `node scripts/update/validate-payload.mjs --plugin-root .` → exit 0, изходът съдържа
  `4 migration(s)` (точният литерал, `validate-payload.mjs:422`).
- Броенето е exit-sensitive, не текст след стрелка:
  `pwsh -NoProfile -Command "$n=(Select-String -Path migrations/0004_audit-table/ops.json -Pattern '\"op\":' -AllMatches).Matches.Count; if ($n -ne 7) { Write-Error \"ops=$n, expected 7\"; exit 1 }"`
  → exit 0.
- VERIFY 8/8 exit 0; Cyrillic `git grep` празно.
**Risk threshold / Stop / Review / Assignee:** като AUD-001; fact-check над NOTES/CHANGELOG/WORKFLOW/
skill прозата преди Codex. Commit: `AUD-002: doctrine reads the audit table; third tripwire`.

### AUD-002 — Completion record (2026-09-02)

**Commit `f3918ffe4ede733329c3af87164d74d51fef9185`** върху котвата `93f4510` (branch `main`,
локален, непушнат): 18 файла, 813+/275− (`git show --stat f3918ff`) — 17 payload/self-install +
обявената COO редакция на `dev/PROJECT_OVERRIDES.md` (Loop shape → `review.plan.passes`); PLAN
файлът доказано извън commit-а. Изпълнено по обхвата §1–5: доктрината чете таблицата
(WORKFLOW/LOOP/REVIEW_CHECKLIST/OPERATOR_PROTOCOL/README/шаблоните), `skills/review` резолвва
реда през `-Class` (ad-hoc `general-purpose`/`opus` пътят падна), readiness = цикъл по
`review.plan.passes` (hard max passes+1), fact-check = едно правило „before every pass above the
scan tier, over a diff or a plan", tripwire (3) и петата brief-authoring грешка дословно, COO
self-pass параграфът, 0004 → 7 op-а (регионът `CLAUDE.md#aiwf-core`, приложен на self-install-а
през `--resolve` + resolution файл, 0 диалога), selfcheck: `doctrine-review-class` пренаписан +
15 per-surface assertion-а с контроли + retired-phrase sweep + `DOCTRINE_FACTCHECK_SITES`.

**Отклонения (приети):** нищо не стои стейджнато преди ревюто (стейджването само при commit);
изречението за таблицата в `templates/CLAUDE.md.tmpl` е при диспач секцията, не на `:94-100`
(pin-нато със собствен assertion); един диагностичен `; echo` върху Cyrillic grep-а (еднократен,
обявен); `skipWhen` механизъм на notes контрола (открит с реален 451/4 FAIL, не с разсъждение);
`skills/qa/SKILL.md` и recipe-то непипнати по причина (QA вече чете модела от roles.json;
`before a paid pass is spent` е Codex-специфично там).

**Ревю:** fact-check ×2 (проза на диффа; корекционна делта + кръстосана консистентност) — 1
находка (етикети „seventh op" за шестия op в test-update; поправена в микро-рунд, suite 448/0
преди паса). Codex `gpt-5.6-sol`/high, `Class: code`: pass 1 `fail` с 3 блокера (readiness
текстът можеше да гейтне трети КОНФИГУРИРАН пас; квалификаторът „above the scan tier" липсваше
на 4 прозаични места — COO арбитраж: прозата се квалифицира, pin-натият `--show` формат остава;
региона тестът минаваше по „already current", не по реалния consumer път) → корекционен рунд 1
(cap 2), трите поправени: цикъл формулировка, четирите сайта квалифицирани +
`DOCTRINE_FACTCHECK_SITES`, aged-region fixture със съдържателен/хеш assertion → pass 2 **`pass`**,
нула находки. (Първият опит за pass 2 беше убит външно без вердикт — ре-диспач с операторска
дума.)

**Верификация (Колегата, точни кодове):** VERIFY 8/8 exit 0 — `test-update.mjs` 451 checks /
selfcheck 848 assertions на self-install-а / `test-setup.mjs` 311 / example cycle 2×44 / spikes
99 / `validate-payload` „4 migration(s)" / `claude plugin validate .` ✔ / `aiwf-update --check`
„up to date … 0.2.0"; §5 sweep → празен (exit 1); `git grep -L "review.plan.passes"` (7 файла) и
`-L "Three countable tripwires"` (3 файла) → празни; op count `!= 7` → exit 0 с контрол;
Cyrillic grep → празен. Останал дълг: няма. Бележка (не дълг): два коментара/етикета в
`aiwf-selfcheck.js` от AUD-001 казват „seven skills" при 8 записа в `DOCTRINE_READING_SKILLS` —
едноредова R1 корекция при удобен commit.

## PUB-001 [R2 code-class] — public install път

`README.md:20` → „**v0.2.0. The first public release.**"; § Install `:90-109` — първи път
`/plugin marketplace add divels-studio/promptandpray` + `/plugin install pnp@promptandpray`
(update: `/plugin marketplace update`, `/plugin update pnp@promptandpray`, **`/reload-plugins`**,
`/pnp:update`), втори път локален checkout (`:94-104` остава). **Редът с reload-а е задължителен
и в трите файла:** сесията продължава да ползва версията, заредена при стартиране — обновяването
слиза на диска, а install/update summary-то казва „Run `/reload-plugins` to activate" (официална
документация, `discover-plugins` § auto-updates; `/reload-plugins` предупреждава и се пропуска,
ако би обезсилило prompt кеша — тогава `--force`, или нова сесия). Проверка коя версия е активна:
`/plugin list`. § Status `:67-80`: bullet „published plugin" пада (влиза в
„what is here": public GitHub marketplace + install/update път + `/pnp:roles`); bullet 3 се
пренаписва така, че да е вярно И преди, И след PUB-003 (нищо за 0.2.0, което още не е станало):
„**One consumer installation so far.** It has taken every release from 0.1.0 to 0.1.2 through
`/plugin update` + `/pnp:update` - the first bump asked two take-new questions, 0.1.2 asked none -
and there is no second consumer yet."; POSIX
bullet дословно; `:76-80` невярното изречение пада. `docs/README.md:17-20`, `dev/README.md:52-61`
— GitHub път първи, локален като алтернатива (`:72-74` остава). `plugin.json`: `repository` +
`homepage` = `https://github.com/divels-studio/promptandpray`; `marketplace.json:6` без „local".
Selfcheck прозата „local marketplace" (`aiwf-selfcheck.js:1058-1063,1112-1113,3950-3952`) →
„its own marketplace (local checkout or GitHub)"; assertion-ите не се променят. CHANGELOG 0.2.0
§ Added „**Public install path (PUB-001)**"; link ref `[0.2.0]:
https://github.com/divels-studio/promptandpray/releases/tag/v0.2.0` над `:220`.
**Review:** `Class: code` (plugin.json е payload) → Codex; fact-check преди това.
**Acceptance (буквално):**
- `git grep -nE "not published|Pre-release|private" -- README.md` → празно (exit 1).
- `git grep -L "plugin marketplace add divels-studio/promptandpray" -- README.md docs/README.md dev/README.md`
  → празно (всеки от трите го носи).
- `git grep -n '"repository": "https://github.com/divels-studio/promptandpray"' -- .claude-plugin/plugin.json`
  → 1 hit; същото за `"homepage"`.
- `git grep -n "local marketplace" -- .claude-plugin/marketplace.json scripts/selfcheck/aiwf-selfcheck.js`
  → празно.
- `claude plugin validate .` → exit 0; VERIFY 8/8. Commit: `0.2.0: first public release (PUB-001)`.

### PUB-001 — Completion record (2026-09-03)

**Commit `bf11755ef6543dac3f4f20f1709357223184d043`** върху котвата `f3918ff` (branch `main`,
локален, непушнат): 7 файла, 71+/26− (`git show --stat bf11755`); PLAN файлът извън commit-а.
Изпълнено по обхвата: README § Status „v0.2.0. The first public release." + fold на published
bullet-а + дословният one-consumer текст + POSIX bullet-ът; § Install — GitHub marketplace първи
(`/plugin marketplace add divels-studio/promptandpray`) със задължителния `/reload-plugins` ред,
локалният checkout втори; `docs/README.md` и `dev/README.md` подравнени; `plugin.json` +
`repository`/`homepage`; `marketplace.json` без „local"; трите прозаични selfcheck сайта →
„its own marketplace (local checkout or GitHub)"; CHANGELOG § Added запис + `[0.2.0]` link ref.

**Отклонения (приети):** § Install финалният абзац пренаписан (иначе update пътят стоеше два
пъти, единият без `/reload-plugins`); selfcheck наративът пре-wrap-нат 4→5 реда; „end with" →
„say" за reload съобщението (по-слабата, доказуема претенция); „what is here" fold-ът е един
bullet.

**Ревю:** fact-check (проза + кръстосана README консистентност + числата срещу архиви 002/003)
— 0 находки. Codex `gpt-5.6-sol`/high, `Class: code`: вердикт `fail` с ЕДИН блокер — VERIFY
суитите не тръгват в собствената read-only клетка на Одитора (`mkdtemp` EPERM); всичко останало
чисто, една note-only бележка (section header коментар извън спецификацията). **COO арбитраж:**
блокерът е артефакт на средата на ревюиращия, не на repo-то — доктрината „Verifying failure
claims" покрива точно този случай; неговото „exact next action" (пълен VERIFY в записваема среда
с точни кодове) изпълнено ДВУКРАТНО: рънът на Колегата и независим COO-диспачнат рън
(general-purpose/sonnet) — двата 8/8 exit 0 + Cyrillic grep празен (setup 311 / update 451 /
example 2×44 / selfcheck 848/848 / spikes 99 / validate-payload „4 migration(s)" / plugin
validate ✔). Нулева делта по диффа след паса → втори платен пас не се дължи по правилото
„second pass above the scan tier only when the correction round touched code". Route затворен по
същество; кликът на commit-а остана операторският гейт.

**Acceptance (Колегата, точни кодове):** петте `git grep` проверки по плана → точните
празно/1-hit резултати (exit 1/0 съответно); `claude plugin validate .` → exit 0. Останал дълг:
няма. Отбелязана експозиция (по дизайн на плана): public/tag претенциите в README/CHANGELOG
стават верни с PUB-002 стъпки 1–3.

## PUB-002 [оператор, извън repo-то] — repo public, tag, push
1. GitHub → Settings → Change visibility → Public (клик). Проверка (read-only, от тази сесия):
   `gh repo view divels-studio/promptandpray --json visibility --jq .visibility` → `PUBLIC`
   (`gh` 2.83.2 е на машината; `PRIVATE` = блокер, не се продължава).
2. `git tag v0.2.0 <PUB-001 hash>` — дума.
3. `git push origin main` + `git push origin v0.2.0` — дума + диалог. Проверка: `git ls-remote
   --tags origin v0.2.0` → `<hash>	refs/tags/v0.2.0`; `git rev-list --left-right --count
   origin/main...main` → `0	0`.

### PUB-002 — Completion record (2026-09-03)

Трите стъпки, всяка със собствена операторска дума: (1) visibility → **Public** (операторски клик
в GitHub; първата проверка върна PRIVATE — несъхранена смяна, повторена; потвърдено с
`gh api repos/divels-studio/promptandpray` → `"visibility":"public"`); (2) `git tag v0.2.0
bf11755ef6543dac3f4f20f1709357223184d043` — дума, проверено с `git tag --points-at bf11755`;
(3) `git push origin main` (b424e11..bf11755, 4 commit-а: AUD-001, AUD-002, планът, PUB-001) +
`git push origin v0.2.0` — дума + диалози. Проверки по плана: `git ls-remote --tags origin
v0.2.0` → `bf11755… refs/tags/v0.2.0`; `git rev-list --left-right --count origin/main...main` →
`0	0`. Останал дълг: няма.

## PUB-003 [consumer proof, Furnissimo сесия] — GitHub marketplace update до 0.2.0
Там, в този ред: preflight `git status --short` чист на работния клон; `/plugin marketplace remove
promptandpray` → `/plugin marketplace add divels-studio/promptandpray` → `/plugin install
pnp@promptandpray` (project scope) → **`/reload-plugins`** (или нова сесия — сесията иначе остава
на кеширания 0.1.2; `--force`, ако предупреди за prompt кеша) → `/plugin list` показва `pnp 0.2.0`
→ `/pnp:update` (dry-run: 3 add-config-key без въпрос, 2 тихи
rerender-а, `reviewer.md` „not on this installation", note за overrides документа; apply: **0
диалога**, selfcheck PASS) → операторът редактира реда „two passes" в своя `PROJECT_OVERRIDES.md`
§ Loop shape (R1 там, по бележката) → `/pnp:roles` → таблицата (Codex, 2/1/1). Очаквани променени
файлове: `.claude/aiwf-native/aiwf.config.json`, `.claude/aiwf-native/roles.json`, `CLAUDE.md`,
overrides документът, `CHANGES_0.1.2-to-0.2.0.md` (задържан или изтрит по операторски избор —
`/pnp:update` не комитва, `aiwf-update.mjs:203-205`). Assertions там: `aiwf-update --check` → „up
to date … 0.2.0"; `node scripts/setup/aiwf-roles.mjs --show` (през plugin root-а) → таблицата.
**Commit там — клик**; hash-ът се записва в completion record-а ТУК (заедно с брой диалози,
selfcheck резултат, таблицата).

### PUB-003 — Completion record (2026-09-03)

**Furnissimo, през GitHub marketplace, commit там `2de3ddc8`** (клик на оператора; relay от
операторския канал). Пътят: `/plugin marketplace remove promptandpray` → `add
divels-studio/promptandpray` → `/plugin install pnp@promptandpray` → `/reload-plugins` →
`/plugin list` показа `pnp v0.2.0` → `/pnp:update`: 0.1.2 → 0.2.0, миграция `0004_audit-table`,
7 операции, ЕДИН реален write (`CLAUDE.md#aiwf-core`, тих) — dry-run 0 конфликта → apply без
диалог по конструкция (диалог се вдига само на конфликт). Note-ът изпълнен: „Loop shape" редът в
техния `PROJECT_OVERRIDES.md` вече сочи `review.plan.passes` (операторска R1 редакция там).
Дървото там чисто. **Първият пълен цикъл install → loop → update от публичния канал е доказан —
продуктовата цел на 0.2.0.**

Наблюдавани consumer особености (записани, не дефекти): заварен дрейф — техен commit `cdcfe817`
ръчно вдигнал версията без миграционен запис; тяхната сесия върна печата на 0.1.2 и ъпдейтът
мина канално (engine-ът издържа дрейфа). Selfcheck там 847/851 — 4-те FAIL са environmental
(`.in_use` cache маркер; фиксът е в обхвата на POSIX-002). Инсталацията е user scope (планът
предвиждаше project scope) — операторски избор там. `/pnp:roles` таблицата не беше предадена в
relay-а — не се записва като измерена; `roles.json` потвърден актуален при dry-run-а. Останал
дълг: няма.

## POSIX-001 [R2 code-class] — зелени POSIX CI leg-ове (родени с операторска дума 2026-09-03)

Контекст: кандидатът „POSIX CI leg-овете са червени от раждането си" (виж Кандидати — пълната
диагноза там) стана тикет с думата „тикет сега, след него честен бъмп към 0.2.1".

**Обхват (котвите са от harvest scan 2026-09-03):**
1. `scripts/native/sh/codex-qal.sh:75-80` — SC2317 върху trap-only cleanup (`trap cleanup_scratch
   EXIT` на `:80`; статичният анализ не вижда trap извикването): targeted
   `# shellcheck disable=SC2317` с еднореден коментар-причина, нищо друго в файла; LF-only,
   ASCII-only, flag-locks непроменени (selfcheck ги pin-ва byte-level).
2. `.github/workflows/ci.yml`: `:7-9` остарелият коментар („never executed") пренаписан честно
   (изпълнявали са се — 11 рънa, червени от матрицата, P6a `dc4f3ec`); shellcheck стъпката
   `:74-75` остава bare по дизайн (строгостта е желана — директивата е решението);
   `actions/checkout@v4`/`setup-node@v4` (`:21-25` и огледалата) → нов major само ако drop-in
   (иначе бележка, не промяна).
3. `test-setup.mjs:1230-1234` — ТЕСТОВИ бъг: очакваният стринг е суров `${dir}` (forward slashes
   на POSIX host) + literal `\docs\ai\…`, а продуктът по ДИЗАЙН дава изцяло backslash път за
   windows канал (`nativePath`, `generate.mjs:377-382`: каналът решава сепаратора, не хост
   машината). Фикс в теста: очакваният префикс = `dir` със сепаратори по `config.os`.
4. Клъстер a/b/c (`test-setup.mjs:663-674`): на macOS install с премахнат selfcheck скрипт излиза
   0 вместо 1 (в теста няма platform branch; стринговете идват от `run-selfcheck.mjs:80-99`).
   Диагноза ОТ ИЗТОЧНИКА (install() на теста, setup CLI, `finishWithSelfCheck` потокът) — намери
   причината и поправи продукта ИЛИ теста според това кое е вярното, с causal обяснение в
   handback-а.
5. e) round-trip selfcheck (`test-setup.mjs:1348-1350`) с nested „sabotage detected
   [example-answers-valid] … still PASS" (`aiwf-selfcheck.js:4204-4217`, контрол `:4507-4508`;
   схемата има os enum и validate-config знае enum — механизмът на macOS не е виден в кода):
   диагноза от източника, същото изискване.
**Хонест лимит (записан, не заобиколен):** на тази машина няма POSIX среда (WSL само
docker-desktop без rootfs; shellcheck липсва) — локално се доказва каквото е изразимо
(Windows VERIFY 8/8, node --check, статични проверки, платформено-неутрални unit очаквания);
POSIX доказателството е CI при push-а на 0.2.1 (POSIX-002). Ако CI остане червен там —
корекционно кръгче с нова дума.
**Извън обхват:** миграция/bump/CHANGELOG (POSIX-002); всичко друго по payload-а.
**Acceptance:** VERIFY 8/8 exit 0 (Windows); Cyrillic grep празен;
`git grep -c "shellcheck disable=SC2317" -- scripts/native/sh/codex-qal.sh` → 1;
`git grep -n "never executed" -- .github/workflows/ci.yml` → празно (exit 1); тест 3) очакването
конструирано през separator-по-config.os (покажи реда); за 4) и 5) — causal обяснение + локално
изразим тест където е възможно.
**Risk threshold:** блокира промяна на поведение на wrapper (byte-level flag locks), отслабване
на асершън без причинна обосновка, всеки VERIFY ≠ 0.
**Stop condition:** VERIFY + acceptance зелени → стоп.
**Review:** `Class: code` → Codex, fact-check преди. Cap 2. **Assignee:** Колега. Branch `main`.

### POSIX-001 — Completion record (2026-09-03)

**Commit `00ede2dbaca7d953ddd3e265770450180f250a23`** върху котвата `bf11755` (branch `main`,
локален, непушнат): 10 файла, 182+/27−; PLAN файлът извън commit-а. **Коренна находка,
надграждаща диагнозата на тикета:** 9 от 10-те macOS падания са ЕДИН дефект — `isMain()` в
шестте CLI entrypoint-а сравняваше суров `argv[1]` с realpath-натия entry (Node резолвва entry-то
до реален път преди зареждане); macOS temp е зад symlink (`/var` → `/private/var`) → всеки
entrypoint, spawn-нат от payload копие под temp, решаваше „не съм main", не правеше нищо и
излизаше 0 (фалшиво зелено в sabotage контроли, фалшив exit 0 в install тестове). Възпроизведен
на Windows през junction ПРЕДИ фикса; поправен с идентичен realpath guard в шестте файла.
Десетото падане: тестово очакване със separator на хоста → построено през separator-а на канала
(без import на nativePath — очакване от тествания helper не може да пада). Останало: shellcheck
директива за ДВАТА кода (SC2317 стар shellcheck / SC2329 при 0.11.0 — двете поколения дават
различен код за същия trap false positive; надгражда SC2317-only диагнозата в секцията на
тикета, доказано с live рънове: CI лог + WSL 0.11.0 контрол `git show HEAD` → exit 1), честен
ci.yml header + `@v5` pins (v6/v7 отказани мотивирано — credential persistence / fork-PR
checkout, сверено с release notes), тест секция 23 (control-first junction доказателство),
selfcheck ENTRYPOINT IDENTITY assertion + constructed-input контрол, и micro-addendum: „seven
skills" етикетите станаха count-neutral (бележката от AUD-002 record-а — затворена тук).

**Ревю:** fact-check — 2 „unverifiable", двете арбитрирани от COO с доказателства (SC2329 =
собствените WSL рънове; v6/v7 = release notes през gh api). Codex `gpt-5.6-sol`/high,
`Class: code`: pass 1 **`pass`, нула находки** (гардът non-widening, junction cleanup-ът
безопасен, контролите работещи).

**Верификация:** Windows VERIFY 8/8 exit 0 (test-setup **316**/0 — +5 от секция 23; selfcheck
**850**/850; останалите непроменени); WSL Ubuntu CI-еквивалент (Node 22.23.2, ShellCheck 0.11.0,
pwsh 7.6.5): shellcheck exit 0 на финалното дърво + exit 1 (SC2329) на HEAD версията като
контрол, test-setup exit 0, selfcheck `--plugin-root .` exit 0; пълният ubuntu baseline на
чистия `bf11755` преди фиксовете: всички останали стъпки зелени (test-update 451/0, spikes 99/0,
example-cycle-linux 44/0, selfcheck 851/851). **Остатък, приет и записан: macOS се доказва само
от CI при push-а на 0.2.1** (тук няма macOS хост). Останал дълг: няма.

## POSIX-002 [R2 code-class] — честен bump 0.2.1

СЛЕД POSIX-001 (същата операторска дума покрива диспача след затварянето му):
`migrations/0005_posix-legs/` с един `note` op (какво е поправено и че POSIX доказателството е
CI; validate-payload иска последен запис == версия — `validate-payload.mjs:251-259`) +
`migrations/index.json` 5-и запис 0.2.1; `plugin.json` 0.2.1; CHANGELOG `## [0.2.1]` блок
(§ Fixed, честно: „the POSIX CI legs were red since the matrix existed; first looked at after the
0.2.0 release push") + link ref; fixture rename `0005_example-bump` → `0006_example-bump`
(сайтове: директорията, `bump/bump.json:2`, `ops.json:2`, `NOTES.md:1,16,30` — `:30` пренаписан
само с новото id, `examples/example-project/README.md:17,45,78,79`); self-install `--apply`
(очаквано 1 note, 0 диалога) + `CHANGES_0.2.0-to-0.2.1.md`; VERIFY 8/8; commit клик
(`0.2.1: green POSIX legs (POSIX-001/002)`).
**Разширение (операторска директива zero-debt, 2026-09-03):** provenance сканът на selfcheck-а
игнорира харнес cache метаданни (`.in_use` и подобни plugin-cache маркер файлове) по име/шаблон,
с негативен контрол — източник: Furnissimo PUB-003, selfcheck там 847/851 с 4 environmental FAIL
от `.in_use/6600` маркера, който Claude Code държи в plugin cache директорията при marketplace
инсталация. Вози се в 0.2.1 вместо да стои кандидат; CHANGELOG § Fixed добавя ред за него.
После: `git tag v0.2.1` — дума; push main + tag —
дума + диалог; **CI зелен на трите leg-а = acceptance-ът на цялата POSIX работа**; червен CI →
ново кръгче по дума. **Review:** `Class: code` → Codex, fact-check преди.

### POSIX-002 — Completion record (2026-09-03)

**Commit `7388e3d96be55d7af877e5c76b76cd6d8cc8acf6`** върху котвата `00ede2d` (branch `main`,
локален, непушнат): 13 файла, 194+/23−. Изпълнено: миграция `0005_posix-legs` (един note op;
code-only release с манифестен запис заради правилото last==version), `plugin.json` 0.2.1,
CHANGELOG `[0.2.1]` блок + link ref, fixture → `0006_example-bump` (всички сайтове), README
статус ред → „v0.2.1. Public since 0.2.0." + event-bound изречението направено вечно-вярно,
self-install apply (стампове 0.2.1/`0005_posix-legs`, 1 note, 0 диалога), и **разширението
zero-debt**: provenance сканът скипва харнес cache маркерите — ДВЕ точни имена root-only
(`.in_use`/, `.orphaned_at`; формите измерени от реалния cache), с контроли в двете посоки.
Selfcheck 850 → 855.

**Ревю:** fact-check — 3 находки (свършен-факт „green" в CHANGELOG и note-а; остаряло абсолютно
число в коментар), поправени в микро-рунд (числото — премахнато, не подменено). Codex
`gpt-5.6-sol`/high, `Class: code`: pass 1 `fail` с ЕДИН блокер — apply-time snapshot-ът
`CHANGES_0.2.0-to-0.2.1.md:10` носеше старото „are green"; синхронизиран дословно с ops.json
(механично доказано byte-identical). Делтата на корекцията — само проза → по правилото на loop-а
втори пас над scan tier не се дължи: затворено с fact-check над делтата (0 находки) + първолична
COO проверка — двете записани тук. COO отклонение при commit: съобщението от плана („green POSIX
legs") → `0.2.1: fix the POSIX CI legs` — без преждевременна претенция.

**Верификация (точни кодове):** VERIFY 8/8 exit 0 (selfcheck 855/855 след apply; test-setup
316/0; test-update 451/0; example cycles 2×44/0; spikes 99/0; validate-payload „5 migration(s)";
plugin validate ✔); `aiwf-update --check` 1 преди apply → 0 „up to date … 0.2.1" след; двата
acceptance grep-а (старото fixture id; Cyrillic) празни, exit 1.

**Инцидент по време на тикета (записан; не дефект на тикета):** външна за loop-а команда
(fact-check scan агент) поиска `git reset` — операторът отказа с No; съпътстваща команда все пак
частично разглоби индекса (rename стейджингът) и обърна line endings на 4 файла
(съдържателно byte-equal, доказано с `git diff --ignore-cr-at-eol`); възстановено адитивно при
commit стейджинга, без нито една reset/restore/checkout команда. Поуката е в CANDIDATES.md
(разширението „сляп диалог"); от 2026-09-03 всеки scan/review бриф носи изрична забрана за
mutating git. Останал дълг: няма.

**CI резултат (run 33748731374, push-ът на 0.2.1, дописано 2026-09-03):** **ubuntu ЗЕЛЕН — за
пръв път от раждането на матрицата**; windows зелен; **macOS червен** с нов/различен клас
(symlink коренът е потвърдено отстранен на Linux). По предвиденото в тикета „червен CI → ново
кръгче по дума" — кръгчето е открито с операторската дума „продължи с работата по плана"
(2026-09-03); диагнозата и тикетът следват като POSIX-003.

## POSIX-003 [R2 code-class] — последното macOS падане: контролът на секция 23 (роден 2026-09-03, кръгчето е открито с думата „продължи с работата по плана")

Диагноза (CI run 33748731374, единственият FAIL от 316): секция 23 на `test-setup.mjs` пада на
собствения си КОНТРОЛ — „the naive guard DOES run as main directly" — защото на macOS
`os.tmpdir()` сам е зад `/var → /private/var` symlink: и „директното" извикване е през линк,
naive guard-ът не печата MAIN без изобщо тестът да е създал junction. Production проверките на
секцията МИНАВАТ (фиксът на POSIX-001 работи); невярна е само предпоставката на контрола.
Фикс: naive фикстурата (и нейният линк) се базират под `fs.realpathSync(tmpRoot)` — тогава
директният случай е реален път на всяка платформа, а explicit link случаят пак демонстрира
дефекта. Един файл, тестова промяна; никакъв production код. Без bump — фиксът се вози в
следващия release (0.2.2 с GATE-001); дотогава 0.2.1 consumer, пуснал suite-а на macOS, би
видял същия контролен FAIL (записано, прието). Acceptance: VERIFY 8/8 на Windows; WSL Linux
test-setup exit 0; след commit + push (дума) — macOS leg зелен = мисийният acceptance затворен.
**Review:** `Class: code` → Codex, fact-check преди. Cap 2. **Assignee:** Колега. Branch `main`.

### POSIX-003 — Completion record (2026-09-03)

**Commit `4f6de69`** върху `7388e3d` (branch `main`, локален, непушнат): 1 файл, 12+/4−, само
секция 23 на `test-setup.mjs` — link фикстурите (`linked`, `naiveDir`, `naiveLink`) базирани на
`fs.realpathSync(tmpRoot)`, коментарите отразяват точно това („Every link fixture"; `p23`/`badCfg`
остават на `tmpRoot` по замисъл). Никакъв production код; check count 316 непроменен; без bump —
вози се в следващия release.

**Доказателства:** локалната macOS симулация (WSL, `TMPDIR` зад symlink — точната macOS форма):
пре-фикс файлът възпроизвежда CI падането байт-идентично (316/1, същият FAIL ред), фикснатото
дърво — 316/0 exit 0, с контрола MAIN и via-link случая все така падащ naive guard-а; Windows
VERIFY 8/8 exit 0; пост-commit ре-верификация на комитнатите байтове (test-setup 316/0, selfcheck
855/855). **Ревю:** fact-check над делтата — 0 находки (4 претенции сверени); Codex
`gpt-5.6-sol`/high `pass-with-notes`, 0 блокера, 1 P3 бележка (коментар) — взета преди commit-а.
**Остатък:** родният macOS CI leg — доказва се с push на тестов клон (следващата операторска
дума); при зелено — mission acceptance-ът на POSIX работата е затворен, main се пушва след това.
Останал дълг: няма.

## GATE-001 [R2 code-class] — hook срещу заобиколени и слепи git диалози (роден 2026-09-03)

Двете лица на един механизъм (операторска директива: решава се ТУК, не стои кандидат): нов
PreToolUse hook по **Bash** tool-а — **Gate 4**, `scripts/engine/pretooluse-git-verb-guard.js`.
Диспачнат с операторска дума 2026-09-09.

**Context (discovery 2026-09-09, 4× Explore/sonnet; всяка котва проверена):**
- `hooks/hooks.json:1-26` носи точно два PreToolUse записа: `Edit|Write|MultiEdit|NotebookEdit`
  → `pretooluse-mutation-guard.js` (Gate 1 + Gate 3) и `Agent` → `pretooluse-dispatch-gate.js`
  (Gate 2). Няма `Bash` matcher, и **нищо в repo-то днес не чете Bash команден стринг** (широк
  scan: нула попадения).
- `scripts/engine/aiwf-lib.js:84-86` експортва `readStdin :41-49`, `parseInput :52-55`,
  `denyPreTool :58-63`, `askPreTool :66-71`, `allowPassthrough :72`, `runFailClosed :75-77`,
  `runFailAsk :80-82`. Няма project-root резолюция, няма четене на конфиг — всеки hook си носи
  собствен `projectDirOf()` (`pretooluse-mutation-guard.js:81-84`,
  `pretooluse-dispatch-gate.js:68-71`).
- Идентичността се чете по **own-property presence**, не по truthiness:
  `pretooluse-mutation-guard.js:62` (`has()`), `:224-225`, `:228` (`agent_type === 'writer'` →
  allow), `:231` (нито едно поле → истинска main session), `:233-241` (всяко друго присъствие,
  вкл. explicit `null` и грешен case → deny).
- Ask-класът git глаголи е в `templates/settings.ask-ruleset.json:13-27,58-66`: `commit reset
  clean rm checkout switch restore revert pull fetch cherry-pick stash config remote -c`, плюс
  `push merge rebase` в три форми (bare, `git.exe`, `git -C <projectRoot>`). Скицата от
  2026-09-03 изброяваше 12 глагола — **ruleset-ът носи 15**.
- Prefix match: `cd X && git commit …` не започва с `git`, значи днес **не вдига диалог изобщо**.
  Хигиенното правило „bare git от root-а" (`CLAUDE.md:82-86`, `.claude/agents/writer.md:40-46`)
  е процедурната лепенка върху същата дупка.

**Решения (COO, 2026-09-09):**
1. **Gate 4 е разпознавател, не shell парсър.** Търси `git`/`git.exe` (с незадължителни глобални
   `-C <път>` / `-c <k=v>`) следван от ask-класов глагол, **където и да стои** в стринга. НЕ
   разбира кавички, escape-и, subshell-и, alias-и, env-indirection. Гаранцията е идентичностната
   проверка, не парсването — това се пише дословно в header-а на файла.
2. **Списъкът на глаголите се сверява с ruleset-а програмно.** Hook-ът носи именована константа;
   selfcheck assertion парсва `templates/settings.ask-ruleset.json` и иска всеки git глагол оттам
   да е покрит, с flipping контрол (добавен глагол в копие на ruleset-а → FAIL). Двата списъка не
   могат да се разминат мълчаливо.
3. **Клоните по идентичност** — огледало на Gate 1 семантиката, същият `has()` подход:
   `agent_type` присъства и не е `writer` (вкл. само `agent_id`, explicit `null`, грешен case) →
   **DENY** с текст, който казва кой глагол е разпознат и защо фонов агент не получава диалог;
   `agent_type === 'writer'` ИЛИ нито едно идентичностно поле → т.4.
4. **Двете лица, без нов диалог по нормалния път** (операторски избор 2026-09-09).
   **ПРЕРАБОТЕНО 2026-09-10 — първата формулировка почиваше на невярна предпоставка и е записана
   тук, за да не се роди пак.** Първоначално казваше: за main session/Writer — passthrough, ако
   командата ЗАПОЧВА с гейтната форма (`git <verb>`, `git.exe <verb>`, `git -C <path> <verb>`);
   ask, ако глаголът е разпознат, но не в началото (compound). Две грешки в това:
   - **Compound формите не са дупка.** Документацията на Claude Code описва matcher-а като
     operator-aware: разлага командата по `&&`, `||`, `;`, `|`, `|&`, `&` и нови редове и мачва
     правилата срещу ВСЯКА подкоманда независимо, а deny/ask важат при съвпадение на която и да е
     подкоманда. Значи `cd X && git commit -m y` **вече вдига диалог днес**. Инцидентът UIS-009,
     който роди „заобиколеното" лице на тикета, или предхожда това поведение, или е бил
     диагностициран грешно. Проверено срещу документацията, не прието от ревюто наготово.
   - **Изброяването на гейтнатите форми беше грешно.** Ruleset-ът е асиметричен
     (`templates/settings.ask-ruleset.json:13-27,58-66`): bare `git <verb>` правилата покриват
     всички ask-класови глаголи, а `git.exe <verb>` и `git -C <projectRoot> <verb>` съществуват
     САМО за `push|merge|rebase`. Обявяването на `git.exe reset` и `git -C <path> reset` за
     „вече гейтнати" беше тих байпас, вкаран от мен в брифа.

   **Действащият модел:** посоката по подразбиране е обърната — passthrough само когато ВСЯКА
   подкоманда, носеща разпознат ask-класов глагол, съвпада байт по байт с форма, която payload-ът
   наистина шипва (`git <verb>`; `git.exe push|merge|rebase`). Всичко друго с разпознат глагол →
   **ask**. Разлагането е quote-aware (разделител в кавички е текст), обелват се само
   документираните обвивки (`timeout time nice nohup stdbuf command builtin noglob`, `xargs` само
   без флагове, плюс водещи `NAME=value`), а `git -C <path>` не се моделира като гейтнат за нито
   един глагол — hook-ът не чете project root и питането е безплатно, защото hook-ask и rule-ask
   дават ЕДИН диалог, не два. Остатъкът `git -C <друго repo> push` отпадна заедно с това.
   Празният случай е ask, не passthrough. Разпознаването свежда токена до най-дългия префикс от
   `[A-Za-z-]` — whitelist на това, от което глагол може да е съставен, а не blacklist на
   shell-а, защото blacklist-ът два пъти се оказа непълен (`;` първия път, обратен апостроф
   втория).
5. **Fail direction: DENY** (`runFailClosed`), както Gate 1/3 — с **изрично записан риск**: този
   hook стои на matcher `Bash`, т.е. на ВСЯКА команда, докато Gate 1 стои на четири mutation
   tool-а. Крах в hook-а спира целия shell на сесията. Затова header-ът го казва, а spike-овете
   носят явни случаи „обикновена не-git команда → allow(passthrough)" и „malformed/празен stdin
   → deny".
6. **Помирение на противоречието в payload-а (в същия дифф).** `docs/LOOP.md:162-165` днес
   твърди „A second-layer shell hook is deliberately NOT attempted", а `aiwf-lib.js:23-31` — че
   такъв е бил пробван и махнат в N4-R. Gate 4 е по-тесен от махнатия: deny по идентичност +
   разпознаване, не емулация на shell семантика за всички. Двата текста се пренаписват да
   описват точно това. Записът за N4-R НЕ се трие.
7. **Миграцията е note-only** (`0006_git-verb-gate`, по образеца на `0005_posix-legs`): Gate 4 е
   payload код, доставя се с `/plugin update`, не пипа нищо в проекта — нула config ключове,
   нула региона, нула ask правила. Bump 0.2.2.
8. **Fixture rename, форсиран от манифеста:** реалната `0006_git-verb-gate` се сблъсква с
   `0006_example-bump` (`run-example-cycle.mjs:500-504` append-ва fixture-а към реалния манифест;
   `validate-payload.mjs:229-232` иска префикс == позиция) → fixture-ът става `0007_example-bump`.
9. **POSIX-003 се вози тук** — фиксът на секция 23 е комитнат (`4f6de69`); 0.2.2 е неговият release.

**Обхват** (всички `file:line` в Context и тук са закотвени към `22965bad062a9f6e013a6edb314027a9056ace4f`
— котвата при диспача. Имплементацията премести редовете в `aiwf-selfcheck.js` и в самия hook;
показалците са верни срещу котвата, не срещу HEAD):
1. `scripts/engine/pretooluse-git-verb-guard.js` — нов hook по т.1-5; преизползва `aiwf-lib.js`
   (`readStdin`/`parseInput`/`denyPreTool`/`askPreTool`/`allowPassthrough`/`runFailClosed`),
   собствен `projectDirOf()` по образеца на другите два; header по образеца на
   `pretooluse-mutation-guard.js:1-55` с честния лимит от т.1 и риска от т.5.
2. `hooks/hooks.json` — трети PreToolUse запис, matcher `Bash`, команда
   `node "${CLAUDE_PLUGIN_ROOT}/scripts/engine/pretooluse-git-verb-guard.js"`; `description` полето
   се дописва за трите гейта.
3. Броячите на hook-ове (всичките, от discovery): `README.md:10`, `dev/PROJECT_OVERRIDES.md:36-37`,
   `docs/WORKFLOW.md:679-681` („two hook files, three responsibilities"), `docs/LOOP.md:135-136`
   („the wired-hook count stays two"), `pretooluse-mutation-guard.js:3` („TWO responsibilities"),
   `aiwf-lib.js:5` („TWO small hooks"). `docs/LOOP.md` и `docs/WORKFLOW.md` получават Gate 4 в
   § Enforcement / § Commit gate; `docs/OPERATOR_PROTOCOL.md:59-61` — какво вижда операторът.
4. Помирението по т.6: `docs/LOOP.md:162-165` и `aiwf-lib.js:23-31`.
5. Spikes (`scripts/spike/run-spikes.mjs`): нова константа до `:39-40`, нов cases масив след
   `:291`, нов цикъл по образеца на `:342-382` преди tally-то `:401-409`. Матрица (изчерпателно):
   bare `git commit` от main → passthrough; `cd X && git commit` от main → ask; `git -C <path>
   push` от main → passthrough; `cd X && git commit` от `agent_type: writer` → ask; bare
   `git reset` от `agent_type: general-purpose` → deny; `cd X && git reset` от
   `agent_type: Explore` → deny; само `agent_id`, без `agent_type` → deny; `agent_type: 'Writer'`
   (грешен case) → deny; `git log`/`git status`/`git show` от всяка идентичност → passthrough;
   `node --version` → passthrough; празен stdin → deny; `'[]'` и `'"text"'` → deny.
6. Selfcheck (`scripts/selfcheck/aiwf-selfcheck.js`): нова `sectionGate4(tmpRoot)` след
   `sectionGate2Mode` в списъка `:4976-4995`; константа до `GATE1`/`GATE2` `:348-349`;
   `sectionHookWiring` `:1052-1076` — `scriptCount === 3` (`:1061`), `${CLAUDE_PLUGIN_ROOT}`
   count `=== 3` (`:1063`), третият файл в `:1075`, matcher-ът `Bash` пин-нат като `:1073-1074`;
   assertion-ът от т.2 (hook константа ⊇ ruleset глаголи) с flipping контрол; поне по един
   flipping контрол за deny клона, за ask клона и за passthrough клона; COVERAGE наративът
   `:5002-5084` получава изречение за Gate 4 по образеца на `:5003-5013`.
7. Release: `migrations/0006_git-verb-gate/{ops.json,NOTES.md}` (един `note` op, `docRefs:
   ["CHANGELOG.md"]`, по образеца на `0005_posix-legs`); `migrations/index.json` 6-и запис 0.2.2;
   `.claude-plugin/plugin.json:3` → 0.2.2; CHANGELOG блок `## [0.2.2] - <дата>` (§ Added: Gate 4;
   § Fixed: секция 23 контролът от POSIX-003) + link ref; fixture → `0007_example-bump` (сайтове:
   `examples/example-project/README.md:17,45,78,79`, `bump/0006_example-bump/NOTES.md:1,16,31`,
   `.../ops.json:2`, `bump/bump.json:2`).
8. Self-install: `--check` → 1 (pending 0006), `--dry-run` → 0, `--apply` → 0 диалога, стампове
   0.2.2 / `0006_git-verb-gate`, `CHANGES_0.2.1-to-0.2.2.md` в commit-а.

**Извън обхват:** промяна на ask-ruleset-а (Gate 4 не добавя и не маха правило); адversary-proof
покритие на shell семантиката; RENAME-001; всякакво пипане на четирите EOL-мръсни файла отвъд
нужното за т.3/т.6.
**Acceptance (буквално, Windows канал, cwd = repo root):**
- `node scripts/spike/run-spikes.mjs` → exit 0, таблицата носи Gate 4 реда от §5, нула failures.
- `node scripts/selfcheck/aiwf-selfcheck.js --plugin-root . --project-fixture .` → exit 0.
- `git grep -nE "two hook files|wired-hook count stays two|two PreToolUse hooks|TWO small hooks|TWO responsibilities|deliberately NOT attempted" -- docs skills templates scripts README.md dev/PROJECT_OVERRIDES.md`
  → празно, exit 1.
- `git grep -n "0006_example-bump" -- . ":(exclude)dev" ":(exclude)CHANGELOG.md"` → празно, exit 1.
- `node scripts/update/validate-payload.mjs --plugin-root .` → exit 0, изходът съдържа
  `6 migration(s)`.
- `node scripts/update/aiwf-update.mjs --check --project-root .` → exit 0, „up to date … 0.2.2".
- Осемте VERIFY от `aiwf.config.json` → exit 0; Cyrillic grep по payload пътищата → празно.
**Risk threshold:** блокира всяка промяна на fail-direction на съществуващ гейт; всеки клон, при
който Gate 4 връща `allow` за не-writer subagent с разпознат ask-глагол; всеки нов диалог по bare
формата; всеки VERIFY ≠ 0.
**Stop condition:** VERIFY + acceptance зелени → Одиторът спира.
**Review:** `Class: code` → Codex (`gpt-5.6-sol`/high), fact-check преди. Cap 2.
**Assignee:** Колега. Branch `main`. Котва при диспач: `22965bad062a9f6e013a6edb314027a9056ace4f`.

### GATE-001 — Completion record (2026-09-11)

**Commit `887e29e3aafbf1625eec9f8190e0121c06bc6e5d`** върху котвата `22965ba` (branch `main`,
локален, непушнат): 26 файла, 1488+/87− (`git show --stat 887e29e`; 26, а не 28, защото Git записа
преместването на fixture-а като два rename-а). Едноредово съобщение, нула trailers — проверено с
`git log -1 --format=%b` (празно) и `%(trailers)` (празно). PLAN файлът и четирите EOL-мръсни файла
доказано извън commit-а.

Изпълнено: Gate 4 (`scripts/engine/pretooluse-git-verb-guard.js`) + трети PreToolUse запис на
matcher `Bash`; броячите „два hook файла" → „три файла, четири гейта" по всички сайтове от
discovery; помирението на N4-R противоречието (записът не е трит); spikes и selfcheck секция;
миграция `0006_git-verb-gate` (note-only), 6-и запис в манифеста, `plugin.json` 0.2.2, CHANGELOG
блок с § Known limits, fixture → `0007_example-bump`, self-install apply (стампове
0.2.2/`0006_git-verb-gate`, 0 диалога) + `CHANGES_0.2.1-to-0.2.2.md`. **POSIX-003 се вози тук** —
фиксът на секция 23 (`4f6de69`) излиза с този release.

**Отклонения (приети):** (1) Gate 4 НЕ получи `projectDirOf()` — не му трябва нищо освен
payload-а си, а това е и записаното blast-radius свойство (matcher `Bash` = всяка команда), така
че обхват §1 е противоречен нарочно. (2) Hook-ът изнася константата си и пет чисти функции и
изпълнява гейта само под `require.main === module`, за да може selfcheck-ът да държи реалните
стойности вместо да ги преписва. (3) `sectionGate4()` не взима `tmpRoot` (не му трябва фикстура).
(4) `docRefs` носи два записа (`CHANGELOG.md`, `docs/LOOP.md`), не един. (5) Spike фикстурите
ползват `/work/demo`, не drive-letter път — provenance сканът забранява второто, и го хвана на
живо. (6) README § Status → 0.2.2. (7) `test-update.mjs` `DROPPED_ASK_RULE` премина от
`Bash(git stash:*)` на `Bash(npm run seed:*)`: с двупосочния cross-check изхвърлянето на git
правило от payload копие произвежда истинска находка вместо да тества `reconcile-ask-ruleset` op-а;
фикстурата иска само някакво owned правило. Алтернативата беше отслабване на новия инвариант.

**Ревю (пълна история, защото цената ѝ е поуката):** fact-check ×4 — намери невярно число („28
cases" при 34), overclaim в README („the two cannot drift", докато assertion-ът пази една посока),
твърде тясно описание на ask клона на 6 сайта, непроверим анекдот за друг проект на 8 сайта,
неприписани твърдения за вътрешностите на harness-а на 6 сайта, и два пъти застояли коментари.
Codex `gpt-5.6-sol`/high, `Class: code`: **пас 1 `fail`** (4 блокера: тих байпас в
`startsWithGatedForm`; предпоставката за compound формите; проверката не може да хване байпаса;
проза, обещаваща повече от кода) → корекционен рунд 1 → **пас 2 `fail`** (4 блокера, всичките един
клас: моделът приема форми, които ruleset-ът не носи — таб след глагола, разделители в кавички,
`command -v`, cross-check свит до множество глаголи) → корекционен рунд 2, в който Колегата намери
**пето, само̀** — `recognisedVerb('git reset;')` връщаше null, тоест deny клонът се обезоръжаваше с
точка и запетая → **пас 3 `fail`** (1 блокер: обратният апостроф извън списъка пунктуация, същият
клас трети път) → **корекционен рунд 4 по изрична операторска дума** (cap-ът изчерпан), в който
blacklist-ът на shell знаци беше обърнат в whitelist на това, от което глагол може да е съставен
(`/^[A-Za-z-]*/`) — набор, който не може да пропусне знак, защото не описва shell-а.

**Одиторът беше отказан веднъж, с доказателство и с моето съгласие:** спецификацията ми искаше
`npx foo && git reset --hard` → ask; Колегата показа, че това са две независими подкоманди и
harness-ът гейти git-овата, и го шипна като passthrough, а `npx git reset --hard` (npx, обвиващ
git-а) пита.

**Четвърти Одиторски пас не беше пуснат — операторско решение.** На негово място: fact-check над
делтата (нула находки) и **независим VERIFY рън**, диспачнат отделно, вместо приемане на отчета на
Колегата.

**Верификация (независим рън, точни кодове):** validate-payload exit 0 „6 migration(s) … 0.2.2";
test-setup 316/0; test-update 451/0; двата example цикъла 44/0; selfcheck **937/937**; spikes
**245/0**; `claude plugin validate .` ✔. Трите grep-а празни (exit 1). `git status --short` преди и
след рънa — идентичен. **Записано честно:** комитнатото дърво се различава от независимо
провереното с точно два коментарни реда (застояло „no quoting awareness" в `aiwf-lib.js` и в
`run-spikes.mjs`, намерени от Колегата в СТЕЙДЖНАТИ файлове преди commit-а и поправени), покрити с
повторни рънове — `node --check` на двата файла, selfcheck 937/937, spikes 245/0.

**Неточност в отчета (записана, не гонена):** Колегата отчете Cyrillic grep-а като exit 0; той е
exit 1 при празен изход. Същността е еднаква.

**Останал дълг: няма.** Два лимита са ЗАПИСАНИ, не поправени, и двата с изрична проза в payload-а:
(а) и ask правилата, и Gate 4 са адресирани към `Bash` tool-а, значи втори shell tool заобикаля
двата слоя и deny клонът пада по избор на инструмент — тикет PS-001, за 0.2.3, по операторско
решение; (б) passthrough клонът стъпва на поведение на хоста, което това repo не може да тества.

**Поука за COO-а, записана защото е измерима:** три от четирите блокера на пас 1 и повечето
fact-check находки произхождат от МОЙ текст — грешно изброените гейтнати форми, формулировката
„every form", анекдотът, който аз поръчах. Одиторът намери дефект в кода на Колегата веднъж.
Брифът е тръгнал без пълната си прецизност и разликата е платена с рундове — точно това, което
доктрината нарича „брифът носи пълната си прецизност в първата чернова".

## POSIX-004 [R2 code-class] — self-check-ът приключва без отчет на macOS (роден 2026-09-09)

Диагноза (CI run 34321807708, тестов клон `ci/macos-proof-posix-003` на `22965ba`): ubuntu зелен,
windows зелен, **macOS червен на `update acceptance suite`** — стъпка, до която нито един предишен
рън не е стигал, защото setup суитът спираше преди нея. `setup acceptance suite` мина **316/0**,
включително контролът на секция 23 — POSIX-003 държи и това е доказано на роден macOS.

Едно падане от 451: `scripts/update/test-update.mjs:1395-1396`, сценарий `sc-red` —
`r.out.includes('roles.json') && r.out.includes('FAILURES:')`. Изходът на self-check-а спира
веднага след ENTRYPOINT IDENTITY блока; нито tally-то, нито `FAILURES:` блокът се появяват.
`main()` е `try/finally` **без `catch`**, значи хвърляне излиза без отчет. Дефектът е в ПРОДУКТА
(self-check, който може да умре мълчаливо е дефект на всяка платформа — macOS само го задейства),
не в теста; тестът си върши работата.

**Коренът НЕ е доказан.** `test-update.mjs:66` реже диагностичния изход на 260 знака, така че
реалната опашка — стек трейс или каквото е било — не е в лога.

**Операторско решение 2026-09-10: един диагностичен цикъл, после решаваме.** Не опит за фикс, а
опит за информация: махане на отрязването + `catch` в `main()`, push на тестов клон, едно четене.
Ако назове двуредов фикс — взимаме го. Ако покаже нещо структурно или иска Mac машина — macOS се
обявява за неподдържан ЧЕСТНО, което значи повече от ред в README: leg-ът става non-blocking или
пада (постоянно червен leg е по-лошо от двете — точно този навик остави матрицата непрочетена 11
ръна), плюс README § Status, доктрината и `os` enum-а в схемата. Записана цена на този избор: bash
каналът е СПОДЕЛЕН между linux и macos, значи дефект, изгрял на macOS, често живее в общия код
(realpath-ът на POSIX-001 беше точно такъв) — обявяването не маха дефектите, спира да ни казва за
тях.

Независимо от решението за поддръжката: `try/finally` без `catch` в `aiwf-selfcheck.js` се поправя
— платформено-неутрален дефект, и точно той направи тази диагноза скъпа. **Чака собствена дума.**

### POSIX-004 — Completion record, кодовата половина (2026-09-12)

**Commit `60c8928da78cfb98f918c48b425679849e438f5c`** върху котвата `3ce793f` (branch `main`,
локален, непушнат): 3 файла, 172+/2− (`git show --stat 60c8928`); PLAN файлът и трите EOL-мръсни
`.ps1` извън commit-а; едноредово съобщение, нула trailers (`git log -1 --format=%b` празно).
Изпълнено: `catch` в `main()` на `aiwf-selfcheck.js` — хвърляне от секция вече печата хвърлената
стойност (Error с пълния stack; всичко друго през `util.inspect` в `describeThrowable()`, писан
да не може да хвърли — всяко четене на стойността минава през `safe()` с литерален fallback),
брои се като синтетичен `[(uncaught)]` FAIL (tally + `FAILURES:` + exit 1, всичко отпреди краша
оцелява) и се обявява с `INCOMPLETE RUN` банер над COVERAGE текста; `why()` в `test-update.mjs`
спря да реже (беше последни 3 реда, срязани на 260 знака) — lazy closure с пълния изход на
спawn-натия рън, плащан само при FAIL; два нови sc-crash сценария в секция 12 (Error и
null-prototype хвърляне, инжектирани в payload КОПИЕ) — test-update 451 → 468 checks; един ред в
CHANGELOG блока [0.2.2] (0.2.2 е локално бъмпната и неиздадена — без нова миграция).

**Ревю:** fact-check ×2 (прозата на диффа; корекционната делта) — 0 находки. Codex
`gpt-5.6-sol`/high, `Class: code`: пас 1 `fail` с ЕДИН блокер (P2 — catch handler-ът можеше САМ
да хвърли при не-Error throwable: `String(Object.create(null))` хвърля TypeError, вторичното
изключение губеше отчета — точно failure mode-ът на тикета) → корекционен рунд 1 (в cap 2),
red-proof на три версии (без catch / рунд-1 / коригиран: само третият пази tally, `FAILURES:` и
полетата на стойността). **Втори пас не беше пуснат — операторска дума** (корекцията изпълнява
дословно „exact next action" на самия Одитор); на негово място, по прецедента от GATE-001:
fact-check над делтата (0 находки, вкл. емпирична проверка на JS семантиката) + независим
COO-диспачнат VERIFY рън.

**Верификация (независимият рън, точни кодове):** VERIFY 8/8 exit 0 — validate-payload
„6 migration(s) … 0.2.2"; test-setup 316/0; test-update 468/0; example cycles 2×44/0; selfcheck
937/937; spikes 245/0; `claude plugin validate .` ✔; Cyrillic grep празен, exit 1; `git status
--short` преди/след идентичен. Записан честно един невалиден междинен рън: първият независим
VERIFY течеше ПАРАЛЕЛНО с корекционните редакции на Колегата → двата example цикъла паднаха на
собствената си byte-identical проверка (COO грешка в разписанието, не дефект; свойството „този
VERIFY не търпи паралелни редакции на repo-то" е записано и от Колегата в рунд 0).

**Остатък (частта на тикета, която НЕ е код):** диагностичното ЧЕТЕНЕ — push на тестов клон
(собствена операторска дума) и ЕДНО четене на macOS leg-а с вече нерязаната диагностика; после
операторското решение фикс / honest unsupported. Коренът на macOS падането остава непознат по
дизайна на тикета. Друг дълг: няма.

## PS-001 [R2 code-class] — вторият shell tool заобикаля двата слоя (роден 2026-09-10)

Открито във Furnissimo сесия и потвърдено тук от собствения инструментариум: **всяко** правило в
`templates/settings.ask-ruleset.json` е `Bash(...)`, а Windows сесия носи `PowerShell` tool до
`Bash`. Значи целият ask списък — commit, push, merge, rebase, reset, clean, rm, checkout,
restore, revert, pull, fetch, cherry-pick, stash, config, remote, плюс docker/npm/rm семейството —
има нула покритие през втория инструмент. Дупката е в payload-а, не в конфигурацията на
консуматора, и всеки Windows проект я има.

Commit диалогът е симптомът; **push е сериозното** — доктрината го гейти с изрична дума И диалог, а
диалогът през PowerShell не съществува. И удря Gate 4: закачен е на matcher `Bash`, а агент от клас
`general-purpose` има `Tools: *`, тоест и PowerShell — значи инцидентът от 2026-09-03, който роди
GATE-001, остава възможен след 0.2.2 по избор на инструмент, не по екзотична команда. Записано е
като честен лимит на 7 места в 0.2.2.

**Трето лице на същия дефект, доказано на живо 2026-09-12:** гейтът е вързан не само към
инструмента, но и към **пътя**. Командата `git -C D:/Stratex restore -- <път>` (разрушителен
глагол към чуждо repo, изпълнена от тази сесия с операторска дума) **не вдигна диалог**:
`Bash(git restore:*)` не съвпада, защото командата започва с `git -C`, а трите `-C` правила
покриват само `push|merge|rebase` и само `<projectRoot>`. Тоест всеки ask-класов глагол към repo,
различно от проектното, минава необгейтен. Това НЕ е аргумент за blanket `git -C` правило —
`templates/settings.ask-ruleset.json:4` обяснява защо е отказано (гейтваше и read-only `-C`
команди). Аргумент е, че Gate 4 е мястото, където се решава: hook-ът вече разпознава `-C` и вече
пита при всяка `-C` форма — липсва само покритието на втория инструмент.

**Референтната форма съществува и е операторска, не измислена тук** (прочетена от втория
консуматор 2026-09-12, където е добавена на ръка, защото проблемът е забелязан ТАМ пръв). Нейният
`settings.json` носи, извън всичко, което payload-ът шипва:
- **blanket за СВОЯ root, в три изписвания** — `Bash(git -C <root>:*)` с обратно наклонени, с
  наклонени, и в кавички. Покрива всеки глагол срещу собственото repo.
- **пълен набор ПО ГЛАГОЛ за наименовано съседно repo**, в две изписвания (наклонени без кавички,
  обратно наклонени в кавички) — точно 14-те ask глагола плюс push/merge/rebase.

Това НЕ е глобалният blanket, който `templates/settings.ask-ruleset.json:4` мотивирано отказва —
онзи гейтваше read-only `-C` команди срещу произволно repo. Blanket, скопиран до СВОЯ root, е
безопасен по друга причина: доктрината казва „git bare от root-а", значи `-C <своя root>` не бива
да се появява законно; появи ли се, диалогът е верният изход. Трите изписвания са нужни, защото
съвпадението е буквално по префикс.

**Обхват (за 0.2.3, операторско решение 2026-09-10):** огледални `PowerShell(...)` правила за
целия ask списък + matcher-ът на Gate 4 да покрие и втория tool (иска проверка как се казва полето
с командата в неговия payload и че разделителите му са `;`/`&&`/`||`/`|`). Managed artifact:
`reconcile-ask-ruleset` op, миграция, bump, променя `settings.json` на всеки консуматор.
Операционна бележка от Furnissimo: редакцията на `settings.json` иска auto mode ИЗКЛЮЧЕН —
класификаторът я блокира, платено с рунд на 2026-08-18. **Чака собствена дума.**

## Closeout (само при НУЛА кандидати и дългове — операторска директива 2026-09-03)

Closeout има чак когато: всички тикети на плана (вкл. всичко родено междувременно) са затворени с
records; CANDIDATES.md е празен надгробен камък; нито един запис „остатък"/„дълг" не стои
неразрешен; CI зелен на трите leg-а; и планът може да се прати на колеги без нито един „глупав
въпрос". Тогава: архив `git mv … 004_PLAN_PNP_PUBLIC_<дата>.md` → един commit (клик) → push
(дума + диалог) → `origin/main...main` = `0	0`. Таговете НЕ се местят.

## Ред и гейтове
Изпълнен ред: AUD-001 → AUD-002 → PUB-001 → PUB-002 → PUB-003 → POSIX-001 → POSIX-002 →
POSIX-003 → GATE-001 → POSIX-004 (кодовата половина, commit `60c8928`; всичките с records).
Остава: **POSIX-004 диагностичното четене** (push на тестов клон — собствена дума, после ЕДНО CI
четене и операторско решение), **PS-001**, после Closeout — всеки чака собствена дума. RENAME-001
е изваден от плана (операторско решение 2026-09-11) и стои в `dev/backlogs/CANDIDATES.md`.

Гейтове: всеки тикет — дума за диспач; commit — клик; tag/push — дума + диалог; пас над
`review.code.passes` или корекционен рунд над cap-а — отделна дума всеки (GATE-001 изяде такава за
рунд 4, и операторът отказа четвърти Одиторски пас — на негово място минаха fact-check над делтата
и независим VERIFY рън). Readiness на плана: fact-check + пасовете на `review.plan.passes`
(над тях — дума).

**Незатворено от мисията:** macOS leg-ът. POSIX-001/002/003 го докараха до „setup суит 316/0 на
роден macOS", но `update acceptance suite` пада; POSIX-004 поправи диагностиката (кодът е в
`60c8928`), коренът още не е ЧЕТЕН. Затова `main` **не се пушва** — всичко от 0.2.2 нататък
(кодът и dev записите) е локално, непушнато (`git rev-list --left-right --count
origin/main...main` го брои точно в момента на четене) и push-ът чака трите leg-а зелени или
операторско решение macOS да се обяви за неподдържан. Push на тестов клон за диагностичното
четене е отделна, собствена дума.

## Кандидати

Кандидатите живеят в `dev/backlogs/CANDIDATES.md` — планът се затваря без отворени точки.
Кандидатът „POSIX CI leg-овете са червени" стана тикети POSIX-001/002 (диагнозата е в POSIX-001).

## Verification (края на мисията)
- VERIFY 8/8 exit 0 на `main` @ closeout hash; Cyrillic `git grep` празно; `claude plugin validate .`.
- `node scripts/setup/aiwf-roles.mjs --show --project-root . --plugin-root .` тук и `/pnp:roles`
  във Furnissimo печатат Codex за трите реда, 2/1/1.
- `git ls-remote --tags origin v0.2.0` = PUB-001 hash; след closeout push `origin/main...main` = `0	0`.
- README § Status верен без редакция след PUB-003 (текстът от PUB-001 е написан да остане верен).
