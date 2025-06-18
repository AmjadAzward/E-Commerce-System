<?php
require "db_connect.php"; // Database connection file

// Prepare the cursor variable for the suppliers
$cursor = oci_new_cursor($conn);

// PL/SQL procedure to fetch suppliers
$query = "BEGIN get_suppliersname(:p_cursor); END;";  // Calling the PL/SQL procedure
$stmt = oci_parse($conn, $query);

// Bind the cursor to the OUT parameter
oci_bind_by_name($stmt, ":p_cursor", $cursor, -1, SQLT_RSET);

// Execute the PL/SQL block
oci_execute($stmt);

// Fetch the results from the cursor
oci_execute($cursor);
$suppliers = [];

while ($row = oci_fetch_assoc($cursor)) {
    $suppliers[] = $row;  // Append each row into the suppliers array
}

// Free the statement and cursor
oci_free_statement($stmt);
oci_free_statement($cursor);
oci_close($conn);

// Return the suppliers array as a JSON response
header('Content-Type: application/json');
echo json_encode($suppliers);
?>
