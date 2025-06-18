<?php
// Database connection details
$username = 'system'; // Change as needed
$password = 'AMJU'; // Change as needed
$connection_string = 'localhost/XEPDB1'; // Change this if needed


try {
 
// Establish connection
$conn = oci_connect($username, $password, $connection_string);

if (!$conn) {
    $e = oci_error();
    die(json_encode(['success' => false, 'message' => 'Database connection failed', 'error' => $e['message']]));  
}
    // Call the function to get payments
    $query = "BEGIN :result := get_payments; END;";
    $stid = oci_parse($conn, $query);

    // Bind result variable
    $result = oci_new_cursor($conn);
    oci_bind_by_name($stid, ":result", $result, -1, OCI_B_CURSOR);

    // Execute the query
    oci_execute($stid);

    // Fetch data from cursor
    $payments = [];
    oci_execute($result);
    while ($row = oci_fetch_assoc($result)) {
        $payments[] = $row;
    }

    // Close the connection
    oci_free_statement($stid);
    oci_free_statement($result);
    oci_close($conn);

    echo json_encode($payments);

} catch (Exception $e) {
    echo json_encode(['error' => $e->getMessage()]);
}
?>
