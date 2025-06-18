<?php
// Database connection details
$username = 'system'; // Change as needed
$password = 'AMJU';   // Change as needed
$connection_string = 'localhost/XEPDB1'; // Adjust if needed

// Establish database connection
$conn = oci_connect($username, $password, $connection_string);
if (!$conn) {
    $error = oci_error();
    echo json_encode(['statusUpdated' => false, 'message' => 'Connection failed: ' . $error['message']]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $orderId = $_POST['orderId'];
    $status = $_POST['status'];

    // Prepare the SQL statement
    $sql = "UPDATE orders SET status = :status WHERE order_id = :orderId";
    $stmt = oci_parse($conn, $sql);

    // Bind parameters
    oci_bind_by_name($stmt, ":status", $status);
    oci_bind_by_name($stmt, ":orderId", $orderId, -1, SQLT_INT); // Use SQLT_INT for integer

    // Execute the statement
    $result = oci_execute($stmt);

    // Check if the update was successful
    if ($result) {
        echo json_encode(['statusUpdated' => true]);
    } else {
        $error = oci_error($stmt);
        echo json_encode(['statusUpdated' => false, 'message' => 'Failed to update status: ' . $error['message']]);
    }

    // Close the statement and connection
    oci_free_statement($stmt);
    oci_close($conn);
}
?>
