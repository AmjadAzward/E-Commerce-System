<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

require 'vendor/autoload.php'; // MongoDB library

use MongoDB\Client;

try {
    // Connect to MongoDB
    $client = new Client("mongodb://localhost:27017");
    $collection = $client->UrbanFood->feedback;

    // Fetch all feedback documents
    $cursor = $collection->find();
    
    // Prepare feedback array
    $feedback = [];
    foreach ($cursor as $doc) {
        $feedback[] = [
            'orderId' => $doc['orderId'] ?? 'N/A',
            'feedback' => $doc['feedback'] ?? '',
            'feedbackDate' => $doc['feedbackDate'] ?? ''
        ];
    }

    // Output the feedback data as JSON for debugging
    header('Content-Type: application/json');
    echo json_encode($feedback);

} catch (Exception $e) {
    // Error handling if something goes wrong
    http_response_code(500);
    echo json_encode(['error' => 'Error connecting to database: ' . $e->getMessage()]);
}
?>
