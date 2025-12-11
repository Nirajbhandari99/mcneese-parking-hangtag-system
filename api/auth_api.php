<?php
/**
 * AUTH_API.PHP - Authentication System for McNeese Parking
 * 
 * This file handles all user authentication operations including:
 * - User Registration (creating new accounts)
 * - User Login (verifying credentials and starting sessions)
 * - User Logout (ending sessions)
 * - Profile Updates (changing user information)
 * - Session Checking (verifying if user is logged in)
 * - Password Changes (updating user passwords)
 * All responses are sent as JSON format for easy JavaScript handling
 * 
 * Author: Niraj Bhandari
 * date: 12/09/2025
 */
// Include the configuration file which has database connection and helper functions
require_once 'config.php';

// ROUTING SECTION - Determine which action the user wants to perform

// Get the 'action' parameter from either POST or GET request
// Example: auth_api.php?action=login or sent via POST data
$action = $_POST['action'] ?? $_GET['action'] ?? '';

// Using a switch statement to route to the correct function based on action
switch($action) {
    case 'register':
        // Handle new user registration
        handleRegister();
        break;
        
    case 'login':
        // Handle user login (check credentials)
        handleLogin();
        break;
        
    case 'logout':
        // Handle user logout (destroy session)
        handleLogout();
        break;
        
    case 'updateProfile':
        // Handle profile information updates
        updateProfile();
        break;
        
    case 'checkSession':
        // Check if user has a valid active session
        checkSession();
        break;
        
    case 'changePassword':
        // Handle password change requests
        changePassword();
        break;
        
    default:
        // If action doesn't match any case, return error
        apiResponse(false, 'Invalid action');
}

// FUNCTION: checkSession()
// PURPOSE: Verify if user is logged in and return their information
function checkSession() {
    global $conn; // Access the database connection from config.php
    
    // Check if user_id exists in session and is not empty
    // Sessions are stored on the server and linked via cookies
    if (!isset($_SESSION['user_id']) || empty($_SESSION['user_id'])) {
        // User is not logged in, send error response
        apiResponse(false, 'Not authenticated');
    }
    
    // Converting the  user_id to integer for security 
    $userId = intval($_SESSION['user_id']);
    
    // Prepare SQL query to get user information from database
    // Using prepared statements prevents SQL injection attacks
    // The ? is a placeholder that will be safely replaced with $userId
    $stmt = $conn->prepare("SELECT id, email, firstName, lastName, studentId, phone, userType FROM users WHERE id = ?");
    
    // Check if query preparation failed
    if (!$stmt) {
        apiResponse(false, 'Database error');
    }
    
    // Bind the $userId variable to the ? placeholder
    // "i" means integer type
    $stmt->bind_param("i", $userId);
    
    // Execute the query
    if (!$stmt->execute()) {
        $stmt->close(); // Always close statements to free memory
        apiResponse(false, 'Error fetching user data');
    }
    
    // Get the results from the query
    $result = $stmt->get_result();
    // Fetch user data as an associative array
    $user = $result->fetch_assoc();
    $stmt->close(); // Close the statement
    
    // Check if user was found in database
    if (!$user) {
        apiResponse(false, 'User not found');
    }
    
    // Send success response with user data
    apiResponse(true, 'Session valid', $user);
}

