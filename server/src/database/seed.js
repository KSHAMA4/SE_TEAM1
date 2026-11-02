
const db = require('../config/db');
const bcrypt = require('bcrypt');

async function seed() {
  let client;

  try {
    client = await db.getClient();
    await client.query('BEGIN');

    console.log('[SEED] Starting Smart Lab seed...');

    // 1. Create laboratories
    const labResult = await client.query(`
      INSERT INTO laboratories (name, department, location_building)
      VALUES
        ('Advanced Physics Lab', 'Physics', 'Science Block Level 3'),
        ('Embedded Systems & IoT Lab', 'Computer Science', 'Tech Park Ground Floor'),
        ('RF & Microwave Engineering Lab', 'Electronics & Comm', 'ECE Block Level 2')
      RETURNING lab_id, department;
    `);

    const physicsLabId = labResult.rows[0].lab_id;
    const csLabId = labResult.rows[1].lab_id;
    const eceLabId = labResult.rows[2].lab_id;

    // 2. Create passwords
    const passwordHash = await bcrypt.hash('Password123!', 10);
    const adminHash = await bcrypt.hash('admin123', 10);

    // 3. Insert users
    const users = [
      ['student1@pes.edu', passwordHash, 'STUDENT', 'Student One'],
      ['student2@pes.edu', passwordHash, 'STUDENT', 'Student Two'],
      ['tech1@pes.edu', passwordHash, 'TECHNICIAN', 'Technician Alpha'],
      ['technician@smartlab.com', passwordHash, 'TECHNICIAN', 'Lab Technician'],
      ['admin@pes.edu', adminHash, 'ADMIN', 'System Admin'],
      ['admin@smartlab.com', adminHash, 'ADMIN', 'Admin User'],
    ];

    for (const user of users) {
      await client.query(`
        INSERT INTO users
          (email, password_hash, role, full_name, late_return_count)
        VALUES ($1, $2, $3, $4, 0)
        ON CONFLICT (email)
        DO UPDATE SET
          password_hash = EXCLUDED.password_hash,
          role = EXCLUDED.role,
          full_name = EXCLUDED.full_name;
      `, user);
    }

    // 4. Calibration dates
    const validDate = new Date();
    validDate.setMonth(validDate.getMonth() + 6);

    const expiredDate = new Date();
    expiredDate.setDate(expiredDate.getDate() - 10);

    // 5. Equipment fixtures
    const equipment = [
      [1, 'Digital Storage Oscilloscope 100MHz (E1)', 'Tektronix TBS1104', physicsLabId, 'AVAILABLE', validDate],
      [2, 'Spectrum Analyzer 3GHz (E2 - Expired Calibration)', 'Rigol DSA832E', eceLabId, 'AVAILABLE', expiredDate],
      [3, 'Arbitrary Function Generator 25MHz', 'Agilent 33220A', physicsLabId, 'MAINTENANCE', validDate],
      [4, 'Semiconductor Parameter Analyzer', 'Keysight B1500A', eceLabId, 'OUT_OF_ORDER', validDate],
      [5, 'FPGA Development Workstation UltraScale+', 'Xilinx ZCU102', csLabId, 'AVAILABLE', validDate],
      [6, 'Precision Triple Output DC Power Supply', 'Keithley 2231A', csLabId, 'AVAILABLE', validDate],
      [7, 'Vector Network Analyzer 8.5GHz', 'Rohde & Schwarz ZNB8', eceLabId, 'AVAILABLE', validDate],
      [8, 'Thermal Imaging Camera FLIR', 'FLIR E8-XT', physicsLabId, 'AVAILABLE', validDate],
    ];

    for (const item of equipment) {
      await client.query(`
        INSERT INTO equipment
          (equipment_id, name, model_number, lab_id, status, calibration_expiration)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (equipment_id)
        DO UPDATE SET
          name = EXCLUDED.name,
          model_number = EXCLUDED.model_number,
          lab_id = EXCLUDED.lab_id,
          status = EXCLUDED.status,
          calibration_expiration = EXCLUDED.calibration_expiration;
      `, item);
    }

    // 6. Synchronize equipment sequence
    await client.query(`
      SELECT setval(
        'equipment_equipment_id_seq',
        (SELECT MAX(equipment_id) FROM equipment)
      );
    `);

    await client.query('COMMIT');

    console.log('[SEED] Seed completed successfully!');
    console.log('Student: student1@pes.edu / Password123!');
    console.log('Student: student2@pes.edu / Password123!');
    console.log('Technician: tech1@pes.edu / Password123!');
    console.log('Admin: admin@pes.edu / admin123');

  } catch (err) {
    if (client) {
      await client.query('ROLLBACK');
    }

    console.error('[SEED ERROR]', err.message);
    process.exitCode = 1;

  } finally {
    if (client) {
      client.release();
    }

    await db.pool.end();
  }
}

if (require.main === module) {
  seed();
}

module.exports = seed;
