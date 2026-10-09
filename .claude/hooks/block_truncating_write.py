#!/usr/bin/env python
"""PreToolUse(Bash) guard — block Python truncating writes on ProdOS files.

Why this exists
---------------
A read-then-`open(p,'w')` rewrite of a large task file can truncate it to zero
bytes. `open(p,'w')` empties the file the instant it is called; if the encode
that follows raises, the write never runs and the whole file is gone, including
any uncommitted agent output that then has to be rebuilt by hand from context.

A memory note saying "never use open('w') for edits" does not reliably hold:
agents that know the rule still reach for the pattern.

A rule the model has to remember is not a control. This is the control.

What it blocks
--------------
Python write/append-mode opens and whole-file writes issued through Bash:
`open(...,'w')`, `io.open(...,'w')`, `Path(...).open('w')`, `.write_text(`,
`.writelines(` on a fresh handle, and the `'w+'`/`'wb'`/`'a'` variants.

What it deliberately allows
---------------------------
- Anything under the session scratchpad (temp files are what it is for).
- Reads: `open(p)`, `open(p,'r')`, `read_text()`.
- `sed -i`, `>` redirection, and the Edit/Write tools — all out of scope here.
  Shell redirection truncates too, but blocking `>` would fire on every
  legitimate pipeline; the incidents are Python, so the guard is Python.

Exit codes: 0 = allow, 2 = block (stderr goes back to the model).
"""
import json
import re
import sys

# Write-mode opens: open(..., 'w'), io.open(..., 'wb'), Path(...).open('a'), etc.
# The mode may be positional or keyword, single or double quoted.
WRITE_OPEN = re.compile(
    r"""(?:^|[^A-Za-z_.])(?:io\.)?open\s*\([^)]*?(?:mode\s*=\s*)?['"][wax]\+?b?t?['"]""",
    re.VERBOSE,
)
# pathlib whole-file writers — no explicit mode, same truncating behaviour.
PATHLIB_WRITE = re.compile(r"\.write_text\s*\(|\.write_bytes\s*\(")

SCRATCHPAD = "AppData/Local/Temp/claude"

# NOTE: this string is ASCII-only on purpose. stdout/stderr on some Windows
# machines default to cp1252, and a non-ASCII character here makes the block
# message render as mojibake in the one place it has to be readable.
MESSAGE = """BLOCKED - Python truncating write on a repo file.

`open(path,'w')` empties the file the moment it is called, before the write can
fail. A failure after that point leaves the file empty and its contents lost.

Use instead, in order of preference:
  1. The Edit tool - it fails WITHOUT writing when the match is wrong. That is
     the entire point, and it is the right instrument for an in-place edit.
  2. The Write tool for a genuinely new file.
  3. If a script really is right: write to the session scratchpad, verify size
     and tail, THEN copy over the target. This hook allows scratchpad paths.

Appending to a ProdOS file? Append mode is blocked here too, because the same
handle is one keystroke from 'w'. Use Edit and anchor on the nearest heading.
"""


def main() -> int:
    try:
        payload = json.load(sys.stdin)
    except Exception:
        return 0  # never let a malformed payload block real work

    if payload.get("tool_name") != "Bash":
        return 0

    command = (payload.get("tool_input") or {}).get("command") or ""
    if not command:
        return 0

    # Only Python invocations are in scope.
    if not re.search(r"(?:^|[^A-Za-z_-])(?:python|python3|py)\b", command):
        return 0

    if SCRATCHPAD in command.replace("\\", "/"):
        return 0

    if WRITE_OPEN.search(command) or PATHLIB_WRITE.search(command):
        sys.stderr.write(MESSAGE)
        return 2

    return 0


if __name__ == "__main__":
    sys.exit(main())
