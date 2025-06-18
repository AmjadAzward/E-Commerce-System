<?php
// Database connection details
$username = 'system'; // Change as needed
$password = 'AMJU'; // Change as needed
$connection_string = 'localhost/XEPDB1'; // Update if your Oracle DB uses a different service name

// Establish connection
$conn = oci_connect($username, $password, $connection_string);

if (!$conn) {
    $e = oci_error();
    die(json_encode(['success' => false, 'message' => 'Database connection failed', 'error' => $e['message']]));
}
?>
