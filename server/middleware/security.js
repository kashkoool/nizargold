const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

/**
 * Security Middleware Configuration
 * 
 * Protects against common cyber attacks and vulnerabilities
 */

// Rate limiting for authentication endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: {
    error: 'Too many authentication attempts',
    message: 'Please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true
});

// Rate limiting for general API endpoints
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests',
    message: 'Please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Rate limiting for file uploads
const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 30, // Limit each IP to 30 uploads per hour
  message: {
    error: 'Too many file uploads',
    message: 'Please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Security headers configuration
const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"]
    }
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" }
});

// Input sanitization and validation
const sanitizeInput = (req, res, next) => {
  // Remove any potential script tags from string inputs
  if (req.body) {
    Object.keys(req.body).forEach(key => {
      if (typeof req.body[key] === 'string') {
        req.body[key] = req.body[key]
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
          .replace(/javascript:/gi, '')
          .replace(/on\w+\s*=/gi, '');
      }
    });
  }
  
  // Sanitize query parameters
  if (req.query) {
    Object.keys(req.query).forEach(key => {
      if (typeof req.query[key] === 'string') {
        req.query[key] = req.query[key]
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
          .replace(/javascript:/gi, '')
          .replace(/on\w+\s*=/gi, '');
      }
    });
  }
  
  next();
};

// File upload security validation
const validateFileUpload = (req, res, next) => {
  if (req.files) {
    for (const file of req.files) {
      // Check file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        return res.status(400).json({
          error: 'File too large',
          message: 'File size must be less than 5MB'
        });
      }
      
      // Check file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.mimetype)) {
        return res.status(400).json({
          error: 'Invalid file type',
          message: 'Only JPEG, PNG, GIF, and WebP images are allowed'
        });
      }
      
      // Check file extension
      const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
      const fileExtension = file.originalname.toLowerCase().substring(file.originalname.lastIndexOf('.'));
      if (!allowedExtensions.includes(fileExtension)) {
        return res.status(400).json({
          error: 'Invalid file extension',
          message: 'Only .jpg, .jpeg, .png, .gif, and .webp files are allowed'
        });
      }
    }
  }
  
  next();
};

// Request size validation
const validateRequestSize = (req, res, next) => {
  const contentLength = parseInt(req.headers['content-length'] || '0');
  const maxSize = 20 * 1024 * 1024; // 20MB
  
  if (contentLength > maxSize) {
    return res.status(413).json({
      error: 'Request too large',
      message: 'Request size must be less than 20MB'
    });
  }
  
  next();
};

// CORS security enhancement
const corsSecurity = (req, res, next) => {
  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY');
  
  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // XSS protection
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Referrer policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Permissions policy
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  
  next();
};

// SQL injection protection (for MongoDB)
const mongoSanitization = mongoSanitize({
  replaceWith: '_'
});

// XSS protection
const xssProtection = xss();

// HTTP Parameter Pollution protection
const hppProtection = hpp();

// Request logging for security monitoring
const securityLogger = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logData = {
      timestamp: new Date().toISOString(),
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      userAgent: req.get('User-Agent'),
      ip: req.ip || req.connection.remoteAddress,
      userId: req.user ? req.user._id : 'anonymous'
    };
    
    // Log suspicious activities
    if (res.statusCode >= 400) {
      }
    
    // Log potential attacks
    if (req.originalUrl.includes('<script>') || 
        req.originalUrl.includes('javascript:') ||
        req.originalUrl.includes('../../') ||
        req.originalUrl.includes('..\\')) {
      }
  });
  
  next();
};

module.exports = {
  authLimiter,
  apiLimiter,
  uploadLimiter,
  securityHeaders,
  sanitizeInput,
  validateFileUpload,
  validateRequestSize,
  corsSecurity,
  mongoSanitization,
  xssProtection,
  hppProtection,
  securityLogger
};
