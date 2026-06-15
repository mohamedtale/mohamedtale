const router = require('express').Router();
const db = require('../db');

router.get('/', async (req, res, next) => {
  const { employee_id, status, from, to } = req.query;
  let q = `SELECT p.*, e.full_name, e.emp_number FROM exit_permissions p
           JOIN employees e ON p.employee_id=e.id WHERE 1=1`;
  const params = [];
  if (employee_id) { params.push(employee_id); q += ` AND p.employee_id=$${params.length}`; }
  if (status)      { params.push(status);      q += ` AND p.status=$${params.length}`; }
  if (from)        { params.push(from);        q += ` AND p.permission_date>=$${params.length}`; }
  if (to)          { params.push(to);          q += ` AND p.permission_date<=$${params.length}`; }
  q += ' ORDER BY p.created_at DESC';
  try {
    const { rows } = await db.query(q, params);
    res.json({ success: true, data: rows });
  } catch (e) { next(e); }
});

router.post('/', async (req, res, next) => {
  const { employee_id, permission_date, reason, exit_time, return_time, duration_minutes } = req.body;
  try {
    // التحقق من الحد الأقصى (2 إذن شهرياً)
    const month = new Date(permission_date).getMonth() + 1;
    const year  = new Date(permission_date).getFullYear();
    const count = await db.query(
      `SELECT COUNT(*) FROM exit_permissions
       WHERE employee_id=$1 AND status='approved'
       AND EXTRACT(MONTH FROM permission_date)=$2 AND EXTRACT(YEAR FROM permission_date)=$3`,
      [employee_id, month, year]
    );
    const monthly_count = parseInt(count.rows[0].count) + 1;
    if (monthly_count > 2)
      return res.status(400).json({ success:false, message:'استُنفد الحد الأقصى (2 إذن شهرياً)' });

    const { rows } = await db.query(`
      INSERT INTO exit_permissions
        (employee_id,permission_date,reason,exit_time,return_time,duration_minutes,monthly_count)
      VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [employee_id,permission_date,reason,exit_time,return_time,duration_minutes,monthly_count]
    );
    res.json({ success: true, data: rows[0] });
  } catch (e) { next(e); }
});

router.put('/:id/approve', async (req, res, next) => {
  try {
    await db.query("UPDATE exit_permissions SET status='approved',updated_at=NOW() WHERE id=$1", [req.params.id]);
    res.json({ success: true });
  } catch (e) { next(e); }
});

router.put('/:id/reject', async (req, res, next) => {
  try {
    await db.query("UPDATE exit_permissions SET status='rejected',updated_at=NOW() WHERE id=$1", [req.params.id]);
    res.json({ success: true });
  } catch (e) { next(e); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    await db.query('DELETE FROM exit_permissions WHERE id=$1', [req.params.id]);
    res.json({ success: true });
  } catch (e) { next(e); }
});

module.exports = router;
