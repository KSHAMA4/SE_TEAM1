
const { Pool } = require('pg');
const bcrypt = require('bcrypt');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'smart_lab_db'
});

async function seed() {
  try {
    await pool.query(
      "INSERT INTO laboratories (name, department, location_building) VALUES ('Electronics Lab', 'Electronics', 'Block A - Room 101'), ('Computer Lab', 'Computer Science', 'Block B - Room 202') ON CONFLICT DO NOTHING"
    );

    const labResult = await pool.query(
      "SELECT lab_id FROM laboratories ORDER BY lab_id LIMIT 1"
    );

    const labId = labResult.rows[0].lab_id;

    await pool.query(
      "INSERT INTO equipment (name, model_number, lab_id, status, calibration_expiration) VALUES ('Oscilloscope E1', 'Tektronix TBS1052B', $1, 'AVAILABLE', CURRENT_TIMESTAMP + INTERVAL '1 year'), ('Function Generator E2', 'Rigol DG1022Z', $1, 'AVAILABLE', CURRENT_TIMESTAMP + INTERVAL '1 year') ON CONFLICT DO NOTHING",
      [labId]
    );

    const studentPassword = await bcrypt.hash('Password123!', 10);

    await pool.query(
      "INSERT INTO users (email, password_hash, role, full_name) VALUES ('student1@pes.edu', $1, 'STUDENT', 'Student One') ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash, role = EXCLUDED.role, full_name = EXCLUDED.full_name",
      [studentPassword]
    );

    await pool.query(
      "INSERT INTO users (email, password_hash, role, full_name) VALUES ('student2@pes.edu', $1, 'STUDENT', 'Student Two') ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash, role = EXCLUDED.role, full_name = EXCLUDED.full_name",
      [studentPassword]
    );

    const technicianPassword = await bcrypt.hash('Password123!', 10);

    await pool.query(
      "INSERT INTO users (email, password_hash, role, full_name) VALUES ('tech1@pes.edu', $1, 'TECHNICIAN', 'Lab Technician') ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash, role = EXCLUDED.role, full_name = EXCLUDED.full_name",
      [technicianPassword]
    );

    const adminPassword = await bcrypt.hash('admin123', 10);

    await pool.query(
      "INSERT INTO users (email, password_hash, role, full_name) VALUES ('admin@smartlab.com', $1, 'ADMIN', 'Admin User') ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash, role = EXCLUDED.role, full_name = EXCLUDED.full_name",
      [adminPassword]
    );

    console.log('Seed complete');
  } catch (err) {
    console.error('Seed failed:', err);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

seed();
