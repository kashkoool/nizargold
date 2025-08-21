const express = require('express');
const router = express.Router();
const materialPriceController = require('../controller/materialPriceController');
const { authenticate, authorize } = require('../middleware/auth');

// ============================================================================
// MATERIAL PRICE ROUTES (OWNER ONLY)
// ============================================================================

// Get material prices
router.get('/', 
  authenticate, 
  authorize('owner'), 
  materialPriceController.getMaterialPrices
);

router.get('/gold/:karat', 
  authenticate, 
  authorize('owner'), 
  materialPriceController.getGoldKaratPrice
);

// Update material prices
router.put('/', 
  authenticate, 
  authorize('owner'), 
  materialPriceController.updateMaterialPrice
);

// Bulk price updates
router.post('/update-products', 
  authenticate, 
  authorize('owner'), 
  materialPriceController.updateAllProductPrices
);

router.post('/update-all-materials', 
  authenticate, 
  authorize('owner'), 
  materialPriceController.updateAllMaterialsPrices
);

module.exports = router; 