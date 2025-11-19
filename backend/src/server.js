const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const { securityHeaders, apiLimiter, auditLog } = require('./middleware/security');
const db = require('./config/database');

// Import routes
const candidatesRoutes = require('./routes/candidates');
const votesRoutes = require('./routes/votes');
const authRoutes = require('./routes/auth');
const facilitiesRoutes = require('./routes/facilities');
const newsletterRoutes = require('./routes/newsletter');
const auditRoutes = require('./routes/audit');

const app = express();
const PORT = process.env.PORT || 3000;

// Trust proxy for Railway/reverse proxy
app.set('trust proxy', 1);

// Middleware
app.use(securityHeaders);
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(apiLimiter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/candidates', candidatesRoutes);
app.use('/api/votes', votesRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/facilities', facilitiesRoutes);
app.use('/api/newsletter', newsletterRoutes);
app.use('/api/audit', auditRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint nicht gefunden' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production'
      ? 'Ein Fehler ist aufgetreten'
      : err.message
  });
});

// Auto-initialize database schema on deployment
async function initializeDatabaseSchema() {
  console.log('🔄 Initializing database schema...');

  try {
    // Create candidates table
    await db.query(`
      CREATE TABLE IF NOT EXISTS candidates (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        age INT,
        facility_name VARCHAR(255) NOT NULL,
        facility_location VARCHAR(255) NOT NULL,
        biography TEXT(2000),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_facility (facility_name)
      ) ENGINE=InnoDB
    `);

    // Create facilities table
    await db.query(`
      CREATE TABLE IF NOT EXISTS facilities (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        location VARCHAR(255),
        token_sent BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_email (email)
      ) ENGINE=InnoDB
    `);

    // Create voting_tokens table
    await db.query(`
      CREATE TABLE IF NOT EXISTS voting_tokens (
        id INT AUTO_INCREMENT PRIMARY KEY,
        facility_id INT NOT NULL,
        token VARCHAR(512) NOT NULL UNIQUE,
        used BOOLEAN DEFAULT FALSE,
        used_at TIMESTAMP NULL,
        ip_address VARCHAR(45),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        expires_at TIMESTAMP NOT NULL,
        FOREIGN KEY (facility_id) REFERENCES facilities(id) ON DELETE CASCADE,
        INDEX idx_token (token),
        INDEX idx_used (used),
        INDEX idx_expires (expires_at)
      ) ENGINE=InnoDB
    `);

    // Create votes table
    await db.query(`
      CREATE TABLE IF NOT EXISTS votes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        candidate_id INT NOT NULL,
        voted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (candidate_id) REFERENCES candidates(id) ON DELETE CASCADE,
        INDEX idx_candidate (candidate_id)
      ) ENGINE=InnoDB
    `);

    // Create admins table
    await db.query(`
      CREATE TABLE IF NOT EXISTS admins (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(100) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB
    `);

    // Create newsletter_subscriptions table
    await db.query(`
      CREATE TABLE IF NOT EXISTS newsletter_subscriptions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        confirmed BOOLEAN DEFAULT FALSE,
        confirmation_token VARCHAR(512),
        confirmed_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_email (email),
        INDEX idx_confirmed (confirmed)
      ) ENGINE=InnoDB
    `);

    // Create audit_log table
    await db.query(`
      CREATE TABLE IF NOT EXISTS audit_log (
        id INT AUTO_INCREMENT PRIMARY KEY,
        action VARCHAR(100) NOT NULL,
        entity_type VARCHAR(50),
        entity_id INT,
        details TEXT,
        ip_address VARCHAR(45),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_action (action),
        INDEX idx_created (created_at)
      ) ENGINE=InnoDB
    `);

    console.log('✅ Database schema initialized');

    // Setup admin user
    console.log('🔍 Checking for existing admin users...');
    const [admins] = await db.query('SELECT * FROM admins LIMIT 1');
    console.log(`   Found ${admins.length} admin(s)`);

    if (process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD) {
      console.log('   Using ADMIN_EMAIL and ADMIN_PASSWORD from env');
      const username = process.env.ADMIN_EMAIL;
      const passwordHash = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);

      if (admins.length === 0) {
        await db.query(
          'INSERT INTO admins (username, password_hash) VALUES (?, ?)',
          [username, passwordHash]
        );
        console.log('✅ Admin user created');
        console.log(`   Username: ${username}`);
      } else if (admins[0].username !== username) {
        await db.query(
          'UPDATE admins SET username = ?, password_hash = ? WHERE id = ?',
          [username, passwordHash, admins[0].id]
        );
        console.log('✅ Admin user updated');
        console.log(`   Username: ${username}`);
      } else {
        console.log('ℹ️  Admin user already up to date');
        console.log(`   Username: ${username}`);
      }
    } else {
      console.log('   No ADMIN_EMAIL/ADMIN_PASSWORD env vars, using default');
      // Fallback: Create default admin if no env vars set
      if (admins.length === 0) {
        const defaultPasswordHash = '$2a$10$rQUeVhG5yGz6YhqK5xJYWuXMF8qL.nZ7WVZ9xGp0qYvKqF8yL5QZ.';
        await db.query(
          'INSERT INTO admins (username, password_hash) VALUES (?, ?)',
          ['admin', defaultPasswordHash]
        );
        console.log('✅ Default admin user created');
        console.log('   Username: admin');
        console.log('   Password: ChangeMeNow123!');
        console.log('   ⚠️  CHANGE THIS PASSWORD IMMEDIATELY!');
      } else {
        console.log('ℹ️  Admin user already exists');
        console.log(`   Username: ${admins[0].username}`);
      }
    }

    // ---------------------------------------------------------
    // ZWEITEN ADMIN-USER ERSTELLEN (admin / ChangeMeNow123!)
    // ---------------------------------------------------------
    console.log('🔍 Checking for second admin user (admin)...');
    const [secondAdmin] = await db.query('SELECT * FROM admins WHERE username = ?', ['admin']);

    if (secondAdmin.length === 0) {
      const secondAdminPassword = '$2a$10$rQUeVhG5yGz6YhqK5xJYWuXMF8qL.nZ7WVZ9xGp0qYvKqF8yL5QZ.'; // ChangeMeNow123!
      await db.query(
        'INSERT INTO admins (username, password_hash) VALUES (?, ?)',
        ['admin', secondAdminPassword]
      );
      console.log('✅ Second admin user created');
      console.log('   Username: admin');
      console.log('   Password: ChangeMeNow123!');
    } else {
      console.log('ℹ️  Second admin user (admin) already exists');
    }

  } catch (error) {
    console.error('❌ Error initializing database:');
    console.error('   Message:', error.message);
    console.error('   Stack:', error.stack);
    // Don't exit - let the app continue running
  }
}

// Start server
app.listen(PORT, async () => {
  console.log(`\n🚀 Server läuft auf Port ${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV}`);
  console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL}\n`);

  // Initialize database schema and admin user
  await initializeDatabaseSchema();
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing server');
  process.exit(0);
});

module.exports = app;
