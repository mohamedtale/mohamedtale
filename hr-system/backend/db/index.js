const { Pool } = require('pg');
require('dotenv').config();

// إعداد مجموعة الاتصالات بقاعدة البيانات
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME || 'hr_system',
  user: process.env.DB_USER || 'hr_user',
  password: process.env.DB_PASSWORD || 'hr_password',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on('error', (err) => {
  console.error('خطأ غير متوقع في اتصال قاعدة البيانات:', err);
  process.exit(-1);
});

module.exports = pool;
