const express = require('express');
const router = express.Router();
const candidateController = require('../controllers/candidateController');
const { verifyToken, verifyAdmin } = require('../middleware/auth');

// Public routes
router.get('/', candidateController.getAllCandidates);
router.get('/:id', candidateController.getCandidateById);

// Admin routes
router.post('/', verifyToken, verifyAdmin, candidateController.createCandidate);
router.put('/:id', verifyToken, verifyAdmin, candidateController.updateCandidate);
router.delete('/:id', verifyToken, verifyAdmin, candidateController.deleteCandidate);
router.post('/bulk', verifyToken, verifyAdmin, candidateController.bulkUploadCandidates);

module.exports = router;
