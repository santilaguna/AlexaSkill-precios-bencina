/* *
 * This sample demonstrates handling intents from an Alexa skill using the Alexa Skills Kit SDK (v2).
 * Please visit https://alexa.design/cookbook for additional examples on implementing slots, dialog management,
 * session persistence, api calls, and more.
 * */
const Alexa = require('ask-sdk-core');
const axios = require('axios');

const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
    },
    handle(handlerInput) {
        const speakOutput = 'Bienvenido a la skill de precios de bencina';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .addDelegateDirective({
                name: 'PreguntarPrecioBencina',
                confirmationStatus: 'NONE',
                slots: {}
            })
            .getResponse();
    }
};

const PreguntarPrecioBencinaIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'PreguntarPrecioBencina';
    },
    async handle(handlerInput) {
        
        const {requestEnvelope, responseBuilder} = handlerInput;
        const {intent} = requestEnvelope.request;

        const tipo = Alexa.getSlotValue(requestEnvelope, 'tipo');
        let comuna_uno = Alexa.getSlotValue(requestEnvelope, 'comuna_uno');
        let comuna_dos = Alexa.getSlotValue(requestEnvelope, 'comuna_dos');
        let comuna_tres = Alexa.getSlotValue(requestEnvelope, 'comuna_tres');
        
        let query_params = `?bencina=${tipo}&comuna=${comuna_uno}`
        let speakOutput = `Buscando precio de bencina ${tipo} en ${comuna_uno}`;
        
        if (comuna_dos !== "" && comuna_dos !== undefined) {
            query_params += `&comuna2=${comuna_dos}`
            speakOutput += ", " + comuna_dos
        }
        if (comuna_tres !== "" && comuna_tres !== undefined) {
            query_params += `&comuna3=${comuna_tres}`
            speakOutput += " y " + comuna_tres
        }
        
        let urlAPI = encodeURI("https://533khpvgovaulwe3acqrqjpf5y0mubbw.lambda-url.us-east-1.on.aws" + query_params);
        console.log("URL:", urlAPI)
        let body = {}
        var config = {
            timeout: 7000, // timeout api call before we reach Alexa's 8 sec timeout, or set globally via axios.defaults.timeout
            //headers: {'Accept': 'application/sparql-results+json'}
        };
        
        let res = "";
        let data = "";
        // res = await axios.get("https://api.coindesk.com/v1/bpi/currentprice.json", config);
        // console.log(res)
        try {
            res = await axios.get(urlAPI, config);
            console.log(res)
            data += "Alternativas:\n"
            for (const x of res.data) {
                data += `En ${x.distribuidor} ${x.direccion} precio ${x.precio}\n`;
            }
        } catch (error) {
            console.log(error); 
            speakOutput = `~~~~ Error en api: ${JSON.stringify(error)}`
          }

        //const data = JSON.parse(response);
        
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .speak(data)
            //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
            .getResponse();
    }
};

const HelpIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.HelpIntent';
    },
    handle(handlerInput) {
        const speakOutput = 'Hola di un tipo de bencina y una comuna para saber sus precios';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

const CancelAndStopIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && (Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.CancelIntent'
                || Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.StopIntent');
    },
    handle(handlerInput) {
        const speakOutput = 'Goodbye!';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .getResponse();
    }
};
/* *
 * FallbackIntent triggers when a customer says something that doesn’t map to any intents in your skill
 * It must also be defined in the language model (if the locale supports it)
 * This handler can be safely added but will be ingnored in locales that do not support it yet 
 * */
const FallbackIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.FallbackIntent';
    },
    handle(handlerInput) {
        const speakOutput = 'Lo sentimos, no pudimos procesar tu consulta vuelve a intentarlo';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};
/* *
 * SessionEndedRequest notifies that a session was ended. This handler will be triggered when a currently open 
 * session is closed for one of the following reasons: 1) The user says "exit" or "quit". 2) The user does not 
 * respond or says something that does not match an intent defined in your voice model. 3) An error occurs 
 * */
const SessionEndedRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'SessionEndedRequest';
    },
    handle(handlerInput) {
        console.log(`~~~~ Session ended: ${JSON.stringify(handlerInput.requestEnvelope)}`);
        // Any cleanup logic goes here.
        return handlerInput.responseBuilder.getResponse(); // notice we send an empty response
    }
};
/* *
 * The intent reflector is used for interaction model testing and debugging.
 * It will simply repeat the intent the user said. You can create custom handlers for your intents 
 * by defining them above, then also adding them to the request handler chain below 
 * */
const IntentReflectorHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest';
    },
    handle(handlerInput) {
        const intentName = Alexa.getIntentName(handlerInput.requestEnvelope);
        const speakOutput = `You just triggered ${intentName}`;

        return handlerInput.responseBuilder
            .speak(speakOutput)
            //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
            .getResponse();
    }
};
/**
 * Generic error handling to capture any syntax or routing errors. If you receive an error
 * stating the request handler chain is not found, you have not implemented a handler for
 * the intent being invoked or included it in the skill builder below 
 * */
const ErrorHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        const speakOutput = 'Lo sentimos, no pudimos procesar tu consulta';
        console.log(`~~~~ Error handled: ${JSON.stringify(error)}`);

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

/**
 * This handler acts as the entry point for your skill, routing all request and response
 * payloads to the handlers above. Make sure any new handlers or interceptors you've
 * defined are included below. The order matters - they're processed top to bottom 
 * */
exports.handler = Alexa.SkillBuilders.custom()
    .addRequestHandlers(
        LaunchRequestHandler,
        PreguntarPrecioBencinaIntentHandler,
        HelpIntentHandler,
        CancelAndStopIntentHandler,
        FallbackIntentHandler,
        SessionEndedRequestHandler,
        IntentReflectorHandler)
    .addErrorHandlers(
        ErrorHandler)
    .withCustomUserAgent('sample/hello-world/v1.2')
    .lambda();