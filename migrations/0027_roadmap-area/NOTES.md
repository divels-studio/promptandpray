# 0027_roadmap-area

**The roadmap gains the area entry and its fourth write; an installed project's files are not
touched.**

## What changes

- Payload `docs/WORKFLOW.md` § Durable development history: a roadmap entry may be an AREA (a module
  or theme, goal "no known open defect") whose `Scope: in -` list collects the findings born during
  work, one indented line each with date, origin and pointer, until the list is worth a plan. That
  list is the fourth roadmap write; Status and Plans keep the three events.
- An installation older than the roadmap ports its live candidates once (old rows marked taken up /
  done / dropped) and reads the roadmap alone for open work from then on.
- § Out-of-scope findings names the area line as a destination.
- `templates/ROADMAP.md.tmpl` carries the one-sentence header. Your `ROADMAP.md` is a seed and is
  not re-rendered: adding that sentence to it is your own edit.

## What this migration does

One `note` operation, nothing else: `/pnp:update` prints it with the CHANGELOG block of 0.3.2 and
stamps the version. No file, config key or managed region of the installation is written.

## Superseded local rules

none
