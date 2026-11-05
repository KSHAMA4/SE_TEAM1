
const reservationService = require('../services/reservationService');

class ReservationController {
  // Create a reservation
  async create(req, res, next) {
    try {
      const studentId = req.user.userId;
      const { equipment_id, start_time, end_time } = req.body;

      if (!equipment_id || !start_time || !end_time) {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'equipment_id, start_time, and end_time are mandatory fields.',
        });
      }

      const reservation = await reservationService.createReservation(studentId, {
        equipmentId: parseInt(equipment_id, 10),
        startTime: start_time,
        endTime: end_time,
      });

      return res.status(201).json({
        message: 'Equipment slot reserved successfully.',
        reservation: {
          reservationId: reservation.reservation_id,
          equipmentId: reservation.equipment_id,
          studentId: reservation.student_id,
          startTime: reservation.start_time,
          endTime: reservation.end_time,
          status: reservation.status,
          token: reservation.token,
          createdAt: reservation.created_at,
        },
      });
    } catch (err) {
      if (err.statusCode === 409) {
        return res.status(409).json({
          error: 'Conflict',
          message: err.message,
          suggestedAlternatives: err.alternatives || [],
        });
      }
      next(err);
    }
  }

  // Get logged-in student's reservations
  async getMyReservations(req, res, next) {
    try {
      const studentId = req.user.userId;
      const { status } = req.query;

      const list = await reservationService.getStudentReservations(
        studentId,
        status
      );

      return res.status(200).json({
        total: list.length,
        reservations: list,
      });
    } catch (err) {
      next(err);
    }
  }

  // Get equipment availability
  async getAvailability(req, res, next) {
    try {
      const equipmentId = parseInt(req.params.id, 10);
      const { date } = req.query;

      const availability = await reservationService.getSlotAvailability(
        equipmentId,
        date
      );

      return res.status(200).json(availability);
    } catch (err) {
      next(err);
    }
  }

  // Sprint 2 - Issue #15: Student cancellation
  async cancel(req, res, next) {
    try {
      const reservationId = parseInt(req.params.id, 10);
      const studentId = req.user.userId;
      const db = require('../config/db');

      const { rows } = await db.query(
        'SELECT * FROM reservations WHERE reservation_id = $1',
        [reservationId]
      );

      if (rows.length === 0) {
        return res.status(404).json({
          error: 'Not Found',
          message: 'Reservation not found.',
        });
      }

      if (rows[0].student_id !== studentId) {
        return res.status(403).json({
          error: 'Forbidden',
          message: 'You can only cancel your own reservations.',
        });
      }

      if (rows[0].status !== 'CONFIRMED') {
        return res.status(400).json({
          error: 'Bad Request',
          message: `Cannot cancel a reservation with status: ${rows[0].status}`,
        });
      }

      await db.query(
        'UPDATE reservations SET status = $1 WHERE reservation_id = $2',
        ['CANCELLED', reservationId]
      );

      return res.status(200).json({
        message: 'Reservation cancelled successfully.',
      });
    } catch (err) {
      next(err);
    }
  }

  // Sprint 2 - Issue #16: Technician return / late-return workflow
  async returnEquipment(req, res, next) {
    try {
      const reservationId = parseInt(req.params.id, 10);
      const db = require('../database/db');

      const { rows } = await db.query(
        'SELECT * FROM reservations WHERE reservation_id = $1',
        [reservationId]
      );

      if (rows.length === 0) {
        return res.status(404).json({
          error: 'Not Found',
          message: 'Reservation not found.',
        });
      }

      if (rows[0].status !== 'CONFIRMED') {
        return res.status(400).json({
          error: 'Bad Request',
          message: `Cannot return a reservation with status: ${rows[0].status}`,
        });
      }

      const now = new Date();
      const endTime = new Date(rows[0].end_time);
      const isLate = now > endTime;

      const newStatus = isLate ? 'LATE_RETURNED' : 'RETURNED';

      await db.query(
        `UPDATE reservations
         SET status = $1, is_late = $2
         WHERE reservation_id = $3`,
        [newStatus, isLate, reservationId]
      );

      if (isLate) {
        await db.query(
          `UPDATE users
           SET late_return_count = late_return_count + 1
           WHERE user_id = $1`,
          [rows[0].student_id]
        );
      }

      return res.status(200).json({
        message: `Marked as ${newStatus}`,
        isLate,
      });
    } catch (err) {
      next(err);
    }
  }

  // Sprint 2 - Issue #16: Technician/Admin views all reservations
  async getAllReservations(req, res, next) {
    try {
      const db = require('../database/db');

      const { rows } = await db.query(`
        SELECT
          r.reservation_id,
          u.full_name AS student_name,
          u.email AS student_email,
          e.name AS equipment_name,
          r.start_time,
          r.end_time,
          r.status,
          r.is_late,
          r.created_at
        FROM reservations r
        JOIN users u ON r.student_id = u.user_id
        JOIN equipment e ON r.equipment_id = e.equipment_id
        ORDER BY r.created_at DESC
      `);

      return res.status(200).json({
        total: rows.length,
        reservations: rows,
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new ReservationController();
