const router = require('express').Router();
const { pool } = require('../db/pool');
const { authMiddleware } = require('../middleware/auth');

router.use(authMiddleware);

// Get all employees
router.get('/', async (req, res) => {
  try {
    const { dept, status, q } = req.query;
    let sql = 'SELECT * FROM employees WHERE 1=1';
    const params = [];
    if (dept) { params.push(dept); sql += ` AND department = $${params.length}`; }
    if (status) { params.push(status); sql += ` AND emp_status = $${params.length}`; }
    if (q) { params.push(`%${q}%`); sql += ` AND (full_name ILIKE $${params.length} OR job_id ILIKE $${params.length} OR job_title ILIKE $${params.length})`; }
    sql += ' ORDER BY full_name';
    const result = await pool.query(sql, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'خطأ في جلب بيانات الموظفين' });
  }
});

// Get single employee
router.get('/:jobId', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM employees WHERE job_id = $1', [req.params.jobId]);
    if (!result.rows[0]) return res.status(404).json({ error: 'الموظف غير موجود' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'خطأ في الخادم' });
  }
});

// Create employee
router.post('/', async (req, res) => {
  try {
    const {
      job_id, full_name, national_id, leave_balance, qualification, job_title,
      department, section, direct_manager, hire_date, grade, work_location,
      contract_type, emp_status, due_date, current_salary, admin_notes
    } = req.body;
    if (!job_id || !full_name) return res.status(400).json({ error: 'الاسم والرقم الوظيفي مطلوبان' });
    const result = await pool.query(`
      INSERT INTO employees (job_id, full_name, national_id, leave_balance, qualification, job_title,
        department, section, direct_manager, hire_date, grade, work_location, contract_type,
        emp_status, due_date, current_salary, admin_notes)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)
      RETURNING *`,
      [job_id, full_name, national_id, leave_balance || 30, qualification, job_title,
       department, section, direct_manager, hire_date || null, grade, work_location,
       contract_type || 'تعيين رسمي', emp_status || 'مستمر', due_date || null, current_salary || null, admin_notes]
    );
    res.json({ message: 'تم إضافة الموظف بنجاح', employee: result.rows[0] });
  } catch (err) {
    if (err.code === '23505') return res.status(400).json({ error: 'الرقم الوظيفي مستخدم مسبقاً' });
    console.error(err);
    res.status(500).json({ error: 'خطأ في حفظ بيانات الموظف' });
  }
});

// Update employee
router.put('/:jobId', async (req, res) => {
  try {
    const {
      full_name, national_id, leave_balance, qualification, job_title, department,
      section, direct_manager, hire_date, grade, work_location, contract_type,
      emp_status, due_date, current_salary, admin_notes
    } = req.body;
    const result = await pool.query(`
      UPDATE employees SET
        full_name=$1, national_id=$2, leave_balance=$3, qualification=$4, job_title=$5,
        department=$6, section=$7, direct_manager=$8, hire_date=$9, grade=$10,
        work_location=$11, contract_type=$12, emp_status=$13, due_date=$14,
        current_salary=$15, admin_notes=$16, updated_at=NOW()
      WHERE job_id=$17 RETURNING *`,
      [full_name, national_id, leave_balance, qualification, job_title, department,
       section, direct_manager, hire_date || null, grade, work_location, contract_type,
       emp_status, due_date || null, current_salary || null, admin_notes, req.params.jobId]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'الموظف غير موجود' });
    res.json({ message: 'تم تحديث بيانات الموظف', employee: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'خطأ في تحديث بيانات الموظف' });
  }
});

// Delete employee
router.delete('/:jobId', async (req, res) => {
  try {
    await pool.query('DELETE FROM employees WHERE job_id = $1', [req.params.jobId]);
    res.json({ message: 'تم حذف الموظف' });
  } catch (err) {
    res.status(500).json({ error: 'خطأ في حذف الموظف' });
  }
});

// Get departments list
router.get('/meta/departments', async (req, res) => {
  try {
    const result = await pool.query('SELECT DISTINCT department FROM employees WHERE department IS NOT NULL ORDER BY department');
    res.json(result.rows.map(r => r.department));
  } catch (err) {
    res.status(500).json({ error: 'خطأ' });
  }
});

module.exports = router;
