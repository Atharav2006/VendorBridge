const express = require('express');
const router = express.Router();
const logController = require('../controllers/logController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

router.use(auth);
router.get('/', roleCheck(['admin', 'manager', 'procurement_officer', 'vendor']), logController.getLogs);

module.exports = router;
