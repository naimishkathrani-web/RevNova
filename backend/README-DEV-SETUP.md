# RevNova Backend - Development Environment

This backend will be hosted on the development server at **dev.revnova.in**

## Quick Start

### 1. Prerequisites

- **Node.js 18+** - [Download](https://nodejs.org/)
- **PostgreSQL 14+** - [Download](https://www.postgresql.org/download/)
- **Redis** (optional but recommended) - [Download](https://redis.io/download/)

### 2. Installation

```powershell
# Run automated setup
cd backend
.\setup-dev-environment.ps1
```

OR manually:

```powershell
# Install dependencies
npm install

# Create database
psql -U postgres
CREATE DATABASE revnova_dev;
\q

# Run migrations
npm run migrate:ts

# Start development server
npm run dev
```

## Configuration

### Environment Variables (.env)

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=revnova_dev
DB_USER=postgres
DB_PASSWORD=your_password

# Server
PORT=3000
NODE_ENV=development
API_BASE_URL=http://localhost:3000

# Redis (for caching)
REDIS_HOST=localhost
REDIS_PORT=6379

# Salesforce OAuth
SALESFORCE_CLIENT_ID=your_connected_app_id
SALESFORCE_CLIENT_SECRET=your_connected_app_secret
SALESFORCE_REDIRECT_URI=http://localhost:3000/api/v1/auth/callback

# OpenAI (for AI field mapping)
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4

# Security
JWT_SECRET=change_this_in_production

# CORS
CORS_ORIGIN=http://localhost:5173,https://naimishkathrani-web.github.io
```

## Available Scripts

```powershell
npm run dev          # Start development server with hot reload
npm run build        # Build TypeScript to JavaScript
npm start            # Start production server
npm run test         # Run tests
npm run test:watch   # Run tests in watch mode
npm run migrate:ts   # Run database migrations
npm run seed         # Seed database with sample data
```

## Database

### Tables Created by Migrations

1. **projects** - Migration projects
2. **connections** - Salesforce org connections
3. **field_mappings** - Field mapping configurations
4. **migration_jobs** - Migration execution jobs
5. **job_logs** - Job execution logs

### Running Migrations

```powershell
# Run all pending migrations
npm run migrate:ts

# Create new migration
npm run migrate:create -- <migration-name>
```

## API Endpoints

### Health Check
```
GET /api/v1/health
```

### Projects
```
GET    /api/v1/projects
POST   /api/v1/projects
GET    /api/v1/projects/:id
PUT    /api/v1/projects/:id
DELETE /api/v1/projects/:id
```

### Connections
```
POST   /api/v1/connections/test
GET    /api/v1/projects/:projectId/connections
POST   /api/v1/projects/:projectId/connections
PUT    /api/v1/connections/:id
DELETE /api/v1/connections/:id
```

### Field Mappings
```
GET    /api/v1/projects/:projectId/field-mappings
POST   /api/v1/projects/:projectId/field-mappings
POST   /api/v1/projects/:projectId/field-mappings/auto-suggest
PUT    /api/v1/field-mappings/:id
DELETE /api/v1/field-mappings/:id
```

### Schema Analysis
```
POST   /api/v1/projects/:id/analyze
```

## Production Deployment

### Option 1: PM2 (Recommended)

```powershell
# Automated deployment
.\deploy-production.ps1
```

OR manually:

```powershell
# Install PM2 globally
npm install -g pm2

# Build and start
npm run build
pm2 start dist/index.js --name revnova-backend

# View logs
pm2 logs revnova-backend

# Monitor
pm2 monit

# Restart
pm2 restart revnova-backend

# Setup auto-restart on reboot
pm2 startup
pm2 save
```

### Option 2: Docker

```powershell
# Build image
docker build -t revnova-backend .

# Run container
docker run -d -p 3000:3000 --env-file .env revnova-backend
```

## Nginx Configuration

### 1. Install Nginx (Windows)

Download from: http://nginx.org/en/download.html

### 2. Configure Reverse Proxy

Copy `nginx-config.conf` to nginx configuration directory.

For Linux:
```bash
sudo cp nginx-config.conf /etc/nginx/sites-available/revnova-backend
sudo ln -s /etc/nginx/sites-available/revnova-backend /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 3. SSL Certificate (Let's Encrypt)

```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d dev.revnova.in

# Auto-renewal is configured automatically
```

## DNS Configuration

Point **dev.revnova.in** to your development server:

1. Go to your domain registrar (e.g., GoDaddy, Namecheap)
2. Add A record:
   - Host: `dev`
   - Points to: Your server IP
   - TTL: 600 (or default)

## Testing

```powershell
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Watch mode
npm run test:watch
```

## API Testing

### Using PowerShell

```powershell
# Health check
Invoke-RestMethod -Uri "http://localhost:3000/api/v1/health"

# Get projects
Invoke-RestMethod -Uri "http://localhost:3000/api/v1/projects"

# Create project
$body = @{
    name = "Test Migration"
    sourceOrg = "Production"
    targetOrg = "Sandbox"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/v1/projects" `
    -Method POST `
    -ContentType "application/json" `
    -Body $body
```

### Using Postman

Import the API collection (coming soon)

## Monitoring

### PM2 Monitoring

```powershell
pm2 monit              # Real-time monitoring
pm2 list               # List all processes
pm2 logs revnova-backend  # View logs
```

### Health Checks

```powershell
# Check if server is running
Invoke-RestMethod -Uri "http://localhost:3000/api/v1/health"
```

## Troubleshooting

### Database Connection Issues

```powershell
# Test PostgreSQL connection
psql -U postgres -d revnova_dev -c "SELECT version();"

# Check if database exists
psql -U postgres -c "\l" | Select-String "revnova_dev"
```

### Port Already in Use

```powershell
# Find process using port 3000
netstat -ano | findstr :3000

# Kill process
taskkill /PID <process_id> /F
```

### Migration Issues

```powershell
# Check migration status
npm run migrate:ts -- list

# Rollback last migration
npm run migrate:ts -- down

# Reset database (WARNING: deletes all data)
psql -U postgres -c "DROP DATABASE revnova_dev;"
psql -U postgres -c "CREATE DATABASE revnova_dev;"
npm run migrate:ts
```

## Development Workflow

1. **Start backend**: `npm run dev`
2. **Start frontend**: `cd ../frontend && npm run dev`
3. **Make changes**: Edit TypeScript files
4. **Hot reload**: Server automatically restarts
5. **Test**: `npm test`
6. **Commit**: Git commit and push

## Architecture

```
backend/
├── src/
│   ├── config/           # Configuration files
│   ├── controllers/      # Route controllers
│   ├── database/         # Database connection & migrations
│   ├── middleware/       # Express middleware
│   ├── models/           # Data models
│   ├── routes/           # API routes
│   ├── services/         # Business logic
│   ├── utils/            # Utility functions
│   └── index.ts          # Application entry point
├── __tests__/            # Test files
├── scripts/              # Utility scripts
├── .env                  # Environment variables
└── package.json          # Dependencies
```

## Security Checklist

- [ ] Change default JWT_SECRET in .env
- [ ] Use strong database password
- [ ] Enable SSL/HTTPS in production
- [ ] Configure CORS properly
- [ ] Use environment variables for secrets
- [ ] Enable rate limiting (TODO)
- [ ] Regular security updates

## Support

For issues or questions:
- Check logs: `pm2 logs revnova-backend`
- Review error messages
- Check database connection
- Verify environment variables

## Next Steps

1. ✅ Setup database and run migrations
2. ✅ Configure environment variables
3. ✅ Start development server
4. ⏳ Configure Salesforce OAuth
5. ⏳ Add OpenAI API key
6. ⏳ Setup domain (dev.revnova.in)
7. ⏳ Configure SSL certificate
8. ⏳ Deploy with PM2

---

**Development Server**: http://localhost:3000  
**Production URL**: https://dev.revnova.in  
**API Documentation**: Coming soon
