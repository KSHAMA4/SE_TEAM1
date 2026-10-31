// Enforce role-based access control (RBAC) (FR-006, TC-016)
function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'User authentication context not found.',
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'Forbidden',
        message: `Access denied. Route requires one of [${allowedRoles.join(', ')}] role privileges.`,
      });
    }

    next();
  };
}

module.exports = authorizeRoles;
