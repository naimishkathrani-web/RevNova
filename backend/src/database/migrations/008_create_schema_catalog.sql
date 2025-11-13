CREATE TABLE schema_catalog (
  id SERIAL PRIMARY KEY,
  project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,

  object_name VARCHAR(255) NOT NULL,
  field_name VARCHAR(255) NOT NULL,
  field_label VARCHAR(255),
  data_type VARCHAR(50),
  is_custom BOOLEAN DEFAULT false,
  is_required BOOLEAN DEFAULT false,
  picklist_values JSONB DEFAULT '[]'::jsonb,

  indexed_at TIMESTAMP DEFAULT NOW()
);

-- For fast search
CREATE INDEX idx_catalog_search 
  ON schema_catalog(project_id, field_name, field_label);
