
// Issue #2 - Run DB migrations
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'smart_lab_db',
});

async function migrate() {
  const sql = fs.readFileSync(
    path.join(__dirname, '../migrations/001_initial_schema.sql'),
    'utf8'
  );

  try {
    await pool.query(sql);
    console.log('✅ Migration complete');
  } catch (err) {
    console.error('Migration failed:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

migrate();
