// profile.js - Profile Page Functionality
// author: Biraj man tamang
const API_BASE = 'https://mcneeseparking.infinityfree.me/api/';

document.addEventListener('DOMContentLoaded', function() {
    const user = getCurrentUser();
    
    if (!user) {
        showAlert('Please login to access your profile.', 'error');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1500);
        return;
    }
    
    loadUserProfile(user);
    loadActivePermits(user);
});

// Load user profile information
function loadUserProfile(user) {
    // Profile header
    const initials = (user.firstName.charAt(0) + user.lastName.charAt(0)).toUpperCase();
    document.getElementById('profileInitials').textContent = initials;
    document.getElementById('profileName').textContent = `${user.firstName} ${user.lastName}`;
    document.getElementById('profileEmail').textContent = user.email;
    
    // Personal information
    document.getElementById('displayFirstName').textContent = user.firstName;
    document.getElementById('displayLastName').textContent = user.lastName;
    document.getElementById('displayPhone').textContent = user.phone || 'Not provided';
    document.getElementById('displayStudentId').textContent = user.studentId || 'N/A';
    
    // Account details
    document.getElementById('displayEmail').textContent = user.email;
    document.getElementById('displayUserType').textContent = capitalizeFirst(user.userType || 'student');
    document.getElementById('displayMemberSince').textContent = 'Jan 2025'; // You can add created_at to the database
    
    // Pre-fill edit form
    document.getElementById('editFirstName').value = user.firstName;
    document.getElementById('editLastName').value = user.lastName;
    document.getElementById('editPhone').value = user.phone || '';
}

// Load active permits
function loadActivePermits(user) {
    const container = document.getElementById('activePermitsList');
    
    fetch(API_BASE + 'permits_api.php?action=getPermits', {
        credentials: 'include'
    })
    .then(response => response.json())
    .then(data => {
        if (!data.success || data.data.length === 0) {
            container.innerHTML = '<p style="color: var(--medium-gray);">No active permits found.</p>';
            return;
        }
        
        const permits = data.data.filter(permit => permit.status === 'active');
        
        if (permits.length === 0) {
            container.innerHTML = '<p style="color: var(--medium-gray);">No active permits found.</p>';
            return;
        }
        
        let html = '';
        permits.forEach(permit => {
            const expiryDate = new Date(permit.expiry_date);
            const daysLeft = Math.ceil((expiryDate - new Date()) / (1000 * 60 * 60 * 24));
            
            html += `
                <div style="padding: 15px; border: 1px solid #ddd; border-radius: 8px; margin-bottom: 10px;">
                    <div style="display: flex; justify-content: space-between; align-items: start;">
                        <div>
                            <strong>${permit.tagType === 'semester' ? 'Semester Pass' : 'Annual Pass'}</strong>
                            <p style="font-size: 14px; color: var(--medium-gray); margin-top: 5px;">
                                ${permit.vehicleMake} • ${permit.licensePlate}
                            </p>
                        </div>
                        <span class="status-badge status-active">Active</span>
                    </div>
                    <p style="font-size: 13px; color: var(--medium-gray); margin-top: 10px;">
                        Expires: ${expiryDate.toLocaleDateString()} (${daysLeft} days left)
                    </p>
                </div>
            `;
        });
        
        container.innerHTML = html;
    })
    .catch(error => {
        console.error('Error loading permits:', error);
        container.innerHTML = '<p style="color: var(--danger);">Error loading permits.</p>';
    });
}

// Show edit modal
function showEditModal() {
    document.getElementById('editModal').style.display = 'flex';
}

// Close edit modal
function closeEditModal() {
    document.getElementById('editModal').style.display = 'none';
}

// Show password modal
function showPasswordModal() {
    document.getElementById('passwordModal').style.display = 'flex';
    document.getElementById('changePasswordForm').reset();
}

// Close password modal
function closePasswordModal() {
    document.getElementById('passwordModal').style.display = 'none';
    document.getElementById('changePasswordForm').reset();
}

// Handle update profile
function handleUpdateProfile(event) {
    event.preventDefault();
    
    const firstName = document.getElementById('editFirstName').value.trim();
    const lastName = document.getElementById('editLastName').value.trim();
    const phone = document.getElementById('editPhone').value.trim();
    
    const submitBtn = event.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Saving...';
    
    const formData = new FormData();
    formData.append('action', 'updateProfile');
    formData.append('firstName', firstName);
    formData.append('lastName', lastName);
    formData.append('phone', phone);
    
    fetch(API_BASE + 'auth_api.php', {
        method: 'POST',
        body: formData,
        credentials: 'include'
    })
    .then(response => response.json())
    .then(data => {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
        
        if (data.success) {
            // Update localStorage
            const user = getCurrentUser();
            user.firstName = firstName;
            user.lastName = lastName;
            user.phone = phone;
            updateUserSession(user);
            
            // Reload profile display
            loadUserProfile(user);
            
            showAlert('Profile updated successfully!', 'success');
            closeEditModal();
        } else {
            showAlert(data.message, 'error');
        }
    })
    .catch(error => {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
        showAlert('Connection error. Please try again.', 'error');
        console.error('Update error:', error);
    });
}

// Handle change password
function handleChangePassword(event) {
    event.preventDefault();
    
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmNewPassword = document.getElementById('confirmNewPassword').value;
    
    if (newPassword !== confirmNewPassword) {
        showAlert('New passwords do not match.', 'error');
        return;
    }
    
    if (newPassword.length < 8) {
        showAlert('Password must be at least 8 characters.', 'error');
        return;
    }
    
    // Validate password strength
    if (!/[A-Z]/.test(newPassword)) {
        showAlert('Password must contain at least one uppercase letter.', 'error');
        return;
    }
    
    if (!/[a-z]/.test(newPassword)) {
        showAlert('Password must contain at least one lowercase letter.', 'error');
        return;
    }
    
    if (!/[0-9]/.test(newPassword)) {
        showAlert('Password must contain at least one number.', 'error');
        return;
    }
    
    if (!/[^A-Za-z0-9]/.test(newPassword)) {
        showAlert('Password must contain at least one special character.', 'error');
        return;
    }
    
    const submitBtn = event.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Updating...';
    
    const formData = new FormData();
    formData.append('action', 'changePassword');
    formData.append('currentPassword', currentPassword);
    formData.append('newPassword', newPassword);
    
    fetch(API_BASE + 'auth_api.php', {
        method: 'POST',
        body: formData,
        credentials: 'include'
    })
    .then(response => response.json())
    .then(data => {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
        
        if (data.success) {
            showAlert('Password changed successfully!', 'success');
            closePasswordModal();
            document.getElementById('changePasswordForm').reset();
        } else {
            showAlert(data.message, 'error');
        }
    })
    .catch(error => {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
        showAlert('Connection error. Please try again.', 'error');
        console.error('Password change error:', error);
    });
}

// Handle logout
function handleLogout() {
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
        });
    }
}

// Utility functions
function getCurrentUser() {
    const userJson = localStorage.getItem('currentUser');
    return userJson ? JSON.parse(userJson) : null;
}

function updateUserSession(userData) {
    localStorage.setItem('currentUser', JSON.stringify(userData));
}

function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

function showAlert(message, type = 'success') {
    const alertContainer = document.getElementById('alertContainer');
    if (!alertContainer) return;
    
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