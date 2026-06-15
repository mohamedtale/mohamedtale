const router = require('express').Router();
const { pool } = require('../db/pool');
const { authMiddleware } = require('../middleware/auth');

router.use(authMiddleware);

// Get attendance records
router.get('/', async (req, res) => {
  try {
    const { from, to, job_id, dept } = req.query;
    let sql = `SELECT a.*, e.full_name, e.department
               FROM attendance a LEFT JOIN employees e ON a.employee_id = e.id WHERE 1=1`;
    const params = [];
    if (from) { params.push(from); sql += ` AND a.att_date >= $${params.length}`; }
    if (to) { params.push(to); sql += ` AND a.att_date <= $${params.length}`; }
    if (job_id) { params.push(job_id); sql += ` AND a.job_id = $${params.length}`; }
    if (dept) { params.push(`%${dept}%`); sql += ` AND e.department ILIKE $${params.length}`; }
    sql += ' ORDER BY a.att_date DESC, e.full_name LIMIT 1000';
    const result = await pool.query(sql, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'خطأ في جلب بيانات الحضور' });
  }
});

// Import attendance records from Excel
router.post('/import', async (req, res) => {
  const { rows } = req.body;
  if (!rows || !rows.length) return res.status(400).json({ error: 'لا توجد بيانات للاستيراد' });

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    let imported = 0, skipped = 0;
    for (const row of rows) {
      if (!row.job_id || !row.date) { skipped++; continue; }
      const emp = await client.query('SELECT id FROM employees WHERE job_id = $1', [row.job_id]);
      if (!emp.rows[0]) { skipped++; continue; }

      let hours = null;
      if (row.check_in && row.check_out) {
        const [inH, inM] = row.check_in.split(':').map(Number);
        const [outH, outM] = row.check_out.split(':').map(Number);
        hours = ((outH * 60 + outM) - (inH * 60 + inM)) / 60;
        if (hours < 0) hours = null;
      }

      await client.query(`
        INSERT INTO attendance (employee_id, job_id, att_date, check_in, check_out, status, total_hours)
        VALUES ($1,$2,$3,$4,$5,$6,$7)
        ON CONFLICT (job_id, att_date) DO UPDATE SET
          check_in=EXCLUDED.check_in, check_out=EXCLUDED.check_out,
          status=EXCLUDED.status, total_hours=EXCLUDED.total_hours`,
        [emp.rows[0].id, row.job_id, row.date,
         row.check_in || null, row.check_out || null,
         row.status || 'حضر', hours]
      );
      imported++;
    }
    await client.query('COMMIT');
    res.json({ success: true, msg: `تم استيراد ${imported} سجل، تخطي ${skipped}` });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'خطأ في استيراد البيانات' });
  } finally {
    client.release();
  }
});

// Get attendance summary/report
router.get('/summary', async (req, res) => {
  try {
    const { from, to, job_id, dept } = req.query;
    let sql, params = [];

    if (job_id) {
      params = [job_id, from || '2000-01-01', to || '2099-12-31'];
      sql = `SELECT e.full_name, e.department, e.job_id,
               COUNT(CASE WHEN a.status='حضر' THEN 1 END) as present,
               COUNT(CASE WHEN a.status='غائب' THEN 1 END) as absent,
               COUNT(CASE WHEN a.status='إجازة' THEN 1 END) as on_leave,
               COUNT(CASE WHEN a.status='مأمورية' THEN 1 END) as mission,
               ROUND(COALESCE(SUM(a.total_hours),0)::numeric, 1) as total_hours,
               json_agg(json_build_object(
                 'date', a.att_date::text, 'check_in', a.check_in::text,
                 'check_out', a.check_out::text, 'status', a.status, 'hours', a.total_hours
               ) ORDER BY a.att_date) as details
             FROM employees e
             LEFT JOIN attendance a ON e.id = a.employee_id
               AND a.att_date BETWEEN $2 AND $3
             WHERE e.job_id = $1
             GROUP BY e.id, e.full_name, e.department, e.job_id`;
    } else {
      params = [from || '2000-01-01', to || '2099-12-31'];
      let deptFilter = '';
      if (dept) { params.push(`%${dept}%`); deptFilter = ` AND e.department ILIKE $${params.length}`; }
      sql = `SELECT e.full_name, e.department, e.job_id,
               COUNT(CASE WHEN a.status='حضر' THEN 1 END) as present,
               COUNT(CASE WHEN a.status='غائب' THEN 1 END) as absent,
               COUNT(CASE WHEN a.status='إجازة' THEN 1 END) as on_leave,
               COUNT(CASE WHEN a.status='مأمورية' THEN 1 END) as mission,
               ROUND(COALESCE(SUM(a.total_hours),0)::numeric, 1) as total_hours
             FROM employees e
             LEFT JOIN attendance a ON e.id = a.employee_id
               AND a.att_date BETWEEN $1 AND $2
             WHERE EXISTS (SELECT 1 FROM attendance a2 WHERE a2.employee_id = e.id AND a2.att_date BETWEEN $1 AND $2)
             ${deptFilter}
             GROUP BY e.id, e.full_name, e.department, e.job_id
             ORDER BY e.full_name`;
    }
    const result = await pool.query(sql, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'خطأ في جلب ملخص الحضور' });
  }
});

module.exports = router;
