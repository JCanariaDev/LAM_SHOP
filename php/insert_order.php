<?php
header('Content-Type: application/json');

// Enable CORS for local development
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

$servername = "localhost";
$username = "root"; 
$password = "";
$dbname = "order_db"; 

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    die(json_encode(["success" => false, "message" => "Database connection failed."]));
}

// Get JSON input
$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['name'], $data['address'], $data['payment'], $data['productID'], $data['productName'], $data['productPrice'], $data['productCount'])) {
    echo json_encode(["success" => false, "message" => "Missing required fields."]);
    exit();
}

$name = $conn->real_escape_string($data['name']);
$address = $conn->real_escape_string($data['address']);
$payment = $conn->real_escape_string($data['payment']);
$productID = $conn->real_escape_string($data['productID']);
$productName = $conn->real_escape_string($data['productName']);
$productPrice = $conn->real_escape_string($data['productPrice']);
$productCount = $conn->real_escape_string($data['productCount']);
$productProof = $conn->real_escape_string($data['productProof']);
$productDayOfStock = $conn->real_escape_string($data['productDayOfStock']);

$sql = "INSERT INTO orders (name, address, payment_method, product_id, product_name, product_price, product_count, proof, dayOfStock, status) 
        VALUES ('$name', '$address', '$payment', '$productID', '$productName', '$productPrice', '$productCount', '$productProof', '$productDayOfStock', 'Pending')";

if ($conn->query($sql) === TRUE) {
    echo json_encode(["success" => true, "message" => "Order placed successfully."]);
} else {
    echo json_encode(["success" => false, "message" => "Error: " . $conn->error]);
}

$conn->close();
?>
