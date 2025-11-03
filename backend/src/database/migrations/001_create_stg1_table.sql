-- STG1: Raw data staging table
CREATE TABLE IF NOT EXISTS stg1_raw_data (
    id SERIAL PRIMARY KEY,
    migration_id VARCHAR(50) NOT NULL,
    source_system VARCHAR(50) NOT NULL DEFAULT 'SFDC',
    object_name VARCHAR(100) NOT NULL,
    record_id VARCHAR(50) NOT NULL,
    raw_data JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for faster queries
CREATE INDEX idx_stg1_migration ON stg1_raw_data(migration_id);
CREATE INDEX idx_stg1_object ON stg1_raw_data(object_name);
CREATE INDEX idx_stg1_record ON stg1_raw_data(record_id);
