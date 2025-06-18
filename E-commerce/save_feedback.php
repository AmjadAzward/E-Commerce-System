<?php
// Include MongoDB PHP library
require 'vendor/autoload.php'; // If you're using Composer

// MongoDB connection setup
$mongoClient = new MongoDB\Client("mongodb://localhost:27017");
$db = $mongoClient->selectDatabase('UrbanFood'); // ✅ Use consistent, lowercase DB name
$feedbackCollection = $db->selectCollection('feedback'); // Collection name

// Get POST data
$orderId = $_POST['orderId'];
$feedback = $_POST['feedback'];
$feedbackDate = $_POST['feedbackDate'];

// Prepare data to be inserted
$feedbackData = [
    'feedbackId' => (int)$orderId,
    'orderId' => (int)$orderId,
    'feedback' => $feedback,
    'feedbackDate' => $feedbackDate
];

try {
    // Replace existing feedback if it exists, or insert if it doesn't
    $replaceResult = $feedbackCollection->replaceOne(
        ['feedbackId' => (int)$orderId], // Filter by feedbackId
        $feedbackData,
        ['upsert' => true] // Insert if not found
    );

    if ($replaceResult->getModifiedCount() > 0 || $replaceResult->getUpsertedCount() > 0) {
        echo json_encode(['success' => true, 'message' => 'Feedback saved successfully']);
    } else {
        echo json_encode(['success' => false, 'message' => 'No changes made to feedback']);
    }
} catch (Exception $e) {
    error_log('Error: ' . $e->getMessage());
    echo json_encode(['success' => false, 'message' => 'Error: ' . $e->getMessage()]);
}
?>
