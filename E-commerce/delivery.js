// Load order IDs into the select box
fetch('load_orders.php')
    .then(response => response.json())
    .then(data => {
        const orderSelect = document.getElementById('order-id');
        orderSelect.innerHTML = '';
        if (data.error) {
            Swal.fire('Error', 'Error fetching order IDs: ' + data.error, 'error');
            return;
        }
        data.forEach(orderId => {
            const option = document.createElement('option');
            option.value = orderId;
            option.textContent = `Order ID: ${orderId}`;
            orderSelect.appendChild(option);
        });
    })
    .catch(error => Swal.fire('Error', 'Error fetching order IDs: ' + error, 'error'));

// Add delivery form submission
document.getElementById('addDeliveryForm').addEventListener('submit', function (event) {
    event.preventDefault();
    const data = {
        order_id: document.getElementById('order-id').value,
        delivery_date: document.getElementById('delivery-date').value,
        shipping_date: document.getElementById('shipping-date').value
    };
    fetch('insert_delivery.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    })
        .then(response => response.json())
        .then(result => {
            if (result.success) {
                Swal.fire('Success!', 'Delivery added successfully and order status updated.', 'success');
                loadDeliveries();
            } else {
                Swal.fire('Error!', result.error, 'error');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            Swal.fire('Error!', 'Something went wrong. Please try again later.', 'error');
        });
});

// Load deliveries and render cards
function loadDeliveries() {
    fetch('load_deliveries.php')
        .then(response => response.json())
        .then(data => {
            const container = document.getElementById('deliveries-container');
            container.innerHTML = '';
            if (data.error) {
                container.innerHTML = '<p>Error loading deliveries.</p>';
                return;
            }
            if (Array.isArray(data) && data.length > 0) {
                data.forEach(delivery => {
                    const card = document.createElement('div');
                    card.className = 'delivery-card';
                    card.innerHTML = `
                        <h3>Delivery ID: ${delivery.DELIVERY_ID}</h3>
                        <h3>Order ID: ${delivery.ORDER_ID}</h3>
                        <p><strong>Delivery Date:</strong> ${delivery.DELIVERY_DATE}</p>
                        <p><strong>Shipping Date:</strong> ${delivery.SHIPPING_DATE}</p>
                        <div class="button-container">
                            <button class="update-button" onclick="updateDelivery(${delivery.DELIVERY_ID})">Update</button>
                            <button class="delete-button" onclick="deleteDelivery(${delivery.DELIVERY_ID})">Delete</button>
                        </div>
                    `;
                    container.appendChild(card);
                });
            } else {
                container.innerHTML = '<p>No deliveries found.</p>';
            }
        })
        .catch(error => {
            console.error('Error loading deliveries:', error);
            document.getElementById('deliveries-container').innerHTML = '<p>Failed to load deliveries.</p>';
        });
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
document.addEventListener('DOMContentLoaded', loadDeliveries);

// Delete delivery
function deleteDelivery(deliveryId) {
    Swal.fire({
        title: 'Are you sure?',
        text: 'You will not be able to recover this delivery!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'No, keep it'
    }).then((result) => {
        if (result.isConfirmed) {
            fetch('delete_delivery.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: `delivery_id=${deliveryId}`
            })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        Swal.fire('Deleted!', 'Delivery deleted successfully.', 'success');
                        loadDeliveries();
                    } else {
                        Swal.fire('Error!', 'Failed to delete delivery: ' + data.error, 'error');
                    }
                })
                .catch(error => {
                    console.error('Error deleting delivery:', error);
                    Swal.fire('Error!', 'An error occurred while deleting the delivery.', 'error');
                });
        }
    });
}

// Update delivery modal - open and populate only on click
function updateDelivery(deliveryId) {
    const modal = document.getElementById('update-modal');
    modal.style.display = 'block';

    fetch(`get_delivery.php?delivery_id=${deliveryId}`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const delivery = data.delivery;
                document.getElementById('update-delivery-id').value = delivery.DELIVERY_ID;
                document.getElementById('update-order-id').value = delivery.ORDER_ID;
                document.getElementById('update-delivery-date').value = formatDateToISO(delivery.DELIVERY_DATE);
                document.getElementById('update-shipping-date').value = formatDateToISO(delivery.SHIPPING_DATE);
            } else {
                Swal.fire('Error!', 'Failed to load delivery data.', 'error');
                modal.style.display = 'none';
            }
        })
        .catch(error => {
            console.error('Error fetching delivery details:', error);
            Swal.fire('Error!', 'Error fetching delivery details.', 'error');
            modal.style.display = 'none';
        });
}

// Format DD-MON-YY to yyyy-MM-dd
function formatDateToISO(dateString) {
    const monthNames = {
        'JAN': '01', 'FEB': '02', 'MAR': '03', 'APR': '04', 'MAY': '05',
        'JUN': '06', 'JUL': '07', 'AUG': '08', 'SEP': '09', 'OCT': '10',
        'NOV': '11', 'DEC': '12'
    };
    const [day, month, year] = dateString.split('-');
    return `20${year}-${monthNames[month.toUpperCase()]}-${day}`;
}

// Handle update delivery form submission
document.getElementById('updateDeliveryForm').addEventListener('submit', function (event) {
    event.preventDefault();
    const data = {
        delivery_id: document.getElementById('update-delivery-id').value,
        order_id: document.getElementById('update-order-id').value,
        delivery_date: document.getElementById('update-delivery-date').value,
        shipping_date: document.getElementById('update-shipping-date').value
    };
    fetch('update_delivery.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    })
        .then(response => response.json())
        .then(result => {
            if (result.success) {
                Swal.fire('Success!', 'Delivery updated successfully.', 'success').then(() => {
                    loadDeliveries();
                    document.getElementById('update-modal').style.display = 'none';
                });
            } else {
                Swal.fire('Error!', 'Update failed: ' + result.error, 'error');
            }
        })
        .catch(error => {
            console.error('Error updating delivery:', error);
            Swal.fire('Error!', 'Something went wrong. Please try again later.', 'error');
        });
});

// Cancel update modal
document.getElementById('cancelUpdate').addEventListener('click', () => {
    document.getElementById('update-modal').style.display = 'none';
});

// Close modal if clicking outside content
window.addEventListener('click', function (event) {
    const modal = document.getElementById('update-modal');
    if (event.target === modal) {
        modal.style.display = 'none';
    }
});
