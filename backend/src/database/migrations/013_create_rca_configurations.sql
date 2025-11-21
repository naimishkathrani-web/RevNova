-- Create table to track custom RCA configurations that need to be created
CREATE TABLE IF NOT EXISTS rca_custom_configurations (
  id SERIAL PRIMARY KEY,
  project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  
  -- Object/Field identification
  config_type VARCHAR(20) NOT NULL, -- 'custom_object', 'custom_field'
  source_object_name VARCHAR(255), -- CPQ source object (e.g., 'Custom_Product_Attribute__c')
  source_field_name VARCHAR(255), -- CPQ source field (e.g., 'Warranty_Period__c')
  
  -- RCA configuration details
  rca_object_name VARCHAR(255) NOT NULL, -- Target RCA object name
  rca_field_name VARCHAR(255), -- Target RCA field name (if custom_field)
  rca_field_type VARCHAR(50), -- Field type: Text, Number, Picklist, Date, etc.
  rca_field_length INTEGER, -- Field length for Text fields
  rca_field_required BOOLEAN DEFAULT false,
  rca_picklist_values TEXT[], -- Array of picklist values if applicable
  
  -- Configuration API details
  config_api_endpoint VARCHAR(255), -- RCA API endpoint to use (Metadata API, Tooling API, etc.)
  config_payload JSONB, -- Full API payload for creating the object/field
  
  -- Execution tracking
  status VARCHAR(20) DEFAULT 'pending', -- pending, in_progress, completed, failed
  created_in_rca BOOLEAN DEFAULT false,
  rca_api_id VARCHAR(255), -- RCA API ID after creation
  error_message TEXT,
  
  -- Staging 2 metadata
  stg2_table_name VARCHAR(255), -- Staging 2 table this config relates to
  stg2_column_name VARCHAR(255), -- Staging 2 column this config relates to
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  executed_at TIMESTAMP,
  
  -- Index for quick lookup
  CONSTRAINT unique_rca_config UNIQUE(project_id, rca_object_name, rca_field_name)
);

-- Indexes for performance
CREATE INDEX idx_rca_config_project ON rca_custom_configurations(project_id);
CREATE INDEX idx_rca_config_status ON rca_custom_configurations(status);
CREATE INDEX idx_rca_config_type ON rca_custom_configurations(config_type);

-- Comments
COMMENT ON TABLE rca_custom_configurations IS 'Tracks custom RCA objects/fields that need to be created before data import';
COMMENT ON COLUMN rca_custom_configurations.config_type IS 'Type of configuration: custom_object or custom_field';
COMMENT ON COLUMN rca_custom_configurations.config_api_endpoint IS 'RCA API endpoint: /services/data/vXX.0/tooling/sobjects/CustomObject or CustomField';
COMMENT ON COLUMN rca_custom_configurations.config_payload IS 'Complete JSON payload for RCA Metadata/Tooling API';
