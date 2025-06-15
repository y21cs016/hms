document.addEventListener("DOMContentLoaded", function () {
    const loginForm = document.getElementById("loginForm");
    if (loginForm) {
        loginForm.addEventListener("submit", async function (e) {
            e.preventDefault();
            const username = document.getElementById("username").value;
            const password = document.getElementById("password").value;

            try {
                const response = await fetch("http://localhost:3000/login", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ username, password }),
                });

                const data = await response.json();

                if (response.ok) {
                    alert("Login successful!");
                    window.location.href = "1.html";
                } else {
                    alert(data.message);
                }
            } catch (error) {
                console.error("Error during login:", error);
                alert("Something went wrong. Try again.");
            }
        });
    } else {
        console.error("Error: loginForm element not found.");
    }
});
