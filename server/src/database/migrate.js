const fs = require('fs');
const path = require('path');
const db = require('../config/db');

async function migrate() {
  console.log('[MIGRATION] Applying database schema from schema.sql...');
  const schemaPath = path.join(__dirname, 'schema.sql');
  const schemaSql = fs.readFileSync(schemaPath, 'utf8');

  const client = await db.getClient();
  try {
    await client.query('BEGIN');
    await client.query(schemaSql);
    await client.query('COMMIT');
    console.log('[MIGRATION] Database schema migrated successfully.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('[MIGRATION ERROR]', err.message);
    process.exit(1);
  } finally {
    client.release();
    await db.pool.end();
  }
}

if (require.main === module) {
  migrate();
}

module.exports = migrate;
