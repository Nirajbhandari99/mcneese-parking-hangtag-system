<?php
$conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);

// If the connection fails, stop everything and show an error
if ($conn->connect_error) {
    http_response_code(500);
    die(json_encode(['error' => 'Database connection failed']));
}


$conn->set_charset("utf8mb4");

// Figure out what the user wants to do (create permit, view permits, etc.)
$action = $_POST['action'] ?? $_GET['action'] ?? '';

// Make sure the user is logged in before doing anything
if (!isset($_SESSION['user_id']) || empty($_SESSION['user_id'])) {
    apiResponse(false, 'Not authenticated');
}

// Get the user's ID and make sure it's a number
$userId = intval($_SESSION['user_id']);

// Based on what action the user wants, run the appropriate function
switch($action) {
    case 'createPermit':
        createPermit($conn, $userId);
        break;
    case 'getPermits':
        getPermits($conn, $userId);
        break;
    case 'getPaymentHistory':
        getPaymentHistory($conn, $userId);
        break;
    default:
        apiResponse(false, 'Invalid action');
}

// This function creates a new parking permit when someone buys one
function createPermit($conn, $userId) {
    // Get all the information from the form and clean it up
    $fullName = trim($_POST['fullName'] ?? '');
    $studentId = trim($_POST['studentId'] ?? '');
    $vehicleMake = trim($_POST['vehicleMake'] ?? '');
    $licensePlate = strtoupper(trim($_POST['licensePlate'] ?? '')); // Make license plate uppercase
    $tagType = trim($_POST['tagType'] ?? '');
    $price = floatval($_POST['price'] ?? 0);
    $cardNumber = trim($_POST['cardNumber'] ?? '');
    
    // Make sure all required fields are filled out
    if (!$fullName || !$studentId || !$vehicleMake || !$licensePlate || !$tagType || $price <= 0 || !$cardNumber) {
        apiResponse(false, 'Missing required fields');
    }
    
    // Make sure the permit type is either 'semester' or 'annual'
    if (!in_array($tagType, ['semester', 'annual'])) {
        apiResponse(false, 'Invalid permit type');
    }
    
    // Generate a unique permit ID (looks like PMT-A1B2C3D4)
    $permitId = 'PMT-' . strtoupper(substr(md5(uniqid(rand(), true)), 0, 8));
    
    // Generate a unique transaction ID for the payment (looks like TXN-A1B2C3D4E5F6)
    $transactionId = 'TXN-' . strtoupper(substr(md5(uniqid(rand(), true)), 0, 12));
    
    // Record when the permit was bought
    $purchaseDate = date('Y-m-d H:i:s');
    
    // Calculate when the permit expires (4 months for semester, 1 year for annual)
    $expiryDate = date('Y-m-d H:i:s', strtotime($tagType === 'semester' ? '+4 months' : '+1 year'));
    
    // Start a transaction so if anything fails, we can undo everything
    $conn->begin_transaction();
    
    try {
        // Add the vehicle to the database (or get existing vehicle ID if it's already there)
        $stmt = $conn->prepare("
            INSERT INTO vehicles (user_id, make, licensePlate)
            VALUES (?, ?, ?)
            ON DUPLICATE KEY UPDATE id = LAST_INSERT_ID(id)
        ");
        $stmt->bind_param("iss", $userId, $vehicleMake, $licensePlate);
        $stmt->execute();
        $vehicleId = $stmt->insert_id ?: $conn->insert_id;
        $stmt->close();
        
        // Save the permit information to the database
        $stmt = $conn->prepare("
            INSERT INTO permits 
            (user_id, vehicle_id, permitId, fullName, studentId, vehicleMake, licensePlate, tagType, price, purchase_date, expiry_date, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')
        ");
        $stmt->bind_param("iissssssdss", $userId, $vehicleId, $permitId, $fullName, $studentId, $vehicleMake, $licensePlate, $tagType, $price, $purchaseDate, $expiryDate);
        $stmt->execute();
        $permitRowId = $stmt->insert_id;
        $stmt->close();
        
        // Get the last 4 digits of the credit card for the receipt
        $cardLast4 = substr(preg_replace('/\D/', '', $cardNumber), -4);
        $paymentDate = date('Y-m-d H:i:s');
        
        // Save the payment information to the database
        $stmt = $conn->prepare("
            INSERT INTO payments (user_id, permit_id, amount, transactionId, cardLast4, payment_date, status)
            VALUES (?, ?, ?, ?, ?, ?, 'completed')
        ");
        $stmt->bind_param("iidsss", $userId, $permitRowId, $price, $transactionId, $cardLast4, $paymentDate);
        $stmt->execute();
        $stmt->close();
        
        // Everything worked! Save all the changes to the database
        $conn->commit();
        
        // Send back success message with all the permit details
        apiResponse(true, 'Permit created successfully', [
            'permitId' => $permitId,
            'transactionId' => $transactionId,
            'fullName' => $fullName,
            'studentId' => $studentId,
            'vehicleMake' => $vehicleMake,
            'licensePlate' => $licensePlate,
            'tagType' => $tagType,
            'price' => $price,
            'purchaseDate' => $purchaseDate,
            'expiryDate' => $expiryDate
        ]);
        
    } catch (Exception $e) {
        // Something went wrong! Undo all the changes
        $conn->rollback();
        apiResponse(false, 'Error creating permit: ' . $e->getMessage());
    }
}

// This function gets all permits for the logged-in user
function getPermits($conn, $userId) {
    // Prepare the query to get all permits for this user, newest first
    $stmt = $conn->prepare("SELECT permitId, fullName, studentId, vehicleMake, licensePlate, tagType, price, purchase_date, expiry_date, status FROM permits WHERE user_id = ? ORDER BY purchase_date DESC");
    
    // If something went wrong preparing the query, show an error
    if (!$stmt) {
        apiResponse(false, 'Database error');
    }
    
    // Run the query with the user's ID
    $stmt->bind_param("i", $userId);
    $stmt->execute();
    $result = $stmt->get_result();
    
    // Collect all the permits into an array
    $permits = [];
    while ($row = $result->fetch_assoc()) {
        $permits[] = $row;
    }
    
    $stmt->close();
    
    // Send back all the permits
    apiResponse(true, 'Permits retrieved successfully', $permits);
}

// This function gets the payment history for the logged-in user
function getPaymentHistory($conn, $userId) {
    // Prepare the query to get all payments for this user, newest first
    $stmt = $conn->prepare("SELECT amount, transactionId, cardLast4, payment_date, status FROM payments WHERE user_id = ? ORDER BY payment_date DESC");
    
    // If something went wrong preparing the query, show an error
    if (!$stmt) {
        apiResponse(false, 'Database error');
    }
    
    // Run the query with the user's ID
    $stmt->bind_param("i", $userId);
    $stmt->execute();
    $result = $stmt->get_result();
    
    // Collect all the payments into an array
    $payments = [];
    while ($row = $result->fetch_assoc()) {
        $payments[] = $row;
    }
    
    $stmt->close();
    
    // Send back all the payment records
    apiResponse(true, 'Payment history retrieved successfully', $payments);
}
?>