# PNP-DEV — PromptAndPray repo-то става дом на собственото си развитие

> ОДОБРЕН от оператора 2026-08-29 (plan mode); този файл е Git канонът на плана
> (гейт (e); plan-mode файлът в `~/.claude/plans/` е указател). Изпълнява се В
> `D:\promptandpray` — сесия `claude --plugin-dir D:\promptandpray`
> от `D:\promptandpray`, `/pnp:mission`. Тикет префикс **DEV-**. Readiness review (R2
> durable план): Codex quota до 21:54 — pass-ът се пуска след това ИЛИ операторът го
> прескача с дума (планът е механичен, фактите са проверени).

## Context

Операторска директива (2026-08-29): Furnissimo не носи планове/версии/memory за PNP.
Всичко за плъгина — сесии, планове, документация, история — живее в `D:\promptandpray`.
Проблем с PNP от Furnissimo → сесия в PNP. Без паралелни сесии/worktree-та във Furnissimo
заради PNP. Furnissimo консумира плъгина като **marketplace snapshot** (операторско
решение), не като горещото работно копие през `--plugin-dir`.

Проверени факти (Explore, 2026-08-29), които определят формата:
- `aiwf-selfcheck.js` provenance walk (:2346-2367) слиза във ВСЯКА директория освен
  `PROV_SKIP_DIRS = {.git, node_modules}` (:2290); нескаинируемо разширение = FAIL
  (`provenance-scope`, :2419); root файловете се сканират; кирилица = FAIL (:2320).
  → `dev/`, `.claude/`, `.aiwf/` и root `CLAUDE.md` (собственият project layer) трябва да
  са изрично извън провенанс скана. Doc-reference сканът (:2167-2172) е изричен списък
  (skills/docs/templates/migrations/scripts/update) — `dev/` не го засяга.
- Self-install (projectRoot == pluginRoot): пише `.claude/aiwf-native/*`, `.claude/agents/
  writer.md`, `.claude/settings.json`, root `CLAUDE.md` — без колизии; НО schema
  default-ите `paths.plansDir = docs/backlogs` и `paths.overridesDoc = docs/ai/
  PROJECT_OVERRIDES.md` падат ВЪТРЕ в payload `docs/` (:1038, schema :341/:344) → self-
  install конфигът ги сочи към `dev/`. Repo-то няма `.claude/`, `CLAUDE.md`, `.gitignore`.
  Hook-овете четат config-а от plugin root-а като project dir (fallback :81-84) — точно
  каквото self-hosting иска.
- Marketplace (доковете): минимален `.claude-plugin/marketplace.json` `{name, owner,
  plugins:[{name, source, description}]}`; `source: "./"` е валидно за repo, което само е
  плъгинът; `/plugin marketplace add <path>` за локална директория; `/plugin install
  pnp@promptandpray` КОПИРА в `~/.claude/plugins/cache` (snapshot); **update се взима
  само при промяна на `version` в plugin.json** (`/plugin marketplace update` + `/plugin
  update pnp@promptandpray`). Няма `.claudeignore` — `dev/`/`.claude/` пътуват с копието,
  но не са plugin компоненти (безвредни).

## Решения (COO; продуктовите са операторски и вече са изречени)

- **`dev/` е зоната за развитие** (`dev/backlogs/{active,archive}/`, `dev/README.md`,
  `dev/PROJECT_OVERRIDES.md`, `dev/answers.json`); може да е на български; извън
  провенанс скана. Payload-ът остава непроменен по форма.
- **Self-install е committed** (`.claude/aiwf-native/{aiwf.config.json,roles.json}`,
  `.claude/agents/writer.md`, `.claude/settings.json`, root `CLAUDE.md` с managed регион +
  операторска зона на английски); `.gitignore`: `.aiwf/`, `.claude/settings.local.json`.
  PNP dev сесиите работят с `--plugin-dir D:\promptandpray` (горещото копие — тук е
  правилно: разработваш това, което караш).
