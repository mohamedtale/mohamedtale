const router = require('express').Router();
const db = require('../db');

function isEligibleForPromotion(gradeLevel, allowanceCount) {
  const threshold = parseInt(gradeLevel) === 10 ? 5 : 4;
  return parseInt(allowanceCount) >= threshold;
}

// توليد كشف العلاوات لشهر معين
router.get('/roster/:year/:month', async (req, res, next) => {
  const { year, month } = req.params;
  try {
    // هل يوجد كشف محفوظ؟
    const existing = await db.query(
      'SELECT * FROM monthly_allowance_rosters WHERE year=$1 AND month=$2',
      [year, month]
    );

    if (existing.rows[0]) {
      const items = await db.query(
        `SELECT ri.*, e.full_name, e.emp_number FROM monthly_allowance_roster_items ri
         JOIN employees e ON ri.employee_id=e.id WHERE ri.roster_id=$1`,
        [existing.rows[0].id]
      );
      return res.json({ success:true, roster: existing.rows[0], data: items.rows });
    }

    // توليد جديد: الموظفون الذين استحقوا علاوتهم هذا الشهر
    const { rows } = await db.query(`
      SELECT e.* FROM employees e
      WHERE e.status='active'
        AND EXTRACT(YEAR FROM e.allowance_due_date)=$1
        AND EXTRACT(MONTH FROM e.allowance_due_date)=$2
      ORDER BY e.full_name`,
      [year, month]
    );

    const data = rows.map(e => ({
      employee_id:       e.id,
      emp_number:        e.emp_number,
      full_name:         e.full_name,
      grade_before:      e.grade_level,
      allowance_before:  e.grade_allowance_count,
      grade_after:       e.grade_level,
      allowance_after:   e.grade_allowance_count + 1,
      promotion_eligible: isEligibleForPromotion(e.grade_level, e.grade_allowance_count + 1),
      notes: ''
    }));

    res.json({ success:true, roster: null, data });
  } catch (e) { next(e); }
});

// اعتماد الكشف الشهري
router.post('/roster/:year/:month/approve', async (req, res, next) => {
  const { year, month } = req.params;
  const { items } = req.body;
  try {
    // إنشاء الكشف
    const roster = await db.query(
      `INSERT INTO monthly_allowance_rosters (year,month,status,approved_at)
       VALUES ($1,$2,'approved',NOW()) RETURNING *`,
      [year, month]
    );
    const rosterId = roster.rows[0].id;

    for (const item of items) {
      // حفظ عنصر الكشف
      await db.query(
        `INSERT INTO monthly_allowance_roster_items
           (roster_id,employee_id,grade_before,allowance_before,grade_after,allowance_after,promotion_eligible,notes)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
        [rosterId, item.employee_id, item.grade_before, item.allowance_before,
         item.grade_after, item.allowance_after, item.promotion_eligible, item.notes||'']
      );
      // تحديث درجة الموظف + تاريخ الاستحقاق القادم
      const emp = await db.query('SELECT * FROM employees WHERE id=$1', [item.employee_id]);
      const e = emp.rows[0];
      const newDueDate = new Date(e.allowance_due_date);
      newDueDate.setFullYear(newDueDate.getFullYear() + 1);
      await db.query(
        `UPDATE employees SET grade_allowance_count=$1, allowance_due_date=$2, updated_at=NOW()
         WHERE id=$3`,
        [item.allowance_after, newDueDate, item.employee_id]
      );
    }
    res.json({ success: true, roster_id: rosterId });
  } catch (e) { next(e); }
});

// سجل الكشوفات السابقة
router.get('/roster/history/all', async (req, res, next) => {
  try {
    const { rows } = await db.query(
      'SELECT * FROM monthly_allowance_rosters ORDER BY year DESC, month DESC'
    );
    res.json({ success: true, data: rows });
  } catch (e) { next(e); }
});

// المرشحون للترقية
router.get('/eligible-promotions', async (req, res, next) => {
  try {
    const { rows } = await db.query(`
      SELECT e.*, d.name AS department_name FROM employees e
      LEFT JOIN departments d ON e.department_id=d.id
      WHERE e.status='active'
        AND (
          (e.grade_level=10 AND e.grade_allowance_count>=5) OR
          (e.grade_level!=10 AND e.grade_allowance_count>=4)
        )
      ORDER BY e.full_name`
    );
    res.json({ success: true, data: rows });
  } catch (e) { next(e); }
});

// تطبيق ترقية على موظف
router.post('/promote/:employee_id', async (req, res, next) => {
  const { new_grade, decision_number, decision_date } = req.body;
  try {
    const emp = await db.query('SELECT * FROM employees WHERE id=$1', [req.params.employee_id]);
    const e = emp.rows[0];
    // إعادة حساب تاريخ الاستحقاق من تاريخ الترقية
    const baseDate = new Date(decision_date);
    const day = baseDate.getDate();
    let m = baseDate.getMonth();
    let y = baseDate.getFullYear() + 1;
    if (day >= 3) { m += 1; if (m > 11) { m = 0; y++; } }
    const newDueDate = new Date(y, m, 1);

    await db.query(
      `UPDATE employees SET grade_level=$1, grade_allowance_count=0,
       allowance_due_date=$2, updated_at=NOW() WHERE id=$3`,
      [new_grade, newDueDate, req.params.employee_id]
    );
    // حفظ قرار الترقية
    await db.query(
      `INSERT INTO decisions (employee_id, decision_type, decision_number, decision_date, description)
       VALUES ($1,'promotion',$2,$3,$4)`,
      [req.params.employee_id, decision_number, decision_date,
       `ترقية من الدرجة ${e.grade_level} إلى الدرجة ${new_grade}`]
    );
    res.json({ success: true });
  } catch (e) { next(e); }
});

module.exports = router;
