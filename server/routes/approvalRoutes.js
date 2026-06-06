const express = require('express');
const router = express.Router();
const { getApprovals, approveQuotation, rejectQuotation } = require('../controllers/approvalController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', protect, authorize('Admin', 'Manager', 'Purchaser'), getApprovals);
router.post('/:id/approve', protect, authorize('Admin', 'Manager'), approveQuotation);
router.post('/:id/reject', protect, authorize('Admin', 'Manager'), rejectQuotation);

module.exports = router;
