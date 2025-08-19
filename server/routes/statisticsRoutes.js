const express = require('express');
const router = express.Router();
const statisticsController = require('../controller/statisticsController');
const { authenticate, authorize } = require('../middleware/auth');

// Statistics routes (only for owners)
router.get('/products', authenticate, authorize('owner'), statisticsController.getProductsStatistics);
router.get('/products/:productId', authenticate, authorize('owner'), statisticsController.getProductDetailedStats);

module.exports = router; 