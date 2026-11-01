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

      return res.status(200).json({
        message: 'Authentication successful.',
        token, // also sent in response body for flexible API/testing usage
        user,
      });
    } catch (err) {
      next(err);
    }
  }

  async logout(req, res) {
    res.clearCookie('token');
    return res.status(200).json({ message: 'Logged out successfully.' });
  }

  async me(req, res) {
    return res.status(200).json({ user: req.user });
  }
}

module.exports = new AuthController();
