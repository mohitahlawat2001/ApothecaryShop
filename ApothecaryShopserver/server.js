const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const passport = require('passport');
const User = require('./models/user');
// OAUTH imports
require('./config/passport.config');
// Middleware imports
const cookieParser = require('cookie-parser');
const authMiddleware = require('./middleware/auth');
// Swagger imports
const { specs, swaggerUi, swaggerOptions } = require('./config/swagger');
// Routes imports
const supplierRoutes = require('./routes/suppliers');
const purchaseOrderRoutes = require('./routes/purchaseOrders');
const purchaseReceiptRoutes = require('./routes/purchaseReceipts');
const externalProductRoutes = require('./routes/externalProducts');
const distributionRoutes = require('./routes/distribution');
const maomaoAiRoutes = require('./routes/maomaoAi'); // Import MaoMao AI routes
const visionRoutes = require('./routes/visionRoutes'); // Import Vision routes
const googleRoutes = require('./routes/google'); // Import Google OAuth routes
const facebookRoutes = require('./routes/facebook'); // Import Facebook OAuth routes

dotenv.config();
const app = express();

// Trust proxy (needed when behind reverse proxies/load balancers)
if (process.env.TRUST_PROXY === '1') {
  app.set('trust proxy', 1);
}

// ----------------------------------------------------------------------------
// Rate limiting (configurable via environment variables)
// ----------------------------------------------------------------------------
const RATE_LIMIT_WINDOW_MS = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10); // 15 minutes
const RATE_LIMIT_MAX = parseInt(process.env.RATE_LIMIT_MAX || '100', 10); // 100 requests per window per IP

const AUTH_RATE_LIMIT_WINDOW_MS = parseInt(process.env.AUTH_RATE_LIMIT_WINDOW_MS || '60000', 10); // 1 minute
const AUTH_RATE_LIMIT_MAX = parseInt(process.env.AUTH_RATE_LIMIT_MAX || '5', 10); // 5 requests per window per IP

const commonRateLimitOptions = {
  standardHeaders: true,   // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false,    // Disable the `X-RateLimit-*` headers
  handler: (req, res /*, next, options */) => {
    return res.status(429).json({
      success: false,
      message: 'Too many requests, please try again later.',
      timestamp: new Date().toISOString()
    });
  }
};

// Global limiter for all routes (skip Swagger docs to keep them accessible)
const globalLimiter = rateLimit({
  ...commonRateLimitOptions,
  windowMs: RATE_LIMIT_WINDOW_MS,
  max: RATE_LIMIT_MAX,
  skip: (req) => req.path.startsWith('/api-docs')
});

// Stricter limiter for authentication-related endpoints
const authLimiter = rateLimit({
  ...commonRateLimitOptions,
  windowMs: AUTH_RATE_LIMIT_WINDOW_MS,
  max: AUTH_RATE_LIMIT_MAX
});

// CORS configuration
const allowedOrigins = [
  'http://localhost:5173',                  // Frontend development server
  'http://localhost:5000',                  // Local development
  'https://your-deployed-frontend-url.com', // Replace with your actual deployed frontend URL
  process.env.FRONTEND_URL                  // Optional: configure via environment variable
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('Blocked by CORS:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true // Allow credentials (cookies, authorization headers)
};

// Middleware
app.use(passport.initialize());
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());
app.use(globalLimiter);

// Database connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Swagger UI route
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, swaggerOptions));

// Root route (Optional: for testing auth links)
// app.get('/', (req, res) => {
//   res.send(`
//     <h1>ApothecaryShop API</h1>
//     <a href='/api/auth/google'>Login with Google</a><br/>
//     <a href='/api/auth/facebook'>Login with Facebook</a>
//   `);
// });

// Import routes
const productsRouter = require('./routes/products');
const stockMovementRouter = require('./routes/stockMovement');
app.use('/api/suppliers', authMiddleware, supplierRoutes);
app.use('/api/purchase-orders', authMiddleware, purchaseOrderRoutes);
app.use('/api/purchase-receipts', authMiddleware, purchaseReceiptRoutes);
app.use('/api/external-products', authMiddleware, externalProductRoutes);

// Use routes
app.use('/api/products', authMiddleware, productsRouter);
app.use('/api/stockMovements', authMiddleware, stockMovementRouter);
app.use('/api/distributions', authMiddleware, distributionRoutes);

