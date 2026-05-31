# Merquerial

> A simple, dependency-free console query library for Node.js

Merquerial asks the user a question on the command line, validates the typed response, and parses it into a typed value -- a `Boolean` for yes/no questions, or a `String`, `Integer`, or `Float`. Each question is a `Promise`, so you can `await` a single prompt or run a list of prompts in sequence.

It is built only on Node's built-in `readline` module and has no runtime dependencies.

## Install

```bash
npm install merquerial
```

## Quick Start

The core class is `ConsoleQuery`. Construct one with an options object and `await` its `ExecutePromise()`:

```javascript
const libConsoleQuery = require('merquerial/source/Console-Query.js');

async function ask()
{
	let _Question = new libConsoleQuery({ Question: 'Do you like olives' });

	await _Question.ExecutePromise();

	// _Question.Value is true or false (YesNo is the default Type)
	console.log(`You answered: ${_Question.Value}`);
}

ask();
```

Running this prints a prompt, waits for input, echoes the parsed answer, and resolves:

```
Do you like olives (default: Y)? yes
  --> Your response: true

```

## Core Concepts

### 1. A Question Is an Object

Everything is configured through the options object passed to the `ConsoleQuery` constructor. Any option you omit falls back to a built-in default (for example `Type` defaults to `YesNo` and `Default` to `Y`). The merged options live on `_Instance.Options`.

```javascript
let _Question = new libConsoleQuery(
	{
		Question: 'How many widgets',
		Type: 'Integer',
		Default: '1'
	});
```

### 2. Response vs. Value

After a question resolves, two properties hold the answer:

| Property | Meaning |
|----------|---------|
| `.Response` | The raw text the user typed (or the configured `Default` if they pressed Enter) |
| `.Value` | The parsed, typed result derived from `.Response` |

For a `YesNo` question, `.Value` is a `Boolean`. For `String` it is the text as-is. For `Integer`/`Float` it is the parsed number.

### 3. Parsing by Type

The `Type` option controls how `.Response` becomes `.Value`:

| Type | `.Value` result |
|------|-----------------|
| `YesNo` | `true` for `Y`/`Yes`/`Ya`/`T`/`True`/`1`; `false` for `N`/`No`/`Nope`/`F`/`False`/`0` (case-insensitive) |
| `String` | the response text unchanged |
| `Integer` | `parseInt(response, 10)` |
| `Float` | `parseFloat(response)` |

If parsing fails -- an unrecognized yes/no word, or a number that comes back `NaN` -- Merquerial prints a short notice and asks the same question again. It does not throw or resolve with a bad value.

### 4. Defaults and Help

- **Default:** pressing Enter with no input sets `.Response` to the `Default` option. By default the prompt also shows `(default: ...)`; turn this off with `ShowDefault: false`.
- **Help:** while `AllowHelp` is `true` (the default), typing `?` or `help` prints the `Help` string and re-asks the question. Help text is its own branch, so disabling help (`AllowHelp: false`) lets `?` and `help` be accepted as ordinary string answers.

### 5. Promise or Callback

`ExecutePromise()` wraps `Execute(fCallback)` in a `Promise`. Use whichever style fits:

```javascript
// Promise
await _Question.ExecutePromise();
useTheAnswer(_Question.Value);

// Callback
_Question.Execute(
	() =>
	{
		useTheAnswer(_Question.Value);
	});
```

The Promise resolves with no value -- read the answer from `.Value` on the question instance after it settles.

## The Three Source Files

Merquerial ships three classes. Only `ConsoleQuery` is the query engine; the other two are a demo runner and a standalone logger.

| File | Class | Role |
|------|-------|------|
| `source/Console-Query.js` | `ConsoleQuery` | The console question: build text, prompt, validate, parse, re-ask. **This is the library.** |
| `source/Merquerial.js` | `Merquerial` | A demonstration harness. Its constructor hardcodes four example questions; `Execute()` asks them in order. It is the package `main`, so it is what runs as a quick demo. |
| `source/Merquerial-Log.js` | `MerquerialLog` | A standalone `console.log` logger with leveled methods and timing helpers. Not referenced by the query classes. |

> **Note:** `Merquerial.js` does not read questions from a configuration file or accept a question list -- the four questions in its constructor are fixed in source. Treat it as an example, and build your own runner over `ConsoleQuery` (see [Examples](examples.md)).

## Documentation

- [Quickstart](quickstart.md) -- install and ask your first question
- [API Reference](api.md) -- every option, property, and method, with defaults
- [Usage Patterns](examples.md) -- typed prompts, defaults, help, and running a sequence

## Related Modules

Merquerial has no runtime dependencies and declares no related modules. Other small Retold utilities you may want alongside it:

- [Precedent](https://fable-retold.github.io/precedent/) -- zero-dependency meta-templating engine
- [CacheTrax](https://fable-retold.github.io/cachetrax/) -- hash-indexed object cache
- [Fable](https://fable-retold.github.io/fable/) -- application services framework (DI, configuration, logging)
