function readText() {
    return document.body.innerText;
}

function displayText(text) {
    let textBox = document.createElement("div")
    textBox.innerText = text;

    document.body.appendChild(textBox)
}

displayText(readText());