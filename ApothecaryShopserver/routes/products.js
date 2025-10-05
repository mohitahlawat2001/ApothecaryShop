const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

/**
 * @route   GET /api/products
 * @desc    Get all products sorted by name
 * @access  Private
 * @returns {Array} - List of all products
 * @test    Postman: GET http://localhost:PORT/api/products
 *          Headers required: Authorization: Bearer YOUR_JWT_TOKEN
 */
router.get('/', async (req, res) => {
  try {
    const products = await Product.find().sort({ name: 1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   GET /api/products/:id
 * @desc    Get single product by ID
 * @access  Private
 * @param   {string} id - Product ID
 * @returns {Object} - Product object if found
 * @test    Postman: GET http://localhost:PORT/api/products/:id
 *          Headers required: Authorization: Bearer YOUR_JWT_TOKEN
 */
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   POST /api/products
 * @desc    Create a new product
 * @access  Private
 * @body    {
 *            name: String (required),
 *            genericName: String (required),
 *            category: String (required),
 *            manufacturer: String (required),
 *            batchNumber: String (required),
 *            expiryDate: Date (required),
 *            stockQuantity: Number (required, default: 0),
 *            unitPrice: Number (required),
 *            reorderLevel: Number (required)
 *          }
 * @returns {Object} - Created product
 * @test    Postman: POST http://localhost:PORT/api/products
 *          Headers required: Authorization: Bearer YOUR_JWT_TOKEN, Content-Type: application/json
 *          Body example: {
 *            "name": "Paracetamol 500mg",
 *            "genericName": "Paracetamol",
 *            "category": "Pain Relief",
 *            "manufacturer": "PharmaCorp Ltd",
 *            "batchNumber": "PCM20230615",
 *            "expiryDate": "2025-06-15",
 *            "stockQuantity": 200,
 *            "unitPrice": 5.99,
 *            "reorderLevel": 50
 *          }
 */
router.post('/', async (req, res) => {
  try {
    const newProduct = new Product(req.body);
    const product = await newProduct.save();
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   PUT /api/products/:id
 * @desc    Update a product
 * @access  Private
 * @param   {string} id - Product ID
 * @body    {Object} - Fields to update, can include any of:
 *            name: String,
 *            genericName: String,
 *            category: String,
 *            manufacturer: String,
 *            batchNumber: String,
 *            expiryDate: Date,
 *            stockQuantity: Number,
 *            unitPrice: Number,
 *            reorderLevel: Number
 * @returns {Object} - Updated product
 * @test    Postman: PUT http://localhost:PORT/api/products/:id
 *          Headers required: Authorization: Bearer YOUR_JWT_TOKEN, Content-Type: application/json
 *          Body example: {
 *            "name": "Updated Paracetamol 500mg",
 *            "manufacturer": "PharmaCorp International",
 *            "unitPrice": 6.99,
 *            "reorderLevel": 75
 *          }
 */
router.put('/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   DELETE /api/products/:id
 * @desc    Delete a product
 * @access  Private
 * @param   {string} id - Product ID
 * @returns {Object} - Success message
 * @test    Postman: DELETE http://localhost:PORT/api/products/:id
 *          Headers required: Authorization: Bearer YOUR_JWT_TOKEN
 */
router.delete('/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   PATCH /api/products/:id/stock
 * @desc    Update product stock quantity
 * @access  Private
 * @param   {string} id - Product ID
 * @body    {
 *            adjustment: Number (required) - Positive to increase, negative to decrease
 *            reason: String - Reason for adjustment
 *          }
 * @returns {Object} - Updated product
 * @test    Postman: PATCH http://localhost:PORT/api/products/:id/stock
 *          Headers required: Authorization: Bearer YOUR_JWT_TOKEN, Content-Type: application/json
 *          Body example: { "adjustment": 50, "reason": "New shipment" }
 */
router.patch('/:id/stock', async (req, res) => {
  try {
    const { adjustment, reason } = req.body;
    const product = await Product.findById(req.params.id);
    
    if (!product) return res.status(404).json({ message: 'Product not found' });
    
    product.stockQuantity += Number(adjustment);
    await product.save();
    
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;