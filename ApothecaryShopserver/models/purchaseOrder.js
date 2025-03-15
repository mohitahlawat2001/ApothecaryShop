const mongoose = require('mongoose');

const purchaseOrderSchema = new mongoose.Schema({
  poNumber: {
    type: String,
    required: true,
    unique: true
  },
  supplier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Supplier',
    required: true
  },
  status: {
    type: String,
    enum: ['draft', 'submitted', 'approved', 'shipped', 'received', 'cancelled', 'partially_received'],
    default: 'draft'
  },
  orderDate: {
    type: Date,
    default: Date.now
  },
  expectedDeliveryDate: {
    type: Date
  },
  actualDeliveryDate: {
    type: Date
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
      drugCode: {
        type: Number
      },
      groupName: {
        type: String
      },
      unitSize: {
        type: String
      },
      quantity: {
        type: Number,
        required: true,
        min: 1
      },
      unitPrice: {
        type: Number,
        required: true,
        min: 0
      },
      discount: {
        type: Number,
        default: 0,
        min: 0
      },
      tax: {
        type: Number,
        default: 0,
        min: 0
      },
      totalPrice: {
        type: Number,
        required: true
      },
      receivedQuantity: {
        type: Number,
        default: 0
      }
    }
  ],
  subtotal: {
    type: Number,
    required: true
  },
  taxAmount: {
    type: Number,
    default: 0
  },
  discountAmount: {
    type: Number,
    default: 0
  },
  shippingCost: {
    type: Number,
    default: 0
  },
  totalAmount: {
    type: Number,
    required: true
  },
  notes: {
    type: String
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvalDate: {
    type: Date
  },
  paymentTerms: {
    type: String
  },
  paymentStatus: {
    type: String,
    enum: ['unpaid', 'partially_paid', 'paid'],
    default: 'unpaid'
  },
  invoiceNumber: {
    type: String
  }
}, { timestamps: true });

// Generate PO Number
purchaseOrderSchema.pre('save', async function(next) {
  if (!this.isNew) {
    return next();
  }
  
  const currentDate = new Date();
  const year = currentDate.getFullYear().toString().substr(-2);
  const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
  
  const lastPO = await this.constructor.findOne({}, {}, { sort: { 'poNumber': -1 } });
  let number = 1;
  
  if (lastPO && lastPO.poNumber) {
    const lastNumber = parseInt(lastPO.poNumber.split('-')[2], 10);
    if (!isNaN(lastNumber)) {
      number = lastNumber + 1;
    }
  }
  
  this.poNumber = `PO-${year}${month}-${number.toString().padStart(4, '0')}`;
  next();
});

module.exports = mongoose.model('PurchaseOrder', purchaseOrderSchema);