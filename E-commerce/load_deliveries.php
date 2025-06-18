<?php
header('Content-Type: application/json');

$username = 'system';
$password = 'AMJU';
$connection_string = 'localhost/XEPDB1';

// Establish Oracle connection
$conn = oci_connect($username, $password, $connection_string);

// Check connection
if (!$conn) {
    echo json_encode(["error" => "Connection failed: " . oci_error()]);
    exit;
}

$sql = "SELECT DELIVERY_ID , order_id, delivery_date, shipping_date FROM delivery";
$statement = oci_parse($conn, $sql);
oci_execute($statement);

$deliveries = [];

while ($row = oci_fetch_assoc($statement)) {
    $deliveries[] = $row;
}

echo json_encode($deliveries);

oci_free_statement($statement);
oci_close($conn);
?>
