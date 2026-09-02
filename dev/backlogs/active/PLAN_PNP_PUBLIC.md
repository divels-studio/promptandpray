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

## PUB-002 [оператор, извън repo-то] — repo public, tag, push
1. GitHub → Settings → Change visibility → Public (клик). Проверка (read-only, от тази сесия):
   `gh repo view divels-studio/promptandpray --json visibility --jq .visibility` → `PUBLIC`
   (`gh` 2.83.2 е на машината; `PRIVATE` = блокер, не се продължава).
2. `git tag v0.2.0 <PUB-001 hash>` — дума.
3. `git push origin main` + `git push origin v0.2.0` — дума + диалог. Проверка: `git ls-remote
   --tags origin v0.2.0` → `<hash>	refs/tags/v0.2.0`; `git rev-list --left-right --count
   origin/main...main` → `0	0`.

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

## Closeout (в repo-то, след PUB-003)
Completion records на AUD-001/002, PUB-001/002/003 + архив `git mv dev/backlogs/active/
PLAN_PNP_PUBLIC.md dev/backlogs/archive/004_PLAN_PNP_PUBLIC_<дата>.md` → **един commit (клик)** →
**push с дума + диалог** → чак тогава `git rev-list --left-right --count origin/main...main` →
`0	0`. Тагът НЕ се мести (сочи PUB-001 hash; records са dev/, не payload).

## Ред и гейтове
AUD-001 → AUD-002 → PUB-001 → PUB-002 → PUB-003 → Closeout. Всеки тикет — дума за диспач;
commit — клик; tag/push — дума + диалог (PUB-002 и Closeout). Readiness на плана: fact-check +
Codex pass 1/2 (трети — дума).

## Кандидати (не са тикети; тикет се ражда само с операторска дума)

- **Пълен rename AIWF → pnp** (операторска дума „кандидат задължително", 2026-08-31, повод: „колко
  драматично е `.aiwf/` → `.pnp/`"). Само scratch директорията е настройка (`paths.scratchDir`,
  default `.aiwf`; фиксирана в Gate 3 — `.aiwf/route-state.json`, „fixed in v0.1" в WORKFLOW),
  но остават `aiwf.config.json`, `.claude/aiwf-native/`, ключът `_aiwf`, скриптовете `aiwf-*`,
  resolver пътищата в wrapper-ите и README § „Three names" („nothing renames it"). Половинчат
  rename дава две имена за едно нещо; пълният е R3 — миграция, която мести файлове във всяка
  инсталация + промяна на hook/resolver пътища + managed CLAUDE.md региона — отделна мисия
  СЛЕД 0.2.0 (не сменяме лицето на продукта в момента на публикуване).

## Verification (края на мисията)
- VERIFY 8/8 exit 0 на `main` @ closeout hash; Cyrillic `git grep` празно; `claude plugin validate .`.
- `node scripts/setup/aiwf-roles.mjs --show --project-root . --plugin-root .` тук и `/pnp:roles`
  във Furnissimo печатат Codex за трите реда, 2/1/1.
- `git ls-remote --tags origin v0.2.0` = PUB-001 hash; след closeout push `origin/main...main` = `0	0`.
- README § Status верен без редакция след PUB-003 (текстът от PUB-001 е написан да остане верен).
