import { Pool } from 'pg';

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  
  await pool.query(`UPDATE pricing_configs SET value = 'ImportEasy - Sua ponte para o mundo' WHERE key = 'platformName'`);
  await pool.query(`UPDATE pricing_configs SET value = '+244922058136' WHERE key = 'supportWhatsapp'`);
  await pool.query(`UPDATE pricing_configs SET value = '+244 922 058 136' WHERE key = 'supportPhone'`);
  
  const result = await pool.query("SELECT key, value FROM pricing_configs WHERE key IN ('platformName', 'supportWhatsapp', 'supportPhone')");
  console.log('Configs atualizadas:', result.rows);
  
  await pool.end();
}

main().catch(console.error);