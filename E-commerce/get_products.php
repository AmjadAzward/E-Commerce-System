<?php
require "db_connect.php"; // Include database connection

// Get the category from the request (default to 'Fruits')
$category = isset($_GET['category']) ? $_GET['category'] : 'Fruits';

// Prepare the PL/SQL procedure call
$stid = oci_parse($conn, "BEGIN get_products_by_category(:category, :cursor); END;");

// Bind the parameters
$cursor = oci_new_cursor($conn);
oci_bind_by_name($stid, ":category", $category);
oci_bind_by_name($stid, ":cursor", $cursor, -1, OCI_B_CURSOR);

// Execute the statement
oci_execute($stid);

// Fetch the results from the cursor
oci_execute($cursor);
$products = [];

while ($row = oci_fetch_assoc($cursor)) {
    $products[] = $row;
}

// Free up resources
oci_free_statement($stid);
oci_free_statement($cursor);
oci_close($conn);

// Return the products as a JSON response
echo json_encode($products);
?>
