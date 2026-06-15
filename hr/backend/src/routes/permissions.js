const router = require('express').Router();
const { pool } = require('../db/pool');
const { authMiddleware } = require('../middleware/auth');

router.use(authMiddleware);

router.get('/', async (req, res) => {
  try {
    const { from, to, job_id, type } = req.query;
    let sql = `SELECT ep.*, e.full_name, e.department
               FROM exit_permissions ep LEFT JOIN employees e ON ep.employee_id = e.id WHERE 1=1`;
    const params = [];
    if (from) { params.push(from); sql += ` AND ep.perm_date >= $${params.length}`; }
    if (to) { params.push(to); sql += ` AND ep.perm_date <= $${params.length}`; }
    if (job_id) { params.push(job_id); sql += ` AND ep.job_id = $${params.length}`; }
    if (type) { params.push(type); sql += ` AND ep.perm_type = $${params.length}`; }
    sql += ' ORDER BY ep.perm_date DESC, ep.created_at DESC LIMIT 500';
    const result = await pool.query(sql, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'خطأ في جلب الأذونات' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { job_id, perm_date, perm_type, check_out, check_in, notes } = req.body;
    if (!job_id || !perm_date) return res.status(400).json({ error: 'الرقم الوظيفي والتاريخ مطلوبان' });
    const emp = await pool.query('SELECT * FROM employees WHERE job_id = $1', [job_id]);
    if (!emp.rows[0]) return res.status(404).json({ error: 'الموظف غير موجود' });

    let duration = null;
    if (check_out && check_in) {
      const [outH, outM] = check_out.split(':').map(Number);
      const [inH, inM] = check_in.split(':').map(Number);
      duration = (inH * 60 + inM) - (outH * 60 + outM);
      if (duration < 0) duration = null;
    }

    await pool.query(`
      INSERT INTO exit_permissions (employee_id, job_id, perm_date, perm_type, check_out, check_in, duration_minutes, notes, recorded_by)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
      [emp.rows[0].id, job_id, perm_date, perm_type || 'شخصي',
       check_out || null, check_in || null, duration, notes, req.user.full_name]
    );
    res.json({ success: true, msg: 'تم حفظ الإذن بنجاح' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'خطأ في حفظ الإذن' });
  }
});

module.exports = router;