- **Furnissimo инсталира на PROJECT scope** (`.claude/settings.json` носи marketplace-а и
  `enabledPlugins`): така инсталираният `pnp` НЕ е активен в PNP repo-то (иначе двоен
  `pnp` — cache копие + `--plugin-dir`). Пътят е машинен (single operator) — документира
  се в `PROJECT_OVERRIDES.md`. `--plugin-dir` пада от Furnissimo сесиите.
- **Версии:** DEV-001/002 не бумпват (v0.1.0 остава на `baa9009`; Furnissimo инсталира
  fresh от main след DEV-001). Първият bump е P8 → 0.1.1 с миграцията — той е и първият
  реален `/plugin update` + `/pnp:update` цикъл за Furnissimo.
- Тикет **P8** се мести като е (`dev/backlogs/active/PLAN_PROMPTANDPRAY_0_1_1.md`) и
  получава точка: „VERIFY spike референцията = `git show c2626789^:.claude/hooks` в
  scratch" (Furnissimo hook-овете вече не съществуват).

## Тикети (ред: DEV-001 → DEV-002 → DEV-003 → после P8)

### DEV-001 [R2, plugin repo] — dev зона, self-host изключения, marketplace, .gitignore
- **Bootstrap изключение (операторска дума, 2026-08-29):** няма рендериран writer агент преди
  DEV-002 (`.claude/agents/writer.md` е продукт на self-install), а Gate 1 пуска Edit/Write само от
  main сесията или от `agent_type: "writer"` — main сесията пише DEV-001 директно; ревюто остава R2
  (`/pnp:review` след 21:54 или първолична верификация с дума). Не се заобикаля Gate 1 с друг агент.
