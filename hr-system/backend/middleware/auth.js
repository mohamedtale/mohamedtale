const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'hr_system_secret_2024';

module.exports = function authMiddleware(req, res, next) {
  const header = req.headers['authorization'] || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) {
    return res.status(401).json({ error: 'غير مصرح — يرجى تسجيل الدخول' });
  }
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: 'انتهت صلاحية الجلسة — يرجى تسجيل الدخول مجدداً' });
  }
};
