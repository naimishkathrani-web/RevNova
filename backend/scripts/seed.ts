import 'dotenv/config';
import { Pool } from 'pg';

const db = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function main() {
  try {
    console.log("DATABASE_URL =", process.env.DATABASE_URL);

    console.log("🔄 Clearing existing data...");
    await db.query('TRUNCATE projects, connections, schema_catalog CASCADE');

    console.log("🌱 Seeding project...");
    const project = await db.query(
      `INSERT INTO projects (name, status) 
       VALUES ('CPQ to Revenue Cloud', 'active') 
       RETURNING id`
    );

    const projectId = project.rows[0].id;

    console.log("🔌 Seeding connection...");
    await db.query(
      `INSERT INTO connections (project_id, provider, username, status) 
       VALUES ($1, 'salesforce', 'dev@example.com', 'connected')`,
      [projectId]
    );

    console.log("📚 Seeding schema catalog...");
    await db.query(
      `INSERT INTO schema_catalog 
        (project_id, object_name, field_name, field_label, data_type) 
       VALUES ($1, 'Product2', 'ProductCode', 'Product Code', 'string')`,
      [projectId]
    );

    console.log("✅ Seed data created successfully!");
  } catch (err) {
    console.error("❌ Seed failed:", err);
    process.exitCode = 1;
  } finally {
    await db.end();
  }
}

main();
