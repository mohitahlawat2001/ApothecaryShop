// models/User.js

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String },
  role: { type: String, default: 'staff', enum: ['admin', 'staff'] },
  googleId: { type: String } // Those loggin in via Oauth will not need password
});

// Hash password before saving
UserSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();
  
  // Also, don't try to hash an empty password for OAuth users
  if (!this.password) return next();
  
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Export the model directly
const User = mongoose.model('User', UserSchema);

module.exports = User;