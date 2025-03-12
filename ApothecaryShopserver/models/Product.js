const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  sku: {
    type: String,
    unique: true,
    sparse: true // Allows null/undefined values but enforces uniqueness on actual values
  },
  genericName: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true
  },
  manufacturer: {
    type: String,
    required: true
  },
  batchNumber: {
    type: String,
    required: true
  },
  expiryDate: {
    type: Date,
    required: true
  },
  stockQuantity: {
    type: Number,
    required: true,
    default: 0
  },
  unitPrice: {
    type: Number,
    required: true
  },
  reorderLevel: {
    type: Number,
    required: true
  },
  description: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Pre-save hook to generate SKU if not provided
ProductSchema.pre('save', function(next) {
  if (!this.sku) {
    const timestamp = Date.now().toString().slice(-6);
    const categoryCode = (this.category || 'GEN').substring(0, 3).toUpperCase();
    this.sku = `AP-${categoryCode}-${timestamp}`;
  }
  next();
});

module.exports = mongoose.model('Product', ProductSchema);