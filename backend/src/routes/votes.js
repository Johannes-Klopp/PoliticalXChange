const express = require('express');
const router = express.Router();
const voteController = require('../controllers/voteController');
const { verifyToken, verifyAdmin, verifyVotingToken } = require('../middleware/auth');
const { votingLimiter } = require('../middleware/security');

// Public routes
router.get('/verify-token', voteController.verifyToken);
router.post('/verify-email', voteController.verifyEmail);
router.post('/submit', votingLimiter, voteController.submitVoteWithEmail);
router.post('/submit-token', votingLimiter, verifyVotingToken, voteController.submitVote);
router.get('/public-results', voteController.getPublicResults);

// Admin routes
router.get('/results', verifyToken, verifyAdmin, voteController.getResults);
router.get('/export', verifyToken, verifyAdmin, voteController.exportResults);

module.exports = router;
