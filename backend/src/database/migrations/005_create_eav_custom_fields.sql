-- EAV: Custom field definitions
CREATE TABLE IF NOT EXISTS eav_custom_fields (
    id SERIAL PRIMARY KEY,
    migration_id VARCHAR(50) NOT NULL,
    object_name VARCHAR(100) NOT NULL,
    field_name VARCHAR(100) NOT NULL,
    field_label VARCHAR(255),
    field_type VARCHAR(50),
    is_required BOOLEAN DEFAULT false,
    default_value TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(migration_id, object_name, field_name)
);

-- Indexes for performance
CREATE INDEX idx_eav_fields_migration ON eav_custom_fields(migration_id);
CREATE INDEX idx_eav_fields_object ON eav_custom_fields(object_name);
