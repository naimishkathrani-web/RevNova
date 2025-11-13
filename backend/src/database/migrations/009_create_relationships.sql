CREATE TABLE object_relationships (
  id SERIAL PRIMARY KEY,
  project_id INTEGER REFERENCES projects(id),
  source_object VARCHAR(255),
  source_field VARCHAR(255),
  target_object VARCHAR(255),
  relationship_type VARCHAR(50),
  cascade_delete BOOLEAN DEFAULT false,
  discovered_at TIMESTAMP DEFAULT NOW()
);
