# Usage Patterns

Working examples built on the verified `ConsoleQuery` behavior. Each one constructs a question (or a list of questions), runs it, and reads the typed answer from `.Value`.

```javascript
const libConsoleQuery = require('merquerial/source/Console-Query.js');
```

---

## Yes/No Confirmation

The default `Type` is `YesNo`, so a confirmation prompt needs only the question text. The answer parses to a `Boolean`:

```javascript
async function confirm()
{
	let _Proceed = new libConsoleQuery({ Question: 'Proceed with the import' });

	await _Proceed.ExecutePromise();

	if (_Proceed.Value)
	{
		console.log('Importing...');
	}
	else
	{
		console.log('Cancelled.');
	}
}

confirm();
```

```
Proceed with the import (default: Y)? yes
  --> Your response: true

Importing...
```

`yes`, `y`, `ya`, `t`, `true`, and `1` all parse to `true`; `no`, `n`, `nope`, `f`, `false`, and `0` parse to `false`. Matching is case-insensitive. Anything else re-asks the question.

---

## String Input with a Default

Set `Type: 'String'` to capture text verbatim. Supply your own `Default` so pressing Enter is meaningful:

```javascript
let _Environment = new libConsoleQuery(
	{
		Question: 'Which environment',
		Type: 'String',
		Default: 'development'
	});

await _Environment.ExecutePromise();

console.log(`Target: ${_Environment.Value}`);
```

```
Which environment (default: development)? 
  --> Your response: development

Target: development
```

Pressing Enter with no input sets `.Response` to `Default`, which then parses straight through to `.Value` for a string question.

---

## Numeric Input

`Integer` and `Float` parse the response with `parseInt` / `parseFloat`. A non-numeric answer re-asks rather than producing `NaN`:

```javascript
let _Port = new libConsoleQuery(
	{
		Question: 'Server port',
		Type: 'Integer',
		Default: '8080'
	});

await _Port.ExecutePromise();

console.log(typeof _Port.Value, _Port.Value); // "number" 8080
```

```
Server port (default: 8080)? abc
  --> Your response of "abc" not a valid response...

Server port (default: 8080)? 9090
  --> Your response: 9090

```

Floats work the same way:

```javascript
let _Ratio = new libConsoleQuery({ Question: 'Scale factor', Type: 'Float', Default: '1.0' });

await _Ratio.ExecutePromise();
// .Value is a Number, e.g. 1.5
```

---

## Hiding the Hints

By default the prompt shows `(default: ...)`. Turn it off with `ShowDefault: false` for a bare question:

```javascript
let _Name = new libConsoleQuery(
	{
		Question: 'Your name',
		Type: 'String',
		ShowDefault: false
	});

await _Name.ExecutePromise();
```

```
Your name? Steven
  --> Your response: Steven

```

To show a list of valid options instead, enable `ShowValidOptions` and set `ValidOptions`:

```javascript
let _Mode = new libConsoleQuery(
	{
		Question: 'Pick a mode',
		Type: 'String',
		ShowValidOptions: true,
		ShowDefault: false,
		ValidOptions: 'fast/safe/dry-run'
	});

await _Mode.ExecutePromise();
```

```
Pick a mode (fast/safe/dry-run)? safe
  --> Your response: safe

```

> `ValidOptions` is cosmetic -- it is shown in the prompt but does not restrict what `String` accepts. Any text is taken as the answer.

---

## Inline Help

While `AllowHelp` is on (the default), typing `?` or `help` prints the `Help` text and re-asks:

```javascript
let _Overwrite = new libConsoleQuery(
	{
		Question: 'Overwrite existing files',
		Type: 'YesNo',
		Help: 'Choosing Yes replaces files already on disk. This cannot be undone.'
	});

await _Overwrite.ExecutePromise();
```

```
Overwrite existing files (default: Y)? help
Choosing Yes replaces files already on disk. This cannot be undone.

Overwrite existing files (default: Y)? n
  --> Your response: false

```

If you need `?` or `help` to be valid string answers (for example, a free-text field), disable help with `AllowHelp: false`.

---

## Quiet Mode

