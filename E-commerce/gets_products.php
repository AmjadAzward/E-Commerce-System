<?php
header('Content-Type: application/json');
require "db_connect.php"; // Include database connection


$sql = 'BEGIN get_all_products(:cursor); END;';
$stmt = oci_parse($conn, $sql);

$cursor = oci_new_cursor($conn);
oci_bind_by_name($stmt, ':cursor', $cursor, -1, OCI_B_CURSOR);
oci_execute($stmt);
oci_execute($cursor);

$products = [];
while (($row = oci_fetch_assoc($cursor)) != false) {
    $products[] = $row;
}

oci_free_statement($stmt);
oci_free_statement($cursor);
oci_close($conn);

echo json_encode($products);
?>
