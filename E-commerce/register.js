document.addEventListener("DOMContentLoaded", function () {
    document.querySelector("#register-form").addEventListener("submit", async function (event) {
        event.preventDefault();

        const formData = new FormData(this);

        // Password and Confirm Password check
        const password = formData.get("password");
        const confirmPassword = formData.get("confirm-password");

        if (password !== confirmPassword) {
            Swal.fire({
                title: 'Error!',
                text: 'Passwords do not match!',
                icon: 'error',
                confirmButtonText: 'Try Again'
            });
            return; // STOP submitting if mismatch
        }

        try {
            const response = await fetch("register.php", {
                method: "POST",
                body: formData
            });

            const text = await response.text();
            let result;

            try {
                result = JSON.parse(text);
            } catch (error) {
                throw new Error("Invalid JSON response: " + text);
            }

            if (result.success) {
                Swal.fire({
                    title: 'Success!',
                    text: result.message,
                    icon: 'success',
                    confirmButtonText: 'Ok'
                }).then(() => {
                    window.location.href = "login.html";
                });
            } else {
                Swal.fire({
                    title: 'Error!',
                    text: result.message,
                    icon: 'error',
                    confirmButtonText: 'Try Again'
                });
            }
        } catch (error) {
            Swal.fire({
                title: 'Error!',
                text: 'Something went wrong! ' + error.message,
                icon: 'error',
                confirmButtonText: 'Try Again'
            });
        }
    });
});