// FUNCTION: handleRegister()
// PURPOSE: Create a new user account
function handleRegister() {
    global $conn; // Access database connection

    // STEP 1: Collect and sanitize all input data from the registration form

    
    // Get first name and remove extra spaces
    $firstName = trim($_POST['firstName'] ?? '');
    
    // Get last name and remove extra spaces
    $lastName = trim($_POST['lastName'] ?? '');
    
    // Get student ID (like MSU123456)
    $studentId = trim($_POST['studentId'] ?? '');
    
    // Get phone number (optional field)
    $phone = trim($_POST['phone'] ?? '');
    
    // Get email and convert to lowercase for consistency
    // strtolower ensures "Test@mcneese.edu" and "test@mcneese.edu" are treated the same
    $email = strtolower(trim($_POST['email'] ?? ''));
    
    // Get password (we'll hash this before storing)
    $password = $_POST['password'] ?? '';
    
    // Get password confirmation (must match password)
    $confirmPassword = $_POST['confirmPassword'] ?? '';
    
    // Get user type (student, faculty, or visitor)
    $userType = trim($_POST['userType'] ?? '');
    

    // On STEP 2: Validating all the  required fields are filled

    
    // Check if any required field is empty
    if (empty($firstName) || empty($lastName) || empty($studentId) || empty($email) || empty($password) || empty($userType)) {
        // Send error response if any required field is missing
        apiResponse(false, 'All required fields must be filled');
    }
    

    // STEP 3: Validate email format and domain

    
    // Use PHP's built-in function to check if email format is valid
    // Example: will reject "notanemail" but accept "user@domain.com", needs to be email formart
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        apiResponse(false, 'Invalid email format');
    }
    
    // Check if email ends with @mcneese.edu
    // Only McNeese email addresses are allowed
    if (!str_ends_with($email, '@mcneese.edu')) {
        apiResponse(false, 'Please use your McNeese State University email address');
    }
    

    // STEP 4: Validate password strength

    
    // Check minimum length (at least 8 characters)
    if (strlen($password) < 8) {
        apiResponse(false, 'Password must be at least 8 characters');
    }
    
    // Check for at least one uppercase letter (A-Z)
    // preg_match checks if pattern exists in string
    if (!preg_match('/[A-Z]/', $password)) {
        apiResponse(false, 'Password must contain at least one uppercase letter');
    }
    
    // Check for at least one lowercase letter (a-z)
    if (!preg_match('/[a-z]/', $password)) {
        apiResponse(false, 'Password must contain at least one lowercase letter');
    }
    
    // Check for at least one number (0-9)
    if (!preg_match('/[0-9]/', $password)) {
        apiResponse(false, 'Password must contain at least one number');
    }
    
    // Check for at least one special character (!@#$%^&* etc)
    // [^A-Za-z0-9] means "anything that's NOT a letter or number"
    if (!preg_match('/[^A-Za-z0-9]/', $password)) {
        apiResponse(false, 'Password must contain at least one special character');
    }
    
    // Check if password and confirmation match
    if ($password !== $confirmPassword) {
        apiResponse(false, 'Passwords do not match');
    }
    

    // STEP 5: Check if email already exists in database

    
    // Prepare query to search for existing email
    $emailCheck = $conn->prepare("SELECT id FROM users WHERE email = ?");
    
    // Check if query preparation failed
    if (!$emailCheck) {
        apiResponse(false, 'Database error');
    }
    
    // Bind email to query (s = string type)
    $emailCheck->bind_param("s", $email);
    
    // Execute the query
    $emailCheck->execute();
    
    // Get the results
    $result = $emailCheck->get_result();
    
    // If num_rows > 0, email already exists
    if ($result->num_rows > 0) {
        $emailCheck->close(); // Close statement
        apiResponse(false, 'An account with this email already exists');
    }
    
    // Close the email check statement
    $emailCheck->close();

    // STEP 6: Hash the password for security

    
    // NEVER store passwords in plain text!
    // PASSWORD_BCRYPT uses bcrypt algorithm (very secure)
    // Even if database is hacked, passwords cannot be reversed
    $hashedPassword = password_hash($password, PASSWORD_BCRYPT);

    // STEP 7: Inserting new user into database and saving them in table 

    
    // Prepare INSERT query with placeholders for all user data
    $insertStmt = $conn->prepare("INSERT INTO users (email, password, firstName, lastName, studentId, phone, userType) VALUES (?, ?, ?, ?, ?, ?, ?)");
    
    // Check if query preparation failed
    if (!$insertStmt) {
        apiResponse(false, 'Database error');
    }
    
    // Bind all variables to the query
    // "sssssss" = 7 strings (email, password, firstName, lastName, studentId, phone, userType)
    $insertStmt->bind_param("sssssss", $email, $hashedPassword, $firstName, $lastName, $studentId, $phone, $userType);
    
    // Execute the INSERT query
    if ($insertStmt->execute()) {
        // Success! User account created
        $insertStmt->close(); // Close statement
        apiResponse(true, 'Account created successfully!');
    } else {
        // Something went wrong during insertion
        $insertStmt->close();
        apiResponse(false, 'Error creating account');
    }
}


