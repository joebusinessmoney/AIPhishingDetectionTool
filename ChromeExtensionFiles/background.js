chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log("recived mesasge: ", request);

    if (request.action === "displayResult") {
        chrome.storage.local.set({ phishingData: request.result }, () => {
            console.log("data stored: ", request.result);
        });
    } else if (request.action === "displayEmailText") {
        chrome.storage.local.set({ scannedEmailText: request.emailText }, () => {
            console.log("email stored: ", request.emailText);
        });
    }
});