- `dev/README.md` (как се работи по плъгина: сесия с `--plugin-dir` от repo-то,
  `/pnp:mission`, плановете в `dev/backlogs`, VERIFY сетът, „payload е код: всяка промяна
  в skills/docs/templates/scripts е R2", release = version bump + миграция + tag).
- `dev/backlogs/active/PLAN_PNP_DEV.md` (този план) + `PLAN_PROMPTANDPRAY_0_1_1.md`
  (пренесен от Furnissimo, с добавената spike-референция точка); `dev/backlogs/archive/`
  с pointer файл към Furnissimo архив 009 (историята на извличането е там).
- `.claude-plugin/marketplace.json`: `{ "name": "promptandpray", "owner": {"name":
  "Desislav Yosifov"}, "plugins": [{ "name": "pnp", "source": "./", "description": <от
  plugin.json> }] }` — без `version` в entry-то (plugin.json е единственият източник).
- `.gitignore`: `.aiwf/`, `.claude/settings.local.json`.
- `aiwf-selfcheck.js`: (a) `PROV_SKIP_DIRS` + `dev`, `.claude`, `.aiwf`; root `CLAUDE.md`
  скипнат по име (`PROV_SKIP_ROOT_FILES`); коментарът казва защо (собственият project
  layer и dev зоната не са payload); flipping контроли (кирилица в `dev/x.md` и в root
  `CLAUDE.md` НЕ провалят; в `docs/x.md` провалят); (b) нова секция MARKETPLACE: файлът
  съществува, е JSON, `name`, `owner.name`, точно един plugin с `name` == plugin.json
  `name`, `source` == `"./"`, без `version` в entry-то; контроли: липсващ файл, друго
  име, `version` в entry-то → FAIL; (c) `PROV_AREAS` непроменен.
- `docs/README.md`/root `README.md`: един абзац „Development lives in `dev/`; install
  from this repo as a local marketplace" + install/update командите.
- VERIFY (литерално, от `D:\promptandpray`): `node scripts/update/validate-payload.mjs
  --plugin-root "D:\promptandpray"`; `node scripts/setup/test-setup.mjs`; `node scripts/
  update/test-update.mjs`; `node scripts/ci/run-example-cycle.mjs` (+ `--answers
  examples/example-project/answers-linux.json`); `node scripts/selfcheck/aiwf-selfcheck.js
  --plugin-root D:/promptandpray` (нови assertions, всички с контрол); `node scripts/
  spike/run-spikes.mjs` (без `--reference`); `claude plugin validate "D:\promptandpray"`;
  `git -C D:\promptandpray grep -n "[А-я]" -- docs skills templates scripts schema` →
  празно (кирилицата е само в dev/ и CLAUDE.md).

### DEV-002 [R2, plugin repo] — self-install (PNP инсталиран в себе си)
- `dev/answers.json`: project { name "PromptAndPray", description, stack "Node.js
  (zero dependencies), PowerShell + bash wrappers, Claude Code plugin", root "auto",
  defaultBranch "main" }; os windows; operator { language "bg", nicknames Колега/Одитор/QA };
  roles { writer claude-opus-5[1m]/high, reviewer codex/gpt-5.6-sol/high, qa codex/
  gpt-5.6-sol/high, qal disabled }; loop cap 2; enforcement { routeWriteGuard true,
  dispatchGate "off-plan" }; verify.commands = 7-те VERIFY команди по-горе (cwd ".");
  verify.e2e disabled; paths { scratchDir ".aiwf", plansDir "dev/backlogs", overridesDoc
  "dev/PROJECT_OVERRIDES.md" }; review.productBoundaryChecks: "Payload stays generic:
  no origin-project names, no Cyrillic, no absolute paths (provenance)", "A managed-
  artifact change ships as a migration + version bump, never silently", "Every operator
  gate that can be a native dialog is a native dialog".
- `dev/PROJECT_OVERRIDES.md` авторстван (COO, docs): идентичност (PNP е плъгин, не
  продуктът Furnissimo; не е Codex plugin), hard rules (payload = код → R2; никакво
  триене в `docs/` без миграция; release дисциплина), VERIFY, гейтове, worktree/memory
  бележка, marketplace консумацията (Furnissimo project scope).
- `/pnp:setup` (`--answers-file dev/answers.json`) → committed project layer + root
  `CLAUDE.md` (операторска зона на английски — провенанс скипът на root `CLAUDE.md`
  от DEV-001 го пази и при кирилица, но зоната е EN по избор).
- VERIFY: `node scripts/selfcheck/aiwf-selfcheck.js --plugin-root D:/promptandpray
  --project-fixture "D:\promptandpray"` → exit 0; пълният DEV-001 сет отново; Gate 2
  доказателство: в следващата dev сесия Writer диспач с `Ticket: DEV-003`… (тикетът е
  в `dev/backlogs/active`) минава тихо — записва се.

### DEV-003 [R2, Furnissimo + machine-local] — Furnissimo превключва на marketplace
- Furnissimo сесия (ПОСЛЕДНАТА с `--plugin-dir`): `/plugin marketplace add
  D:\promptandpray` → `/plugin install pnp@promptandpray` (project scope) → рестарт БЕЗ
  `--plugin-dir` → `/pnp:selfcheck` exit 0, `claude plugin list` показва
  `pnp@promptandpray`, Gate 2/1 живи (един тестов Writer диспач с невалиден ref → диалог;
  без диспач реално — само наблюдение на диалога и „No").
- Furnissimo repo (docs, един commit): `git rm docs/backlogs/active/
  PLAN_PROMPTANDPRAY_0_1_1.md` (преместен в PNP); `docs/backlogs/CANDIDATES.md` PNP
  секцията → един pointer ред към `D:\promptandpray\dev\backlogs\`; `docs/ai/
  PROJECT_OVERRIDES.md` §Workspace: „consumed as `pnp@promptandpray` (local marketplace
  `D:\promptandpray`, project scope); update = `/plugin update pnp@promptandpray` +
  `/pnp:update`"; `.claude/settings.json` носи marketplace/enabledPlugins записите от
  install-а (tracked).
- Machine-local (COO, без commit): PNP memory файловете (`promptandpray-mission-status`,
  `new-ticket-needs-operator-word`, `parallel-promptandpray-session`) → `~/.claude/
  projects/D--promptandpray/memory/` + MEMORY.md там; във Furnissimo MEMORY.md остава
  един ред „PNP се води в D:\promptandpray"; изтриване на `D--Furnissimo-pnp` memory
  копието и на worktree `D:\Furnissimo-pnp` (`git worktree remove`) — операторска дума
  за двете (destructive), в същата сесия.
- VERIFY: Furnissimo `git status` чисто след commit-а; `/pnp:selfcheck` exit 0 без
  `--plugin-dir`; `git worktree list` без `-pnp`.

## Completion records

### DEV-001 — DONE, commit `0276128` (2026-08-30; main сесия, bootstrap изключение)
- Дифф: `dev/README.md`, `dev/backlogs/active/PLAN_PROMPTANDPRAY_0_1_1.md` (пренесен + т. 12a spike
  референция), `dev/backlogs/archive/README.md` (pointer към Furnissimo архив 009),
  `.claude-plugin/marketplace.json` (+ top-level `description` — `claude plugin validate` иначе дава
  warning; entry-то е без `version`), `.gitignore`, `scripts/selfcheck/aiwf-selfcheck.js`
  (PROV_SKIP_DIRS + dev/.claude/.aiwf, PROV_SKIP_ROOT_FILES=CLAUDE.md само на root, `.gitignore`
  класифициран като текст; 5 нови provenance assertions + 5 нови flipping контрола; нова секция
  MARKETPLACE с 8 assertions + 8 контрола; coverage summary обновен), `README.md`, `docs/README.md`.
- VERIFY (всички от `D:\promptandpray`): validate-payload 0; test-setup 278/278 → 0; test-update
  389/389 → 0; example cycle win 37/37 → 0, linux 37/37 → 0; selfcheck 691/691 → 0; spikes 99/99 → 0;
  `claude plugin validate` 0 (без warnings); Cyrillic grep по code point
  (`git grep -nP "[\x{0400}-\x{04FF}]" -- docs skills templates scripts schema hooks migrations`) →
  празно. Бележка: байтовата форма `[А-я]` от тикета мачва em-dash/§ и е подменена с code-point
  формата в `dev/README.md`.
- Одитор (Codex gpt-5.6-sol/high, read-only): рунд 1 `fail` — 2×P2: (1) `PROV_SKIP_DIRS` по basename на
  всяка дълбочина → `docs/dev/`, `templates/.claude/` биха се пропуснали; (2) coverage summary не
  описваше новите изключения и MARKETPLACE. Корекция: `PROV_SKIP_ROOT_DIRS` (root-only) отделно от
  `.git`/`node_modules` (any depth) + 3 контрола (`docs/dev/`, `templates/.claude/`, `scripts/.aiwf/`
  → FAIL) + walk assertion, summary обновен. Рунд 2 `pass-with-notes` (без материални находки;
  бележка: sandbox-ът не може да пусне selfcheck — EPERM за temp fixture; 691/691 остава от
  имплементатора). Bootstrap `.claude/aiwf-native/roles.json` (DEV-002 стойности) е написан untracked
  само за да върви wrapper-ът — НЕ влиза в commit-а на DEV-001.
- Commit `0276128` по операторска дума 2026-08-30. Следващ: DEV-002 (self-install) — чака дума.

### DEV-002 — DONE (размразен и довършен 2026-08-30 по операторска дума; commit виж по-долу)
- Свършено (main сесия, bootstrap изключение — writer агентът е продукт на тикета):
  `dev/answers.json` (по спецификацията); `/pnp:setup --answers-file dev/answers.json --adopt`
  (bootstrap `roles.json` → take-new) → `.claude/aiwf-native/{aiwf.config.json,roles.json}`,
  `.claude/agents/writer.md`, `.claude/settings.json`, root `CLAUDE.md` (managed регион +
  операторска зона EN); `dev/PROJECT_OVERRIDES.md` авторстван (0 placeholder-и).
- VERIFY (всички exit 0): selfcheck `--project-fixture "D:\promptandpray"` 688/688 (и след doc
  корекциите); `aiwf-update.mjs --check` up to date; plugin validate чист; validate-payload;
  setup 278/278; update 389/389; example cycle win/linux 37/37; spikes 99/99; Cyrillic grep по
  payload празен.
- Одитор (Codex) рунд 1: `fail` — 5 блокера, всички в COO-авторствания текст (генерираният слой
  потвърден точен: dry-run нулев дифф, хешове, пълен ask-ruleset). Петте корекции са приложени:
  (1) docs/ триене само през миграция, която го именува; (2) слоен договор — payload включва
  `examples/`, `.claude-plugin/`; engines пишат managed артефактите под bookkeeping; hooks четат
  config/roles/active PLANs/route-state; (3) Gate 1 и 3 DENY, Gate 2 ASK; (4) миграционен layout
  `migrations/index.json` + per-migration `ops.json`/`NOTES.md`; (5) non-generic съдържание =
  `dev/` И self-install слоят. Рунд 2 бе стартиран и спрян по операторска дума — НЕ е проведен.
- Състояние на дървото при замразяване: untracked `.claude/`, `CLAUDE.md`, `dev/PROJECT_OVERRIDES.md`,
  `dev/answers.json`; modified `dev/backlogs/active/PLAN_PNP_DEV.md` (ledger). Нищо не е стейджнато.
- Довършване (2026-08-30): fact-check агент (Explore/sonnet, 34 твърдения) → 2 находки, поправени:
  `dev/README.md` selfcheck командата без `--project-fixture .` (без флага се проверява синтетичен
  fixture, не self-install-ът); spike референцията `c2626789^` е hash в origin repo-то — отбелязан
  като такъв. VERIFY повторен след поправките (exit кодовете в commit съобщението и по-долу).
- **Ревю = Одитор рунд 1 (Codex, fail ×5, всички фактически в COO текста) + fact-check агент +
  първолична верификация; операторско решение по разход.** Codex рунд 2 не се провежда —
  тикетът е docs-class.
- Gate 2 доказателството (тих диспач `Ticket: DEV-003` в off-plan) остава за СЛЕДВАЩА сесия
  (hook-овете се зареждат при старт) и за операторски разговор — не се пуска от тази сесия.

## Гейтове
- Дума за диспач на всеки тикет (нов тикет = дума — правилото, което P8 кодифицира,
  вече се прилага). Commit кликове. Destructive в DEV-003 (worktree remove, memory
  изтриване) — изрична дума. Readiness pass на този план — след 21:54 или прескочен с дума.
- Push на двете репота — отделна дума, извън плана.

## Извън обхват на този план — и КОГА (за да не се забравят)
- **P8** (гейт (b) фикс, хигиена от dogfood-а, миграция `0002` → 0.1.1, първият реален
  `/plugin update` + `/pnp:update` във Furnissimo): вече написан тикет в
  `dev/backlogs/active/PLAN_PROMPTANDPRAY_0_1_1.md` (пренася се с DEV-001). Ред:
  DEV-001 → DEV-002 → DEV-003 → **P8**. Дума за диспач при неговия ред.
- **Публикуване** (public repo + marketplace за други потребители): по оригиналния
  план „public чак след доказан update path" — P8 Е доказаният update path. Тикет се
  ражда СЛЕД P8, с дума, в нов план `dev/backlogs/active/PLAN_PNP_PUBLIC.md`.
- **Furnissimo продуктов код**: не е PNP работа — UI скелетът (PLAN_UI_SKELETON във
  Furnissimo) си върви в собствените си сесии.
