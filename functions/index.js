const {onRequest} = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const OpenAI = require('openai');
const fs = require('fs');
//const nodemailer = require('nodemailer');
//const functions = require('firebase-functions');

var openai;

function initOpenAI() {
  if (!openai) {
    openai = new OpenAI({
      apiKey: process.env['OPENAI_API_KEY'],
    });
  }
}
/*
// Configure nodemailer with your email service provider's settings
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: functions.config().gmail.user,
    pass: functions.config().gmail.pass
  }
});

exports.sendFormEmail = functions.https.onRequest(async (req, res) => {
  const formData = req.body;
  const emailBody = Object.entries(formData)
    .map(([key, value]) => `${key}: ${value}`)
    .join('\n\n');

  const mailOptions = {
    from: functions.config().gmail.user,
    to: 'recipient@example.com',
    subject: 'New Form Submission',
    text: emailBody
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).send('Email sent successfully');
  } catch (error) {
    console.error('Error occurred while sending email:', error);
    res.status(500).send('Failed to send email');
  }
});
*/

// var system_message = fs.readFileSync('system_message.txt', 'utf8');

exports.sendMessage = onRequest({ secrets: ["OPENAI_API_KEY"] }, (request, response) => {

  // CORS headers
  response.set('Access-Control-Allow-Origin', "*");
	response.set('Access-Control-Allow-Headers', "Origin, Content-Type, Accept, Referer, User-Agent, If-None-Match");

  if (request.method == "OPTIONS") {
    return response.status(200).send("200: OK");
  }

  // Get request arguments
  if (request.method == "POST" && request.body) {
    try {
      var message_history = request.body.message_history;
      var system_message = request.body.prompt; // <--- This is a horrible idea because anyone could send a custom prompt
    }
    catch (error) {
      logger.log("Failed to parse request body")
      return response.status(400).send("Error 400: Bad Request");
    }
  } else {
    logger.log("Not post or no body")
    return response.status(400).send("Error 400: Bad Request");
  }

  function validateArguments() {
    return true; // <--- This is also a bad idea

    function validateMessageHistoryEntry(entry) {
      return typeof entry == "object" && ["Patient", "Clinician", "Lab", "You", "Update"].includes(entry.from) && (entry.from == "You" ? ["Patient", "Clinician", "Lab"].includes(entry.to) : !entry.to) && typeof entry.message == "string" && entry.message.length > 0;
    }
    return typeof message_history == "object" && Array.isArray(message_history) && message_history.length > 0 && message_history.every(validateMessageHistoryEntry);
  }

  if (validateArguments()) {


    initOpenAI();

    function convertMessageHistoryToOpenAIFormat(message_history) {
      return [{ role: 'system', content: system_message }].concat(message_history.map(function (entry) {
        if (entry.from == "You") 
        {
          return { role: 'user', content: `[Message to ${entry.to}]\n\n`+entry.message };
        } 
        else if(entry.from == "Update")
        {
          return { role: 'user', content: `[Update message]\n\n`+entry.message };
        }
        else {
          return { role: 'assistant', content: entry.message };
        }
      }));
    }

    openai.chat.completions.create({
      messages: convertMessageHistoryToOpenAIFormat(message_history),
      model: 'gpt-4-turbo',
    }).then(function (result) {

      response.status(200).send(JSON.stringify({ message: result.choices[0].message.content }));

    }).catch(function (error) {
      logger.error(error);
      response.status(500).send("Error 500: Internal Server Error");
    });


  } else {
    logger.log("Arguments not valid")
    logger.log(message_history)
    response.status(400).send("Error 400: Bad Request");
  }

  
});