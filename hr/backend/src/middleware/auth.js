const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'hr_jwt_secret_2024';

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'غير مصرح' });
  }
  const token = authHeader.split(' ')[1];
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: 'جلسة منتهية، أعد تسجيل الدخول' });
  }
}

module.exports = { authMiddleware, JWT_SECRET };
