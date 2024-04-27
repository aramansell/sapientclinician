function $(selector) {
  return document.querySelector(selector);
}

const queryParams = new URLSearchParams(window.location.search);
var scenario_id = queryParams.get('scenario') || 'default';

var openingText = '';
var questionsText = '';
var promptText = '';
var questions = [];
var actorsText = '';
var actorsNames = {};

function init() {

    function fetchTextFile(url) {
        return fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
                }
                return response.text();
            });
    }

    const basePath = `/scenarios/${scenario_id}`;
    Promise.all([
        fetchTextFile(`${basePath}/opening.txt`),
        fetchTextFile(`${basePath}/questions.txt`),
        fetchTextFile(`${basePath}/prompt.txt`),
        fetchTextFile(`${basePath}/actors.json`)
    ]).then(texts => {
        [openingText, questionsText, promptText, actorsText] = texts;

        actorsNames = JSON.parse(actorsText);

        document.querySelector("#people > option[value='Patient']").innerText = actorsNames['Patient'];
        if (actorsNames['Clinician']) {
            document.querySelector("#people > option[value='Clinician']").innerText = actorsNames['Clinician'];
        } else {
            document.querySelector("#people > option[value='Clinician']").outerHTML = '';
        }
        if (actorsNames['Lab']) {
            document.querySelector("#people > option[value='Lab']").innerText = actorsNames['Lab'];
        } else {
            document.querySelector("#people > option[value='Lab']").outerHTML = '';
        }

        questions = questionsText.split('\n').filter(q => q.length > 0).map(a => a.trim());
    
        startConversation();
    }).catch(error => {
        console.error('Error loading text files:', error);
    });

}

function escapeHTML(str) {
    let div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
}

var message_history = [];

/*
    from: "System", "You", "Patient", "Clinician", "Lab", "Update"
    message: string
    to: Only if from is "You", can be to "Patient", "Clinician", "Lab"
*/
function addMessageToHistory(from, message, to) {
    $('#history').insertAdjacentHTML('beforeend', 
        `<div class="message_entry ${from == "You" ? "sent_message" : ""}">
            <div class="message_from">${escapeHTML(actorsNames[from] ? actorsNames[from] : from)}</div>
            <div class="message_text">${escapeHTML(message)}</div>
        </div>`);
    $('#history').scrollTop = $('#history').scrollHeight;
    message_history.push({from: (actorsNames[from] ? actorsNames[from] : from), message: message, to: (actorsNames[to] ? actorsNames[to] : to)});
}

function sendMessage(diagnosing, agent) {
    let message = $('#conversation_input').value;
    let person;
  
    if (agent == 'Observer') {
        
        person = 'Observer'
    }
    else {
        person = $('#people').value;
    }
    if (message.length > 0) 
    {
        addMessageToHistory("You", message, person);

        $('#conversation_input').value = '';

        if(person != 'Notes')
        {
            fetch('https://sendmessage-55nudhlqzq-uc.a.run.app', 
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message_history: message_history.slice(1).filter(msg => msg.to != 'Notes'), // Exclude user "System" message and "Notes"
                    prompt: promptText
                })
            }).then(response => 
                {
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
        else if(diagnosing == true){
            nextQuestion();

        }     
    }
}

function startConversation() {
    addMessageToHistory("System", openingText);
    currentQuestionIndex = 0;
}



function downloadTxtFile() {
    sendMessage(false, 'Observer')
    // Create a Blob with the specified content and MIME type
    const blob = new Blob([message_history.map(a => a.from+"\n\n"+a.message).join("\n\n")], { type: 'text/plain' });
    
    // Create a URL for the Blob
    const url = URL.createObjectURL(blob);
  
    // Create a link element
    const link = document.createElement('a');
  
    // Set the link's attributes
    link.href = url;
    link.download = 'history.txt';
  
    // Append the link to the document body
    document.body.appendChild(link);
  
    // Trigger a click on the link to initiate the download
    link.click();
  
    // Remove the link from the document
    document.body.removeChild(link);
  
    // Revoke the URL to free up resources
    URL.revokeObjectURL(url);
  }
  
  // Variable to track the current question index
  let currentQuestionIndex = 0;
  
  // Function to display the current question
  function displayQuestion() {
    addMessageToHistory("System", questions[currentQuestionIndex]);
  }
  
  // Event listener for the "Next Question" button
  //const nextQuestionButton = document.getElementById("next-question");
  //nextQuestionButton.addEventListener("click", () => {
    
    function nextQuestion(){
        
    
        // Check if we've reached the end of the array
        if (currentQuestionIndex >= questions.length) {
        currentQuestionIndex = 0; // Reset to the beginning
        alert("You've completed the assessment, be sure to click Finish Exam before closing window!");
        } else {
        displayQuestion();
        }
        currentQuestionIndex++;
  };
  

  
