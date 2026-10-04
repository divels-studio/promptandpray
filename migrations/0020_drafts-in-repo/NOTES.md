# 0020_drafts-in-repo

**A plan's draft and its readiness history lived in the gitignored scratch directory.** The review
skill called `<scratchDir>` "the natural place" for the behavior ledger, the consequence scan and
the own pass, and named no place for a plan's draft, the fact-check ledgers or the revisions - so a
plan's proof disappeared with the scratch directory, and installations wrote local rules for the
same thing.

## What changes

- **Step 2e of `/pnp:review`**: a draft is `<plansDir>/drafts/PLAN_<ABBR>.draft.md`, untracked until
  it lands in `active/`; the behavior ledger, the consequence scan, the fact-check ledgers, the own
  pass and the revisions land in `<plansDir>/readiness/<ABBR>/` with the plan's docs commit and stay
  there; the scratch directory carries the live loop mechanics only and stands in for the readiness
  files only while Gate 3 holds the main session out of plansDir.
- **Doctrine and the plansDir description** say "parent of active/, archive/, drafts/ and
  readiness/"; `/pnp:setup` creates all four on a new install.
- **"Gitignored" is the project's own doing**: no sentence calls the scratch directory, the route
  state or the E2E artifact directory gitignored any more - the ones that remain say the project's
  own `.gitignore` keeps the path out of git, three of them that setup writes no ignore entry, and
  the two that placed the behavior ledger and the consequence scan name their readiness files
  instead; the self-check observes, as a note, whether git ignores the scratch directory at all.
  Two of the self-check's own fixtures run `git init` and `git check-ignore`; on a host with no
  `git` on PATH they are reported as not exercised, with that reason, and the scratch observation
  says git gave no answer - never a failure, so a setup or update on such a host stays green.

- **The `CLAUDE.md` region** says the plan lands in `active/`, moved there from its draft - not
  copied.

## What this migration does

- **Re-renders the `aiwf-core` region of `CLAUDE.md`**: an installation that never edited the
  region gets the new render silently; an edited region raises the usual conflict question; a
  region held through an override is not applied - the new render is recorded as upstream.
- **One `note`** saying the above. No hook entry, matcher or ask rule changes, and no directory is
  created: `<plansDir>/drafts/` and `<plansDir>/readiness/` appear when you first write into them,
  and the self-check reports a missing one as a note, never as a failure.

## Superseded local rules

A local rule that puts plan drafts or readiness artifacts in the repository can become a one-line
pointer to `/pnp:review` Step 2e.
