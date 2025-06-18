<?php
// Database connection using OCI8 for Oracle Database
$username = 'system'; // Oracle username
$password = 'AMJU';   // Oracle password
$connection_string = 'localhost/XEPDB1'; // Oracle connection string

$conn = oci_connect($username, $password, $connection_string);

// Check if connection was successful
if (!$conn) {
    $e = oci_error();
    echo json_encode(['success' => false, 'message' => 'Oracle connection failed: ' . $e['message']]);
    exit;
}

// Check if the form is submitted
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Get form data
    $customer_id = $_POST['id'];
    $full_name = $_POST['full_name'];
    $username = $_POST['username'];
    $email = $_POST['email'];
    $contact = $_POST['contact'];

    // Validate input
    if (empty($customer_id) || empty($full_name) || empty($username) || empty($email) || empty($contact)) {
        echo json_encode(['success' => false, 'message' => 'All fields are required.']);
        exit;
    }

    // Check contact uniqueness using the PL/SQL procedure before updating customer details
    $contact_check_sql = "BEGIN check_contact_uniqueness(:contact, :customer_id, :p_is_unique); END;";
    $contact_check_stmt = oci_parse($conn, $contact_check_sql);
    oci_bind_by_name($contact_check_stmt, ":contact", $contact);
    oci_bind_by_name($contact_check_stmt, ":customer_id", $customer_id);
    oci_bind_by_name($contact_check_stmt, ":p_is_unique", $contact_unique_status, 32); // output variable

    if (!oci_execute($contact_check_stmt)) {
        $e = oci_error($contact_check_stmt);
        echo json_encode(['success' => false, 'message' => 'Error checking contact uniqueness: ' . $e['message']]);
        oci_free_statement($contact_check_stmt);
        exit;
    }

    // Check if the contact number is unique
    if ($contact_unique_status != 'unique') {
        echo json_encode(['success' => false, 'message' => 'Contact number already exists.']);
        oci_free_statement($contact_check_stmt);
        exit;
    }

    // Check email uniqueness using the PL/SQL procedure
    $email_check_sql = "BEGIN check_email_uniqueness(:email, :customer_id, :p_is_unique); END;";
    $email_check_stmt = oci_parse($conn, $email_check_sql);
    oci_bind_by_name($email_check_stmt, ":email", $email);
    oci_bind_by_name($email_check_stmt, ":customer_id", $customer_id);
    oci_bind_by_name($email_check_stmt, ":p_is_unique", $email_unique_status, 32); // output variable

    if (!oci_execute($email_check_stmt)) {
        $e = oci_error($email_check_stmt);
        echo json_encode(['success' => false, 'message' => 'Error checking email uniqueness: ' . $e['message']]);
        oci_free_statement($email_check_stmt);
        exit;
    }

    // Check if the email is unique
    if ($email_unique_status != 'unique') {
        echo json_encode(['success' => false, 'message' => 'Email already exists.']);
        oci_free_statement($email_check_stmt);
        exit;
    }

    // PL/SQL block to update customer
    $sql = "
        BEGIN
            update_customer(:customer_id, :full_name, :username, :email, :contact);
        END;
    ";

    // Prepare the query
    $stmt = oci_parse($conn, $sql);

    // Bind variables to the placeholders in the PL/SQL block
    oci_bind_by_name($stmt, ":customer_id", $customer_id);
    oci_bind_by_name($stmt, ":full_name", $full_name);
    oci_bind_by_name($stmt, ":username", $username);
    oci_bind_by_name($stmt, ":email", $email);
    oci_bind_by_name($stmt, ":contact", $contact);

    // Execute the query and check for errors
    $executeResult = oci_execute($stmt);

    if ($executeResult) {
        echo json_encode(['success' => true, 'message' => 'Customer details updated successfully.']);
    } else {
        $e = oci_error($stmt);
        echo json_encode(['success' => false, 'message' => 'Error updating customer: ' . $e['message']]);
    }

    // Free the statements
    oci_free_statement($stmt);
    oci_free_statement($email_check_stmt);
    oci_free_statement($contact_check_stmt);
} else {
    echo json_encode(['success' => false, 'message' => 'Invalid request method.']);
}

// Close the database connection
oci_close($conn);
?>
