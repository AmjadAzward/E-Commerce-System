// Replace all alerts and confirms with SweetAlert2
document.addEventListener("DOMContentLoaded", () => {
    const supplierSelect = document.getElementById("supplier-id");
    const addProductForm = document.getElementById("addProductForm");
    const productContainer = document.getElementById("product-container");
    const productFilter = document.getElementById("product-filter");
    const productImageInput = document.getElementById("product-image");
    const imagePreview = document.getElementById("image-preview");
    const clearFieldsBtn = document.getElementById("clearFieldsBtn");




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
    // Load suppliers
    fetch("products.php?action=get_suppliers")
        .then(res => res.json())
        .then(data => {
            if (Array.isArray(data)) {
                supplierSelect.innerHTML = `<option value="">Select Supplier</option>` +
                    data.map(s =>
                        `<option value="${s.ID}">${s.SUPPLIER_NAME}</option>`
                    ).join('');
            } else {
                console.error("Invalid supplier data format:", data);
            }
        })
        .catch(err => console.error("Error loading suppliers:", err));

    // Image preview
    productImageInput.addEventListener("change", () => {
        const file = productImageInput.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = e => {
                imagePreview.src = e.target.result;
                imagePreview.style.display = "block";
            };
            reader.readAsDataURL(file);
        } else {
            imagePreview.src = "#";
            imagePreview.style.display = "none";
        }
    });

    // Add product
    addProductForm.addEventListener("submit", (e) => {
        e.preventDefault();

        const stock = parseInt(addProductForm.querySelector("[name='product-stock']").value);
        const price = parseFloat(addProductForm.querySelector("[name='product-price']").value);
        if (isNaN(stock) || stock < 0 || isNaN(price) || price < 0) {
            return Swal.fire("Warning", "Stock and Price must be non-negative numbers.", "warning");
        }

        const formData = new FormData(addProductForm);

        fetch("products.php?action=add_product", {
            method: "POST",
            body: formData
        })
        .then(res => res.json())
        .then(result => {
            Swal.fire(result.success ? "Success" : "Error", result.message, result.success ? "success" : "error");
            if (result.success) {
                addProductForm.reset();
                imagePreview.src = "#";
                imagePreview.style.display = "none";
                loadProductsByCategory();
            }
        })
        .catch(err => {
            console.error("Error adding product:", err);
            Swal.fire("Error", "Error adding product.", "error");
        });
    });

    // Clear fields
    clearFieldsBtn.addEventListener("click", () => {
        addProductForm.reset();
        imagePreview.src = "#";
        imagePreview.style.display = "none";
    });

    productFilter.addEventListener("change", loadProductsByCategory);

    function loadProductsByCategory() {
        const category = productFilter.value;
        fetch(`products.php?action=get_products&category=${category}`)
            .then(res => res.json())
            .then(products => {
                if (Array.isArray(products)) {
                    productContainer.innerHTML = products.map(p =>
                        `<div class="product-card">
                            <img src="uploads/${p.PRODUCT_IMAGE}" alt="${p.PRODUCT_NAME}" />
                            <h3>${p.PRODUCT_NAME}</h3>
                            <p>Category: ${p.CATEGORY}</p>
                            <p>Product ID: ${p.ID}</p>
                            <p>Price: Rs. ${p.PRICE}</p>
                            <p>Stock: ${p.STOCK_QUANTITY}</p>
                            <div class="button-container">
                                <button class="update-button" data-id="${p.ID}">Update</button>
                                <button class="delete-button" data-id="${p.ID}">Delete</button>
                            </div>
                        </div>`).join('');

                    document.querySelectorAll('.update-button').forEach(button => {
                        button.addEventListener("click", () => {
                            const productId = button.getAttribute("data-id");
                            openUpdateModal(productId);
                        });
                    });

                    document.querySelectorAll('.delete-button').forEach(button => {
                        button.addEventListener("click", () => {
                            const productId = button.getAttribute("data-id");
                            Swal.fire({
                                title: "Are you sure?",
                                text: "This action cannot be undone!",
                                icon: "warning",
                                showCancelButton: true,
                                confirmButtonText: "Yes, delete it!",
                                cancelButtonText: "Cancel"
                            }).then(result => {
                                if (result.isConfirmed) {
                                    deleteProduct(productId);
                                }
                            });
                        });
                    });
                } else {
                    console.error("Invalid products data format:", products);
                }
            })
            .catch(err => console.error("Error loading products:", err));
    }

    function deleteProduct(productId) {
        fetch("delete_product.php?action=delete_product", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ "product-id": productId })
        })
        .then(res => res.json())
        .then(result => {
            Swal.fire(result.success ? "Deleted!" : "Failed", result.message || "Unknown error", result.success ? "success" : "error");
            if (result.success) {
                loadProductsByCategory();
            }
        })
        .catch(err => {
            console.error("Error deleting product:", err);
            Swal.fire("Error", "Error deleting product.", "error");
        });
    }

    function openUpdateModal(productId) {
        fetch(`products.php?action=get_product&id=${productId}`)
            .then(res => res.json())
            .then(product => {
                if (product && product.ID) {
                    fetch("products.php?action=get_suppliers")
                        .then(res => res.json())
                        .then(suppliers => {
                            const supplierSelect = document.getElementById("supplier-id-update");
                            supplierSelect.innerHTML = `<option value="">Select Supplier</option>` +
                                suppliers.map(s =>
                                    `<option value="${s.ID}" ${s.ID == product.SUPPLIER_ID ? 'selected' : ''}>${s.SUPPLIER_NAME}</option>`
                                ).join('');

                            document.getElementById("update-product-id").value = product.ID;
                            document.getElementById("update-product-name").value = product.PRODUCT_NAME;
                            document.getElementById("update-product-category").value = product.CATEGORY;
                            document.getElementById("update-product-price").value = product.PRICE;
                            document.getElementById("update-product-stock").value = product.STOCK_QUANTITY;

                            const updateImagePreview = document.getElementById("update-image-preview");
                            updateImagePreview.src = `uploads/${product.PRODUCT_IMAGE}`;
                            updateImagePreview.style.display = "block";

                            document.getElementById("update-modal").style.display = "block";
                        })
                        .catch(err => {
                            console.error("Error loading suppliers:", err);
                            Swal.fire("Error", "Failed to load suppliers.", "error");
                        });
                } else {
                    Swal.fire("Error", "Failed to load product details.", "error");
                }
            })
            .catch(err => {
                console.error("Error loading product for update:", err);
                Swal.fire("Error", "Failed to load product details.", "error");
            });
    }

    document.getElementById("update-product-image").addEventListener("change", function () {
        const file = this.files[0];
        const preview = document.getElementById("update-image-preview");
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                preview.src = e.target.result;
                preview.style.display = "block";
            };
            reader.readAsDataURL(file);
        }
    });

    document.getElementById("close-update-modal").addEventListener("click", () => {
        document.getElementById("update-modal").style.display = "none";
    });

    document.getElementById("updateProductForm").addEventListener("submit", (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);

        fetch("products.php?action=update_product", {
            method: "POST",
            body: formData
        })
        .then(res => res.json())
        .then(result => {
            Swal.fire(result.success ? "Success" : "Error", result.message, result.success ? "success" : "error");
            if (result.success) {
                document.getElementById("update-modal").style.display = "none";
                loadProductsByCategory();
            }
        })
        .catch(err => {
            console.error("Error updating product:", err);
            Swal.fire("Error", "Failed to update product.", "error");
        });
    });

    // Initial product load
    productFilter.dispatchEvent(new Event("change"));
});
