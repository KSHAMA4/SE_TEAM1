// Issue #3 - Auth middleware tests
const { generateToken, authorizeRole } = require('../src/middleware/auth');

describe('JWT Auth - Issue #3', () => {
  const mockUser = {
    id: 1,
    email: 'test@smartlab.com',
    role: 'student'
  };

  test('generateToken returns a valid JWT string', () => {
    const token = generateToken(mockUser);
    expect(typeof token).toBe('string');
    expect(token.split('.')).toHaveLength(3);
  });

  test('authorizeRole blocks incorrect role', () => {
    const middleware = authorizeRole('admin');

    const req = {
      user: { role: 'student' }
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    const next = jest.fn();

    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  test('authorizeRole allows correct role', () => {
    const middleware = authorizeRole('student', 'faculty');

    const req = {
      user: { role: 'student' }
    };

    const res = {};
    const next = jest.fn();

    middleware(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  test('auth middleware file exists', () => {
    const fs = require('fs');
    const path = require('path');

    expect(
      fs.existsSync(
        path.join(__dirname, '../src/middleware/auth.js')
      )
    ).toBe(true);
  });
});