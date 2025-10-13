const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { validate } = require('../middleware/validation');
const { productSchemas, paramSchemas } = require('../validation/schemas');

/**
 * Escapes regex metacharacters to prevent ReDoS attacks
 * @param {string} str - The string to escape
 * @returns {string} - The escaped string safe for regex use
 */
const escapeRegex = (str) => {
  if (!str || typeof str !== 'string') return '';
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

/**
 * @swagger
 * /api/products:
 *   get:
 *     tags:
 *       - Products
 *     summary: Get all products
 *     description: Retrieve all products sorted by name
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all products
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
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
router.get('/', validate({ query: paramSchemas.productList }), async (req, res) => {
  try {
    // Use Joi-validated and sanitized query parameters
    const { search, category, sort, page, limit } = req.query;
    
    // Build query filter
    let filter = {};
    if (search) {
      const escapedSearch = escapeRegex(search);
      filter.$or = [
        { name: { $regex: new RegExp(escapedSearch, 'i') } },
        { genericName: { $regex: new RegExp(escapedSearch, 'i') } },
        { manufacturer: { $regex: new RegExp(escapedSearch, 'i') } }
      ];
    }
    if (category) {
      const escapedCategory = escapeRegex(category);
      filter.category = { $regex: new RegExp(escapedCategory, 'i') };
    }

    // Calculate pagination
    const skip = (page - 1) * limit;
    
    const products = await Product.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit);
      
    const total = await Product.countDocuments(filter);
    
    res.json({
      success: true,
      data: products,
      pagination: {
        page: page,
        limit: limit,
        total,
        pages: Math.ceil(total / limit)
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching products',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     tags:
 *       - Products
 *     summary: Get single product by ID
 *     description: Retrieve a specific product by its ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID (MongoDB ObjectId)
 *         example: "60d21b4667d0d8992e610c85"
 *     responses:
 *       200:
 *         description: Product found successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
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
router.get('/:id', validate({ params: paramSchemas.id }), async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ 
        success: false,
        message: 'Product not found',
        timestamp: new Date().toISOString()
      });
    }
    
    res.json({
      success: true,
      data: product,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching product',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * @swagger
 * /api/products:
 *   post:
 *     tags:
 *       - Products
 *     summary: Create a new product
 *     description: Add a new pharmaceutical product to the inventory
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProductInput'
 *           example:
 *             name: "Paracetamol 500mg"
 *             genericName: "Paracetamol"
 *             category: "Pain Relief"
 *             manufacturer: "PharmaCorp Ltd"
 *             batchNumber: "PCM20230615"
 *             expiryDate: "2025-06-15"
 *             stockQuantity: 200
 *             unitPrice: 5.99
 *             reorderLevel: 50
 *             description: "Over-the-counter pain reliever"
 *     responses:
 *       201:
 *         description: Product created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       400:
 *         description: Bad request - Invalid input data
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
router.post('/', validate({ body: productSchemas.create }), async (req, res) => {
  try {
    // Check if a product with the same SKU already exists (if SKU is provided)
    if (req.body.sku) {
      const existingProduct = await Product.findOne({ sku: req.body.sku });
      if (existingProduct) {
        return res.status(400).json({
          success: false,
          message: 'Product with this SKU already exists',
          timestamp: new Date().toISOString()
        });
      }
    }

    const newProduct = new Product(req.body);
    const product = await newProduct.save();
    
    res.status(201).json({
      success: true,
      data: product,
      message: 'Product created successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error creating product:', error);
    if (error.code === 11000) {
      // Handle duplicate key error
      return res.status(400).json({
        success: false,
        message: 'Product with this SKU already exists',
        timestamp: new Date().toISOString()
      });
    }
    res.status(500).json({ 
      success: false,
      message: 'Error creating product',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * @swagger
 * /api/products/{id}:
 *   put:
 *     tags:
 *       - Products
 *     summary: Update a product
 *     description: Update an existing product's information
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID (MongoDB ObjectId)
 *         example: "60d21b4667d0d8992e610c85"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProductInput'
 *           example:
 *             name: "Updated Paracetamol 500mg"
 *             manufacturer: "PharmaCorp International"
 *             unitPrice: 6.99
 *             reorderLevel: 75
 *     responses:
 *       200:
 *         description: Product updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
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
 *   delete:
 *     tags:
 *       - Products
 *     summary: Delete a product
 *     description: Remove a product from the inventory
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID (MongoDB ObjectId)
 *         example: "60d21b4667d0d8992e610c85"
 *     responses:
 *       200:
 *         description: Product deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *             example:
 *               message: "Product deleted successfully"
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
router.put('/:id', validate({ params: paramSchemas.id, body: productSchemas.update }), async (req, res) => {
  try {
    // Check if SKU is being updated and if it conflicts with existing products
    if (req.body.sku) {
      const existingProduct = await Product.findOne({ 
        sku: req.body.sku, 
        _id: { $ne: req.params.id } 
      });
      if (existingProduct) {
        return res.status(400).json({
          success: false,
          message: 'Another product with this SKU already exists',
          timestamp: new Date().toISOString()
        });
      }
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!product) {
      return res.status(404).json({ 
        success: false,
        message: 'Product not found',
        timestamp: new Date().toISOString()
      });
    }
    
    res.json({
      success: true,
      data: product,
      message: 'Product updated successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error updating product:', error);
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Product with this SKU already exists',
        timestamp: new Date().toISOString()
      });
    }
    res.status(500).json({ 
      success: false,
      message: 'Error updating product',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
      timestamp: new Date().toISOString()
    });
  }
});

router.delete('/:id', validate({ params: paramSchemas.id }), async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ 
        success: false,
        message: 'Product not found',
        timestamp: new Date().toISOString()
      });
    }
    
    res.json({ 
      success: true,
      message: 'Product deleted successfully',
      data: { deletedProduct: product },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error deleting product',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * @swagger
 * /api/products/{id}/stock:
 *   patch:
 *     tags:
 *       - Products
 *     summary: Update product stock quantity
 *     description: Adjust the stock quantity of a product (increase or decrease)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID (MongoDB ObjectId)
 *         example: "60d21b4667d0d8992e610c85"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/StockAdjustment'
 *           example:
 *             adjustment: 50
 *             reason: "New shipment received"
 *     responses:
 *       200:
 *         description: Stock quantity updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       404:
 *         description: Product not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "Product not found"
 *       400:
 *         description: Bad request - Invalid adjustment data
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
router.patch('/:id/stock', validate({ params: paramSchemas.id, body: productSchemas.stockAdjustment }), async (req, res) => {
  try {
    const { adjustment, reason } = req.body;
    const adjustmentNum = Number(adjustment);
    
    // Use atomic update with conditional check to prevent race conditions
    // This ensures the operation is atomic and prevents negative stock
    const result = await Product.findOneAndUpdate(
      { 
        _id: req.params.id,
        // Use $expr to ensure the resulting stock quantity is not negative
        $expr: { $gte: [{ $add: ['$stockQuantity', adjustmentNum] }, 0] }
      },
      { 
        $inc: { stockQuantity: adjustmentNum } 
      },
      { 
        new: true, // Return the updated document
        runValidators: true // Run model validators
      }
    );
    
    // Check if update failed
    if (!result) {
      // First check if product exists at all
      const productExists = await Product.findById(req.params.id);
      if (!productExists) {
        return res.status(404).json({ 
          success: false,
          message: 'Product not found',
          timestamp: new Date().toISOString()
        });
      } else {
        // Product exists but update failed due to insufficient stock
        return res.status(400).json({
          success: false,
          message: `Insufficient stock. Current stock: ${productExists.stockQuantity}, requested adjustment: ${adjustmentNum}`,
          timestamp: new Date().toISOString()
        });
      }
    }
    
    // Calculate previous quantity for response
    const previousQuantity = result.stockQuantity - adjustmentNum;
    
    res.json({
      success: true,
      data: result,
      message: 'Stock quantity updated successfully',
      adjustment: {
        previous: previousQuantity,
        adjustment: adjustmentNum,
        new: result.stockQuantity,
        reason
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error updating stock:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error updating stock quantity',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;