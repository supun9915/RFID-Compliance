-- V1__create_initial_schema.sql
-- RFID-Based Intelligent Vehicle Compliance Monitoring and Notification System
-- Initial Database Schema

-- =====================================================
-- Sequences
-- =====================================================
CREATE SEQUENCE role_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE users_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE vehicle_type_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE vehicle_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE reader_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE antenna_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE document_type_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE document_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE detection_history_seq START WITH 1 INCREMENT BY 1;

-- =====================================================
-- Role Table
-- =====================================================
CREATE TABLE role (
    id BIGINT PRIMARY KEY DEFAULT nextval('role_seq'),
    name VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(255)
);

-- Insert default roles
INSERT INTO role (name, description) VALUES 
    ('SUPERADMIN', 'Super Administrator with full system access'),
    ('ADMIN', 'System Administrator with full access'),
    ('OWNER', 'Vehicle Owner'),
    ('POLICE', 'Law Enforcement Officer');

-- =====================================================
-- User Table
-- =====================================================
CREATE TABLE users (
    id BIGINT PRIMARY KEY DEFAULT nextval('users_seq'),
    username VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    role_id BIGINT,
    contact_number VARCHAR(20),
    nic VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_users_role FOREIGN KEY (role_id) REFERENCES role(id) ON DELETE SET NULL
);

-- Insert default superadmin user (password: superadmin)
INSERT INTO users (username, email, password, first_name, last_name, role_id) VALUES 
    ('superadmin', 'superadmin@autocomply.com', '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG', 'Super', 'Admin', 
    (SELECT id FROM role WHERE name = 'SUPERADMIN'));

-- =====================================================
-- Vehicle Type Table
-- =====================================================
CREATE TABLE vehicle_type (
    id BIGINT PRIMARY KEY DEFAULT nextval('vehicle_type_seq'),
    name VARCHAR(100) NOT NULL UNIQUE,
    zpl_code TEXT
);

-- Insert default vehicle types
INSERT INTO vehicle_type (name) VALUES 
    ('Motor Car'),
    ('Van'),
    ('Mini Bus'),
    ('Large Bus'),
    ('Light Lorry'),
    ('Heavy Lorry'),
    ('Truck');

-- =====================================================
-- Vehicle Table
-- =====================================================
CREATE TABLE vehicle (
    id BIGINT PRIMARY KEY DEFAULT nextval('vehicle_seq'),
    vehicle_type_id BIGINT,
    owner_id BIGINT,
    registration_number VARCHAR(100) NOT NULL UNIQUE,
    epc VARCHAR(100) NOT NULL UNIQUE,
    registered_year INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_vehicle_vehicle_type FOREIGN KEY (vehicle_type_id) REFERENCES vehicle_type(id) ON DELETE SET NULL,
    CONSTRAINT fk_vehicle_owner FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE SET NULL
);

