const express = require('express');
const router = express.Router();
const pool = require('../db');

// حساب تاريخ استحقاق العلاوة بناءً على تاريخ التعيين أو التسوية
function calculateAllowanceDueDate(startDate, settlementDate = null) {
  const baseDate = settlementDate ? new Date(settlementDate) : new Date(startDate);
  const day = baseDate.getDate();
  let month = baseDate.getMonth();
  let year = baseDate.getFullYear() + 1;
  if (day >= 3) {
    month = month + 1;
    if (month > 11) { month = 0; year++; }
  }
  return new Date(year, month, 1);
}

// GET /api/employees - جلب جميع الموظفين مع معلومات القسم
router.get('/', async (req, res, next) => {
  try {
    const { status, department_id, contract_type } = req.query;
    let query = `
      SELECT e.*, d.name AS department_name, d.type AS department_type
      FROM employees e
      LEFT JOIN departments d ON e.department_id = d.id
      WHERE 1=1
    `;
    const params = [];
    let idx = 1;

    if (status) {
      query += ` AND e.status = $${idx++}`;
      params.push(status);
    }
    if (department_id) {
      query += ` AND e.department_id = $${idx++}`;
      params.push(parseInt(department_id));
    }
    if (contract_type) {
      query += ` AND e.contract_type = $${idx++}`;
      params.push(contract_type);
    }

    query += ' ORDER BY e.full_name ASC';

    const result = await pool.query(query, params);
    res.json({ success: true, data: result.rows, total: result.rowCount });
  } catch (err) {
    next(err);
  }
});

// GET /api/employees/search/:query - البحث بالاسم أو رقم الموظف
router.get('/search/:query', async (req, res, next) => {
  try {
    const searchTerm = `%${req.params.query}%`;
    const result = await pool.query(
      `SELECT e.*, d.name AS department_name
       FROM employees e
       LEFT JOIN departments d ON e.department_id = d.id
       WHERE e.full_name ILIKE $1 OR e.emp_number ILIKE $1
       ORDER BY e.full_name ASC
       LIMIT 50`,
      [searchTerm]
    );
    res.json({ success: true, data: result.rows, total: result.rowCount });
  } catch (err) {
    next(err);
  }
});

