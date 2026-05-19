-- V8__create_vehicle_sequence.sql
-- Create vehicle_sequence table to track the global EPC serial number counter

CREATE TABLE vehicle_sequence (
    id            BIGSERIAL    PRIMARY KEY,
    serial_number BIGINT       NOT NULL DEFAULT 1
);

-- Seed with the initial serial number of 1
INSERT INTO vehicle_sequence (serial_number) VALUES (1);
