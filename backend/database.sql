-- Landesheimrat Wahl - Database Schema
-- DSGVO-konform: Alle Daten werden nach Wahl automatisch gelöscht

CREATE DATABASE IF NOT EXISTS landesheimrat_wahl CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE landesheimrat_wahl;

-- Kandidaten Tabelle
CREATE TABLE candidates (
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
CREATE TABLE facilities (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    location VARCHAR(255),
    token_sent BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_email (email)
) ENGINE=InnoDB;

-- Voting Tokens Tabelle
CREATE TABLE voting_tokens (
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
-- Eine Stimme kann bis zu 8 Kandidaten enthalten
CREATE TABLE votes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    vote_session_id VARCHAR(64) NOT NULL,
    candidate_id INT NOT NULL,
    voted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (candidate_id) REFERENCES candidates(id) ON DELETE CASCADE,
    INDEX idx_candidate (candidate_id),
    INDEX idx_session (vote_session_id)
) ENGINE=InnoDB;

-- Admin Tabelle
CREATE TABLE admins (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Newsletter Anmeldungen
CREATE TABLE newsletter_subscriptions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    group_name VARCHAR(255) NOT NULL,
    facility_name VARCHAR(255) NOT NULL,
    region VARCHAR(255),
    confirmed BOOLEAN DEFAULT FALSE,
    confirmation_token VARCHAR(512),
    confirmed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_confirmed (confirmed),
    INDEX idx_facility (facility_name)
) ENGINE=InnoDB;

-- Audit Log für Sicherheit
CREATE TABLE audit_log (
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
('admin', '$2a$10$rQUeVhG5yGz6YhqK5xJYWuXMF8qL.nZ7WVZ9xGp0qYvKqF8yL5QZ.');
