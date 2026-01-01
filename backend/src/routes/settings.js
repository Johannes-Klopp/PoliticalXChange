const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');
const { verifyToken, verifyAdmin } = require('../middleware/auth');

// Public route - get election status
router.get('/election-status', settingsController.getElectionStatus);

// Admin route - set election status
router.post('/election-status', verifyToken, verifyAdmin, settingsController.setElectionStatus);

module.exports = router;
