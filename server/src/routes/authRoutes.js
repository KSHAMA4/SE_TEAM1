const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authenticateToken = require('../middleware/authMiddleware');

router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.get('/me', authenticateToken, authController.me);
router.post('/refresh', async (req, res) => {
  try {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) return res.status(401).json({ error: 'Unauthorized', message: 'No refresh token.' });

    const jwt = require('jsonwebtoken');
    const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_pes_smart_lab_2026_change_in_production';
    const REFRESH_SECRET = process.env.REFRESH_SECRET || 'refresh_secret_pes_2026';

    const decoded = jwt.verify(refreshToken, REFRESH_SECRET);
    const newToken = jwt.sign(
      { userId: decoded.userId, role: decoded.role },
      JWT_SECRET,
      { expiresIn: '15m' }
    );
    res.cookie('token', newToken, { httpOnly: true, sameSite: 'Lax', maxAge: 15 * 60 * 1000 });
    return res.status(200).json({ message: 'Token refreshed.' });
  } catch (err) {
    return res.status(401).json({ error: 'Unauthorized', message: 'Invalid or expired refresh token.' });
  }
});

module.exports = router;
