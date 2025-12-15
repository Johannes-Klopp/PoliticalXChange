const express = require('express');
const router = express.Router();
const campaignController = require('../controllers/campaignController');
const { verifyToken } = require('../middleware/auth');

// All routes require admin authentication
router.use(verifyToken);

// Send voting start email (to all or specific)
router.post('/send-voting-start', campaignController.sendVotingStart);

// Send reminder email (to all non-voters or specific)
router.post('/send-reminder', campaignController.sendVotingReminder);

// Get email statistics
router.get('/stats', campaignController.getEmailStats);

module.exports = router;
