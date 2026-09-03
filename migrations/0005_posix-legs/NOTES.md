# 0005_posix-legs

**A migration with nothing to apply, and that is the honest shape of this release.** 0.2.1 fixes
payload code only: no config key moves, no managed region is re-rendered, no agent file is touched.
It exists because the manifest's last entry must equal the payload version - otherwise "no unapplied
migrations" and "installed == payload version" would disagree with each other, and an installation
would sit on 0.2.0 while reporting that it is current.

One operation, and it asks nothing.

| # | op | what it does here |
|---|----|-------------------|
| 0 | `note` | one paragraph in your `CHANGES_*.md` saying that this release is payload code and that there is nothing for you to do. |

## What 0.2.1 actually fixes

**The Linux and macOS CI legs.** The workflow has had a three-platform matrix since it was written,
and those two legs had been red from their first run - eleven of them - without anyone reading the
logs. They were read for the first time after 0.2.0 was pushed, which is the uncomfortable part of
this entry: the matrix looked like proof and was not.

Nine of the ten macOS failures were **one** defect. Every CLI entrypoint decides whether it was
started directly or imported by comparing the invoked path with its own module path - and Node
resolves an entry file to its real path before loading it, while a POSIX temp directory usually sits
behind a symlink. So an entrypoint spawned from a payload copy under the temp directory concluded
"I am not the main module", did nothing at all, and exited 0. The suites read that 0 as success:
sabotage controls came back green because nothing had run. Six entrypoints now compare real paths on
both sides. The remaining failure was a test that built an expected path with the host's separator
instead of the one the configured channel produces.

The rest is small and named: a `shellcheck` directive for a cleanup function that only a `trap` ever
calls (two ShellCheck generations report that false positive under two different codes, so both are
disabled on that one line), the workflow's `checkout` and `setup-node` pins moved up to `@v5`, and a
comment in the workflow that claimed those legs had never executed.

## The self-check and your plugin cache

The self-check's provenance scan walks the payload and **fails on a file whose type it does not
know** - deliberately, because a silent skip is how an unscanned file class becomes a hole. When the
plugin is installed from a marketplace, the payload root is a directory inside the harness's own
plugin cache, and the harness keeps its bookkeeping right there: `.in_use/<pid>`, one small JSON
marker per running session, and `.orphaned_at` on a version that has been superseded. Neither ships
with the plugin, so a perfectly clean marketplace installation reported four failures that said
nothing about the payload.

Both names are now skipped - **at the payload root only, by exact name, and only those two**. A
`.in_use` directory anywhere deeper in the payload is payload and is still scanned, an unclassified
file of any other name at the root still fails, and the negative controls prove both directions: a
marker planted at the root with every forbidden pattern inside it leaves the scan green, while the
same content one level down is still found. A skip wide enough to hide a real finding would be a
worse defect than the noise it removes.

## If you are updating from 0.1.x

`0002_operator-word-and-hygiene`, `0003_quiet-rerender` and `0004_audit-table` still apply first,
each with its own operations and its own notes; this one follows them and adds nothing to what they
ask of you.
