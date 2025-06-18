document.addEventListener("DOMContentLoaded", function () {
    const username = localStorage.getItem("username");

    // Show greeting if logged in
    if (username) {
        

        // Replace Login and Register links
        const loginLink = document.querySelector('a[href="login.html"]');
        const registerLink = document.querySelector('a[href="register.html"]');

        if (loginLink) {
            loginLink.textContent = "My Orders";
            loginLink.href = "MyOrders.html";
        }

        if (registerLink) {
            registerLink.textContent = "My Profile";
            registerLink.href = "profile.html";
        }

        // Create and add Logout link
        const logoutLi = document.createElement("li");
        const logoutLink = document.createElement("a");
        logoutLink.href = "#";
        logoutLink.textContent = "Logout";
        logoutLink.addEventListener("click", function (e) {
            e.preventDefault();

            Swal.fire({
                title: "Are you sure you want to logout?",
                icon: "warning",
                showCancelButton: true,
                confirmButtonText: "Yes, logout",
                cancelButtonText: "No, stay logged in"
            }).then((result) => {
                if (result.isConfirmed) {
                    localStorage.clear();
                    Swal.fire({
                        icon: "success",
                        title: "Logged out successfully!",
                        timer: 1500,
                        showConfirmButton: false
                    }).then(() => {
                        window.location.href = "index.html";
                    });
                }
            });
        });

        logoutLi.appendChild(logoutLink);
        const rightNav = document.querySelector(".right-nav");
        if (rightNav) rightNav.appendChild(logoutLi);
    }

    // Dropdown logic
    const dropdownButton = document.getElementById('shopDropdown');
    const dropdownMenu = document.getElementById('dropdownMenu');

    if (dropdownButton && dropdownMenu) {
        dropdownButton.addEventListener('click', function (event) {
            event.preventDefault();
            dropdownMenu.classList.toggle('show');
        });

        document.addEventListener('click', function (event) {
            if (!dropdownButton.contains(event.target) && !dropdownMenu.contains(event.target)) {
                dropdownMenu.classList.remove('show');
            }
        });
    }









    const feedbackBtn = document.getElementById('feedbackBtn'); // The button that triggers feedback fetching
    const feedbackSection = document.getElementById('feedbackSection'); // The section where feedback will be shown
    const feedbackList = document.getElementById('feedbackList'); // The list where feedback items will be displayed
    let isVisible = false; // Flag to track visibility of the feedback section

    feedbackBtn.addEventListener('click', () => {
        if (!isVisible) {
            fetch('fetch_feedback.php') // Fetch feedback data from the PHP script
                .then(res => {
                    if (!res.ok) { // If the response is not ok (e.g., network error)
                        throw new Error('Network response was not ok');
                    }
                    return res.json(); // Parse the response body as JSON
                })
                .then(data => {
                    if (Array.isArray(data) && data.length > 0) { // Check if the data is valid
                        feedbackList.innerHTML = ''; // Clear any previous feedback
                        data.forEach(item => {
                            const box = document.createElement('div');
                            box.className = 'feedback-box'; // Add a CSS class for styling
                            box.innerHTML = `
                                <strong>Order #${item.orderId}</strong><br>
                                <em>${item.feedbackDate}</em><br><br>
                                ${item.feedback}
                            `;
                            feedbackList.appendChild(box); // Add feedback to the list
                        });
                        feedbackSection.style.display = 'block'; // Show the feedback section
                        feedbackSection.scrollIntoView({ behavior: 'smooth' }); // Scroll to feedback section smoothly
                        isVisible = true; // Mark the section as visible
                    } else {
                        console.error('No feedback data or empty response');
                    }
                })
                .catch(error => {
                    console.error('Error fetching feedback:', error); // Handle any errors
                });
        } else {
            // If feedback section is already visible, just scroll to it
            feedbackSection.scrollIntoView({ behavior: 'smooth' });
            setTimeout(() => {
                feedbackSection.style.display = 'none'; // Hide the feedback section after delay
                isVisible = false; // Mark the section as hidden
            }, 700); // Delay to allow smooth scrolling before hiding
        }
    });

});