-- =====================================================
-- Reader Table (Hardware Management)
-- =====================================================
CREATE TABLE reader (
    id BIGINT PRIMARY KEY DEFAULT nextval('reader_seq'),
    name VARCHAR(100) NOT NULL,
    location VARCHAR(255),
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- Antenna Table
-- =====================================================
CREATE TABLE antenna (
    id BIGINT PRIMARY KEY DEFAULT nextval('antenna_seq'),
    reader_id BIGINT,
    antenna_port INTEGER NOT NULL,
    name VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_antenna_reader FOREIGN KEY (reader_id) REFERENCES reader(id) ON DELETE CASCADE
);

-- =====================================================
-- Document Type Table
-- =====================================================
CREATE TABLE document_type (
    id BIGINT PRIMARY KEY DEFAULT nextval('document_type_seq'),
    name VARCHAR(100) NOT NULL UNIQUE,
    description VARCHAR(255)
);

-- Insert default document types
INSERT INTO document_type (name, description) VALUES 
    ('Insurance', 'Vehicle Insurance Certificate'),
    ('Revenue License', 'Annual Revenue License'),
    ('Emission Test', 'Vehicle Emission Test Certificate');

-- =====================================================
-- Document Table
-- =====================================================
CREATE TABLE document (
    id BIGINT PRIMARY KEY DEFAULT nextval('document_seq'),
    vehicle_id BIGINT,
    document_type_id BIGINT,
    reference_number VARCHAR(100),
    start_date TIMESTAMP,
    end_date TIMESTAMP,
    image_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_document_vehicle FOREIGN KEY (vehicle_id) REFERENCES vehicle(id) ON DELETE CASCADE,
    CONSTRAINT fk_document_document_type FOREIGN KEY (document_type_id) REFERENCES document_type(id) ON DELETE SET NULL
);

-- =====================================================
-- Detection History Table
-- =====================================================
CREATE TABLE detection_history (
    id BIGINT PRIMARY KEY DEFAULT nextval('detection_history_seq'),
    vehicle_id BIGINT,
    reader_id BIGINT,
    antenna_id BIGINT,
    detected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    compliance_status VARCHAR(50) NOT NULL,
    violation_details TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_detection_vehicle FOREIGN KEY (vehicle_id) REFERENCES vehicle(id) ON DELETE SET NULL,
    CONSTRAINT fk_detection_reader FOREIGN KEY (reader_id) REFERENCES reader(id) ON DELETE SET NULL,
    CONSTRAINT fk_detection_antenna FOREIGN KEY (antenna_id) REFERENCES antenna(id) ON DELETE SET NULL
);

-- =====================================================
-- Indexes for Performance
-- =====================================================
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_vehicle_epc ON vehicle(epc);
CREATE INDEX idx_vehicle_registration ON vehicle(registration_number);
CREATE INDEX idx_vehicle_owner ON vehicle(owner_id);
CREATE INDEX idx_document_vehicle ON document(vehicle_id);
CREATE INDEX idx_document_end_date ON document(end_date);
CREATE INDEX idx_detection_vehicle ON detection_history(vehicle_id);
CREATE INDEX idx_detection_timestamp ON detection_history(detected_at);
CREATE INDEX idx_detection_status ON detection_history(compliance_status);

-- =====================================================
-- Table Relationships Summary
-- =====================================================
-- role (1) ──────────────< users (N)
--   └── One role can have many users
--
-- users (1) ─────────────< vehicle (N)
--   └── One user (owner) can have many vehicles
--
-- vehicle_type (1) ──────< vehicle (N)
--   └── One vehicle type can have many vehicles
--
-- vehicle (1) ───────────< document (N)
--   └── One vehicle can have many documents
--
-- document_type (1) ─────< document (N)
--   └── One document type can have many documents
--
-- reader (1) ────────────< antenna (N)
--   └── One reader can have many antennas
--
-- vehicle (1) ───────────< detection_history (N)
-- reader (1) ────────────< detection_history (N)
-- antenna (1) ───────────< detection_history (N)
--   └── Detection history references vehicle, reader, and antenna
--
-- =====================================================
-- Foreign Key Constraints Summary
-- =====================================================
-- fk_users_role:              users.role_id -> role.id (ON DELETE SET NULL)
-- fk_vehicle_vehicle_type:    vehicle.vehicle_type_id -> vehicle_type.id (ON DELETE SET NULL)
-- fk_vehicle_owner:           vehicle.owner_id -> users.id (ON DELETE SET NULL)
-- fk_antenna_reader:          antenna.reader_id -> reader.id (ON DELETE CASCADE)
-- fk_document_vehicle:        document.vehicle_id -> vehicle.id (ON DELETE CASCADE)
-- fk_document_document_type:  document.document_type_id -> document_type.id (ON DELETE SET NULL)
-- fk_detection_vehicle:       detection_history.vehicle_id -> vehicle.id (ON DELETE SET NULL)
-- fk_detection_reader:        detection_history.reader_id -> reader.id (ON DELETE SET NULL)
-- fk_detection_antenna:       detection_history.antenna_id -> antenna.id (ON DELETE SET NULL)
