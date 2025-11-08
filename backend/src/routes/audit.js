const express = require('express');
const router = express.Router();
const auditController = require('../controllers/auditController');
const { verifyToken, verifyAdmin } = require('../middleware/auth');

// Admin routes
router.get('/', verifyToken, verifyAdmin, auditController.getAuditLogs);

module.exports = router;
