<?php
header('Content-Type: application/json');
ini_set('display_errors', 1);
error_reporting(E_ALL);

$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['username'])) {
    echo json_encode(['status' => 'error', 'message' => 'Username not provided']);
    exit;
}

$userInput = $data['username'];

// Database connection
$db_user = 'system';  // Oracle DB username
$db_pass = 'AMJU';    // Oracle DB password
$connection_string = 'localhost/XEPDB1'; // Adjust for your Oracle service name

$conn = oci_connect($db_user, $db_pass, $connection_string);
if (!$conn) {
    $e = oci_error();
    echo json_encode(['status' => 'error', 'message' => 'DB Connection failed: ' . $e['message']]);
    exit;
}

// Query
$sql = 'SELECT ID FROM customers WHERE username = :username';
$stid = oci_parse($conn, $sql);
oci_bind_by_name($stid, ':username', $userInput);
oci_execute($stid);

$row = oci_fetch_assoc($stid);
if ($row && isset($row['ID'])) {
    echo json_encode(['status' => 'success', 'customer_id' => $row['ID']]);
} else {
    echo json_encode(['status' => 'error', 'message' => 'Customer not found']);
}

oci_free_statement($stid);
oci_close($conn);
?>
