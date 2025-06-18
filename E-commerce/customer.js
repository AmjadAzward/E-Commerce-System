document.addEventListener("DOMContentLoaded", function () {
    loadCustomers(); // Load customers when the page loads



    
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
    function loadCustomers() {
        fetch("load_customers.php")
            .then(response => response.json())
            .then(data => {
                const container = document.getElementById("customers-container");
                container.innerHTML = ""; // Clear previous content

                if (!Array.isArray(data) || data.length === 0) {
                    container.innerHTML = "<p>No customers found.</p>";
                    return;
                }

                data.forEach(customer => {
                    const card = document.createElement("div");
                    card.classList.add("customer-card");
                    card.innerHTML = `
                        <h3>${customer.FULL_NAME}</h3>
                        <p><strong>Username:</strong> ${customer.USERNAME}</p>
                        <p><strong>Email:</strong> ${customer.EMAIL}</p>
                        <p><strong>Contact:</strong> ${customer.CONTACT}</p>
                        <button class="edit-btn" data-id="${customer.ID}" 
                            data-fullname="${customer.FULL_NAME}" 
                            data-username="${customer.USERNAME}"
                            data-email="${customer.EMAIL}" 
                            data-contact="${customer.CONTACT}">Edit</button>
                        <button class="delete-btn" data-id="${customer.ID}">Delete</button>
                    `;
                    container.appendChild(card);
                });
            })
            .catch(error => console.error("Error loading customers:", error));
    }

    // Event Delegation for Edit and Delete Buttons
    document.getElementById("customers-container").addEventListener("click", function (event) {
        if (event.target.matches(".delete-btn")) {
            const customerId = event.target.getAttribute("data-id");
            deleteCustomer(customerId);
        } else if (event.target.matches(".edit-btn")) {
            const customer = {
                id: event.target.getAttribute("data-id"),
                full_name: event.target.getAttribute("data-fullname"),
                username: event.target.getAttribute("data-username"),
                email: event.target.getAttribute("data-email"),
                contact: event.target.getAttribute("data-contact")
            };
            openEditModal(customer);
        }
    });

    // Function to Delete Customer
    function deleteCustomer(id) {
        Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'No, cancel!',
            reverseButtons: true
        }).then((result) => {
            if (result.isConfirmed) {
                fetch("delete_customer.php", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ id: id })
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        Swal.fire('Deleted!', 'Customer has been deleted.', 'success');
                        loadCustomers(); // Refresh customer list without reloading page
                    } else {
                        Swal.fire('Failed!', 'Error deleting the customer.', 'error');
                    }
                })
                .catch(error => console.error("Error deleting customer:", error));
            }
        });
    }

    // Edit Modal Handling
    const editModal = document.getElementById("editCustomerModal");
    const cancelEditBtn = document.getElementById("cancelEditBtn");
    const editForm = document.getElementById("editCustomerForm");

    // Ensure the modal is hidden initially (fix for reload issue)
    editModal.style.display = "none";

    function openEditModal(customer) {
        document.getElementById("editCustomerId").value = customer.id;
        document.getElementById("editFullName").value = customer.full_name;
        document.getElementById("editUsername").value = customer.username;
        document.getElementById("editEmail").value = customer.email;
        document.getElementById("editContact").value = customer.contact;

        editModal.style.display = "block";
    }

    cancelEditBtn.addEventListener("click", function () {
        editModal.style.display = "none";
    });

    window.addEventListener("click", function (event) {
        if (event.target === editModal) {
            editModal.style.display = "none";
        }
    });

    // Handle form submission for updating customer details
    editForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const formData = new FormData(editForm);
        fetch("update_customer.php", {
            method: "POST",
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                Swal.fire('Updated!', 'Customer details updated.', 'success');
                editModal.style.display = "none"; // Hide modal after successful update
                loadCustomers(); // Refresh customer list dynamically
            } else {
                Swal.fire('Failed!', data.message, 'error');  // Display the message from PHP (e.g. "Email already exists.")
            }
        })
        .catch(error => console.error("Error updating customer:", error));
    });
});
