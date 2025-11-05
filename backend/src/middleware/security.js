const rateLimit = require('express-rate-limit');
const helmet = require('helmet');

// Rate limiting for voting endpoint
const votingLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // max 5 requests per window
  message: 'Zu viele Anfragen von dieser IP. Bitte versuchen Sie es später erneut.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiting for authentication
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: 'Zu viele Login-Versuche. Bitte versuchen Sie es später erneut.',
  standardHeaders: true,
  legacyHeaders: false,
});

// General API rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Zu viele Anfragen von dieser IP. Bitte versuchen Sie es später erneut.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Security headers with helmet
const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
});

// Audit log middleware
const auditLog = (action) => {
  return async (req, res, next) => {
    const db = require('../config/database');
    const ip = req.ip || req.connection.remoteAddress;

    try {
      await db.query(
        'INSERT INTO audit_log (action, details, ip_address) VALUES (?, ?, ?)',
        [action, JSON.stringify({ path: req.path, method: req.method }), ip]
      );
    } catch (error) {
      console.error('Audit log error:', error);
    }

    next();
  };
};

module.exports = {
  votingLimiter,
  authLimiter,
  apiLimiter,
  securityHeaders,
  auditLog
};
