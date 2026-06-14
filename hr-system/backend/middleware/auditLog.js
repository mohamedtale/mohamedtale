const pool = require('../db');

/**
 * Map route prefixes to entity names
 */
const ENTITY_MAP = {
  '/api/employees':   'employees',
  '/api/leaves':      'leaves',
  '/api/permissions': 'permissions',
  '/api/attendance':  'attendance',
  '/api/allowances':  'allowances',
  '/api/documents':   'documents',
  '/api/departments': 'departments',
  '/api/settings':    'settings',
  '/api/reports':     'reports',
};

const METHOD_ACTION = {
  POST:   'CREATE',
  PUT:    'UPDATE',
  PATCH:  'UPDATE',
  DELETE: 'DELETE',
};

/**
 * Extract entity and ID from request path
 * e.g. /api/leaves/5/approve → { entity: 'leaves', entityId: 5 }
 */
function parseEntity(path) {
  for (const [prefix, entity] of Object.entries(ENTITY_MAP)) {
    if (path.startsWith(prefix)) {
      const rest = path.slice(prefix.length); // e.g. '/5/approve'
      const match = rest.match(/^\/(\d+)/);
      return { entity, entityId: match ? parseInt(match[1], 10) : null };
    }
  }
  return { entity: null, entityId: null };
}

/**
 * Write an audit entry — fire and forget (never blocks response)
 */
async function writeLog({ userId, username, action, entity, entityId, description, ip }) {
  try {
    await pool.query(
      `INSERT INTO audit_logs (user_id, username, action, entity, entity_id, description, ip_address)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [userId || null, username || null, action, entity || null, entityId || null, description || null, ip || null]
    );
  } catch (_) {
    // Never crash the app over a log failure
  }
}

/**
 * Express middleware — logs every mutating API request after response
 */
function auditMiddleware(req, res, next) {
  // Only log write operations
  const action = METHOD_ACTION[req.method];
  if (!action) return next();

  const originalJson = res.json.bind(res);
  res.json = function (body) {
    originalJson(body);

    // Only log successful operations (2xx)
    if (res.statusCode >= 200 && res.statusCode < 300) {
      const { entity, entityId } = parseEntity(req.path);
      const user = req.user || {};
      const ip = req.ip || req.headers['x-forwarded-for'] || 'unknown';

      // Build human-readable description
      let desc = `${action} on ${entity || req.path}`;
      if (req.method === 'POST' && body?.data?.id) desc += ` (id=${body.data.id})`;
      if (req.path.includes('/approve')) desc = `APPROVE ${entity} id=${entityId}`;
      if (req.path.includes('/reject'))  desc = `REJECT ${entity} id=${entityId}`;
      if (req.path.includes('/promote')) desc = `PROMOTE employee id=${entityId}`;

      writeLog({
        userId:    user.id,
        username:  user.username,
        action,
        entity,
        entityId:  entityId || (body?.data?.id) || null,
        description: desc,
        ip,
      });
    }
  };

  next();
}

/**
 * Manual log helper — used for login/logout events
 */
auditMiddleware.log = writeLog;

module.exports = auditMiddleware;
