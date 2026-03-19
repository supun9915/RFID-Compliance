-- V5: Alter detection_history table and document_type table

-- =====================================================
-- detection_history
-- =====================================================

-- Remove obsolete columns
ALTER TABLE detection_history
    DROP COLUMN IF EXISTS detected_at,
    DROP COLUMN IF EXISTS updated_at,
    DROP COLUMN IF EXISTS updated_by,
    DROP COLUMN IF EXISTS created_by;

-- Rename violation_details to description
ALTER TABLE detection_history
    RENAME COLUMN violation_details TO description;

-- Add new columns
ALTER TABLE detection_history
    ADD COLUMN IF NOT EXISTS owner_id      BIGINT,
    ADD COLUMN IF NOT EXISTS scancenter_id BIGINT,
    ADD COLUMN IF NOT EXISTS comment       TEXT;

-- Add foreign key constraints for new columns
ALTER TABLE detection_history
    ADD CONSTRAINT fk_detection_owner
        FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE detection_history
    ADD CONSTRAINT fk_detection_scan_center
        FOREIGN KEY (scancenter_id) REFERENCES scan_center(id) ON DELETE SET NULL;

-- Drop the old index on detected_at (no longer exists)
DROP INDEX IF EXISTS idx_detection_timestamp;

-- =====================================================
-- document_type
-- =====================================================

-- Add duration column (number of days a document is valid)
ALTER TABLE document_type
    ADD COLUMN IF NOT EXISTS duration INTEGER;

