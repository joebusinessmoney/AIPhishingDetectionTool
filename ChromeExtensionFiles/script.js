document.addEventListener("DOMContentLoaded", () =>  {
    const dropdownSwitch = document.getElementById("dropdownSwitch");
    const burgerIcon= document.getElementById("burgerIcon");

    if (burgerIcon) {
        burgerIcon.addEventListener("click", function (e) {
            e.stopPropagation();
            this.classList.toggle("change");
            dropdownSwitch.classList.toggle("show");
            
        });
    }

    window.addEventListener("click", (e) =>  {
        if(!e.target.matches(".dropbutton")) {
            if (dropdownSwitch && dropdownSwitch.classList.contains("show"))  {
                dropdownSwitch.classList.remove("show");
                burgerIcon.classList.remove("change");
            }  
        }
    });
});

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

    fetch("http://127.0.0.1:5000/feedback", {
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
