<?php
// Database connection details
$username = 'system';
$password = 'AMJU';
$connection_string = 'localhost/XEPDB1';

// Establish connection
$conn = oci_connect($username, $password, $connection_string);

if (!$conn) {
    $e = oci_error();
    die(json_encode(['success' => false, 'message' => 'Database connection failed', 'error' => $e['message']]));
}

if (isset($_GET['id'])) {
    $supplierId = $_GET['id'];

    // Prepare the PL/SQL block with OUT parameters
    $sql = "BEGIN 
                get_supplier_by_id(:id, :supplier_name, :contact_number, :email, :address); 
            END;";

    $stmt = oci_parse($conn, $sql);

    if (!$stmt) {
        $e = oci_error($conn);
        die(json_encode(['success' => false, 'message' => 'SQL parsing failed', 'error' => $e['message']]));
    }

    // Define output variables
    $supplierName = "";
    $contactNumber = "";
    $email = "";
    $address = "";

    // Bind parameters
    oci_bind_by_name($stmt, ":id", $supplierId, -1, SQLT_INT);
    oci_bind_by_name($stmt, ":supplier_name", $supplierName, 100);
    oci_bind_by_name($stmt, ":contact_number", $contactNumber, 15);
    oci_bind_by_name($stmt, ":email", $email, 100);
    oci_bind_by_name($stmt, ":address", $address, 255);

    // Execute the procedure
    $result = oci_execute($stmt);

    if (!$result) {
        $e = oci_error($stmt);
        die(json_encode(['success' => false, 'message' => 'Query execution failed', 'error' => $e['message']]));
    }

    // Return the supplier details as JSON
    echo json_encode([
        'success' => true,
        'supplier' => [
            'id' => $supplierId,
            'supplier_name' => $supplierName,
            'contact_number' => $contactNumber,
            'email' => $email,
            'address' => $address
        ]
    ]);

    oci_free_statement($stmt);
    oci_close($conn);
} else {
    echo json_encode(['success' => false, 'message' => 'Invalid request, supplier ID required']);
}
?>
