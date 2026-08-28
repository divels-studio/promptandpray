# ExampleProject

This file existed before PromptAndPray was installed, and every line of it is the project's own.

Install APPENDS its managed region below this text and never rewrites a byte above it. That is the
property the example cycle asserts: your own instructions come first, the managed region comes
after, and an update re-renders only what is between the region's markers.

(The markers themselves are deliberately not quoted anywhere in this file - a stray one would look
to the generator like half a managed region, and setup refuses to guess where a region ends.)

## House rules that are none of the plugin's business

- Source lives in `src/`.
- `node --check src/hello.mjs` is this project's VERIFY command.
