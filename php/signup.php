<?php
// Allow CORS (for local development)
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// Database connection details
$host = 'localhost';
$user = 'root';
$pass = '';
$db = 'order_db';

try {
    $conn = new PDO("mysql:host=$host;dbname=$db;charset=utf8", $user, $pass);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Database connection failed: ' . $e->getMessage()]);
    exit;
}

// Read and decode JSON input
$data = json_decode(file_get_contents('php://input'), true);

// Validate received data
if (!isset($data['name'], $data['email'], $data['password'])) {
    echo json_encode(['success' => false, 'message' => 'Invalid input.']);
    exit;
}

// Sanitize inputs
$name = htmlspecialchars($data['name']);
$email = filter_var($data['email'], FILTER_SANITIZE_EMAIL);
$password = $data['password'];

// Validate email format
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(['success' => false, 'message' => 'Invalid email format.']);
    exit;
}

// Check if email is already registered
$stmt = $conn->prepare("SELECT * FROM accounts WHERE email = :email");
$stmt->bindParam(':email', $email);
$stmt->execute();

if ($stmt->rowCount() > 0) {
    echo json_encode(['success' => false, 'message' => 'Email is already registered.']);
    exit;
}

// Hash password before storing
$hashedPassword = password_hash($password, PASSWORD_BCRYPT);

// Insert user into database
$stmt = $conn->prepare("INSERT INTO accounts (name, email, password) VALUES (:name, :email, :password)");
$stmt->bindParam(':name', $name);
$stmt->bindParam(':email', $email);
$stmt->bindParam(':password', $hashedPassword);

if ($stmt->execute()) {
    echo json_encode(['success' => true, 'message' => 'User registered successfully.']);
} else {
    echo json_encode(['success' => false, 'message' => 'Failed to register user.']);
}
?>
