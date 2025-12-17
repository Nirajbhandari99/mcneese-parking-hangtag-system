<?php
/**
 * CONFIG.PHP - Main Configuration File
 */

// Tell PHP to report all errors (helpful during development)
error_reporting(E_ALL);

// Don't display errors on the webpage (security - users shouldn't see errors)
ini_set('display_errors', 0);

// Saving errors to a log file instead of showing them in display
// This will helps us debug without exposing sensitive information
ini_set('log_errors', 1);

ob_start();

ini_set('session.cookie_httponly', '1');

ini_set('session.cookie_secure', '0');


ini_set('session.cookie_samesite', 'Lax');


ini_set('session.use_cookies', '1');


ini_set('session.use_only_cookies', '1');


if (session_status() === PHP_SESSION_NONE) {
    session_start();
}
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

// List of websites that are allowed to access this API
$allowed_origins = [
    'https://mcneeseparking.infinityfree.me',  // Your main website (HTTPS)
    'http://mcneeseparking.infinityfree.me',   // Your website (HTTP)
    'http://localhost',                         // Local development
    'http://127.0.0.1'                         // Alternative local address
];


$origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '';


if (in_array($origin, $allowed_origins)) {

    header('Access-Control-Allow-Origin: ' . $origin);
} else {
    // If not in the list, default to our main website
    header('Access-Control-Allow-Origin: https://mcneeseparking.infinityfree.me');
}

header('Access-Control-Allow-Credentials: true');

header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');

// Specify which HTTP headers are allowed in requests
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

// Tell the browser we're always sending JSON responses with UTF-8 encoding
header('Content-Type: application/json; charset=utf-8');


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

    if (isset($conn) && $conn instanceof mysqli) {
        $conn->close();
    }
    

    ob_end_clean();
    

    $response = [
        'success' => (bool)$success,      // Convert to boolean (true/false)
        'message' => (string)$message     // Convert to string
    ];
    

    if ($data !== null) {
        $response['data'] = $data;
        

        if (is_array($data) && isset($data['email'])) {
            $response['user'] = $data;
        }
    }
    

    header('Content-Type: application/json; charset=utf-8');
    

    http_response_code($success ? 200 : 400);
    

    echo json_encode($response);
    
    // Stop executing the script
    exit;
}


function validateSession() {

    if (!isset($_SESSION['user_id'])) {
        
        apiResponse(false, 'Not authenticated');
    }
    

    return intval($_SESSION['user_id']);
}

function sanitizeInput($input) {
    return htmlspecialchars(strip_tags(trim($input)), ENT_QUOTES, 'UTF-8');
}
?>