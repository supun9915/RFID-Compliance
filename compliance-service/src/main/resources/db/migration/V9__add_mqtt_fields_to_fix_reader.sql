-- V9__add_mqtt_fields_to_fix_reader.sql
-- Add MQTT configuration columns to fix_reader table

ALTER TABLE fix_reader
    ADD COLUMN IF NOT EXISTS mqtt_broker_url    VARCHAR(255),
    ADD COLUMN IF NOT EXISTS mqtt_client_id     VARCHAR(100),
    ADD COLUMN IF NOT EXISTS mqtt_topic         VARCHAR(255),
    ADD COLUMN IF NOT EXISTS mqtt_command_topic VARCHAR(255),
    ADD COLUMN IF NOT EXISTS mqtt_qos           INTEGER NOT NULL DEFAULT 1,
    ADD COLUMN IF NOT EXISTS mqtt_username      VARCHAR(100),
    ADD COLUMN IF NOT EXISTS mqtt_password      VARCHAR(255);

