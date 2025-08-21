const mongoose = require('mongoose');

/**
 * Comment Schema
 * 
 * Defines the structure for product comments
 */

const CommentSchema = new mongoose.Schema({
  product: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Product', 
    required: true 
  },
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  content: { 
    type: String, 
    required: true,
    trim: true,
    minlength: 1,
    maxlength: 1000
  }
}, { 
  timestamps: true 
});

module.exports = mongoose.model('Comment', CommentSchema); 