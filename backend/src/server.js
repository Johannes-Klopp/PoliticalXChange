const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { securityHeaders, apiLimiter, auditLog } = require('./middleware/security');

// Import routes
const candidatesRoutes = require('./routes/candidates');
const votesRoutes = require('./routes/votes');
const authRoutes = require('./routes/auth');
const facilitiesRoutes = require('./routes/facilities');

const app = express();
const PORT = process.env.PORT || 3000;

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

// API Routes
app.use('/api/candidates', candidatesRoutes);
app.use('/api/votes', votesRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/facilities', facilitiesRoutes);

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

// Start server
app.listen(PORT, () => {
  console.log(`\n🚀 Server läuft auf Port ${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV}`);
  console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL}\n`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing server');
  process.exit(0);
});

module.exports = app;
