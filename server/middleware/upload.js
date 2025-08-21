const multer = require('multer');
const path = require('path');
const { validateFileUpload } = require('./security');

/**
 * File Upload Middleware Configuration
 * 
 * Handles multipart/form-data file uploads for product images
 */

// Configure storage engine
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads/'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

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
      
      // Apply file validation
      validateFileUpload(req, res, next);
    });
  };
};

module.exports = { upload, uploadWithDebug }; 