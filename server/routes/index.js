const express = require('express');
const router = express.Router();

const productRoutes = require('./productRoutes');
const userRoutes = require('./userRoutes');
const commentRoutes = require('./commentRoutes');
const materialPriceRoutes = require('./materialPriceRoutes');
const statisticsRoutes = require('./statisticsRoutes');

router.use('/products', productRoutes);
router.use('/users', userRoutes);
router.use('/comments', commentRoutes);
router.use('/material-prices', materialPriceRoutes);
router.use('/statistics', statisticsRoutes);

module.exports = router;
