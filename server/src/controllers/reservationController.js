
const reservationService = require('../services/reservationService');
const db = require('../config/db');

class ReservationController {
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

  // Sprint 2 - Issue #15: Student Cancellation
  async cancel(req, res, next) {
    try {
      const reservationId = parseInt(req.params.id, 10);
      const studentId = req.user.userId;

      if (!Number.isInteger(reservationId) || reservationId <= 0) {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'Invalid reservation ID.',
        });
      }

      // Find reservation
      const result = await db.query(
        `SELECT reservation_id, student_id, status
         FROM reservations
         WHERE reservation_id = $1`,
        [reservationId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          error: 'Not Found',
          message: 'Reservation not found.',
        });
      }

      const reservation = result.rows[0];

      // Verify ownership
      if (String(reservation.student_id) !== String(studentId)) {
        return res.status(403).json({
          error: 'Forbidden',
          message: 'You can only cancel your own reservations.',
        });
      }

      // Only confirmed reservations can be cancelled
      if (reservation.status !== 'CONFIRMED') {
        return res.status(400).json({
          error: 'Bad Request',
          message: `Cannot cancel a reservation with status: ${reservation.status}`,
        });
      }

      // Cancel reservation
      const updateResult = await db.query(
        `UPDATE reservations
         SET status = 'CANCELLED'
         WHERE reservation_id = $1
           AND student_id = $2
           AND status = 'CONFIRMED'
         RETURNING reservation_id, status`,
        [reservationId, studentId]
      );

      if (updateResult.rows.length === 0) {
        return res.status(409).json({
          error: 'Conflict',
          message: 'Reservation status changed. Please refresh and try again.',
        });
      }

      return res.status(200).json({
        message: 'Reservation cancelled successfully.',
        reservation: updateResult.rows[0],
      });
    } catch (err) {
      next(err);
    }
  }

  // Sprint 2 - Issue #16: Technician Return Workflow
  async returnEquipment(req, res, next) {
    return res.status(200).json({
      message: 'Return tracking feature is scheduled for Sprint-2.',
    });
  }
}

module.exports = new ReservationController();
