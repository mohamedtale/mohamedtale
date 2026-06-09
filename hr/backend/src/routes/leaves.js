const router = require('express').Router();
const { pool } = require('../db/pool');
const { authMiddleware } = require('../middleware/auth');

router.use(authMiddleware);

// Get all leaves with optional filters
router.get('/', async (req, res) => {
  try {
    const { status, job_id, from, to, type } = req.query;
    let sql = `SELECT l.*, e.full_name, e.department, e.job_title
               FROM leaves l LEFT JOIN employees e ON l.employee_id = e.id WHERE 1=1`;
    const params = [];
    if (status) { params.push(status); sql += ` AND l.status = $${params.length}`; }
    if (job_id) { params.push(job_id); sql += ` AND l.job_id = $${params.length}`; }
    if (from) { params.push(from); sql += ` AND l.start_date >= $${params.length}`; }
    if (to) { params.push(to); sql += ` AND l.end_date <= $${params.length}`; }
    if (type) { params.push(type); sql += ` AND l.leave_type = $${params.length}`; }
    sql += ' ORDER BY l.created_at DESC';
    const result = await pool.query(sql, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'خطأ في جلب بيانات الإجازات' });
  }
});

// Get employees currently on leave
router.get('/on-leave', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const result = await pool.query(`
      SELECT l.*, e.full_name, e.department
      FROM leaves l LEFT JOIN employees e ON l.employee_id = e.id
      WHERE l.status = 'مقبول' AND l.start_date <= $1 AND l.end_date >= $1
      ORDER BY l.end_date`, [today]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'خطأ' });
  }
});

// Submit leave request
router.post('/', async (req, res) => {
  try {
    const { job_id, leave_type, start_date, end_date, days_count, reason } = req.body;
    if (!job_id || !leave_type || !start_date || !end_date) {
      return res.status(400).json({ error: 'جميع الحقول المطلوبة يجب ملؤها' });
    }
    const emp = await pool.query('SELECT * FROM employees WHERE job_id = $1', [job_id]);
    if (!emp.rows[0]) return res.status(404).json({ error: 'الموظف غير موجود' });
    const result = await pool.query(`
      INSERT INTO leaves (employee_id, job_id, leave_type, start_date, end_date, days_count, reason)
      VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [emp.rows[0].id, job_id, leave_type, start_date, end_date, days_count, reason]
    );
    res.json({ message: 'تم تقديم طلب الإجازة', leave: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'خطأ في حفظ طلب الإجازة' });
  }
});

// Decide on leave (approve/reject)
router.put('/:id/decide', async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { decision, note } = req.body;
    const leaveResult = await client.query('SELECT * FROM leaves WHERE id = $1', [req.params.id]);
    const leave = leaveResult.rows[0];
    if (!leave) return res.status(404).json({ error: 'الطلب غير موجود' });

    await client.query(`
      UPDATE leaves SET status=$1, decision_note=$2, decided_by=$3, decided_at=NOW()
      WHERE id=$4`, [decision, note, req.user.full_name, req.params.id]);

    if (decision === 'مقبول' && leave.leave_type === 'سنوية') {
      await client.query(
        'UPDATE employees SET leave_balance = leave_balance - $1 WHERE id = $2',
        [leave.days_count, leave.employee_id]
      );
    }
    await client.query('COMMIT');
    res.json({ message: `تم ${decision === 'مقبول' ? 'قبول' : 'رفض'} الطلب` });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'خطأ في معالجة الطلب' });
  } finally {
    client.release();
  }
});

module.exports = router;
