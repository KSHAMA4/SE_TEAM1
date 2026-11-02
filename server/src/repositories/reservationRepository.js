const db = require('../config/db');

class ReservationRepository {
  // Find reservations for a piece of equipment in a date window
  async findByEquipmentAndWindow(equipmentId, windowStart, windowEnd) {
    const sql = `
      SELECT reservation_id, equipment_id, student_id, start_time, end_time, status, token
      FROM reservations
      WHERE equipment_id = $1
        AND status = 'CONFIRMED'
        AND start_time < $3
        AND end_time > $2
      ORDER BY start_time ASC
    `;
    const result = await db.query(sql, [equipmentId, windowStart, windowEnd]);
    return result.rows;
  }

  // Find all reservations belonging to a student (FR-008, TC-018)
  async findByStudentId(studentId, status) {
    let sql = `
      SELECT 
        r.reservation_id,
        r.equipment_id,
        e.name AS equipment_name,
        e.model_number,
        l.name AS lab_name,
        r.student_id,
        r.start_time,
        r.end_time,
        r.status,
        r.token,
        r.is_late,
        r.created_at
      FROM reservations r
      JOIN equipment e ON r.equipment_id = e.equipment_id
      JOIN laboratories l ON e.lab_id = l.lab_id
      WHERE r.student_id = $1
    `;
    const params = [studentId];

    if (status) {
      params.push(status.toUpperCase());
      sql += ` AND r.status = $${params.length}`;
    }

    sql += ' ORDER BY r.start_time DESC';

    const result = await db.query(sql, params);
    return result.rows;
  }

  // Check for slot overlaps (Advisory check before insert)
  async findOverlapping(clientOrDb, equipmentId, startTime, endTime) {
    const sql = `
      SELECT reservation_id, start_time, end_time, status
      FROM reservations
      WHERE equipment_id = $1
        AND status = 'CONFIRMED'
        AND tstzrange(start_time, end_time) && tstzrange($2, $3)
    `;
    const executor = clientOrDb || db;
    const result = await executor.query(sql, [equipmentId, startTime, endTime]);
    return result.rows;
  }

  // Create confirmed reservation within an active transaction client
  async createReservation(client, { equipmentId, studentId, startTime, endTime }) {
    const sql = `
      INSERT INTO reservations (equipment_id, student_id, start_time, end_time, status)
      VALUES ($1, $2, $3, $4, 'CONFIRMED')
      RETURNING reservation_id, equipment_id, student_id, start_time, end_time, status, token, created_at
    `;
    const result = await client.query(sql, [equipmentId, studentId, startTime, endTime]);
    return result.rows[0];
  }
}

module.exports = new ReservationRepository();
