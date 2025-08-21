const mongoose = require('mongoose');

/**
 * User Schema
 * 
 * Defines the structure for user accounts in the system
 */

const UserSchema = new mongoose.Schema({
  username: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30
  },
  email: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true,
    lowercase: true
  },
  password: { 
    type: String, 
    required: true,
    minlength: 6
  },
  role: { 
    type: String, 
    enum: ['owner', 'customer'], 
    default: 'customer' 
  }
}, { 
  timestamps: true 
});

module.exports = mongoose.model('User', UserSchema); 