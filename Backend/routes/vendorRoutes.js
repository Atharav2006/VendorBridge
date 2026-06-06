const express = require('express');
const router = express.Router();
const vendorController = require('../controllers/vendorController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

// All vendor routes require authentication
router.use(auth);

router.get('/', vendorController.getVendors);
router.get('/:id', vendorController.getVendorById);

router.post('/', roleCheck(['admin', 'procurement_officer']), vendorController.createVendor);
router.put('/:id', roleCheck(['admin', 'procurement_officer']), vendorController.updateVendor);
router.patch('/:id/status', roleCheck(['admin']), vendorController.updateVendorStatus);
router.delete('/:id', roleCheck(['admin', 'manager', 'procurement_officer']), vendorController.deleteVendor);

module.exports = router;
