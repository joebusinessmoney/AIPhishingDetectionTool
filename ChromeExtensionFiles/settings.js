document.addEventListener("DOMContentLoaded", function() {
    document.getElementById("save").addEventListener("click", function () {
        document.getElementById("status").innerText = "Settings saved!";
        var darkMode = document.getElementById("darkmode");

        if (darkMode.checked == true) {
            document.getElementById("status").innerText += "dark mode activagte";
        } else {
            document.getElementById("status").innerText += "let there be light";
        }
        
    });
});