Suppress the echoed answer with `ShowResponse: false` when you do not want the prompt to repeat the parsed value back:

```javascript
let _Token = new libConsoleQuery(
	{
		Question: 'Paste your token',
		Type: 'String',
		ShowResponse: false,
		ShowDefault: false
	});

await _Token.ExecutePromise();
// The value is still on _Token.Value; it just is not echoed to the console.
```

> Merquerial does not mask input -- the typed characters are visible on the terminal. `ShowResponse: false` only suppresses the `  --> Your response: ...` echo line.

---

## Running a Sequence

Because each question is a Promise, ask several in order with a loop. Collect the answers afterward from each instance's `.Value`:

```javascript
async function survey()
{
	let _Questions =
	[
		new libConsoleQuery({ Question: 'What is your name', Type: 'String', ShowDefault: false }),
		new libConsoleQuery({ Question: 'How old are you', Type: 'Integer', Default: '0' }),
		new libConsoleQuery({ Question: 'Do you like bears' })
	];

	for (let i = 0; i < _Questions.length; i++)
	{
		await _Questions[i].ExecutePromise();
	}

	return (
	{
		Name: _Questions[0].Value,
		Age: _Questions[1].Value,
		LikesBears: _Questions[2].Value
	});
}

survey().then(
	(pAnswers) =>
	{
		console.log(pAnswers);
		// { Name: 'Steven', Age: 47, LikesBears: true }
	});
```

This is the same loop the bundled `Merquerial` demo class uses over its four fixed questions.

---

## Building Questions from Data

Drive the prompts from a plain array of option objects. This keeps the question definitions in one place and the run loop generic:

```javascript
const libConsoleQuery = require('merquerial/source/Console-Query.js');

let _Definitions =
[
	{ Key: 'name',    Question: 'Project name',     Type: 'String',  ShowDefault: false },
	{ Key: 'port',    Question: 'Listen port',      Type: 'Integer', Default: '3000' },
	{ Key: 'verbose', Question: 'Verbose logging',  Type: 'YesNo',   Default: 'N' }
];

async function gather(pDefinitions)
{
	let tmpAnswers = {};

	for (let i = 0; i < pDefinitions.length; i++)
	{
		let tmpDefinition = pDefinitions[i];
		let _Question = new libConsoleQuery(tmpDefinition);

		await _Question.ExecutePromise();

		tmpAnswers[tmpDefinition.Key] = _Question.Value;
	}

	return tmpAnswers;
}

gather(_Definitions).then(
	(pConfig) =>
	{
		console.log(pConfig);
		// { name: 'retold', port: 3000, verbose: false }
	});
```

> `ConsoleQuery` ignores any extra properties on the options object (here, `Key`), so it is safe to keep your own bookkeeping fields alongside the recognized options.

---

## Callback Style

If you are not in an `async` function, use the callback form directly:

```javascript
let _Question = new libConsoleQuery({ Question: 'Continue' });

_Question.Execute(
	() =>
	{
		console.log(`Answer: ${_Question.Value}`);
	});
```

`ExecutePromise()` is just a thin Promise wrapper around `Execute(fCallback)`.

---

## Logging Alongside Prompts

`MerquerialLog` is a separate, self-contained logger -- it is not connected to the query classes, but you can use it next to them for simple leveled console output and timing:

```javascript
const libConsoleQuery = require('merquerial/source/Console-Query.js');
const libMerquerialLog = require('merquerial/source/Merquerial-Log.js');

let _Log = new libMerquerialLog({ Form: 'Setup' });

async function run()
{
	let tmpStart = _Log.getTimeStamp();

	let _Confirm = new libConsoleQuery({ Question: 'Run setup now' });
	await _Confirm.ExecutePromise();

	if (_Confirm.Value)
	{
		_Log.info('Setup confirmed', { value: _Confirm.Value });
		// ... do work ...
		_Log.logTimeDelta(tmpStart, 'Setup');
	}
	else
	{
		_Log.warning('Setup skipped by user');
	}
}

run();
```

```
Run setup now (default: Y)? y
  --> Your response: true

[INFO] (Setup) Setup confirmed
{
    "value": true
}
[INFO] (Setup) Setup (1083ms)
```
