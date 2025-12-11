// This file handles all user authentication - logging in, registering, logging out, and checking if someone is logged in

// The base URL where all our API files live on the server
// Author:Niraj Bhandari
const API_BASE = 'https://mcneeseparking.infinityfree.me/api/';

// This function runs when someone is trying to log in to the webpage
function handleLogin(event) {
    event.preventDefault(); // Stopping them from  the form from submitting the normal way
    
    // Getting what the user typed into the login form
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    
    console.log('Login attempt for:', email);
    
    // Making  sure they are  using a McNeese email address if not cant login
    if (!email.endsWith('@mcneese.edu')) {
        showAlert('Please use your McNeese State University email address.', 'error');
        return;
    }
    
    // Change the button to show we're working on it
    const submitBtn = event.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true; // Disable button so they can not  click it twice
    submitBtn.textContent = 'Logging in...'; // user is logging in 
    
    // Package up the login info to send to the server
    const formData = new FormData();
    formData.append('action', 'login');
    formData.append('email', email);
    formData.append('password', password);
    
    // Sending the login request to the server usinf post method
    fetch(API_BASE + 'auth_api.php', {
        method: 'POST',
        body: formData,
        credentials: 'include'  // IMPORTANT as  This makes sure cookies are sent and saved
    })
    .then(response => response.json()) // Converting the response to JSON
    .then(data => {
        console.log('Login response:', data);
        
        // Reseting the button back to normal
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
        
        // Checking if login was successful or not, 
        if (data.success) {
            // Save the user's info in the browser so we remember they're logged in
            localStorage.setItem('currentUser', JSON.stringify(data.data));
            localStorage.setItem('isLoggedIn', 'true');
            
            console.log('Login successful, user stored');
            showAlert('Login successful! Redirecting...', 'success');
            
            // Wait 1.5 - 2 seconds then send them to the dashboard and start adding vehicle
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1500);
        } else {
            // Login failed - show the error message, like invalid or others
            showAlert(data.message, 'error');
        }
    })
    .catch(error => {
        // Something going wrong with the connection
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
        showAlert('Connection error. Please try again.', 'error');
        console.error('Login error:', error);
    });
}

// This function runs when someone tries to create a new account
function handleRegister(event) {
    event.preventDefault(); // Stopping them from the form from submitting the normal way
    
    const formData = new FormData(event.target); // Getting all the form data
    
    const password = formData.get('password');
    const confirmPassword = formData.get('confirmPassword');
    
    // Making  sure both passwords match if not cat create 
    if (password !== confirmPassword) {
        showAlert('Passwords do not match.', 'error');
        return;
    }
    
    // Make sure they're using a McNeese email,if not cant go to dashboard page 
    if (!formData.get('email').endsWith('@mcneese.edu')) {
        showAlert('Please use your McNeese State University email address.', 'error');
        return;
    }
    
    // Changing  the button to show we're working on it
    const submitBtn = event.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Creating account...';
    
    // Packaging up all the registration info
    const data = new FormData();
    data.append('action', 'register');// apending
    data.append('firstName', formData.get('firstName'));
    data.append('lastName', formData.get('lastName'));
    data.append('studentId', formData.get('studentId'));
    data.append('phone', formData.get('phone'));
    data.append('email', formData.get('email'));
    data.append('password', password);
    data.append('confirmPassword', confirmPassword);
    data.append('userType', formData.get('userType'));
    
    // Sending the registration request to the server using post method
    fetch(API_BASE + 'auth_api.php', {
        method: 'POST',
        body: data,
        credentials: 'include'
    })
    .then(response => response.json())
    .then(result => {
        // Resetting the button back to normal
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
        
        // Checking if registration was successful if yest it will give success message 
        if (result.success) {
            showAlert('Account created successfully! Redirecting to login...', 'success');
            // Wait 2 seconds then send them  back to the login page
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);
        } else {
            // Registration failed - show the error, what makes them failed
            showAlert(result.message, 'error');
        }
    })
    .catch(error => {
        // Something went wrong with the connection
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
        showAlert('Connection error. Please try again.', 'error');
        console.error('Registration error:', error);
    });
}

