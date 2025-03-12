const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

dotenv.config();
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// User model (simplified)
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'staff', enum: ['admin', 'staff'] }
});

// Hash password before saving
UserSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

const User = mongoose.model('User', UserSchema);

// Import routes
const productsRouter = require('./routes/products');
const stockMovementRouter = require('./routes/stockMovement');

// Use routes
app.use('/api/products', productsRouter);
app.use('/api/stockMovements', stockMovementRouter);

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

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// Export for testing
module.exports = {
  app,
  server
};