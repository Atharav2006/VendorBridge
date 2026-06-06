const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

router.use(auth);

// Only admins and managers can view reports
router.get('/vendor-performance', roleCheck(['admin', 'manager', 'procurement_officer']), reportController.getVendorPerformance);
router.get('/procurement-summary', roleCheck(['admin', 'manager', 'procurement_officer']), reportController.getProcurementSummary);

module.exports = router;
