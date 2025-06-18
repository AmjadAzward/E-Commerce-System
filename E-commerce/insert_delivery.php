<?php
// Database connection settings
$username = 'system';
$password = 'AMJU';
$connection_string = 'localhost/XEPDB1';

try {
    // Establish Oracle connection
    $conn = oci_connect($username, $password, $connection_string);

    if (!$conn) {
        $error = oci_error();
        throw new Exception($error['message']);
    }

    // Get JSON data from frontend
    $data = json_decode(file_get_contents('php://input'), true);

    $order_id = $data['order_id'];
    $delivery_date = $data['delivery_date'];
    $shipping_date = $data['shipping_date'];

    // ✅ Step 1: Check if delivery already exists for the order
    $check_sql = 'SELECT COUNT(*) AS cnt FROM delivery WHERE order_id = :order_id';
    $check_stmt = oci_parse($conn, $check_sql);
    oci_bind_by_name($check_stmt, ':order_id', $order_id);
    oci_execute($check_stmt);

    $row = oci_fetch_assoc($check_stmt);
    if ($row && $row['CNT'] > 0) {
        throw new Exception('A delivery already exists for this order.');
    }

    // ✅ Step 2: Call procedure if unique
    $insert_sql = 'BEGIN insert_delivery(:order_id, TO_DATE(:delivery_date, \'YYYY-MM-DD\'), TO_DATE(:shipping_date, \'YYYY-MM-DD\')); END;';
    $insert_stmt = oci_parse($conn, $insert_sql);

    oci_bind_by_name($insert_stmt, ':order_id', $order_id);
    oci_bind_by_name($insert_stmt, ':delivery_date', $delivery_date);
    oci_bind_by_name($insert_stmt, ':shipping_date', $shipping_date);

    oci_execute($insert_stmt);

    // Close resources
    oci_free_statement($check_stmt);
    oci_free_statement($insert_stmt);
    oci_close($conn);

    echo json_encode(['success' => true]);

} catch (Exception $e) {
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
?>
