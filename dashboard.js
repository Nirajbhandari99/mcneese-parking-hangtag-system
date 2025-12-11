// 
// DASHBOARD JAVASCRIPT FILE
// This file manages all the functionality on the user's dashboard page
// It loads permits, vehicles, payment history, and handles user interactions
// 
// The base URL for all API requests to the server
// Author Niraj Bhandari
const API_BASE = 'https://mcneeseparking.infinityfree.me/api/';

// PAGE INITIALIZATION
// This runs as soon as the page finishes loading

// Wait for the entire HTML page to load before running our code
document.addEventListener('DOMContentLoaded', function() {
    // Try to get the current logged-in user's information
    const user = getCurrentUser();
    
    // Check if user is logged in
    // If not logged in, redirect them to the login page
    if (!user) {
        showAlert('Please login to access the dashboard.', 'error');
        // Wait 1.5 seconds so user can see the message, then redirect
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1500);
        return; // Stop here, don't load dashboard data
    }
    
    // User is logged in! Display their first name in the welcome message
    if (document.getElementById('userName')) {
        document.getElementById('userName').textContent = user.firstName;
    }
    
    // Load all the dashboard information for this user
    loadActivePermits(user);        // Get their parking permits
    loadRegisteredVehicles(user);   // Get their registered vehicles
    loadPaymentHistory(user);       // Get their payment records
    loadAccountSettings(user);      // Fill in their account info form
});


// ============================================
// LOAD ACTIVE PERMITS
// Fetches all parking permits from the server and displays them
// ============================================

function loadActivePermits(user) {
    // Find the container where permits will be displayed
    const container = document.getElementById('activePermits');
    if (!container) return; // If container doesn't exist, stop here
    
    // Show a loading message while we fetch data
    container.innerHTML = '<p style="color: var(--medium-gray);">Loading permits...</p>';
    
    // Prepare the data we need to send to the server
    const formData = new FormData();
    formData.append('action', 'getPermits');
    
    // Make a request to the server to get permits
    fetch(API_BASE + 'permits_api.php', {
        method: 'GET',
        credentials: 'include' // Include cookies for authentication
    })
    .then(response => response.json()) // Convert response to JSON
    .then(data => {
        // Check if the request was successful
        if (!data.success) {
            container.innerHTML = ''; // Clear loading message, show nothing
            return;
        }
        
        // Get the array of permits from the response
        const permits = data.data;
        
        // Check if user has any permits
        if (permits.length === 0) {
            container.innerHTML = ''; // Clear loading message, show nothing
            return;
        }
        
        // Build HTML to display each permit
        let html = '';
        permits.forEach(permit => {
            // Convert expiry date string to a Date object
            const expiryDate = new Date(permit.expiry_date);
            
            // Check if the permit has expired by comparing to today's date
            const isExpired = expiryDate < new Date();
            
            // Set the CSS class and text based on whether it's expired
            const statusClass = isExpired ? 'status-expired' : 'status-active';
            const statusText = isExpired ? 'Expired' : 'Active';
            
            // Create a card for this permit with all its information
            html += `
                <div style="padding: 15px; border: 1px solid #ddd; border-radius: 8px; margin-bottom: 10px;">
                    <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 10px;">
                        <div>
                            <strong>${permit.tagType === 'semester' ? 'Semester Pass' : 'Annual Pass'}</strong>
                            <p style="font-size: 14px; color: var(--medium-gray); margin-top: 5px;">
                                Permit ID: ${permit.permitId}
                            </p>
                        </div>
                        <span class="status-badge ${statusClass}">${statusText}</span>
                    </div>
                    <p style="font-size: 14px; color: var(--medium-gray);">
                        Vehicle: ${permit.vehicleMake}<br>
                        License: ${permit.licensePlate}<br>
                        Expires: ${expiryDate.toLocaleDateString()}
                    </p>
                </div>
            `;
        });
        
        // Put all the permit cards on the page
        container.innerHTML = html;
    })
    .catch(error => {
        // If there's an error (network issue, server down, etc), log it
        console.error('Error loading permits:', error);
        container.innerHTML = ''; // Clear loading message on error
    });
}


