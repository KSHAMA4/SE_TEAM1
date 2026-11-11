const authService = require('../services/authService');

class AuthController {
  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const { token, user } = await authService.login(email, password);

      // Set HttpOnly cookie for session security (SAD Section 2)
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 15 * 60 * 1000, // 15 minutes TTL
      });
      
      try {
        const db = require('../config/db');
        const userId = user.user_id || user.userId;
        await db.query(
          `INSERT INTO audit_logs (actor_user_id, action, target_table, details)
           VALUES ($1, $2, $3, $4)`,
          [userId, 'LOGIN', 'users', JSON.stringify({ email: user.email, ip: req.ip })]
        );
      } catch (e) {
        // don't block login if audit fails
      }

      const REFRESH_SECRET = process.env.REFRESH_SECRET || 'refresh_secret_pes_2026';
      const refreshToken = require('jsonwebtoken').sign(
        { userId: user.user_id || user.userId, role: user.role },
        REFRESH_SECRET,
        { expiresIn: '7d' }
      );
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        sameSite: 'Lax',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });
      // ------------------------------------------

      return res.status(200).json({
        message: 'Authentication successful.',
        token,
        user,
      });
    } catch (err) {
      next(err);
    }
  }

  async logout(req, res) {
    res.clearCookie('token');
    res.clearCookie('refreshToken');
    return res.status(200).json({ message: 'Logged out successfully.' });
  }

  async me(req, res) {
    return res.status(200).json({ user: req.user });
  }
}

module.exports = new AuthController();
