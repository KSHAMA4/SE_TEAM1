const reservationService = require('../services/reservationService');

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
      const list = await reservationService.getStudentReservations(studentId, status);
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
      const availability = await reservationService.getSlotAvailability(equipmentId, date);
      return res.status(200).json(availability);
    } catch (err) {
      next(err);
    }
  }

  // Placeholder for Sprint-2 Cancel (FR-008)
  async cancel(req, res) {
    return res.status(200).json({
      message: 'Cancellation feature is scheduled for Sprint-2.',
    });
  }

  // Placeholder for Sprint-2 Return (FR-004)
  async returnEquipment(req, res) {
    return res.status(200).json({
      message: 'Return tracking feature is scheduled for Sprint-2.',
    });
  }
}

module.exports = new ReservationController();
