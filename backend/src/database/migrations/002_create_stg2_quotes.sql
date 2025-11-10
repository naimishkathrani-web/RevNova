-- 002_create_stg2_quotes.sql
CREATE TABLE IF NOT EXISTS stg2_quotes (
    id SERIAL PRIMARY KEY,
    migration_id VARCHAR(50) NOT NULL,
    quote_id VARCHAR(50) NOT NULL UNIQUE,
    quote_number VARCHAR(50),
    account_name VARCHAR(255),
    contact_name VARCHAR(255),
    total_amount DECIMAL(15,2),
    status VARCHAR(50),
    created_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (migration_id) REFERENCES migrations(id) ON DELETE CASCADE
);

CREATE INDEX idx_stg2_quotes_migration ON stg2_quotes(migration_id);
CREATE INDEX idx_stg2_quotes_id ON stg2_quotes(quote_id);
