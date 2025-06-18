document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("login-form").addEventListener("submit", async (event) => {
        event.preventDefault();

        const formData = new FormData(event.target);
        const response = await fetch("login.php", {
            method: "POST",
            body: formData,
        });

        const result = await response.json();

        if (result.success) {
            // Save login state to localStorage
            localStorage.setItem("isLoggedIn", "true");
            localStorage.setItem("username", result.username); // Assuming result includes username
            localStorage.setItem("role", result.role);

            Swal.fire({
                icon: "success",
                title: "Login Successful!",
                text: result.message,
                showConfirmButton: false,
                timer: 1500
            }).then(() => {
                if (result.role === "admin") {
                    window.location.href = "customer.html";
                } else {
                    window.location.href = "index.html";
                }
            });
        } else {
            Swal.fire({
                icon: "error",
                title: "Login Failed",
                text: result.message
            });
        }
    });
});
