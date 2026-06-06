const express = require('express');
const router = express.Router();
const { getPurchaseOrders, markAsPaid, downloadInvoicePDF, emailInvoice } = require('../controllers/poController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', protect, getPurchaseOrders);
router.put('/:id/pay', protect, authorize('Admin', 'Manager'), markAsPaid);
router.get('/:id/download', protect, downloadInvoicePDF);
router.post('/:id/email', protect, authorize('Admin', 'Manager', 'Purchaser'), emailInvoice);

module.exports = router;
