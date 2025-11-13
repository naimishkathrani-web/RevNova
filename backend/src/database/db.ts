// backend/src/database/db.ts
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config(); // Load .env environment variables

const { Pool } = pg;

// Connect using DATABASE_URL from your .env
const db = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export default db;
