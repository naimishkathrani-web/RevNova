-- Add status column to projects table
ALTER TABLE projects ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';

-- Create index on status for faster filtering
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
