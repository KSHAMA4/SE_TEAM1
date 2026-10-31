const express = require('express');
const router = express.Router();
const equipmentController = require('../controllers/equipmentController');
const authenticateToken = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');

// Authenticated users can list and view equipment details (FR-001, FR-007)
router.get('/', authenticateToken, equipmentController.getAll);
router.get('/:id', authenticateToken, equipmentController.getById);

// Sprint-2 item: Technician role guard for PUT /api/v1/equipment/:id (TC-011, TC-016)
router.put('/:id', authenticateToken, authorizeRoles('TECHNICIAN', 'ADMIN'), equipmentController.updateStatus);

module.exports = router;
