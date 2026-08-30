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

_(празно — P8 чака дума)_
