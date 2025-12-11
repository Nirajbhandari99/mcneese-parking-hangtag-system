// ============================================
// PARKING PERMIT CONFIRMATION PAGE
// This file handles showing the user their parking permit details after purchase
//Author: Biraj Man Tamang
// ============================================

// Wait for the page to fully load before running our code
document.addEventListener('DOMContentLoaded', function() {
    loadPermitDetails();
});

// --------------------------------------------
// MAIN FUNCTION: Load and Display Permit
// --------------------------------------------
// This function gets the permit information and shows it on the page
function loadPermitDetails() {
    // Try to get the permit data that was saved earlier
    // We're looking for the last permit the user purchased
    const permitJson = localStorage.getItem('lastPermit');
    
    // Check if we actually found a permit
    if (!permitJson) {
        // No permit found! Show an error message and send them back to buy one
        alert('No permit found. Please purchase a permit first.');
        window.location.href = 'purchase.html';
        return; // Stop here - don't try to show permit details
    }
    
    // We found the permit! Convert it from text (JSON) back into usable data
    const permit = JSON.parse(permitJson);
    
    // Now show all the permit information on the page
    displayPermitInfo(permit);
}

// --------------------------------------------
// DISPLAY FUNCTION: Show All Permit Details
// --------------------------------------------
// This takes the permit data and puts it into the right spots on the page
function displayPermitInfo(permit) {
    // --- Permit ID Section ---
    // Create or use the permit ID number
    const permitId = permit.permitId || 'PMT-' + Date.now();
    
    // Show the permit ID in three different places on the page
    // (so the user can easily find it wherever they look)
    document.getElementById('permitIdDisplay').textContent = permitId;
    document.getElementById('permitIdInstructions').textContent = permitId;
    document.getElementById('permitIdReminder').textContent = permitId;
    
    // --- Personal Information Section ---
    // Show the user's name (or "N/A" if somehow it's missing)
    document.getElementById('confirmName').textContent = permit.fullName || 'N/A';
    
    // Show the user's student ID number
    document.getElementById('confirmStudentId').textContent = permit.studentId || 'N/A';
    
    // --- Vehicle Information Section ---
    // Show what kind of car they're registering
    document.getElementById('confirmVehicle').textContent = permit.vehicleMake || 'N/A';
    
    // Show their license plate number
    document.getElementById('confirmLicense').textContent = permit.licensePlate || 'N/A';
    
    // --- Permit Type Section ---
    // Figure out if they bought a semester pass or yearly pass
    // Then convert it to a nice readable format
    const permitType = permit.tagType === 'semester' ? 'Semester Pass' : 'Annual Pass';
    document.getElementById('confirmPermitType').textContent = permitType;
    
    // --- Price Section ---
    // Get the amount they paid (or 0 if missing)
    const amount = permit.price || 0;
    
    // Format it as money with dollar sign and 2 decimal places ($50.00)
    document.getElementById('confirmAmount').textContent = '$' + parseFloat(amount).toFixed(2);
    
    // --- Dates Section ---
    // Convert the date strings into actual date objects we can format
    const purchaseDate = new Date(permit.purchaseDate);
    const expiryDate = new Date(permit.expiryDate);
    
    // Show when they bought the permit (like "Dec 11, 2024")
    document.getElementById('confirmDate').textContent = purchaseDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
    
    // Show when the permit expires
    document.getElementById('confirmExpiry').textContent = expiryDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
    
    // --- Transaction ID Section ---
    // Show the unique transaction number for this purchase
    const transactionId = permit.transactionId || 'TXN-' + Date.now();
    document.getElementById('confirmTransaction').textContent = transactionId;
}

