import { Pool } from 'pg';

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const result = await pool.query('SELECT version()');
  console.log('Version:', result.rows);
  
  const tables = await pool.query("SELECT tablename FROM pg_tables WHERE schemaname = 'public'");
  console.log('Tables:', tables.rows);
  
  const users = await pool.query('SELECT * FROM users');
  console.log('Users:', users.rows);
  
  await pool.end();
}

main().catch(console.error);