window.addEventListener("DOMContentLoaded", () => {
    const username = localStorage.getItem("username");

    if (!username) {
        Swal.fire("Error", "User not logged in", "error").then(() => {
            window.location.href = "login.html";
        });
        return;
    }

    console.log("Fetching profile for:", username);

    fetch(`profile.php?username=${encodeURIComponent(username)}`)
        .then(res => res.json())
        .then(data => {
            if (!data.success) {
                Swal.fire("Error", data.message, "error");
                return;
            }

            const profile = data.data;
            document.getElementById("id").value = profile.id;
            document.getElementById("full_name").value = profile.full_name;
            document.getElementById("username").value = profile.username;
            document.getElementById("email").value = profile.email;
            document.getElementById("contact").value = profile.contact;
            document.getElementById("password").value = profile.password;
        })
        .catch(error => {
            console.error("Fetch error:", error);
            Swal.fire("Error", "Unable to load profile", "error");
        });

    document.querySelector(".profile-form").addEventListener("submit", function (e) {
        e.preventDefault();

        const updatedProfile = {
            id: document.getElementById("id").value,
            full_name: document.getElementById("full_name").value,
            username: document.getElementById("username").value,
            email: document.getElementById("email").value,
            contact: document.getElementById("contact").value,
            password: document.getElementById("password").value
        };

        fetch("update_profile.php", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updatedProfile)
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                Swal.fire("Success", data.message, "success");
                // Optional: update localStorage username if changed
                localStorage.setItem("username", updatedProfile.username);
            } else {
                Swal.fire("Error", data.message, "error");
            }
        })
        .catch(err => {
            console.error("Update error:", err);
            Swal.fire("Error", "Failed to update profile", "error");
        });
    });

    document.getElementById("logoutLink").addEventListener("click", function (e) {
        e.preventDefault(); // Prevent link default behavior

        Swal.fire({
            title: 'Are you sure?',
            text: "Do you want to logout?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, logout'
        }).then((result) => {
            if (result.isConfirmed) {
                localStorage.removeItem("username"); // Clear login session
                Swal.fire({
                    title: 'Logged out!',
                    text: 'You have been logged out successfully.',
                    icon: 'success',
                    timer: 1500,
                    showConfirmButton: false
                }).then(() => {
                    window.location.href = "index.html"; // Redirect
                });
            }
        });
    });

});
