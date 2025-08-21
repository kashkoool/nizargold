const express = require('express');
const router = express.Router();
const userController = require('../controller/userController');
const { authenticate } = require('../middleware/auth');

// ============================================================================
// USER ROUTES
// ============================================================================

// Authentication routes
router.post('/register', userController.register);
router.post('/login', userController.login);
router.post('/logout', authenticate, userController.logout);
router.post('/refresh', userController.refreshToken);

module.exports = router; 