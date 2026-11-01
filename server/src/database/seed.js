const bcrypt = require('bcrypt');
const db = require('../config/db');

async function seed() {
  console.log('[SEED] Starting seed process for Smart Lab Portal...');
  const client = await db.getClient();

  try {
    await client.query('BEGIN');

    // 1. Clean existing test data (safe to re-run)
    await client.query('DELETE FROM audit_logs');
    await client.query('DELETE FROM reservations');
    await client.query('DELETE FROM equipment');
    await client.query('DELETE FROM laboratories');
    await client.query('DELETE FROM users');

    // Reset sequences
    await client.query('ALTER SEQUENCE users_user_id_seq RESTART WITH 1');
    await client.query('ALTER SEQUENCE laboratories_lab_id_seq RESTART WITH 1');
    await client.query('ALTER SEQUENCE equipment_equipment_id_seq RESTART WITH 1');
    await client.query('ALTER SEQUENCE reservations_reservation_id_seq RESTART WITH 1');

    // 2. Hash default passwords
    const saltRounds = 10;
    const defaultPasswordHash = await bcrypt.hash('Password123!', saltRounds);

    // 3. Insert Users (student1, student2, tech1) per Test Plan
    console.log('[SEED] Inserting users: student1, student2, tech1...');
    const userInsertQuery = `
      INSERT INTO users (email, password_hash, role, full_name, late_return_count)
      VALUES 
        ('student1@pes.edu', $1, 'STUDENT', 'Student One', 0),
        ('student2@pes.edu', $1, 'STUDENT', 'Student Two', 0),
        ('tech1@pes.edu', $1, 'TECHNICIAN', 'Technician Alpha', 0),
        ('admin@pes.edu', $1, 'ADMIN', 'System Admin', 0)
      RETURNING user_id, email, role;
    `;
    const usersRes = await client.query(userInsertQuery, [defaultPasswordHash]);
    console.log(`[SEED] Created ${usersRes.rowCount} users.`);

    // 4. Insert Laboratories
    console.log('[SEED] Inserting laboratories...');
    const labInsertQuery = `
      INSERT INTO laboratories (name, department, location_building)
      VALUES 
        ('Advanced Physics Lab', 'Physics', 'Science Block Level 3'),
        ('Embedded Systems & IoT Lab', 'Computer Science', 'Tech Park Ground Floor'),
        ('RF & Microwave Engineering Lab', 'Electronics & Comm', 'ECE Block Level 2')
      RETURNING lab_id, name;
    `;
    const labRes = await client.query(labInsertQuery);
    const physicsLabId = labRes.rows[0].lab_id;
    const csLabId = labRes.rows[1].lab_id;
    const eceLabId = labRes.rows[2].lab_id;
    console.log(`[SEED] Created ${labRes.rowCount} laboratories.`);

    // 5. Insert Equipment: E1 (AVAILABLE, valid), E2 (expired calibration for TC-005), plus others
    console.log('[SEED] Inserting equipment items (E1 valid, E2 expired calibration)...');
    
    // Future expiration (valid for next 6 months)
    const validCalibDate = new Date();
    validCalibDate.setMonth(validCalibDate.getMonth() + 6);

    // Past expiration (expired 10 days ago) - triggers TC-005
    const expiredCalibDate = new Date();
    expiredCalibDate.setDate(expiredCalibDate.getDate() - 10);

    const equipmentInsertQuery = `
      INSERT INTO equipment (equipment_id, name, model_number, lab_id, status, calibration_expiration)
      VALUES 
        (1, 'Digital Storage Oscilloscope 100MHz (E1)', 'Tektronix TBS1104', $1, 'AVAILABLE', $2),
        (2, 'Spectrum Analyzer 3GHz (E2 - Expired Calibration)', 'Rigol DSA832E', $3, 'AVAILABLE', $4),
        (3, 'Arbitrary Function Generator 25MHz', 'Agilent 33220A', $1, 'MAINTENANCE', $2),
        (4, 'Semiconductor Parameter Analyzer', 'Keysight B1500A', $3, 'OUT_OF_ORDER', $2),
        (5, 'FPGA Development Workstation UltraScale+', 'Xilinx ZCU102', $2, 'AVAILABLE', $2),
        (6, 'Precision Triple Output DC Power Supply', 'Keithley 2231A', $2, 'AVAILABLE', $2),
        (7, 'Vector Network Analyzer 8.5GHz', 'Rohde & Schwarz ZNB8', $3, 'AVAILABLE', $2),
        (8, 'Thermal Imaging Camera FLIR', 'FLIR E8-XT', $1, 'AVAILABLE', $2)
      RETURNING equipment_id, name, status, calibration_expiration;
    `;

    const equipRes = await client.query(equipmentInsertQuery, [
      physicsLabId,
      validCalibDate.toISOString(),
      eceLabId,
      expiredCalibDate.toISOString(),
    ]);

    // Align sequence with highest ID inserted
    await client.query("SELECT setval('equipment_equipment_id_seq', (SELECT MAX(equipment_id) FROM equipment))");

    console.log(`[SEED] Created ${equipRes.rowCount} equipment items.`);

    await client.query('COMMIT');
    console.log('[SEED] Seed completed successfully!');
    console.log('--- CREDENTIALS FOR TESTING ---');
    console.log('Student 1:    student1@pes.edu / Password123! (Role: STUDENT)');
    console.log('Student 2:    student2@pes.edu / Password123! (Role: STUDENT)');
    console.log('Technician 1: tech1@pes.edu    / Password123! (Role: TECHNICIAN)');
    console.log('Equipment E1 (Valid Calib):    equipment_id = 1');
    console.log('Equipment E2 (Expired Calib):  equipment_id = 2');
    console.log('-------------------------------');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('[SEED ERROR]', err.message);
    process.exit(1);
  } finally {
    client.release();
    await db.pool.end();
  }
}

if (require.main === module) {
  seed();
}

module.exports = seed;
