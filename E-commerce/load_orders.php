<?php
// Database connection settings
$username = 'system'; // Change as needed
$password = 'AMJU'; // Change as needed
$connection_string = 'localhost/XEPDB1'; // Change this if needed

// Establish connection
try {
    // Establish Oracle connection using OCI8
    $conn = oci_connect($username, $password, $connection_string);

    if (!$conn) {
        $error = oci_error();
        throw new Exception($error['message']);
    }

    // Call the PL/SQL procedure to get the order IDs
    $sql = 'BEGIN get_order_id(:cursor); END;';
    $stid = oci_parse($conn, $sql);

    // Define the variable to hold the cursor
    $cursor = oci_new_cursor($conn);

    // Bind the cursor to the PHP variable
    oci_bind_by_name($stid, ":cursor", $cursor, -1, OCI_B_CURSOR);

    // Execute the PL/SQL block
    oci_execute($stid);

    // Fetch the results from the cursor
    oci_execute($cursor);

    // Prepare the result array
    $order_ids = [];
    while ($row = oci_fetch_assoc($cursor)) {
        $order_ids[] = $row['ORDER_ID'];  // Assuming ORDER_ID is the correct column name
    }

    // Close the cursor and statement
    oci_free_statement($stid);
    oci_free_statement($cursor);
    oci_close($conn);

    // Return the order IDs as a JSON array
    echo json_encode($order_ids);

} catch (Exception $e) {
    // Return error message if any
    echo json_encode(['error' => $e->getMessage()]);
}
?>
