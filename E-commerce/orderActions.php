<?php
// Database connection details
$username = 'system'; // Change as needed
$password = 'AMJU'; // Change as needed
$connection_string = 'localhost/XEPDB1'; // Change this if needed

// Establish connection
$conn = oci_connect($username, $password, $connection_string);

if (!$conn) {
    $e = oci_error();
    die(json_encode(['success' => false, 'message' => 'Database connection failed', 'error' => $e['message']]));  
}

$orderId = $_POST['orderId'];
$status = $_POST['status'];
$totalAmount = isset($_POST['totalAmount']) ? $_POST['totalAmount'] : null;

$procedure = 'BEGIN process_order_action(:oid, :status, :total, :res); END;';

$stmt = oci_parse($conn, "BEGIN process_order_action(:oid, :status, :total); END;");
oci_bind_by_name($stmt, ":oid", $orderId);
oci_bind_by_name($stmt, ":status", $status);
oci_bind_by_name($stmt, ":total", $totalAmount);

$response = [
    'status' => $status,
    'message' => '',
];

if (oci_execute($stmt)) {
    if ($status === 'Accepted') {
        $response['message'] = "Order accepted successfully and payment added.";
        $response['paymentAdded'] = true;
    } elseif ($status === 'Cancelled') {
        $response['message'] = "Order cancelled successfully and stock restored.";
        $response['stockRestored'] = true;
    }
    $response['statusUpdated'] = true;
} else {
    $response['message'] = "Failed to process order.";
    $response['statusUpdated'] = false;
}

oci_free_statement($stmt);
oci_close($conn);

echo json_encode($response);
?>
