function saveText() {
    // Get the text entered in the text box
    var enteredText = "The patient's name is ";
    enteredText += document.getElementById("patientName").value;
    enteredText +=". Their symptoms include ";
    enteredText += document.getElementById("patientSymptoms").value;
    enteredText +=". Their medical history is ";
    enteredText += document.getElementById("patientHistory").value;
    enteredText +=". The abnormal lab results are ";
    enteredText += document.getElementById("labResults").value;

    // Create a Blob (binary large object) from the text
    var blob = new Blob([enteredText], { type: "text/plain" });

    // Create a link element
    var link = document.createElement("a");

    // Set the download attribute with the filename
    link.download = "textFile.txt";

    // Create a URL for the Blob and set it as the href attribute of the link
    link.href = window.URL.createObjectURL(blob);

    // Append the link to the document
    document.body.appendChild(link);

    // Trigger a click event on the link to prompt the user to download the file
    link.click();

    // Remove the link from the document
    document.body.removeChild(link);
}