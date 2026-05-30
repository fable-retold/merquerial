# API Reference

Merquerial exposes three classes across three files. `ConsoleQuery` is the query engine; `Merquerial` is a demo runner; `MerquerialLog` is a standalone logger.

```javascript
const libConsoleQuery = require('merquerial/source/Console-Query.js');
const libMerquerial   = require('merquerial');                              // Merquerial (package main)
const libMerquerialLog = require('merquerial/source/Merquerial-Log.js');
```

---

## Class: ConsoleQuery

A single console question. Construct it with an options object, then run it with `ExecutePromise()` (or `Execute()`).

### Constructor

```javascript
let _Question = new libConsoleQuery(pOptions);
```

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `pOptions` | object | No | Question configuration. Each missing property is filled from the defaults below. A non-object value is treated as `{}`. |

The merged configuration is stored on `_Instance.Options`. Defaults are deep-copied per instance, so two questions never share option state.

### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `Question` | string | `'This is the DEFAULT question'` | The prompt text. `?` and a trailing space are appended automatically. |
| `Type` | string | `'YesNo'` | How the response is parsed: `YesNo`, `String`, `Integer`, or `Float`. The `YesNo` branch is case-insensitive; `Integer`/`Float`/`String` are matched case-sensitively against this exact string. |
| `Default` | string | `'Y'` | The response used when the user presses Enter without typing anything. |
| `AllowHelp` | boolean | `true` | When `true`, typing `?` or `help` prints `Help` and re-asks. When `false`, `?` and `help` are accepted as ordinary input. |
| `Help` | string | `'No help text provided.'` | Text printed when help is requested. |
| `ShowDefault` | boolean | `true` | Append `(default: <Default>)` to the prompt. |
| `ShowValidOptions` | boolean | `false` | Append the valid-options hint to the prompt (see `ValidOptions`). |
| `ValidOptions` | string | `'Y/N'` | The hint string shown when `ShowValidOptions` is `true`. Purely cosmetic -- it does not constrain parsing. |
| `ShowResponse` | boolean | `true` | After a valid answer, echo `  --> Your response: <Value>`. |
| `ID` | string | `'Undefined'` | A free-form identifier. Stored but not used by the library. |
| `Name` | string | `'Default'` | A free-form name. Stored but not used by the library. |
| `ValidationRegex` | string \| boolean | `false` | Intended to constrain valid responses by regex. See [ValidationRegex limitation](#validationregex-limitation) below -- it is not functional in the current source. |

### Properties

| Property | Type | Description |
|----------|------|-------------|
| `Options` | object | The merged options (defaults overlaid with constructor input). |
| `Response` | string \| undefined | The raw text the user typed, or `Default` if Enter was pressed. `undefined` until the question runs. |
| `Value` | any \| undefined | The parsed answer derived from `Response` according to `Type`. `undefined` until a valid answer is parsed. |

### Methods

#### ExecutePromise()

Ask the question and return a Promise that resolves once a valid answer is given.

```javascript
await _Question.ExecutePromise();
let tmpAnswer = _Question.Value;
```

**Returns:** `Promise` -- resolves with no value. Read the answer from `.Value` (and the raw text from `.Response`) after it settles.

The Promise resolves only after the answer validates and parses successfully. Invalid input re-asks within the same call and does not resolve.

#### Execute(fCallback)

The callback form behind `ExecutePromise()`. Creates a `readline` interface on `process.stdin`/`process.stdout`, asks the question, handles help / defaults / validation / parsing, and invokes `fCallback` once a valid answer is given.

```javascript
_Question.Execute(
	() =>
	{
		console.log(_Question.Value);
	});
```

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `fCallback` | function | No | Called (with no arguments) after a valid answer. A non-function value is replaced with a no-op. |

On a help request, or an invalid/unparseable answer, `Execute()` closes the current readline interface and calls itself again to re-ask -- the callback fires only on success.

#### BuildQuestionText()

Build the prompt string from `Options`. Returns `Question`, optionally followed by the valid-options and/or default hints, then `? `.

```javascript
new libConsoleQuery({ Question: 'Continue' }).BuildQuestionText();
// => "Continue (default: Y)? "

new libConsoleQuery({ Question: 'Pick', ShowValidOptions: true, ShowDefault: false, ValidOptions: 'A/B/C' }).BuildQuestionText();
// => "Pick (A/B/C)? "
```

**Returns:** `string`.

The hint combinations are:

| `ShowValidOptions` | `ShowDefault` | Appended before `? ` |
|--------------------|---------------|----------------------|
| `true` | `true` | ` (valid: <ValidOptions>) (default: <Default>)` |
| `true` | `false` | ` (<ValidOptions>)` |
| `false` | `true` | ` (default: <Default>)` |
| `false` | `false` | _(nothing)_ |

#### ParseResponse()

Convert `.Response` into `.Value` based on `Type`. Called internally by `Execute()`.

| `Type` | Behavior | Returns |
|--------|----------|---------|
| `YesNo` | Upper-cases `Response`; sets `.Value = true` for `Y`/`YES`/`YA`/`T`/`TRUE`/`1`, `false` for `N`/`NO`/`NOPE`/`F`/`FALSE`/`0`. | `true` on a recognized word, `false` otherwise |
| `String` | `.Value = Response`. | `true` |
| `Integer` | `.Value = parseInt(Response, 10)`. | `false` if the result is `NaN`, else `true` |
| `Float` | `.Value = parseFloat(Response)`. | `false` if the result is `NaN`, else `true` |

**Returns:** `boolean` -- whether parsing succeeded. A `false` result causes `Execute()` to print a notice and re-ask. (If `Type` is none of the four known values, no branch runs and the method returns `undefined`.)

#### ValidateResponse()

Intended to validate `.Response` against `ValidationRegex` before parsing. **In the current source it always returns `true`** -- see the limitation below.

**Returns:** `boolean`.

#### DisplayHelp(pReadLineInterface)

Write the `Help` text (followed by a blank line) to the supplied readline interface. Called internally when the user types `?` or `help`.

#### DisplayResponse(pReadLineInterface)

Write `  --> Your response: <Value>` to the supplied readline interface. Called internally after a valid answer when `ShowResponse` is `true`.

### Interaction Flow

For each `Execute()` call:

1. A `readline` interface is opened on `process.stdin` / `process.stdout`.
2. `BuildQuestionText()` produces the prompt; the user is asked.
3. If `AllowHelp` and the input is `?` or `help`: print `Help`, close, and re-ask.
4. If the input is empty: `Response = Default`. Otherwise `Response = <typed text>`.
5. `ValidateResponse()` then `ParseResponse()` run.
6. If validation fails: print an "unrecognized" notice, close, and re-ask.
7. If parsing fails: print a "not a valid response" notice, close, and re-ask.
8. On success: optionally echo the response (`ShowResponse`), print a blank separator line, close, and call the callback (resolving the Promise).

### ValidationRegex limitation

`ValidationRegex` is accepted as an option, but it does not function in the current source:

- `ValidateResponse()` reads `this.ValidationRegex`, but the option is stored on `this.Options.ValidationRegex`. `this.ValidationRegex` is never assigned, so the regex branch is never entered and the method always returns `true`.
- Inside that branch the code also calls `tmpValidationRegex.Match(this.Response)`. JavaScript `RegExp` has no `Match` method (it is `test`), so the branch would throw if it were ever reached.

Until this is fixed in source, do not rely on `ValidationRegex` to restrict input. For required validation today, use `Type` (e.g. `Integer`/`Float` re-ask on non-numeric input, `YesNo` re-asks on unrecognized words).

---

## Class: Merquerial

A small demonstration runner, and the package `main`.

```javascript
const libMerquerial = require('merquerial');
let tmpRunner = new libMerquerial();
await tmpRunner.Execute();
```

### Constructor

Takes no parameters. It builds a fixed `Questions` array of four `ConsoleQuery` instances:

| Question | Type |
|----------|------|
| `Do you like olives?` | `YesNo` (default) |
| `Who is your daddy?` | `String` |
| `Do you like bears?` | `YesNo` (default) |
| `Do you like children?` | `YesNo` (default) |

These questions are hardcoded in source; the class does not load them from a file or accept a list.

### Properties

| Property | Type | Description |
|----------|------|-------------|
| `Questions` | array | The fixed list of `ConsoleQuery` instances built in the constructor. |

### Methods

#### Execute()

Ask every question in `Questions` in order, awaiting each one's `ExecutePromise()`.

**Returns:** `Promise` (the method is `async`).

> For real questionnaires, build your own array of `ConsoleQuery` instances and loop over them as shown in [Usage Patterns](examples.md). `Merquerial` is an example, not a configurable engine.

---

## Class: MerquerialLog

A standalone logger that writes to `console.log`. It is **not** referenced by `ConsoleQuery` or `Merquerial` -- use it on its own when you want simple leveled console output.

```javascript
const libMerquerialLog = require('merquerial/source/Merquerial-Log.js');
let _Log = new libMerquerialLog({ Form: 'MyApp' });

_Log.info('Started');
// [INFO] (MyApp) Started
```

### Constructor

```javascript
new libMerquerialLog(pSettings);
```

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `pSettings` | object | Yes (in practice) | Stored as `_Instance._Settings`. Each log line includes `_Settings.Form` in parentheses, so a `Form` property is expected. |

### Logging Methods

Each method writes a line of the form `[<LEVEL>] (<Form>) <message>`. If a second argument is supplied, it is `JSON.stringify`-ed (indented 4 spaces) and printed on the next line.

| Method | Level tag |
|--------|-----------|
| `trace(pMessage, pObject)` | `TRACE` |
| `debug(pMessage, pObject)` | `DEBUG` |
| `info(pMessage, pObject)` | `INFO` |
| `warning(pMessage, pObject)` | `WARNING` |
| `error(pMessage, pObject)` | `ERROR` |

```javascript
_Log.error('Bad input', { field: 'age', value: 'abc' });
// [ERROR] (MyApp) Bad input
// {
//     "field": "age",
//     "value": "abc"
// }
```

#### writeConsole(pLevel, pMessage, pObject)

The shared writer the leveled methods call. `pLevel` is the level tag, `pMessage` the text, and `pObject` an optional value to serialize.

### Timing Helpers

| Method | Returns | Description |
|--------|---------|-------------|
| `getTimeStamp()` | number | Current time as a millisecond epoch (`+new Date()`). |
| `getTimeDelta(pTimeStamp)` | number | Milliseconds elapsed between `pTimeStamp` and now. |
| `logTime(pMessage)` | (logs) | Logs `<message>: <full date string>` at `INFO`. `pMessage` defaults to `'Time'`. |
| `logTimeDelta(pTimeStamp, pMessage)` | (logs) | Logs `<message> (<elapsed>ms)` at `INFO`. `pMessage` defaults to `'Time Measurement'`. |

```javascript
let tmpStart = _Log.getTimeStamp();
// ... do work ...
_Log.logTimeDelta(tmpStart, 'Import');
// [INFO] (MyApp) Import (42ms)
```
