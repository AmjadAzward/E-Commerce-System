<?php
header('Content-Type: application/json');

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

$sql = "
    SELECT 
        o.ORDER_ID,
        o.CUSTOMER_ID,
        o.TOTAL_AMOUNT,
        o.ORDER_DATE,
        o.STATUS,
        oi.PRODUCT_ID,
        oi.QUANTITY
    FROM ORDERS o
    JOIN ORDER_ITEMS oi ON o.ORDER_ID = oi.ORDER_ID
    ORDER BY o.ORDER_ID
";

$stid = oci_parse($conn, $sql);
oci_execute($stid);

$orders = [];
while ($row = oci_fetch_assoc($stid)) {
    $orders[] = $row;
}

oci_free_statement($stid);
oci_close($conn);

// Return as JSON
echo json_encode($orders);
?>
