# Backend Setup - IMPORTANT

## ⚠️ Database Password Required

The backend setup requires PostgreSQL credentials. Your PostgreSQL 18 is installed and running, but we need the correct password.

## Quick Setup Steps

### 1. Find Your PostgreSQL Password

The password was set when PostgreSQL was installed. Common defaults:
- **postgres** (most common)
- **admin**
- **root**
- Or a custom password you set

### 2. Update .env File

Edit `backend/.env` and set the correct password:

```env
DB_PASSWORD=your_actual_postgres_password_here
```

### 3. Test Connection & Create Database

Run this script to test and create the database:

```powershell
cd backend
node --loader ts-node/esm src/database/createDatabase.ts
```

Expected output:
```
✅ Connected to PostgreSQL
✅ Database revnova_dev created (or already exists)
```

### 4. Run Migrations

Once connected successfully:

```powershell
npm run migrate:ts
```

Expected output:
```
🏗️ Running migration: 000_create_migrations.sql
✅ Migration completed: 000_create_migrations.sql
[... 4 more migrations ...]
✅ All migrations completed successfully
```

### 5. Start Development Server

```powershell
npm run dev
```

Expected output:
```
🚀 Server running on http://localhost:3000
📊 Database connected: revnova_dev
```

### 6. Test API

Open a new terminal:

```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/v1/health"
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "database": "connected",
  "redis": "not_configured"
}
```

## Troubleshooting

### Can't Remember PostgreSQL Password?

Reset it:

1. Find PostgreSQL data directory (usually `C:\Program Files\PostgreSQL\18\data`)
2. Edit `pg_hba.conf`
3. Change method from `scram-sha-256` to `trust` temporarily:
   ```
   # IPv4 local connections:
   host    all             all             127.0.0.1/32            trust
   ```
4. Restart PostgreSQL service:
   ```powershell
   Restart-Service postgresql-x64-18
   ```
5. Connect without password:
   ```powershell
   psql -U postgres
   ```
6. Set new password:
   ```sql
   ALTER USER postgres PASSWORD 'newpassword';
   ```
7. Change `pg_hba.conf` back to `scram-sha-256`
8. Restart service again

### Database Already Exists Error

If you get "database already exists", skip creation and run migrations directly:

```powershell
npm run migrate:ts
```

### Migration Errors

If migrations fail:

1. Check database connection in `.env`
2. Verify PostgreSQL is running:
   ```powershell
   Get-Service postgresql-x64-18
   ```
3. Drop and recreate database:
   ```powershell
   psql -U postgres -c "DROP DATABASE IF EXISTS revnova_dev;"
   psql -U postgres -c "CREATE DATABASE revnova_dev;"
   npm run migrate:ts
   ```

## Next Steps After Setup

Once the backend is running:

1. **Configure API Keys** (optional for now):
   - OpenAI API key for AI mapping suggestions
   - Salesforce OAuth credentials for connections

2. **Test API Endpoints**:
   ```powershell
   # Health check
   Invoke-RestMethod -Uri "http://localhost:3000/api/v1/health"
   
   # Get projects (should be empty array)
   Invoke-RestMethod -Uri "http://localhost:3000/api/v1/projects"
   
   # Create a test project
   $body = @{
     name = "Test Migration"
     description = "Test project"
     sourceOrg = "Source Org"
     targetOrg = "Target Org"
   } | ConvertTo-Json
   
   Invoke-RestMethod -Uri "http://localhost:3000/api/v1/projects" -Method Post -Body $body -ContentType "application/json"
   ```

3. **Setup DNS for dev.revnova.in** (see main README-DEV-SETUP.md)

4. **Configure Nginx** (see nginx-config.conf)

5. **Deploy with PM2** (run deploy-production.ps1)

## Current Status

✅ Node.js 24.11.1 installed
✅ npm 11.6.2 installed
✅ PostgreSQL 18 service running
⚠️ PostgreSQL password needs configuration in .env
⏳ Database creation pending
⏳ Migrations pending
⏳ Server start pending

**ACTION REQUIRED:** Update `DB_PASSWORD` in `backend/.env` with your PostgreSQL password, then run the setup steps above.
