document.addEventListener("DOMContentLoaded", function () {
    fetchSuppliers();

    // Form submission for adding new supplier
    document.getElementById('addSupplierForm').addEventListener('submit', function(event) {
        event.preventDefault();
        addSupplier();
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
// Fetch suppliers and display them in cards
function fetchSuppliers() {
    fetch('http://localhost:3000/fetch_suppliers.php')
    .then(response => response.json())
    .then(data => {
        if (Array.isArray(data) && data.length > 0) {
            const suppliersContainer = document.getElementById('suppliers-container');
            suppliersContainer.innerHTML = ''; // Clear any existing content

            // Create a card for each supplier
            data.forEach(supplier => {
                const supplierCard = document.createElement('div');
                supplierCard.classList.add('supplier-card');
                supplierCard.setAttribute('data-id', supplier.id);

                supplierCard.innerHTML = `
                    <h3>${supplier.supplier_name}</h3>
                    <p>Contact: <strong>${supplier.contact_number}</strong></p>
                    <p>Email: <strong>${supplier.email}</strong></p>
                    <p>Address: <strong>${supplier.address}</strong></p>
                    <div class="button-container">
                        <button class="edit-btn" data-id="${supplier.id}">Edit</button>
                        <button class="delete-btn" data-id="${supplier.id}">Delete</button>
                    </div>
                `;
                
                suppliersContainer.appendChild(supplierCard);
            });

            // Add event listeners for Edit and Delete buttons
            document.querySelectorAll('.edit-btn').forEach(button => {
                button.addEventListener('click', handleEdit);
            });

            document.querySelectorAll('.delete-btn').forEach(button => {
                button.addEventListener('click', handleDelete);
            });
        } else {
            Swal.fire({
                icon: 'info',
                title: 'No Suppliers Found',
                text: 'There are no suppliers to display.',
            });
        }
    });
}

// Add a new supplier
function addSupplier() {
    const supplierName = document.getElementById('supplier-name').value;
    const contactNumber = document.getElementById('supplier-contact').value;
    const email = document.getElementById('supplier-email').value;
    const address = document.getElementById('supplier-address').value;

    const data = {
        supplier_name: supplierName,
        contact_number: contactNumber,
        email: email,
        address: address
    };

    fetch('http://localhost:3000/add_supplier.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            Swal.fire({
                icon: 'success',
                title: 'Success',
                text: data.message
            }).then(() => {
                fetchSuppliers(); // Reload supplier list
                document.getElementById('addSupplierForm').reset(); // Reset form
            });
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: data.message
            });
        }
    })
    .catch(error => {
        console.error('Error:', error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Something went wrong, please try again later.'
        });
    });
}

// Edit a supplier
function handleEdit(event) {
    const supplierId = event.target.dataset.id;

    // Fetch supplier data based on the supplier ID
    fetch(`get_supplier_details.php?id=${supplierId}`)
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            const supplier = data.supplier;

            // Pre-fill the form fields with the supplier's current details
            document.getElementById('editSupplierId').value = supplier.id;
            document.getElementById('editSupplierName').value = supplier.supplier_name;
            document.getElementById('editSupplierContact').value = supplier.contact_number;
            document.getElementById('editSupplierEmail').value = supplier.email;
            document.getElementById('editSupplierAddress').value = supplier.address;

            // Show the modal
            document.getElementById('editSupplierModal').style.display = 'flex';
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: data.message
            });
        }
    });
}

// Submit the edited supplier form after uniqueness check
document.getElementById('editSupplierForm').addEventListener('submit', function(event) {
    event.preventDefault();

    // Get the values from the form
    const supplierId = document.getElementById('editSupplierId').value;
    const supplierName = document.getElementById('editSupplierName').value;
    const contactNumber = document.getElementById('editSupplierContact').value;
    const email = document.getElementById('editSupplierEmail').value;
    const address = document.getElementById('editSupplierAddress').value;

    const updatedData = {
        supplier_id: supplierId,
        supplier_name: supplierName,
        contact_number: contactNumber,
        email: email,
        address: address
    };

    // Check if supplier name and email are unique (excluding the current supplier)
    checkSupplierUniqueness(supplierId, contactNumber, email)
        .then(isUnique => {
            if (isUnique) {
                // If unique, submit the update
                fetch('edit_supplier.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(updatedData)
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        Swal.fire({
                            icon: 'success',
                            title: 'Success',
                            text: data.message
                        }).then(() => {
                            fetchSuppliers(); // Reload supplier list
                            document.getElementById('editSupplierModal').style.display = 'none'; // Hide modal
                        });
                    } else {
                        Swal.fire({
                            icon: 'error',
                            title: 'Error',
                            text: data.message
                        });
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: 'Something went wrong, please try again later.'
                    });
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Duplicate Data',
                    text: 'The supplier name or email is already taken by another supplier.'
                });
            }
        })
        .catch(error => {
            console.error('Error checking uniqueness:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'There was an error checking the supplier details.'
            });
        });
});

function checkSupplierUniqueness(supplierId, contactNumber, email) {
    return fetch(`check_supplier_uniqueness.php?supplier_id=${supplierId}&contact_number=${contactNumber}&email=${email}`)
        .then(response => response.json())
        .then(data => {
            if (data.errors && data.errors.length > 0) {
                // If there are errors, display them
                Swal.fire({
                    icon: 'error',
                    title: 'Duplicate Data',
                    text: data.errors.join(', ')
                });
                return false;  // Return false if there are errors
            }
            return {
                isContactUnique: data.isContactUnique,
                isEmailUnique: data.isEmailUnique
            };
        })
        .catch(error => {
            console.error('Error checking uniqueness:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'There was an error checking the supplier details.'
            });
            throw error;
        });
}


document.getElementById('cancelEditBtn').addEventListener('click', function() {
    // Reset the form fields
    document.getElementById('editSupplierForm').reset();

    // Hide the modal
    document.getElementById('editSupplierModal').style.display = 'none';
});


// Event listener for the "Save Supplier" button
document.getElementById('saveSupplier').addEventListener('click', function(event) {
    // Prevent the default form submission behavior
    event.preventDefault();

    // Save supplier details logic here (AJAX or form submission)
    // Example: Add your code to save the supplier details to the server

    // After the supplier is saved, reset the input fields
    document.getElementById('supplier-name').value = ''; // Clear supplier name input
    document.getElementById('supplier-contact').value = ''; // Clear contact number input
    document.getElementById('supplier-email').value = ''; // Clear email input
    document.getElementById('supplier-address').value = ''; // Clear address input

   
});


// Delete a supplier
function handleDelete(event) {
    const supplierId = event.target.dataset.id;

    // Confirm before deleting
    Swal.fire({
        title: 'Are you sure?',
        text: 'Do you want to delete this supplier?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'Cancel'
    }).then((result) => {
        if (result.isConfirmed) {
            // Send GET request to the server to delete the supplier
            fetch(`delete_supplier.php?id=${supplierId}`, {
                method: 'GET', // Send GET request
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    Swal.fire({
                        icon: 'success',
                        title: 'Deleted!',
                        text: data.message
                    }).then(() => {
                        // Remove the supplier card from the UI
                        const supplierCard = document.querySelector(`.supplier-card[data-id="${supplierId}"]`);
                        if (supplierCard) {
                            supplierCard.remove();
                        }
                    });
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: data.message
                    });
                }
            })
            .catch(error => {
                console.error('Error:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'There was an issue deleting the supplier. Please try again later.'
                });
            });
        }
    });
}


