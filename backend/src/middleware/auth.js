const jwt = require('jsonwebtoken');
const { query } = require('../config/database');

const JWT_SECRET = process.env.JWT_SECRET || 'water-wells-secret-2024-libya';

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided', message_ar: 'لم يتم توفير رمز المصادقة' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    const result = await query('SELECT * FROM users WHERE id = $1 AND is_active = true', [decoded.userId]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'User not found or inactive', message_ar: 'المستخدم غير موجود أو غير نشط' });
    }

    req.user = result.rows[0];
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired', message_ar: 'انتهت صلاحية رمز المصادقة' });
    }
    return res.status(401).json({ error: 'Invalid token', message_ar: 'رمز مصادقة غير صالح' });
  }
};

const generateTokens = (userId) => {
  const accessToken = jwt.sign({ userId }, JWT_SECRET, { expiresIn: '8h' });
  const refreshToken = jwt.sign({ userId, type: 'refresh' }, JWT_SECRET, { expiresIn: '7d' });
  return { accessToken, refreshToken };
};

module.exports = { authenticate, generateTokens, JWT_SECRET };
