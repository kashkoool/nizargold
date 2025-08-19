const express = require('express');
const router = express.Router();
const userController = require('../controller/userController');
const { authenticate } = require('../middleware/auth');
const { refreshToken } = require('../controller/userController');

// User registration and authentication
router.post('/register', userController.register);
router.post('/login', userController.login);
router.post('/logout', authenticate, userController.logout);
router.post('/refresh', refreshToken);

// Additional user-specific routes can be added here

module.exports = router; 