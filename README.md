McNeese Parking Services
A professional web-based parking permit management system for McNeese State University students, faculty, and visitors.
🔗 Live Demo: https://mcneeseparking.infinityfree.me/
Overview
This application streamlines the parking permit purchase and management process, allowing users to register, purchase permits online, manage vehicles, and track payment history through an intuitive dashboard.
Key Features

User Authentication - Secure registration and login with McNeese email validation
Permit Purchase - Buy semester ($85) or annual ($150) parking permits online
Vehicle Management - Register and manage multiple vehicles
Dashboard - View active permits, vehicles, and payment history
Profile Management - Update personal information and change passwords
Session Security - Automatic timeout after 10 minutes of inactivity

Technology Stack
Frontend: HTML5, CSS3, JavaScript (ES6+)
Backend: PHP 7.4+, MySQL
Security: BCrypt password hashing, prepared statements, session management
Quick Start
Prerequisites

PHP 7.4+
MySQL 5.7+
Web server (Apache/Nginx)

Installation

Clone the repository
git clone https://github.com/yourusername/mcneese-parking.git
mysql -u username -p database_name < Table.txt
```

4. **Update API endpoints**
   - Update `API_BASE` constant in all JavaScript files to your domain

5. **Access the application**
   - Navigate to your configured domain or localhost

## Database Schema

- **users** - User accounts and authentication
- **vehicles** - Registered vehicle information
- **permits** - Active and expired parking permits
- **payments** - Transaction history and receipts

## Security Features

- Password requirements: 8+ characters, uppercase, lowercase, number, special character
- Email validation: @mcneese.edu domain only
- SQL injection prevention via prepared statements
- XSS protection through input sanitization
- Secure session management with timeout warnings

## API Endpoints

### Authentication
- `POST /api/auth_api.php?action=register` - Create new account
- `POST /api/auth_api.php?action=login` - User login
- `POST /api/auth_api.php?action=logout` - User logout
- `GET /api/auth_api.php?action=checkSession` - Verify session

### Permits
- `POST /api/permits_api.php?action=createPermit` - Purchase permit
- `GET /api/permits_api.php?action=getPermits` - View user permits
- `GET /api/permits_api.php?action=getPaymentHistory` - View payments

### Vehicles
- `POST /api/vehicles_api.php?action=addVehicle` - Register vehicle
- `GET /api/vehicles_api.php?action=getVehicles` - View vehicles
- `POST /api/vehicles_api.php?action=removeVehicle` - Remove vehicle

## Project Structure
```
mcneese-parking/
├── index.php                    # Homepage
├── login.html                   # Login page
├── register.html                # Registration
├── dashboard.html               # User dashboard
├── purchase.html                # Permit purchase
├── confirmation.html            # Purchase confirmation
├── profile.html                 # User profile
├── styles.css                   # Global styles
├── *.js                         # Frontend logic
├── api/
│   ├── config.php              # Database config
│   ├── auth_api.php            # Authentication
│   ├── permits_api.php         # Permits management
│   └── vehicles_api.php        # Vehicle management
└── Table.txt                   # Database schema
Note: Valid @mcneese.edu email required for registration.
