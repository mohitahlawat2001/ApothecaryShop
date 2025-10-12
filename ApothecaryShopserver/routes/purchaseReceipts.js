const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const PurchaseReceipt = require('../models/purchaseReceipt');
const PurchaseOrder = require('../models/purchaseOrder');
const Product = require('../models/Product');
const StockMovement = require('../models/StockMovement');
const { adminOnly } = require('../middleware/roleCheck');

/**
 * @swagger
 * /api/purchase-receipts:
 *   get:
 *     tags:
 *       - Purchase Receipts
 *     summary: Get all purchase receipts
 *     description: Retrieve all purchase receipts with populated reference data
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all purchase receipts
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *   post:
 *     tags:
 *       - Purchase Receipts
 *     summary: Create a purchase receipt
 *     description: Create a new purchase receipt and automatically update inventory
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - purchaseOrder
 *               - items
 *             properties:
 *               purchaseOrder:
 *                 type: string
 *                 example: "60d21b4667d0d8992e610c85"
 *               receiptDate:
 *                 type: string
 *                 format: date-time
 *                 example: "2023-12-10T10:30:00.000Z"
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     product:
 *                       type: string
 *                       example: "60d21b4667d0d8992e610c86"
 *                     genericName:
 *                       type: string
 *                       example: "Paracetamol"
 *                     groupName:
 *                       type: string
 *                       example: "Analgesics"
 *                     unitSize:
 *                       type: string
 *                       example: "10's"
 *                     expectedQuantity:
 *                       type: integer
 *                       example: 100
 *                     receivedQuantity:
 *                       type: integer
 *                       example: 100
 *                     batchNumber:
 *                       type: string
 *                       example: "BATCH123"
 *                     expiryDate:
 *                       type: string
 *                       format: date
 *                       example: "2025-10-10"
 *                     unitPrice:
 *                       type: number
 *                       format: float
 *                       example: 5.99
 *     responses:
 *       201:
 *         description: Purchase receipt created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       400:
 *         description: Bad request - Invalid data or business logic error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Purchase order not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/', async (req, res) => {
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

/**
 * @swagger
 * /api/purchase-receipts/{id}:
 *   get:
 *     tags:
 *       - Purchase Receipts
 *     summary: Get a purchase receipt by ID
 *     description: Retrieve a single purchase receipt with populated reference data
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Purchase receipt ID
 *         example: "60d21b4667d0d8992e610c85"
 *     responses:
 *       200:
 *         description: Purchase receipt found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       404:
 *         description: Receipt not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:id', async (req, res) => {
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
router.post('/', async (req, res) => {
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
    
    // Generate receipt number
    const date = new Date();
    const dateStr = date.getFullYear().toString() + 
                   (date.getMonth() + 1).toString().padStart(2, '0') + 
                   date.getDate().toString().padStart(2, '0');
    
    // Find the last receipt number for today to increment
    const lastReceipt = await PurchaseReceipt.findOne(
      { receiptNumber: new RegExp(`GRN-${dateStr}-\\d+$`) },
      {},
      { sort: { receiptNumber: -1 } }
    ).session(session);
    
    let sequenceNumber = 1;
    if (lastReceipt && lastReceipt.receiptNumber) {
      // Extract the sequence number from the last receipt number
      const parts = lastReceipt.receiptNumber.split('-');
      if (parts.length === 3) {
        sequenceNumber = parseInt(parts[2]) + 1;
      }
    }
    
    const receiptNumber = `GRN-${dateStr}-${sequenceNumber.toString().padStart(4, '0')}`;
    
    // Create receipt with the generated receipt number
    const receipt = new PurchaseReceipt({
      ...req.body,
      receiptNumber,
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
      
      // Check if product exists in our system
      if (receiptItem.product) {
        // Update existing product stock
        const product = await Product.findById(receiptItem.product).session(session);
        
        if (product) {
          // Update stock quantity
          const previousStock = product.stockQuantity;
          product.stockQuantity += receiptItem.receivedQuantity;
          
          // Set category from groupName if provided
          if (receiptItem.groupName) {
            product.category = receiptItem.groupName;
          }
          
          // Update description to include unitSize if provided
          if (receiptItem.unitSize) {
            product.description = product.description ? 
              `${product.description} | Unit Size: ${receiptItem.unitSize}` : 
              `Unit Size: ${receiptItem.unitSize}`;
          }
          
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
      } else if (receiptItem.externalProductId) {
        // Look for a product with matching name
        let product = await Product.findOne({
          genericName: { $regex: new RegExp(receiptItem.genericName, 'i') }
        }).session(session);
        
        // If product doesn't exist, create a new one
        if (!product) {
          product = new Product({
            name: receiptItem.genericName,
            genericName: receiptItem.genericName,
            // Set category as groupName with fallback
            category: receiptItem.groupName || 'General',
            manufacturer: purchaseOrder.supplier ? 'From Supplier' : 'External',
            batchNumber: receiptItem.batchNumber,
            expiryDate: receiptItem.expiryDate,
            stockQuantity: receiptItem.receivedQuantity,
            unitPrice: receiptItem.unitPrice,
            reorderLevel: 10, // Default reorder level
            // Include unitSize in description
            description: `Imported via Purchase Receipt ${receipt.receiptNumber}${receiptItem.unitSize ? ` | Unit Size: ${receiptItem.unitSize}` : ''}`
          });
          
          await product.save({ session });
          
          // Create stock movement record
          const stockMovement = new StockMovement({
            product: product._id,
            type: 'in',
            quantity: receiptItem.receivedQuantity,
            previousStock: 0,
            newStock: receiptItem.receivedQuantity,
            reason: `New Product from Purchase Receipt: ${receipt.receiptNumber}`,
            batchNumber: receiptItem.batchNumber,
            expiryDate: receiptItem.expiryDate,
            createdBy: req.user.id,
            purchaseReceipt: receipt._id
          });
          
          await stockMovement.save({ session });
        } else {
          // Update existing product found by name
          const previousStock = product.stockQuantity;
          product.stockQuantity += receiptItem.receivedQuantity;
          
          // Update batch and expiry if newer
          if (!product.expiryDate || new Date(receiptItem.expiryDate) > new Date(product.expiryDate)) {
            product.batchNumber = receiptItem.batchNumber;
            product.expiryDate = receiptItem.expiryDate;
          }
          
          // Update category if groupName provided
          if (receiptItem.groupName) {
            product.category = receiptItem.groupName;
          }
          
          // Update description to include unitSize if provided
          if (receiptItem.unitSize) {
            // Check if description already includes Unit Size
            if (product.description && !product.description.includes('Unit Size:')) {
              product.description = `${product.description} | Unit Size: ${receiptItem.unitSize}`;
            } else if (!product.description) {
              product.description = `Unit Size: ${receiptItem.unitSize}`;
            } else {
              // If Unit Size already exists in description, update it
              product.description = product.description.replace(
                /Unit Size:.*?(?=\||$)/,
                `Unit Size: ${receiptItem.unitSize}`
              );
            }
          }
          
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
        
        // Update receipt item with the associated product
        receiptItem.product = product._id;
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