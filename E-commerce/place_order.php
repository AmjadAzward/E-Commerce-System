<?php
// Get the raw POST data
$rawData = file_get_contents('php://input');

// Decode the JSON data into a PHP array
$orderData = json_decode($rawData, true);

// Check if the necessary data is received
if (isset($orderData['customer_id'], $orderData['total_amount'], $orderData['items'], $orderData['delivery_address'])) {
    $customerId = $orderData['customer_id'];
    $totalAmount = $orderData['total_amount'];
    $items = $orderData['items'];
    $deliveryAddress = $orderData['delivery_address']; // Get the delivery address from the received data

    // Database connection
    $username = 'system';
    $password = 'AMJU';
    $connection_string = 'localhost/XEPDB1';
    
    $conn = oci_connect($username, $password, $connection_string);
    
    if (!$conn) {
        echo json_encode(["success" => false, "message" => "Database connection failed"]);
        exit;
    }

    // Begin a transaction and insert order into the orders table
    $orderQuery = "
        BEGIN
            -- Insert into orders
            INSERT INTO orders (order_id, customer_id, total_amount, status, delivery_address)
            VALUES (orders_seq.nextval, :customer_id, :total_amount, 'Order Placed', :delivery_address)
            RETURNING order_id INTO :order_id;

            -- Insert order items
            FOR i IN 1..:cart_count LOOP
                INSERT INTO order_items (order_item_id, order_id, product_id, quantity)
                VALUES (order_items_seq.nextval, :order_id, :product_ids(i), :quantities(i));
            END LOOP;

            COMMIT;
        END;
    ";

    // Prepare the PL/SQL block
    $stmt = oci_parse($conn, $orderQuery);

    // Bind variables (using customer ID, total amount, and delivery address)
    oci_bind_by_name($stmt, ':customer_id', $customerId);
    oci_bind_by_name($stmt, ':total_amount', $totalAmount);
    oci_bind_by_name($stmt, ':delivery_address', $deliveryAddress); // Bind the delivery address

    // Prepare product_ids and quantities as arrays
    $productIds = array_column($items, 'id'); // Extract product ids from items
    $quantities = array_column($items, 'quantity'); // Extract quantities from items

    // Bind the arrays of product_ids and quantities
    oci_bind_array_by_name($stmt, ':product_ids', $productIds, count($productIds), -1, SQLT_INT);
    oci_bind_array_by_name($stmt, ':quantities', $quantities, count($quantities), -1, SQLT_INT);

    // Bind cart count
    $cartCount = count($items);
    oci_bind_by_name($stmt, ':cart_count', $cartCount);

    // Bind order_id variable to retrieve the generated order ID
    $orderId = null;
    oci_bind_by_name($stmt, ':order_id', $orderId, -1, SQLT_INT);

    // Execute the statement
    if (oci_execute($stmt)) {
        echo json_encode(['status' => 'success', 'message' => 'Order placed successfully']);
    } else {
        $e = oci_error($stmt);
        echo json_encode(['status' => 'error', 'message' => $e['message']]);
    }

    // Close the Oracle connection
    oci_free_statement($stmt);
    oci_close($conn);
} else {
    echo json_encode(['status' => 'error', 'message' => 'Invalid data received']);
}
?>
