const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'hr_db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres_secure_2024',
});

async function initDB() {
  const client = await pool.connect();
  try {
    const sql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
    await client.query(sql);
    console.log('✅ HR Database schema initialized');
  } finally {
    client.release();
  }
}

async function initAdminUser() {
  const bcrypt = require('bcryptjs');
  const hash = await bcrypt.hash('admin123', 10);
  await pool.query(`
    INSERT INTO hr_users (username, password_hash, full_name, role)
    VALUES ('admin', $1, 'مدير النظام', 'admin')
    ON CONFLICT (username) DO UPDATE SET password_hash = $1
  `, [hash]);
  console.log('✅ Admin user ready');
}

module.exports = { pool, initDB, initAdminUser };
