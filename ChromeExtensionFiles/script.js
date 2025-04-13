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
