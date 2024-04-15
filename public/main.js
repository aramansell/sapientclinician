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
    from: "System", "You", "Patient", "Clinician", "Lab", "Update"
    message: string
    to: Only if from is "You", can be to "Patient", "Clinician", "Lab"
*/
function addMessageToHistory(from, message, to) {
    $('#history').insertAdjacentHTML('beforeend', 
        `<div class="message_entry ${from == "You" ? "sent_message" : ""}">
            <div class="message_from">${escapeHTML(from)}</div>
            <div class="message_text">${escapeHTML(message)}</div>
        </div>`);
    $('#history').scrollTop = $('#history').scrollHeight;
    message_history.push({from: from, message: message, to: to});
}

function sendMessage(diagnosing) {
    let message = $('#conversation_input').value;
    let person = $('#people').value;

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
                    message_history: message_history.slice(1).filter(msg => msg.to != 'Notes') // Exclude user "System" message and "Notes"

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
    addMessageToHistory("System", "This assessment will capture your thought process and critial thinking as you attempt to diagnose a patient. \n\nTo begin, create your first Note. After it is sent, select who you want to talk with, by selecting Clinician, Patient or submitting orders to the Lab from the dropdown menu. \n\nAfter several interactions with the Patient, Clinician or Lab you must submit your Diagnosis. \n\n\n\nYour first note should be your initial thoughts about the patient, Jane, whom the ER doctor would like your help consulting on. She is a 34 year old with leukocytosis.");
    currentQuestionIndex = 0;
    

}



function downloadTxtFile() {
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

// Array to store the questions
const questions = [
    "What’s the Diagnosis?",
    "The attending physician reviewed the case with pathology, and the diagnosis is chronic myeloid leukemia. What’s the phase of dz?",
    "What if there were 34% blasts in the marrow, what phase would this be?",
    "How would you determine cell lineage, and why?",
    "What treatment is indicated in this patient scenario and why?",
    "What is the MOA(mechanism of action) of TKIs, simply put?",
    "How would you explain the dx, treatment and monitoring for this patient?",
    "What other labs findings were concerning and why?",
    "How would you explain TLS (tumor lysis syndrome) to a patient?",
    "What is the intervention, please explain the prophylactic measures and treatment of TLS, and what you would do next for this patient?",
    "What would you do if the patient was 18 weeks pregnant?",
    "What if instead of CML, the patient presented with leukocytosis in DIC and FISH was +t(15;17)? What is the most probable dx?",
    "In APL, what would stratify high vs low risk disease? What is the SOC therapy for high risk APL?",
    "After consulting on this patient, the ER attending approaches you to learn more about the case, and specifically asks if you could create guidance to the ER staff about how best to manage a suspected new diagnosis leukemia case. Please provide a brief synopsis on what clinicians should do in addition to requesting a consult, such as obtaining and providing any additional data and addressing possible oncologic emergencies?",
  ];
  
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
  

  