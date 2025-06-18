<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

require 'vendor/autoload.php'; // MongoDB library

use MongoDB\Client;

header('Content-Type: application/json');

try {
    // Get JSON input
    $data = json_decode(file_get_contents("php://input"), true);
    $orderId = $data['orderId'] ?? null;

    if (!$orderId) {
        echo json_encode(['success' => false, 'message' => 'No order ID provided.']);
        exit;
    }

    $client = new Client("mongodb://localhost:27017");
    $collection = $client->UrbanFood->feedback;

    // Debug: Check if the orderId is correct
    error_log("Attempting to delete feedback with orderId: " . $orderId);

    // Ensure orderId is treated as a number for comparison
    $orderId = (int)$orderId;  // Convert to integer

    // Delete by orderId (ensure it matches the number in MongoDB)
    $result = $collection->deleteOne(['orderId' => $orderId]);

    // Debug: Check result of the delete operation
    if ($result->getDeletedCount() > 0) {
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'message' => 'No feedback found with that order ID.']);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server error: ' . $e->getMessage()]);
}
