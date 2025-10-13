const express = require('express');
const router = express.Router();
const Distribution = require('../models/distribution');
const Product = require('../models/Product');
const StockMovement = require('../models/StockMovement'); // Add this import
const auth = require('../middleware/auth');

/**
 * @swagger
 * /api/distributions:
 *   post:
 *     tags:
 *       - Distributions
 *     summary: Create a new distribution order
 *     description: Create a distribution order and automatically update inventory
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - recipient
 *               - recipientType
 *               - items
 *             properties:
 *               recipient:
 *                 type: string
 *                 example: "City General Hospital"
 *               recipientType:
 *                 type: string
 *                 enum: ["patient", "pharmacy", "department", "hospital"]
 *                 example: "hospital"
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     product:
 *                       type: string
 *                       example: "60d21b4667d0d8992e610c85"
 *                     quantity:
 *                       type: integer
 *                       example: 50
 *                     batchNumber:
 *                       type: string
 *                       example: "B12345"
 *                     expiryDate:
 *                       type: string
 *                       format: date
 *                       example: "2024-12-31"
 *               shippingInfo:
 *                 type: object
 *                 properties:
 *                   address:
 *                     type: string
 *                     example: "123 Main St, City"
 *                   contactPerson:
 *                     type: string
 *                     example: "Dr. Smith"
 *                   contactNumber:
 *                     type: string
 *                     example: "555-1234"
 *     responses:
 *       201:
 *         description: Distribution order created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       400:
 *         description: Bad request - Insufficient stock or invalid data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Product not found
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
router.post('/', auth, async (req, res) => {
  try {
    const { recipient, recipientType, items, shippingInfo } = req.body;
    
    // Validate inventory availability
    for (const item of items) {
      const product = await Product.findById(item.product);
      
      if (!product) {
        return res.status(404).json({ message: `Product with ID ${item.product} not found` });
      }
      
      if (product.stockQuantity < item.quantity) {
        return res.status(400).json({ 
          message: `Insufficient stock for ${product.name}. Available: ${product.stockQuantity}, Requested: ${item.quantity}` 
        });
      }
    }
    
    // Create distribution record
    const distribution = new Distribution({
      recipient,
      recipientType,
      items,
      shippingInfo,
      createdBy: req.user.id,
      // Set a temporary orderNumber to satisfy validation
      orderNumber: 'TEMP-' + Date.now()
    });
    
    // The pre-save middleware will replace the temporary orderNumber
    await distribution.save();
    
    // Update inventory quantities and create stock movements
    for (const item of items) {
      const product = await Product.findById(item.product);
      const previousStock = product.stockQuantity;
      
      await Product.findByIdAndUpdate(
        item.product, 
        { $inc: { stockQuantity: -item.quantity } }
      );
      
      // Create stock movement record
      const stockMovement = new StockMovement({
        product: item.product,
        type: 'out',
        quantity: item.quantity,
        reason: `Distribution to ${recipientType}: ${recipient} (Order: ${distribution.orderNumber})`,
        previousStock,
        newStock: previousStock - item.quantity,
        batchNumber: item.batchNumber || '',
        expiryDate: item.expiryDate,
        createdBy: req.user.id
      });
      
      await stockMovement.save();
    }
    
    res.status(201).json(distribution);
  } catch (error) {
    console.error('Error creating distribution:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * @swagger
 * /api/distributions:
 *   get:
 *     tags:
 *       - Distributions
 *     summary: Get all distribution orders
 *     description: Retrieve all distribution orders with optional filtering
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: ["pending", "processed", "shipped", "delivered", "returned", "cancelled"]
 *         description: Filter by distribution status
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter distributions created after this date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter distributions created before this date
 *       - in: query
 *         name: recipient
 *         schema:
 *           type: string
 *         description: Search by recipient name (case insensitive)
 *     responses:
 *       200:
 *         description: List of distribution orders
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
 */
