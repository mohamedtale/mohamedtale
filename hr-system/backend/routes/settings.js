const router = require('express').Router();
const db = require('../db');

router.get('/', async (req, res, next) => {
  try {
    const { rows } = await db.query('SELECT * FROM settings');
    const settings = {};
    rows.forEach(r => {
      try { settings[r.key] = JSON.parse(r.value); }
      catch { settings[r.key] = r.value; }
    });
    res.json({ success: true, data: settings });
  } catch (e) { next(e); }
});

router.put('/', async (req, res, next) => {
  const entries = Object.entries(req.body);
  try {
    for (const [key, value] of entries) {
      const val = typeof value === 'object' ? JSON.stringify(value) : String(value);
      await db.query(
        `INSERT INTO settings (key,value,updated_at) VALUES ($1,$2,NOW())
         ON CONFLICT (key) DO UPDATE SET value=$2, updated_at=NOW()`,
        [key, val]
      );
    }
    res.json({ success: true });
  } catch (e) { next(e); }
});

module.exports = router;
