// My imports
const fs = require('fs');
function spell(word)
{
    result = '';
    for(i in word)
    {
        result = result + i + " ";
    }
    return result;
}

let speechOutput;
let reprompt;
let instructions =
	"you can ask me to \
                tell a new word or you can ask 'What is the spelling \
                of 'Philanthropist' to learn the spelling of \
                'Philanthropist'.";

let welcomeOutput = 'Welcome to Word Explorer, ' + instructions;

let welcomeReprompt = "Sorry I didn't get you. " + instructions;

('use strict');
const Alexa = require('alexa-sdk');
const APP_ID = undefined; // TODO replace with your app ID (OPTIONAL).
speechOutput = '';
const handlers = {
	LaunchRequest: function() {
		this.emit(':ask', welcomeOutput, welcomeReprompt);
	},
	'AMAZON.HelpIntent': function() {
		speechOutput = instructions;
		reprompt = '';
		this.emit(':ask', speechOutput, reprompt);
	},
	'AMAZON.CancelIntent': function() {
		speechOutput = 'Okay, Cancelling.';
		this.emit(':tell', speechOutput);
	},
	'AMAZON.StopIntent': function() {
		speechOutput = 'Okay, Stopping.';
		this.emit(':tell', speechOutput);
	},
	SessionEndedRequest: function() {
		speechOutput = '';
		//this.emit(':saveState', true);//uncomment to save attributes to db on session end
		this.emit(':tell', speechOutput);
	},
	'AMAZON.NavigateHomeIntent': function() {
		speechOutput = '';

		//any intent slot variables are listed here for convenience

		//Your custom intent handling goes here
		speechOutput = 'Anything else?';
		this.emit(':ask', speechOutput, speechOutput);
	},
	GetWord: function() {
		speechOutput = '';
		wordList = fs.readFileSync('words.txt').toString().split("\n");
        word_list_length = wordList.length;
        generated_index = Math.floor(Math.random() * 10000000) % word_list_length;
        console.log("RRC Index " + generated_index);
        // console.log(wordList);
        random_word = wordList[generated_index];
		speechOutput = 'Chosen random word is '+ random_word.toUpperCase();
		this.emit(':ask', speechOutput, speechOutput);
	},
	SpellingIntent: function() {
		speechOutput = '';

		//any intent slot variables are listed here for convenience

		let wordSlotRaw = this.event.request.intent.slots.word.value;
		console.log(wordSlotRaw);
		let wordSlot = resolveCanonical(this.event.request.intent.slots.word);
		console.log(wordSlot);

		//Your custom intent handling goes here
		speechOutput =
			'This is a place holder response for the intent named SpellingIntent. This intent has one slot, which is word. Anything else?';
		this.emit(':ask', speechOutput, speechOutput);
	},
	AboutIntent: function() {
		speechOutput = '';

		//any intent slot variables are listed here for convenience

		//Your custom intent handling goes here
		speechOutput = 'I was created by Rajdeep Roy Chowdhury. Anything else?';
		this.emit(':ask', speechOutput, speechOutput);
	},
	Unhandled: function() {
		speechOutput = "The skill didn't quite understand what you wanted.  Do you want to try something else?";
		this.emit(':ask', speechOutput, speechOutput);
	}
};

exports.handler = (event, context) => {
	const alexa = Alexa.handler(event, context);
	alexa.appId = APP_ID;
	// To enable string internationalization (i18n) features, set a resources object.
	//alexa.resources = languageStrings;
	alexa.registerHandlers(handlers);
	//alexa.dynamoDBTableName = 'DYNAMODB_TABLE_NAME'; //uncomment this line to save attributes to DB
	alexa.execute();
};

//    END of Intent Handlers {} ========================================================================================
// 3. Helper Function  =================================================================================================

function resolveCanonical(slot) {
	//this function looks at the entity resolution part of request and returns the slot value if a synonyms is provided
	let canonical;
	try {
		canonical = slot.resolutions.resolutionsPerAuthority[0].values[0].value.name;
	} catch (err) {
		console.log(err.message);
		canonical = slot.value;
	}
	return canonical;
}

