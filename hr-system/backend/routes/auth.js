const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db');
const { loginLimiter, recordFail, isLocked, resetFails } = require('../middleware/rateLimiter');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES = '8h';

// POST /api/auth/login
router.post('/login', loginLimiter, async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password || typeof username !== 'string' || typeof password !== 'string') {
    return res.status(400).json({ error: 'يرجى إدخال اسم المستخدم وكلمة المرور' });
  }

  const cleanUsername = username.trim().toLowerCase().slice(0, 60);

  // Check lockout
  if (isLocked(cleanUsername)) {
    return res.status(429).json({ error: 'الحساب مقفل مؤقتاً بسبب محاولات دخول متعددة. يرجى الانتظار 20 دقيقة.' });
  }

  try {
    const result = await pool.query(
      'SELECT id, username, password_hash, full_name, role, is_active FROM users WHERE LOWER(username) = $1',
      [cleanUsername]
    );
    const user = result.rows[0];

    // Always compare hash even if user not found (prevents timing attack)
    const dummyHash = '$2a$10$abcdefghijklmnopqrstuuABCDEFGHIJKLMNOPQRSTUVWXYZ01234';
    const hashToCompare = user ? user.password_hash : dummyHash;
    const valid = await bcrypt.compare(password, hashToCompare);

    if (!user || !valid || !user.is_active) {
      recordFail(cleanUsername);
      return res.status(401).json({ error: 'اسم المستخدم أو كلمة المرور غير صحيحة' });
    }

    resetFails(cleanUsername);

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES, algorithm: 'HS256' }
    );

    res.json({
      token,
      user: { id: user.id, username: user.username, full_name: user.full_name, role: user.role }
    });
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ error: 'خطأ في الخادم' });
  }
});

// POST /api/auth/logout  (client clears token; server logs the event)
router.post('/logout', authMiddleware, (req, res) => {
  res.json({ message: 'تم تسجيل الخروج بنجاح' });
});

// GET /api/auth/me
router.get('/me', authMiddleware, (req, res) => {
  res.json({ user: req.user });
});

module.exports = router;
