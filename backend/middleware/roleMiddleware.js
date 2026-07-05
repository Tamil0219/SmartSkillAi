// roleMiddleware.js
const roleMiddleware = (requiredRole) => {
  return (req, res, next) => {
    const userRole = req.user?.role;
    console.log('[RoleMiddleware] Required role:', requiredRole, ', User role:', userRole);
    
    if (!userRole) {
      console.warn('[RoleMiddleware] No user role found');
      const error = new Error('Unauthorized');
      error.status = 401;
      return next(error);
    }
    if (userRole !== requiredRole) {
      console.warn('[RoleMiddleware] Role mismatch - required:', requiredRole, 'actual:', userRole);
      const error = new Error('Access denied');
      error.status = 403;
      return next(error);
    }
    console.log('[RoleMiddleware] ✅ Role check passed');
    next();
  };
};

module.exports = roleMiddleware;