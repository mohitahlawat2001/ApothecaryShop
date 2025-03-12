const express = require('express');
const router = express.Router();
const StockMovement = require('../models/StockMovement');
const Product = require('../models/Product');
const auth = require('../middleware/auth');

/**
 * @route   GET /api/stockMovements/product/:productId
 * @desc    Get stock movements for a product
 * @access  Private
 * @param   productId - MongoDB ID of the product
 * @header  x-auth-token - JWT authentication token
 * 
 * @example
 * GET http://localhost:5000/api/stockMovements/product/60d21b4667d0d8992e610c85
 * Headers:
 *   x-auth-token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 */
router.get('/product/:productId', auth, async (req, res) => {
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
 * @route   POST /api/stockMovements
 * @desc    Add a new stock movement and update product quantity
 * @access  Private
 * @header  x-auth-token - JWT authentication token
 * @body    {productId, type, quantity, reason}
 *          productId: MongoDB ID of the product
 *          type: 'in' or 'out'
 *          quantity: Number of items to add/remove
 *          reason: Reason for the stock movement
 * 
 * @example
 * POST http://localhost:5000/api/stockMovements
 * Headers:
 *   Content-Type: application/json
 *   x-auth-token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 * 
 * Body (Stock In Example):
 * {
 *   "productId": "60d21b4667d0d8992e610c85",
 *   "type": "in",
 *   "quantity": 50,
 *   "reason": "Initial inventory"
 * }
 * 
 * Body (Stock Out Example):
 * {
 *   "productId": "60d21b4667d0d8992e610c85",
 *   "type": "out",
 *   "quantity": 5,
 *   "reason": "Sale to customer"
 * }
 */
router.post('/', auth, async (req, res) => {
  try {
    const { productId, type, quantity, reason } = req.body;
    
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