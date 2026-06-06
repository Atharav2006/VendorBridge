const express = require('express');
const router = express.Router({ mergeParams: true }); // Merge params to get rfqId
const quotationController = require('../controllers/quotationController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

router.use(auth);

// /api/quotations
router.get('/', quotationController.getQuotations);
router.get('/:id', quotationController.getQuotationById);
router.put('/:id', roleCheck(['vendor']), quotationController.updateQuotation);

// /api/rfqs/:rfqId/quotations
router.post('/', roleCheck(['vendor']), quotationController.createQuotation);

module.exports = router;
