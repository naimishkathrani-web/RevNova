CREATE TABLE IF NOT EXISTS migrations (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    source_system VARCHAR(50) DEFAULT 'SFDC',
    target_system VARCHAR(50) DEFAULT 'CPQB',
    status VARCHAR(50) DEFAULT 'pending',
    created_by VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