// This is the most important function - it checks if someone is allowed to view a page
// It checks both the browser storage AND asks the server to make sure the login is still valid
async function checkAuth() {
    // List of pages that require you to be logged in
    const protectedPages = ['dashboard.html', 'purchase.html', 'profile.html', 'confirmation.html'];
    
    // Figure out what page we're currently on
    const currentPage = window.location.pathname.split('/').pop();
    
    console.log('checkAuth called on page:', currentPage);
    
    // If this is a public page (like the home page), don't bother checking
    if (!protectedPages.includes(currentPage)) {
        console.log('Public page, skipping auth check');
        return null;
    }
    
    // First, do a quick check of what's saved in the browser
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const currentUser = localStorage.getItem('currentUser');
    
    // If there's nothing saved, they're definitely not logged in
    if (!isLoggedIn || !currentUser) {
        console.log('No localStorage data, redirecting to login');
        window.location.href = 'login.html';
        return null;
    }
    
    // Now ask the server to confirm the login is still valid
    // This is important because browser storage can be faked, but the server knows the truth
    try {
        console.log('Verifying session with server...');
        const response = await fetch(API_BASE + 'auth_api.php?action=checkSession', {
            method: 'GET',
            credentials: 'include'  // This sends the login cookie to the server
        });
        
        const data = await response.json();
        console.log('Server session check:', data);
        
        // If the server says the session is invalid, log them out
        if (!data.success || !data.data) {
            console.log('Session invalid, clearing localStorage and redirecting');
            localStorage.removeItem('currentUser');
            localStorage.removeItem('isLoggedIn');
            window.location.href = 'login.html';
            return null;
        }
        
        // Session is valid! Update the saved user info with fresh data from the server
        localStorage.setItem('currentUser', JSON.stringify(data.data));
        console.log('Session valid for:', data.data.email);
        
        return data.data;
        
    } catch (error) {
        // If we can't reach the server, log them out to be safe
        console.error('Session verification error:', error);
        localStorage.removeItem('currentUser');
        localStorage.removeItem('isLoggedIn');
        window.location.href = 'login.html';
        return null;
    }
}

// This function logs the user out
function handleLogout() {
    // Ask them to confirm they want to log out
    if (confirm('Are you sure you want to logout?')) {
        console.log('Logging out...');
        
        // Tell the server to end the session
        const formData = new FormData();
        formData.append('action', 'logout');
        
        fetch(API_BASE + 'auth_api.php', {
            method: 'POST',
            body: formData,
            credentials: 'include'
        })
        .then(() => {
            console.log('Logout successful');
            // Clear all the saved login info from the browser
            localStorage.removeItem('currentUser');
            localStorage.removeItem('isLoggedIn');
            showAlert('Logged out successfully!', 'success');
            // Wait 1 second then send them to the home page
            setTimeout(() => {
                window.location.href = 'index.php';
            }, 1000);
        })
        .catch(error => {
            // Even if the server request fails, still log them out locally
            console.error('Logout error:', error);
            localStorage.removeItem('currentUser');
            localStorage.removeItem('isLoggedIn');
            window.location.href = 'index.php';
        });
    }
}

// Get the logged-in user's information from browser storage
function getCurrentUser() {
    const userJson = localStorage.getItem('currentUser');
    return userJson ? JSON.parse(userJson) : null; // Convert from text to JavaScript object
}

// Update the saved user information in browser storage
function updateUserSession(userData) {
    localStorage.setItem('currentUser', JSON.stringify(userData));
}

// Show a message to the user (success or error)
function showAlert(message, type = 'success') {
    // Find the alert container on the page
    const alertContainer = document.getElementById('alertContainer');
    
    // If there's no alert container, just log to console
    if (!alertContainer) {
        console.log('Alert:', message);
        return;
    }
    
    // Choose the right color - green for success, red for error
    const alertClass = type === 'success' ? 'alert-success' : 'alert-error';
    
    // Create and show the alert message
    alertContainer.innerHTML = `
        <div class="alert ${alertClass}" role="alert">
            ${message}
        </div>
    `;
    
    // Automatically hide the alert after 5 seconds
    setTimeout(() => {
        alertContainer.innerHTML = '';
    }, 5000);
}

// When the page loads, automatically check if the user is logged in
document.addEventListener('DOMContentLoaded', function() {
    console.log('Page loaded, checking auth...');
    checkAuth();
});