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

if ($_SERVER["REQUEST_METHOD"] == "GET") {
    // Capture the supplier ID from the query parameter
    $supplier_id = isset($_GET['id']) ? (int)$_GET['id'] : 0;

    if ($supplier_id <= 0) {
        echo json_encode(["success" => false, "message" => "Invalid supplier ID!"]);
        exit;
    }

    // Prepare the PL/SQL block to delete the supplier
    $sql = "BEGIN delete_supplier(:supplier_id); END;";
    $stmt = oci_parse($conn, $sql);

    // Bind the supplier ID to the statement
    oci_bind_by_name($stmt, ":supplier_id", $supplier_id);

    // Execute the statement and catch any potential errors
    $result = oci_execute($stmt);

    // Check if the supplier was successfully deleted and return appropriate message
    if ($result) {
        echo json_encode(["success" => true, "message" => "Supplier deleted successfully"]);
    } else {
        $error = oci_error($stmt);
        // Check if it's a custom error raised by the stored procedure
        if (strpos($error['message'], 'ORA-20001') !== false) {
            echo json_encode(["success" => false, "message" => "Supplier not found or already deleted."]);
        } else {
            echo json_encode(["success" => false, "message" => "Failed to delete supplier. Error: " . $error['message']]);
        }
    }

    // Free statement resources
    oci_free_statement($stmt);
}

// Close the connection
oci_close($conn);
?>