// --------------------------------------------
// DOWNLOAD FUNCTION: Save Receipt as Text File
// --------------------------------------------
// This lets the user download their receipt as a .txt file
function downloadReceipt() {
    // Get the permit data again
    const permitJson = localStorage.getItem('lastPermit');
    
    // If no permit exists, stop here
    if (!permitJson) return;
    
    // Convert the permit data back to an object
    const permit = JSON.parse(permitJson);
    
    // Create the receipt text (formatted nicely)
    const receiptContent = generateReceiptText(permit);
    
    // Create a downloadable file from the text
    const blob = new Blob([receiptContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    
    // Create an invisible download link and click it automatically
    const a = document.createElement('a');
    a.href = url;
    a.download = `McNeese_Parking_Receipt_${permit.permitId}.txt`;
    document.body.appendChild(a);
    a.click(); // Trigger the download
    
    // Clean up - remove the link and free up memory
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    // Show a success message to the user
    showNotification('Receipt downloaded successfully!');
}

// --------------------------------------------
// GENERATE RECEIPT TEXT: Format the Receipt
// --------------------------------------------
// This creates a nicely formatted text receipt with all the permit details
function generateReceiptText(permit) {
    // Return a multi-line text string with all the information
    // Using template literals (backticks) to make it easy to format
    return `
========================================
    MCNEESE STATE UNIVERSITY
       PARKING SERVICES RECEIPT
========================================

PERMIT ID: ${permit.permitId}
Transaction ID: ${permit.transactionId}

----------------------------------------
PERSONAL INFORMATION
----------------------------------------
Name: ${permit.fullName}
Student ID: ${permit.studentId}

----------------------------------------
VEHICLE INFORMATION
----------------------------------------
Vehicle: ${permit.vehicleMake}
License Plate: ${permit.licensePlate}

----------------------------------------
PERMIT DETAILS
----------------------------------------
Type: ${permit.tagType === 'semester' ? 'Semester Pass' : 'Annual Pass'}
Amount Paid: $${parseFloat(permit.price).toFixed(2)}
Purchase Date: ${new Date(permit.purchaseDate).toLocaleDateString()}
Expiration Date: ${new Date(permit.expiryDate).toLocaleDateString()}

----------------------------------------
IMPORTANT INSTRUCTIONS
----------------------------------------
1. Visit Parking Services Office
   Location: 4205 Ryan St, Lake Charles, LA 70609
   Hours: Monday-Friday, 8:00 AM - 5:00 PM

2. Bring Required Documents:
   - Valid student/faculty ID
   - Vehicle registration or insurance card
   - Driver's license
   - Your Permit ID: ${permit.permitId}

3. Display your hang tag at all times when parked on campus

For questions, contact:
Phone: (337) 475-5000
Email: parking@mcneese.edu

========================================
      Thank you for your purchase!
========================================
    `.trim(); // .trim() removes extra spaces at the beginning and end
}

// --------------------------------------------
// PRINT FUNCTION: Open Print Dialog
// --------------------------------------------
// This opens the browser's print window so users can print their confirmation
function printPermit() {
    window.print(); // Opens the print dialog
    showNotification('Opening print dialog...');
}

// --------------------------------------------
// NOTIFICATION FUNCTION: Show Success Messages
// --------------------------------------------
// This creates a nice green pop-up message in the corner of the screen
function showNotification(message) {
    // Create a new div element for the notification
    const notification = document.createElement('div');
    
    // Style it to look nice (green box in top-right corner)
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #28a745;
        color: white;
        padding: 15px 25px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        font-weight: 600;
        animation: slideIn 0.3s ease-out;
    `;
    notification.textContent = message;
    
    // Add animation styles for sliding in and out
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(400px);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        @keyframes slideOut {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(400px);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
    
    // Add the notification to the page
    document.body.appendChild(notification);
    
    // After 3 seconds, start the slide-out animation
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        
        // After the animation finishes, remove the notification completely
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300); // Wait 300ms for animation to finish
    }, 3000); // Wait 3 seconds before starting to hide
}

// --------------------------------------------
// UTILITY FUNCTION: Get Current User
// --------------------------------------------
// This retrieves the currently logged-in user's information
// (Currently not used in this file, but available if needed)
function getCurrentUser() {
    // Look for user data in storage
    const userJson = localStorage.getItem('currentUser');
    
    // If found, convert it to an object and return it
    // If not found, return null
    return userJson ? JSON.parse(userJson) : null;
}