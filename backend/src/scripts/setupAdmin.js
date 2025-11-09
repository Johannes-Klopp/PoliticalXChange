const bcrypt = require('bcryptjs');
const db = require('../config/database');
require('dotenv').config();

async function setupAdmin() {
  try {
    console.log('🔧 Setting up admin user...');

    // Check if admin table exists and create if needed
    await db.query(`
      CREATE TABLE IF NOT EXISTS admins (
        id INT PRIMARY KEY AUTO_INCREMENT,
        username VARCHAR(255) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Check if admin already exists
    const [existingAdmins] = await db.query('SELECT * FROM admins LIMIT 1');

    if (existingAdmins.length > 0) {
      console.log('✅ Admin user already exists');
      process.exit(0);
    }

    // Get credentials from environment
    const username = process.env.ADMIN_EMAIL || process.env.ADMIN_USERNAME || 'admin';
    const password = process.env.ADMIN_PASSWORD || 'changeme';
    const email = process.env.ADMIN_EMAIL;

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create admin user
    await db.query(
      'INSERT INTO admins (username, email, password_hash) VALUES (?, ?, ?)',
      [username, email, passwordHash]
    );

    console.log('✅ Admin user created successfully!');
    console.log(`   Username: ${username}`);
    console.log(`   Email: ${email || 'N/A'}`);
    console.log('\n⚠️  Please change the password after first login!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error setting up admin:', error);
    process.exit(1);
  }
}

setupAdmin();
