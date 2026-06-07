const express = require('express');
const { query } = require('../config/database');
const { authenticate } = require('../middleware/auth');
const { requireMinRole } = require('../middleware/rbac');

const router = express.Router();

// GET /api/logs
router.get('/', authenticate, requireMinRole('department_manager'), async (req, res) => {
  try {
    const { user_id, action, entity_type, limit = 100, offset = 0 } = req.query;
    let conditions = [];
    let params = [];
    let idx = 1;

    if (user_id) { conditions.push(`l.user_id = $${idx++}`); params.push(user_id); }
    if (action) { conditions.push(`l.action = $${idx++}`); params.push(action); }
    if (entity_type) { conditions.push(`l.entity_type = $${idx++}`); params.push(entity_type); }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    params.push(parseInt(limit), parseInt(offset));

    const result = await query(
      `SELECT l.*, u.full_name_ar, u.username
       FROM audit_logs l
       LEFT JOIN users u ON l.user_id = u.id
       ${where}
       ORDER BY l.created_at DESC
       LIMIT $${idx++} OFFSET $${idx++}`,
      params
    );

    const countResult = await query(`SELECT COUNT(*) FROM audit_logs l ${where}`, params.slice(0, -2));

    res.json({
      logs: result.rows,
      total: parseInt(countResult.rows[0].count)
    });
  } catch (error) {
    console.error('Get logs error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
