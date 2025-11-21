-- Create table for mapping conflicts and resolutions
CREATE TABLE IF NOT EXISTS mapping_conflicts (
  id SERIAL PRIMARY KEY,
  project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  field_mapping_id INTEGER, -- Optional reference, will be added when field_mappings table exists
  
  -- Conflict details
  conflict_type VARCHAR(50) NOT NULL, -- 'create_new_field', 'create_new_object', 'data_type_mismatch', 'required_field_missing', 'duplicate_mapping'
  severity VARCHAR(20) DEFAULT 'warning', -- 'info', 'warning', 'error', 'blocker'
  
  -- Source information
  source_object VARCHAR(255),
  source_field VARCHAR(255),
  source_data_type VARCHAR(50),
  
  -- Target information
  target_object VARCHAR(255),
  target_field VARCHAR(255),
  target_data_type VARCHAR(50),
  
  -- Resolution
  resolution_status VARCHAR(20) DEFAULT 'unresolved', -- 'unresolved', 'user_resolved', 'auto_resolved', 'ignored'
  resolution_action VARCHAR(50), -- 'create_custom_field', 'map_to_existing', 'skip_field', 'transform_data'
  resolution_details JSONB, -- Additional details about the resolution
  resolved_by VARCHAR(255), -- User ID or 'system'
  resolved_at TIMESTAMP,
  
  -- RCA configuration reference
  rca_config_id INTEGER REFERENCES rca_custom_configurations(id),
  
  -- Description and notes
  conflict_description TEXT,
  user_notes TEXT,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_mapping_conflicts_project ON mapping_conflicts(project_id);
CREATE INDEX idx_mapping_conflicts_status ON mapping_conflicts(resolution_status);
CREATE INDEX idx_mapping_conflicts_severity ON mapping_conflicts(severity);
CREATE INDEX idx_mapping_conflicts_type ON mapping_conflicts(conflict_type);

-- Comments
COMMENT ON TABLE mapping_conflicts IS 'Tracks mapping conflicts that need user resolution';
COMMENT ON COLUMN mapping_conflicts.conflict_type IS 'Type of conflict requiring resolution';
COMMENT ON COLUMN mapping_conflicts.resolution_action IS 'Action taken to resolve: create_custom_field, map_to_existing, skip_field, transform_data';
