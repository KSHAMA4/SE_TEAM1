const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userRepository = require('../repositories/userRepository');

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_pes_smart_lab_2026_change_in_production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m';

class AuthService {
  async login(email, password) {
    if (!email || !password) {
      const error = new Error('Email and password are required.');
      error.statusCode = 400;
      throw error;
    }

    const user = await userRepository.findByEmail(email.toLowerCase().trim());
    if (!user) {
      const error = new Error('Invalid email or password credentials.');
      error.statusCode = 401;
      throw error;
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      const error = new Error('Invalid email or password credentials.');
      error.statusCode = 401;
      throw error;
    }

    // Sign JWT token with payload
    const tokenPayload = {
      userId: user.user_id,
      email: user.email,
      role: user.role,
      fullName: user.full_name,
    };

    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    return {
      token,
      user: {
        userId: user.user_id,
        email: user.email,
        role: user.role,
        fullName: user.full_name,
        lateReturnCount: user.late_return_count,
      },
    };
  }
}

module.exports = new AuthService();
