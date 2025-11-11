import { Pool } from "pg";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function runMigrations() {
  const migrationsDir = path.join(process.cwd(), "src", "database", "migrations");
  const migrationFiles = fs.readdirSync(migrationsDir).sort();

  for (const file of migrationFiles) {
    const filePath = path.join(migrationsDir, file);
    const sql = fs.readFileSync(filePath, "utf-8");
    console.log(`🏗️ Running migration: ${file}`);

    try {
      // Support a DRY_RUN mode for safety: set DRY_RUN=true to skip executing queries
      if (process.env.DRY_RUN && process.env.DRY_RUN.toLowerCase() === "true") {
        console.log(`(dry-run) would execute ${file}`);
        continue;
      }

      await pool.query(sql);
    } catch (err: any) {
      // If the migration already applied (object exists), log and continue.
      // PostgreSQL duplicate object error codes include '42P07' (duplicate_table/duplicate_index)
      if (err && (err.code === '42P07' || /already exists/i.test(err.message || ''))) {
        console.warn(`⚠️ Skipping ${file}: object already exists (${err.code || err.message})`);
        continue;
      }

      // For other errors, rethrow so the process exits non-zero
      throw err;
    }
  }

  console.log("✅ All migrations executed successfully (or skipped already-applied items).");
  await pool.end();
}

runMigrations().catch(err => {
  console.error("❌ Migration failed:", err);
  process.exit(1);
});
