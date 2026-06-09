const router = require('express').Router();
const { pool } = require('../db/pool');
const { authMiddleware } = require('../middleware/auth');

router.use(authMiddleware);

// Dashboard stats
router.get('/dashboard', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const in30 = new Date(); in30.setDate(in30.getDate() + 30);
    const in30s = in30.toISOString().split('T')[0];

    const [total, active, onLeave, pending, totalDocs, expiring] = await Promise.all([
      pool.query('SELECT COUNT(*) FROM employees'),
      pool.query("SELECT COUNT(*) FROM employees WHERE emp_status = 'مستمر'"),
      pool.query("SELECT COUNT(*) FROM leaves WHERE status = 'مقبول' AND start_date <= $1 AND end_date >= $1", [today]),
      pool.query("SELECT COUNT(*) FROM leaves WHERE status = 'معلق'"),
      pool.query('SELECT COUNT(*) FROM documents'),
      pool.query('SELECT COUNT(*) FROM documents WHERE exp_date BETWEEN $1 AND $2', [today, in30s])
    ]);

    const deptStats = await pool.query(`
      SELECT department, COUNT(*) as count FROM employees
      WHERE department IS NOT NULL GROUP BY department ORDER BY count DESC LIMIT 10`);

    const statusStats = await pool.query(`
      SELECT emp_status, COUNT(*) as count FROM employees GROUP BY emp_status`);

    const recentDocs = await pool.query(`
      SELECT id, employee_name as emp, doc_type as type, file_name as name,
             to_char(created_at, 'YYYY-MM-DD') as date
      FROM documents ORDER BY created_at DESC LIMIT 5`);

    const expiringList = await pool.query(`
      SELECT employee_name as emp, doc_type as doc,
             (exp_date - CURRENT_DATE) as days
      FROM documents WHERE exp_date BETWEEN $1 AND $2
      ORDER BY exp_date LIMIT 10`, [today, in30s]);

    const deptData = {};
    deptStats.rows.forEach(r => { deptData[r.department] = parseInt(r.count); });
    const statusData = {};
    statusStats.rows.forEach(r => { statusData[r.emp_status] = parseInt(r.count); });

    res.json({
      total: parseInt(total.rows[0].count),
      active: parseInt(active.rows[0].count),
      onLeave: parseInt(onLeave.rows[0].count),
      pending: parseInt(pending.rows[0].count),
      totalDocs: parseInt(totalDocs.rows[0].count),
      expiring: parseInt(expiring.rows[0].count),
      deptStats: deptData,
      statusStats: statusData,
      recentDocs: recentDocs.rows,
      expiringList: expiringList.rows
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'خطأ في جلب الإحصائيات' });
  }
});

// General employees report
router.get('/employees', async (req, res) => {
  try {
    const { dept, job_title, status } = req.query;
    let sql = 'SELECT * FROM employees WHERE 1=1';
    const params = [];
    if (dept) { params.push(`%${dept}%`); sql += ` AND department ILIKE $${params.length}`; }
    if (job_title) { params.push(`%${job_title}%`); sql += ` AND job_title ILIKE $${params.length}`; }
    if (status) { params.push(status); sql += ` AND emp_status = $${params.length}`; }
    sql += ' ORDER BY department, full_name';
    const result = await pool.query(sql, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'خطأ في التقرير' });
  }
});

// Leaves quarterly report
router.get('/leaves', async (req, res) => {
  try {
    const { from, to, job_id, type } = req.query;
    if (job_id) {
      const emp = await pool.query('SELECT full_name FROM employees WHERE job_id=$1', [job_id]);
      let sql = `SELECT l.*, e.full_name FROM leaves l
                 LEFT JOIN employees e ON l.employee_id = e.id
                 WHERE l.job_id = $1`;
      const params = [job_id];
      if (from) { params.push(from); sql += ` AND l.start_date >= $${params.length}`; }
      if (to) { params.push(to); sql += ` AND l.end_date <= $${params.length}`; }
      if (type) { params.push(type); sql += ` AND l.leave_type = $${params.length}`; }
      sql += ' ORDER BY l.start_date';
      const result = await pool.query(sql, params);
      return res.json({ mode: 'detail', empName: emp.rows[0]?.full_name || job_id, data: result.rows });
    }

    let sql = `SELECT e.full_name, e.job_id,
                 COUNT(CASE WHEN l.leave_type='سنوية' THEN 1 END) as annual,
                 COUNT(CASE WHEN l.leave_type='مرضية' THEN 1 END) as sick,
                 COUNT(CASE WHEN l.leave_type='طارئة' THEN 1 END) as emergency,
                 COUNT(CASE WHEN l.leave_type NOT IN ('سنوية','مرضية','طارئة') THEN 1 END) as other,
                 COALESCE(SUM(l.days_count),0) as total
               FROM employees e
               LEFT JOIN leaves l ON e.id = l.employee_id AND l.status = 'مقبول'`;
    const params = [];
    const conditions = [];
    if (from) { params.push(from); conditions.push(`l.start_date >= $${params.length}`); }
    if (to) { params.push(to); conditions.push(`l.end_date <= $${params.length}`); }
    if (type) { params.push(type); conditions.push(`l.leave_type = $${params.length}`); }
    if (conditions.length) sql += ' AND ' + conditions.join(' AND ');
    sql += ' GROUP BY e.id, e.full_name, e.job_id HAVING COALESCE(SUM(l.days_count),0) > 0 ORDER BY total DESC';
    const result = await pool.query(sql, params);
    res.json({ mode: 'summary', data: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'خطأ في تقرير الإجازات' });
  }
});

// Employee 360 report
router.get('/employee360/:jobId', async (req, res) => {
  try {
    const { year } = req.query;
    const y = year || new Date().getFullYear();
    const jobId = req.params.jobId;

    const empResult = await pool.query('SELECT * FROM employees WHERE job_id = $1', [jobId]);
    if (!empResult.rows[0]) return res.status(404).json({ error: 'الموظف غير موجود' });
    const emp = empResult.rows[0];

    const [attResult, leavesResult, permsResult, docsResult] = await Promise.all([
      pool.query(`SELECT
          COUNT(CASE WHEN status='حضر' THEN 1 END) as present,
          COUNT(CASE WHEN status='غائب' THEN 1 END) as absent,
          ROUND(COALESCE(SUM(total_hours),0)::numeric,1) as total_hours
        FROM attendance WHERE job_id=$1 AND EXTRACT(YEAR FROM att_date)=$2`, [jobId, y]),
      pool.query(`SELECT * FROM leaves WHERE job_id=$1 AND EXTRACT(YEAR FROM start_date)=$2 ORDER BY start_date`, [jobId, y]),
      pool.query(`SELECT * FROM exit_permissions WHERE job_id=$1 AND EXTRACT(YEAR FROM perm_date)=$2 ORDER BY perm_date`, [jobId, y]),
      pool.query(`SELECT doc_type, file_name, created_at FROM documents WHERE job_id=$1 ORDER BY created_at DESC`, [jobId])
    ]);

    const att = attResult.rows[0];
    const totalLeaveDays = leavesResult.rows.filter(l => l.status === 'مقبول').reduce((s, l) => s + (l.days_count || 0), 0);
    const totalPermMinutes = permsResult.rows.reduce((s, p) => s + (p.duration_minutes || 0), 0);

    res.json({
      employee: emp,
      year: y,
      attendance: att,
      leaves: leavesResult.rows,
      permissions: permsResult.rows,
      documents: docsResult.rows,
      totalLeaveDays,
      totalPermMinutes
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'خطأ في تقرير الموظف' });
  }
});

module.exports = router;
