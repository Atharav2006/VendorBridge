const express = require('express');
const router = express.Router();
const { getVendors, getVendorById, createVendor } = require('../controllers/vendorController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getVendors)
  .post(protect, authorize('Admin', 'Manager', 'Purchaser'), createVendor);

router.route('/:id')
  .get(protect, getVendorById);

module.exports = router;