// FUNCTION: handleLogin()
// PURPOSE: Verify user credentials and create a session

function handleLogin() {
    global $conn; // Access database connection

    // STEP 1: Get and sanitize login credentials
    
    // Get email and convert to lowercase
    $email = strtolower(trim($_POST['email'] ?? ''));
    
    // Get password (will be compared with hashed version in database)
    $password = $_POST['password'] ?? '';

    // STEP 2: Validate email domain
    
    // Only allow McNeese email addresses
    if (!str_ends_with($email, '@mcneese.edu')) {
        apiResponse(false, 'Please use your McNeese State University email address');
    }

    // STEP 3: Find user in database by email
    
    // Prepare query to get user data
    // We need password field to verify it matches what user entered
    $stmt = $conn->prepare("SELECT id, email, password, firstName, lastName, studentId, phone, userType FROM users WHERE email = ?");
    
    // Check if query preparation failed
    if (!$stmt) {
        apiResponse(false, 'Database error');
    }
    
    // Bind email to query
    $stmt->bind_param("s", $email);
    
    // Execute the query
    $stmt->execute();
    
    // Get results
    $result = $stmt->get_result();

    // On this STEP 4: Check if user exists or not in database 

    
    // If no rows returned, email doesn't exist in database
    if ($result->num_rows === 0) {
        $stmt->close();
        // Tell user to register first
        apiResponse(false, 'Account not found. Please register first');
    }
    
    // Get user data as associative array
    $user = $result->fetch_assoc();
    $stmt->close();

    // STEP 5: Verify password

    
    // password_verify compares plain text password with hashed password
    // This is secure - we never unhash the password
    if (!password_verify($password, $user['password'])) {
        // Password doesn't match
        apiResponse(false, 'Invalid password. Please try again');
    }
 
    // STEP 6: Password is correct - Create session

    
    // Store user information in session
    // Sessions persist across page loads until browser closes or logout
    $_SESSION['user_id'] = $user['id'];           // User's database ID
    $_SESSION['email'] = $user['email'];          // User's email
    $_SESSION['firstName'] = $user['firstName'];  // User's first name
    $_SESSION['lastName'] = $user['lastName'];    // User's last name

    // STEP 7: Remove password from response (security)
    
    // Never send password hash to frontend, even encrypted
    unset($user['password']);

    // STEP 8: Send success response with user data

    
    // JavaScript will receive this data and store it in localStorage
    apiResponse(true, 'Login successful!', $user);
}

// FUNCTION: handleLogout()
// PURPOSE: End user session and log them out

function handleLogout() {
    // Destroy the entire session
    // This removes all session variables (user_id, email, etc)
    // User will need to login again
    session_destroy();
    
    // Send success response
    apiResponse(true, 'Logged out successfully');
}


// FUNCTION: updateProfile()
// PURPOSE: Update user's personal information (name, phone)

