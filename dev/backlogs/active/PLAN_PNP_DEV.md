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

## Гейтове
- Дума за диспач на всеки тикет (нов тикет = дума — правилото, което P8 кодифицира,
  вече се прилага). Commit кликове. Destructive в DEV-003 (worktree remove, memory
  изтриване) — изрична дума. Readiness pass на този план — след 21:54 или прескочен с дума.
- Push на двете репота — отделна дума, извън плана.

## Извън обхват
P8 съдържанието (гейт (b) фикс, хигиена, миграция 0.1.1) — следващ план/тикет в `dev/`.
Публикуване на плъгина. Furnissimo продуктов код.
