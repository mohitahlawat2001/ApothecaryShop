const mongoose = require('mongoose');

const distributionSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    required: true,
    unique: true
  },
  recipient: {
    type: String,
    required: true
  },
  recipientType: {
    type: String,
    enum: ['patient', 'pharmacy', 'department', 'hospital'],
    required: true
  },
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    quantity: {
      type: Number,
      required: true
    },
    batchNumber: String,
    expiryDate: Date
  }],
  status: {
    type: String,
    enum: ['pending', 'processed', 'shipped', 'delivered', 'returned', 'cancelled'],
    default: 'pending'
  },
  shippingInfo: {
    address: String,
    contactPerson: String,
    contactNumber: String
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  deliveredAt: Date
});

// Pre-save middleware to auto-generate order number
distributionSchema.pre('save', async function(next) {
  if (!this.orderNumber) {
    // Format: DO-YYYYMMDD-XXXX (Distribution Order)
    const date = new Date();
    const dateStr = date.getFullYear().toString() + 
                   (date.getMonth() + 1).toString().padStart(2, '0') + 
                   date.getDate().toString().padStart(2, '0');
    
    const lastOrder = await this.constructor.findOne({}, {}, { sort: { 'createdAt': -1 } });
    let counter = 1;
    
    if (lastOrder && lastOrder.orderNumber) {
      const lastCounter = parseInt(lastOrder.orderNumber.split('-')[2]);
      counter = isNaN(lastCounter) ? 1 : lastCounter + 1;
    }
    
    this.orderNumber = `DO-${dateStr}-${counter.toString().padStart(4, '0')}`;
  }
  next();
});

const Distribution = mongoose.model('Distribution', distributionSchema);

module.exports = Distribution;