// LOAD REGISTERED VEHICLES
// Fetcheing all vehicles the user has registered and displays them

function loadRegisteredVehicles(user) {
    // Find the container where vehicles will be displayed
    const container = document.getElementById('registeredVehicles');
    if (!container) return; // If container doesn't exist, stop here
    
    // Show loading message while fetching data
    container.innerHTML = '<p style="color: var(--medium-gray);">Loading vehicles...</p>';
    
    // Request the user's vehicles from the server
    fetch(API_BASE + 'vehicles_api.php?action=getVehicles', {
        credentials: 'include' // Include cookies for authentication
    })
    .then(response => response.json()) // Convert response to JSON
    .then(data => {
        // Check if the request was successful
        if (!data.success) {
            container.innerHTML = ''; // Clear loading message
            return;
        }
        
        // Get the array of vehicles from the response
        const vehicles = data.data;
        
        // Check if user has any vehicles registered
        if (vehicles.length === 0) {
            container.innerHTML = ''; // Clear loading message
            return;
        }
        
        // Build HTML to display each vehicle
        let html = '';
        vehicles.forEach((vehicle, index) => {
            // Create a card for each vehicle with a remove button
            html += `
                <div style="padding: 15px; border: 1px solid #ddd; border-radius: 8px; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <strong>${vehicle.make} ${vehicle.model || ''}</strong>
                        <p style="font-size: 14px; color: var(--medium-gray); margin-top: 5px;">
                            License: ${vehicle.licensePlate}
                        </p>
                    </div>
                    <button onclick="removeVehicle(${vehicle.id})" style="background: var(--danger); color: white; border: none; padding: 8px 15px; border-radius: 6px; cursor: pointer; font-size: 14px;">
                        Remove
                    </button>
                </div>
            `;
        });
        
        // Display all vehicle cards on the page
        container.innerHTML = html;
    })
    .catch(error => {
        // If there's an error, log it and clear the loading message
        console.error('Error loading vehicles:', error);
        container.innerHTML = '';
    });
}


// ============================================
// LOAD PAYMENT HISTORY
// Fetches all past payments the user has made and displays them
// ============================================

function loadPaymentHistory(user) {
    // Find the container where payment history will be displayed
    const container = document.getElementById('paymentHistory');
    if (!container) return; // If container doesn't exist, stop here
    
    // Show loading message while fetching data
    container.innerHTML = '<p style="color: var(--medium-gray);">Loading payment history...</p>';
    
    // Request payment history from the server
    fetch(API_BASE + 'permits_api.php?action=getPaymentHistory', {
        credentials: 'include' // Include cookies for authentication
    })
    .then(response => response.json()) // Convert response to JSON
    .then(data => {
        // Check if request was successful and if there are any payments
        if (!data.success || data.data.length === 0) {
            container.innerHTML = ''; // Clear loading message if no payments
            return;
        }
        
        // Get the array of payments from the response
        const payments = data.data;
        
        // Build HTML to display each payment
        let html = '';
        payments.forEach(payment => {
            // Convert payment date string to a Date object
            const date = new Date(payment.payment_date);
            
            // Create a card for each payment showing amount, card info, and date
            html += `
                <div style="padding: 15px; border: 1px solid #ddd; border-radius: 8px; margin-bottom: 10px;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                        <strong>$${parseFloat(payment.amount).toFixed(2)}</strong>
                        <span style="color: var(--success); font-size: 14px;">✓ Completed</span>
                    </div>
                    <p style="font-size: 14px; color: var(--medium-gray);">
                        Card ending in ${payment.cardLast4}<br>
                        ${date.toLocaleDateString()} at ${date.toLocaleTimeString()}
                    </p>
                    <p style="font-size: 12px; color: var(--medium-gray); margin-top: 5px;">
                        Transaction: ${payment.transactionId}
                    </p>
                </div>
            `;
        });
        
        // Display all payment records on the page
        container.innerHTML = html;
    })
    .catch(error => {
        // If there's an error, log it and clear the loading message
        console.error('Error loading payment history:', error);
        container.innerHTML = '';
    });
}


