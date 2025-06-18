// Fetch payments from PHP script
fetch('payments.php')  // Make sure to update the correct PHP path
.then(response => response.json())
.then(data => {
    const container = document.getElementById('payments-container');
    data.forEach(payment => {
        const card = document.createElement('div');
        card.classList.add('card');
        card.innerHTML = `
            <h3>Payment #${payment.PAYMENT_ID}</h3>
            <p>Amount: Rs ${payment.AMOUNT}</p>
            <p>Order ID: ${payment.ORDER_ID}</p>
            <p>Date: ${new Date(payment.PAYMENT_DATE).toLocaleDateString()}</p>
        `;
        container.appendChild(card);
    });
})
.catch(error => {
    console.error('Error fetching payments:', error);
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
                localStorage.clear();
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
                localStorage.clear();
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
document.getElementById('logout-btn').addEventListener('click', function(event) {
    event.preventDefault();  // Prevent the default link behavior

    // Display SweetAlert2 confirmation dialog
    Swal.fire({
        title: 'Are you sure you want to logout?',
        text: "You will be redirected to the login page.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, logout',
        cancelButtonText: 'Cancel'
    }).then((result) => {
        if (result.isConfirmed) {
            // Redirect to login page after confirming
            window.location.href = 'login.html';
        }
    });
});