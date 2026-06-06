const express = require('express');
const router = express.Router();
const { getAnalytics, exportReport } = require('../controllers/reportController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/analytics', protect, authorize('Admin', 'Manager'), getAnalytics);
router.post('/export', protect, authorize('Admin', 'Manager'), exportReport);

module.exports = router;
