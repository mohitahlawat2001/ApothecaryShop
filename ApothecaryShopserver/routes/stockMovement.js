const express = require('express');
const router = express.Router();
const StockMovement = require('../models/StockMovement');
const Product = require('../models/Product');

/**
 * @swagger
 * /api/stockMovements/product/{productId}:
 *   get:
 *     tags:
 *       - Stock Movement
 *     summary: Get stock movements for a product
 *     description: Retrieve all stock movements for a specific product, sorted by creation date (most recent first)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID (MongoDB ObjectId)
 *         example: "60d21b4667d0d8992e610c85"
 *     responses:
 *       200:
 *         description: List of stock movements for the product
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                     example: "60d21b4667d0d8992e610c88"
 *                   product:
 *                     type: string
 *                     example: "60d21b4667d0d8992e610c85"
 *                   type:
 *                     type: string
 *                     enum: ["in", "out"]
 *                     example: "in"
 *                   quantity:
 *                     type: integer
 *                     example: 50
 *                   reason:
 *                     type: string
 *                     example: "Initial inventory"
 *                   previousStock:
 *                     type: integer
 *                     example: 100
 *                   newStock:
 *                     type: integer
 *                     example: 150
 *                   batchNumber:
 *                     type: string
 *                     example: "B12345"
 *                   expiryDate:
 *                     type: string
 *                     format: date
 *                     example: "2023-12-31"
 *                   createdBy:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                         example: "John Smith"
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *                     example: "2023-06-15T10:30:00.000Z"
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
router.get('/product/:productId', async (req, res) => {
  try {
    const movements = await StockMovement.find({ product: req.params.productId })
      .sort({ createdAt: -1 })
      .populate('createdBy', 'name');
    
    res.json(movements);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/stockMovements:
 *   post:
 *     tags:
 *       - Stock Movement
 *     summary: Add a new stock movement
 *     description: Create a new stock movement record and automatically update the product's stock quantity
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productId
 *               - type
 *               - quantity
 *               - reason
 *             properties:
 *               productId:
 *                 type: string
 *                 description: Product ID (MongoDB ObjectId)
 *                 example: "60d21b4667d0d8992e610c85"
 *               type:
 *                 type: string
 *                 enum: ["in", "out"]
 *                 description: Type of stock movement
 *                 example: "in"
 *               quantity:
 *                 type: integer
 *                 minimum: 1
 *                 description: Number of items to add or remove
 *                 example: 50
 *               reason:
 *                 type: string
 *                 description: Reason for the stock movement
 *                 example: "Initial inventory"
 *               batchNumber:
 *                 type: string
 *                 description: Batch number of the product
 *                 example: "B12345"
 *               expiryDate:
 *                 type: string
 *                 format: date
 *                 description: Expiry date of the product batch
 *                 example: "2023-12-31"
 *           examples:
 *             stockIn:
 *               summary: Stock In Example
 *               value:
 *                 productId: "60d21b4667d0d8992e610c85"
 *                 type: "in"
 *                 quantity: 50
 *                 reason: "Initial inventory"
 *                 batchNumber: "B12345"
 *                 expiryDate: "2023-12-31"
 *             stockOut:
 *               summary: Stock Out Example
 *               value:
 *                 productId: "60d21b4667d0d8992e610c85"
 *                 type: "out"
 *                 quantity: 5
 *                 reason: "Sale to customer"
 *                 batchNumber: "B12345"
 *                 expiryDate: "2023-12-31"
 *     responses:
 *       201:
 *         description: Stock movement created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 stockMovement:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: "60d21b4667d0d8992e610c88"
 *                     product:
 *                       type: string
 *                       example: "60d21b4667d0d8992e610c85"
 *                     type:
 *                       type: string
 *                       example: "in"
 *                     quantity:
 *                       type: integer
 *                       example: 50
 *                     reason:
 *                       type: string
 *                       example: "Initial inventory"
 *                     previousStock:
 *                       type: integer
 *                       example: 100
 *                     newStock:
 *                       type: integer
 *                       example: 150
 *                     batchNumber:
 *                       type: string
 *                       example: "B12345"
 *                     expiryDate:
 *                       type: string
 *                       format: date
 *                       example: "2023-12-31"
 *                     createdBy:
 *                       type: string
 *                       example: "60d21b4667d0d8992e610c87"
 *                 product:
 *                   $ref: '#/components/schemas/Product'
 *       400:
 *         description: Bad request - Invalid data or insufficient stock
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               insufficientStock:
 *                 summary: Insufficient Stock
 *                 value:
 *                   message: "Insufficient stock"
 *               invalidData:
 *                 summary: Invalid Data
 *                 value:
 *                   message: "Invalid input data"
 *       404:
 *         description: Product not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "Product not found"
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
router.post('/', async (req, res) => {
  try {
    const { productId, type, quantity, reason, batchNumber, expiryDate } = req.body;
    
    // Find the product
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    const previousStock = product.stockQuantity;
    
    // Update stock quantity
    if (type === 'in') {
      product.stockQuantity += Number(quantity);
    } else if (type === 'out') {
      if (product.stockQuantity < quantity) {
        return res.status(400).json({ message: 'Insufficient stock' });
      }
      product.stockQuantity -= Number(quantity);
    }
    
    await product.save();
    
    // Create stock movement record
    const stockMovement = new StockMovement({
      product: productId,
      type,
      quantity,
      reason,
      previousStock,
      newStock: product.stockQuantity,
      batchNumber,
      expiryDate,
      createdBy: req.user.id
    });
    
    await stockMovement.save();
    
    res.status(201).json({
      stockMovement,
      product
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;