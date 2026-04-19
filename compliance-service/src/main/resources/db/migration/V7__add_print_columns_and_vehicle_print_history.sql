-- V7__add_print_columns_and_vehicle_print_history.sql
-- Add print details columns to vehicle table and create vehicle_print_history table

-- =====================================================
-- Add print columns to vehicle table
-- =====================================================
ALTER TABLE vehicle
    ADD COLUMN is_printed  BOOLEAN   NOT NULL DEFAULT FALSE,
    ADD COLUMN print_date  TIMESTAMP,
    ADD COLUMN print_by    BIGINT;

ALTER TABLE vehicle
    ADD CONSTRAINT fk_vehicle_print_by FOREIGN KEY (print_by) REFERENCES users(id) ON DELETE SET NULL;

-- =====================================================
-- Vehicle Print History Sequence
-- =====================================================
CREATE SEQUENCE vehicle_print_history_seq START WITH 1 INCREMENT BY 1;

-- =====================================================
-- Vehicle Print History Table
-- =====================================================
CREATE TABLE vehicle_print_history (
    id         BIGINT    PRIMARY KEY DEFAULT nextval('vehicle_print_history_seq'),
    epc        VARCHAR(100) NOT NULL,
    vehicle_id BIGINT,
    print_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    print_by   BIGINT,

    CONSTRAINT fk_vph_vehicle  FOREIGN KEY (vehicle_id) REFERENCES vehicle(id) ON DELETE SET NULL,
    CONSTRAINT fk_vph_print_by FOREIGN KEY (print_by)   REFERENCES users(id)   ON DELETE SET NULL
);

-- =====================================================
-- Indexes for Performance
-- =====================================================
CREATE INDEX idx_vph_vehicle_id  ON vehicle_print_history(vehicle_id);
CREATE INDEX idx_vph_epc         ON vehicle_print_history(epc);
CREATE INDEX idx_vph_print_date  ON vehicle_print_history(print_date);

