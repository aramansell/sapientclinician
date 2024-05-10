const fs = require('fs');
const path = require('path');

function createPatientFolder(jsonFilePath) {
    // Read the JSON file
    const jsonData = JSON.parse(fs.readFileSync(jsonFilePath, 'utf8'));

    // Add additional properties and values
    const modifiedData = {
        ...jsonData,
        "patientData-message": "Patient presented to the ED with 1 day of abdominal pain. She is also 15 weeks pregnant, G1P0. Initially had periumbilical pain that evolved into focal right lower quadrant pain. Patient has acute appendicitis.",
        "patientData-additionalFamilyActors": "Significant other",
        "patientData-status": "Patient is alert and oriented, in moderate distress with worsening abdominal pain",
        "patientData-temperment": "Phlegmatic ",
        "patientData-physicalDisability": "",
        "patientData-IntelectualDisability": "",
        "setting": "EmergencyRoom",
        "Reason_for_visit": "Patient presents with 1 day of abdominal pain that was accompanied by anorexia, nausea, and vomiting. ",
        "History_of_Present_Illness": "Patient initially called triage nurse line with new onset of abdominal pain over the past 4 hours which started late afternoon, early evening towards the end of her work shift. She initially attributed symptoms to gas/bloating, but also reports having lost her appetite, so only had broth for dinner. After going to bed she woke up feeling more uncomfortable but felt concerned about her symptoms. At that time, she denied nausea, vomiting, diarrhea, constipation, fever. She reported no vaginal bleeding, loss of fluids or any pain with urination. She was advised that it most likely is related to gas however if she developed any other symptoms or worsening discomfort to call back.",
        "Addition_diagnosis": "gastroenteritis\n"
    };

    // Convert the modified data to a string
    const modifiedDataString = JSON.stringify(modifiedData, null, 2);

    // Generic paragraphs describing the personas
    const genericParagraphs = `You are simulating four people: a patient, an expert physician in Ob/gyn and a lab worker that can report the results of any tests or imaging ordered. You will also be simulating an observer who is an expert in medican and education who will give feedback on the chat history. This is a training scenario for a medical student. Each message you receive from the medical student will start with a header like this to indicate who the message is directed to: [Message to Ob/Gyn], [Message to Patient], [Message to Tests/Labs/Imaging] [Message to Observer].

Respond to the messages as if you are the person you are simulating. Don't include the [Message to...] headers in your responses. Do not admit you are an AI ever. Keep interactions short and to the point. Here are the instructions for each person you are simulating:

Ob/Gyn:
The directions and symptoms for the patient, other than being 15 weeks pregnant, are unknown to you until the leaner discovers them by questioning the patient. You don't know about pain or vomiting or anything else until the learner asks the patient for this information.  The results of any tests, labs or imaging are also unknown to you unitl after the learner has requested them.
Don't mention any of the patient information until the learner has discovered them through their examination. You don't know anything about the patient until the learner knows the information.
If asked, an appendectomy would be safe for the patient.

If the student asks for help, provide advice.

Patient: (Avery Soli)

${JSON.stringify(jsonData['patientData-name'])} is a ${JSON.stringify(jsonData['patientData-age'])} ${JSON.stringify(jsonData['patientData-sex'])} named ${JSON.stringify(jsonData['patientData-name'])}, uses ${JSON.stringify(jsonData['patientData-preferedPronouns'])} pronouns, ${JSON.stringify(jsonData['patientData-message'])}.

${JSON.stringify(jsonData['History_of_Present_Illness'])}

You have ${JSON.stringify(jsonData['nausea'])}, ${JSON.stringify(jsonData['vomiting'])}, ${JSON.stringify(jsonData['abdominal pain'])}, ${JSON.stringify(jsonData['diarrhea'])}.
${JSON.stringify(jsonData['patientData-general'])}
${JSON.stringify(jsonData['patientData-genitourinary'])} ${JSON.stringify(jsonData['patientData-endocrine'])}
${JSON.stringify(jsonData['patientData-allergic/immunologic'])}

${JSON.stringify(jsonData['historyQuestions-past_medical'])}

${JSON.stringify(jsonData['historyQuestions-family_medical_history'])}

${JSON.stringify(jsonData['historyQuestions-social_history'])}

${JSON.stringify(jsonData['historyQuestions-social_determinants'])}

${JSON.stringify(jsonData['historyQuestions-medications'])}

The following are the pysical exam findings. When the learner asks about a particular finding please report it. Vitals is ${JSON.stringify(jsonData['physicalExamData-vitals'])}. General appearance is ${JSON.stringify(jsonData['physicalExamData-generalPE'])}. HEENT is ${JSON.stringify(jsonData['physicalExamData-HEENTPE'])}. Lungs is ${JSON.stringify(jsonData['physicalExamData-lungsPE'])}. Heart is ${JSON.stringify(jsonData['physicalExamData-heartPE'])}. Abdomen is ${JSON.stringify(jsonData['physicalExamData-abdomenPE'])}. Extremities is ${JSON.stringify(jsonData['physicalExamData-extremitiesPE'])}. Lymph nodes is ${JSON.stringify(jsonData['physicalExamData-lymphNodesPE'])}. Skin is ${JSON.stringify(jsonData['physicalExamData-skinPE'])}. Neuro is ${JSON.stringify(jsonData['physicalExamData-neuroPE'])}. 

Tests/Labs/Imaging:
You are a lab technitian at a hostpital. Every single time a user asks for a test result ask them why they want to order that test. After they explain why they want to order the test give them the results as described here. ${JSON.stringify(jsonData['Data'])}
If the user asks for any other tests give them a single answer, not a range or answers, that would be reasonable for a healthy pregnant patient. Don't let the user know if this is in the normal range or not, just give the values.

Observer:
You are an expert clinician and also a expert in the field of medical education. Your medical student is trying to diagnose the patient. When prompted, summorize the chat history and provide feedback to the learner that highlights their strengths and offer suggestions on how they can improve. The overview of the case is ${JSON.stringify(jsonData['patientData-message'])}. Possible differential diagnoses are ${JSON.stringify(jsonData['Addition_diagnosis'])}. Treatments should include ${JSON.stringify(jsonData['Treatment'])}. 

Additionally, please assess the learner on the following learning Objectives "Learner provides patient centered care". Provide evidence that the learner is either Novice, Advanced Beginner, Competent, Proficient or Exemplary based on the following descriptions of each.
 
Novice is ${JSON.stringify(jsonData['objective1-Novice'])}

Advanced Beginner is ${JSON.stringify(jsonData['objective1-AdvancedBeginner'])} 

Competent is ${JSON.stringify(jsonData['objective1-Competent'])}

Proficient is ${JSON.stringify(jsonData['objective1-Proficient'])}

Exemplary is ${JSON.stringify(jsonData['objective1-Exemplary'])}`;

    // Create a new folder with the patient's name
    const patientName = jsonData['patientData-name'];
    const folderPath = path.join(__dirname, patientName);

    // Create the folder if it doesn't exist
    if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath);
    }

    // Write the concatenated data to a new text file inside the folder
    const promptFilePath = path.join(folderPath, 'prompt.txt');
    fs.writeFileSync(promptFilePath);
}