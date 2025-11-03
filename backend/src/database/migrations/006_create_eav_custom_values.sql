-- EAV: Custom field values
CREATE TABLE IF NOT EXISTS eav_custom_values (
    id SERIAL PRIMARY KEY,
    migration_id VARCHAR(50) NOT NULL,
    object_name VARCHAR(100) NOT NULL,
    record_id VARCHAR(50) NOT NULL,
    field_id INTEGER NOT NULL,
    value_text TEXT,
    value_number DECIMAL(18,6),
    value_date DATE,
    value_boolean BOOLEAN,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (field_id) REFERENCES eav_custom_fields(id) ON DELETE CASCADE
);

-- Indexes for faster lookups
CREATE INDEX idx_eav_values_migration ON eav_custom_values(migration_id);
CREATE INDEX idx_eav_values_record ON eav_custom_values(record_id);
CREATE INDEX idx_eav_values_field ON eav_custom_values(field_id);
