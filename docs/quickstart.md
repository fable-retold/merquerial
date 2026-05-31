# Quickstart

Ask your first console question in a few lines.

## Install

```bash
npm install merquerial
```

Merquerial has no runtime dependencies -- it uses only Node's built-in `readline`.

## Ask a Yes/No Question

`YesNo` is the default question type, so the only option you must supply is the `Question` text:

```javascript
const libConsoleQuery = require('merquerial/source/Console-Query.js');

async function run()
{
	let _Question = new libConsoleQuery({ Question: 'Do you like olives' });

	await _Question.ExecutePromise();

	console.log(`Parsed value: ${_Question.Value}`);
}

run();
```

When you run this, Merquerial prints the prompt and waits for input:

```
Do you like olives (default: Y)? y
  --> Your response: true

Parsed value: true
```

A few things happened automatically:

- The `? ` and the `(default: Y)` hint were appended to your question text.
- The typed `y` was parsed into the boolean `true` on `.Value`.
- The parsed answer was echoed back (`  --> Your response: ...`).

## Ask for a String

Set `Type: 'String'` to capture text verbatim:

```javascript
let _Name = new libConsoleQuery({ Question: 'What is your name', Type: 'String' });

await _Name.ExecutePromise();

console.log(`Hello, ${_Name.Value}!`);
```

```
What is your name (default: Y)? Steven
  --> Your response: Steven

Hello, Steven!
```

> Note the default still shows `Y` here -- `Default` is `'Y'` for every type unless you override it. For a string prompt you will usually want to set your own `Default`, or hide it with `ShowDefault: false`.

## Ask for a Number

`Integer` and `Float` parse the response with `parseInt` / `parseFloat`:

```javascript
let _Count = new libConsoleQuery(
	{
		Question: 'How many widgets',
		Type: 'Integer',
		Default: '1',
		ShowDefault: true
	});

await _Count.ExecutePromise();

console.log(_Count.Value + 1); // .Value is a Number
```

If the user types something that is not a number, Merquerial prints a short notice and re-asks the same question -- it never resolves with `NaN`.

## Use a Default

Pressing Enter with no input uses the `Default` option as the response:

```javascript
let _Confirm = new libConsoleQuery(
	{
		Question: 'Proceed',
		Type: 'YesNo',
		Default: 'Y'
	});

await _Confirm.ExecutePromise();
// Pressing Enter -> .Response = 'Y' -> .Value = true
```

## Offer Help

While `AllowHelp` is on (the default), typing `?` or `help` prints the `Help` string and re-asks:

```javascript
let _Question = new libConsoleQuery(
	{
		Question: 'Enable verbose logging',
		Type: 'YesNo',
		Help: 'Verbose logging writes every step to the console. Choose No for normal output.'
	});

await _Question.ExecutePromise();
```

```
Enable verbose logging (default: Y)? ?
Verbose logging writes every step to the console. Choose No for normal output.

Enable verbose logging (default: Y)? n
  --> Your response: false

```

## Run a Sequence of Questions

Because each question is a Promise, ask several in order with a simple loop:

```javascript
const libConsoleQuery = require('merquerial/source/Console-Query.js');

async function survey()
{
	let _Questions =
	[
		new libConsoleQuery({ Question: 'What is your name', Type: 'String' }),
		new libConsoleQuery({ Question: 'How old are you', Type: 'Integer' }),
		new libConsoleQuery({ Question: 'Do you like bears' })
	];

	for (let i = 0; i < _Questions.length; i++)
	{
		await _Questions[i].ExecutePromise();
	}

	console.log(`Name: ${_Questions[0].Value}`);
	console.log(`Age: ${_Questions[1].Value}`);
	console.log(`Likes bears: ${_Questions[2].Value}`);
}

survey();
```

This is the same pattern the bundled `Merquerial` demo class uses internally.

## Run the Bundled Demo

The package `main` is the `Merquerial` demo class, which asks four fixed example questions. The repository includes a debug harness that runs it:

```javascript
// debug/Harness.js
const libMerquerial = require('../source/Merquerial.js');

let tmpQuestionnaire = new libMerquerial();

tmpQuestionnaire.Execute();
```

```bash
node debug/Harness.js
```

Use the demo to see the prompts in action, then build your own runner over `ConsoleQuery` for real questionnaires.

## Next Steps

- [API Reference](api.md) -- every option, property, and method
- [Usage Patterns](examples.md) -- typed prompts, defaults, help, and sequences
