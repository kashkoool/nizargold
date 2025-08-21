const express = require('express');
const router = express.Router();
const commentController = require('../controller/commentController');
const { authenticate, authorize } = require('../middleware/auth');

// ============================================================================
// COMMENT ROUTES
// ============================================================================

// Public routes
router.get('/', commentController.getComments);

// Protected routes (customer only)
router.post('/', 
  authenticate, 
  authorize('customer'), 
  commentController.addComment
);

router.put('/:id', 
  authenticate, 
  authorize('customer'), 
  commentController.updateComment
);

router.delete('/:id', 
  authenticate, 
  authorize('customer'), 
  commentController.deleteComment
);

module.exports = router; 