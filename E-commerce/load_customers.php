<?php
session_start();
header("Content-Type: application/json");

// Database connection
$username = 'system';
$password = 'AMJU';
$connection_string = 'localhost/XEPDB1';

$conn = oci_connect($username, $password, $connection_string);

if (!$conn) {
    echo json_encode(["success" => false, "message" => "Database connection failed"]);
    exit;
}

$sql = "BEGIN 
            OPEN :cursor FOR SELECT id, full_name, username, email, contact FROM customers;
        END;";

$stmt = oci_parse($conn, $sql);

$cursor = oci_new_cursor($conn);
oci_bind_by_name($stmt, ":cursor", $cursor, -1, OCI_B_CURSOR);

oci_execute($stmt);
oci_execute($cursor);

$customers = [];
while ($row = oci_fetch_assoc($cursor)) {
    $customers[] = $row;
}

echo json_encode($customers);

oci_free_statement($stmt);
oci_free_statement($cursor);
oci_close($conn);
?>
