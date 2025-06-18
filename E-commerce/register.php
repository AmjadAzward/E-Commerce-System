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
    // Capture form inputs
    $fullName = $_POST['full-name'] ?? '';
    $username = $_POST['username'] ?? '';
    $email = $_POST['email'] ?? '';
    $contact = $_POST['contact'] ?? '';
    $password = $_POST['password'] ?? '';

    // Check if any fields are empty
    if (empty($fullName) || empty($username) || empty($email) || empty($contact) || empty($password)) {
        echo json_encode(["success" => false, "message" => "All fields are required!"]);
        exit;
    }

    // Prepare the stored procedure for registration
    $sql = "BEGIN register_customer(:fullName, :username, :email, :contact, :password, :status); END;";
    $stmt = oci_parse($conn, $sql);

    // Bind input parameters and the output parameter
    oci_bind_by_name($stmt, ":fullName", $fullName);
    oci_bind_by_name($stmt, ":username", $username);
    oci_bind_by_name($stmt, ":email", $email);
    oci_bind_by_name($stmt, ":contact", $contact);
    oci_bind_by_name($stmt, ":password", $password);
    oci_bind_by_name($stmt, ":status", $status, 255);

    // Execute the statement
    $result = oci_execute($stmt);

    // Return the result in JSON format
    echo json_encode(["success" => ($status === 'Registration successful'), "message" => $status]);

    // Free statement resources
    oci_free_statement($stmt);
}

// Close the connection
oci_close($conn);
?>
