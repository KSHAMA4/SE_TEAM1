const express = require('express');
const router = express.Router();
const reservationController = require('../controllers/reservationController');
const authenticateToken = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');

// Student creates slot reservation (FR-001, FR-002, FR-003)
router.post('/', authenticateToken, authorizeRoles('STUDENT'), reservationController.create);

// Student views own reservations (FR-008)
router.get('/me', authenticateToken, authorizeRoles('STUDENT'), reservationController.getMyReservations);

// Real-time slot availability for an equipment (FR-001, UC-05)
router.get('/availability/:id', authenticateToken, reservationController.getAvailability);

// Sprint-2 Placeholders
router.post('/:id/cancel', authenticateToken, authorizeRoles('STUDENT'), reservationController.cancel);
router.post('/:id/return', authenticateToken, authorizeRoles('STUDENT'), reservationController.returnEquipment);

module.exports = router;
