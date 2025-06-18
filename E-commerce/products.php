<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

// Database connection details
$username = 'system'; // Change as needed
$password = 'AMJU'; // Change as needed
$connection_string = 'localhost/XEPDB1'; // Change this if needed

// Establish connection
$conn = oci_connect($username, $password, $connection_string);

if (!$conn) {
    $e = oci_error();
    die(json_encode(['success' => false, 'message' => 'Database connection failed', 'error' => $e['message']]));  
}

$action = $_GET['action'] ?? '';

if ($action === "get_suppliers") {
    $stmt = oci_parse($conn, "BEGIN get_suppliersname(:cursor); END;");
    $cursor = oci_new_cursor($conn);
    oci_bind_by_name($stmt, ":cursor", $cursor, -1, OCI_B_CURSOR);
    oci_execute($stmt);
    oci_execute($cursor);
    $suppliers = [];
    while ($row = oci_fetch_assoc($cursor)) {
        $suppliers[] = $row;
    }
    echo json_encode($suppliers);
    oci_free_statement($stmt);
    oci_free_statement($cursor);
}

elseif ($action === "add_product") {
    $productName = $_POST['product-name'];
    $category = $_POST['product-category'];
    $price = $_POST['product-price'] ?? 0;
    $stock = $_POST['product-stock'] ?? 0;
    $supplierId = $_POST['supplier-id'];

    if ($stock < 0 || $price < 0) {
        echo json_encode(["success" => false, "message" => "Stock and price must be non-negative."]);
        exit;
    }

    // Handle image upload
    $imageName = '';
    if (!empty($_FILES['product-image']['name'])) {
        $imageName = basename($_FILES["product-image"]["name"]);
        $targetDir = "uploads/";
        move_uploaded_file($_FILES["product-image"]["tmp_name"], $targetDir . $imageName);
    }

    $sql = "INSERT INTO products (product_name, category, price, stock_quantity, supplier_id, product_image)
            VALUES (:name, :cat, :price, :stock, :sid, :img)";
    $stmt = oci_parse($conn, $sql);
    oci_bind_by_name($stmt, ":name", $productName);
    oci_bind_by_name($stmt, ":cat", $category);
    oci_bind_by_name($stmt, ":price", $price);
    oci_bind_by_name($stmt, ":stock", $stock);
    oci_bind_by_name($stmt, ":sid", $supplierId);
    oci_bind_by_name($stmt, ":img", $imageName);

    if (oci_execute($stmt)) {
        echo json_encode(["success" => true, "message" => "Product added successfully!"]);
    } else {
        $e = oci_error($stmt);
        echo json_encode(["success" => false, "error" => $e['message']]);
    }
    oci_free_statement($stmt);
}


elseif ($action === "update_product") {
    // Debug incoming POST and FILE data
    error_log("POST DATA: " . print_r($_POST, true));
    error_log("FILES DATA: " . print_r($_FILES, true));

    // Fetch and sanitize input values
    $productId   = $_POST['update-product-id'] ?? '';
    $productName = trim($_POST['update-product-name'] ?? '');
    $category    = trim($_POST['update-product-category'] ?? '');
    $price       = floatval($_POST['update-product-price'] ?? 0);
    $stock       = intval($_POST['update-product-stock'] ?? 0);
    $supplierId  = $_POST['supplier-id-update'] ?? '';

    // Debug log to help trace input values (optional)
    error_log("productId: $productId | productName: $productName | category: $category | supplierId: $supplierId");

    // Check for missing required values
    if ($productId === '' || $productName === '' || $category === '' || $supplierId === '') {
        echo json_encode(["success" => false, "message" => "Missing required product details."]);
        exit;
    }

    if ($stock < 0 || $price < 0) {
        echo json_encode(["success" => false, "message" => "Stock and price must be non-negative."]);
        exit;
    }

    // Handle image upload
    $imageName = '';
    if (!empty($_FILES['update-product-image']['name'])) {
        $imageName = basename($_FILES['update-product-image']['name']);
        $targetDir = "uploads/";
        $targetFilePath = $targetDir . $imageName;

        if (!move_uploaded_file($_FILES['update-product-image']['tmp_name'], $targetFilePath)) {
            echo json_encode(["success" => false, "message" => "Failed to upload the image."]);
            exit;
        }
    } else {
        // Fetch existing image from database
        $stmtImg = oci_parse($conn, "SELECT PRODUCT_IMAGE FROM PRODUCTS WHERE ID = :id");
        oci_bind_by_name($stmtImg, ":id", $productId);
        oci_execute($stmtImg);
        $row = oci_fetch_assoc($stmtImg);
        $imageName = $row['PRODUCT_IMAGE'] ?? '';
        oci_free_statement($stmtImg);
    }

    // Update the product details
    $sql = "UPDATE products SET 
            product_name = :name,
            category = :cat,
            price = :price,
            stock_quantity = :stock,
            supplier_id = :sid,
            product_image = :img
            WHERE id = :id";
    $stmt = oci_parse($conn, $sql);
    oci_bind_by_name($stmt, ":id", $productId);
    oci_bind_by_name($stmt, ":name", $productName);
    oci_bind_by_name($stmt, ":cat", $category);
    oci_bind_by_name($stmt, ":price", $price);
    oci_bind_by_name($stmt, ":stock", $stock);
    oci_bind_by_name($stmt, ":sid", $supplierId);
    oci_bind_by_name($stmt, ":img", $imageName);

    if (oci_execute($stmt)) {
        echo json_encode(["success" => true, "message" => "Product updated successfully!"]);
    } else {
        $e = oci_error($stmt);
        echo json_encode(["success" => false, "error" => $e['message']]);
    }

    oci_free_statement($stmt);
}




elseif ($action === "get_products") {
    $category = $_GET['category'] ?? 'Fruits';
    $stmt = oci_parse($conn, "SELECT * FROM products WHERE category = :cat ORDER BY created_at DESC");
    oci_bind_by_name($stmt, ":cat", $category);
    oci_execute($stmt);
    $products = [];
    while ($row = oci_fetch_assoc($stmt)) {
        $products[] = $row;
    }
    echo json_encode($products);
    oci_free_statement($stmt);
}

elseif ($action === "get_product" && isset($_GET['id'])) {
    $productId = $_GET['id'];

    $sql = "SELECT * FROM products WHERE id = :id";
    $stmt = oci_parse($conn, $sql);
    oci_bind_by_name($stmt, ":id", $productId);
    oci_execute($stmt);

    $product = oci_fetch_assoc($stmt);

    if ($product) {
        echo json_encode($product);
    } else {
        http_response_code(404);
        echo json_encode(["success" => false, "error" => "Product not found"]);
    }

    oci_free_statement($stmt);
}

oci_close($conn);
?>
