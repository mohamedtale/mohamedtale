const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query } = require('../config/database');
const { generateTokens, JWT_SECRET, authenticate } = require('../middleware/auth');

const router = express.Router();

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required', message_ar: 'اسم المستخدم وكلمة المرور مطلوبان' });
    }

    const result = await query(
      'SELECT * FROM users WHERE (username = $1 OR email = $1) AND is_active = true',
      [username]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials', message_ar: 'بيانات الدخول غير صحيحة' });
    }

    const user = result.rows[0];
    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials', message_ar: 'بيانات الدخول غير صحيحة' });
    }

    // Update last login
    await query('UPDATE users SET last_login = NOW() WHERE id = $1', [user.id]);

    // Log the action
    try {
      await query(
        'INSERT INTO audit_logs (user_id, action, entity_type, ip_address) VALUES ($1, $2, $3, $4)',
        [user.id, 'login', 'user', req.ip]
      );
    } catch (e) { /* ignore audit log errors */ }

    const { accessToken, refreshToken } = generateTokens(user.id);
    const { password_hash, ...userWithoutPassword } = user;

    res.json({
      success: true,
      user: userWithoutPassword,
      accessToken,
      refreshToken,
      message_ar: 'تم تسجيل الدخول بنجاح'
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error', message_ar: 'خطأ في الخادم' });
  }
});

// POST /api/auth/logout
router.post('/logout', authenticate, async (req, res) => {
  try {
    await query(
      'INSERT INTO audit_logs (user_id, action, entity_type, ip_address) VALUES ($1, $2, $3, $4)',
      [req.user.id, 'logout', 'user', req.ip]
    );
  } catch (e) { /* ignore */ }
  res.json({ success: true, message_ar: 'تم تسجيل الخروج بنجاح' });
});

// POST /api/auth/refresh
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token required' });
    }

    const decoded = jwt.verify(refreshToken, JWT_SECRET);
    if (decoded.type !== 'refresh') {
      return res.status(401).json({ error: 'Invalid refresh token' });
    }

    const result = await query('SELECT * FROM users WHERE id = $1 AND is_active = true', [decoded.userId]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'User not found' });
    }

    const { accessToken, refreshToken: newRefreshToken } = generateTokens(decoded.userId);
    res.json({ accessToken, refreshToken: newRefreshToken });
  } catch (error) {
    res.status(401).json({ error: 'Invalid refresh token' });
  }
});

// GET /api/auth/me
router.get('/me', authenticate, async (req, res) => {
  const { password_hash, ...user } = req.user;
  res.json({ user });
});

// PUT /api/auth/change-password
router.put('/change-password', authenticate, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const isValid = await bcrypt.compare(currentPassword, req.user.password_hash);
    if (!isValid) {
      return res.status(400).json({ error: 'Current password is incorrect', message_ar: 'كلمة المرور الحالية غير صحيحة' });
    }

    const newHash = await bcrypt.hash(newPassword, 12);
    await query('UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2', [newHash, req.user.id]);

    res.json({ success: true, message_ar: 'تم تغيير كلمة المرور بنجاح' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
