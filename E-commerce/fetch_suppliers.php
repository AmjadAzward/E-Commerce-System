<?php
session_start();

header("Content-Type: application/json"); // JSON response

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

// Prepare the PL/SQL block to call the procedure with OUT parameter
$query = "BEGIN get_suppliers_json(:p_json); END;";

// Prepare the statement
$stid = oci_parse($conn, $query);

// Bind the OUT parameter to a PHP variable
$p_json = '';
oci_bind_by_name($stid, ":p_json", $p_json, 4000);

// Execute the query
oci_execute($stid);

// Return the JSON result as a response
echo $p_json;

// Close the connection
oci_free_statement($stid);
oci_close($conn);
?>
