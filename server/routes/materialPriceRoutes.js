const express = require('express');
const router = express.Router();
const materialPriceController = require('../controller/materialPriceController');
const { authenticate, authorize } = require('../middleware/auth');

// Material price routes (only for owners)
router.get('/', authenticate, authorize('owner'), materialPriceController.getMaterialPrices);
router.get('/gold/:karat', authenticate, authorize('owner'), materialPriceController.getGoldKaratPrice);
router.put('/', authenticate, authorize('owner'), materialPriceController.updateMaterialPrice);
router.post('/update-products', authenticate, authorize('owner'), materialPriceController.updateAllProductPrices);
router.post('/update-all-materials', authenticate, authorize('owner'), materialPriceController.updateAllMaterialsPrices);

module.exports = router; 