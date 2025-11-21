-- Add project_type column to projects table
ALTER TABLE projects ADD COLUMN IF NOT EXISTS project_type VARCHAR(50);

-- Set default for existing projects
UPDATE projects SET project_type = 'migrate_master_with_inflight' WHERE project_type IS NULL;

-- Add NOT NULL constraint
ALTER TABLE projects ALTER COLUMN project_type SET NOT NULL;

-- Add project configuration columns
ALTER TABLE projects ADD COLUMN IF NOT EXISTS include_inflight_data BOOLEAN DEFAULT true;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS skip_inflight_import BOOLEAN DEFAULT false;

-- Add phase tracking
ALTER TABLE projects ADD COLUMN IF NOT EXISTS current_phase VARCHAR(50);
ALTER TABLE projects ADD COLUMN IF NOT EXISTS completed_phases TEXT[]; -- Array of completed phase names

-- Add comments for documentation
COMMENT ON COLUMN projects.project_type IS 'Type: migrate_master_data, migrate_master_with_inflight, migrate_inflight_data, design_product_ai';
COMMENT ON COLUMN projects.include_inflight_data IS 'Whether to include in-flight data in migration';
COMMENT ON COLUMN projects.skip_inflight_import IS 'User can skip inflight import and complete master data migration first';
COMMENT ON COLUMN projects.current_phase IS 'Current migration phase: connect, analyze, mapping, transform, validate, execute, test, import_transactions, report';
COMMENT ON COLUMN projects.completed_phases IS 'Array of completed phase names for progress tracking';
