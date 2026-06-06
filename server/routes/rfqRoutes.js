const express = require('express');
const router = express.Router();
const { getRFQs, getRFQById, createRFQ } = require('../controllers/rfqController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getRFQs)
  .post(protect, authorize('Admin', 'Purchaser'), createRFQ);

router.route('/:id')
  .get(protect, getRFQById);

module.exports = router;
