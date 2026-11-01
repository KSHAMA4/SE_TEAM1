const reservationRepository = require('../repositories/reservationRepository');
const equipmentRepository = require('../repositories/equipmentRepository');
const db = require('../config/db');

class ReservationService {
  // Validate business rules (FR-001, FR-002, SAD Sequence 4.1)
  validateSlotRules(start, end, equipment) {
    const now = new Date();
    const startTime = new Date(start);
    const endTime = new Date(end);

    // Rule 1: Valid date objects
    if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
      const error = new Error('Invalid date-time format provided.');
      error.statusCode = 400;
      throw error;
    }

    // Rule 2: End time must be after start time
    if (endTime <= startTime) {
      const error = new Error('Reservation end time must be strictly after start time.');
      error.statusCode = 400;
      throw error;
    }

    // Rule 3: Start time cannot be in the past (allow 2-min clock drift grace)
    const driftGraceMs = 2 * 60 * 1000;
    if (startTime.getTime() < now.getTime() - driftGraceMs) {
      const error = new Error('Cannot reserve slots in the past.');
      error.statusCode = 400;
      throw error;
    }

    // Rule 4: Max 2-hour duration (120 minutes allowed, 121 minutes rejected) (TC-002)
    const durationMinutes = (endTime.getTime() - startTime.getTime()) / (1000 * 60);
    if (durationMinutes > 120) {
      const error = new Error(`Slot duration (${Math.round(durationMinutes)} mins) exceeds the maximum allowed 120 minutes.`);
      error.statusCode = 400;
      throw error;
    }

    // Rule 5: 7-day advance booking window (TC-003)
    const maxAdvanceTime = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    if (startTime > maxAdvanceTime) {
      const error = new Error('Reservations can only be made up to 7 days in advance.');
      error.statusCode = 400;
      throw error;
    }

    // Rule 6: Calibration verification (FR-002, TC-005)
    if (equipment.status !== 'AVAILABLE') {
      const error = new Error(`Equipment is currently ${equipment.status} and cannot be reserved.`);
      error.statusCode = 422;
      throw error;
    }

    const calibExp = new Date(equipment.calibration_expiration);
    if (calibExp < endTime) {
      const error = new Error('Equipment calibration certificate has expired or will expire before slot completion.');
      error.statusCode = 422;
      throw error;
    }
  }

  // Suggest alternative 2-hour slots if overlap occurs (FR-003, UC-05)
  async getSuggestedAlternatives(equipmentId, requestedDate) {
    const dayStart = new Date(requestedDate);
    dayStart.setHours(9, 0, 0, 0); // Lab opens 09:00

    const dayEnd = new Date(requestedDate);
    dayEnd.setHours(17, 0, 0, 0); // Lab closes 17:00

    const existing = await reservationRepository.findByEquipmentAndWindow(equipmentId, dayStart, dayEnd);

    const candidateSlots = [
      { start: '09:00', end: '11:00' },
      { start: '11:00', end: '13:00' },
      { start: '13:00', end: '15:00' },
      { start: '15:00', end: '17:00' }
    ];

    const freeSlots = [];
    for (const slot of candidateSlots) {
      const [sH, sM] = slot.start.split(':').map(Number);
      const [eH, eM] = slot.end.split(':').map(Number);

      const slotStart = new Date(requestedDate);
      slotStart.setHours(sH, sM, 0, 0);
      const slotEnd = new Date(requestedDate);
      slotEnd.setHours(eH, eM, 0, 0);

      // Check if candidate slot overlaps with any confirmed reservation
      const overlaps = existing.some(r => {
        const rStart = new Date(r.start_time);
        const rEnd = new Date(r.end_time);
        return slotStart < rEnd && slotEnd > rStart;
      });

      if (!overlaps && slotStart > new Date()) {
        freeSlots.push({
          startTime: slotStart.toISOString(),
          endTime: slotEnd.toISOString(),
          durationMinutes: 120
        });
      }
    }

    return freeSlots;
  }

  // Execute reservation with transaction and SELECT FOR UPDATE row lock (SAD Seq 4.1)
  async createReservation(studentId, { equipmentId, startTime, endTime }) {
    const client = await db.getClient();

    try {
      await client.query('BEGIN');

      // 1. Pessimistic Row Lock (SELECT FOR UPDATE)
      const equipment = await equipmentRepository.findByIdWithLock(client, equipmentId);
      if (!equipment) {
        const error = new Error(`Equipment ID ${equipmentId} does not exist.`);
        error.statusCode = 404;
        throw error;
      }

      // 2. Validate business rules (duration, 7 days, calibration)
      this.validateSlotRules(startTime, endTime, equipment);

      // 3. Check for overlapping reservations
      const overlaps = await reservationRepository.findOverlapping(client, equipmentId, startTime, endTime);
      if (overlaps.length > 0) {
        const alternatives = await this.getSuggestedAlternatives(equipmentId, startTime);
        const error = new Error('Requested time slot overlaps with an existing confirmed reservation.');
        error.statusCode = 409;
        error.alternatives = alternatives;
        throw error;
      }

      // 4. Insert confirmed reservation (guarded by exclusion constraint)
      const newReservation = await reservationRepository.createReservation(client, {
        equipmentId,
        studentId,
        startTime,
        endTime,
      });

      // 5. Append-only audit log entry (SAD Section 6)
      await client.query(
        `INSERT INTO audit_logs (actor_user_id, action, target_table, details)
         VALUES ($1, 'RESERVATION_CREATED', 'reservations', $2)`,
        [studentId, JSON.stringify({ reservationId: newReservation.reservation_id, equipmentId, token: newReservation.token })]
      );

      await client.query('COMMIT');
      return newReservation;
    } catch (err) {
      await client.query('ROLLBACK');

      // Detect PostgreSQL exclusion constraint violation (code 23P01)
      if (err.code === '23P01') {
        const conflictErr = new Error('Double-booking prevented: Database exclusion constraint detected overlapping slot.');
        conflictErr.statusCode = 409;
        const alternatives = await this.getSuggestedAlternatives(equipmentId, startTime);
        conflictErr.alternatives = alternatives;
        throw conflictErr;
      }

      throw err;
    } finally {
      client.release();
    }
  }

  // Get student reservations (FR-008, TC-018)
  async getStudentReservations(studentId, status) {
    return await reservationRepository.findByStudentId(studentId, status);
  }

  // Real-time slot availability inquiry (FR-001, UC-05)
  async getSlotAvailability(equipmentId, targetDate) {
    const equipment = await equipmentRepository.findById(equipmentId);
    if (!equipment) {
      const error = new Error(`Equipment ID ${equipmentId} not found.`);
      error.statusCode = 404;
      throw error;
    }

    const startOfDay = new Date(targetDate || new Date());
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(startOfDay);
    endOfDay.setHours(23, 59, 59, 999);

    const bookedReservations = await reservationRepository.findByEquipmentAndWindow(
      equipmentId,
      startOfDay,
      endOfDay
    );

    const alternatives = await this.getSuggestedAlternatives(equipmentId, startOfDay);

    return {
      equipment: {
        equipmentId: equipment.equipment_id,
        name: equipment.name,
        status: equipment.status,
        calibrationStatus: equipment.calibration_status,
      },
      date: startOfDay.toISOString().split('T')[0],
      bookedSlots: bookedReservations.map(r => ({
        reservationId: r.reservation_id,
        startTime: r.start_time,
        endTime: r.end_time,
      })),
      availableAlternatives: alternatives,
    };
  }
}

module.exports = new ReservationService();
