const express = require('express');
const bcrypt = require('bcryptjs');
const { query } = require('../config/database');
const { authenticate } = require('../middleware/auth');
const { requireRole, requireMinRole } = require('../middleware/rbac');

const router = express.Router();

// GET /api/users
router.get('/', authenticate, requireMinRole('department_manager'), async (req, res) => {
  try {
    const result = await query(
      `SELECT id, username, email, full_name_ar, full_name_en, role, section, is_active, last_login, created_at
       FROM users ORDER BY created_at DESC`
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/users/:id
router.get('/:id', authenticate, async (req, res) => {
  try {
    // Users can only see their own profile unless they're admin/manager
    const userLevel = { system_admin: 4, department_manager: 3, section_head: 2, employee: 1 };
    if (req.user.id !== req.params.id && userLevel[req.user.role] < 3) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const result = await query(
      `SELECT id, username, email, full_name_ar, full_name_en, role, section, is_active, last_login, created_at
       FROM users WHERE id = $1`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/users - Create user (admin only)
router.post('/', authenticate, requireRole('system_admin'), async (req, res) => {
  try {
    const { username, email, password, full_name_ar, full_name_en, role, section } = req.body;

    if (!username || !email || !password || !full_name_ar || !role) {
      return res.status(400).json({ error: 'Required fields missing', message_ar: 'الحقول المطلوبة مفقودة' });
    }

    const validRoles = ['system_admin', 'department_manager', 'section_head', 'employee'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: 'Invalid role', message_ar: 'الدور غير صالح' });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const result = await query(
      `INSERT INTO users (username, email, password_hash, full_name_ar, full_name_en, role, section)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id, username, email, full_name_ar, full_name_en, role, section, is_active, created_at`,
      [username, email, passwordHash, full_name_ar, full_name_en || null, role, section || null]
    );

    try {
      await query(
        'INSERT INTO audit_logs (user_id, action, entity_type, entity_id) VALUES ($1,$2,$3,$4)',
        [req.user.id, 'create_user', 'user', result.rows[0].id]
      );
    } catch (e) {}

    res.status(201).json(result.rows[0]);
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ error: 'Username or email already exists', message_ar: 'اسم المستخدم أو البريد الإلكتروني مستخدم بالفعل' });
    }
    console.error('Create user error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/users/:id
router.put('/:id', authenticate, requireMinRole('department_manager'), async (req, res) => {
  try {
    const { full_name_ar, full_name_en, role, section, is_active } = req.body;

    const result = await query(
      `UPDATE users SET
        full_name_ar = COALESCE($1, full_name_ar),
        full_name_en = COALESCE($2, full_name_en),
        role = COALESCE($3, role),
        section = COALESCE($4, section),
        is_active = COALESCE($5, is_active),
        updated_at = NOW()
       WHERE id = $6
       RETURNING id, username, email, full_name_ar, full_name_en, role, section, is_active`,
      [full_name_ar || null, full_name_en || null, role || null, section || null, is_active, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/users/:id
router.delete('/:id', authenticate, requireRole('system_admin'), async (req, res) => {
  try {
    if (req.user.id === req.params.id) {
      return res.status(400).json({ error: 'Cannot delete yourself', message_ar: 'لا يمكنك حذف حسابك الخاص' });
    }
    await query('UPDATE users SET is_active = false WHERE id = $1', [req.params.id]);
    res.json({ success: true, message_ar: 'تم تعطيل المستخدم بنجاح' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
