const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyToken, verifyAdmin } = require('../middleware/auth');
const { authLimiter } = require('../middleware/security');

// Auth routes
router.post('/login', authLimiter, authController.adminLogin);
router.post('/change-password', verifyToken, verifyAdmin, authController.changePassword);

module.exports = router;
