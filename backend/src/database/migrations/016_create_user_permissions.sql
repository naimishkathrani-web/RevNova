-- Create user_permissions table
CREATE TABLE IF NOT EXISTS user_permissions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  permission_key VARCHAR(100) NOT NULL,
  granted BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_user_permissions_user_id ON user_permissions(user_id);
CREATE INDEX idx_user_permissions_key ON user_permissions(permission_key);

-- Create unique constraint (one permission per user)
CREATE UNIQUE INDEX idx_user_permission_unique ON user_permissions(user_id, permission_key);

-- Comments
COMMENT ON TABLE user_permissions IS 'Granular permissions for users (feature flags)';
COMMENT ON COLUMN user_permissions.permission_key IS 'Permission keys: create_project, ai_mapping, bulk_operations, export_excel, etc.';

-- Default permissions by role will be applied via application logic
