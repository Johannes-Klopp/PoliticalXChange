const express = require('express');
const router = express.Router();
const emailTestController = require('../controllers/emailTestController');
const { verifyToken, verifyAdmin } = require('../middleware/auth');

// Public routes (only in development mode)
if (process.env.NODE_ENV === 'development') {
  router.post('/send-test-public', emailTestController.sendTestEmail);
  router.get('/status-public', emailTestController.getEmailStats);
}

// Protected routes (require admin authentication)
router.post('/send-test', verifyToken, verifyAdmin, emailTestController.sendTestEmail);
router.post('/send-newsletter', verifyToken, verifyAdmin, emailTestController.sendNewsletterToAll);
router.get('/status', verifyToken, verifyAdmin, emailTestController.getEmailStats);

module.exports = router;
