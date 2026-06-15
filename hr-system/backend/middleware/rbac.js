/**
 * Role-Based Access Control middleware
 * Usage: requireRole('admin') or requireRole('admin', 'manager')
 */
module.exports = function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'غير مصرح' });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'ليس لديك صلاحية للقيام بهذه العملية' });
    }
    next();
  };
};
