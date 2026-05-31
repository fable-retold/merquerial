# merquerial

> **[&#9654; Read the Merquerial Documentation](https://fable-retold.github.io/merquerial/)** &mdash; interactive docs with the full API reference.

A simple, dependency-free console query library for Node.js. Merquerial asks the user a question on the command line, validates and parses the typed response into a typed value (yes/no, string, integer, or float), and resolves a Promise when an acceptable answer is given.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## Features

- **Typed Responses** -- parse a raw console answer into a `Boolean`, `String`, `Integer`, or `Float`
- **Forgiving Yes/No Parsing** -- accepts `Y`, `Yes`, `Ya`, `T`, `True`, `1` (and the negative equivalents), case-insensitively
- **Default Answers** -- pressing Enter with no input falls back to a configurable default
- **Inline Help** -- typing `?` or `help` prints a help string and re-asks the question
- **Re-prompt on Bad Input** -- an unparseable answer simply re-asks rather than throwing
- **Promise-based** -- `await` a single question, or run a list of questions in sequence
- **Zero Runtime Dependencies** -- built only on Node's built-in `readline`

## Installation

```bash
npm install merquerial
```

## Quick Example

The unit of work is a single `ConsoleQuery`. Construct one with an options object, then `await` its `ExecutePromise()`:

```javascript
const libConsoleQuery = require('merquerial/source/Console-Query.js');

async function askName()
{
	let _Question = new libConsoleQuery({ Question: 'What is your name', Type: 'String' });

	await _Question.ExecutePromise();

	// The parsed answer is on .Value; the raw text is on .Response
	console.log(`Hello, ${_Question.Value}!`);
}

askName();
```

A yes/no question parses the answer into a `Boolean`:

```javascript
let _Confirm = new libConsoleQuery({ Question: 'Do you like olives', Type: 'YesNo' });

await _Confirm.ExecutePromise();

if (_Confirm.Value)
{
	// the user answered yes
}
```

## API Summary

### `ConsoleQuery` (`source/Console-Query.js`)

A single console question.

| Member | Description |
|--------|-------------|
| `new ConsoleQuery(pOptions)` | Construct a question; `pOptions` is merged over the defaults. |
| `ExecutePromise()` | Ask the question; returns a `Promise` that resolves once a valid answer is given. |
| `Execute(fCallback)` | Callback form of `ExecutePromise()`. |
| `.Response` | The raw string the user typed (or the default). |
| `.Value` | The parsed, typed answer. |

Common options: `Question`, `Type` (`YesNo` \| `String` \| `Integer` \| `Float`), `Default`, `AllowHelp`, `Help`, `ShowDefault`, `ShowResponse`, `ShowValidOptions`, `ValidOptions`. See the [API Reference](https://fable-retold.github.io/merquerial/#/api) for the full list.

### `Merquerial` (`source/Merquerial.js`)

A small demonstration runner. It builds a fixed list of `ConsoleQuery` instances in its constructor and asks them in order from `Execute()`. It is an example harness rather than a configurable questionnaire engine.

### `MerquerialLog` (`source/Merquerial-Log.js`)

A standalone `console.log`-based logger with leveled helpers (`trace`, `debug`, `info`, `warning`, `error`) and timing utilities (`getTimeStamp`, `logTimeDelta`). It is not wired into the query classes; use it on its own if you want simple console logging.

## Documentation

- [Overview](https://fable-retold.github.io/merquerial/#/docs/README) -- what Merquerial is and how the pieces fit
- [Quickstart](https://fable-retold.github.io/merquerial/#/docs/quickstart) -- ask your first question
- [API Reference](https://fable-retold.github.io/merquerial/#/docs/api) -- every option, property, and method
- [Examples](https://fable-retold.github.io/merquerial/#/docs/examples) -- typed prompts, defaults, help, and question sequences

## Related Modules

Merquerial has no runtime dependencies and no declared related modules. The Retold ecosystem provides other small utilities you may want alongside it:

- [precedent](https://github.com/fable-retold/precedent) - zero-dependency meta-templating engine
- [cachetrax](https://github.com/fable-retold/cachetrax) - hash-indexed object cache
- [fable](https://github.com/fable-retold/fable) - application services framework (DI, config, logging)

## License

MIT
