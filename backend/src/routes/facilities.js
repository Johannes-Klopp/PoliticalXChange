const express = require('express');
const router = express.Router();
const facilityController = require('../controllers/facilityController');
const { verifyToken, verifyAdmin } = require('../middleware/auth');

// Admin routes only
router.post('/', verifyToken, verifyAdmin, facilityController.addFacility);
router.get('/', verifyToken, verifyAdmin, facilityController.getAllFacilities);
router.post('/bulk', verifyToken, verifyAdmin, facilityController.bulkAddFacilities);
router.post('/:facilityId/resend-token', verifyToken, verifyAdmin, facilityController.resendToken);

module.exports = router;
