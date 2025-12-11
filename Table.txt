-- Create database
CREATE DATABASE IF NOT EXISTS mcneese_parking;
USE mcneese_parking;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    firstName VARCHAR(100) NOT NULL,
    lastName VARCHAR(100) NOT NULL,
    studentId VARCHAR(50) NOT NULL,
    phone VARCHAR(20),
    userType ENUM('student', 'faculty', 'visitor') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Vehicles table
CREATE TABLE IF NOT EXISTS vehicles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    make VARCHAR(100) NOT NULL,
    model VARCHAR(100),
    year INT,
    color VARCHAR(50),
    licensePlate VARCHAR(20) NOT NULL,
    registered_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_license (licensePlate, user_id),
    INDEX idx_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Permits table
CREATE TABLE IF NOT EXISTS permits (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    vehicle_id INT NOT NULL,
    permitId VARCHAR(50) NOT NULL UNIQUE,
    fullName VARCHAR(200) NOT NULL,
    studentId VARCHAR(50) NOT NULL,
    vehicleMake VARCHAR(100) NOT NULL,
    licensePlate VARCHAR(20) NOT NULL,
    tagType ENUM('semester', 'annual') NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    purchase_date DATETIME NOT NULL,
    expiry_date DATETIME NOT NULL,
    status ENUM('active', 'expired', 'cancelled') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE,
    INDEX idx_user (user_id),
    INDEX idx_permitId (permitId),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Payments table
CREATE TABLE IF NOT EXISTS payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    permit_id INT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    transactionId VARCHAR(50) NOT NULL UNIQUE,
    cardLast4 VARCHAR(4) NOT NULL,
    payment_date DATETIME NOT NULL,
    status ENUM('pending', 'completed', 'failed') DEFAULT 'completed',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (permit_id) REFERENCES permits(id) ON DELETE CASCADE,
    INDEX idx_user (user_id),
    INDEX idx_transaction (transactionId)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
