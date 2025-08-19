const express = require('express');
const router = express.Router();
const productController = require('../controller/productController');
const { authenticate, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Product CRUD
router.post('/', authenticate, authorize('owner'), upload.array('images', 10), productController.createProduct);
router.get('/', productController.getProducts);

// Get user's favorite products (must come before /:id routes)
router.get('/favorites/user', authenticate, authorize('customer'), productController.getFavoriteProducts);
router.get('/favorites/count', authenticate, authorize('customer'), productController.getFavoriteProductsCount);

// Product by ID routes
router.get('/:id', productController.getProductById);
router.put('/:id', authenticate, authorize('owner'), upload.array('images', 10), productController.updateProduct);
router.delete('/:id', authenticate, authorize('owner'), productController.deleteProduct);
router.patch('/:id/pin', authenticate, authorize('owner'), productController.togglePin);
router.post('/:id/like', authenticate, authorize('customer'),productController.toggleLike);

// Additional product-specific routes can be added here

module.exports = router; 