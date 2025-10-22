/**
 * Middleware to check if user has required role(s)
 * @param  {...string} roles - Array of allowed roles
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You do not have permission to access this resource'
      });
    }

    next();
  };
};

/**
 * Check if user is admin
 */
const isAdmin = authorize('admin');

/**
 * Check if user is entertainer
 */
const isEntertainer = authorize('entertainer');

/**
 * Check if user is admin or accessing their own resource
 */
const isAdminOrOwner = (getUserIdFromRequest) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const resourceUserId = getUserIdFromRequest(req);

    if (req.user.role === 'admin' || req.user.id === resourceUserId) {
      return next();
    }

    return res.status(403).json({
      error: 'Forbidden',
      message: 'You can only access your own resources'
    });
  };
};

module.exports = {
  authorize,
  isAdmin,
  isEntertainer,
  isAdminOrOwner
};
