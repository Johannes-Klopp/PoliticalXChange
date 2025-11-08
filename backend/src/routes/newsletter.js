const express = require('express');
const router = express.Router();
const newsletterController = require('../controllers/newsletterController');
const { verifyToken, verifyAdmin } = require('../middleware/auth');

// Public routes
router.post('/subscribe', newsletterController.subscribe);
router.post('/unsubscribe', newsletterController.unsubscribe);

// Admin routes
router.get('/', verifyToken, verifyAdmin, newsletterController.getSubscribers);

module.exports = router;
