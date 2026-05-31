# Merquerial

> A simple, dependency-free console query library for Node.js

Ask a question on the command line, parse the answer into a typed value, and resolve a Promise when the user gives an acceptable response.

- **Typed Responses** -- parse console input into `Boolean`, `String`, `Integer`, or `Float`
- **Forgiving Yes/No** -- `Y`/`Yes`/`Ya`/`T`/`True`/`1` and negatives, case-insensitive
- **Defaults &amp; Inline Help** -- Enter accepts a default; `?` or `help` re-asks with help text
- **Re-prompt on Bad Input** -- unparseable answers re-ask instead of throwing
- **Zero Dependencies** -- built only on Node's built-in `readline`

[Quickstart](quickstart.md)
[API Reference](api.md)
[GitHub](https://github.com/fable-retold/merquerial)