// ============================================
// LOAD ACCOUNT SETTINGS
// Fills in the account settings form with the user's current information
// ============================================

function loadAccountSettings(user) {
    // Fill in each form field with the user's existing data
    // If a field doesn't have data, use an empty string
    document.getElementById('firstName').value = user.firstName || '';
    document.getElementById('lastName').value = user.lastName || '';
    document.getElementById('phone').value = user.phone || '';
    document.getElementById('email').value = user.email || '';
}


// ============================================
// UPDATE ACCOUNT SETTINGS
// Saves changes when the user updates their account information
// ============================================

function updateAccountSettings(event) {
    // Prevent the form from submitting normally (which would refresh the page)
    event.preventDefault();
    
    // Get the current user information
    const user = getCurrentUser();
    if (!user) return; // If not logged in, stop here
    
    // Prepare the updated information to send to the server
    const formData = new FormData();
    formData.append('action', 'updateProfile');
    formData.append('firstName', document.getElementById('firstName').value.trim());
    formData.append('lastName', document.getElementById('lastName').value.trim());
    formData.append('phone', document.getElementById('phone').value.trim());
    
    // Send the updated information to the server
    fetch(API_BASE + 'auth_api.php', {
        method: 'POST',
        body: formData,
        credentials: 'include' // Include cookies for authentication
    })
    .then(response => response.json()) // Convert response to JSON
    .then(data => {
        // Check if the update was successful
        if (data.success) {
            // Update the local user object with new values
            user.firstName = document.getElementById('firstName').value;
            user.lastName = document.getElementById('lastName').value;
            user.phone = document.getElementById('phone').value;
            
            // Save the updated user data to browser storage
            updateUserSession(user);
            
            // Show success message to the user
            showAlert('Account settings updated successfully!', 'success');
            
            // Update the welcome message with new first name
            if (document.getElementById('userName')) {
                document.getElementById('userName').textContent = user.firstName;
            }
        } else {
            // If update failed, show error message from server
            showAlert(data.message, 'error');
        }
    })
    .catch(error => {
        // If there's a connection error, log it and show user-friendly message
        console.error('Error updating profile:', error);
        showAlert('Connection error. Please try again.', 'error');
    });
}


// ============================================
// VEHICLE MODAL FUNCTIONS
// Functions to show and hide the popup form for adding vehicles
// ============================================

// Show the add vehicle popup form
function showAddVehicleModal() {
    // Find the modal (popup) element
    const modal = document.getElementById('vehicleModal');
    if (modal) {
        // Make it visible by setting display to flex
        modal.style.display = 'flex';
    }
}

// Close the add vehicle popup form
function closeVehicleModal() {
    // Find the modal element
    const modal = document.getElementById('vehicleModal');
    if (modal) {
        // Hide it by setting display to none
        modal.style.display = 'none';
        // Clear all the form fields
        document.getElementById('addVehicleForm').reset();
    }
}


// ============================================
// ADD VEHICLE
// Saves a new vehicle when the user submits the add vehicle form
// ============================================

function handleAddVehicle(event) {
    // Prevent the form from submitting normally
    event.preventDefault();
    
    // Get the current user
    const user = getCurrentUser();
    if (!user) return; // If not logged in, stop here
    
    // Prepare the vehicle information to send to the server
    const formData = new FormData();
    formData.append('action', 'addVehicle');
    formData.append('make', document.getElementById('vehicleMake').value.trim());
    formData.append('model', document.getElementById('vehicleModel').value.trim());
    formData.append('year', document.getElementById('vehicleYear').value);
    formData.append('color', document.getElementById('vehicleColor').value.trim());
    // Convert license plate to uppercase for consistency
    formData.append('licensePlate', document.getElementById('vehicleLicense').value.trim().toUpperCase());
    
    // Send the vehicle data to the server
    fetch(API_BASE + 'vehicles_api.php', {
        method: 'POST',
        body: formData,
        credentials: 'include' // Include cookies for authentication
    })
    .then(response => response.json()) // Convert response to JSON
    .then(data => {
        // Check if the vehicle was added successfully
        if (data.success) {
            // Show success message
            showAlert('Vehicle added successfully!', 'success');
            // Close the popup form
            closeVehicleModal();
            // Refresh the vehicle list to show the new vehicle
            loadRegisteredVehicles(user);
        } else {
            // If adding failed, show error message from server
            showAlert(data.message, 'error');
        }
    })
    .catch(error => {
        // If there's a connection error, log it and show user-friendly message
        console.error('Error adding vehicle:', error);
        showAlert('Connection error. Please try again.', 'error');
    });
}


