<?php
session_start();
header("Content-Type: application/json");

// Hardcoded admin credentials
$hardcoded_admin_username = 'admin';
$hardcoded_admin_password = 'admin123';

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $username = $_POST['username'] ?? '';
    $password = $_POST['password'] ?? '';

    if (empty($username) || empty($password)) {
        echo json_encode(["success" => false, "message" => "Both fields are required!"]);
        exit;
    }

    // Check if hardcoded admin is logging in
    if ($username === $hardcoded_admin_username && $password === $hardcoded_admin_password) {
        $_SESSION['user_id'] = 'admin';
        $_SESSION['full_name'] = 'Administrator';
        echo json_encode([
            "success" => true,
            "message" => "Admin login successful",
            "role" => "admin",
            "username" => $username // ✅ Add this
        ]);
        exit;
    }

    // Database connection
    $conn = oci_connect('system', 'AMJU', 'localhost/XEPDB1');

    if (!$conn) {
        echo json_encode(["success" => false, "message" => "Database connection failed"]);
        exit;
    }

    // Check user in the database
    $sql = "SELECT id, full_name, password FROM customers WHERE username = :username";
    $stmt = oci_parse($conn, $sql);
    oci_bind_by_name($stmt, ":username", $username);
    oci_execute($stmt);

    if ($row = oci_fetch_assoc($stmt)) {
        if ($password === $row['PASSWORD']) {
            $_SESSION['user_id'] = $row['ID'];
            $_SESSION['full_name'] = $row['FULL_NAME'];
            echo json_encode([
                "success" => true,
                "message" => "Login successful",
                "role" => "customer",
                "username" => $username // ✅ Add this
            ]);
        } else {
            echo json_encode(["success" => false, "message" => "Invalid password"]);
        }
    } else {
        echo json_encode(["success" => false, "message" => "User not found"]);
    }

    oci_free_statement($stmt);
    oci_close($conn);
}
?>
