-- alter next_serial_number column type from INTEGER to BIGINT to match entity field type (Long)
ALTER TABLE vehicle ALTER COLUMN next_serial_number TYPE BIGINT;

