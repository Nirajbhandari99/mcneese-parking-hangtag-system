// purchase.js
// author Niraj Bhandari
const API_BASE = 'https://mcneeseparking.infinityfree.me/api/';

document.addEventListener('DOMContentLoaded', function() {
    const user = getCurrentUser();
    
    if (!user) {
        showAlert('Please login to purchase a parking permit.', 'error');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1500);
        return;
    }
    
    // Pre-fill user information
    document.getElementById('fullName').value = `${user.firstName} ${user.lastName}`;
    document.getElementById('studentId').value = user.studentId || '';
    
    // Format input fields
    document.getElementById('cardNumber').addEventListener('input', formatCardNumber);
    document.getElementById('expiryDate').addEventListener('input', formatExpiryDate);
    document.getElementById('cvv').addEventListener('input', formatCVV);
});

function formatCardNumber(e) {
    let value = e.target.value.replace(/\s/g, '');
    value = value.replace(/\D/g, '');
    value = value.substring(0, 16);
    
    let formattedValue = '';
    for (let i = 0; i < value.length; i++) {
        if (i > 0 && i % 4 === 0) {
            formattedValue += ' ';
        }
        formattedValue += value[i];
    }
    
    e.target.value = formattedValue;
}

function formatExpiryDate(e) {
    let value = e.target.value.replace(/\D/g, '');
    value = value.substring(0, 4);
    
    if (value.length >= 2) {
        value = value.substring(0, 2) + '/' + value.substring(2);
    }
    
    e.target.value = value;
}

function formatCVV(e) {
    let value = e.target.value.replace(/\D/g, '');
    e.target.value = value.substring(0, 4);
}

function updateTotal() {
    const selectedRadio = document.querySelector('input[name="tagType"]:checked');
    const totalElement = document.getElementById('totalAmount');
    
    if (selectedRadio && totalElement) {
        const price = selectedRadio.getAttribute('data-price');
        totalElement.textContent = `$${price}`;
    }
}

function handlePurchase(event) {
    event.preventDefault();
    
    console.log('Purchase form submitted');
    
    const user = getCurrentUser();
    if (!user) {
        showAlert('Session expired. Please login again.', 'error');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1500);
        return;
    }
    
    const formData = new FormData(event.target);
    
    // Validate card
    const cardNumber = formData.get('cardNumber');
    if (cardNumber.replace(/\s/g, '').length !== 16) {
        showAlert('Invalid card number. Please check and try again.', 'error');
        return;
    }
    
    // Validate expiry date
    if (!validateExpiryDate(formData.get('expiryDate'))) {
        showAlert('Invalid or expired card. Please check the expiry date.', 'error');
        return;
    }
    
    // Validate CVV
    if (formData.get('cvv').length < 3) {
        showAlert('Invalid CVV code.', 'error');
        return;
    }
    
    // Show loading state
    const submitBtn = event.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Processing payment...';
    
    // Get selected price
    const selectedRadio = document.querySelector('input[name="tagType"]:checked');
    const price = selectedRadio.getAttribute('data-price');
    
    // FIXED: Use URLSearchParams instead of FormData for proper PHP compatibility
    const params = new URLSearchParams({
        action: 'createPermit',
        fullName: formData.get('fullName'),
        studentId: formData.get('studentId'),
        vehicleMake: formData.get('vehicleMake'),
        licensePlate: formData.get('licensePlate'),
        tagType: formData.get('tagType'),
        price: price,
        cardNumber: cardNumber,
        expiryDate: formData.get('expiryDate'),
        cvv: formData.get('cvv'),
        cardholderName: formData.get('cardholderName')
    });
    
    console.log('Sending to:', API_BASE + 'permits_api.php');
    console.log('Request params:', params.toString());
    
    // FIXED: Proper fetch with error handling
    fetch(API_BASE + 'permits_api.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        credentials: 'include', // Important for session cookies
        body: params.toString()
    })
    .then(async response => {
        console.log('Response status:', response.status);
        console.log('Response headers:', response.headers.get('content-type'));
        
        // Get raw text first
        const text = await response.text();
        console.log('Raw response:', text);
        
        // Try to parse JSON
        try {
            return JSON.parse(text);
        } catch (e) {
            console.error('JSON parse error:', e);
            console.error('Response was:', text);
            throw new Error('Server returned invalid JSON. Response: ' + text.substring(0, 100));
        }
    })
    .then(result => {
        console.log('Parsed API Response:', result);
        
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
        
        if (result.success) {
            console.log('Payment successful, redirecting to confirmation');
            
            // Store permit info for confirmation page
            localStorage.setItem('lastPermit', JSON.stringify(result.data));
            
            showAlert('Payment successful! Redirecting to confirmation page...', 'success');
            
            setTimeout(() => {
                window.location.href = 'confirmation.html';
            }, 1500);
        } else {
            console.error('API Error:', result.message);
            showAlert(result.message || 'Payment failed. Please try again.', 'error');
        }
    })
    .catch(error => {
        console.error('Fetch Error:', error);
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
        showAlert('Connection error: ' + error.message, 'error');
    });
}

function validateExpiryDate(expiry) {
    const parts = expiry.split('/');
    if (parts.length !== 2) return false;
    
    const month = parseInt(parts[0]);
    const year = parseInt('20' + parts[1]);
    
    if (month < 1 || month > 12) return false;
    
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    
    if (year < currentYear || (year === currentYear && month < currentMonth)) {
        return false;
    }
    
    return true;
}

function showAlert(message, type = 'success') {
    const alertContainer = document.getElementById('alertContainer');
    if (!alertContainer) {
        alert(message);
        return;
    }
    
    const alertClass = type === 'success' ? 'alert-success' : 'alert-error';
    alertContainer.innerHTML = `
        <div class="alert ${alertClass}" role="alert">
            ${message}
        </div>
    `;
    
    setTimeout(() => {
        alertContainer.innerHTML = '';
    }, 5000);
}

function getCurrentUser() {
    const userJson = localStorage.getItem('currentUser');
    return userJson ? JSON.parse(userJson) : null;
}