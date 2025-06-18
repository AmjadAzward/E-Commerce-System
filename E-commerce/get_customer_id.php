<?php
header("Content-Type: application/json");

// Get the JSON payload
$data = json_decode(file_get_contents("php://input"));

if (!isset($data->username)) {
    echo json_encode(["success" => false, "message" => "Username is required"]);
    exit;
}

$username = $data->username;

// Database connection
$username_db = 'system';
$password_db = 'AMJU';
$connection_string = 'localhost/XEPDB1';

$conn = oci_connect($username_db, $password_db, $connection_string);

if (!$conn) {
    $error = oci_error();
    echo json_encode(["success" => false, "message" => "Connection failed: " . $error['message']]);
    exit;
}

try {
    // Step 1: Get Customer ID
    $stmt = oci_parse($conn, "SELECT id FROM customers WHERE username = :username");
    oci_bind_by_name($stmt, ':username', $username);
    oci_execute($stmt);

    $row = oci_fetch_assoc($stmt);
    if (!$row) {
        throw new Exception("Customer not found");
    }
    $customer_id = $row['ID'];

    // Return the customer ID
    echo json_encode(["success" => true, "customer_id" => $customer_id]);

} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
} finally {
    oci_close($conn);
}
?>
