<?php
session_start();
header("Content-Type: application/json");

$username = 'system';
$password = 'AMJU';
$connection_string = 'localhost/XEPDB1';

$conn = oci_connect($username, $password, $connection_string);

if (!$conn) {
    echo json_encode(["success" => false, "message" => "Database connection failed"]);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);
if (!isset($data['id'])) {
    echo json_encode(["success" => false, "message" => "Invalid request"]);
    exit;
}

$customer_id = $data['id'];

$sql = "DELETE FROM customers WHERE id = :id";
$stmt = oci_parse($conn, $sql);
oci_bind_by_name($stmt, ":id", $customer_id);

if (oci_execute($stmt)) {
    echo json_encode(["success" => true, "message" => "Customer deleted successfully"]);
} else {
    echo json_encode(["success" => false, "message" => "Failed to delete customer"]);
}

oci_free_statement($stmt);
oci_close($conn);
?>
