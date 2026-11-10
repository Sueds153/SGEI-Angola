import { Pool } from 'pg';

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const users = await pool.query('SELECT id, email, role FROM users');
  console.log('Users:', users.rows);
  const orders = await pool.query('SELECT reference, status, total_cents FROM orders');
  console.log('Orders:', orders.rows);
  const categories = await pool.query('SELECT name FROM categories');
  console.log('Categories:', categories.rows);
  await pool.end();
}

main().catch(console.error);