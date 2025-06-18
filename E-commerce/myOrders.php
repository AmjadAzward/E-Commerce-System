<?php
header('Content-Type: application/json');

// Database connection details
$username = 'system'; // Change as needed
$password = 'AMJU';   // Change as needed
$connection_string = 'localhost/XEPDB1'; // Adjust if needed

// Get customerId from URL query parameter
$customerId = isset($_GET['customerId']) ? $_GET['customerId'] : null;

if (!$customerId) {
    echo json_encode(['success' => false, 'message' => 'Missing customerId']);
    exit;
}

// Establish database connection
$conn = oci_connect($username, $password, $connection_string);

if (!$conn) {
    $e = oci_error();
    echo json_encode(['success' => false, 'message' => 'Database connection failed', 'error' => $e['message']]);
    exit;
}

// SQL to fetch orders for the specific customer
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
    WHERE o.CUSTOMER_ID = :customerId
    ORDER BY o.ORDER_ID
";

$stid = oci_parse($conn, $sql);
oci_bind_by_name($stid, ':customerId', $customerId);
oci_execute($stid);

$orders = [];
while ($row = oci_fetch_assoc($stid)) {
    $orders[] = $row;
}

oci_free_statement($stid);
oci_close($conn);

// Return JSON response with fetched orders
echo json_encode($orders);
?>
