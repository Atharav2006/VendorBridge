const express = require('express');
const router = express.Router();
const approvalController = require('../controllers/approvalController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

router.use(auth);

router.get('/', roleCheck(['procurement_officer', 'manager', 'admin', 'vendor']), approvalController.getApprovals);
router.get('/:id', roleCheck(['procurement_officer', 'manager', 'admin', 'vendor']), approvalController.getApprovalById);

router.post('/', roleCheck(['procurement_officer']), approvalController.createApproval);
router.post('/:id/action', roleCheck(['manager']), approvalController.actionApproval);

module.exports = router;