// GET /api/employees/:id - جلب موظف واحد مع تفاصيل القسم
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT e.*, d.name AS department_name, d.type AS department_type
       FROM employees e
       LEFT JOIN departments d ON e.department_id = d.id
       WHERE e.id = $1`,
      [parseInt(id)]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, error: 'الموظف غير موجود' });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    next(err);
  }
});

// POST /api/employees - إضافة موظف جديد
router.post('/', async (req, res, next) => {
  try {
    const {
      emp_number, national_id, full_name, gender, birth_date,
      education_level, job_title, department_id, contract_type,
      start_date, grade_level, grade_allowance_count, settlement_date,
      settlement_type, work_start_time, work_end_time,
      no_fingerprint, leave_balance, status, notes
    } = req.body;

    if (!emp_number || !full_name) {
      return res.status(400).json({ success: false, error: 'رقم الموظف والاسم الكامل مطلوبان' });
    }

    // حساب تاريخ استحقاق العلاوة تلقائياً
    let allowance_due_date = null;
    if (start_date) {
      allowance_due_date = calculateAllowanceDueDate(start_date, settlement_date || null);
    }

    const result = await pool.query(
      `INSERT INTO employees (
        emp_number, national_id, full_name, gender, birth_date,
        education_level, job_title, department_id, contract_type,
        start_date, grade_level, grade_allowance_count, allowance_due_date,
        settlement_date, settlement_type, work_start_time, work_end_time,
        no_fingerprint, leave_balance, status, notes
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21)
      RETURNING *`,
      [
        emp_number, national_id || null, full_name, gender || null,
        birth_date || null, education_level || null, job_title || null,
        department_id ? parseInt(department_id) : null,
        contract_type || null, start_date || null,
        grade_level ? parseInt(grade_level) : null,
        grade_allowance_count ? parseInt(grade_allowance_count) : 0,
        allowance_due_date, settlement_date || null, settlement_type || null,
        work_start_time || null, work_end_time || null,
        no_fingerprint === true || no_fingerprint === 'true',
        leave_balance !== undefined ? parseInt(leave_balance) : 45,
        status || 'active', notes || null
      ]
    );

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    next(err);
  }
});

// PUT /api/employees/:id - تعديل بيانات موظف
router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      emp_number, national_id, full_name, gender, birth_date,
      education_level, job_title, department_id, contract_type,
      start_date, grade_level, grade_allowance_count, allowance_due_date,
      settlement_date, settlement_type, work_start_time, work_end_time,
      no_fingerprint, leave_balance, status, notes
    } = req.body;

    // التحقق من وجود الموظف
    const existing = await pool.query('SELECT id FROM employees WHERE id = $1', [parseInt(id)]);
    if (existing.rowCount === 0) {
      return res.status(404).json({ success: false, error: 'الموظف غير موجود' });
    }

    // إعادة حساب تاريخ الاستحقاق إذا تغير تاريخ التعيين أو التسوية
    let computedAllowanceDueDate = allowance_due_date;
    if (!computedAllowanceDueDate && start_date) {
      computedAllowanceDueDate = calculateAllowanceDueDate(start_date, settlement_date || null);
    }

    const result = await pool.query(
      `UPDATE employees SET
        emp_number = COALESCE($1, emp_number),
        national_id = COALESCE($2, national_id),
        full_name = COALESCE($3, full_name),
        gender = COALESCE($4, gender),
        birth_date = COALESCE($5, birth_date),
        education_level = COALESCE($6, education_level),
        job_title = COALESCE($7, job_title),
        department_id = COALESCE($8, department_id),
        contract_type = COALESCE($9, contract_type),
        start_date = COALESCE($10, start_date),
        grade_level = COALESCE($11, grade_level),
        grade_allowance_count = COALESCE($12, grade_allowance_count),
        allowance_due_date = COALESCE($13, allowance_due_date),
        settlement_date = COALESCE($14, settlement_date),
        settlement_type = COALESCE($15, settlement_type),
        work_start_time = COALESCE($16, work_start_time),
        work_end_time = COALESCE($17, work_end_time),
        no_fingerprint = COALESCE($18, no_fingerprint),
        leave_balance = COALESCE($19, leave_balance),
        status = COALESCE($20, status),
        notes = COALESCE($21, notes),
        updated_at = NOW()
      WHERE id = $22
      RETURNING *`,
      [
        emp_number || null, national_id || null, full_name || null,
        gender || null, birth_date || null, education_level || null,
        job_title || null,
        department_id !== undefined ? parseInt(department_id) : null,
        contract_type || null, start_date || null,
        grade_level !== undefined ? parseInt(grade_level) : null,
        grade_allowance_count !== undefined ? parseInt(grade_allowance_count) : null,
        computedAllowanceDueDate || null, settlement_date || null,
        settlement_type || null, work_start_time || null,
        work_end_time || null,
        no_fingerprint !== undefined ? (no_fingerprint === true || no_fingerprint === 'true') : null,
        leave_balance !== undefined ? parseInt(leave_balance) : null,
        status || null, notes || null,
        parseInt(id)
      ]
    );

    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/employees/:id - حذف ناعم (تعليق الحساب)
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `UPDATE employees SET status = 'suspended', updated_at = NOW()
       WHERE id = $1 RETURNING id, full_name, status`,
      [parseInt(id)]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, error: 'الموظف غير موجود' });
    }
    res.json({ success: true, data: result.rows[0], message: 'تم تعليق حساب الموظف' });
  } catch (err) {
    next(err);
  }
});

// GET /api/employees/:id/leaves - إجازات الموظف
router.get('/:id/leaves', async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT * FROM leaves WHERE employee_id = $1 ORDER BY created_at DESC`,
      [parseInt(id)]
    );
    res.json({ success: true, data: result.rows, total: result.rowCount });
  } catch (err) {
    next(err);
  }
});

// GET /api/employees/:id/documents - وثائق الموظف
router.get('/:id/documents', async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT * FROM documents WHERE employee_id = $1 ORDER BY created_at DESC`,
      [parseInt(id)]
    );
    res.json({ success: true, data: result.rows, total: result.rowCount });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