function updateProfile() {
    global $conn; // Access database connection   

    // STEP 1: Checking  if user is logged in

    
    // Verify session exists
    if (!isset($_SESSION['user_id'])) {
        // User is not logged in, reject the request
        apiResponse(false, 'Not authenticated');
    }
        // STEP 2: Get updated information from request
    
    // Get user ID from session (who is making this update)
    $userId = intval($_SESSION['user_id']);
    
    // Get new values for profile fields
    $firstName = trim($_POST['firstName'] ?? '');
    $lastName = trim($_POST['lastName'] ?? '');
    $phone = trim($_POST['phone'] ?? '');

    // STEP 3: Update database with new information
    
    // Prepare UPDATE query
    // Updates firstName, lastName, and phone for the logged-in user
    $stmt = $conn->prepare("UPDATE users SET firstName = ?, lastName = ?, phone = ? WHERE id = ?");
    
    // Check if query preparation failed
    if (!$stmt) {
        apiResponse(false, 'Database error');
    }
    
    // Bind parameters
    // "sssi" = 3 strings (firstName, lastName, phone) + 1 integer (userId)
    $stmt->bind_param("sssi", $firstName, $lastName, $phone, $userId);
    
    // Execute the UPDATE query
    if ($stmt->execute()) {

        // STEP 4: Update session variables with new information
        
        // Keep session in sync with database
        $_SESSION['firstName'] = $firstName;
        $_SESSION['lastName'] = $lastName;
        
        $stmt->close(); // Close statement
        
        // Send success response
        apiResponse(true, 'Profile updated successfully');
    } else {
        // Something went wrong with the update
        $stmt->close();
        apiResponse(false, 'Error updating profile');
    }
}

// FUNCTION: changePassword()
// PURPOSE: Change user's password after verifying current password


function changePassword() {
    global $conn; // Access database connection
 
    // STEP 1: Verify user is logged in

    
    // Check if user has active session
    if (!isset($_SESSION['user_id'])) {
        apiResponse(false, 'Not authenticated');
    }
 
    // STEP 2: Get password information from request
 
    
    // Get user ID from session
    $userId = intval($_SESSION['user_id']);
    
    // Get current password (user must know this to change password)
    $currentPassword = $_POST['currentPassword'] ?? '';
    
    // Get new password (what user wants to change to)
    $newPassword = $_POST['newPassword'] ?? '';
    
 
    // STEP 3: Validate new password strength
 
    
    // Ensure new password meets minimum length requirement
    if (strlen($newPassword) < 8) {
        apiResponse(false, 'New password must be at least 8 characters');
    }
 
    // STEP 4: Get current password hash from database
 
    
    // Query to get user's current password hash
    $stmt = $conn->prepare("SELECT password FROM users WHERE id = ?");
    
    if (!$stmt) {
        apiResponse(false, 'Database error');
    }
    
    // Bind user ID
    $stmt->bind_param("i", $userId);
    
    // Execute query
    $stmt->execute();
    
    // Get result
    $result = $stmt->get_result();
    $user = $result->fetch_assoc();
    $stmt->close();
    
    // Check if user was found
    if (!$user) {
        apiResponse(false, 'User not found');
    }
   
    // STEP 5: Verify current password is correct
 
    
    // Compare provided current password with database hash
    // This ensures user knows their current password before changing it
    if (!password_verify($currentPassword, $user['password'])) {
        // Current password is wrong, reject the request
        apiResponse(false, 'Current password is incorrect');
    }
 
    // STEP 6: Hash the new password
 
    
    // Create secure hash of new password
    $hashedPassword = password_hash($newPassword, PASSWORD_BCRYPT);
   
    // STEP 7: Update password in database
 
    
    // Prepare UPDATE query to change password
    $stmt = $conn->prepare("UPDATE users SET password = ? WHERE id = ?");
    
    if (!$stmt) {
        apiResponse(false, 'Database error');
    }
    
    // Bind new hashed password and user ID
    // "si" = string (password) + integer (id)
    $stmt->bind_param("si", $hashedPassword, $userId);
    
    // Execute the update
    if ($stmt->execute()) {
        // Password successfully changed
        $stmt->close();
        apiResponse(true, 'Password changed successfully');
    } else {
        // Something went wrong
        $stmt->close();
        apiResponse(false, 'Error changing password');
    }
}
?>