require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const pool = require('./db');
const errorHandler = require('./middleware/errorHandler');

// استيراد المسارات
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

// تركيب المسارات
app.use('/api/employees', employeesRouter);
app.use('/api/departments', departmentsRouter);
app.use('/api/leaves', leavesRouter);
app.use('/api/permissions', permissionsRouter);
app.use('/api/attendance', attendanceRouter);
app.use('/api/allowances', allowancesRouter);
app.use('/api/documents', documentsRouter);
app.use('/api/reports', reportsRouter);
app.use('/api/settings', settingsRouter);

// مسار الصحة
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// معالج 404
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
