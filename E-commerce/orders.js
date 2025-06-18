document.addEventListener('DOMContentLoaded', () => {
    fetchOrders();
});

function fetchOrders() {
    fetch('orders.php')
        .then(response => response.json())
        .then(data => displayOrders(data))
        .catch(error => console.error('Error fetching orders:', error));
}

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
function displayOrders(orders) {
    const container = document.getElementById('orders-container');
    container.innerHTML = '';

    const grouped = groupByOrder(orders);

    for (const orderId in grouped) {
        const items = grouped[orderId];
        const order = items[0];

        const card = document.createElement('div');
        card.className = 'order-card';
        card.innerHTML = `
            <h3>Order ID: ${order.ORDER_ID}</h3>
            <p><strong>Customer ID:</strong> ${order.CUSTOMER_ID}</p>
            <p><strong>Total:</strong> Rs ${order.TOTAL_AMOUNT}</p>
            <p><strong>Status:</strong> ${order.STATUS}</p>
            <p><strong>Date:</strong> ${new Date(order.ORDER_DATE).toLocaleDateString()}</p>
            <ul>
                ${items.map(item => `<li>Product ID: ${item.PRODUCT_ID}, Quantity: ${item.QUANTITY}</li>`).join('')}
            </ul>
<button class="accept-btn" 
    ${(order.STATUS !== 'Order Placed' && order.STATUS !== 'Cancelled') || order.STATUS === 'Received' ? 'disabled' : ''} 
    onclick="acceptOrder(${order.ORDER_ID}, ${order.TOTAL_AMOUNT})">
    Accept
</button>
<button class="cancel-btn" 
    ${(order.STATUS === 'Cancelled' || order.STATUS === 'Received') ? 'disabled' : ''} 
    onclick='cancelOrder(${order.ORDER_ID})'>
    Cancel
</button>
        `;
        container.appendChild(card);
    }
}


function groupByOrder(data) {
    const grouped = {};
    data.forEach(item => {
        const id = item.ORDER_ID;
        if (!grouped[id]) {
            grouped[id] = [];
        }
        grouped[id].push(item);
    });
    return grouped;
}
function acceptOrder(orderId, totalAmount) {

    const formData = new FormData();
    formData.append('orderId', orderId);
    formData.append('status', 'Accepted');
    
    formData.append('totalAmount', totalAmount); // 👈 Add this

    fetch('orderActions.php', {
        method: 'POST',
        body: formData
    })
    .then(res => res.json())
    .then(result => {
        console.log("✅ Status Updated:", result.statusUpdated);
        console.log("💰 Payment Added:", result.paymentAdded);

        Swal.fire({
            icon: result.statusUpdated ? 'success' : 'error',
            title: result.statusUpdated ? 'Order Accepted!' : 'Failed',
            text: result.message
        });

        fetchOrders(); // Refresh the list
    })
    .catch(err => {
        console.error("❌ Error accepting order:", err);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Something went wrong while accepting the order.'
        });
    });
}

function cancelOrder(orderId) {
    const formData = new FormData();
    formData.append('orderId', orderId);
    formData.append('status', 'Cancelled');

    fetch('orderActions.php', {
        method: 'POST',
        body: formData
    })
    .then(res => res.json())
    .then(result => {
        console.log("✅ Status Updated:", result.statusUpdated);
        console.log("📦 Stock Restored:", result.stockRestored);

        Swal.fire({
            icon: result.statusUpdated ? 'success' : 'error',
            title: result.statusUpdated ? 'Order Cancelled!' : 'Failed',
            text: result.message
        });

        fetchOrders(); // Refresh the list
    })
    .catch(err => {
        console.error("❌ Error cancelling order:", err);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Something went wrong while cancelling the order.'
        });
    });
}

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