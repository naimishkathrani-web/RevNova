-- Seed super admin accounts for development team
-- Password: RevNova#1324 (will be hashed in application)

-- Note: Passwords will be hashed using bcrypt in the application
-- This migration creates placeholder entries that will be updated by the seed script

INSERT INTO users (email, password_hash, first_name, last_name, role, status, email_verified)
VALUES 
  ('naimish@rootshellinc.com', 'PLACEHOLDER_WILL_BE_HASHED', 'Naimish', 'Kathrani', 'super_admin', 'active', true),
  ('ashishs.b@rootshellinc.com', 'PLACEHOLDER_WILL_BE_HASHED', 'Ashish', 'S', 'super_admin', 'active', true),
  ('saikumar.u@rootshellinc.com', 'PLACEHOLDER_WILL_BE_HASHED', 'Saikumar', 'U', 'super_admin', 'active', true),
  ('vinay.g@rootshellinc.com', 'PLACEHOLDER_WILL_BE_HASHED', 'Vinay', 'G', 'super_admin', 'active', true),
  ('yamineesh.k@rootshellinc.com', 'PLACEHOLDER_WILL_BE_HASHED', 'Yamineesh', 'K', 'super_admin', 'active', true)
ON CONFLICT (email) DO NOTHING;

-- Grant all permissions to super admins (will be handled by application logic based on role)

COMMENT ON TABLE users IS 'Super admin accounts seeded with development team members';
