const mongoose = require('mongoose');

const purchaseReceiptSchema = new mongoose.Schema({
  receiptNumber: {
    type: String,
    required: true,
    unique: true
  },
  purchaseOrder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PurchaseOrder',
    required: true
  },
  receiptDate: {
    type: Date,
    default: Date.now
  },
  receivedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
      },
      externalProductId: {
        type: Number
      },
      genericName: {
        type: String,
        required: true
      },
      expectedQuantity: {
        type: Number,
        required: true
      },
      receivedQuantity: {
        type: Number,
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
      unitPrice: {
        type: Number,
        required: true
      },
      comments: {
        type: String
      }
    }
  ],
  qualityCheck: {
    passed: {
      type: Boolean,
      default: true
    },
    notes: {
      type: String
    },
    checkedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  notes: {
    type: String
  },
  status: {
    type: String,
    enum: ['complete', 'partial', 'rejected'],
    default: 'complete'
  }
}, { timestamps: true });

// Generate Receipt Number
purchaseReceiptSchema.pre('save', async function(next) {
  if (!this.isNew) {
    return next();
  }
  
  const currentDate = new Date();
  const year = currentDate.getFullYear().toString().substr(-2);
  const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
  
  const lastReceipt = await this.constructor.findOne({}, {}, { sort: { 'receiptNumber': -1 } });
  let number = 1;
  
  if (lastReceipt && lastReceipt.receiptNumber) {
    const lastNumber = parseInt(lastReceipt.receiptNumber.split('-')[2], 10);
    if (!isNaN(lastNumber)) {
      number = lastNumber + 1;
    }
  }
  
  this.receiptNumber = `GRN-${year}${month}-${number.toString().padStart(4, '0')}`;
  next();
});

module.exports = mongoose.model('PurchaseReceipt', purchaseReceiptSchema);