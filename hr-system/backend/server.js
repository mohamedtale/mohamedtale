require('dotenv').config();

// Fail fast if critical env vars are missing
if (!process.env.JWT_SECRET) {
  console.error('FATAL: JWT_SECRET is not set in environment variables.');
  process.exit(1);
}

const express = require('express');
const helmet  = require('helmet');
const cors    = require('cors');
const path    = require('path');
const pool    = require('./db');
const errorHandler  = require('./middleware/errorHandler');
const authMiddleware = require('./middleware/auth');
const requireRole    = require('./middleware/rbac');
const { apiLimiter } = require('./middleware/rateLimiter');

// Routes
const authRouter        = require('./routes/auth');
const employeesRouter   = require('./routes/employees');
const departmentsRouter = require('./routes/departments');
const leavesRouter      = require('./routes/leaves');
const permissionsRouter = require('./routes/permissions');
const attendanceRouter  = require('./routes/attendance');
const allowancesRouter  = require('./routes/allowances');
const documentsRouter   = require('./routes/documents');
const reportsRouter     = require('./routes/reports');
const settingsRouter    = require('./routes/settings');

const app  = express();
const PORT = process.env.PORT || 3000;

// ── Security headers (helmet) ──────────────────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc:  ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      styleSrc:   ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com', 'https://fonts.gstatic.com'],
      fontSrc:    ["'self'", 'https://fonts.gstatic.com'],
      imgSrc:     ["'self'", 'data:'],
      connectSrc: ["'self'"],
      objectSrc:  ["'none'"],
      frameAncestors: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

// ── CORS — restrict to same origin in production ───────────────────────────
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
  : null;

app.use(cors({
  origin: (origin, cb) => {
    // Allow requests with no origin (same-origin, mobile apps, curl)
    if (!origin) return cb(null, true);
    if (!allowedOrigins) return cb(null, true); // dev mode: no restriction
    if (allowedOrigins.includes(origin)) return cb(null, true);
    cb(new Error('Not allowed by CORS'));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

// ── Body parsers — tight limits ────────────────────────────────────────────
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// ── Global rate limiter ────────────────────────────────────────────────────
app.use('/api/', apiLimiter);

// ── Auth routes (public) ───────────────────────────────────────────────────
app.use('/api/auth', authRouter);

// ── Protected API routes ───────────────────────────────────────────────────
app.use('/api/employees',   authMiddleware, employeesRouter);
app.use('/api/departments', authMiddleware, departmentsRouter);
app.use('/api/leaves',      authMiddleware, leavesRouter);
app.use('/api/permissions', authMiddleware, permissionsRouter);
app.use('/api/attendance',  authMiddleware, attendanceRouter);
app.use('/api/allowances',  authMiddleware, allowancesRouter);
app.use('/api/documents',   authMiddleware, documentsRouter);
app.use('/api/reports',     authMiddleware, reportsRouter);
app.use('/api/settings',    authMiddleware, settingsRouter);

// ── Static frontend (no /uploads exposed publicly) ────────────────────────
app.use(express.static(path.join(__dirname, '../frontend')));

// ── Health check (no sensitive info) ──────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// ── SPA fallback ───────────────────────────────────────────────────────────
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/')) return next();
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// ── 404 ────────────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, error: 'المسار غير موجود' });
});

// ── Error handler ──────────────────────────────────────────────────────────
app.use(errorHandler);

// ── Start ──────────────────────────────────────────────────────────────────
async function startServer() {
  try {
    const client = await pool.connect();
    await client.query('SELECT NOW()');
    client.release();
    console.log('تم الاتصال بقاعدة البيانات بنجاح');
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`الخادم يعمل على المنفذ ${PORT}`);
    });
  } catch (err) {
    console.error('فشل الاتصال بقاعدة البيانات:', err.message);
    process.exit(1);
  }
}

startServer();

module.exports = app;
