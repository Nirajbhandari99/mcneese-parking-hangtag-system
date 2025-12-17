<?php
require_once 'config.php';

$action = $_POST['action'] ?? $_GET['action'] ?? '';

// Making sure the user is logged in before letting them do anything
if (!isset($_SESSION['user_id']) || empty($_SESSION['user_id'])) {
    apiResponse(false, 'Not authenticated');
}


$userId = intval($_SESSION['user_id']);


switch($action) {
    case 'addVehicle':// adding vehicle
        addVehicle($conn, $userId);
        break;
    case 'getVehicles': // get permit of vehicle
        getVehicles($conn, $userId);
        break;
    case 'removeVehicle': // deleting vehicle
        removeVehicle($conn, $userId);
        break;
    default:
        apiResponse(false, 'Invalid action');
}

function addVehicle($conn, $userId) {
    // Getting all the vehicle information from the form and cleaning it up
    $make = trim($_POST['make'] ?? '');
    $model = trim($_POST['model'] ?? '');
    $year = intval($_POST['year'] ?? 0);
    $color = trim($_POST['color'] ?? '');
    $licensePlate = strtoupper(trim($_POST['licensePlate'] ?? '')); // Make license plate uppercase
    
    // Making sure they at least entered a make and license plate (the required fields)
    if (empty($make) || empty($licensePlate)) {
        apiResponse(false, 'Make and license plate are required');
    }
    
    // Checking if this license plate is already registered by this user
    $stmt = $conn->prepare("SELECT id FROM vehicles WHERE licensePlate = ? AND user_id = ?");
    if (!$stmt) {
        apiResponse(false, 'Database error');
    }
    
    $stmt->bind_param("si", $licensePlate, $userId);
    $stmt->execute();
    
    // If we found a match, that means they already added this vehicle in the dashboard
    if ($stmt->get_result()->num_rows > 0) {
        $stmt->close();
        apiResponse(false, 'This license plate is already registered');
    }
    $stmt->close();
    
    // Adding the new vehicle to the database
    $stmt = $conn->prepare("INSERT INTO vehicles (user_id, make, model, year, color, licensePlate) VALUES (?, ?, ?, ?, ?, ?)");
    if (!$stmt) {
        apiResponse(false, 'Database error');
    }
    
    $stmt->bind_param("ississ", $userId, $make, $model, $year, $color, $licensePlate);
    
    // Trying to save the vehicle
    if ($stmt->execute()) {
        // Success! Get the new vehicle's ID
        $vehicleId = $stmt->insert_id;
        $stmt->close();
        apiResponse(true, 'Vehicle added successfully', ['vehicleId' => $vehicleId]);
    } else {
        // Something went wrong while adding vehicle, used for debugging
        $stmt->close();
        apiResponse(false, 'Error adding vehicle');
    }
}

// This function gets all vehicles for the logged-in user
function getVehicles($conn, $userId) {
    // Prepare the query to get all vehicles for this user, newest first
    $stmt = $conn->prepare("SELECT id, make, model, year, color, licensePlate, registered_date FROM vehicles WHERE user_id = ? ORDER BY registered_date DESC");
    if (!$stmt) {
        apiResponse(false, 'Database error');
    }
    
    // Running the query with the user's ID
    $stmt->bind_param("i", $userId);
    $stmt->execute();
    $result = $stmt->get_result();
    
    // Collecting all the vehicles into an array or an list
    $vehicles = [];
    while ($row = $result->fetch_assoc()) {
        $vehicles[] = $row;
    }
    
    $stmt->close();
    
    // Sendinf back all the vehicles
    apiResponse(true, 'Vehicles retrieved successfully', $vehicles);
}
 
// This function removes a vehicle from the user's account using remove vehicle
function removeVehicle($conn, $userId) {
    // Get the vehicle ID they want to remove
    $vehicleId = intval($_POST['vehicleId'] ?? 0);
    
    // Making  sure they gave us a valid vehicle ID
    if ($vehicleId <= 0) {
        apiResponse(false, 'Invalid vehicle ID');
    }
    
    // Checking if this vehicle exists and belongs to this user
    $stmt = $conn->prepare("SELECT id FROM vehicles WHERE id = ? AND user_id = ?");
    if (!$stmt) {
        apiResponse(false, 'Database error');
    }
    
    $stmt->bind_param("ii", $vehicleId, $userId);
    $stmt->execute();
    
    // If we can't find the vehicle, either it doesn't exist or it belongs to someone else
    if ($stmt->get_result()->num_rows === 0) {
        $stmt->close();
        apiResponse(false, 'Vehicle not found or unauthorized');
    }
    $stmt->close();
    
    // Deleting the vehicle from the database, as by doing in dashboard
    $stmt = $conn->prepare("DELETE FROM vehicles WHERE id = ? AND user_id = ?");
    if (!$stmt) {
        apiResponse(false, 'Database error');
    }
    
    $stmt->bind_param("ii", $vehicleId, $userId);
    
    // Trying to delete the vehicle
    if ($stmt->execute()) {
        // Success!
        $stmt->close();
        apiResponse(true, 'Vehicle removed successfully');
    } else {
        // Something went wrong
        $stmt->close();
        apiResponse(false, 'Error removing vehicle');
    }
}
?>