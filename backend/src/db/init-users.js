/**
 * init-users.js
 * Runs at backend startup to ensure demo users exist with correct bcryptjs hashes.
 * This guarantees compatibility regardless of how the database was initialized.
 */
const bcrypt = require('bcryptjs');
const { query } = require('../config/database');

const DEMO_USERS = [
  {
    username: 'admin',
    email: 'admin@water.gov.ly',
    password: 'admin123',
    full_name_ar: 'مدير النظام',
    full_name_en: 'System Administrator',
    role: 'system_admin',
    section: null,
  },
  {
    username: 'manager',
    email: 'manager@water.gov.ly',
    password: 'manager123',
    full_name_ar: 'مدير القسم',
    full_name_en: 'Department Manager',
    role: 'department_manager',
    section: 'wells_map',
  },
  {
    username: 'employee',
    email: 'employee@water.gov.ly',
    password: 'employee123',
    full_name_ar: 'موظف',
    full_name_en: 'Employee',
    role: 'employee',
    section: 'technical_reports',
  },
];

async function initUsers() {
  console.log('🔑 Initializing demo users with bcryptjs hashes...');
  for (const u of DEMO_USERS) {
    try {
      const hash = await bcrypt.hash(u.password, 12);
      await query(
        `INSERT INTO users (id, username, email, password_hash, full_name_ar, full_name_en, role, section, is_active)
         VALUES (uuid_generate_v4(), $1, $2, $3, $4, $5, $6, $7, true)
         ON CONFLICT (username) DO UPDATE SET password_hash = EXCLUDED.password_hash`,
        [u.username, u.email, hash, u.full_name_ar, u.full_name_en, u.role, u.section]
      );
      console.log(`  ✅ User '${u.username}' ready`);
    } catch (err) {
      console.error(`  ❌ Failed to initialize user '${u.username}':`, err.message);
    }
  }
  console.log('✅ Demo user initialization complete.\n');
}

module.exports = { initUsers };
