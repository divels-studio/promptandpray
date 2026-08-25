# scripts/spike/

Runnable proof for the two enforcement gates. Two levels: level (a) is a suite you
re-run at will, level (b) is a recorded manual session.

## Level (a) - direct invocation (re-runnable)

```
node scripts/spike/run-spikes.mjs [--reference <dir-with-the-reference-hooks>]
```

Pipes realistic `PreToolUse` payloads into the shipped hooks, one child process
per payload, and asserts the decision each one must produce. With `--reference`
(or `PNP_SPIKE_REFERENCE_HOOKS`) pointing at the hook directory this port came
from, Gate 1 is additionally asserted to produce the **identical** decision and
the **identical** reason text as its origin - that is the port-parity proof.
Without it, the parity column reports SKIP and the expectations are still
enforced.

Per case the suite records up to four separate assertions: the plugin decision
matches the expectation, the plugin exited 0, the reference decision **and**
reason text are identical, the reference exited 0. Exit code is classified
before stdout: a hook that dies prints nothing, and printing nothing is how a
hook says "allow", so a crash is reported as `CRASH(exit=N)` and can never be
scored as a silent pass.

Exit 0 = all assertions passed, 1 = at least one failed.

Two negative controls exist to show the suite can actually fail (both were run;
both produced exit 1):

- point `--reference` at a copy of the guard whose writer constant was changed:
  the two writer-allow rows report `(DIVERGES)` and fail;
- run a copy of this suite whose `scripts/engine/` guard cannot even load
  (`require` of a missing module): every Gate 1 row reports `CRASH(exit=1)` and
  fails, instead of being read as `allow(passthrough)`.

## Level (b) - in-harness (recorded run, not a template)

Everything in this section is a **record of an executed session**, not an
expectation. Absolute paths are abbreviated to `<throwaway-repo>` and
`<plugin-repo>`; nothing else in the quoted output is edited.

Setup - a fresh throwaway git repository outside any real project, containing
only two fixtures:

```
<throwaway-repo>/.aiwf/route-state.json      {"route":"R2","ticket":"DEMO-1"}
<throwaway-repo>/.claude/agents/writer.md    minimal agent, name: writer, tools: Read
```

Pre-state check: `ls <throwaway-repo>/src` -> `No such file or directory`.
The user-level settings file on the test machine defines no `hooks` key, so
every hook that fires below comes from `--plugin-dir` and nothing else.

### (b1) Gate 1 blocks the write - OBSERVED

Run from `<throwaway-repo>`:

```
claude -p "Use the Write tool to create the file src/probe.txt with exactly the content HELLO. Then reply with one word: FINISHED." \
  --plugin-dir <plugin-repo> --permission-mode acceptEdits --allowedTools Write --output-format json
```

Observed (`claude` exit code 0, `"is_error": false`, `"subtype": "success"`,
`"num_turns": 4`):

```json
"permission_denials": [
  { "tool_name": "Write",
    "tool_use_id": "toolu_01YC6EmbzCkQb6M1jwhiWGXc",
    "tool_input": { "file_path": "<throwaway-repo>\\src\\probe.txt", "content": "HELLO" } }
]
```

The session's own summary of the block: *"My Write to `src/probe.txt` was blocked
by the project's AIWF-G3 hook: ticket DEMO-1 is dispatched on route R2, and while
a ticket is open the main session may only write `docs/**`, `.aiwf/**`, and
root-level `*.md`."* - i.e. the plugin-loaded hook read the **throwaway repo's**
state file, not the plugin's own directory.

Post-state check: `ls <throwaway-repo>/src` -> `No such file or directory`. The
file was never created. `--permission-mode acceptEdits` means the permission
layer would have allowed the write; only the hook stopped it.

### (b2) Gate 2 gates the writer dispatch - OBSERVED

```
claude -p "Dispatch the 'writer' subagent via the Agent tool with description 'P0 spike dispatch' and the prompt 'Ticket: DEMO-1 -- reply with the single word fixture'. Do not do the work yourself. Then report in one line what happened to that dispatch." \
  --plugin-dir <plugin-repo> --permission-mode acceptEdits --allowedTools Agent --output-format json
```

Observed (`claude` exit code 0, `"is_error": false`, `"num_turns": 2`):

```json
"permission_denials": [
  { "tool_name": "Task",
    "tool_use_id": "toolu_017thEP3AgCTLvRoGrgG2ChL",
    "tool_input": { "description": "P0 spike dispatch",
                    "prompt": "Ticket: DEMO-1 -- reply with the single word fixture",
                    "subagent_type": "writer", "run_in_background": false } }
]
```

Session summary: *"The dispatch was blocked by AIWF gate 2 (\"Writer dispatch\") -
starting the writer requires operator approval, so the subagent never ran and no
reply was produced."* - the hook's own reason text, surfaced through the harness.

Note for future readers: the result JSON reports this tool as `"Task"`, while the
`PreToolUse` matcher and payload call it `"Agent"`. The `"Agent"` matcher is the
correct one - the hook fired, and its internal `tool_name !== 'Agent'` guard did
not short-circuit. The two names belong to different layers.

### (b3) Control: a non-writer dispatch is untouched - OBSERVED

Same command with `'Explore'` in place of `'writer'`. Observed (`claude` exit
code 0): `"permission_denials": []`, and the session reported *"The dispatch was
allowed and the Explore agent replied: `fixture`."* The gate is writer-only, not
a blanket block on the Agent tool.

Final state of the throwaway repo after all three runs: still only the two
fixture files, `route-state.json` unchanged, no `src/`.

### DEFERRED - the one step not yet observed

`-p` is non-interactive, so an `ask` decision cannot render its native Yes/No
dialog there; headless it surfaces as the gated call recorded in (b2). Seeing the
dialog itself needs one interactive session:

> Open `claude --plugin-dir <plugin-repo>` **from a throwaway repo** (never from a
> real project whose own settings already wire these gates) and ask it to dispatch
> the `writer` subagent. Expected, not yet observed: a Yes/No permission dialog
> reading `Writer dispatch: "<description>". ... [AIWF gate 2: Writer dispatch]`.
> Answering No must leave the dispatch unexecuted.
