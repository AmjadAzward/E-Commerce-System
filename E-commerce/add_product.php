<?php
require "db_connect.php"; // Include database connection

// Check if the form is submitted
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Get form data
    $product_name = $_POST['product-name'];
    $category = $_POST['product-category'];
    $price = $_POST['product-price'];
    $stock = $_POST['product-stock'];
    $supplier_id = $_POST['supplier-id'];

    // Handle file upload (product image)
    if (isset($_FILES['product-image']) && $_FILES['product-image']['error'] === UPLOAD_ERR_OK) {
        $image = file_get_contents($_FILES['product-image']['tmp_name']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Image upload failed']);
        exit;
    }

    // Call the stored procedure
    $stid = oci_parse($conn, "BEGIN add_product(:product_name, :category, :price, :stock, :supplier_id, :image); END;");

    oci_bind_by_name($stid, ":product_name", $product_name);
    oci_bind_by_name($stid, ":category", $category);
    oci_bind_by_name($stid, ":price", $price);
    oci_bind_by_name($stid, ":stock", $stock);
    oci_bind_by_name($stid, ":supplier_id", $supplier_id);
    oci_bind_by_name($stid, ":image", $image, -1, OCI_B_BLOB);

    // Execute the procedure
    if (oci_execute($stid)) {
        echo json_encode(['success' => true, 'message' => 'Product added successfully']);
    } else {
        $e = oci_error($stid);
        echo json_encode(['success' => false, 'message' => 'Error adding product', 'error' => $e['message']]);
    }

    // Close the statement and connection
    oci_free_statement($stid);
    oci_close($conn);
}
?>
