function $(selector) {
  return document.querySelector(selector);
}

function escapeHTML(str) {
    let div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
}

var message_history = [];

/*
    from: "System", "You", "Patient", "Clinician", "Lab"
    message: string
    to: Only if from is "You", can be to "Patient", "Clinician", "Lab"
*/
function addMessageToHistory(from, message, to) {
    $('#history').insertAdjacentHTML('beforeend', 
        `<div class="message_entry ${from == "You" ? "sent_message" : ""}">
            <div class="message_from">${escapeHTML(from)}</div>
            <div class="message_text">${escapeHTML(message)}</div>
        </div>`);
    message_history.push({from: from, message: message, to: to});
}

function sendMessage() {
    let message = $('#conversation_input').value;
    let person = $('#people').value;

    if (message.length > 0) {
        addMessageToHistory("You", message, person);

        $('#conversation_input').value = '';

        fetch('https://sendmessage-55nudhlqzq-uc.a.run.app', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message_history: message_history.slice(1) // Exclude user "System" message
            })
        }).then(response => {
            if (response.ok) {
                return response.json();
            } else {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
        }).then(response_json => {
            addMessageToHistory(person, response_json.message);
        }). catch(error => {
            console.error(error);
            alert('Something went wrong');
        });
    }
}

function startConversation() {
    addMessageToHistory("System", "The ER doctor would like your help consulting on a patient. Jane is a 34 year old female with leukocytosis.\n\nYou must first choose who you would like information from by selecting them from the dropdown menu on the right. Your choices are Preceptor, Patient or Lab.\n\nWhat qustions would you like to ask the patient?");
}