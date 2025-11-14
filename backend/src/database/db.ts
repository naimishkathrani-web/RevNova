// backend/src/database/db.ts
import pg from "pg";

const { Pool } = pg;

/**
 * IMPORTANT:
 * We do NOT load dotenv here.
 * dotenv is loaded only once in index.ts BEFORE importing db.ts.
 * This avoids duplicate env injection & prevents Jest warnings.
 */

const db = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export default db;
