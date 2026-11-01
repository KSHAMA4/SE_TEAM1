// Issue #2 - Seed initial data
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'smart_lab_db',
});

async function seed() {
  try {
    // Seed labs
    await pool.query(`
      INSERT INTO labs (name, location, capacity)
      VALUES ('Electronics Lab', 'Block A - Room 101', 10),
             ('Chemistry Lab', 'Block B - Room 202', 8)
      ON CONFLICT DO NOTHING;
    `);

    // Seed equipment E1 and E2
    await pool.query(`
      INSERT INTO equipment (lab_id, name, model, status)
      VALUES (1, 'Oscilloscope E1', 'Tektronix TBS1052B', 'available'),
             (1, 'Function Generator E2', 'Rigol DG1022Z', 'available')
      ON CONFLICT DO NOTHING;
    `);

    // Seed admin user
    await pool.query(`
      INSERT INTO users (name, email, password, role)
      VALUES ('Admin User', 'admin@smartlab.com', 'hashed_password', 'admin')
      ON CONFLICT (email) DO NOTHING;
    `);

    console.log('✅ Seed complete');
  } catch (err) {
    console.error('Seed failed:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}
  
seed();