document.addEventListener("DOMContentLoaded", () => {
    const rightNav = document.querySelector('.right-nav');
    const isLoggedIn = localStorage.getItem('user');

    if (!isLoggedIn) {
        rightNav.innerHTML = `
            <li><a href="login.html">Login</a></li>
            <li><a href="register.html">Register</a></li>
        `;
    }

    const productList = document.getElementById("product-list");
    const cartCount = document.getElementById("cart-count");
    const totalPriceElement = document.getElementById("total-price");
    const cartItemsList = document.getElementById("cart-items");
    const cartSummaryTotal = document.getElementById("cart-summary-total");
    const cartDrawer = document.getElementById("cart-drawer");
    const openCartBtn = document.getElementById("open-cart");
    const clearCartBtn = document.getElementById("clear-cart");
    const cartIcon = document.getElementById("cart-icon");
    const cartDropdown = document.getElementById("cart");

    let cart = JSON.parse(localStorage.getItem("cart")) || [];

    function fetchProducts() {
        fetch("dairy.php")
            .then(response => response.json())
            .then(data => {
                if (!Array.isArray(data)) {
                    productList.innerHTML = `<p>No fruits found.</p>`;
                    return;
                }

                productList.innerHTML = '';

                data.forEach(product => {
                    const cartItem = cart.find(item => item.name === product.PRODUCT_NAME && item.price === parseFloat(product.PRICE));
                    let remainingStock = product.STOCK_QUANTITY;

                    if (cartItem) {
                        remainingStock -= cartItem.quantity;
                    }

                    const item = document.createElement("div");
                    item.classList.add("product-item");

                    item.innerHTML = `
                        <img src="uploads/${product.PRODUCT_IMAGE}" alt="${product.PRODUCT_NAME}">
                        <h3>${product.PRODUCT_NAME}</h3>
                        <p>Price: Rs ${parseFloat(product.PRICE).toFixed(2)}</p>
                        <p>Stock: <span id="stock-${product.ID}">${remainingStock}</span></p>
                        <input type="number" min="1" max="${remainingStock}" value="1" class="quantity" id="quantity-${product.ID}" ${remainingStock === 0 ? 'disabled' : ''}>
                        <button class="add-to-cart" 
                            data-id="${product.ID}"
                            data-name="${product.PRODUCT_NAME}"
                            data-price="${product.PRICE}"
                            data-image="${product.PRODUCT_IMAGE}"
                            data-stock="${remainingStock}" 
                            ${remainingStock === 0 ? 'disabled' : ''}>
                            ${remainingStock === 0 ? 'Out of Stock' : 'Add to Cart'}
                        </button>
                    `;

                    productList.appendChild(item);
                });
            })
            .catch(() => {
                productList.innerHTML = `<p>Unable to load fruits at the moment.</p>`;
            });
    }

    fetchProducts();

    document.addEventListener("click", function (event) {
        if (event.target.classList.contains("add-to-cart")) {
            const username = localStorage.getItem("username");
            if (!username) {
                Swal.fire({
                    title: 'Login Required',
                    text: 'Please login to add items to your cart.',
                    icon: 'warning',
                    confirmButtonText: 'OK'
                });
                return;
            }

            const button = event.target;
            const productId = button.dataset.id;
            const productName = button.dataset.name;
            const productPrice = parseFloat(button.dataset.price);
            const productImage = button.dataset.image;
            let stock = parseInt(button.dataset.stock);

            const quantityInput = document.getElementById(`quantity-${productId}`);
            const quantity = parseInt(quantityInput.value);

            if (quantity <= 0 || quantity > stock) {
                Swal.fire({
                    title: 'Invalid Quantity',
                    text: `Enter a quantity between 1 and ${stock}.`,
                    icon: 'error',
                    confirmButtonText: 'OK'
                });
                return;
            }

            cart = JSON.parse(localStorage.getItem("cart")) || [];
            const existingProduct = cart.find(item => item.name === productName && item.price === productPrice);

            if (existingProduct) {
                const totalQuantity = existingProduct.quantity + quantity;
                if (quantity > (stock + existingProduct.quantity)) {
                    Swal.fire({
                        title: 'Stock Limit Reached',
                        text: `You already have ${existingProduct.quantity} in your cart. Only ${stock} left.`,
                        icon: 'error',
                        confirmButtonText: 'OK'
                    });
                    return;
                } else {
                    existingProduct.quantity += quantity;
                    existingProduct.id = productId;
                }
            } else {
                cart.push({
                    id: productId,
                    name: productName,
                    price: productPrice,
                    quantity: quantity,
                    image: productImage
                });
            }

            localStorage.setItem("cart", JSON.stringify(cart));
            updateCartUI();
            updateCartSummaryTotalOnly();

            const newStock = stock - quantity;
            const stockElement = document.getElementById(`stock-${productId}`);
            const quantityField = document.getElementById(`quantity-${productId}`);

            stockElement.textContent = newStock;
            quantityField.max = newStock;
            button.dataset.stock = newStock;

            if (newStock === 0) {
                button.disabled = true;
                quantityField.disabled = true;
                button.textContent = "Out of Stock";
            }

            console.log("Updated Cart:", cart);
        }

        if (event.target.classList.contains("remove-item")) {
            const index = parseInt(event.target.dataset.index);
            removeFromCart(index);
        }
    });

    function updateCartUI() {
        cart = JSON.parse(localStorage.getItem("cart")) || [];
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        const total = cart.reduce((sum, item) => sum + item.quantity * parseFloat(item.price), 0).toFixed(2);

        if (cartCount) cartCount.textContent = totalItems;
        if (totalPriceElement) totalPriceElement.textContent = `Rs ${total}`;

        if (cartItemsList) {
            cartItemsList.innerHTML = '';

            if (cart.length === 0) {
                cartItemsList.innerHTML = '<li>Your cart is empty.</li>';
                return;
            }

            cart.forEach((item, index) => {
                const itemTotal = (item.quantity * parseFloat(item.price)).toFixed(2);
                const li = document.createElement("li");
                li.innerHTML = `
                    <div style="display: flex; align-items: center; justify-content: space-between;">
                        <span>${item.name} x ${item.quantity} - Rs ${itemTotal}</span>
                        <button class="remove-item" data-index="${index}">Remove</button>
                    </div>
                `;
                cartItemsList.appendChild(li);
            });
        }
    }

    function updateCartSummaryTotalOnly() {
        cart = JSON.parse(localStorage.getItem("cart")) || [];
        const total = cart.reduce((sum, item) => sum + item.quantity * parseFloat(item.price), 0).toFixed(2);
        if (cartSummaryTotal) {
            cartSummaryTotal.textContent = `Rs ${total}`;
        }
    }

    function removeFromCart(index) {
        cart.splice(index, 1);
        localStorage.setItem("cart", JSON.stringify(cart));
        updateCartUI();
        updateCartSummaryTotalOnly();
        fetchProducts();
        console.log("Updated Cart:", cart);
    }

    if (openCartBtn && cartDrawer) {
        openCartBtn.addEventListener("click", () => {
            cartDrawer.classList.toggle("open");
        });
    }

    if (clearCartBtn) {
        clearCartBtn.addEventListener("click", () => {
            localStorage.removeItem("cart");
            cart = [];
            updateCartUI();
            updateCartSummaryTotalOnly();
            fetchProducts();
            console.log("Updated Cart:", cart);
        });
    }

    if (cartIcon && cartDropdown) {
        cartIcon.addEventListener('click', () => {
            cartDropdown.style.display = cartDropdown.style.display === 'block' ? 'none' : 'block';
        });
    }

    updateCartUI();
    updateCartSummaryTotalOnly();

    const checkoutBtn = document.getElementById("checkout-btn");

    if (checkoutBtn) {
        checkoutBtn.addEventListener("click", () => {
            cart = JSON.parse(localStorage.getItem("cart")) || [];

            if (cart.length === 0) {
                Swal.fire({
                    title: 'Empty Cart',
                    text: 'Your cart is empty. Please add items before checkout.',
                    icon: 'info',
                    confirmButtonText: 'OK'
                });
                return;
            }

            const total = cart.reduce((sum, item) => sum + item.quantity * parseFloat(item.price), 0).toFixed(2);
            localStorage.setItem("totalAmount", total);

            const cartSummary = cart.map(item => `${item.name} x ${item.quantity} = Rs ${(item.quantity * item.price).toFixed(2)}`).join('\n');

            Swal.fire({
                title: 'Confirm Your Order',
                html: `<pre style="text-align:left;">${cartSummary}</pre><br><strong>Total: Rs ${total}</strong>`,
                icon: 'info',
                showCancelButton: true,
                confirmButtonText: 'Yes, Proceed to Payment',
                cancelButtonText: 'Cancel'
            }).then((result) => {
                if (result.isConfirmed) {
                    console.log("Proceeding to payment with amount: Rs", total);
                    window.location.href = "checkout.html";
                }
            });
        });
    }
});
