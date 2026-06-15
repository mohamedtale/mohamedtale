const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET /api/departments - جلب الهيكل التنظيمي الكامل مرتباً
router.get('/', async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT d.*, p.name AS parent_name
       FROM departments d
       LEFT JOIN departments p ON d.parent_id = p.id
       ORDER BY d.sort_order ASC, d.name ASC`
    );

    // بناء الشجرة الهرمية
    const departments = result.rows;
    const map = {};
    const roots = [];

    departments.forEach(dept => {
      map[dept.id] = { ...dept, children: [] };
    });

    departments.forEach(dept => {
      if (dept.parent_id && map[dept.parent_id]) {
        map[dept.parent_id].children.push(map[dept.id]);
      } else {
        roots.push(map[dept.id]);
      }
    });

    res.json({ success: true, data: roots, flat: departments });
  } catch (err) {
    next(err);
  }
});

// POST /api/departments - إضافة قسم جديد
router.post('/', async (req, res, next) => {
  try {
    const { name, type, parent_id, sort_order } = req.body;

    if (!name || !type) {
      return res.status(400).json({ success: false, error: 'اسم القسم ونوعه مطلوبان' });
    }

    const validTypes = ['office', 'dept', 'section'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ success: false, error: 'نوع القسم غير صحيح' });
    }

    const result = await pool.query(
      `INSERT INTO departments (name, type, parent_id, sort_order)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [name, type, parent_id ? parseInt(parent_id) : null, sort_order ? parseInt(sort_order) : 0]
    );

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    next(err);
  }
});

// PUT /api/departments/reorder - تحديث ترتيب الأقسام
router.put('/reorder', async (req, res, next) => {
  try {
    const { items } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, error: 'قائمة العناصر مطلوبة' });
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      for (const item of items) {
        await client.query(
          'UPDATE departments SET sort_order = $1 WHERE id = $2',
          [parseInt(item.sort_order), parseInt(item.id)]
        );
      }
      await client.query('COMMIT');
      res.json({ success: true, message: 'تم تحديث الترتيب بنجاح' });
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (err) {
    next(err);
  }
});

// PUT /api/departments/:id - تعديل قسم
router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, type, parent_id, sort_order } = req.body;

    const existing = await pool.query('SELECT id FROM departments WHERE id = $1', [parseInt(id)]);
    if (existing.rowCount === 0) {
      return res.status(404).json({ success: false, error: 'القسم غير موجود' });
    }

    // منع القسم من أن يكون أباً لنفسه
    if (parent_id && parseInt(parent_id) === parseInt(id)) {
      return res.status(400).json({ success: false, error: 'لا يمكن للقسم أن يكون تابعاً لنفسه' });
    }

    const result = await pool.query(
      `UPDATE departments SET
        name = COALESCE($1, name),
        type = COALESCE($2, type),
        parent_id = CASE WHEN $3::integer IS NOT NULL THEN $3::integer ELSE parent_id END,
        sort_order = COALESCE($4, sort_order)
       WHERE id = $5
       RETURNING *`,
      [
        name || null,
        type || null,
        parent_id !== undefined ? (parent_id === null ? null : parseInt(parent_id)) : undefined,
        sort_order !== undefined ? parseInt(sort_order) : null,
        parseInt(id)
      ]
    );

    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
