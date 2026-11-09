const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');
const db = require('../config/db');

// GET all users — Admin only
router.get('/', authenticateToken, authorizeRoles('ADMIN'), async (req, res, next) => {
  try {
    const { rows } = await db.query(
      'SELECT user_id, email, full_name, role, late_return_count, created_at FROM users ORDER BY created_at DESC'
    );
    return res.status(200).json({ total: rows.length, users: rows });
  } catch (err) { next(err); }
});

// PATCH user role — Admin only
router.patch('/:id/role', authenticateToken, authorizeRoles('ADMIN'), async (req, res, next) => {
  try {
    const { role } = req.body;
    const userId = parseInt(req.params.id, 10);
    const allowed = ['STUDENT', 'TECHNICIAN', 'ADMIN'];

    if (!role || !allowed.includes(role)) {
      return res.status(400).json({ error: 'Bad Request', message: `Role must be one of: ${allowed.join(', ')}` });
    }

    const { rows } = await db.query(
      'UPDATE users SET role = $1 WHERE user_id = $2 RETURNING user_id, email, full_name, role',
      [role, userId]
    );

    if (rows.length === 0) return res.status(404).json({ error: 'Not Found', message: 'User not found.' });
    return res.status(200).json({ message: 'Role updated.', user: rows[0] });
  } catch (err) { next(err); }
});

module.exports = router;