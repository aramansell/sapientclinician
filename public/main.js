function $(selector) {
  return document.querySelector(selector);
}

function escapeHTML(str) {
    let div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
}

function addMessageToHistory(from, message) {
    $('#history').insertAdjacentHTML('beforeend', 
        `<div class="message_entry ${from == "You" ? "sent_message" : ""}">
            <div class="message_from">${escapeHTML(from)}</div>
            <div class="message_text">${escapeHTML(message)}</div>
        </div>`);
}

function sendMessage() {
    let message = $('#conversation_input').value;
    let person = $('#people').value;

    if (message.length > 0) {
        addMessageToHistory("You", message);

        $('#conversation_input').value = '';

        fetch('TODO', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                person: person,
                message: message
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