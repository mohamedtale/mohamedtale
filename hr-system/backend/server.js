require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const pool = require('./db');
const errorHandler = require('./middleware/errorHandler');

// استيراد المسارات
const authRouter = require('./routes/auth');
const authMiddleware = require('./middleware/auth');
const employeesRouter = require('./routes/employees');
const departmentsRouter = require('./routes/departments');
const leavesRouter = require('./routes/leaves');
const permissionsRouter = require('./routes/permissions');
const attendanceRouter = require('./routes/attendance');
const allowancesRouter = require('./routes/allowances');
const documentsRouter = require('./routes/documents');
const reportsRouter = require('./routes/reports');
const settingsRouter = require('./routes/settings');

const app = express();
const PORT = process.env.PORT || 3000;

// الإعدادات الأساسية
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// تقديم الملفات المرفوعة بشكل ثابت
const uploadDir = process.env.UPLOAD_DIR || './uploads';
app.use('/uploads', express.static(path.resolve(uploadDir)));

// مسارات المصادقة (لا تحتاج توكن)
app.use('/api/auth', authRouter);

// تركيب المسارات المحمية
app.use('/api/employees', authMiddleware, employeesRouter);
app.use('/api/departments', authMiddleware, departmentsRouter);
app.use('/api/leaves', authMiddleware, leavesRouter);
app.use('/api/permissions', authMiddleware, permissionsRouter);
app.use('/api/attendance', authMiddleware, attendanceRouter);
app.use('/api/allowances', authMiddleware, allowancesRouter);
app.use('/api/documents', authMiddleware, documentsRouter);
app.use('/api/reports', authMiddleware, reportsRouter);
app.use('/api/settings', authMiddleware, settingsRouter);

// تقديم الملفات الثابتة للواجهة الأمامية
app.use(express.static(path.join(__dirname, '../frontend')));

// مسار الصحة
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// SPA fallback — كل المسارات غير API ترجع index.html
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/')) return next();
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// معالج 404 للـ API فقط
app.use((req, res) => {
  res.status(404).json({ success: false, error: 'المسار غير موجود' });
});

// معالج الأخطاء العام
app.use(errorHandler);

// اختبار الاتصال بقاعدة البيانات عند الإقلاع
async function startServer() {
  try {
    const client = await pool.connect();
    await client.query('SELECT NOW()');
    client.release();
    console.log('تم الاتصال بقاعدة البيانات بنجاح');

    app.listen(PORT, () => {
      console.log(`الخادم يعمل على المنفذ ${PORT}`);
    });
  } catch (err) {
    console.error('فشل الاتصال بقاعدة البيانات:', err.message);
    process.exit(1);
  }
}

startServer();

module.exports = app;
