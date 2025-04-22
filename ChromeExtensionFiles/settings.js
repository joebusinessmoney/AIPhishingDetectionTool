document.addEventListener("DOMContentLoaded", function () {
    const saveButton = document.getElementById("save");
    const lightModeToggle = document.getElementById("lightmode");
    const status = document.getElementById("status");
    var counter = 0;

    const isLight = localStorage.getItem("lightmode") === "true"; 
    document.body.classList.toggle("light", isLight); // applies stored setting changes
    lightModeToggle.checked = isLight;

    saveButton.addEventListener("click", function () {
        const lightOn = lightModeToggle.checked;
        counter++; // displays number of times the settings have been saved to make it clear the save button is functional
        document.body.classList.toggle("light", lightOn); // applies changes
        localStorage.setItem("lightmode", lightOn); // stores the value of settings so they remain the same over seperate sessions


        status.innerText = "Saved settings (" + counter + ")"; 
    });
});


