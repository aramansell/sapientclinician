const {onRequest} = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const OpenAI = require('openai');
const fs = require('fs');

var openai;

function initOpenAI() {
  if (!openai) {
    openai = new OpenAI({
      apiKey: process.env['OPENAI_API_KEY'],
    });
  }
}

var system_message = fs.readFileSync('system_message.txt', 'utf8');

exports.sendMessage = onRequest({ secrets: ["OPENAI_API_KEY"] }, (request, response) => {

  // CORS headers
  response.set('Access-Control-Allow-Origin', "*");
	response.set('Access-Control-Allow-Headers', "Origin, Content-Type, Accept, Referer, User-Agent, If-None-Match");

  // Get request arguments
  if (request.method == "POST" && req.body) {
    try {
      var message_history = req.body.message_history;
    }
    catch (error) {
      return response.status(400).send("Error 400: Bad Request");
    }
  } else {
    return response.status(400).send("Error 400: Bad Request");
  }

  function validateArguments() {
    function validateMessageHistoryEntry(entry) {
      return typeof entry == "object" && ["Patient", "Clinician", "Lab", "You"].includes(entry.from) && (entry.from == "You" ? ["Patient", "Clinician", "Lab"].includes(entry.to) : !entry.to) && typeof entry.message == "string" && entry.message.length > 0;
    }
    return typeof message_history == "object" && Array.isArray(message_history) && message_history.length > 0 && message_history.every(validateMessageHistoryEntry);
  }

  if (validateArguments()) {


    initOpenAI();

    function convertMessageHistoryToOpenAIFormat(message_history) {
      return [{ role: 'system', content: system_message }].concat(message_history.map(function (entry) {
        if (entry.from == "You") {
          return { role: 'user', content: `[Message to ${entry.to}]\n\n`+entry.message };
        } else {
          return { role: 'assistant', content: entry.message };
        }
      }));
    }

    openai.chat.completions.create({
      messages: convertMessageHistoryToOpenAIFormat(message_history),
      model: 'gpt-4',
    }).then(function (result) {

      response.status(200).send(JSON.stringify({ message: result.choices[0].message.content }));

    }).catch(function (error) {
      logger.error(error);
      response.status(500).send("Error 500: Internal Server Error");
    });


  } else {
    response.status(400).send("Error 400: Bad Request");
  }
});