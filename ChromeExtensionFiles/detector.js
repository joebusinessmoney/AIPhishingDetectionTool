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
                document.getElementById("output").innerText = "go into gmail email for this thing to work pal"
                console.log("NO GMAIL DETECTED!!!!!!!!!!!!!!!!!!")
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
                        console.log("no email glorbed");
                        document.getElementById("output").innerText = "no glorbs"
                        return;
                    }

                    // displays extracted text in currently empty div
                    console.log("extracted email: ", emailText)
                    document.getElementById("output").innerText = emailText //results[0].result || "error: no text found";

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

    fetch("http://127.0.0.1:5000/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email_text: emailText})
    })
    .then(function (response) {
        return response.json();
    })
    .then(function (data) {
        console.log("server response ", data);
        if (!data || typeof data.phishing_score === "undefined" || typeof data.prediction === "undefined") {
            alert("server diud a poopy")
            return;
        }

        // alert("phishing score: " + data.phishing_score + "%\nclassifcation: " + data.prediction);
        document.getElementById("classification").innerText = "phishing score: " + data.phishing_score + "%\nclassifcation: " + data.prediction;

    })
    .catch(function (error) {
        console.error("eror happen: ", error);
    });
    // const response = await fetch("http://127.0.0.1:5000/predict", {
    //     method: "POST",
    //     headers: { "Content-Type": "application/json" },
    //     body: JSON.stringify({ email_text: emailText}),
    // });

    // const data = await response.json();
    // alert(`phishing score: ${data.phishing_score}%`);
}

// let emailText = readText;
// checkPhishing(emailText);