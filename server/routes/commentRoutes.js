const express = require('express');
const router = express.Router();
const commentController = require('../controller/commentController');
const { authenticate, authorize } = require('../middleware/auth');

// Comment CRUD
router.post('/', authenticate, authorize('customer'), commentController.addComment);
router.put('/:id', authenticate, authorize('customer'), commentController.updateComment);
router.delete('/:id', authenticate, authorize('customer'), commentController.deleteComment);

// Public: Get comments for a product
router.get('/', authenticate, authorize('owner', 'customer'), commentController.getComments);

module.exports = router; 