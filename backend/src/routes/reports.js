const express = require('express');
const { query } = require('../config/database');
const { authenticate } = require('../middleware/auth');
const { requireMinRole } = require('../middleware/rbac');

const router = express.Router();

// GET /api/reports
router.get('/', authenticate, async (req, res) => {
  try {
    const { report_type, status, section, limit = 50, offset = 0 } = req.query;
    let conditions = [];
    let params = [];
    let idx = 1;

    if (report_type) { conditions.push(`r.report_type = $${idx++}`); params.push(report_type); }
    if (status) { conditions.push(`r.status = $${idx++}`); params.push(status); }
    if (section) { conditions.push(`r.section = $${idx++}`); params.push(section); }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    params.push(parseInt(limit), parseInt(offset));

    const result = await query(
      `SELECT r.*, u.full_name_ar as created_by_name, w.name_ar as well_name
       FROM reports r
       LEFT JOIN users u ON r.created_by = u.id
       LEFT JOIN wells w ON r.well_id = w.id
       ${where}
       ORDER BY r.created_at DESC
       LIMIT $${idx++} OFFSET $${idx++}`,
      params
    );

    const countResult = await query(`SELECT COUNT(*) FROM reports r ${where}`, params.slice(0, -2));

    res.json({
      reports: result.rows,
      total: parseInt(countResult.rows[0].count),
    });
  } catch (error) {
    console.error('Get reports error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/reports/:id
router.get('/:id', authenticate, async (req, res) => {
  try {
    const result = await query(
      `SELECT r.*, u.full_name_ar as created_by_name, w.name_ar as well_name
       FROM reports r
       LEFT JOIN users u ON r.created_by = u.id
       LEFT JOIN wells w ON r.well_id = w.id
       WHERE r.id = $1`,
      [req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Report not found', message_ar: 'التقرير غير موجود' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/reports
router.post('/', authenticate, async (req, res) => {
  try {
    const { report_type, title_ar, title_en, report_date, period_start, period_end, section, well_id, content, summary_ar, summary_en } = req.body;

    if (!report_type || !title_ar || !report_date) {
      return res.status(400).json({ error: 'Required fields missing', message_ar: 'الحقول المطلوبة مفقودة' });
    }

    const result = await query(
      `INSERT INTO reports (report_type, title_ar, title_en, report_date, period_start, period_end, section, well_id, content, summary_ar, summary_en, status, created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,'draft',$12) RETURNING *`,
      [report_type, title_ar, title_en || null, report_date, period_start || null, period_end || null,
       section || null, well_id || null, content ? JSON.stringify(content) : null,
       summary_ar || null, summary_en || null, req.user.id]
    );

    try {
      await query(
        'INSERT INTO audit_logs (user_id, action, entity_type, entity_id) VALUES ($1,$2,$3,$4)',
        [req.user.id, 'create', 'report', result.rows[0].id]
      );
    } catch (e) {}

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create report error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/reports/:id
router.put('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { title_ar, title_en, summary_ar, summary_en, content, status } = req.body;

    const result = await query(
      `UPDATE reports SET
        title_ar = COALESCE($1, title_ar),
        title_en = COALESCE($2, title_en),
        summary_ar = COALESCE($3, summary_ar),
        summary_en = COALESCE($4, summary_en),
        content = COALESCE($5, content),
        status = COALESCE($6, status),
        updated_at = NOW()
       WHERE id = $7 RETURNING *`,
      [title_ar || null, title_en || null, summary_ar || null, summary_en || null,
       content ? JSON.stringify(content) : null, status || null, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Report not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/reports/:id/submit
router.post('/:id/submit', authenticate, async (req, res) => {
  try {
    const result = await query(
      `UPDATE reports SET status = 'submitted', updated_at = NOW() WHERE id = $1 AND status = 'draft' RETURNING *`,
      [req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Report not found or not in draft state' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/reports/:id/approve
router.post('/:id/approve', authenticate, requireMinRole('section_head'), async (req, res) => {
  try {
    const result = await query(
      `UPDATE reports SET status = 'approved', approved_by = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
      [req.user.id, req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Report not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/reports/:id
router.delete('/:id', authenticate, requireMinRole('department_manager'), async (req, res) => {
  try {
    await query('DELETE FROM reports WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
