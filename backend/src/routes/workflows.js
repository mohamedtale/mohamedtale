const express = require('express');
const { query } = require('../config/database');
const { authenticate } = require('../middleware/auth');
const { requireMinRole } = require('../middleware/rbac');

const router = express.Router();

// GET /api/workflows
router.get('/', authenticate, async (req, res) => {
  try {
    const { status, priority, entity_type, limit = 50, offset = 0 } = req.query;
    let conditions = [];
    let params = [];
    let idx = 1;

    if (status) { conditions.push(`w.current_status = $${idx++}`); params.push(status); }
    if (priority) { conditions.push(`w.priority = $${idx++}`); params.push(priority); }
    if (entity_type) { conditions.push(`w.entity_type = $${idx++}`); params.push(entity_type); }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    params.push(parseInt(limit), parseInt(offset));

    const result = await query(
      `SELECT w.*,
              s.full_name_ar as submitted_by_name,
              a.full_name_ar as assigned_to_name
       FROM workflows w
       LEFT JOIN users s ON w.submitted_by = s.id
       LEFT JOIN users a ON w.assigned_to = a.id
       ${where}
       ORDER BY
         CASE w.priority WHEN 'urgent' THEN 1 WHEN 'high' THEN 2 WHEN 'normal' THEN 3 WHEN 'low' THEN 4 END,
         w.created_at DESC
       LIMIT $${idx++} OFFSET $${idx++}`,
      params
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get workflows error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/workflows/:id
router.get('/:id', authenticate, async (req, res) => {
  try {
    const wResult = await query(
      `SELECT w.*, s.full_name_ar as submitted_by_name, a.full_name_ar as assigned_to_name
       FROM workflows w
       LEFT JOIN users s ON w.submitted_by = s.id
       LEFT JOIN users a ON w.assigned_to = a.id
       WHERE w.id = $1`,
      [req.params.id]
    );

    if (wResult.rows.length === 0) {
      return res.status(404).json({ error: 'Workflow not found' });
    }

    const stepsResult = await query(
      `SELECT ws.*, u.full_name_ar as actor_name
       FROM workflow_steps ws
       LEFT JOIN users u ON ws.actor_id = u.id
       WHERE ws.workflow_id = $1 ORDER BY ws.step_number`,
      [req.params.id]
    );

    res.json({ ...wResult.rows[0], steps: stepsResult.rows });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/workflows
router.post('/', authenticate, async (req, res) => {
  try {
    const { title_ar, title_en, workflow_type, entity_type, entity_id, priority, assigned_to, description_ar, description_en, due_date } = req.body;

    if (!title_ar || !workflow_type) {
      return res.status(400).json({ error: 'Required fields missing' });
    }

    const result = await query(
      `INSERT INTO workflows (title_ar, title_en, workflow_type, entity_type, entity_id, current_status, priority, submitted_by, assigned_to, description_ar, description_en, due_date)
       VALUES ($1,$2,$3,$4,$5,'submitted',$6,$7,$8,$9,$10,$11) RETURNING *`,
      [title_ar, title_en || null, workflow_type, entity_type || null, entity_id || null,
       priority || 'normal', req.user.id, assigned_to || null, description_ar || null,
       description_en || null, due_date || null]
    );

    // Add initial step
    await query(
      `INSERT INTO workflow_steps (workflow_id, step_number, action, actor_id, comment)
       VALUES ($1, 1, 'submitted', $2, $3)`,
      [result.rows[0].id, req.user.id, description_ar || 'تم التقديم']
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create workflow error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/workflows/:id/action
router.post('/:id/action', authenticate, requireMinRole('section_head'), async (req, res) => {
  try {
    const { action, comment } = req.body;
    const validActions = ['reviewed', 'approved', 'rejected', 'returned', 'commented'];

    if (!validActions.includes(action)) {
      return res.status(400).json({ error: 'Invalid action' });
    }

    const statusMap = {
      reviewed: 'under_review',
      approved: 'approved',
      rejected: 'rejected',
      returned: 'returned',
      commented: undefined
    };

    let newStatus = statusMap[action];

    // Get current step count
    const stepsResult = await query(
      'SELECT COUNT(*) FROM workflow_steps WHERE workflow_id = $1',
      [req.params.id]
    );
    const nextStep = parseInt(stepsResult.rows[0].count) + 1;

    await query(
      `INSERT INTO workflow_steps (workflow_id, step_number, action, actor_id, comment)
       VALUES ($1,$2,$3,$4,$5)`,
      [req.params.id, nextStep, action, req.user.id, comment || null]
    );

    if (newStatus) {
      await query(
        `UPDATE workflows SET current_status = $1, updated_at = NOW() WHERE id = $2`,
        [newStatus, req.params.id]
      );
    }

    res.json({ success: true, message_ar: 'تم تنفيذ الإجراء بنجاح' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
