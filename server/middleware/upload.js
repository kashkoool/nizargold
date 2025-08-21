const multer = require('multer');
const path = require('path');
const { validateFileUpload } = require('./security');

/**
 * File Upload Middleware Configuration
 * 
 * Handles multipart/form-data file uploads for product images
 * Uses memory storage for base64 conversion
 */

// Configure memory storage for base64 conversion
const storage = multer.memoryStorage();

// File type filter - images only
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};

// Configure multer instance
const upload = multer({
  storage,
  fileFilter,
  limits: { 
    files: 10,        // Maximum 10 files
    fileSize: 5 * 1024 * 1024  // 5MB per file
  }
});

/**
 * Upload middleware with error handling and security validation
 * @param {string} fieldName - Form field name for files
 * @param {number} maxCount - Maximum number of files
 */
const uploadWithDebug = (fieldName, maxCount) => {
  return (req, res, next) => {
    upload.array(fieldName, maxCount)(req, res, (err) => {
      if (err) {
        return res.status(400).json({ 
          message: err.message 
        });
      }
      
      // Convert uploaded files to base64
      if (req.files && req.files.length > 0) {
        req.files.forEach(file => {
          const base64Data = file.buffer.toString('base64');
          const mimeType = file.mimetype;
          file.url = `data:${mimeType};base64,${base64Data}`;
          file.public_id = null;
        });
      }
      
      // Apply file validation
      validateFileUpload(req, res, next);
    });
  };
};

module.exports = { upload, uploadWithDebug }; 