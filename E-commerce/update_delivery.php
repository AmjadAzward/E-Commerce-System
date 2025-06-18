<?php
// Ensure proper content type
header('Content-Type: application/json');

$username = 'system';
$password = 'AMJU';
$connection_string = 'localhost/XEPDB1';

// Establish Oracle connection
$conn = oci_connect($username, $password, $connection_string);

// Get the raw POST data (JSON)
$data = json_decode(file_get_contents('php://input'), true);

// Check if data is received
if (!$data || !isset($data['delivery_id']) || !isset($data['order_id']) || !isset($data['delivery_date']) || !isset($data['shipping_date'])) {
    echo json_encode(['success' => false, 'error' => 'Missing required fields.']);
    exit;
}

// Extract the data
$delivery_id = $data['delivery_id'];
$order_id = $data['order_id'];
$delivery_date = $data['delivery_date'];
$shipping_date = $data['shipping_date'];



// Step 1: Check for order uniqueness except the selected one
$checkSql = "SELECT COUNT(*) FROM delivery WHERE ORDER_ID = :order_id AND DELIVERY_ID != :delivery_id";
$checkStid = oci_parse($conn, $checkSql);
oci_bind_by_name($checkStid, ":order_id", $order_id);
oci_bind_by_name($checkStid, ":delivery_id", $delivery_id);

oci_execute($checkStid);
$row = oci_fetch_row($checkStid);
if ($row[0] > 0) {
    echo json_encode(['success' => false, 'error' => 'This order ID already exists with a different delivery ID.']);
    oci_free_statement($checkStid);
    oci_close($conn);
    exit;
}

// Step 2: Update the delivery record
$sql = "UPDATE delivery SET ORDER_ID = :order_id, DELIVERY_DATE = TO_DATE(:delivery_date, 'YYYY-MM-DD'), SHIPPING_DATE = TO_DATE(:shipping_date, 'YYYY-MM-DD') WHERE DELIVERY_ID = :delivery_id";
$stid = oci_parse($conn, $sql);
oci_bind_by_name($stid, ":order_id", $order_id);
oci_bind_by_name($stid, ":delivery_date", $delivery_date);
oci_bind_by_name($stid, ":shipping_date", $shipping_date);
oci_bind_by_name($stid, ":delivery_id", $delivery_id);

// Execute the update query
if (oci_execute($stid)) {
    // Now update the order status message
    $status_message = "Your order will be shipped on " . $shipping_date;
    $updateStatusSql = "UPDATE orders SET status = :status_message WHERE order_id = :order_id";
    
    $statusStid = oci_parse($conn, $updateStatusSql);
    oci_bind_by_name($statusStid, ":status_message", $status_message);
    oci_bind_by_name($statusStid, ":order_id", $order_id);

    if (oci_execute($statusStid)) {
        echo json_encode(['success' => true, 'status_message' => $status_message]);
    } else {
        echo json_encode(['success' => false, 'error' => 'Failed to update order status message.']);
    }

    // Close the status update statement
    oci_free_statement($statusStid);
} else {
    echo json_encode(['success' => false, 'error' => 'Failed to update the delivery.']);
}

// Close the main statement and connection
oci_free_statement($stid);
oci_close($conn);
?>
