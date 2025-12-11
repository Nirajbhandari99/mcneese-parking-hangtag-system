<?php
/**
 * CONFIG.PHP - Main Configuration File
 * 
 * This file is the foundation of the entire application. It handles:
 *  Database connection to MySQL
 *  Session management for user login
 * Error handling and logging
 *  Helper functions used throughout the application
 * Author: Biraj Man Tamang
 * Date: 12/09/2025
 */

// Tell PHP to report all errors (helpful during development)
error_reporting(E_ALL);

// Don't display errors on the webpage (security - users shouldn't see errors)
ini_set('display_errors', 0);

// Saving errors to a log file instead of showing them in display
// This will helps us debug without exposing sensitive information
ini_set('log_errors', 1);

// Start output buffering
// This means PHP will collect all output before sending it to the browser
// We need this so we can clean up any unexpected output before sending JSON responses
ob_start();

// Configure how sessions work BEFORE we start them

// Making  session cookies inaccessible to JavaScript (prevents XSS attacks)
ini_set('session.cookie_httponly', '1');

// Set to 0 because InfinityFree doesn't support HTTPS on free plan
// On paid hosting with HTTPS, change this to '1' for better security, using unpaid this time 
ini_set('session.cookie_secure', '0');

// This prevents some types of CSRF attacks while allowing normal navigation
ini_set('session.cookie_samesite', 'Lax');

// Always use cookies for sessions (most secure method)
ini_set('session.use_cookies', '1');

// Do not  allow session IDs in URLs which prevents session hijacking)
ini_set('session.use_only_cookies', '1');

// Starting  the session if it hasn't been started already
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Database credentials for InfinityFree hosting
// These values connect our PHP code to the MySQL database

// The server address where our database is hosted
define('DB_HOST', 'sql305.infinityfree.com');

// The username to access the database
define('DB_USER', 'if0_40652973');

// The password for the database user
define('DB_PASS', 'OraN7czKKH5');

// The name of our specific database
define('DB_NAME', 'if0_40652973_mcneese');

// Trying  to create a connection to the MySQL database from backend 
// The @ symbol suppresses error messages (we handle them our own way)
$conn = @new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);

// Check if the connection failed
if ($conn->connect_error) {
    // If connection failed, clean the output buffer
    ob_end_clean();
    
    // Sending  HTTP 500 status code (server error)
    http_response_code(500);
    
    // Telling  the browser we're sending JSON data to the browser 
    header('Content-Type: application/json');
    
    // Sending  a JSON error message back to the frontend
    // This helps developers understand what went wrong
    echo json_encode([
        'success' => false, 
        'message' => 'Database connection failed',
        'error' => $conn->connect_error,
        'errno' => $conn->connect_errno
    ]);
    
    // Stop executing the script
    exit;
}

// Setting up  the character encoding to UTF-8 for database 
$conn->set_charset('utf8mb4');

// This controls which websites are allowed to make requests to our API
// Without proper CORS headers, browsers will block API calls from our frontend, this functions help to connect frontend and backend 

// List of websites that are allowed to access this API
$allowed_origins = [
    'https://mcneeseparking.infinityfree.me',  // Your main website (HTTPS)
    'http://mcneeseparking.infinityfree.me',   // Your website (HTTP)
    'http://localhost',                         // Local development
    'http://127.0.0.1'                         // Alternative local address
];

// Getting  the origin of the current request (where the request came from)
$origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '';

// Checking if the requesting origin is in our allowed list
if (in_array($origin, $allowed_origins)) {
    // If allowed, tell the browser to accept requests from this origin
    header('Access-Control-Allow-Origin: ' . $origin);
} else {
    // If not in the list, default to our main website
    header('Access-Control-Allow-Origin: https://mcneeseparking.infinityfree.me');
}

// Allow cookies and session data to be sent with requests
// This is essential for our login system to work
header('Access-Control-Allow-Credentials: true');

// Specify which HTTP methods (actions) are allowed
// GET = retrieve data, POST = send data, PUT = update, DELETE = remove
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');

// Specify which HTTP headers are allowed in requests
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

// Tell the browser we're always sending JSON responses with UTF-8 encoding
header('Content-Type: application/json; charset=utf-8');

// Handle preflight requests
// Before sending the actual request, browsers send an OPTIONS request to check permissions
// We need to respond to these properly
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    // Send a 200 OK status
    http_response_code(200);
    
    // Clean the output buffer
    ob_end_clean();
    
    // End the script (don't process the request further)
    exit;
}

function apiResponse($success, $message = '', $data = null) {
    global $conn; // Access the database connection from outside this function
    
    // Close the database connection if it's open
    // This frees up resources and prevents connection leaks
    if (isset($conn) && $conn instanceof mysqli) {
        $conn->close();
    }
    
    // Clean the output buffer
    // This removes any unwanted output that might have been generated
    ob_end_clean();
    
    // Build the response array that will be converted to JSON
    $response = [
        'success' => (bool)$success,      // Convert to boolean (true/false)
        'message' => (string)$message     // Convert to string
    ];
    
    // If there's additional data to send, add it to the response
    if ($data !== null) {
        $response['data'] = $data;
        
        // If the data contains user information (has an email field)
        // Also add it under a 'user' key for easier access in JavaScript
        if (is_array($data) && isset($data['email'])) {
            $response['user'] = $data;
        }
    }
    
    // Set the content type header to JSON
    header('Content-Type: application/json; charset=utf-8');
    
    // Set the HTTP status code
    // 200 = success, 400 = client error (bad request)
    http_response_code($success ? 200 : 400);
    
    // Convert the PHP array to JSON and send it to the browser
    echo json_encode($response);
    
    // Stop executing the script
    exit;
}


function validateSession() {
    // Check if user_id exists in the session
    // If it doesn't exist, the user is not logged in
    if (!isset($_SESSION['user_id'])) {
        // Send error response and stop execution
        apiResponse(false, 'Not authenticated');
    }
    
    // Convert user_id to integer and return it
    // This prevents SQL injection if the session was somehow tampered with
    return intval($_SESSION['user_id']);
}

function sanitizeInput($input) {
    return htmlspecialchars(strip_tags(trim($input)), ENT_QUOTES, 'UTF-8');
}
?>