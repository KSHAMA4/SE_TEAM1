const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');
const db = require('../config/db');

router.get('/', authenticateToken, authorizeRoles('ADMIN'), async (req, res, next) => {
  try {
    const { rows } = await db.query(`
      SELECT al.log_id, u.full_name AS actor_name, u.email AS actor_email,
             al.action, al.target_table, al.details, al.ip_address, al.created_at
      FROM audit_logs al
      LEFT JOIN users u ON al.actor_user_id = u.user_id
      ORDER BY al.created_at DESC
      LIMIT 200
    `);
    return res.status(200).json({ total: rows.length, logs: rows });
  } catch (err) { next(err); }
});

module.exports = router;