function delegateSlotCollection() {
	console.log('in delegateSlotCollection');
	console.log('current dialogState: ' + this.event.request.dialogState);
	if (this.event.request.dialogState === 'STARTED') {
		console.log('in Beginning');
		let updatedIntent = null;
		// updatedIntent=this.event.request.intent;
		//optionally pre-fill slots: update the intent object with slot values for which
		//you have defaults, then return Dialog.Delegate with this updated intent
		// in the updatedIntent property
		//this.emit(":delegate", updatedIntent); //uncomment this is using ASK SDK 1.0.9 or newer

		//this code is necessary if using ASK SDK versions prior to 1.0.9
		if (this.isOverridden()) {
			return;
		}
		this.handler.response = buildSpeechletResponse({
			sessionAttributes: this.attributes,
			directives: getDialogDirectives('Dialog.Delegate', updatedIntent, null),
			shouldEndSession: false
		});
		this.emit(':responseReady', updatedIntent);
	} else if (this.event.request.dialogState !== 'COMPLETED') {
		console.log('in not completed');
		// return a Dialog.Delegate directive with no updatedIntent property.
		//this.emit(":delegate"); //uncomment this is using ASK SDK 1.0.9 or newer

		//this code necessary is using ASK SDK versions prior to 1.0.9
		if (this.isOverridden()) {
			return;
		}
		this.handler.response = buildSpeechletResponse({
			sessionAttributes: this.attributes,
			directives: getDialogDirectives('Dialog.Delegate', null, null),
			shouldEndSession: false
		});
		this.emit(':responseReady');
	} else {
		console.log('in completed');
		console.log('returning: ' + JSON.stringify(this.event.request.intent));
		// Dialog is now complete and all required slots should be filled,
		// so call your normal intent handler.
		return this.event.request.intent;
	}
}

function randomPhrase(array) {
	// the argument is an array [] of words or phrases
	let i = 0;
	i = Math.floor(Math.random() * array.length);
	return array[i];
}

function isSlotValid(request, slotName) {
	let slot = request.intent.slots[slotName];
	//console.log("request = "+JSON.stringify(request)); //uncomment if you want to see the request
	let slotValue;

	//if we have a slot, get the text and store it into speechOutput
	if (slot && slot.value) {
		//we have a value in the slot
		slotValue = slot.value.toLowerCase();
		return slotValue;
	} else {
		//we didn't get a value in the slot.
		return false;
	}
}

//These functions are here to allow dialog directives to work with SDK versions prior to 1.0.9
//will be removed once Lambda templates are updated with the latest SDK

function createSpeechObject(optionsParam) {
	if (optionsParam && optionsParam.type === 'SSML') {
		return {
			type: optionsParam.type,
			ssml: optionsParam['speech']
		};
	} else {
		return {
			type: optionsParam.type || 'PlainText',
			text: optionsParam['speech'] || optionsParam
		};
	}
}

function buildSpeechletResponse(options) {
	let alexaResponse = {
		shouldEndSession: options.shouldEndSession
	};

	if (options.output) {
		alexaResponse.outputSpeech = createSpeechObject(options.output);
	}

	if (options.reprompt) {
		alexaResponse.reprompt = {
			outputSpeech: createSpeechObject(options.reprompt)
		};
	}

	if (options.directives) {
		alexaResponse.directives = options.directives;
	}

	if (options.cardTitle && options.cardContent) {
		alexaResponse.card = {
			type: 'Simple',
			title: options.cardTitle,
			content: options.cardContent
		};

		if (options.cardImage && (options.cardImage.smallImageUrl || options.cardImage.largeImageUrl)) {
			alexaResponse.card.type = 'Standard';
			alexaResponse.card['image'] = {};

			delete alexaResponse.card.content;
			alexaResponse.card.text = options.cardContent;

			if (options.cardImage.smallImageUrl) {
				alexaResponse.card.image['smallImageUrl'] = options.cardImage.smallImageUrl;
			}

			if (options.cardImage.largeImageUrl) {
				alexaResponse.card.image['largeImageUrl'] = options.cardImage.largeImageUrl;
			}
		}
	} else if (options.cardType === 'LinkAccount') {
		alexaResponse.card = {
			type: 'LinkAccount'
		};
	} else if (options.cardType === 'AskForPermissionsConsent') {
		alexaResponse.card = {
			type: 'AskForPermissionsConsent',
			permissions: options.permissions
		};
	}

	let returnResult = {
		version: '1.0',
		response: alexaResponse
	};

	if (options.sessionAttributes) {
		returnResult.sessionAttributes = options.sessionAttributes;
	}
	return returnResult;
}

function getDialogDirectives(dialogType, updatedIntent, slotName) {
	let directive = {
		type: dialogType
	};

	if (dialogType === 'Dialog.ElicitSlot') {
		directive.slotToElicit = slotName;
	} else if (dialogType === 'Dialog.ConfirmSlot') {
		directive.slotToConfirm = slotName;
	}

	if (updatedIntent) {
		directive.updatedIntent = updatedIntent;
	}
	return [ directive ];
}
