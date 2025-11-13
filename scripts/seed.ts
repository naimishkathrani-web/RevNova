import { Pool } from 'pg';

const db = new Pool({ connectionString: process.env.DATABASE_URL });

await db.query(`INSERT INTO projects (name, status) VALUES ('Demo Project', 'active')`);
await db.query(`INSERT INTO connections (project_id, provider, username) VALUES (1, 'salesforce', 'test@example.com')`);

console.log('Seed data created');