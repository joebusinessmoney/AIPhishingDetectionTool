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

                // displays extracted text in currently empty div
                document.getElementById("output").innerText = results[0].result || "error: no text found";
            }
        );
    });
});

// this function will be injected into the current website and read its text
function readText() {
    emailElement = document.querySelector('.a3s') // targets only the email text part of the email !!! CHANGE IF GOOGLE CHANGES EMAIL FORMATTING
    return emailElement.innerText.trim();
}


async function checkPhishing(emailText) {
    const response = await fetch("http://127.0.0.1:5000/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email_text: emailText}),
    });

    const data = await response.json();
    alert(`phishing score: ${data.phishing_score}%`);
}

let emailText = readText;
checkPhishing(emailText);