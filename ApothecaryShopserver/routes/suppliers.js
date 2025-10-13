const express = require('express');
const router = express.Router();
const Supplier = require('../models/supplier');
const { adminOnly, staffAccess } = require('../middleware/roleCheck');
const { validate } = require('../middleware/validation');
const { supplierSchemas, paramSchemas } = require('../validation/schemas');

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
 * /api/suppliers:
 *   get:
 *     tags:
 *       - Suppliers
 *     summary: Get all suppliers
 *     description: Retrieve all suppliers (requires staff or admin access)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all suppliers
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Supplier'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - Insufficient permissions
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
router.get('/', staffAccess, validate({ query: paramSchemas.supplierList }), async (req, res) => {
  try {
    // Use Joi-validated and sanitized query parameters
    const { search, status, sort, page, limit } = req.query;
    
    // Build query filter with proper escaping
    let filter = {};
    if (search) {
      const escapedSearch = escapeRegex(search);
      filter.$or = [
        { name: { $regex: new RegExp(escapedSearch, 'i') } },
        { contactPerson: { $regex: new RegExp(escapedSearch, 'i') } },
        { email: { $regex: new RegExp(escapedSearch, 'i') } }
      ];
    }
    
    // Status is already validated by Joi schema
    if (status) {
      filter.status = status;
    }

    // Sort field is already validated by Joi schema, use default if not provided
    const safeSort = sort || 'name';
    
    // Calculate pagination (values already validated and coerced by Joi)
    const skip = (page - 1) * limit;
    
    const suppliers = await Supplier.find(filter)
      .sort(safeSort)
      .skip(skip)
      .limit(limit);
      
    const total = await Supplier.countDocuments(filter);
    
    res.json({
      success: true,
      data: suppliers,
      pagination: {
        page: page,
        limit: limit,
        total,
        pages: Math.ceil(total / limit)
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching suppliers:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching suppliers',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * @swagger
 * /api/suppliers/{id}:
 *   get:
 *     tags:
 *       - Suppliers
 *     summary: Get supplier by ID
 *     description: Retrieve a specific supplier by ID (requires staff or admin access)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Supplier ID (MongoDB ObjectId)
 *         example: "60d21b4667d0d8992e610c86"
 *     responses:
 *       200:
 *         description: Supplier found successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Supplier'
 *       404:
 *         description: Supplier not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "Supplier not found"
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - Insufficient permissions
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
router.get('/:id', staffAccess, validate({ params: paramSchemas.id }), async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id);
    if (!supplier) {
      return res.status(404).json({ 
        success: false,
        message: 'Supplier not found',
        timestamp: new Date().toISOString()
      });
    }
    
    res.json({
      success: true,
      data: supplier,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching supplier:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching supplier',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * @swagger
 * /api/suppliers:
 *   post:
 *     tags:
 *       - Suppliers
 *     summary: Create a new supplier
 *     description: Add a new supplier to the system (admin only)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Supplier'
 *           example:
 *             name: "ABC Pharmaceuticals"
 *             contactPerson: "John Doe"
 *             email: "john@abcpharma.com"
 *             phone: "123-456-7890"
 *             address:
 *               street: "123 Main St"
 *               city: "Mumbai"
 *               state: "Maharashtra"
 *               zipCode: "400001"
 *               country: "India"
 *             taxId: "ABCDE1234F"
 *             isJanAushadhi: false
 *             paymentTerms: "Net 30"
 *             rating: 4
 *             status: "active"
 *     responses:
 *       201:
 *         description: Supplier created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Supplier'
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
 *       403:
 *         description: Forbidden - Admin access required
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
router.post('/', adminOnly, validate({ body: supplierSchemas.create }), async (req, res) => {
  try {
    // Check if supplier with same email already exists
    if (req.body.email) {
      const existingSupplier = await Supplier.findOne({ email: req.body.email });
      if (existingSupplier) {
        return res.status(400).json({
          success: false,
          message: 'Supplier with this email already exists',
          timestamp: new Date().toISOString()
        });
      }
    }

    const supplier = new Supplier(req.body);
    const newSupplier = await supplier.save();
    
    res.status(201).json({
      success: true,
      data: newSupplier,
      message: 'Supplier created successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error creating supplier:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error creating supplier',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * @swagger
 * /api/suppliers/{id}:
 *   put:
 *     tags:
 *       - Suppliers
 *     summary: Update a supplier
 *     description: Update an existing supplier's information (admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Supplier ID (MongoDB ObjectId)
 *         example: "60d21b4667d0d8992e610c86"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Supplier'
 *           example:
 *             name: "ABC Pharmaceuticals Updated"
 *             contactPerson: "Jane Smith"
 *             rating: 5
 *     responses:
 *       200:
 *         description: Supplier updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Supplier'
 *       404:
 *         description: Supplier not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "Supplier not found"
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
 *       403:
 *         description: Forbidden - Admin access required
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
router.put('/:id', adminOnly, validate({ params: paramSchemas.id, body: supplierSchemas.update }), async (req, res) => {
  try {
    // Check if email is being updated and if it conflicts with existing suppliers
    if (req.body.email) {
      const existingSupplier = await Supplier.findOne({ 
        email: req.body.email, 
        _id: { $ne: req.params.id } 
      });
      if (existingSupplier) {
        return res.status(400).json({
          success: false,
          message: 'Another supplier with this email already exists',
          timestamp: new Date().toISOString()
        });
      }
    }

    const supplier = await Supplier.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!supplier) {
      return res.status(404).json({ 
        success: false,
        message: 'Supplier not found',
        timestamp: new Date().toISOString()
      });
    }
    
    res.json({
      success: true,
      data: supplier,
      message: 'Supplier updated successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error updating supplier:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error updating supplier',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * @swagger
 * /api/suppliers/{id}:
 *   delete:
 *     tags:
 *       - Suppliers
 *     summary: Delete a supplier
 *     description: Remove a supplier from the system (admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Supplier ID (MongoDB ObjectId)
 *         example: "60d21b4667d0d8992e610c86"
 *     responses:
 *       200:
 *         description: Supplier deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *             example:
 *               message: "Supplier deleted successfully"
 *       404:
 *         description: Supplier not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "Supplier not found"
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - Admin access required
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
router.delete('/:id', adminOnly, validate({ params: paramSchemas.id }), async (req, res) => {
  try {
    const supplier = await Supplier.findByIdAndDelete(req.params.id);
    if (!supplier) {
      return res.status(404).json({ 
        success: false,
        message: 'Supplier not found',
        timestamp: new Date().toISOString()
      });
    }
    
    res.json({ 
      success: true,
      message: 'Supplier deleted successfully',
      data: { deletedSupplier: supplier },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error deleting supplier:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error deleting supplier',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;