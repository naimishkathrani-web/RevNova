CREATE TABLE field_mappings (
  id SERIAL PRIMARY KEY,
  project_id INTEGER REFERENCES projects(id),
  source_object VARCHAR(255),
  source_field VARCHAR(255),
  target_object VARCHAR(255),
  target_field VARCHAR(255),
  mapping_type VARCHAR(50), -- 'direct', 'valuemap', 'formula', 'concat', 'lookup'
  transform_logic JSONB, -- Stores transformation rules
  confidence_score DECIMAL(3,2), -- AI confidence 0.0-1.0
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_mappings_project ON field_mappings(project_id);
