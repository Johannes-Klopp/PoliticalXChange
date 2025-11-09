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

// Auto-setup admin user on first start
async function setupAdminIfNeeded() {
  try {
    // Create admin table if not exists
    await db.query(`
      CREATE TABLE IF NOT EXISTS admins (
        id INT PRIMARY KEY AUTO_INCREMENT,
        username VARCHAR(255) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Check if admin exists
    const [admins] = await db.query('SELECT * FROM admins LIMIT 1');

    if (admins.length === 0 && process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD) {
      const username = process.env.ADMIN_EMAIL;
      const email = process.env.ADMIN_EMAIL;
      const passwordHash = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);

      await db.query(
        'INSERT INTO admins (username, email, password_hash) VALUES (?, ?, ?)',
        [username, email, passwordHash]
      );

      console.log('✅ Admin user created automatically');
      console.log(`   Username: ${username}`);
    }
  } catch (error) {
    console.error('⚠️  Error setting up admin:', error.message);
  }
}

// Start server
app.listen(PORT, async () => {
  console.log(`\n🚀 Server läuft auf Port ${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV}`);
  console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL}\n`);

  // Setup admin on first start
  await setupAdminIfNeeded();
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing server');
  process.exit(0);
});

module.exports = app;
