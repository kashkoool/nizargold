const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Add security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  next();
});

// Add debugging information
console.log('=== BACKEND SERVER STARTING ===');
console.log('Environment:', process.env.NODE_ENV || 'development');
console.log('Port:', process.env.PORT || 5001);
console.log('MongoDB URI:', process.env.MONGO_URI ? 'Set' : 'Not set');

// Configure CORS to allow requests from the React app and mobile devices
app.use(cors({
  origin: [
    'http://localhost:3002', 
    'http://localhost:3000',
    'http://192.168.1.100:3002',
    'http://192.168.1.101:3002',
    'http://192.168.1.102:3002',
    'http://192.168.1.103:3002',
    'http://192.168.1.104:3002',
    'http://192.168.1.105:3002',
    'http://10.0.0.100:3002',
    'http://10.0.0.101:3002',
    'http://10.0.0.102:3002',
    'http://10.0.0.103:3002',
    'http://10.0.0.104:3002',
    'http://10.0.0.105:3002',
    // Add Railway domains here
    process.env.CLIENT_URL,
    process.env.RAILWAY_STATIC_URL,
    // Add Vercel domain
    'https://nizargold.vercel.app'
  ].filter(Boolean), // Remove undefined values
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ limit: '20mb', extended: true }));
app.use('/uploads', express.static('uploads'));

const routes = require('./routes');
app.use('/api', routes);

const PORT = process.env.PORT || 5001;

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

// Example route
app.get('/', (req, res) => {
  console.log('Backend API endpoint hit:', req.path);
  res.status(404).send('Not Found');
});

// Health check endpoint for Railway
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Test route for debugging
app.get('/test', (req, res) => {
  res.json({ message: 'Backend Server is working!', timestamp: new Date().toISOString() });
});

// Debug route to check if API routes are loaded
app.get('/api-debug', (req, res) => {
  res.json({ 
    message: 'API routes are accessible',
    timestamp: new Date().toISOString(),
    routes: app._router.stack.filter(r => r.route).map(r => Object.keys(r.route.methods)[0] + ' ' + r.route.path)
  });
});

// Debug route to check products routes specifically
app.get('/api/products-debug', (req, res) => {
  res.json({ 
    message: 'Products routes are accessible',
    timestamp: new Date().toISOString(),
    availableRoutes: [
      'GET /api/products',
      'GET /api/products/favorites/user',
      'GET /api/products/favorites/count',
      'POST /api/products/:id/like'
    ]
  });
});

app.listen(PORT, () => {
  console.log(`=== BACKEND SERVER RUNNING ON PORT ${PORT} ===`);
});