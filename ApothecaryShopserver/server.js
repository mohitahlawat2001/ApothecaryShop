const dotenv = require('dotenv');
dotenv.config();
console.log('Loaded MONGO_URI:', process.env.MONGO_URI);

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const User = require('./models/user');
// OAUTH import
require('./config/passport.config');
// Middle-ware import
const cookieParser = require('cookie-parser');
// Routes imports
const supplierRoutes = require('./routes/suppliers');
const purchaseOrderRoutes = require('./routes/purchaseOrders');
const purchaseReceiptRoutes = require('./routes/purchaseReceipts');
const externalProductRoutes = require('./routes/externalProducts');
const distributionRoutes = require('./routes/distribution');
const maomaoAiRoutes = require('./routes/maomaoAi');
const visionRoutes = require('./routes/visionRoutes');
const googleRoutes = require('./routes/google');

const app = express();

const allowedOrigins = ['http://localhost:5173', 'http://127.0.0.1:5173'];

app.use(cors({
  origin: function(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));


// Middleware
app.use(passport.initialize());
app.use(express.json());
app.use(cookieParser());

// Database connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Root route (Google auth test link)
app.get('/', (req, res) => {
  res.send("<a href='/api/auth/google'>ApothecaryShop - Login with Google</a>");
});

// Import routes
const productsRouter = require('./routes/products');
const stockMovementRouter = require('./routes/stockMovement');
app.use('/api/suppliers', supplierRoutes);
app.use('/api/purchase-orders', purchaseOrderRoutes);
app.use('/api/purchase-receipts', purchaseReceiptRoutes);
app.use('/api/external-products', externalProductRoutes);
app.use('/api/products', productsRouter);
app.use('/api/stockMovements', stockMovementRouter);
app.use('/api/distributions', distributionRoutes);
app.use('/api/maomao-ai', maomaoAiRoutes);
app.use('/api/vision', visionRoutes);
app.use('/api/auth/google', googleRoutes);

// 🔐 Auth routes
// POST http://localhost:5000/api/register
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
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign(
      {
        id: user._id,
        sub: user._id,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    console.log('Token signed with JWT_SECRET first 4 chars:',
      process.env.JWT_SECRET?.substring(0, 4) || 'undefined');

    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 5000;

// Only start the server if this file is run directly (not required by tests)
let server;
if (process.env.NODE_ENV !== 'test') {
  server = app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
}

// Export for testing
module.exports = {
  app,
  closeServer: () => {
    if (server) return server.close();
  }
};
