<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

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

$action = $_GET['action'] ?? '';

if ($action === "delete_product") {
    // Get the raw POST body content
    $data = json_decode(file_get_contents('php://input'), true);
    $productId = $data['product-id'] ?? null;

    // Validate product ID
    if (empty($productId) || !is_numeric($productId)) {
        echo json_encode(["error" => "Invalid product ID."]);
        exit();
    }

    // Prepare and execute the PL/SQL procedure to delete the product
    $stmt = oci_parse($conn, "BEGIN delete_product(:p_product_id); END;");
    oci_bind_by_name($stmt, ":p_product_id", $productId);

    $result = oci_execute($stmt);

    if ($result) {
        echo json_encode(["success" => true, "message" => "Product deleted successfully."]);
    } else {
        $e = oci_error($stmt);
        echo json_encode(["error" => $e['message']]);
    }

    oci_free_statement($stmt);
}


oci_close($conn);
?>
