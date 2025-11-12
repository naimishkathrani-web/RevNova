-- STG2: Line items table
CREATE TABLE IF NOT EXISTS stg2_line_items (
    id SERIAL PRIMARY KEY,
    migration_id VARCHAR(50) NOT NULL,
    line_item_id VARCHAR(50) NOT NULL UNIQUE,
    quote_id VARCHAR(50) NOT NULL,
    product_id VARCHAR(50),
    quantity INTEGER,
    unit_price DECIMAL(15,2),
    line_total DECIMAL(15,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (quote_id) REFERENCES stg2_quotes(quote_id) ON DELETE CASCADE
);

CREATE INDEX idx_stg2_line_items_quote ON stg2_line_items(quote_id);
CREATE INDEX idx_stg2_line_items_product ON stg2_line_items(product_id);
