# PromptAndPray 0.1.1 — хигиена от dogfood-а + доктринният фикс за гейт (b)

> **RESUME KIT (2026-08-29).** Продължение на затворената мисия PROMPTANDPRAY
> (архив `docs/backlogs/archive/009_PLAN_PROMPTANDPRAY_2026-08-29.md`, plugin tag
> `v0.1.0` = `baa9009`). Furnissimo вече РАБОТИ на плъгина (merge `c2626789`,
> reconcile `1cde9ce2`) — всяка сесия се стартира с `claude --plugin-dir
> D:\promptandpray` от `D:\Furnissimo` и влиза с `/pnp:mission`; без плъгина няма
> нито един гейт и няма `/pnp:*`. Този план е роден по операторска дума
> (2026-08-29, „ти отваряш тикет 8 в плана") и носи ЕДИН тикет — **P8 — който
> ЧАКА операторска дума за диспач.** Нищо от него не се изпълнява без нея.

## Context

Dogfood-ът (P6c2) и closeout-ът (P7) оставиха: (а) една поведенческа регресия
на COO ролята — тикет P7 бе роден и започнат без операторска дума, докато
операторът гледаше („армия без командир; а ако не бях на екрана?"); доктрината
от 2026-08-27 („нов тикет се ОБЯВЯВА — уведомление, не въпрос") го позволяваше
формално и се отменя; (б) хигиенни наблюдения от първото реално каране на
плъгиновия loop; (в) четири остатъка от post-closeout ревизията (Explore,
2026-08-29). Понеже `v0.1.0` е тагнат и Furnissimo е инсталиран проект, всяка
промяна в managed артефакт пътува като **миграция `0002` → 0.1.1** и се прилага
с `/pnp:update` — първият реален пуск на update пътя, който P3 обеща.

## P8 — хигиена + гейт (b) + първата реална миграция [R2, plugin repo + Furnissimo
apply; ЧАКА ДУМА]

**Обхват (plugin repo `D:\promptandpray`, main):**

1. **Гейт (b): нов тикет = операторска ДУМА (водещо, регресия).** Payload
   `docs/WORKFLOW.md` §Operator-interaction guards (b): тикет, роден след
   стояща дума, се записва в PLAN-а, обявява се в едно изречение и СПИРА — нула
   мутации по него до изрична дума; „уведомление, не въпрос" (2026-08-27) се
   отменя изрично. `templates/CLAUDE.md.tmpl` (managed регион, същото правило,
   кратко). `skills/mission/SKILL.md` + `skills/work/SKILL.md` Step 5 („Report
   and STOP" покрива и новородени тикети). Selfcheck assertion, че skill
   текстовете носят изричното правило (+ flipping контрол).
2. **„Reading is not a shell job" като инструкция в skills.** Наблюдавано 3×:
   плъгиновият COO чете доктрина/памет/PLAN през `cat`/`grep`/`ls` вериги.
   `skills/{mission,work,setup,review,qa,loop}/SKILL.md` Step 0/1: „use the
   Read/Grep/Glob tools; never `cat`/`grep`/`ls` through the shell for reading".
   Selfcheck assertion за наличието на инструкцията във всеки skill.
3. **`; echo "X=$?"` суфиксът** — плъгиновият Writer го ползва въпреки правилото
   в managed региона; влиза изрично във VERIFY секцията на
   `templates/agents/writer.md.tmpl` (exit кодът се чете от harness-а).
4. **Blanket `Bash(git -C:*)` пада от `templates/settings.ask-ruleset.json`**
   (бие read-only `-C` формите към sibling repo — Furnissimo 69f0f74f, ръчно
   махане + tombstone в G-P6c-6). `<projectRoot>` формите остават. Миграцията
   носи `reconcile-ask-ruleset` op (to-remove = owned ∧ (old − new)); във
   Furnissimo правилото вече е tombstone → no-op там, доказва се.
   `docs/backlogs/CANDIDATES.md` bullet-ът се маркира ✅.
5. **Reconcile при сменен project root е адитивен** (generate.mjs:347-361 —
   re-run НЕ маха owned `<projectRoot>` форми със стар root; наложи ръчно
   махане + 3 tombstones). COO решение при брифа след scan: автоматичен
   tombstone на owned правила, които са `<projectRoot>`-рендери на друг root,
   ИЛИ документирана ръчна процедура в `skills/setup/SKILL.md` + selfcheck
   предупреждение. Едното от двете, не „и двете".
6. **P0 deferred Gate 2 диалог → OBSERVED** (2026-08-29, P6c2: диспач №1 диалог с
   `[plugin:pnp]` таг в `always`; диспач №2 тих в `off-plan`) —
   `scripts/spike/README.md` §DEFERRED се затваря със записа.
7. **Writer template рендер** (CANDIDATES bullet 2): `<!-- TEMPLATE CONTRACT -->`
   коментарът влиза в рендерирания `.claude/agents/writer.md`; overridesDoc
   пътят е mixed-slash. Козметично, но е managed артефакт → влиза в същата
   миграция (rerender-managed-region на writer.md).
8. **Worktree memory бележка** в `docs/OPERATOR_PROTOCOL.md`: worktree = отделна
   memory директория (`~/.claude/projects/<path-slug>/memory`), копира се на
   ръка и се слива на ръка; машинен факт, не плъгинов механизъм.
9. **Ретроактивно ревю на closeout-а 0.1.0** (комитнат от dogfood сесията без
   Одиторски пас): `CHANGELOG.md` форматът, tag-ът → `baa9009`, validate-payload;
   Одиторът на P8 го покрива в същия пас.
10. **Миграция `migrations/0002_<slug>/` @ 0.1.1** (manifest, NOTES.md,
    ops: rerender-managed-region CLAUDE.md#aiwf-core + `.claude/agents/writer.md`,
    reconcile-ask-ruleset, note с docRefs) + `plugin.json` 0.1.1 + CHANGELOG
    блок 0.1.1. Tag `v0.1.1` — необратимата половина, ОТДЕЛНА операторска дума.

**Обхват (Furnissimo, `r3/cutting-optimizer`, след плъгиновия commit):**

11. `/pnp:update --dry-run` → `--apply` върху `D:\Furnissimo` (managed регионът и
    writer.md се re-render-ват; конфликт не се очаква — override false и
    трите артефакта са clean по ревизията); selfcheck `--project-fixture
    "D:\Furnissimo"` exit 0; `_aiwf.installedPluginVersion` = 0.1.1,
    `lastMigrationApplied` = `0002_…`. Това е dogfood-ът на update пътя.
12a. **VERIFY spike референцията** = `git show c2626789^:.claude/hooks` (Furnissimo)
    извлечена в scratch и подадена като `--reference` на `scripts/spike/run-spikes.mjs`
    (Furnissimo hook-овете вече не съществуват в работното дърво — махнати в P6c2).
12. Остатъци от ревизията (docs, COO или Колегата в същия тикет):
    `.claude/aiwf-native/README.md:52` — `D:\Furnissimo-pnp` → `D:\Furnissimo`;
    `docs/backlogs/CANDIDATES.md` — референциите `PLAN_PROMPTANDPRAY.md §P6c2` →
    `archive/009_PLAN_PROMPTANDPRAY_2026-08-29.md` (направено при отварянето на
    този план, checkpoint 2026-08-29).

**Квота дисциплина (операторска директива 2026-08-30 — Codex 5-часов лимит; един
Одиторски пас = ~13%; блокерите в последните тикети са предимно фактически грешки в
COO-авторстван текст, не в код):**

13. **Fact-check гейт преди всеки платен пас.** `skills/review/SKILL.md` получава Step 2b:
    преди диспач към codex engine COO пуска евтин Claude агент (Explore, model sonnet —
    наша квота) с една задача: „всяко фактическо твърдение в прозата на диффа (път,
    ред, брой, команда, поведение на engine/hook) провери срещу дървото; върни САМО
    списъка на невярно/непроверимо с file:line и вярната стойност" — без вердикт. COO
    поправя, ЧАК тогава платеният пас. Payload `docs/WORKFLOW.md` §"COO-authored text is
    reviewed like the Writer's" получава изречението: Одиторът верифицира решения, не
    открива фактически грешки — те се хващат от fact-check гейта на цена cheap tier.
    Selfcheck: skill текстът носи стъпката (+ контрол).
14. **Engine по клас на тикета.** Docs-class тикет (планове, overrides doc, README,
    skill проза без изпълним артефакт) → Claude reviewer host (`reviewer` субагент,
    наша квота), независимо от `roles.reviewer.engine`; code-class → конфигурираният
    engine. `/pnp:review` Step 0b получава класификацията като изричен вход в брифа
    (`Class: docs | code`), с default code при липса. Payload `docs/WORKFLOW.md`
    §Routes го записва; `docs/LOOP.md` таблицата го отразява.
15. **Рунд 2 без платен пас, когато корекциите са само в проза.** Прецедентът
    (P3/P5/P6a/P6b/P6c2/DEV-002: тясна, механично проверима делта → COO верифицира
    първолично) става правило в payload `docs/WORKFLOW.md` §Overrides: втори платен пас
    само когато корекционният рунд е пипал код; проза корекции = fact-check агент +
    първолична верификация, записани в record-а. Операторът може винаги да поиска
    платен пас изрично.

Очакван ефект: ~1 Codex пас на code тикет, 0 на docs тикет.

**Извън обхват:** push/public на плъгина; нови фичи; Furnissimo продуктов код;
чистенето на worktree `D:\Furnissimo-pnp` и memory копието `D--Furnissimo-pnp`
(операторски действия, записани в архив 009).

**Acceptance (falsifiable):** плъгиновият стандартен VERIFY сет exit 0
(validate-payload с 2 миграции; test-setup; test-update; двата example цикъла;
selfcheck с новите assertions; spikes `--reference` — ВНИМАНИЕ: референцията
`D:\Furnissimo\.claude\hooks` вече НЕ съществува (махната в P6c2) → spike-ът се
пуска без `--reference` или референцията става `git show c2626789^:.claude/hooks`
извлечена в scratch — COO решава в брифа); `claude plugin validate` exit 0;
`/pnp:update` върху Furnissimo exit 0 + selfcheck `--project-fixture` exit 0;
`git grep -n "Furnissimo-pnp" -- . ":(exclude)docs/backlogs"` → само tombstone
редовете в `aiwf.config.json`.

**Risk threshold:** блокер = миграция, която re-render-ва в override/конфликт
вместо clean apply; skill правило без flipping selfcheck контрол; регресия в
съществуващите suites. **Stop condition:** един Одиторски пас върху целия дифф
(plugin) + един върху Furnissimo apply диффа; max два корекционни рунда.

**Операторски гейтове:** думата за диспач на P8; tag `v0.1.1` (отделна дума);
push (отделна дума). Нищо не се изпълнява преди първата.

## Completion records

### P8 — плъгиновата половина DONE, commit `c1c46a8` (2026-08-31); Furnissimo apply ОСТАВА
- Свършено (Колега, 2 диспача — имплементация + корекционен рунд; Gate 2 off-plan мина ТИХО на
  двата с `Ticket: P8` — доказателството, чакащо от DEV-002, е записано): т.1-10, 13-15 от
  обхвата + миграция `0002_operator-word-and-hygiene` → 0.1.1 + собственият ни install мигриран
  0.1.0 → 0.1.1 (`take-new` ×2 по COO решение, apply изпълнен от оператора — класификаторът
  отказа командата на COO; CHANGES отчетът комитнат). Двигател: `renderTemplate` стрипва
  TEMPLATE CONTRACT блоковете; общ `templateContext()` за setup+update (native-slash
  `overridesDocPath`); `planAskRules` пенсионира owned правила със стар root (owned − desired,
  без tombstone), `planReconcile` го консумира — една формула, един дом.
- Отклонения от плана, решени в движение: (а) docs-class Claude host на codex install =
  ad-hoc `general-purpose`/opus субагент (рендериран `reviewer.md` няма на codex install —
  планът го допускаше грешно; хванато от Одитора, рунд 1); (б) example bump преномериран
  `0003_example-bump` @0.3.0 (реалната 0002 зае слота; документирано в NOTES-а му);
  (в) CHANGELOG 0.1.0 Known limits: разделени и маркирани „Fixed in 0.1.1" вместо изтрити.
- VERIFY (2026-08-30/31, всички exit 0): validate-payload (2 миграции); test-setup 301;
  test-update 389; example cycle win 37 / linux 37; selfcheck `--project-fixture .` 706/706
  (след корекциите; 704 преди тях); spikes `--reference` (origin hooks от `c2626789^`,
  извлечени в scratch) 129/129, Gate 1 parity идентичен — т.12a затворена; `claude plugin
  validate` чист; Cyrillic grep по payload празен; `aiwf-update --check` up to date 0.1.1.
- Ревю (квота дисциплината на самия P8, приложена към него): fact-check агент №1 (пълния
  дифф) — 0 находки; Codex рунд 1 `fail` — 2×P2: недиспачваем docs-class маршрут на codex
  install; вакуумен Step 0c контрол (+3 бележки; ретроактивният 0.1.0 одит — без блокер,
  тагът `v0.1.0` → `baa9009` потвърден). Корекция (Колега): fallback маршрутът + 4-конюнктен
  предикат с 3 контрола (и реален дефект, хванат при доказването им: literal split() sabotage
  не преживява 100-колонен wrap → `phraseRe()`/`doctrinePhrase()`, който хвърля при липсваща
  фраза). Fact-check агент №2 (делтата) — 0 находки; Codex рунд 2 (операторска дума) — `pass`,
  без находки. 1 корекционен рунд от cap 2.
- Dogfood наблюдение (без тикет, само записано): Gate 3 allowlist-ът е фиксиран
  (`docs/**`, `.aiwf/**`, root `*.md`) и не включва конфигурирания `plansDir`, когато той е
  извън `docs/` — записът на този completion record бе отказан до изчистването на route-state
  (легитимно: диспачът беше приключил). Известен v0.1 фиксиран път; става тикет само ако
  блокира реална работа.
- Release (2026-08-31, операторски думи): tag `v0.1.1` → `c1c46a8`; push `main` + тагове
  `v0.1.0`/`v0.1.1` към `github.com/divels-studio/promptandpray` (private).
- **Furnissimo apply (т.11) DONE, Furnissimo commit `35600cb6`** (2026-08-31, операторска сесия
  там): `/plugin marketplace update` → `/plugin update pnp@promptandpray` (cache `pnp/0.1.1`) →
  рестарт → `/pnp:update`: dry-run спря на „конфликт" за двата rerender-а (по дизайн — вж.
  наблюдението долу), `take-new` ×2 (`git diff 1cde9ce2 HEAD` върху двата файла празен = нищо
  операторско изгубено), reconcile no-op (blanket правилото вече tombstone), 4 операции
  приложени; selfcheck (последна стъпка на update-а) PASS 705/705; `installedPluginVersion`
  0.1.1, `lastMigrationApplied` `0002_operator-word-and-hygiene` (проверено от PNP сесията:
  `grep` по `D:\Furnissimo\.claude\aiwf-native\aiwf.config.json`). Commit-ът носи само 3-те
  pnp файла; CHANGES отчетът там не се тракa. Това е първият реален install → loop → update
  цикъл на консуматор — продуктовата цел от `PROJECT_OVERRIDES.md` §Product direction.
- **Продуктов дефект, видян на консуматора (операторска реакция „защо е толкова сложно"):**
  `migrate.mjs:583-591` вдига конфликт при `localEdit || upstreamChange` — т.е. за ВСЕКИ
  rerender, дори при непипан артефакт. Правилно: диалог само при `localEdit`; чист артефакт
  → take-new тихо, видимо в CHANGES; dry-run показва „ще вземе payload версията", не спира.
  Обявен тикет **P9 — update без фалшиви конфликти** (R2; предикатът + dry-run текстът +
  `skills/update/SKILL.md` + test-update случаи; без миграция — не пипа managed артефакт;
  bump 0.1.2 при release). Чака дума; ражда се в нов план.
- т.12 остатък DONE: Furnissimo `.claude/aiwf-native/README.md:52` `D:\Furnissimo-pnp` →
  `D:\Furnissimo`, Furnissimo commit `0fdf5930` (2026-08-31); `git grep "Furnissimo-pnp"`
  там → само трите tombstone реда в `aiwf.config.json:27-29` (acceptance критерият).
- **P8 DONE.** Планът е 100% изпълнен → архивиран в същата сесия. Няма открит дълг; P9 е
  отделен план, ражда се с дума.
