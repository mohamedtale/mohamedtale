const router = require('express').Router();
const db = require('../db');

// قائمة الحضور
router.get('/', async (req, res, next) => {
  const { employee_id, from, to, status } = req.query;
  let q = `SELECT a.*, e.full_name, e.emp_number FROM attendance a
           JOIN employees e ON a.employee_id=e.id WHERE 1=1`;
  const params = [];
  if (employee_id) { params.push(employee_id); q += ` AND a.employee_id=$${params.length}`; }
  if (from)        { params.push(from);        q += ` AND a.attendance_date>=$${params.length}`; }
  if (to)          { params.push(to);          q += ` AND a.attendance_date<=$${params.length}`; }
  if (status)      { params.push(status);      q += ` AND a.status=$${params.length}`; }
  q += ' ORDER BY a.attendance_date DESC, e.full_name';
  try {
    const { rows } = await db.query(q, params);
    res.json({ success: true, data: rows });
  } catch (e) { next(e); }
});

// إضافة بصمة (تطبيق قاعدة الظهر)
router.post('/fingerprint', async (req, res, next) => {
  const { employee_id, attendance_date, time } = req.body;
  try {
    const hour = parseInt(time.split(':')[0]);
    const isEntry = hour < 12;

    const existing = await db.query(
      'SELECT * FROM attendance WHERE employee_id=$1 AND attendance_date=$2',
      [employee_id, attendance_date]
    );

    if (existing.rows[0]) {
      // تحديث السجل الموجود
      const field = isEntry ? 'entry_time' : 'exit_time';
      await db.query(
        `UPDATE attendance SET ${field}=$1 WHERE employee_id=$2 AND attendance_date=$3`,
        [time, employee_id, attendance_date]
      );
    } else {
      // سجل جديد
      const entry = isEntry ? time : null;
      const exit  = isEntry ? null : time;
      await db.query(
        `INSERT INTO attendance (employee_id,attendance_date,entry_time,exit_time,status)
         VALUES ($1,$2,$3,$4,'present')`,
        [employee_id, attendance_date, entry, exit]
      );
    }
    res.json({ success: true });
  } catch (e) { next(e); }
});

// تقرير شهري
router.get('/report/:year/:month', async (req, res, next) => {
  const { year, month } = req.params;
  try {
    const { rows } = await db.query(`
      SELECT e.emp_number, e.full_name, e.department_id,
             COUNT(CASE WHEN a.status='present' THEN 1 END) AS present_days,
             COUNT(CASE WHEN a.status='absent'  THEN 1 END) AS absent_days,
             COUNT(CASE WHEN a.status='late'    THEN 1 END) AS late_days
      FROM employees e
      LEFT JOIN attendance a ON e.id=a.employee_id
        AND EXTRACT(YEAR FROM a.attendance_date)=$1
        AND EXTRACT(MONTH FROM a.attendance_date)=$2
      WHERE e.status='active' AND e.no_fingerprint=false
      GROUP BY e.id ORDER BY e.full_name`,
      [year, month]
    );
    res.json({ success: true, data: rows });
  } catch (e) { next(e); }
});

// غائبو يوم معين
router.get('/absent/:date', async (req, res, next) => {
  try {
    const { rows } = await db.query(`
      SELECT e.emp_number, e.full_name, e.job_title FROM employees e
      WHERE e.status='active' AND e.no_fingerprint=false
        AND e.id NOT IN (
          SELECT employee_id FROM attendance WHERE attendance_date=$1 AND status='present'
        )`, [req.params.date]
    );
    res.json({ success: true, data: rows });
  } catch (e) { next(e); }
});

module.exports = router;
