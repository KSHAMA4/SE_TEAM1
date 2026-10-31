const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_pes_smart_lab_2026_change_in_production';

// Verify JWT token from HttpOnly cookie or Authorization Bearer header
function authenticateToken(req, res, next) {
  let token = null;

  // 1. Check HttpOnly cookie
  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  } 
  // 2. Fallback to Authorization Header (Bearer <token>)
  else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Access token required. Please log in to proceed.',
    });
  }

  jwt.verify(token, JWT_SECRET, (err, decodedUser) => {
    if (err) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid or expired session token.',
      });
    }

    req.user = decodedUser;
    next();
  });
}

module.exports = authenticateToken;
