const express = require('express');
const router = express.Router();
const rfqController = require('../controllers/rfqController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

router.use(auth);

router.get('/', rfqController.getRFQs);
router.get('/:id', rfqController.getRFQById);
router.get('/:id/compare', roleCheck(['procurement_officer', 'manager']), rfqController.compareQuotations);

router.post('/', roleCheck(['procurement_officer']), rfqController.createRFQ);
router.put('/:id', roleCheck(['procurement_officer']), rfqController.updateRFQ);
router.patch('/:id/status', roleCheck(['procurement_officer']), rfqController.updateRFQStatus);

module.exports = router;
