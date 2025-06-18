document.addEventListener('DOMContentLoaded', () => {
    const username = localStorage.getItem('username');

    if (!username) {
        console.error('Username not found in localStorage.');
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Username is missing. Please log in again.'
        });
        return;
    }

    fetch('get_customer_ids.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username })
    })
    .then(response => response.json())
    .then(data => {
        if (data.customer_id) {
            const customerId = data.customer_id;
            localStorage.setItem('customerId', customerId);
            console.log('✅ Customer ID saved:', customerId);
            fetchOrders(customerId);
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Customer ID not found. Please log in again.'
            });
        }
    })
    .catch(error => {
        console.error('❌ Error fetching customer ID:', error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Failed to fetch customer ID. Please try again later.'
        });
    });
});

function fetchOrders(customerId) {
    fetch(`MyOrders.php?customerId=${customerId}`)
        .then(response => response.json())
        .then(data => displayOrders(data))
        .catch(error => console.error('Error fetching orders:', error));
}

function displayOrders(orders) {
    const container = document.getElementById('orders-container');
    container.innerHTML = '';

    const grouped = groupByOrder(orders);

    for (const orderId in grouped) {
        const items = grouped[orderId];
        const order = items[0];

        const card = document.createElement('div');
        card.className = 'order-card';

        const showButton = order.STATUS.startsWith('Your order will be shipped on');
        const isCancelled = order.STATUS.toLowerCase().includes('cancelled');

        card.innerHTML = `
            <h3>Order ID: ${order.ORDER_ID}</h3>
            <p><strong>Customer ID:</strong> ${order.CUSTOMER_ID}</p>
            <p><strong>Total:</strong> Rs ${order.TOTAL_AMOUNT}</p>
            <p><strong>Status:</strong> ${order.STATUS}</p>
            <p><strong>Date:</strong> ${new Date(order.ORDER_DATE).toLocaleDateString()}</p>
            <ul>
                ${items.map(item => `<li>Product ID: ${item.PRODUCT_ID}, Quantity: ${item.QUANTITY}</li>`).join('')}
            </ul>
            ${showButton ? `<button onclick="acceptOrder(${order.ORDER_ID})">Confirm Received</button>` : ''}
            ${isCancelled ? `<p style="color:red; font-weight:bold;">Your amount will be refunded shortly.</p>` : ''}
        `;

        container.appendChild(card);
    }
}

function groupByOrder(data) {
    const grouped = {};
    data.forEach(item => {
        const id = item.ORDER_ID;
        if (!grouped[id]) grouped[id] = [];
        grouped[id].push(item);
    });
    return grouped;
}

function acceptOrder(orderId) {
    Swal.fire({
        title: 'Confirm Order Received',
        input: 'textarea',
        inputLabel: 'Leave feedback (optional)',
        inputPlaceholder: 'Write your feedback here...',
        showDenyButton: true,
        showCancelButton: true,
        confirmButtonText: 'Submit Feedback & Confirm',
        denyButtonText: 'Confirm Without Feedback',
        cancelButtonText: 'Cancel'
    }).then((result) => {
        if (result.isConfirmed || result.isDenied) {
            const feedback = result.isConfirmed ? result.value : '';

            // Step 1: Update order status (CustomerOrder.php)
            const formData = new FormData();
            formData.append('orderId', orderId);
            formData.append('status', 'Recieved');

            fetch('CustomerOrder.php', {
                method: 'POST',
                body: formData
            })
            .then(res => res.json())
            .then(result => {
                if (result.statusUpdated) {
                    if (feedback) {
                        // Step 2: Save feedback in MongoDB
                        saveFeedback(orderId, feedback);
                    } else {
                        Swal.fire('Order Accepted!', 'Status updated successfully.', 'success');
                        fetchOrders(localStorage.getItem('customerId'));
                    }
                } else {
                    Swal.fire('Failed', result.message, 'error');
                }
            })
            .catch(err => {
                console.error("❌ Error accepting order:", err);
                Swal.fire('Error', 'Something went wrong while accepting the order.', 'error');
            });
        }
    });
}

function saveFeedback(orderId, feedbackText) {
    // Retrieve the date from localStorage (if it exists) or generate a new date if not found
    const feedbackDate = localStorage.getItem('feedbackDate') || new Date().toLocaleDateString();

    // Save the current date in localStorage for future use
    localStorage.setItem('feedbackDate', feedbackDate);

    // Send feedback data to the server
    fetch('save_feedback.php', {
        method: 'POST',
        body: new URLSearchParams({
            orderId: orderId,         // The order ID is now used as feedbackId
            feedback: feedbackText,   // The actual feedback text
            feedbackDate: feedbackDate // The date when the feedback was provided
        })
    })
    .then(res => res.json())
    .then(response => {
        if (response.success) {
            Swal.fire('Thank you!', 'Your feedback was submitted.', 'success');
        } else {
            Swal.fire('Feedback Failed', response.message, 'error');
        }
        fetchOrders(localStorage.getItem('customerId'));
    })
    .catch(error => {
        console.error("❌ Error saving feedback:", error);
        Swal.fire('Error', 'Could not save feedback.', 'error');
    });
}

document.getElementById("logoutLink").addEventListener("click", function(event) {
    event.preventDefault();

    Swal.fire({
        title: 'Are you sure?',
        text: "You will be logged out.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, logout!'
    }).then((result) => {
        if (result.isConfirmed) {
            Swal.fire({
                title: 'Logged Out!',
                text: 'You have been successfully logged out.',
                icon: 'success',
                timer: 1500,
                showConfirmButton: false
            }).then(() => {
                window.location.href = "index.html";
                localStorage.clear();
            });
        }
    });
});
