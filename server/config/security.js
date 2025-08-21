/**
 * Security Configuration
 * 
 * Centralized security settings for the FNizar server
 */

module.exports = {
  // Rate Limiting Configuration
  rateLimiting: {
    auth: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 5, // 5 attempts per window
      message: {
        error: 'Too many authentication attempts',
        message: 'Please try again later'
      }
    },
    api: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // 100 requests per window
      message: {
        error: 'Too many requests',
        message: 'Please try again later'
      }
    },
    upload: {
      windowMs: 60 * 60 * 1000, // 1 hour
      max: 10, // 10 uploads per hour
      message: {
        error: 'Too many file uploads',
        message: 'Please try again later'
      }
    }
  },

  // File Upload Security
  fileUpload: {
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: [
      'image/jpeg',
      'image/jpg', 
      'image/png',
      'image/gif',
      'image/webp'
    ],
    allowedExtensions: ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
    maxFiles: 10
  },

  // Request Limits
  request: {
    maxSize: 20 * 1024 * 1024, // 20MB
    maxFields: 100,
    maxFiles: 10
  },

  // JWT Configuration
  jwt: {
    accessTokenExpiry: '15m',
    refreshTokenExpiry: '7d',
    algorithm: 'HS256'
  },

  // Security Headers
  headers: {
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
    hsts: {
      maxAge: 31536000, // 1 year
      includeSubDomains: true,
      preload: true
    }
  },

  // CORS Configuration
  cors: {
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type', 
      'Authorization', 
      'X-Requested-With', 
      'authorization'
    ],
    exposedHeaders: ['X-Total-Count'],
    maxAge: 86400 // 24 hours
  },

  // Environment Variables Validation
  requiredEnvVars: [
    'JWT_SECRET',
    'JWT_REFRESH_SECRET',
    'MONGO_URI'
  ],

  // Security Monitoring
  monitoring: {
    logSuspiciousActivities: true,
    logFailedAuthAttempts: true,
    logRateLimitViolations: true,
    alertOnPotentialAttacks: true
  },

  // Production Security Settings
  production: {
    requireHttps: true,
    secureCookies: true,
    maskErrorMessages: true,
    disableDebugLogs: true
  }
};
