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
const emailTestRoutes = require('./routes/emailTest');
const campaignRoutes = require('./routes/campaign');

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
app.use('/api/email-test', emailTestRoutes);
app.use('/api/campaign', campaignRoutes);

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
        youth_care_experience TEXT,
        fun_fact TEXT,
        biography TEXT(2000),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB
    `);

    // Migration: Rename old columns if they exist
    try {
      const [columns] = await db.query(`SHOW COLUMNS FROM candidates LIKE 'facility_name'`);
      if (columns.length > 0) {
        // First drop the index (ignore if doesn't exist)
        try {
          await db.query(`ALTER TABLE candidates DROP INDEX idx_facility`);
          console.log('✅ Dropped idx_facility index');
        } catch (e) {
          // Index might not exist, ignore
        }
        // Then rename columns
        await db.query(`ALTER TABLE candidates CHANGE COLUMN facility_name youth_care_experience TEXT`);
        await db.query(`ALTER TABLE candidates CHANGE COLUMN facility_location fun_fact TEXT`);
        console.log('✅ Migrated candidates table columns');
      }
    } catch (migrationError) {
      console.log('Migration note:', migrationError.message);
    }

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

    // Create votes table with vote_session_id for grouping multiple votes
    await db.query(`
      CREATE TABLE IF NOT EXISTS votes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        vote_session_id VARCHAR(64) NOT NULL,
        candidate_id INT NOT NULL,
        voted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (candidate_id) REFERENCES candidates(id) ON DELETE CASCADE,
        INDEX idx_candidate (candidate_id),
        INDEX idx_session (vote_session_id)
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
        group_name VARCHAR(255),
        facility_name VARCHAR(255),
        region VARCHAR(255),
        confirmed BOOLEAN DEFAULT TRUE,
        confirmation_token VARCHAR(512),
        confirmed_at TIMESTAMP NULL,
        has_voted BOOLEAN DEFAULT FALSE,
        voted_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_email (email),
        INDEX idx_confirmed (confirmed),
        INDEX idx_has_voted (has_voted)
      ) ENGINE=InnoDB
    `);

    // Add missing columns to existing newsletter_subscriptions table (migration)
    try {
      // Check if columns exist, if not add them
      const [columns] = await db.query(`SHOW COLUMNS FROM newsletter_subscriptions LIKE 'group_name'`);
      if (columns.length === 0) {
        await db.query(`ALTER TABLE newsletter_subscriptions ADD COLUMN group_name VARCHAR(255)`);
        await db.query(`ALTER TABLE newsletter_subscriptions ADD COLUMN facility_name VARCHAR(255)`);
        await db.query(`ALTER TABLE newsletter_subscriptions ADD COLUMN region VARCHAR(255)`);
        console.log('   ✅ Newsletter columns added successfully');
      }

      // Add has_voted column if not exists
      const [hasVotedCol] = await db.query(`SHOW COLUMNS FROM newsletter_subscriptions LIKE 'has_voted'`);
      if (hasVotedCol.length === 0) {
        await db.query(`ALTER TABLE newsletter_subscriptions ADD COLUMN has_voted BOOLEAN DEFAULT FALSE`);
        await db.query(`ALTER TABLE newsletter_subscriptions ADD COLUMN voted_at TIMESTAMP NULL`);
        await db.query(`ALTER TABLE newsletter_subscriptions ADD INDEX idx_has_voted (has_voted)`);
        console.log('   ✅ Voting tracking columns added successfully');
      }

      // Add vote_session_id to votes table if not exists
      const [voteSessionCol] = await db.query(`SHOW COLUMNS FROM votes LIKE 'vote_session_id'`);
      if (voteSessionCol.length === 0) {
        await db.query(`ALTER TABLE votes ADD COLUMN vote_session_id VARCHAR(64) AFTER id`);
        await db.query(`ALTER TABLE votes ADD INDEX idx_session (vote_session_id)`);
        console.log('   ✅ Vote session tracking added to votes table');
      }
    } catch (err) {
      console.log('   ⚠️  Newsletter columns migration error:', err.message);
    }

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

    // Valid hash for 'ChangeMeNow123!' generated by bcryptjs
    const secondAdminPassword = '$2b$10$rqvNjf1HPcn0.i6npdnoH.Rr.bKctlvw6zEFdD5lq0UidUF.JRNXa';

    if (secondAdmin.length === 0) {
      await db.query(
        'INSERT INTO admins (username, password_hash) VALUES (?, ?)',
        ['admin', secondAdminPassword]
      );
      console.log('✅ Second admin user created');
      console.log('   Username: admin');
      console.log('   Password: ChangeMeNow123!');
    } else {
      // Force update password to ensure it's correct (fixing the invalid hash issue)
      await db.query(
        'UPDATE admins SET password_hash = ? WHERE id = ?',
        [secondAdminPassword, secondAdmin[0].id]
      );
      console.log('✅ Second admin user (admin) password updated to ensure validity');
      console.log('   Username: admin');
      console.log('   Password: ChangeMeNow123!');
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
