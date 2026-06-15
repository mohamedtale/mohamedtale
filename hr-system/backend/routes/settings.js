const router = require('express').Router();
const db = require('../db');
const requireRole = require('../middleware/rbac');

// Only these keys can be read/written
const ALLOWED_KEYS = new Set([
  'org_name', 'org_name_en', 'working_hours_start', 'working_hours_end',
  'working_days', 'annual_leave_days', 'sick_leave_days', 'emergency_leave_max',
  'permission_max_per_month', 'fingerprint_noon_split', 'transport_allowance_amount',
  'promotion_allowances_required', 'promotion_allowances_grade10',
  'fiscal_year_start', 'timezone',
]);

router.get('/', async (req, res, next) => {
  try {
    const { rows } = await db.query('SELECT key, value FROM settings WHERE key = ANY($1)', [
      [...ALLOWED_KEYS],
    ]);
    const settings = {};
    rows.forEach(r => {
      try { settings[r.key] = JSON.parse(r.value); } catch { settings[r.key] = r.value; }
    });
    res.json({ success: true, data: settings });
  } catch (e) { next(e); }
});

// Only admins may change settings
router.put('/', requireRole('admin'), async (req, res, next) => {
  const entries = Object.entries(req.body).filter(([key]) => ALLOWED_KEYS.has(key));
  if (entries.length === 0) {
    return res.status(400).json({ success: false, error: 'لا توجد مفاتيح صالحة للتحديث' });
  }
  try {
    for (const [key, value] of entries) {
      const val = typeof value === 'object' ? JSON.stringify(value) : String(value).slice(0, 500);
      await db.query(
        `INSERT INTO settings (key, value, updated_at) VALUES ($1, $2, NOW())
         ON CONFLICT (key) DO UPDATE SET value = $2, updated_at = NOW()`,
        [key, val]
      );
    }
    res.json({ success: true });
  } catch (e) { next(e); }
});

module.exports = router;
