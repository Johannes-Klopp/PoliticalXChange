-- Landesheimrat Wahl - Database Schema for Railway
-- DSGVO-konform: Alle Daten werden nach Wahl automatisch gelöscht

-- Railway nutzt bereits die Datenbank 'railway', daher kein CREATE DATABASE
-- USE railway; -- Wird automatisch verwendet

-- Kandidaten Tabelle
CREATE TABLE IF NOT EXISTS candidates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    age INT,
    facility_name VARCHAR(255) NOT NULL,
    facility_location VARCHAR(255) NOT NULL,
    biography TEXT(2000),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_facility (facility_name)
) ENGINE=InnoDB;

-- Einrichtungen Tabelle
CREATE TABLE IF NOT EXISTS facilities (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    location VARCHAR(255),
    token_sent BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_email (email)
) ENGINE=InnoDB;

-- Voting Tokens Tabelle
CREATE TABLE IF NOT EXISTS voting_tokens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    facility_id INT NOT NULL,
    token VARCHAR(512) NOT NULL UNIQUE,
    used BOOLEAN DEFAULT FALSE,
    used_at TIMESTAMP NULL,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    FOREIGN KEY (facility_id) REFERENCES facilities(id) ON DELETE CASCADE,
    INDEX idx_token (token),
    INDEX idx_used (used),
    INDEX idx_expires (expires_at)
) ENGINE=InnoDB;

-- Votes Tabelle (Anonymisiert - keine Zuordnung zu Email/Token)
CREATE TABLE IF NOT EXISTS votes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    candidate_id INT NOT NULL,
    voted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (candidate_id) REFERENCES candidates(id) ON DELETE CASCADE,
    INDEX idx_candidate (candidate_id)
) ENGINE=InnoDB;

-- Admin Tabelle
CREATE TABLE IF NOT EXISTS admins (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Newsletter Anmeldungen
CREATE TABLE IF NOT EXISTS newsletter_subscriptions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    confirmed BOOLEAN DEFAULT FALSE,
    confirmation_token VARCHAR(512),
    confirmed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_confirmed (confirmed)
) ENGINE=InnoDB;

-- Audit Log für Sicherheit
CREATE TABLE IF NOT EXISTS audit_log (
    id INT AUTO_INCREMENT PRIMARY KEY,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50),
    entity_id INT,
    details TEXT,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_action (action),
    INDEX idx_created (created_at)
) ENGINE=InnoDB;

-- Standard Admin Account (Passwort muss geändert werden)
-- Passwort: ChangeMeNow123!
INSERT INTO admins (username, password_hash) VALUES
('admin', '$2a$10$rQUeVhG5yGz6YhqK5xJYWuXMF8qL.nZ7WVZ9xGp0qYvKqF8yL5QZ.')
ON DUPLICATE KEY UPDATE username=username;