app.use('/api/maomao-ai', authMiddleware, maomaoAiRoutes);
app.use('/api/vision', authMiddleware, visionRoutes); // Add vision routes

// Validation imports
const { validate, handleValidationError } = require('./middleware/validation');
const { userSchemas } = require('./validation/schemas');

// Auth routes
// Apply stricter rate limits to OAuth route groups as well
app.use('/api/auth/google', authLimiter, googleRoutes);
app.use('/api/auth/facebook', authLimiter, facebookRoutes); // Add Facebook OAuth routes

/**
 * @swagger
 * /api/register:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Register a new user
 *     description: Create a new user account with email and password
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserRegistration'
 *           example:
 *             name: "John Smith"
 *             email: "john@example.com"
 *             password: "securepassword123"
 *             role: "staff"
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *             example:
 *               message: "User registered successfully"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Email already exists"
 */
app.post('/api/register', authLimiter, validate({ body: userSchemas.register }), async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ 
        success: false,
        message: 'Email already registered',
        timestamp: new Date().toISOString()
      });
    }

    const user = new User({ name, email, password, role });
    await user.save();
    
    res.status(201).json({ 
      success: true,
      message: 'User registered successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Registration error:', error);
    
    // Handle MongoDB unique index violations (race condition duplicates)
    if (error && error.code === 11000) {
      return res.status(409).json({ 
        success: false,
        message: 'Email already registered',
        timestamp: new Date().toISOString()
      });
    }
    
    res.status(500).json({ 
      success: false,
      message: 'Internal server error during registration',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Registration failed',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * @swagger
 * /api/login:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: User login
 *     description: Authenticate user with email and password, returns JWT token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserLogin'
 *           example:
 *             email: "john@example.com"
 *             password: "securepassword123"
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *             example:
 *               token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *               user:
 *                 id: "60d21b4667d0d8992e610c87"
 *                 name: "John Smith"
 *                 email: "john@example.com"
 *                 role: "staff"
 *                 provider: "local"
 *       400:
 *         description: Invalid credentials or OAuth account
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "Invalid credentials"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
app.post('/api/login', authLimiter, validate({ body: userSchemas.login }), async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    
    // Generic error response to prevent user enumeration
    const genericErrorResponse = {
      success: false,
      message: 'Invalid credentials',
      timestamp: new Date().toISOString()
    };
    
    if (!user) {
      return res.status(400).json(genericErrorResponse);
    }
    
    // Check if user has a password (OAuth users might not have passwords)
    if (!user.password) {
      return res.status(400).json(genericErrorResponse);
    }
    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json(genericErrorResponse);
    }
    
    // Modified token payload to match what your auth middleware expects
    const token = jwt.sign(
      { 
        id: user._id,  // Keep id for backward compatibility
        sub: user._id, // Add sub to match the token format you're receiving
        role: user.role 
      },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );
    
    // Log the token signature method (remove in production)
    console.log('Token signed with JWT_SECRET first 4 chars:', 
      process.env.JWT_SECRET?.substring(0, 4) || 'undefined');
    
    res.json({ 
      success: true,
      token, 
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email, 
        role: user.role,
        provider: user.provider,
        avatar: user.avatar 
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Internal server error during login',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Login failed',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * @swagger
 * /api/profile:
 *   get:
 *     tags:
 *       - Authentication
 *     summary: Get current user profile
 *     description: Retrieve the profile information of the currently authenticated user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *             example:
 *               user:
 *                 _id: "60d21b4667d0d8992e610c87"
 *                 name: "John Smith"
 *                 email: "john@example.com"
 *                 role: "staff"
 *                 provider: "local"
 *                 createdAt: "2023-06-15T10:30:00.000Z"
 *                 updatedAt: "2023-06-15T10:30:00.000Z"
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "Access denied. No token provided."
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
app.get('/api/profile', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json({ 
      success: true,
      data: { user },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching user profile',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
      timestamp: new Date().toISOString()
    });
  }
});

const PORT = process.env.PORT || 5000;

// Only start the server if this file is run directly (not required by tests)
let server;
if (process.env.NODE_ENV !== 'test') {
  server = app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

// Simple test-only route to validate global rate limiting without auth
if (process.env.NODE_ENV === 'test') {
  app.get('/__test__/ping', (req, res) => {
    res.json({ ok: true, timestamp: new Date().toISOString() });
  });
}

// Export for testing
module.exports = {
  app,
  closeServer: () => {
    if (server) return server.close();
  }
};