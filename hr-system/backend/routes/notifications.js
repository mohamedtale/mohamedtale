const router = require('express').Router();
const db = require('../db');

// GET /api/notifications — pending items for current user
router.get('/', async (req, res, next) => {
  try {
    const notes = [];
    const isManager = ['admin', 'manager'].includes(req.user.role);

    if (isManager) {
      // Pending leaves
      const leaves = await db.query(
        `SELECT COUNT(*) FROM leaves WHERE status='pending'`
      );
      const lc = parseInt(leaves.rows[0].count, 10);
      if (lc > 0) notes.push({ type: 'warning', icon: '📋', text: `${lc} طلب إجازة معلق بانتظار الموافقة`, link: '#/leaves' });

      // Pending permissions
      const perms = await db.query(
        `SELECT COUNT(*) FROM exit_permissions WHERE status='pending'`
      );
      const pc = parseInt(perms.rows[0].count, 10);
      if (pc > 0) notes.push({ type: 'warning', icon: '🚪', text: `${pc} طلب إذن خروج معلق`, link: '#/permissions' });

      // Eligible promotions
      const promo = await db.query(
        `SELECT COUNT(*) FROM allowances a
         JOIN employees e ON a.employee_id=e.id
         WHERE e.status='active' AND a.current_grade < 12
           AND (
             (a.current_grade = 10 AND a.allowances_count >= 5)
             OR (a.current_grade <> 10 AND a.allowances_count >= 4)
           )`
      );
      const prc = parseInt(promo.rows[0].count, 10);
      if (prc > 0) notes.push({ type: 'info', icon: '⭐', text: `${prc} موظف مستحق للترقية`, link: '#/allowances' });

      // Employees with expiring documents (next 30 days) — if doc_expiry exists
      // Skipped — schema doesn't have expiry field yet

      // Login failures in last 24h
      const fails = await db.query(
        `SELECT COUNT(*) FROM audit_logs
         WHERE action='LOGIN_FAIL' AND created_at > NOW() - INTERVAL '24 hours'`
      );
      const fc = parseInt(fails.rows[0].count, 10);
      if (fc >= 5) notes.push({ type: 'danger', icon: '🔴', text: `${fc} محاولة دخول فاشلة في آخر 24 ساعة`, link: '#/settings' });
    }

    res.json({ success: true, data: notes });
  } catch (e) { next(e); }
});

module.exports = router;
