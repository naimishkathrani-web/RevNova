import { config } from 'dotenv';
import pg from 'pg';
import bcrypt from 'bcrypt';

config();

const SUPER_ADMIN_PASSWORD = 'RevNova#1324';
const SALT_ROUNDS = 12;

const superAdmins = [
  { email: 'naimish@rootshellinc.com', first_name: 'Naimish', last_name: 'Kathrani' },
  { email: 'ashishs.b@rootshellinc.com', first_name: 'Ashish', last_name: 'S' },
  { email: 'saikumar.u@rootshellinc.com', first_name: 'Saikumar', last_name: 'U' },
  { email: 'vinay.g@rootshellinc.com', first_name: 'Vinay', last_name: 'G' },
  { email: 'yamineesh.k@rootshellinc.com', first_name: 'Yamineesh', last_name: 'K' }
];

async function seedSuperAdmins() {
  const client = new pg.Client({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  try {
    await client.connect();
    console.log('✅ Connected to database');

    // Hash password
    console.log('🔐 Hashing password...');
    const passwordHash = await bcrypt.hash(SUPER_ADMIN_PASSWORD, SALT_ROUNDS);

    // Insert/update super admin accounts
    for (const admin of superAdmins) {
      const result = await client.query(`
        INSERT INTO users (email, password_hash, first_name, last_name, role, status, email_verified)
        VALUES ($1, $2, $3, $4, 'super_admin', 'active', true)
        ON CONFLICT (email) 
        DO UPDATE SET 
          password_hash = EXCLUDED.password_hash,
          role = 'super_admin',
          status = 'active',
          email_verified = true,
          updated_at = NOW()
        RETURNING id, email
      `, [admin.email, passwordHash, admin.first_name, admin.last_name]);

      console.log(`✅ Super admin created/updated: ${result.rows[0].email} (ID: ${result.rows[0].id})`);
    }

    console.log('\n✅ All super admin accounts seeded successfully!');
    console.log('\nCredentials:');
    console.log('  Email: [any of the 5 emails above]');
    console.log(`  Password: ${SUPER_ADMIN_PASSWORD}`);
    console.log('  Role: super_admin');

    await client.end();

  } catch (error: any) {
    console.error('❌ Error seeding super admins:', error.message);
    process.exit(1);
  }
}

seedSuperAdmins();
