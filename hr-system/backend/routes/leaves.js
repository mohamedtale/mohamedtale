const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET /api/leaves - جلب الإجازات مع فلاتر
router.get('/', async (req, res, next) => {
  try {
    const { employee_id, leave_type, status, start_date, end_date } = req.query;
    let query = `
      SELECT l.*, e.full_name, e.emp_number, d.name AS department_name
      FROM leaves l
      JOIN employees e ON l.employee_id = e.id
      LEFT JOIN departments d ON e.department_id = d.id
      WHERE 1=1
    `;
    const params = [];
    let idx = 1;

    if (employee_id) { query += ` AND l.employee_id = $${idx++}`; params.push(parseInt(employee_id)); }
    if (leave_type) { query += ` AND l.leave_type = $${idx++}`; params.push(leave_type); }
    if (status) { query += ` AND l.status = $${idx++}`; params.push(status); }
    if (start_date) { query += ` AND l.start_date >= $${idx++}`; params.push(start_date); }
    if (end_date) { query += ` AND l.end_date <= $${idx++}`; params.push(end_date); }

    query += ' ORDER BY l.created_at DESC';

    const result = await pool.query(query, params);
    res.json({ success: true, data: result.rows, total: result.rowCount });
  } catch (err) {
    next(err);
  }
});

// GET /api/leaves/:id - جلب إجازة واحدة
router.get('/:id', async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT l.*, e.full_name, e.emp_number, e.leave_balance
       FROM leaves l
       JOIN employees e ON l.employee_id = e.id
       WHERE l.id = $1`,
      [parseInt(req.params.id)]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, error: 'الإجازة غير موجودة' });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    next(err);
  }
});

// POST /api/leaves - إنشاء طلب إجازة جديد
router.post('/', async (req, res, next) => {
  try {
    const {
      employee_id, leave_type, start_date, end_date,
      days_count, reason, residence_during_leave
    } = req.body;

    if (!employee_id || !leave_type || !start_date || !end_date || !days_count) {
      return res.status(400).json({ success: false, error: 'الحقول الإلزامية مفقودة' });
    }

    // جلب بيانات الموظف
    const empResult = await pool.query(
      'SELECT id, full_name, leave_balance, status FROM employees WHERE id = $1',
      [parseInt(employee_id)]
    );
    if (empResult.rowCount === 0) {
      return res.status(404).json({ success: false, error: 'الموظف غير موجود' });
    }
    const employee = empResult.rows[0];

    const daysCountInt = parseInt(days_count);
    const currentYear = new Date(start_date).getFullYear();

    // التحقق من رصيد الإجازة السنوية
    if (leave_type === 'annual') {
      if (employee.leave_balance < daysCountInt) {
        return res.status(400).json({
          success: false,
          error: `رصيد الإجازة غير كافٍ. الرصيد المتاح: ${employee.leave_balance} يوم`
        });
      }
    }

    // التحقق من إجازة الطوارئ: لا تتجاوز 12 يوماً في السنة
    if (leave_type === 'emergency') {
      const emergencyTotal = await pool.query(
        `SELECT COALESCE(SUM(days_count), 0) AS total
         FROM leaves
         WHERE employee_id = $1
           AND leave_type = 'emergency'
           AND status != 'rejected'
           AND EXTRACT(YEAR FROM start_date) = $2`,
        [parseInt(employee_id), currentYear]
      );
      const usedEmergency = parseInt(emergencyTotal.rows[0].total);
      if (usedEmergency + daysCountInt > 12) {
        return res.status(400).json({
          success: false,
          error: `تجاوز الحد الأقصى لإجازة الطوارئ. المستخدم: ${usedEmergency} يوم، الحد الأقصى: 12 يوم`
        });
      }
    }

    const result = await pool.query(
      `INSERT INTO leaves (
        employee_id, leave_type, start_date, end_date, days_count,
        reason, residence_during_leave, balance_before, balance_after, status
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,'pending')
      RETURNING *`,
      [
        parseInt(employee_id), leave_type, start_date, end_date, daysCountInt,
        reason || null, residence_during_leave || null,
        employee.leave_balance,
        leave_type === 'annual' ? employee.leave_balance - daysCountInt : employee.leave_balance
      ]
    );

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    next(err);
  }
});

// PUT /api/leaves/:id/approve - الموافقة على الإجازة وخصم الرصيد
router.put('/:id/approve', async (req, res, next) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const leaveResult = await client.query(
      'SELECT * FROM leaves WHERE id = $1',
      [parseInt(req.params.id)]
    );
    if (leaveResult.rowCount === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, error: 'الإجازة غير موجودة' });
    }

    const leave = leaveResult.rows[0];
    if (leave.status !== 'pending') {
      await client.query('ROLLBACK');
      return res.status(400).json({ success: false, error: 'الإجازة ليست في حالة انتظار' });
    }

    // خصم رصيد الإجازة السنوية فقط
    if (leave.leave_type === 'annual') {
      await client.query(
        `UPDATE employees
         SET leave_balance = leave_balance - $1, status = 'leave', updated_at = NOW()
         WHERE id = $2`,
        [leave.days_count, leave.employee_id]
      );
    } else {
      // تغيير حالة الموظف إلى "في إجازة" للأنواع الأخرى
      await client.query(
        `UPDATE employees SET status = 'leave', updated_at = NOW() WHERE id = $1`,
        [leave.employee_id]
      );
    }

    const updated = await client.query(
      `UPDATE leaves SET status = 'approved', updated_at = NOW()
       WHERE id = $1 RETURNING *`,
      [parseInt(req.params.id)]
    );

    await client.query('COMMIT');
    res.json({ success: true, data: updated.rows[0], message: 'تمت الموافقة على الإجازة' });
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
});

// PUT /api/leaves/:id/reject - رفض الإجازة
router.put('/:id/reject', async (req, res, next) => {
  try {
    const result = await pool.query(
      `UPDATE leaves SET status = 'rejected', updated_at = NOW()
       WHERE id = $1 AND status = 'pending'
       RETURNING *`,
      [parseInt(req.params.id)]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, error: 'الإجازة غير موجودة أو تمت معالجتها مسبقاً' });
    }
    res.json({ success: true, data: result.rows[0], message: 'تم رفض الإجازة' });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/leaves/:id - حذف طلب إجازة
router.delete('/:id', async (req, res, next) => {
  try {
    const result = await pool.query(
      `DELETE FROM leaves WHERE id = $1 AND status = 'pending' RETURNING id`,
      [parseInt(req.params.id)]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, error: 'الإجازة غير موجودة أو لا يمكن حذفها' });
    }
    res.json({ success: true, message: 'تم حذف طلب الإجازة' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
