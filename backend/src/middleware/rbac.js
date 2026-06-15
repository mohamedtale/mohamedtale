const ROLE_HIERARCHY = {
  system_admin: 4,
  department_manager: 3,
  section_head: 2,
  employee: 1,
};

const SECTION_PERMISSIONS = {
  wells_map: ['system_admin', 'department_manager', 'section_head', 'employee'],
  technical_reports: ['system_admin', 'department_manager', 'section_head', 'employee'],
  weekly_followup: ['system_admin', 'department_manager', 'section_head', 'employee'],
  water_soil_db: ['system_admin', 'department_manager', 'section_head', 'employee'],
  well_rock_design: ['system_admin', 'department_manager', 'section_head'],
  contracts: ['system_admin', 'department_manager', 'section_head'],
  user_management: ['system_admin'],
  audit_logs: ['system_admin', 'department_manager'],
};

const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized', message_ar: 'غير مصرح لك بالوصول' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'Forbidden',
        message_ar: 'ليس لديك صلاحية للوصول إلى هذا المورد',
        required_roles: roles,
        your_role: req.user.role
      });
    }
    next();
  };
};

const requireMinRole = (minRole) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized', message_ar: 'غير مصرح لك بالوصول' });
    }
    const userLevel = ROLE_HIERARCHY[req.user.role] || 0;
    const requiredLevel = ROLE_HIERARCHY[minRole] || 0;
    if (userLevel < requiredLevel) {
      return res.status(403).json({
        error: 'Insufficient permissions',
        message_ar: 'صلاحياتك لا تكفي للوصول إلى هذا المورد'
      });
    }
    next();
  };
};

const requireSection = (section) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized', message_ar: 'غير مصرح لك بالوصول' });
    }
    const allowedRoles = SECTION_PERMISSIONS[section] || [];
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'Section access denied',
        message_ar: 'لا يمكنك الوصول إلى هذا القسم'
      });
    }
    next();
  };
};

module.exports = { requireRole, requireMinRole, requireSection, ROLE_HIERARCHY };
