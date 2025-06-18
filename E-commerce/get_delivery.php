<?php
$username = 'system';
$password = 'AMJU';
$connection_string = 'localhost/XEPDB1';

// Establish Oracle connection
$conn = oci_connect($username, $password, $connection_string);
if (isset($_GET['delivery_id'])) {
    $delivery_id = $_GET['delivery_id'];

    // Prepare and execute the query to get the delivery details
    $query = "SELECT * FROM delivery WHERE DELIVERY_ID = :delivery_id";
    $stmt = oci_parse($conn, $query);
    
    // Bind the parameter
    oci_bind_by_name($stmt, ':delivery_id', $delivery_id);

    // Execute the query
    oci_execute($stmt);

    // Fetch the result
    $delivery = oci_fetch_assoc($stmt);

    if ($delivery) {
        echo json_encode(['success' => true, 'delivery' => $delivery]);
    } else {
        echo json_encode(['success' => false, 'error' => 'Delivery not found.']);
    }

    oci_free_statement($stmt);
} else {
    echo json_encode(['success' => false, 'error' => 'No delivery ID provided.']);
}

// Close the Oracle connection
oci_close($conn);
?>