// ============================================
// REMOVE VEHICLE
// Deletes a vehicle when the user clicks the remove button
// ============================================

function removeVehicle(vehicleId) {
    // Get the current user
    const user = getCurrentUser();
    if (!user) return; // If not logged in, stop here
    
    // Ask the user to confirm they want to delete this vehicle
    // If they click cancel, stop here
    if (!confirm('Are you sure you want to remove this vehicle?')) {
        return;
    }
    
    // Prepare the request to delete the vehicle
    const formData = new FormData();
    formData.append('action', 'removeVehicle');
    formData.append('vehicleId', vehicleId);
    
    // Send the delete request to the server
    fetch(API_BASE + 'vehicles_api.php', {
        method: 'POST',
        body: formData,
        credentials: 'include' // Include cookies for authentication
    })
    .then(response => response.json()) // Convert response to JSON
    .then(data => {
        // Check if the vehicle was removed successfully
        if (data.success) {
            // Show success message
            showAlert('Vehicle removed successfully!', 'success');
            // Refresh the vehicle list (without the removed vehicle)
            loadRegisteredVehicles(user);
        } else {
            // If removal failed, show error message from server
            showAlert(data.message, 'error');
        }
    })
    .catch(error => {
        // If there's a connection error, log it and show user-friendly message
        console.error('Error removing vehicle:', error);
        showAlert('Connection error. Please try again.', 'error');
    });
}


// ============================================
// LOGOUT FUNCTION
// Logs the user out and redirects them to the home page
// ============================================

function handleLogout() {
    // Ask the user to confirm they want to logout
    if (confirm('Are you sure you want to logout?')) {
        // Prepare the logout request
        const formData = new FormData();
        formData.append('action', 'logout');
        
        // Send logout request to the server
        fetch(API_BASE + 'auth_api.php', {
            method: 'POST',
            body: formData,
            credentials: 'include' // Include cookies for authentication
        })
        .then(() => {
            // Clear user data from browser storage
            localStorage.removeItem('currentUser');
            localStorage.removeItem('isLoggedIn');
            // Redirect to home page
            window.location.href = 'index.php';
        });
    }
}


// ============================================
// SHOW ALERT MESSAGE
// Displays a colored message box at the top of the page
// Used for success messages (green) and error messages (red)
// /

function showAlert(message, type = 'success') {
    // Find the container where alerts are displayed
    const alertContainer = document.getElementById('alertContainer');
    if (!alertContainer) return; // If container doesn't exist, stop here
    
    // Choose the CSS class based on the type of alert
    // success = green box, error = red box
    const alertClass = type === 'success' ? 'alert-success' : 'alert-error';
    
    // Create the alert box with the message
    alertContainer.innerHTML = `
        <div class="alert ${alertClass}" role="alert">
            ${message}
        </div>
    `;
    
    // Automatically remove the alert after 5 seconds
    setTimeout(() => {
        alertContainer.innerHTML = '';
    }, 5000);
}


// 
// UTILITY FUNCTIONS
// Helper functions used throughout the dashboard
//

// Get the currently logged in user's information from browser storage
function getCurrentUser() {
    // Try to get user data from localStorage
    const userJson = localStorage.getItem('currentUser');
    // If found, convert from JSON string to object and return it
    // If not found, return null
    return userJson ? JSON.parse(userJson) : null;
}

// Save updated user information to browser storage
function updateUserSession(userData) {
    // Convert user object to JSON string and save it
    localStorage.setItem('currentUser', JSON.stringify(userData));
}