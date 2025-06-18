<?php
// Database connection
$username = 'system';
$password = 'AMJU';
$connection_string = 'localhost/XEPDB1';

// Connect to Oracle
$conn = oci_connect($username, $password, $connection_string);

if (!$conn) {
    $e = oci_error();
    die(json_encode(['success' => false, 'message' => 'Database connection failed', 'error' => $e['message']]));
}

// PL/SQL block using ref cursor
$sql = "
    DECLARE
        v_cursor SYS_REFCURSOR;
    BEGIN
        OPEN :v_cursor FOR
            SELECT ID, PRODUCT_NAME, PRICE, PRODUCT_IMAGE, STOCK_QUANTITY
            FROM PRODUCTS
            WHERE CATEGORY = 'Vegetables';
    END;
";

// Parse and bind
$stmt = oci_parse($conn, $sql);
$cursor = oci_new_cursor($conn);
oci_bind_by_name($stmt, ':v_cursor', $cursor, -1, OCI_B_CURSOR);

// Execute PL/SQL block and cursor
oci_execute($stmt);
oci_execute($cursor);

// Fetch data
$products = [];
while ($row = oci_fetch_assoc($cursor)) {
    $products[] = $row;
}

// Cleanup
oci_free_statement($stmt);
oci_free_statement($cursor);
oci_close($conn);

// Output result
if (empty($products)) {
    echo json_encode(['message' => 'No vegetables found.']);
} else {
    header('Content-Type: application/json');
    echo json_encode($products);
}
?>
