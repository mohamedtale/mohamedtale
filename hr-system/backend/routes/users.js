const router = require('express').Router();
const db     = require('../db');
const bcrypt = require('bcryptjs');
const requireRole = require('../middleware/rbac');

// GET /api/users — admin only
router.get('/', requireRole('admin'), async (req, res, next) => {
  try {
    const { rows } = await db.query(
      `SELECT id, username, full_name, role, is_active, created_at FROM users ORDER BY id`
    );
    res.json({ success: true, data: rows });
  } catch (e) { next(e); }
});

// POST /api/users — admin only
router.post('/', requireRole('admin'), async (req, res, next) => {
  const { username, password, full_name, role } = req.body;
  if (!username || !password || !role) {
    return res.status(400).json({ success: false, error: 'بيانات ناقصة' });
  }
  const allowedRoles = ['admin', 'manager', 'staff'];
  if (!allowedRoles.includes(role)) {
    return res.status(400).json({ success: false, error: 'دور غير صالح' });
  }
  if (password.length < 8) {
    return res.status(400).json({ success: false, error: 'كلمة المرور يجب أن تكون 8 أحرف على الأقل' });
  }
  try {
    const hash = await bcrypt.hash(password, 12);
    const { rows } = await db.query(
      `INSERT INTO users (username, password_hash, full_name, role) VALUES ($1,$2,$3,$4)
       RETURNING id, username, full_name, role, is_active, created_at`,
      [username.trim().toLowerCase().slice(0, 60), hash, (full_name || '').slice(0, 255), role]
    );
    res.json({ success: true, data: rows[0] });
  } catch (e) {
    if (e.code === '23505') return res.status(409).json({ success: false, error: 'اسم المستخدم موجود مسبقاً' });
    next(e);
  }
});

// PUT /api/users/:id — admin only
router.put('/:id', requireRole('admin'), async (req, res, next) => {
  const id = parseInt(req.params.id, 10);
  const { full_name, role, is_active } = req.body;
  // Prevent admin from demoting/deactivating themselves
  if (id === req.user.id && (role !== 'admin' || is_active === false)) {
    return res.status(400).json({ success: false, error: 'لا يمكنك تغيير صلاحياتك أو تعطيل حسابك' });
  }
  try {
    const sets = [], params = [];
    if (full_name  !== undefined) { params.push((full_name||'').slice(0,255)); sets.push(`full_name=$${params.length}`); }
    if (role       !== undefined) { params.push(role);       sets.push(`role=$${params.length}`); }
    if (is_active  !== undefined) { params.push(is_active);  sets.push(`is_active=$${params.length}`); }
    if (!sets.length) return res.status(400).json({ success: false, error: 'لا توجد بيانات للتحديث' });
    params.push(id);
    const { rows } = await db.query(
      `UPDATE users SET ${sets.join(',')} WHERE id=$${params.length}
       RETURNING id, username, full_name, role, is_active`,
      params
    );
    if (!rows[0]) return res.status(404).json({ success: false, error: 'المستخدم غير موجود' });
    res.json({ success: true, data: rows[0] });
  } catch (e) { next(e); }
});

// PUT /api/users/:id/reset-password — admin only
router.put('/:id/reset-password', requireRole('admin'), async (req, res, next) => {
  const id = parseInt(req.params.id, 10);
  const { new_password } = req.body;
  if (!new_password || new_password.length < 8) {
    return res.status(400).json({ success: false, error: 'كلمة المرور يجب أن تكون 8 أحرف على الأقل' });
  }
  try {
    const hash = await bcrypt.hash(new_password, 12);
    await db.query('UPDATE users SET password_hash=$1 WHERE id=$2', [hash, id]);
    res.json({ success: true });
  } catch (e) { next(e); }
});

// PUT /api/users/change-password — any authenticated user (own password)
router.put('/change-password/me', async (req, res, next) => {
  const { current_password, new_password } = req.body;
  if (!current_password || !new_password || new_password.length < 8) {
    return res.status(400).json({ success: false, error: 'كلمة المرور الجديدة يجب أن تكون 8 أحرف على الأقل' });
  }
  try {
    const { rows } = await db.query('SELECT password_hash FROM users WHERE id=$1', [req.user.id]);
    if (!rows[0]) return res.status(404).json({ success: false, error: 'المستخدم غير موجود' });
    const valid = await bcrypt.compare(current_password, rows[0].password_hash);
    if (!valid) return res.status(401).json({ success: false, error: 'كلمة المرور الحالية غير صحيحة' });
    const hash = await bcrypt.hash(new_password, 12);
    await db.query('UPDATE users SET password_hash=$1 WHERE id=$2', [hash, req.user.id]);
    res.json({ success: true });
  } catch (e) { next(e); }
});

module.exports = router;
