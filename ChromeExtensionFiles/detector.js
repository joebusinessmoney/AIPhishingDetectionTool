document.addEventListener("DOMContentLoaded", function() { 
        document.getElementById("readText").addEventListener("click", function () {
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) { // filters for the currently focused tab in an array containing all tabs
            if (tabs.length === 0) {
                return; // stop if no tab is found
            }

            var activeTab = tabs[0];
            var tabUrl = activeTab.url;

            // checks if the currently active tab is a gmail email, if not it will cancel the script injection
            if (!tabUrl.startsWith("https://mail.google.com/mail/u/0/#inbox/")) {
                document.getElementById("output").innerText = "This extension only works on gmail emails!"
                console.log("error: no gmail detected")
                return;
            }

            // injects script into active tab
            chrome.scripting.executeScript(
                {
                    target: { tabId: tabs[0].id },
                    function: readText
                },
                function (results) {
                    // error catching and logging
                    if (chrome.runtime.lastError) {
                        console.error(chrome.runtime.lastError.message);
                        return;
                    }

                    var emailText = "";
                    if (results && results.length > 0 && results[0].result) {
                        emailText = results[0].result;
                    }

                    if (!emailText) {
                        console.log("error: no email text");
                        document.getElementById("output").innerText = "No email text found!"
                        return;
                    }

                    // displays extracted text in currently empty div
                    console.log("extracted email: ", emailText)
                    document.getElementById("output").innerText = emailText //results[0].result || "error: no text found";
                    if (emailText.includes("http://")) { // alert user of unsecure website links commonly found in phishing emails
                        document.getElementById("advice").innerText = "This email contains unsecure website links, please proceed with caution and avoid interacting with these links. "
                    }
                    
                    checkPhishing(emailText)
                }
            );
        });
    });
});

// this function will be injected into the current website and read its text
function readText() {
    emailElement = document.querySelector('.a3s') // targets only the email text part of the email !!! CHANGE IF GOOGLE CHANGES EMAIL FORMATTING
    return emailElement.innerText.trim();
}

function checkPhishing(emailText) {

    // sends POST request to flask backend (server.py)
    fetch("http://127.0.0.1:5000/predict", { // address of flask backend
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email_text: emailText}) // json format for email content
    })
    .then(function (response) {
        return response.json(); // turns server response to json
    })
    .then(function (data) {
        console.log("server response ", data); // response is logged for testing/debugging
        if (!data || typeof data.phishing_score === "undefined" || typeof data.prediction === "undefined") {
            alert("error: server returned undefined") // error if flask server returns nothing
            return;
        }

        document.getElementById("classification").innerText = "Phishing score: " + data.phishing_score + "%\nClassification: " + data.prediction;

        document.getElementById("classification").innerText = 
        "phishing score: " + data.phishing_score + "%\nclassifcation: " + data.prediction;
        openAccordion(0);
 
        
        let adviceText = document.getElementById("advice").innerText;

        // depending on the phishing score, some advice will be given

        if (data.phishing_score <= 100 && data.phishing_score > 80) {
            adviceText += " This email is safe.";
        } else if (data.phishing_score <= 80 && data.phishing_score > 60) {
            adviceText += " This email is likely safe but still ensure the email comes from a trusted sender.";
        } else if (data.phishing_score <= 60 && data.phishing_score > 40) {
            adviceText += " This email is possibly fraudulent. Avoid clicking on any links in the email or sending any personal information like passwords before ensuring the sender is legitimate.";
        } else if (data.phishing_score <= 40 && data.phishing_score > 20) {
            adviceText += " This email is likely fraudulent. Avoid interacting with this email's content or sending any personal information. If the sender is someone you recognise, attempt to contact them via something other than email to verify if they were the one to send the email or if their account has been compromised.";
        } else if (data.phishing_score <= 20 && data.phishing_score >= 0) {
            adviceText += " This email is highly likely fraudulent. Avoid interacting with this email's content or sending any personal information. If the sender is someone you recognise, attempt to contact them via something other than email to verify if they were the one to send the email or if their account had been compromised. Else, report the sender and block them.";
        } else {
            adviceText += "Error with phishing score.";
        }
        document.getElementById("advice").innerText = adviceText;
    })
    .catch(function (error) {
        console.error("eror happened: ", error);
    });
}