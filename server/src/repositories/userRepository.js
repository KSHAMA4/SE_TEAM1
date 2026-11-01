const db = require('../config/db');

class UserRepository {
  async findByEmail(email) {
    const query = `
      SELECT user_id, email, password_hash, role, full_name, late_return_count, created_at
      FROM users
      WHERE email = $1
    `;
    const result = await db.query(query, [email]);
    return result.rows[0] || null;
  }

  async findById(userId) {
    const query = `
      SELECT user_id, email, role, full_name, late_return_count, created_at
      FROM users
      WHERE user_id = $1
    `;
    const result = await db.query(query, [userId]);
    return result.rows[0] || null;
  }
}

module.exports = new UserRepository();
