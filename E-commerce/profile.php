<?php
header("Content-Type: application/json");

// Check if username is passed
if (!isset($_GET['username']) || trim($_GET['username']) === '') {
    echo json_encode(["success" => false, "message" => "Username is required"]);
    exit;
}

$username_input = trim($_GET['username']);

// Database connection
$username_db = 'system';
$password_db = 'AMJU';
$connection_string = 'localhost/XEPDB1';

$conn = oci_connect($username_db, $password_db, $connection_string);

if (!$conn) {
    $error = oci_error();
    echo json_encode(["success" => false, "message" => "Connection failed: " . $error['message']]);
    exit;
}

// PL/SQL block
$sql = "
    BEGIN
        get_customer_by_username(
            :username,
            :id,
            :full_name,
            :email,
            :contact,
            :password
        );
    END;
";

$stid = oci_parse($conn, $sql);

oci_bind_by_name($stid, ":username", $username_input);
oci_bind_by_name($stid, ":id", $id, 20);
oci_bind_by_name($stid, ":full_name", $full_name, 100);
oci_bind_by_name($stid, ":email", $email, 100);
oci_bind_by_name($stid, ":contact", $contact, 20);
oci_bind_by_name($stid, ":password", $password, 100);

if (oci_execute($stid)) {
    if ($id !== null) {
        echo json_encode([
            "success" => true,
            "data" => [
                "id" => $id,
                "full_name" => $full_name,
                "username" => $username_input,
                "email" => $email,
                "contact" => $contact,
                "password" => $password
            ]
        ]);
    } else {
        echo json_encode(["success" => false, "message" => "User not found"]);
    }
} else {
    $e = oci_error($stid);
    echo json_encode(["success" => false, "message" => "Execution failed: " . $e['message']]);
}

oci_free_statement($stid);
oci_close($conn);
?>
