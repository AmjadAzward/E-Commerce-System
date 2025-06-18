<?php
header("Content-Type: application/json");

$data = json_decode(file_get_contents("php://input"), true);

$required_fields = ['id', 'full_name', 'username', 'email', 'contact', 'password'];
foreach ($required_fields as $field) {
    if (empty($data[$field])) {
        echo json_encode(["success" => false, "message" => "$field is required"]);
        exit;
    }
}

$id = $data['id'];
$full_name = $data['full_name'];
$username = $data['username'];
$email = $data['email'];
$contact = $data['contact'];
$password = $data['password'];

$conn = oci_connect('system', 'AMJU', 'localhost/XEPDB1');
if (!$conn) {
    $e = oci_error();
    echo json_encode(["success" => false, "message" => "Connection failed: " . $e['message']]);
    exit;
}

$sql = "BEGIN update_customer_by_id(:id, :full_name, :username, :email, :contact, :password); END;";
$stid = oci_parse($conn, $sql);

oci_bind_by_name($stid, ":id", $id);
oci_bind_by_name($stid, ":full_name", $full_name);
oci_bind_by_name($stid, ":username", $username);
oci_bind_by_name($stid, ":email", $email);
oci_bind_by_name($stid, ":contact", $contact);
oci_bind_by_name($stid, ":password", $password);

if (oci_execute($stid)) {
    echo json_encode(["success" => true, "message" => "Profile updated successfully"]);
} else {
    $e = oci_error($stid);
    echo json_encode(["success" => false, "message" => "Update failed: " . $e['message']]);
}

oci_free_statement($stid);
oci_close($conn);
?>
