document.getElementById("readText").addEventListener("click", function () {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) { // filters for the currently focused tab in an array containing all tabs
        if (tabs.length === 0) {
            return; // stop if no tab is found
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
    return document.body.innerText.trim();
}

