const express = require('express');
const router = express.Router();

// ============================================================================
// API ROUTES CONFIGURATION
// ============================================================================

// Import route modules
const productRoutes = require('./productRoutes');
const userRoutes = require('./userRoutes');
const commentRoutes = require('./commentRoutes');
const materialPriceRoutes = require('./materialPriceRoutes');
const statisticsRoutes = require('./statisticsRoutes');

// Mount routes
router.use('/products', productRoutes);
router.use('/users', userRoutes);
router.use('/comments', commentRoutes);
router.use('/material-prices', materialPriceRoutes);
router.use('/statistics', statisticsRoutes);

module.exports = router;
