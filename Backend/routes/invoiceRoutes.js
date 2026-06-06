const express = require('express');
const router = express.Router();
const invoiceController = require('../controllers/invoiceController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

router.use(auth);

router.get('/', invoiceController.getInvoices);
router.get('/:id', invoiceController.getInvoiceById);

router.post('/', roleCheck(['procurement_officer', 'vendor']), invoiceController.createInvoice);
router.patch('/:id/status', roleCheck(['procurement_officer', 'manager', 'admin']), invoiceController.updateInvoiceStatus);
router.get('/:id/pdf', roleCheck(['vendor', 'procurement_officer', 'manager', 'admin']), invoiceController.downloadInvoicePdf);
router.post('/:id/email', roleCheck(['vendor', 'procurement_officer', 'manager', 'admin']), invoiceController.emailInvoice);

module.exports = router;
