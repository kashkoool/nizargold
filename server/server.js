const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();

// Import security middleware
const {
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
} = require('./middleware/security');

const app = express();

// ============================================================================
// SECURITY MIDDLEWARE
// ============================================================================

// Apply security headers
app.use(securityHeaders);

// Apply rate limiting
app.use('/api/users/login', authLimiter);
app.use('/api/users/register', authLimiter);
app.use('/api/products', uploadLimiter);
app.use('/api', apiLimiter);

// Apply security protections
app.use(mongoSanitization);
app.use(xssProtection);
app.use(hppProtection);
app.use(securityLogger);
app.use(validateRequestSize);
app.use(sanitizeInput);

// ============================================================================
// CORS CONFIGURATION
// ============================================================================

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      // Development
      'http://localhost:3000',
      'http://localhost:3002',
      
      // Production
      process.env.CLIENT_URL,
      process.env.RAILWAY_STATIC_URL,
      'https://nizargold.vercel.app'
    ].filter(Boolean);
    
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'authorization'],
  exposedHeaders: ['X-Total-Count'],
  maxAge: 86400 // 24 hours
};

app.use(cors(corsOptions));

// Apply additional CORS security
app.use(corsSecurity);

// ============================================================================
// REQUEST PARSING MIDDLEWARE
// ============================================================================

// Handle FormData and JSON parsing
app.use((req, res, next) => {
  // Skip JSON parsing for multipart/form-data (FormData)
  if (req.headers['content-type'] && req.headers['content-type'].includes('multipart/form-data')) {
    return next();
  }
  // For other content types, use JSON parsing
  express.json({ limit: '20mb' })(req, res, next);
});

app.use(express.urlencoded({ limit: '20mb', extended: true }));
app.use(cookieParser());

// ============================================================================
// STATIC FILES
// ============================================================================

app.use('/uploads', express.static('uploads'));

// ============================================================================
// ROUTES
// ============================================================================

const routes = require('./routes');
app.use('/api', routes);

// ============================================================================
// HEALTH CHECK & MONITORING
// ============================================================================

// Health check endpoint for deployment platforms
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// CORS test endpoint
app.get('/cors-test', (req, res) => {
  res.status(200).json({ 
    message: 'CORS is working!',
    origin: req.headers.origin,
    timestamp: new Date().toISOString()
  });
});

// ============================================================================
// ERROR HANDLING
// ============================================================================

// Global error handler
app.use((err, req, res, next) => {
  // Don't expose internal errors in production
  const errorMessage = process.env.NODE_ENV === 'production' 
    ? 'Internal server error' 
    : err.message;
  
  res.status(500).json({
    error: 'Internal server error',
    message: errorMessage,
    timestamp: new Date().toISOString()
  });
});

// 404 handler for unmatched routes
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    path: req.originalUrl,
    timestamp: new Date().toISOString()
  });
});

// ============================================================================
// DATABASE CONNECTION
// ============================================================================

const connectDB = async () => {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI, {
        
      });
      console.log('✅ MongoDB connected successfully');
    } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

// ============================================================================
// SERVER STARTUP
// ============================================================================

const PORT = process.env.PORT || 5001;

const startServer = async () => {
  try {
    console.log('🔄 Starting server initialization...');
    console.log(`📊 Port: ${PORT}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔗 MongoDB URI: ${process.env.MONGO_URI ? 'Set' : 'Not set'}`);
    
    // Connect to database
    await connectDB();
    
    // Start server
    app.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT}`);
        console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
        console.log(`📊 Health check: http://localhost:${PORT}/health`);
        console.log(`✅ Server ready to accept requests`);
      });
  } catch (error) {
    console.error('❌ Server startup failed:', error);
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on('SIGTERM', () => {
  mongoose.connection.close(() => {
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  mongoose.connection.close(() => {
    process.exit(0);
  });
});

// Start the server
startServer();