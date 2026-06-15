const router = require('express').Router();
const db = require('../db');
const requireRole = require('../middleware/rbac');

// GET /api/audit-logs — admin only
router.get('/', requireRole('admin'), async (req, res, next) => {
  try {
    const limit  = Math.min(parseInt(req.query.limit  || '100', 10), 500);
    const offset = parseInt(req.query.offset || '0', 10);
    const { action, username, entity } = req.query;

    let q = `SELECT id, user_id, username, action, entity, entity_id, description, ip_address, created_at
             FROM audit_logs WHERE 1=1`;
    const params = [];

    if (action)   { params.push(action);   q += ` AND action = $${params.length}`; }
    if (username) { params.push(`%${username}%`); q += ` AND username ILIKE $${params.length}`; }
    if (entity)   { params.push(entity);   q += ` AND entity = $${params.length}`; }

    q += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const { rows } = await db.query(q, params);
    const total = await db.query('SELECT COUNT(*) FROM audit_logs');

    res.json({ success: true, data: rows, total: parseInt(total.rows[0].count, 10) });
  } catch (e) { next(e); }
});

module.exports = router;