router.get('/', auth, async (req, res) => {
  try {
    const { status, startDate, endDate, recipient } = req.query;
    const query = {};
    
    if (status) query.status = status;
    if (recipient) query.recipient = { $regex: recipient, $options: 'i' };
    
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }
    
    const distributions = await Distribution.find(query)
      .populate('items.product', 'name code')
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });
    
    res.json(distributions);
  } catch (error) {
    console.error('Error fetching distributions:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get distribution by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const distribution = await Distribution.findById(req.params.id)
      .populate('items.product')
      .populate('createdBy', 'name');
    
    if (!distribution) {
      return res.status(404).json({ message: 'Distribution order not found' });
    }
    
    res.json(distribution);
  } catch (error) {
    console.error('Error fetching distribution:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update distribution status
router.patch('/:id/status', auth, async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'processed', 'shipped', 'delivered', 'returned', 'cancelled'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    
    const distribution = await Distribution.findById(req.params.id);
    
    if (!distribution) {
      return res.status(404).json({ message: 'Distribution order not found' });
    }
    
    // Handle stock adjustments for returns or cancellations
    if ((status === 'returned' || status === 'cancelled') && 
        distribution.status !== 'returned' && distribution.status !== 'cancelled') {
      // Return items to inventory
      for (const item of distribution.items) {
        const product = await Product.findById(item.product);
        const previousStock = product.stockQuantity;
        
        await Product.findByIdAndUpdate(
          item.product, 
          { $inc: { stockQuantity: item.quantity } }
        );
        
        // Create stock movement record for return
        const stockMovement = new StockMovement({
          product: item.product,
          type: 'in',
          quantity: item.quantity,
          reason: `${status === 'returned' ? 'Return' : 'Cancellation'} of distribution ${distribution.orderNumber}`,
          previousStock,
          newStock: previousStock + item.quantity,
          batchNumber: item.batchNumber || '',
          expiryDate: item.expiryDate,
          createdBy: req.user.id
        });
        
        await stockMovement.save();
      }
    }
    
    // Update delivery date if status is delivered
    const updates = { status, updatedAt: new Date() };
    if (status === 'delivered') {
      updates.deliveredAt = new Date();
    }
    
    const updatedDistribution = await Distribution.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true }
    ).populate('items.product');
    
    res.json(updatedDistribution);
  } catch (error) {
    console.error('Error updating distribution status:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete distribution order (only if pending)
router.delete('/:id', auth, async (req, res) => {
  try {
    const distribution = await Distribution.findById(req.params.id);
    
    if (!distribution) {
      return res.status(404).json({ message: 'Distribution order not found' });
    }
    
    if (distribution.status !== 'pending') {
      return res.status(400).json({ message: 'Only pending distribution orders can be deleted' });
    }
    
    // Return items to inventory
    for (const item of distribution.items) {
      const product = await Product.findById(item.product);
      const previousStock = product.stockQuantity;
      
      await Product.findByIdAndUpdate(
        item.product, 
        { $inc: { stockQuantity: item.quantity } }
      );
      
      // Create stock movement record for deletion
      const stockMovement = new StockMovement({
        product: item.product,
        type: 'in',
        quantity: item.quantity,
        reason: `Deletion of distribution order ${distribution.orderNumber}`,
        previousStock,
        newStock: previousStock + item.quantity,
        batchNumber: item.batchNumber || '',
        expiryDate: item.expiryDate,
        createdBy: req.user.id
      });
      
      await stockMovement.save();
    }
    
    await Distribution.findByIdAndDelete(req.params.id);
    res.json({ message: 'Distribution order deleted successfully' });
  } catch (error) {
    console.error('Error deleting distribution:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Generate distribution report
router.get('/reports/summary', auth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const query = {};
    
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }
    
    // Get counts by status
    const statusCounts = await Distribution.aggregate([
      { $match: query },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    
    // Get top recipients
    const topRecipients = await Distribution.aggregate([
      { $match: query },
      { $group: { _id: '$recipient', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);
    
    // Get most distributed products
    const topProducts = await Distribution.aggregate([
      { $match: query },
      { $unwind: '$items' },
      { $group: { 
        _id: '$items.product', 
        totalQuantity: { $sum: '$items.quantity' } 
      }},
      { $sort: { totalQuantity: -1 } },
      { $limit: 10 }
    ]);
    
    // Populate product details
    const populatedProducts = await Product.populate(
      topProducts, 
      { path: '_id', select: 'name code' }
    );
    
    res.json({
      statusCounts,
      topRecipients,
      topProducts: populatedProducts.map(p => ({
        product: p._id,
        totalQuantity: p.totalQuantity
      }))
    });
  } catch (error) {
    console.error('Error generating distribution report:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;