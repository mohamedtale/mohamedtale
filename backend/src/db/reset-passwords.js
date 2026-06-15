const bcrypt = require('bcryptjs');
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://water_user:water_pass@localhost:5432/water_wells_db'
});

async function resetPasswords() {
  const users = [
    { username: 'admin', password: 'admin123' },
    { username: 'manager', password: 'manager123' },
    { username: 'employee', password: 'employee123' },
  ];

  for (const u of users) {
    const hash = await bcrypt.hash(u.password, 12);
    const result = await pool.query(
      'UPDATE users SET password_hash = $1 WHERE username = $2 RETURNING username',
      [hash, u.username]
    );
    if (result.rows.length > 0) {
      console.log(`✅ Updated password for: ${u.username}`);
    } else {
      console.log(`⚠️  User not found: ${u.username}`);
    }
  }

  await pool.end();
  console.log('Done.');
}

resetPasswords().catch(console.error);
