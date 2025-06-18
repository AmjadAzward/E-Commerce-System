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

if (isset($_GET['supplier_id']) && isset($_GET['contact_number']) && isset($_GET['email'])) {
    $supplier_id = $_GET['supplier_id'];
    $contact_number = $_GET['contact_number'];
    $email = $_GET['email'];

    // Prepare the PL/SQL call
    $stmt = oci_parse($conn, "BEGIN check_supplier_uniqueness(:supplier_id, :contact_number, :email, :is_contact_unique, :is_email_unique); END;");

    // Bind parameters
    oci_bind_by_name($stmt, ":supplier_id", $supplier_id);
    oci_bind_by_name($stmt, ":contact_number", $contact_number);
    oci_bind_by_name($stmt, ":email", $email);
    oci_bind_by_name($stmt, ":is_contact_unique", $is_contact_unique, 32);
    oci_bind_by_name($stmt, ":is_email_unique", $is_email_unique, 32);

    // Execute the PL/SQL block
    oci_execute($stmt);

    // Return the result
    if ($is_contact_unique == 1 && $is_email_unique == 1) {
        echo json_encode(['isContactUnique' => true, 'isEmailUnique' => true]);
    } else {
        // If uniqueness check fails, provide the reason
        $errors = [];
        if ($is_contact_unique == 0) {
            $errors[] = "Contact number is already in use.";
        }
        if ($is_email_unique == 0) {
            $errors[] = "Email address is already in use.";
        }
        
        echo json_encode([
            'isContactUnique' => $is_contact_unique == 1,
            'isEmailUnique' => $is_email_unique == 1,
            'errors' => $errors
        ]);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Invalid parameters']);
}

// Close connection
oci_close($conn);
?>
