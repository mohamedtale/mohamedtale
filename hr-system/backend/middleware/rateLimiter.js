const rateLimit = require('express-rate-limit');

/* General API limiter — 200 requests per minute per IP */
const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'طلبات كثيرة جداً، يرجى الانتظار قليلاً' },
});

/* Login limiter — 10 attempts per 15 min per IP */
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  message: { error: 'محاولات دخول كثيرة جداً، يرجى الانتظار 15 دقيقة' },
});

/* Per-username brute-force tracker (in-memory) */
const failMap = new Map();
const MAX_FAILS = 8;
const LOCKOUT_MS = 20 * 60 * 1000; // 20 minutes

function recordFail(username) {
  const key = username.toLowerCase();
  const entry = failMap.get(key) || { count: 0, until: 0 };
  entry.count += 1;
  if (entry.count >= MAX_FAILS) {
    entry.until = Date.now() + LOCKOUT_MS;
    entry.count = 0;
  }
  failMap.set(key, entry);
}

function isLocked(username) {
  const key = username.toLowerCase();
  const entry = failMap.get(key);
  if (!entry) return false;
  if (entry.until && Date.now() < entry.until) return true;
  if (entry.until && Date.now() >= entry.until) {
    failMap.delete(key);
  }
  return false;
}

function resetFails(username) {
  failMap.delete(username.toLowerCase());
}

module.exports = { apiLimiter, loginLimiter, recordFail, isLocked, resetFails };
