
const express = require('express');
const router = express.Router();

const reservationController = require('../controllers/reservationController');
const authenticateToken = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');

// ==========================================
// SPRINT 1 - RESERVATIONS
// ==========================================

// Student creates a reservation
router.post(
  '/',
  authenticateToken,
  authorizeRoles('STUDENT'),
  reservationController.create
);

// Student views their own reservations
router.get(
  '/me',
  authenticateToken,
  authorizeRoles('STUDENT'),
  reservationController.getMyReservations
);

// Get real-time equipment slot availability
router.get(
  '/availability/:id',
  authenticateToken,
  reservationController.getAvailability
);

// ==========================================
// SPRINT 2 - ISSUE #15: CANCELLATION
// ==========================================

// Student cancels their own reservation
router.post(
  '/:id/cancel',
  authenticateToken,
  authorizeRoles('STUDENT'),
  reservationController.cancel
);

// ==========================================
// SPRINT 2 - ISSUE #16: TECHNICIAN RETURN
// ==========================================

// Technician/Admin marks equipment as returned
router.post(
  '/:id/return',
  authenticateToken,
  authorizeRoles('TECHNICIAN', 'ADMIN'),
  reservationController.returnEquipment
);

// Technician/Admin views all reservations
router.get(
  '/all',
  authenticateToken,
  authorizeRoles('TECHNICIAN', 'ADMIN'),
  reservationController.getAllReservations
);

module.exports = router;
