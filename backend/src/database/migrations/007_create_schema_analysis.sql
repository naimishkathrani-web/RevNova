CREATE TABLE IF NOT EXISTS schema_analysis (
  id SERIAL PRIMARY KEY,
  project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  object_name VARCHAR(255) NOT NULL,
  object_label VARCHAR(255),
  is_custom BOOLEAN DEFAULT FALSE,
  fields JSONB,
  analyzed_at TIMESTAMP DEFAULT NOW()
);

