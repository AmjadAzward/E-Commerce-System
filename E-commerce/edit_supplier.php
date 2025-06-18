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

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);

    $supplier_id = $data['supplier_id'];
    $supplier_name = $data['supplier_name'];
    $contact_number = $data['contact_number'];
    $email = $data['email'];
    $address = $data['address'];

    // Update the supplier
    $stmt = oci_parse($conn, "BEGIN edit_supplier(:supplier_id, :supplier_name, :contact_number, :email, :address); END;");

    // Bind parameters
    oci_bind_by_name($stmt, ":supplier_id", $supplier_id);
    oci_bind_by_name($stmt, ":supplier_name", $supplier_name);
    oci_bind_by_name($stmt, ":contact_number", $contact_number);
    oci_bind_by_name($stmt, ":email", $email);
    oci_bind_by_name($stmt, ":address", $address);

    // Execute the PL/SQL block
    if (oci_execute($stmt)) {
        echo json_encode(['success' => true, 'message' => 'Supplier updated successfully']);
    } else {
        $e = oci_error($stmt);
        echo json_encode(['success' => false, 'message' => 'Failed to update supplier', 'error' => $e['message']]);
    }
}

oci_close($conn);
?>
