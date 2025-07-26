const mongoose = require('mongoose');

const batchSchema = new mongoose.Schema({
  batchNumber: {
    type: String,
    required: true,
    index: true
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  supplier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Supplier',
    required: true
  },
  manufacturingDate: {
    type: Date,
    required: true
  },
  expiryDate: {
    type: Date,
    required: true
  },
  initialQuantity: {
    type: Number,
    required: true,
    min: 0
  },
  currentQuantity: {
    type: Number,
    required: true,
    min: 0
  },
  unitCost: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['active', 'expired', 'recalled', 'depleted'],
    default: 'active'
  },
  // Barcode/QR code for batch tracking
  barcode: {
    type: String,
    sparse: true,
    index: true
  },
  qrCode: {
    type: String,
    sparse: true,
    index: true
  },
  // Storage conditions monitoring
  storageConditions: {
    temperature: {
      min: { type: Number }, // Celsius
      max: { type: Number }, // Celsius
      current: { type: Number },
      lastUpdated: { type: Date }
    },
    humidity: {
      min: { type: Number }, // Percentage
      max: { type: Number }, // Percentage
      current: { type: Number },
      lastUpdated: { type: Date }
    },
    lightExposure: {
      type: String,
      enum: ['protected', 'normal', 'exposed'],
      default: 'normal'
    }
  },
  // Quality control information
  qualityControl: {
    tested: { type: Boolean, default: false },
    testDate: { type: Date },
    testResults: { type: String },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  // Regulatory compliance
  regulatoryInfo: {
    lotNumber: { type: String },
    ndcNumber: { type: String }, // National Drug Code
    fdaApprovalNumber: { type: String },
    complianceChecked: { type: Boolean, default: false },
    complianceDate: { type: Date }
  },
  // Purchase information
  purchaseReceipt: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PurchaseReceipt'
  },
  receivedDate: {
    type: Date,
    default: Date.now
  },
  receivedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  // Alerts and notifications
  alerts: [{
    type: {
      type: String,
      enum: ['expiry_warning', 'temperature_violation', 'low_stock', 'recall_notice'],
      required: true
    },
    message: { type: String, required: true },
    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium'
    },
    triggered: { type: Date, default: Date.now },
    acknowledged: { type: Boolean, default: false },
    acknowledgedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    acknowledgedAt: { type: Date }
  }],
  // Notes and comments
  notes: { type: String },
  lastModifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Compound index for efficient queries
batchSchema.index({ product: 1, batchNumber: 1 }, { unique: true });
batchSchema.index({ expiryDate: 1, status: 1 });
batchSchema.index({ 'storageConditions.temperature.current': 1 });

// Pre-save middleware to update status based on expiry date
batchSchema.pre('save', function(next) {
  if (this.expiryDate && this.expiryDate < new Date() && this.status === 'active') {
    this.status = 'expired';
  }
  
  if (this.currentQuantity === 0 && this.status === 'active') {
    this.status = 'depleted';
  }

  next();
});

// Virtual to check if batch is near expiry (within 30 days)
batchSchema.virtual('isNearExpiry').get(function() {
  const today = new Date();
  const thirtyDaysFromNow = new Date(today.getTime() + (30 * 24 * 60 * 60 * 1000));
  return this.expiryDate <= thirtyDaysFromNow && this.expiryDate > today;
});

// Virtual to check if batch is expired
batchSchema.virtual('isExpired').get(function() {
  return this.expiryDate < new Date();
});

// Virtual to calculate days until expiry
batchSchema.virtual('daysUntilExpiry').get(function() {
  const today = new Date();
  const diffTime = this.expiryDate - today;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Method to add alert
batchSchema.methods.addAlert = function(type, message, severity = 'medium') {
  this.alerts.push({
    type,
    message,
    severity,
    triggered: new Date()
  });
  return this.save();
};

// Method to acknowledge alert
batchSchema.methods.acknowledgeAlert = function(alertId, userId) {
  const alert = this.alerts.id(alertId);
  if (alert) {
    alert.acknowledged = true;
    alert.acknowledgedBy = userId;
    alert.acknowledgedAt = new Date();
    return this.save();
  }
  return Promise.reject(new Error('Alert not found'));
};

// Static method to find batches expiring soon
batchSchema.statics.findExpiringBatches = function(days = 30) {
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + days);
  
  return this.find({
    expiryDate: { $lte: futureDate, $gt: new Date() },
    status: 'active',
    currentQuantity: { $gt: 0 }
  }).populate('product supplier');
};

// Static method to find expired batches
batchSchema.statics.findExpiredBatches = function() {
  return this.find({
    expiryDate: { $lt: new Date() },
    status: { $in: ['active', 'expired'] },
    currentQuantity: { $gt: 0 }
  }).populate('product supplier');
};

module.exports = mongoose.model('Batch', batchSchema);