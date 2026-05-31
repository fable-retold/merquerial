const libReadline = require('readline');

const DefaultOptions = (
{
	"Type": "YesNo",    	// The question type
		/*
		 * Acceptable Values (case insensitive):
		 *   String
		 *   YesNo
		 *   Integer
		 *   Float
		 */
	"ID": "Undefined",
	"Name": "Default",

	"Question": "This is the DEFAULT question",
	"Default": "Y",

	"AllowHelp": true,
	"ShowValidOptions": false,
	"ShowDefault": true,
	"ShowResponse": true,

	"ValidationRegex": false,

	"Help": "No help text provided.",
	"ValidOptions": "Y/N"
});

class ConsoleQuery
{
	constructor (pOptions)
	{
		this.Options = typeof(pOptions) === 'object' ? pOptions : {};

		let tmpDefaultProperties = Object.keys(DefaultOptions);
		for (let i = 0; i < tmpDefaultProperties.length; i++)
		{
			let tmpPropertyName = tmpDefaultProperties[i];
			if (!this.Options.hasOwnProperty(tmpPropertyName))
			{
				this.Options[tmpPropertyName] = JSON.parse(JSON.stringify(DefaultOptions[tmpPropertyName]));
			}
		}

		this.Response = undefined;
		this.Value = undefined;
	}

	BuildQuestionText()
	{
		let tmpQuestionText = `${this.Options.Question}`;

		if (this.Options.ShowValidOptions && this.Options.ShowDefault)
		{
			tmpQuestionText = `${tmpQuestionText} (valid: ${this.Options.ValidOptions}) (default: ${this.Options.Default})`;
		}
		else if (this.Options.ShowValidOptions)
		{
			tmpQuestionText = `${tmpQuestionText} (${this.Options.ValidOptions})`;
		}
		else if (this.Options.ShowDefault)
		{
			tmpQuestionText = `${tmpQuestionText} (default: ${this.Options.Default})`;
		}

		tmpQuestionText = `${tmpQuestionText}? `;

		return tmpQuestionText;
	}

	DisplayHelp(pReadLineInterface)
	{
		pReadLineInterface.write(`${this.Options.Help}\n\n`);
	}

	DisplayResponse(pReadLineInterface)
	{
		pReadLineInterface.write(`  --> Your response: ${this.Value}\n`);
	}

	ValidateResponse()
	{
		if (this.Options.ValidationRegex && this.Options.ValidationRegex.length > 0)
		{
			// Check the regular expression
			let tmpValidationRegex = new RegExp(this.Options.ValidationRegex);

			if (tmpValidationRegex.test(this.Response))
			{
				return true;
			}
			else
			{
				return false;
			}
		}

		return true;
	}

	ParseResponse()
	{
		switch(this.Options.Type)
		{
			case "YesNo":
				switch(this.Response.toUpperCase())
				{
					case 'Y':
					case 'YES':
					case 'YA':
					case 'T':
					case 'TRUE':
					case '1':
						this.Value = true;
						return true;

					case 'N':
					case 'NO':
					case 'NOPE':
					case 'F':
					case 'FALSE':
					case '0':
						this.Value = false;
						return true;

					default:
						return false;
				}
				break;

			case "String":
				this.Value = this.Response;
				return true;
			
			case "Integer":
				try
				{
					this.Value = parseInt(this.Response, 10);
					if (isNaN(this.Value))
					{
						return false;
					}
					return true;
				}
				catch
				{
					return false;
				}
		
			case "Float":
				try
				{
					this.Value = parseFloat(this.Response);
					if (isNaN(this.Value))
					{
						return false;
					}
					return true;
				}
				catch
				{
					return false;
				}
			}
	}

	ExecutePromise ()
	{
		return new Promise(
			(fResolve) =>
			{
				return this.Execute(fResolve);
			});
	}

	// Execute the question
	Execute (fCallback)
	{
		let tmpCallback = (typeof(fCallback) === 'function') ? fCallback : ()=>{};
		const tmpReadLineInterface = // (typeof(pReadLineInterface) != 'undefined') ? pReadLineInterface :
			libReadline.createInterface(
			{
				input: process.stdin,
				output: process.stdout
			});

		tmpReadLineInterface.question(this.BuildQuestionText(),
			(pResponse) =>
			{
				// Help is in its own section so it doesn't exclude "?" and "help" from being valid string
				// responses if help has been disabled.
				if (this.Options.AllowHelp && (pResponse == '?' || pResponse == 'help'))
				{
					this.DisplayHelp(tmpReadLineInterface);
					tmpReadLineInterface.close();
					return this.Execute(tmpCallback);
				}

				if (!pResponse)
				{
					// Set the response to the default if nothing was entered
					this.Response = this.Options.Default;
				}
				else
				{
					// Set the response to what the user entered
					this.Response = pResponse;
				}


				// Validate the response, and parse it into a value
				let tmpValidResponse = this.ValidateResponse();
				let tmpParsedSuccessfully = this.ParseResponse();
				if (!tmpValidResponse)
				{
					tmpReadLineInterface.write(`  --> Your response of "${this.Response}" is unrecognized..."\n\n`);
					tmpReadLineInterface.close();
					return this.Execute(tmpCallback);
				}
				else if (!tmpParsedSuccessfully)
				{
					tmpReadLineInterface.write(`  --> Your response of "${this.Response}" not a valid response to a ..."\n\n`);
					tmpReadLineInterface.close();
					return this.Execute(tmpCallback);
				}
				else 
				{
					if (this.Options.ShowResponse)
					{
						this.DisplayResponse(tmpReadLineInterface);
					}

					// Create a separator maybe....
					tmpReadLineInterface.write(`\n`);
					tmpReadLineInterface.close();

					return tmpCallback();
				}
			});
	}
}

module.exports = ConsoleQuery;