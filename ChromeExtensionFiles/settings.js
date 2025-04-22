document.addEventListener("DOMContentLoaded", function () {
    const saveButton = document.getElementById("save");
    const lightModeToggle = document.getElementById("lightmode");
    const status = document.getElementById("status");
    var counter = 0;

    const isLight = localStorage.getItem("lightmode") === "true";
    document.body.classList.toggle("light", isLight);
    lightModeToggle.checked = isLight;

    saveButton.addEventListener("click", function () {
        const lightOn = lightModeToggle.checked;
        counter++;
        document.body.classList.toggle("light", lightOn);
        localStorage.setItem("lightmode", lightOn);


        status.innerText = "Saved settings (" + counter + ")";
    });
});


