# RevNova

A web-based application with TypeScript/Node.js backend and HTML/CSS frontend.
# RevNova Migration Tool
![CI Pipeline](https://github.com/naimishkathrani-web/RevNova/actions/workflows/ci.yml/badge.svg)
![Coverage](https://codecov.io/gh/naimishkathrani-web/RevNova/branch/main/graph/badge.svg)

## Local Development

Start all services:
```
docker-compose up -d
```

Access:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000
- PostgreSQL: localhost:5432

## Database Migrations

This project uses **node-pg-migrate** for database schema management.

### Run Migrations (Local)
Make sure PostgreSQL is running via Docker:

    docker-compose up -d

Then run migrations:

    cd backend
    npm run migrate

### Run Migrations (Inside Docker Backend Container)
Recommended when using the full stack via docker-compose:

    docker-compose exec backend npm run migrate

This executes all pending migration files located in:
    
    backend/src/database/migrations/

---

## Database Seeding

Seed scripts populate initial sample data (projects, connections, etc).

### Run Seed (Local - Compiled JS)
First build the backend:

    cd backend
    npm run build
    npm run seed

### Run Seed (Local - TypeScript)
Requires dev dependencies:

    cd backend
    npm run seed:ts

### Run Seed (Inside Backend Container)

    docker-compose exec backend node dist/scripts/seed.js

---

## Useful Commands

Start all containers:

    docker-compose up -d

Check DB tables:

    docker exec -it revnovarepository-postgres-1 psql -U revnova -d revnova_dev -c "\dt"

Check backend logs:

    docker-compose logs backend --tail=100
