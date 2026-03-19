-- V1__create_initial_schema.sql
-- RFID-Based Intelligent Vehicle Compliance Monitoring and Notification System
-- Initial Database Schema (merged from V1–V7)

-- =====================================================
-- Sequences
-- =====================================================
CREATE SEQUENCE role_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE users_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE vehicle_type_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE vehicle_make_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE vehicle_model_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE vehicle_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE reader_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE scan_center_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE document_type_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE document_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE detection_history_seq START WITH 1 INCREMENT BY 1;

-- =====================================================
-- Role Table
-- =====================================================
CREATE TABLE role (
    id          BIGINT PRIMARY KEY DEFAULT nextval('role_seq'),
    name        VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(255)
);

-- Insert default roles
INSERT INTO role (name, description) VALUES
    ('SUPERADMIN',        'Super Administrator with full system access'),
    ('SYSTEM_ADMIN',      'System Administrator with full access'),
    ('ADMIN',             'Administrator with access to manage users and scan centers'),
    ('OWNER',             'Vehicle Owner'),
    ('SCAN_CENTER_ADMIN', 'Scan Center Administrator with management access to a scan center'),
    ('SCAN_CENTER_USER',  'Scan Center User with operational access to a scan center');

-- =====================================================
-- Scan Center Table
-- =====================================================
CREATE TABLE scan_center (
    id         BIGINT PRIMARY KEY DEFAULT nextval('scan_center_seq'),
    name       VARCHAR(100) NOT NULL,
    location   JSONB,
    city       VARCHAR(100),
    district   VARCHAR(100),
    province   VARCHAR(100),
    is_active  BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- User Table
-- =====================================================
CREATE TABLE users (
    id             BIGINT PRIMARY KEY DEFAULT nextval('users_seq'),
    username       VARCHAR(100) NOT NULL UNIQUE,
    email          VARCHAR(100) NOT NULL UNIQUE,
    password       VARCHAR(255) NOT NULL,
    first_name     VARCHAR(100),
    last_name      VARCHAR(100),
    role_id        BIGINT,
    contact_number VARCHAR(20),
    nic            VARCHAR(20),
    district       VARCHAR(100),
    province       VARCHAR(100),
    scan_center_id BIGINT,
    created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_users_role        FOREIGN KEY (role_id)        REFERENCES role(id)        ON DELETE SET NULL,
    CONSTRAINT fk_users_scan_center FOREIGN KEY (scan_center_id) REFERENCES scan_center(id) ON DELETE SET NULL
);

-- Insert default superadmin user (password: superadmin)
INSERT INTO users (username, email, password, first_name, last_name, role_id) VALUES
    ('superadmin', 'superadmin@autocomply.com', '$2a$10$rDkPvvAFV8kqwvKJzwlRv.1MUlOkqMIjxKkK5J8TlJ0lKx8fThDUS', 'Super', 'Admin',
    (SELECT id FROM role WHERE name = 'SUPERADMIN'));

-- =====================================================
-- Vehicle Type Table
-- =====================================================
CREATE TABLE vehicle_type (
    id          BIGINT PRIMARY KEY DEFAULT nextval('vehicle_type_seq'),
    name        VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    zpl_code    TEXT,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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
-- Vehicle Make Table
-- =====================================================
CREATE TABLE vehicle_make (
    id          BIGINT PRIMARY KEY DEFAULT nextval('vehicle_make_seq'),
    name        VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default vehicle makes
INSERT INTO vehicle_make (name) VALUES
    ('Toyota'),
    ('Honda'),
    ('Ford'),
    ('Nissan'),
    ('Chevrolet'),
    ('Hyundai'),
    ('Kia'),
    ('Volkswagen'),
    ('Mercedes-Benz'),
    ('BMW'),
    ('Audi'),
    ('Lexus'),
    ('Mazda'),
    ('Subaru'),
    ('Mitsubishi'),
    ('Suzuki'),
    ('Isuzu'),
    ('Tata'),
    ('Mahindra'),
    ('Ashok Leyland'),
    ('Hino'),
    ('Foton'),
    ('JAC'),
    ('FAW'),
    ('GAC'),
    ('BYD'),
    ('Great Wall'),
    ('Changan'),
    ('Geely'),
    ('Chery'),
    ('Other');

-- =====================================================
-- Vehicle Model Table
-- =====================================================
CREATE TABLE vehicle_model (
    id          BIGINT PRIMARY KEY DEFAULT nextval('vehicle_model_seq'),
    name        VARCHAR(100) NOT NULL,
    make_id     BIGINT,
    description TEXT,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_vehicle_model_make FOREIGN KEY (make_id) REFERENCES vehicle_make(id) ON DELETE SET NULL
);

-- Insert default vehicle Model
INSERT INTO vehicle_model (name, make_id) VALUES
    ('Corolla', (SELECT id FROM vehicle_make WHERE name = 'Toyota')),
    ('Civic', (SELECT id FROM vehicle_make WHERE name = 'Honda')),
    ('F-150', (SELECT id FROM vehicle_make WHERE name = 'Ford')),
    ('Altima', (SELECT id FROM vehicle_make WHERE name = 'Nissan')),
    ('Silverado', (SELECT id FROM vehicle_make WHERE name = 'Chevrolet')),
    ('Elantra', (SELECT id FROM vehicle_make WHERE name = 'Hyundai')),
    ('Sportage', (SELECT id FROM vehicle_make WHERE name = 'Kia')),
    ('Golf', (SELECT id FROM vehicle_make WHERE name = 'Volkswagen')),
    ('C-Class', (SELECT id FROM vehicle_make WHERE name = 'Mercedes-Benz')),
    ('3 Series', (SELECT id FROM vehicle_make WHERE name = 'BMW')),
    ('A4', (SELECT id FROM vehicle_make WHERE name = 'Audi')),
    ('RX', (SELECT id FROM vehicle_make WHERE name = 'Lexus')),
    ('Mazda3', (SELECT id FROM vehicle_make WHERE name = 'Mazda')),
    ('Outback', (SELECT id FROM vehicle_make WHERE name = 'Subaru')),
    ('Pajero', (SELECT id FROM vehicle_make WHERE name = 'Mitsubishi')),
    ('Swift', (SELECT id FROM vehicle_make WHERE name = 'Suzuki')),
    ('D-Max', (SELECT id FROM vehicle_make WHERE name = 'Isuzu')),
    ('Indica', (SELECT id FROM vehicle_make WHERE name = 'Tata')),
    ('Scorpio', (SELECT id FROM vehicle_make WHERE name = 'Mahindra')),
    ('Captain 3118', (SELECT id FROM vehicle_make WHERE name = 'Ashok Leyland')),
    ('Dutro 3000', (SELECT id FROM vehicle_make WHERE name = 'Hino')),
    ('Aumark S 1.5T', (SELECT id FROM vehicle_make WHERE name = 'Foton')),
    ('N-Series 3.5T', (SELECT id FROM vehicle_make WHERE name = 'JAC')),
    ('J6L 6.8T', (SELECT id FROM vehicle_make WHERE name = 'FAW')),
    ('Trumpchi M8 2.0T', (SELECT id FROM vehicle_make WHERE name = 'GAC')),
    ('Tang EV600D', (SELECT id FROM vehicle_make WHERE name = 'BYD')),
    ('Wingle 7 2.0T', (SELECT id FROM vehicle_make WHERE name = 'Great Wall')),
    ('CS75 Plus 1.5T', (SELECT id FROM vehicle_make WHERE name = 'Changan')),
    ('Boyue 1.8T', (SELECT id FROM vehicle_make WHERE name = 'Geely')),
    ('Tiggo 8 1.6T', (SELECT id FROM vehicle_make WHERE name = 'Chery')),
    ('Other', (SELECT id FROM vehicle_make WHERE name = 'Other'));

-- =====================================================
-- Vehicle Table
-- =====================================================
CREATE TABLE vehicle (
    id                  BIGINT PRIMARY KEY DEFAULT nextval('vehicle_seq'),
    vehicle_type_id     BIGINT,
    vehicle_model_id    BIGINT,
    owner_id            BIGINT,
    registration_number VARCHAR(100) NOT NULL UNIQUE,
    vehicle_number      VARCHAR(100),
    chassis_number      VARCHAR(100),
    epc                 VARCHAR(100) NOT NULL UNIQUE,
    registered_year     INTEGER,
    created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_vehicle_vehicle_type FOREIGN KEY (vehicle_type_id) REFERENCES vehicle_type(id) ON DELETE SET NULL,
    CONSTRAINT fk_vehicle_vehicle_model FOREIGN KEY (vehicle_model_id) REFERENCES vehicle_model(id) ON DELETE SET NULL,
    CONSTRAINT fk_vehicle_owner        FOREIGN KEY (owner_id)        REFERENCES users(id)        ON DELETE SET NULL
);

-- =====================================================
-- Fix Reader Table (RFID Reader Hardware)
-- =====================================================
CREATE TABLE fix_reader (
    id             BIGINT PRIMARY KEY DEFAULT nextval('reader_seq'),
    name           VARCHAR(100) NOT NULL,
    serial_number  VARCHAR(100),
    model          VARCHAR(100),
    location       VARCHAR(255),
    ip_address     VARCHAR(45),
    is_active      BOOLEAN NOT NULL DEFAULT TRUE,
    scan_center_id BIGINT,
    created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_fix_reader_scan_center FOREIGN KEY (scan_center_id) REFERENCES scan_center(id) ON DELETE SET NULL
);

-- =====================================================
-- Document Type Table
-- =====================================================
CREATE TABLE document_type (
    id          BIGINT PRIMARY KEY DEFAULT nextval('document_type_seq'),
    name        VARCHAR(100) NOT NULL UNIQUE,
    description VARCHAR(255)
);

-- Insert default document types
INSERT INTO document_type (name, description) VALUES
    ('Insurance',       'Vehicle Insurance Certificate'),
    ('Revenue License', 'Annual Revenue License'),
    ('Emission Test',   'Vehicle Emission Test Certificate');

-- =====================================================
-- Document Table
-- =====================================================
CREATE TABLE document (
    id               BIGINT PRIMARY KEY DEFAULT nextval('document_seq'),
    vehicle_id       BIGINT,
    document_type_id BIGINT,
    reference_number VARCHAR(100),
    start_date       TIMESTAMP,
    end_date         TIMESTAMP,
    image_url        VARCHAR(500),
    created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_document_vehicle       FOREIGN KEY (vehicle_id)       REFERENCES vehicle(id)       ON DELETE CASCADE,
    CONSTRAINT fk_document_document_type FOREIGN KEY (document_type_id) REFERENCES document_type(id) ON DELETE SET NULL
);

-- =====================================================
-- Detection History Table
-- =====================================================
CREATE TABLE detection_history (
    id                BIGINT PRIMARY KEY DEFAULT nextval('detection_history_seq'),
    vehicle_id        BIGINT,
    reader_id         BIGINT,
    detected_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    compliance_status VARCHAR(50) NOT NULL,
    violation_details TEXT,
    created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_detection_vehicle     FOREIGN KEY (vehicle_id) REFERENCES vehicle(id)     ON DELETE SET NULL,
    CONSTRAINT fk_detection_fix_reader  FOREIGN KEY (reader_id)  REFERENCES fix_reader(id)  ON DELETE SET NULL
);

-- =====================================================
-- Indexes for Performance
-- =====================================================
CREATE INDEX idx_users_username        ON users(username);
CREATE INDEX idx_users_email           ON users(email);
CREATE INDEX idx_vehicle_epc           ON vehicle(epc);
CREATE INDEX idx_vehicle_registration  ON vehicle(registration_number);
CREATE INDEX idx_vehicle_owner         ON vehicle(owner_id);
CREATE INDEX idx_document_vehicle      ON document(vehicle_id);
CREATE INDEX idx_document_end_date     ON document(end_date);
CREATE INDEX idx_detection_vehicle     ON detection_history(vehicle_id);
CREATE INDEX idx_detection_timestamp   ON detection_history(detected_at);
CREATE INDEX idx_detection_status      ON detection_history(compliance_status);

-- =====================================================
-- Table Relationships Summary
-- =====================================================
-- role (1) ──────────────< users (N)
-- scan_center (1) ───────< users (N)
-- scan_center (1) ───────< fix_reader (N)
-- users (1) ─────────────< vehicle (N)
-- vehicle_type (1) ──────< vehicle (N)
-- vehicle (1) ───────────< document (N)
-- document_type (1) ─────< document (N)
-- vehicle (1) ───────────< detection_history (N)
-- fix_reader (1) ────────< detection_history (N)
