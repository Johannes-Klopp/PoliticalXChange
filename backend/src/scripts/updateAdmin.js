const bcrypt = require('bcryptjs');
const db = require('../config/database');
require('dotenv').config();

async function updateAdmin() {
  try {
    console.log('🔧 Updating admin user...');

    if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD) {
      console.error('❌ ADMIN_EMAIL and ADMIN_PASSWORD must be set in environment variables');
      process.exit(1);
    }

    const username = process.env.ADMIN_EMAIL;
    const passwordHash = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);

    // Check if admin exists
    const [admins] = await db.query('SELECT * FROM admins LIMIT 1');

    if (admins.length > 0) {
      // Update existing admin
      await db.query(
        'UPDATE admins SET username = ?, password_hash = ? WHERE id = ?',
        [username, passwordHash, admins[0].id]
      );
      console.log('✅ Admin user updated successfully!');
    } else {
      // Create new admin
      await db.query(
        'INSERT INTO admins (username, password_hash) VALUES (?, ?)',
        [username, passwordHash]
      );
      console.log('✅ Admin user created successfully!');
    }

    console.log(`   Username: ${username}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error updating admin:', error);
    process.exit(1);
  }
}

updateAdmin();
