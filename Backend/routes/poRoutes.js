const express = require('express');
const router = express.Router();
const poController = require('../controllers/poController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

router.use(auth);

router.get('/', poController.getPurchaseOrders);
router.get('/:id', poController.getPurchaseOrderById);

router.post('/', roleCheck(['procurement_officer']), poController.createPurchaseOrder);
router.patch('/:id/status', roleCheck(['procurement_officer', 'vendor']), poController.updatePurchaseOrderStatus);

module.exports = router;
