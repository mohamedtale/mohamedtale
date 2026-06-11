const router = require('express').Router();
const db = require('../db');

// إحصائيات لوحة التحكم
router.get('/dashboard-stats', async (req, res, next) => {
  try {
    const [emps, leaves, perms, promos] = await Promise.all([
      db.query("SELECT COUNT(*) FROM employees WHERE status='active'"),
      db.query("SELECT COUNT(*) FROM leaves WHERE status='pending'"),
      db.query("SELECT COUNT(*) FROM exit_permissions WHERE status='pending'"),
      db.query(`SELECT COUNT(*) FROM employees WHERE status='active' AND
        ((grade_level=10 AND grade_allowance_count>=5) OR
         (grade_level!=10 AND grade_allowance_count>=4))`),
    ]);
    res.json({
      success: true,
      data: {
        total_employees:     parseInt(emps.rows[0].count),
        pending_leaves:      parseInt(leaves.rows[0].count),
        pending_permissions: parseInt(perms.rows[0].count),
        eligible_promotions: parseInt(promos.rows[0].count),
      }
    });
  } catch (e) { next(e); }
});

// كشف الموظفين للطباعة
router.get('/staff-roster', async (req, res, next) => {
  try {
    const { rows } = await db.query(`
      SELECT e.*, d.name AS department_name, d.type AS department_type, d.parent_id
      FROM employees e LEFT JOIN departments d ON e.department_id=d.id
      WHERE e.status != 'deleted' ORDER BY d.sort_order, e.full_name`
    );
    res.json({ success: true, data: rows });
  } catch (e) { next(e); }
});

// كشف المتغيرات الشهرية
router.get('/changes/:year/:month', async (req, res, next) => {
  const { year, month } = req.params;
  try {
    const { rows } = await db.query(`
      SELECT e.emp_number, e.full_name, e.national_id, e.job_title,
             d.name AS department_name
      FROM employees e LEFT JOIN departments d ON e.department_id=d.id
      WHERE e.status='active'
        AND EXTRACT(YEAR FROM e.allowance_due_date)=$1
        AND EXTRACT(MONTH FROM e.allowance_due_date)=$2
      ORDER BY e.emp_number`, [year, month]
    );
    res.json({ success: true, data: rows });
  } catch (e) { next(e); }
});

// كشف العلاوات للطباعة
router.get('/allowances/:year/:month', async (req, res, next) => {
  const { year, month } = req.params;
  try {
    const existing = await db.query(
      'SELECT * FROM monthly_allowance_rosters WHERE year=$1 AND month=$2', [year, month]
    );
    if (existing.rows[0]) {
      const items = await db.query(
        `SELECT ri.*, e.full_name, e.emp_number FROM monthly_allowance_roster_items ri
         JOIN employees e ON ri.employee_id=e.id WHERE ri.roster_id=$1 ORDER BY e.emp_number`,
        [existing.rows[0].id]
      );
      return res.json({ success:true, data: items.rows, roster: existing.rows[0] });
    }
    res.json({ success: true, data: [], roster: null });
  } catch (e) { next(e); }
});

module.exports = router;
