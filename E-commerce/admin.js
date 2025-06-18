document.addEventListener("DOMContentLoaded", function () {
    // Feedback logic
    const feedbackBtn = document.getElementById('feedbackBtn');
    const feedbackSection = document.getElementById('feedbackSection');
    const feedbackList = document.getElementById('feedbackList');
    let isVisible = false;

    feedbackBtn.addEventListener('click', () => {
        if (!isVisible) {
            fetch('fetch_feedback.php')
                .then(res => res.json())
                .then(data => {
                    feedbackList.innerHTML = '';
                    if (data.length === 0) {
                        feedbackList.innerHTML = '<p>No feedback available.</p>';
                    } else {
                        data.forEach(item => {
                            const box = document.createElement('div');
                            box.className = 'feedback-box';
                            box.innerHTML = ` 
                                <strong>Order #${item.orderId}</strong><br>
                                <em>${item.feedbackDate}</em><br><br>
                                ${item.feedback}
                                <br><button class="delete-btn" data-id="${item.orderId}">Delete</button>
                            `;
                            feedbackList.appendChild(box);
                        });
                    }

                    feedbackSection.style.display = 'block';
                    feedbackSection.scrollIntoView({ behavior: 'smooth' });
                    isVisible = true;
                })
                .catch(error => {
                    console.error('Error fetching feedback:', error);
                });
        } else {
            feedbackSection.scrollIntoView({ behavior: 'smooth' });
            setTimeout(() => {
                feedbackSection.style.display = 'none';
                isVisible = false;
            }, 700);
        }
    });


    document.getElementById("logoutLink").addEventListener("click", function(event) {
        event.preventDefault(); // Prevent the default link behavior
    
        // Show a confirmation dialog using SweetAlert2
        Swal.fire({
            title: 'Are you sure?',
            text: "Do you want to log out?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, log out!',
            cancelButtonText: 'Cancel',
            reverseButtons: true
        }).then((result) => {
            if (result.isConfirmed) {
                // Handle logout here, for example redirecting to a logout page or clearing session
                // window.location.href = 'logout_page_url'; // Uncomment this if you have a logout page.
                
                // If using sessionStorage or localStorage, you could clear the session like this:
                sessionStorage.clear(); // or localStorage.clear();
                
                // Show a success message
                Swal.fire(
                    'Logged out!',
                    'You have been logged out successfully.',
                    'success'
                ).then(() => {
                    // Redirect to the login page or home page after logout
                    Swal.fire();
                    window.location.href = 'login.html'; // Adjust this path accordingly
                });
            } else {
                Swal.fire(
                    'Cancelled',
                    'Your session is still active.',
                    'info'
                );
            }
        });
    });
    

    // Handle delete

    feedbackList.addEventListener('click', (event) => {
        if (event.target.classList.contains('delete-btn')) {
            const orderId = parseInt(event.target.getAttribute('data-id'), 10);  // Ensure it is a number
            console.log("Order ID to delete:", orderId);
    
            Swal.fire({
                title: 'Are you sure?',
                text: `You want to delete feedback for Order ${orderId}?`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Yes, delete it!',
                cancelButtonText: 'No, keep it'
            }).then((result) => {
                if (result.isConfirmed) {
                    fetch('delete_feedback.php', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ orderId: orderId })
                    })
                    .then(res => res.json())
                    .then(data => {
                        if (data.success) {
                            event.target.closest('.feedback-box').remove();
                            Swal.fire({
                                title: 'Deleted!',
                                text: 'Feedback deleted successfully.',
                                icon: 'success',
                                confirmButtonText: 'OK'
                            });
                        } else {
                            Swal.fire({
                                title: 'Error!',
                                text: 'No feedback found with that order ID.',
                                icon: 'error',
                                confirmButtonText: 'Close'
                            });
                        }
                    })
                    .catch(error => {
                        Swal.fire({
                            title: 'Error!',
                            text: 'There was an error while deleting the feedback.',
                            icon: 'error',
                            confirmButtonText: 'Close'
                        });
                        console.error('Error deleting feedback:', error);
                    });
                } else {
                    Swal.fire(
                        'Cancelled',
                        'Your feedback is safe.',
                        'info'
                    );
                }
            });
        }
    });
    
    
    
});
