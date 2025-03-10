const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const auth = require('../middleware/auth');

/**
 * @route   GET /api/products
 * @desc    Get all products sorted by name
 * @access  Private
 * @returns {Array} - List of all products
 * @test    Postman: GET http://localhost:PORT/api/products
 *          Headers required: x-auth-token: YOUR_JWT_TOKEN
 */
router.get('/', auth, async (req, res) => {
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
 *          Headers required: x-auth-token: YOUR_JWT_TOKEN
 */
router.get('/:id', auth, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (error) {
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
 *          Headers required: x-auth-token: YOUR_JWT_TOKEN, Content-Type: application/json
 */
router.post('/', auth, async (req, res) => {
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
 * @body    {Object} - Fields to update
 * @returns {Object} - Updated product
 * @test    Postman: PUT http://localhost:PORT/api/products/:id
 *          Headers required: x-auth-token: YOUR_JWT_TOKEN, Content-Type: application/json
 *          Body: Any fields you want to update
 */
router.put('/:id', auth, async (req, res) => {
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
 *          Headers required: x-auth-token: YOUR_JWT_TOKEN
 */
router.delete('/:id', auth, async (req, res) => {
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
 *          Headers required: x-auth-token: YOUR_JWT_TOKEN, Content-Type: application/json
 *          Body example: { "adjustment": 50, "reason": "New shipment" }
 */
router.patch('/:id/stock', auth, async (req, res) => {
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