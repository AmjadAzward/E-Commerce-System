<?php
session_start();

header("Content-Type: application/json"); // Force JSON response

// Database connection details
$username = 'system';
$password = 'AMJU';
$connection_string = 'localhost/XEPDB1';

// Establish connection
$conn = oci_connect($username, $password, $connection_string);

if (!$conn) {
    $error = oci_error();
    echo json_encode(["success" => false, "message" => "Connection failed: " . $error['message']]);
    exit;
}

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Capture the raw JSON body
    $data = json_decode(file_get_contents("php://input"), true);

    // Ensure all fields are provided
    if (empty($data['supplier_name']) || empty($data['contact_number']) || empty($data['email']) || empty($data['address'])) {
        echo json_encode(["success" => false, "message" => "All fields are required!"]);
        exit;
    }

    // Capture the form values from the decoded JSON
    $supplier_name = $data['supplier_name'];
    $contact_number = $data['contact_number'];
    $email = $data['email'];
    $address = $data['address'];

    // Prepare the stored procedure for adding the supplier
    $sql = "BEGIN add_supplier(:supplier_name, :contact_number, :email, :address); END;";
    $stmt = oci_parse($conn, $sql);

    // Bind input parameters
    oci_bind_by_name($stmt, ":supplier_name", $supplier_name);
    oci_bind_by_name($stmt, ":contact_number", $contact_number);
    oci_bind_by_name($stmt, ":email", $email);
    oci_bind_by_name($stmt, ":address", $address);

    // Execute the statement
    $result = oci_execute($stmt);

    // Check if the supplier was successfully added and return appropriate message
    if ($result) {
        echo json_encode(["success" => true, "message" => "Supplier added successfully"]);
    } else {
        $error = oci_error($stmt);
        // Check if it's a custom error raised by the stored procedure
        if (strpos($error['message'], 'ORA-20001') !== false) {
            echo json_encode(["success" => false, "message" => "Supplier with this contact number or email already exists."]);
        } else {
            echo json_encode(["success" => false, "message" => "Failed to add supplier. Error: " . $error['message']]);
        }
    }

    // Free statement resources
    oci_free_statement($stmt);
}

// Close the connection
oci_close($conn);
?>
