# Tracked PowerShell scripts are ASCII-only

Windows PowerShell 5.1 mis-decodes non-ASCII bytes in a script file it is asked to run. A typographic
dash or a curly quote that arrived through copy-paste breaks the script on a stock Windows host,
usually with an error that points nowhere near the character.

So: every tracked `.ps1` stays ASCII-only, and the self-check asserts it byte by byte. The same
caution applies to any file a legacy interpreter has to parse.
