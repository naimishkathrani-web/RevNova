-- STG2: Products table
CREATE TABLE IF NOT EXISTS stg2_products (
    id SERIAL PRIMARY KEY,
    migration_id VARCHAR(50) NOT NULL,
    product_id VARCHAR(50) NOT NULL UNIQUE,
    product_code VARCHAR(50),
    product_name VARCHAR(255),
    description TEXT,
    list_price DECIMAL(15,2),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_stg2_products_migration ON stg2_products(migration_id);
CREATE INDEX idx_stg2_products_id ON stg2_products(product_id);
