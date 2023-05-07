// function will return a greeting when a person's name and language of choice are passed as parameter

const moment = require('moment');
const greeting = {
    "en": "Hello",
    "fr": "Bonjour",
    "hi": "Namaste",
    "pt": "Oi",
    "se": "Hej",
    "es": "Hola",
    "de": "Hallo"
}

exports.handler = async (event) => {
    let name = event.pathParameters.name;
    let {lang, ...info} = event.queryStringParameters;

    let message = `${greeting[lang] ? greeting[lang] : greeting['en']}, ${name}!`;
    let response = {
        message: message,
        info: info,
        timestamp: moment().unix()
    }
    
    // api gateway requires an http response object, with status code and body
    return {
        statusCode: 200,
        body: JSON.stringify(response)
    }
}