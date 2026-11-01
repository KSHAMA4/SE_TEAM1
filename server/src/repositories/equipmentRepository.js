const db = require('../config/db');

class EquipmentRepository {
  async findAll({ lab, status, search } = {}) {
    let sql = `
      SELECT 
        e.equipment_id,
        e.name,
        e.model_number,
        e.status,
        e.calibration_expiration,
        l.lab_id,
        l.name AS lab_name,
        l.department,
        l.location_building,
        CASE 
          WHEN e.calibration_expiration >= NOW() THEN 'VALID'
          ELSE 'EXPIRED'
        END AS calibration_status
      FROM equipment e
      JOIN laboratories l ON e.lab_id = l.lab_id
      WHERE 1=1
    `;
    const params = [];

    if (lab) {
      params.push(`%${lab}%`);
      sql += ` AND (l.name ILIKE $${params.length} OR l.department ILIKE $${params.length})`;
    }

    if (status) {
      params.push(status.toUpperCase());
      sql += ` AND e.status = $${params.length}`;
    }

    if (search) {
      params.push(`%${search}%`);
      sql += ` AND (e.name ILIKE $${params.length} OR e.model_number ILIKE $${params.length} OR l.department ILIKE $${params.length})`;
    }

    sql += ' ORDER BY e.equipment_id ASC';

    const result = await db.query(sql, params);
    return result.rows;
  }

  async findById(equipmentId) {
    const sql = `
      SELECT 
        e.equipment_id,
        e.name,
        e.model_number,
        e.status,
        e.calibration_expiration,
        l.lab_id,
        l.name AS lab_name,
        l.department,
        l.location_building,
        CASE 
          WHEN e.calibration_expiration >= NOW() THEN 'VALID'
          ELSE 'EXPIRED'
        END AS calibration_status
      FROM equipment e
      JOIN laboratories l ON e.lab_id = l.lab_id
      WHERE e.equipment_id = $1
    `;
    const result = await db.query(sql, [equipmentId]);
    return result.rows[0] || null;
  }

  // Row lock query per SAD Sequence 4.1 (SELECT FOR UPDATE)
  async findByIdWithLock(client, equipmentId) {
    const sql = `
      SELECT equipment_id, name, status, calibration_expiration
      FROM equipment
      WHERE equipment_id = $1
      FOR UPDATE
    `;
    const result = await client.query(sql, [equipmentId]);
    return result.rows[0] || null;
  }
}

module.exports = new EquipmentRepository();
