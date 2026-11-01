
// Issue #3 — Auth routes: login and register
const express = require('express');
const router = express.Router();
const { generateToken } = require('../middleware/auth');

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: 'Email and password required'
      });
    }

    // Placeholder for Sprint 1 (real DB lookup in future sprint)
    const mockUser = {
      id: 1,
      name: 'Test User',
      email,
      role: 'student'
    };

    const token = generateToken(mockUser);

    res.json({
      message: 'Login successful',
      token,
      user: mockUser
    });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        error: 'Name, email and password required'
      });
    }

    const allowedRoles = ['student', 'faculty', 'admin'];
    const userRole = allowedRoles.includes(role) ? role : 'student';

    res.status(201).json({
      message: 'User registered successfully',
      user: { name, email, role: userRole }
    });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
