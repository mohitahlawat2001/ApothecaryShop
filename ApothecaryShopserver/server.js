const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const User = require('./models/user');
//OAUTH import
require('./config/passport.config');
//Middle-ware import
const cookieParser = require('cookie-parser');
//Routes imports
const supplierRoutes = require('./routes/suppliers');
const purchaseOrderRoutes = require('./routes/purchaseOrders');
const purchaseReceiptRoutes = require('./routes/purchaseReceipts');
const externalProductRoutes = require('./routes/externalProducts');
const distributionRoutes = require('./routes/distribution');
const maomaoAiRoutes = require('./routes/maomaoAi'); // Import MaoMao AI routes
const visionRoutes = require('./routes/visionRoutes'); // Import Vision routes
const googleRoutes = require('./routes/google'); // Import Google OAuth routes

dotenv.config();
const app = express();

// CORS configuration
const allowedOrigins = [
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

// Database connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Can use this for testing the google auth
app.get('/',(req,res)=>{
  res.send("<a href='/api/auth/google'>ApothecaryShop - Login with google</a>");
})

// Import routes
const productsRouter = require('./routes/products');
const stockMovementRouter = require('./routes/stockMovement');
app.use('/api/suppliers', supplierRoutes);
app.use('/api/purchase-orders', purchaseOrderRoutes);
app.use('/api/purchase-receipts', purchaseReceiptRoutes);
app.use('/api/external-products', externalProductRoutes);

// Use routes
app.use('/api/products', productsRouter);
app.use('/api/stockMovements', stockMovementRouter);
app.use('/api/distributions', distributionRoutes);

app.use('/api/maomao-ai', maomaoAiRoutes);
app.use('/api/vision', visionRoutes); // Add vision routes

// Auth routes
// POST http://localhost:5000/api/register
// Body: { "name": "Test User", "email": "test@example.com", "password": "password123", "role": "staff" }
app.post('/api/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const user = new User({ name, email, password, role });
    await user.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST http://localhost:5000/api/login
// Body: { "email": "test@example.com", "password": "password123" }
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });
    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });
    
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
    
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.use('/api/auth/google', googleRoutes);

const PORT = process.env.PORT || 5000;

// Only start the server if this file is run directly (not required by tests)
let server;
if (process.env.NODE_ENV !== 'test') {
  server = app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

// Export for testing
module.exports = {
  app,
  closeServer: () => {
    if (server) return server.close();
  }
};