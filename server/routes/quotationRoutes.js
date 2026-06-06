const express = require('express');
const router = express.Router();
const { submitQuotation, getQuotationsByRfq } = require('../controllers/quotationController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/', protect, authorize('Admin', 'Vendor'), submitQuotation);
router.get('/compare/:rfqId', protect, getQuotationsByRfq);

module.exports = router;
