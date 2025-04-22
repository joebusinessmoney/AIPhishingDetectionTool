document.addEventListener("DOMContentLoaded", () =>  {
    const dropdownSwitch = document.getElementById("dropdownSwitch");
    const burgerIcon= document.getElementById("burgerIcon");
    // makes burger icon functional
    if (burgerIcon) {
        burgerIcon.addEventListener("click", function (e) {
            e.stopPropagation();
            this.classList.toggle("change");
            dropdownSwitch.classList.toggle("show");
            
        });
    }
    // toggles the display of the dropdown menu when the burger icon is clicked
    window.addEventListener("click", (e) =>  {
        if(!e.target.matches(".dropbutton")) {
            if (dropdownSwitch && dropdownSwitch.classList.contains("show"))  {
                dropdownSwitch.classList.remove("show");
                burgerIcon.classList.remove("change");
            }  
        }
    });
});

// gets use feedback from the feedback text area and sends it to sendFeedback function
document.addEventListener("DOMContentLoaded", () => {
    const feedbackButton = document.getElementById("feedbackSubmit");
    const feedbackText = document.getElementById("feedback");

    feedbackButton.addEventListener("click", function () {
        console.log("A user has submitted the following feedback: " + feedbackText.value);
        sendFeedback(feedbackText.value)
        feedbackText.value = "";
    });

});

function sendFeedback(feedbackText) {

    // sends POST request to flask backend (server.py)
    fetch("http://127.0.0.1:5000/feedback", { //address of flask backend
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ feedback_text: feedbackText})
    })
    .then(function (response) {
        return response.json();
    })
    .catch(function (error) {
        console.error("eror happened: ", error);
    });
}

// animates the accordion opening and closing
var accordion = document.getElementsByClassName("accordion");
for (var i = 0; i < accordion.length; i++) {
    accordion[i].addEventListener("click", function() {
        this.classList.toggle("active");
        var panel = this.nextElementSibling;
        if (panel.style.maxHeight) {
            panel.style.maxHeight = null; 
        } else {
            panel.style.maxHeight =  panel.scrollHeight + "px";
        }
    });
}

// function to remotely open accordion without the need for user input
function openAccordion(index) {
    const accordions = document.getElementsByClassName("accordion");
    const panels = document.getElementsByClassName("panel");

    if (accordions[index] && panels[index]) {
        if (!accordions[index].classList.contains("active")) {
            accordions[index].classList.add("active");
            panels[index].style.maxHeight = panels[index].scrollHeight + "px";
        }
    }
}
