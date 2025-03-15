const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const PurchaseReceipt = require('../models/purchaseReceipt');
const PurchaseOrder = require('../models/purchaseOrder');
const Product = require('../models/Product');
const StockMovement = require('../models/StockMovement');
const auth = require('../middleware/auth');
const { adminOnly } = require('../middleware/roleCheck');

// Get all purchase receipts
router.get('/', auth, async (req, res) => {
  try {
    const receipts = await PurchaseReceipt.find()
      .populate('purchaseOrder', 'poNumber')
      .populate('receivedBy', 'name')
      .sort({ receiptDate: -1 });
      
    res.status(200).json(receipts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get a single purchase receipt
router.get('/:id', auth, async (req, res) => {
  try {
    const receipt = await PurchaseReceipt.findById(req.params.id)
      .populate('purchaseOrder')
      .populate('receivedBy', 'name')
      .populate('qualityCheck.checkedBy', 'name');
      
    if (!receipt) {
      return res.status(404).json({ message: 'Receipt not found' });
    }
    
    res.status(200).json(receipt);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new purchase receipt
router.post('/', auth, async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    // Check if purchase order exists
    const purchaseOrder = await PurchaseOrder.findById(req.body.purchaseOrder)
      .session(session);
      
    if (!purchaseOrder) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: 'Purchase order not found' });
    }
    
    // Check if PO status is shipped
    if (purchaseOrder.status !== 'shipped' && purchaseOrder.status !== 'partially_received') {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ 
        message: 'Purchase order must be in shipped or partially received status'
      });
    }
    
    // Create receipt
    const receipt = new PurchaseReceipt({
      ...req.body,
      receivedBy: req.user.id
    });
    
    // Process each item - update product stock and record stock movements
    let allItemsFullyReceived = true;
    
    for (const receiptItem of receipt.items) {
      // Find corresponding PO item
      const poItem = purchaseOrder.items.find(
        item => (item.product && item.product.equals(receiptItem.product)) || 
               (item.externalProductId && item.externalProductId === receiptItem.externalProductId)
      );
      
      if (!poItem) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({ 
          message: `Item ${receiptItem.genericName} not found in purchase order`
        });
      }
      
      // Update received quantity in PO
      const newReceivedQty = (poItem.receivedQuantity || 0) + receiptItem.receivedQuantity;
      poItem.receivedQuantity = newReceivedQty;
      
      // Check if all items are fully received
      if (newReceivedQty < poItem.quantity) {
        allItemsFullyReceived = false;
      }
      
      // Update product stock if it exists in our system
      if (receiptItem.product) {
        const product = await Product.findById(receiptItem.product).session(session);
        
        if (product) {
          // Update stock quantity
          const previousStock = product.stockQuantity;
          product.stockQuantity += receiptItem.receivedQuantity;
          await product.save({ session });
          
          // Create stock movement record
          const stockMovement = new StockMovement({
            product: product._id,
            type: 'in',
            quantity: receiptItem.receivedQuantity,
            previousStock,
            newStock: product.stockQuantity,
            reason: `Purchase Receipt: ${receipt.receiptNumber}`,
            batchNumber: receiptItem.batchNumber,
            expiryDate: receiptItem.expiryDate,
            createdBy: req.user.id,
            purchaseReceipt: receipt._id
          });
          
          await stockMovement.save({ session });
        }
      }
    }
    
    // Update PO status
    purchaseOrder.status = allItemsFullyReceived ? 'received' : 'partially_received';
    if (allItemsFullyReceived) {
      purchaseOrder.actualDeliveryDate = receipt.receiptDate;
    }
    
    await purchaseOrder.save({ session });
    await receipt.save({ session });
    
    await session.commitTransaction();
    session.endSession();
    
    await receipt.populate('purchaseOrder', 'poNumber');
    await receipt.populate('receivedBy', 'name');
    
    res.status(201).json(receipt);
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(400).json({ message: error.message });
  }
});

// For documentation purposes - these are the API endpoints for testing in Postman:

/*
GET http://localhost:5000/api/purchase-receipts
- Description: Get all purchase receipts
- Headers: 
  * Authorization: Bearer your-jwt-token
- Response: List of all purchase receipts

GET http://localhost:5000/api/purchase-receipts/:id
- Description: Get a single purchase receipt by ID
- Headers: 
  * Authorization: Bearer your-jwt-token
- Example: GET http://localhost:5000/api/purchase-receipts/60d21b4667d0d8992e610c85
- Response: Single purchase receipt object

POST http://localhost:5000/api/purchase-receipts
- Description: Create a new purchase receipt
- Headers: 
  * Authorization: Bearer your-jwt-token
  * Content-Type: application/json
- Body Example:
  {
    "purchaseOrder": "60d21b4667d0d8992e610c85",
    "receiptDate": "2023-11-10T10:30:00.000Z",
    "items": [
      {
        "product": "60d21b4667d0d8992e610c86",
        "genericName": "Paracetamol",
        "expectedQuantity": 100,
        "receivedQuantity": 100,
        "batchNumber": "BATCH123",
        "expiryDate": "2025-10-10T00:00:00.000Z",
        "unitPrice": 5.99,
        "comments": "All items in good condition"
      }
    ],
    "qualityCheck": {
      "passed": true,
      "notes": "All products passed quality check",
      "checkedBy": "60d21b4667d0d8992e610c87"
    },
    "notes": "Delivery was on time",
    "status": "complete"
  }
- Response: Newly created purchase receipt
*/

module.exports = router;