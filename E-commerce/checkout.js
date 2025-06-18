window.onload = function () {
    const totalAmount = localStorage.getItem('totalAmount');
    const cart = localStorage.getItem('cart');
    const username = localStorage.getItem('username');
    
    console.log(cart);
    console.log(username);

    // Fetch customerId using username
    if (username) {
        fetch('get_customer_ids.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username: username }),
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                localStorage.setItem('customerId', data.customer_id);
                console.log('Customer ID stored:', data.customer_id);
            } else {
                console.error('Customer ID fetch failed:', data.message);
            }
        })
        .catch(error => {
            console.error('Error fetching customer ID:', error);
        });
    }

    // Prompt for delivery address on page load
    Swal.fire({
        title: 'Enter Delivery Address',
        input: 'textarea',
        inputPlaceholder: 'Enter your delivery address here...',
        showCancelButton: true,
        confirmButtonText: 'Save Address',
        cancelButtonText: 'Cancel',
        inputValidator: (value) => {
            if (!value) {
                return 'You need to enter a delivery address!';
            }
        }
    }).then((result) => {
        if (result.isConfirmed) {
            const deliveryAddress = result.value;
            localStorage.setItem('deliveryAddress', deliveryAddress); // Save to localStorage
            console.log('Delivery Address saved:', deliveryAddress);
        }
    });

    document.getElementById('amount').value = totalAmount;
    const submitButton = document.getElementById('placeOrderBtn');

    submitButton.addEventListener('click', function (e) {
        e.preventDefault(); // Prevent form submission

        const cardName = document.getElementById('card-name').value.trim();
        const cardNumber = document.getElementById('card-number').value.trim();
        const expiryDate = document.getElementById('expiry-date').value;
        const cvv = document.getElementById('cvv').value.trim();

        // Validations
        if (cardName === '' || cardNumber === '' || expiryDate === '' || cvv === '') {
            Swal.fire({
                icon: 'warning',
                title: 'Incomplete Details',
                text: 'Please fill in all the payment details.',
            });
            return;
        }

        if (!/^\d{16}$/.test(cardNumber)) {
            Swal.fire({
                icon: 'error',
                title: 'Invalid Card Number',
                text: 'Card number must be exactly 16 digits.',
            });
            return;
        }

        if (!/^\d{3,4}$/.test(cvv)) {
            Swal.fire({
                icon: 'error',
                title: 'Invalid CVV',
                text: 'CVV must be 3 or 4 digits.',
            });
            return;
        }

        // Prepare order data
        let cartItems = [];
        if (cart) {
            cartItems = JSON.parse(cart);
        }

        const customerId = localStorage.getItem('customerId');
        const deliveryAddress = localStorage.getItem('deliveryAddress'); // Get delivery address from localStorage

        const formattedData = {
            customer_id: customerId ? parseInt(customerId) : 41,
            total_amount: parseFloat(totalAmount) || 0,
            items: cartItems.map(item => ({
                id: item.id,
                quantity: item.quantity
            })),
            payment_details: {
                card_name: cardName,
                card_number: cardNumber,
                expiry_date: expiryDate,
                cvv: cvv
            },
            delivery_address: deliveryAddress // Send the delivery address to PHP
        };

        // Send data to backend
        fetch('place_order.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formattedData),
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                Swal.fire({
                    icon: 'success',
                    title: 'Order Placed Successfully!',
                    text: 'Your order has been placed. You will be redirected shortly.',
                }).then(() => {
                    localStorage.removeItem('cart');
                    localStorage.removeItem('totalAmount');
                    localStorage.removeItem('deliveryAddress'); // Clear delivery address from localStorage
                    window.location.href = 'myOrders.html';
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Order Failed',
                    text: 'Error placing order: ' + data.message,
                });
            }
        })
        .catch(error => {
            console.error('Error:', error);
            Swal.fire({
                icon: 'error',
                title: 'An Error Occurred',
                text: 'Please try again later.',
            });
        });
    });
};
