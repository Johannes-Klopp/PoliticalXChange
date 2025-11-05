const express = require('express');
const router = express.Router();
const voteController = require('../controllers/voteController');
const { verifyToken, verifyAdmin, verifyVotingToken } = require('../middleware/auth');
const { votingLimiter } = require('../middleware/security');

// Public routes
router.get('/verify-token', voteController.verifyToken);
router.post('/submit', votingLimiter, verifyVotingToken, voteController.submitVote);

// Admin routes
router.get('/results', verifyToken, verifyAdmin, voteController.getResults);
router.get('/export', verifyToken, verifyAdmin, voteController.exportResults);

module.exports = router;
