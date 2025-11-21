import { config } from 'dotenv';
import pg from 'pg';

config();

const testConnection = async () => {
  const client = new pg.Client({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: 'postgres', // Connect to default database first
  });

  try {
    console.log('Attempting connection with:');
    console.log(`  Host: ${process.env.DB_HOST}`);
    console.log(`  Port: ${process.env.DB_PORT}`);
    console.log(`  User: ${process.env.DB_USER}`);
    console.log(`  Password: ${process.env.DB_PASSWORD ? '***' : '(empty)'}`);
    
    await client.connect();
    console.log('✅ Connected to PostgreSQL');
    
    // Check if database exists
    const result = await client.query(
      "SELECT 1 FROM pg_database WHERE datname='revnova_dev'"
    );
    
    if (result.rows.length === 0) {
      console.log('Creating revnova_dev database...');
      await client.query('CREATE DATABASE revnova_dev');
      console.log('✅ Database created');
    } else {
      console.log('✅ Database revnova_dev already exists');
    }
    
    await client.end();
  } catch (error) {
    console.error('❌ Database connection failed:');
    console.error('Error:', error);
    process.exit(1);
  }
};

testConnection();
