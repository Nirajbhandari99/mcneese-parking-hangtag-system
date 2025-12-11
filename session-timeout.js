// session-timeout.js - Session Timeout Feature
// Add this to your project to handle automatic session timeout
// <!-- Author:Biraj Man Tamang-->

const SESSION_CONFIG = {
    TIMEOUT_DURATION: 10 * 60 * 1000,      // 10 minutes in milliseconds
    WARNING_TIME: 2 * 60 * 1000,           // Show warning 2 minutes before timeout
    CHECK_INTERVAL: 1 * 60 * 1000          // Check session every 1 minute
};

let sessionTimeoutId = null;
let warningTimeoutId = null;
let lastActivityTime = Date.now();
let warningShown = false;

// Initialize session timeout when page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('Initializing session timeout...');
    
    // Check if user is logged in
    if (localStorage.getItem('isLoggedIn') === 'true') {
        initializeSessionTimeout();
        setupActivityListeners();
        startSessionChecker();
    }
});

// Setup activity listeners to reset idle timer
function setupActivityListeners() {
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
    
    events.forEach(event => {
        document.addEventListener(event, resetSessionTimeout, true);
    });
}

// Reset the session timeout timer
function resetSessionTimeout() {
    lastActivityTime = Date.now();
    warningShown = false;
    
    // Clear existing timeouts
    if (sessionTimeoutId) {
        clearTimeout(sessionTimeoutId);
    }
    if (warningTimeoutId) {
        clearTimeout(warningTimeoutId);
    }
    
    // Hide warning modal if shown
    const warningModal = document.getElementById('sessionWarningModal');
    if (warningModal && warningModal.style.display === 'flex') {
        warningModal.style.display = 'none';
    }
    
    // Set new warning timeout
    const warningTime = SESSION_CONFIG.TIMEOUT_DURATION - SESSION_CONFIG.WARNING_TIME;
    warningTimeoutId = setTimeout(showSessionWarning, warningTime);
    
    // Set new logout timeout
    sessionTimeoutId = setTimeout(forceLogout, SESSION_CONFIG.TIMEOUT_DURATION);
}

// Show warning modal before session timeout
function showSessionWarning() {
    if (warningShown) return;
    warningShown = true;
    
    const modal = document.getElementById('sessionWarningModal');
    if (!modal) {
        console.warn('Session warning modal not found in HTML');
        return;
    }
    
    modal.style.display = 'flex';
    
    // Update countdown timer
    let secondsLeft = Math.ceil(SESSION_CONFIG.WARNING_TIME / 1000);
    const countdownElement = document.getElementById('sessionCountdown');
    
    const countdownInterval = setInterval(() => {
        secondsLeft--;
        if (countdownElement) {
            countdownElement.textContent = secondsLeft;
        }
        
        if (secondsLeft <= 0) {
            clearInterval(countdownInterval);
        }
    }, 1000);
}

// Initialize session timeout
function initializeSessionTimeout() {
    resetSessionTimeout();
}

// Extend session by calling server
function extendSession() {
    const formData = new FormData();
    formData.append('action', 'checkSession');
    
    fetch(API_BASE + 'auth_api.php', {
        method: 'GET',
        credentials: 'include'
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Reset the timer after confirming session is still valid
            resetSessionTimeout();
            
            const modal = document.getElementById('sessionWarningModal');
            if (modal) {
                modal.style.display = 'none';
            }
            
            showAlert('Session extended. You have 15 minutes remaining.', 'success');
        } else {
            // Session expired on server
            forceLogout();
        }
    })
    .catch(error => {
        console.error('Error extending session:', error);
        showAlert('Failed to extend session. You will be logged out.', 'error');
        forceLogout();
    });
}

// Force logout due to timeout
function forceLogout() {
    console.log('Session timeout - logging out');
    
    // Clear storage
    localStorage.removeItem('currentUser');
    localStorage.removeItem('isLoggedIn');
    
    // Make logout API call
    const formData = new FormData();
    formData.append('action', 'logout');
    
    fetch(API_BASE + 'auth_api.php', {
        method: 'POST',
        body: formData,
        credentials: 'include'
    })
    .catch(error => console.error('Logout error:', error))
    .finally(() => {
        // Redirect to login regardless of API response
        window.location.href = 'login.html';
    });
}

// Check session validity periodically
function startSessionChecker() {
    setInterval(() => {
        if (localStorage.getItem('isLoggedIn') !== 'true') {
            return; // User already logged out
        }
        
        fetch(API_BASE + 'auth_api.php?action=checkSession', {
            method: 'GET',
            credentials: 'include'
        })
        .then(response => response.json())
        .then(data => {
            if (!data.success) {
                // Session expired on server
                console.log('Server session expired');
                forceLogout();
            }
        })
        .catch(error => {
            console.error('Session check error:', error);
            // Don't logout on network error, just log it
        });
    }, SESSION_CONFIG.CHECK_INTERVAL);
}

// Handle logout button click
function handleLogout() {
    if (warningShown) {
        // Don't show confirmation if warning is already displayed
        clearTimeout(sessionTimeoutId);
        clearTimeout(warningTimeoutId);
    }
    
    if (confirm('Are you sure you want to logout?')) {
        const formData = new FormData();
        formData.append('action', 'logout');
        
        fetch(API_BASE + 'auth_api.php', {
            method: 'POST',
            body: formData,
            credentials: 'include'
        })
        .then(() => {
            localStorage.removeItem('currentUser');
            localStorage.removeItem('isLoggedIn');
            window.location.href = 'index.php';
        })
        .catch(error => {
            console.error('Logout error:', error);
            localStorage.removeItem('currentUser');
            localStorage.removeItem('isLoggedIn');
            window.location.href = 'index.php';
        });
    }
}