const express = require('express');
const router = express.Router();
const productController = require('../controller/productController');
const { authenticate, authorize } = require('../middleware/auth');
const { uploadWithDebug } = require('../middleware/upload');

// ============================================================================
// PRODUCT ROUTES
// ============================================================================

// Product CRUD operations
router.post('/', 
  authenticate, 
  authorize('owner'), 
  uploadWithDebug('images', 10), 
  productController.createProduct
);

router.get('/', productController.getProducts);

// Favorite products (must come before /:id routes)
router.get('/favorites/user', 
  authenticate, 
  authorize('customer'), 
  productController.getFavoriteProducts
);

router.get('/favorites/count', 
  authenticate, 
  authorize('customer'), 
  productController.getFavoriteProductsCount
);

// Product by ID operations
router.get('/:id', productController.getProductById);

router.put('/:id', 
  authenticate, 
  authorize('owner'), 
  uploadWithDebug('images', 10), 
  productController.updateProduct
);

router.delete('/:id', 
  authenticate, 
  authorize('owner'), 
  productController.deleteProduct
);

// Product pinning
router.patch('/:id/pin', 
  authenticate, 
  authorize('owner'), 
  productController.togglePin
);

router.put('/:id/pin', 
  authenticate, 
  authorize('owner'), 
  productController.togglePin
);

// Product likes (support both GET and POST)
router.get('/:id/like', 
  authenticate, 
  authorize('customer'), 
  productController.toggleLike
);

router.post('/:id/like', 
  authenticate, 
  authorize('customer'), 
  productController.toggleLike
);

module.exports = router; 