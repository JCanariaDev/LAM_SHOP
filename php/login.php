<?php
// Enable error reporting for debugging (Disable this in production)
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Ensure proper JSON response
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

// Handle preflight requests for CORS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// Database connection
$host = 'localhost';
$user = 'root';
$pass = '';
$db = 'order_db';

try {
    $conn = new PDO("mysql:host=$host;dbname=$db", $user, $pass);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Database connection failed.']);
    exit;
}

// Read input data (Handle empty body error)
$inputJSON = file_get_contents('php://input');
if (!$inputJSON) {
    echo json_encode(['success' => false, 'message' => 'No input received.']);
    exit;
}

$data = json_decode($inputJSON, true);

// Validate input
if (!isset($data['username']) || !isset($data['password'])) {
    echo json_encode(['success' => false, 'message' => 'Invalid input.']);
    exit;
}

// Clean input
$username = htmlspecialchars($data['username']);
$password = $data['password'];

// Check if user exists
$stmt = $conn->prepare("SELECT * FROM accounts WHERE name = :username");
$stmt->bindParam(':username', $username);
$stmt->execute();

$user = $stmt->fetch(PDO::FETCH_ASSOC);

// Verify password (Check if password column uses `password_hash`)
if (!$user || !password_verify($password, $user['password'])) {
    echo json_encode(['success' => false, 'message' => 'Invalid username or password.']);
    exit;
}

// Successful login
echo json_encode(['success' => true, 'message' => 'Login successful.']);
exit;
