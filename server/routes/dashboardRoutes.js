const express = require('express');
const router = express.Router();
const { getDashboardAnalytics, getRecentPurchaseOrders } = require('../controllers/dashboardController');
const { protect } = require('../middleware/authMiddleware');

router.get('/analytics', protect, getDashboardAnalytics);
router.get('/recent-purchase-orders', protect, getRecentPurchaseOrders);

module.exports = router;
