-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  role VARCHAR(20) NOT NULL DEFAULT 'trial_user',
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  email_verified BOOLEAN DEFAULT false,
  trial_start_date TIMESTAMP,
  trial_end_date TIMESTAMP,
  last_login_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status ON users(status);

-- Comments
COMMENT ON TABLE users IS 'Platform users with authentication and role-based access control';
COMMENT ON COLUMN users.role IS 'User role: super_admin, admin, premium_user, trial_user, read_only';
COMMENT ON COLUMN users.status IS 'User status: active, inactive, suspended';
COMMENT ON COLUMN users.email_verified IS 'Whether user has verified their email address';
