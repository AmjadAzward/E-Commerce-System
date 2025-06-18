<?php
header('Content-Type: application/json');

$username = 'system';
$password = 'AMJU';
$connection_string = 'localhost/XEPDB1';

// Establish Oracle connection
$conn = oci_connect($username, $password, $connection_string);

if (!$conn) {
    echo json_encode(['success' => false, 'error' => 'Database connection failed: ' . oci_error()]);
    exit;
}

// Retrieve POST data
$deliveryId = $_POST['delivery_id'];
$orderId = $_POST['order_id']; // Assuming order ID is passed for status update

// Start a transaction

// SQL query to check if delivery exists
$sqlCheck = "SELECT COUNT(*) FROM delivery WHERE delivery_id = :delivery_id";
$statementCheck = oci_parse($conn, $sqlCheck);
oci_bind_by_name($statementCheck, ':delivery_id', $deliveryId);

// Execute the check query
oci_execute($statementCheck);
$row = oci_fetch_row($statementCheck);

if ($row[0] == 0) {
    echo json_encode(['success' => false, 'error' => 'Delivery ID not found']);
    oci_free_statement($statementCheck);
    oci_close($conn);
    exit;
}

oci_free_statement($statementCheck);

// SQL query to delete the delivery
$sqlDelete = "DELETE FROM delivery WHERE delivery_id = :delivery_id";
$statementDelete = oci_parse($conn, $sqlDelete);

// Bind parameter for delete
oci_bind_by_name($statementDelete, ':delivery_id', $deliveryId);

// Execute the delete query
$deleteSuccess = oci_execute($statementDelete);

if ($deleteSuccess) {
    // SQL query to update the order status
    $sqlUpdate = "UPDATE orders SET status = 'Your order delivery has been cancelled. Your order will arrive shortly.' WHERE order_id = :order_id";
    $statementUpdate = oci_parse($conn, $sqlUpdate);

    // Bind parameter for order status update
    oci_bind_by_name($statementUpdate, ':order_id', $orderId);

    // Execute the update query
    $updateSuccess = oci_execute($statementUpdate);

    if ($updateSuccess) {
        // Commit transaction if both delete and update are successful
        oci_commit($conn);
        echo json_encode(['success' => true, 'message' => 'Delivery deleted and order status updated']);
    } else {
        // Rollback if updating the order status fails
        oci_rollback($conn);
        echo json_encode(['success' => false, 'error' => 'Failed to update order status: ' . oci_error($conn)]);
    }

    // Clean up the update statement
    oci_free_statement($statementUpdate);
} else {
    // Rollback if deleting the delivery fails
    oci_rollback($conn);
    echo json_encode(['success' => false, 'error' => 'Failed to delete delivery: ' . oci_error($conn)]);
}

// Clean up the delete statement and close the connection
oci_free_statement($statementDelete);
oci_close($conn);
?>
