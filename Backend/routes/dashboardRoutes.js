const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const auth = require('../middleware/auth');
router.get('/public', dashboardController.getPublicStats);

router.use(auth);

router.get('/', dashboardController.getDashboardStats);

module.exports = router;
