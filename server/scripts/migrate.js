
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
  const migrationPath = path.join(
    __dirname,
    '../migrations/001_initial_schema.sql'
  );

  try {
    const sql = fs.readFileSync(migrationPath, 'utf8');

    if (!sql.trim()) {
      throw new Error('Migration file is empty.');
    }

    await pool.query('BEGIN');
    await pool.query(sql);
    await pool.query('COMMIT');

    console.log('✅ Migration complete');
  } catch (err) {
    try {
      await pool.query('ROLLBACK');
    } catch (_) {
      // Ignore rollback errors
    }

    console.error('❌ Migration failed:', err.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

migrate();
