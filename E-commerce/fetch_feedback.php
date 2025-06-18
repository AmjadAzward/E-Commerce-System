<?php
require 'vendor/autoload.php';

$mongoClient = new MongoDB\Client("mongodb://localhost:27017");
$db = $mongoClient->selectDatabase('UrbanFood');
$collection = $db->selectCollection('feedback');

$result = $collection->find([], ['sort' => ['feedbackDate' => -1]]);
$feedbacks = [];

foreach ($result as $doc) {
    $feedbacks[] = [
        'orderId' => $doc['orderId'],
        'feedback' => $doc['feedback'],
        'feedbackDate' => $doc['feedbackDate']
    ];
}

header('Content-Type: application/json');
echo json_encode($feedbacks);
?>
