const Joi = require('joi');
const { commonSchemas } = require('../middleware/validation');

/**
 * User validation schemas
 */
const userSchemas = {
  // User registration schema
  register: Joi.object({
    name: Joi.string().trim().min(2).max(50).required()
      .messages({
        'string.min': 'Name must be at least 2 characters long',
        'string.max': 'Name cannot exceed 50 characters'
      }),
    email: commonSchemas.email.required(),
    password: commonSchemas.password.required(),
    role: Joi.string().valid('admin', 'staff', 'customer').default('staff')
      .messages({
        'any.only': 'Role must be one of: admin, staff, customer'
      })
  }),

  // User login schema
  login: Joi.object({
    email: commonSchemas.email.required(),
    password: Joi.string().required()
      .messages({
        'string.empty': 'Password is required'
      })
  })
};

/**
 * Product validation schemas
 */
const productSchemas = {
  // Create product schema
  create: Joi.object({
    name: Joi.string().trim().min(2).max(100).required()
      .messages({
        'string.min': 'Product name must be at least 2 characters long',
        'string.max': 'Product name cannot exceed 100 characters'
      }),
    sku: Joi.string().trim().max(50).optional(),
    genericName: Joi.string().trim().min(2).max(100).required()
      .messages({
        'string.min': 'Generic name must be at least 2 characters long',
        'string.max': 'Generic name cannot exceed 100 characters'
      }),
    category: Joi.string().trim().min(2).max(50).required()
      .messages({
        'string.min': 'Category must be at least 2 characters long',
        'string.max': 'Category cannot exceed 50 characters'
      }),
    manufacturer: Joi.string().trim().min(2).max(100).required()
      .messages({
        'string.min': 'Manufacturer name must be at least 2 characters long',
        'string.max': 'Manufacturer name cannot exceed 100 characters'
      }),
    batchNumber: Joi.string().trim().min(1).max(50).required()
      .messages({
        'string.min': 'Batch number is required',
        'string.max': 'Batch number cannot exceed 50 characters'
      }),
    expiryDate: Joi.date().greater('now').required()
      .messages({
        'date.greater': 'Expiry date must be in the future'
      }),
    stockQuantity: Joi.number().integer().min(0).required()
      .messages({
        'number.min': 'Stock quantity cannot be negative',
        'number.integer': 'Stock quantity must be a whole number'
      }),
    unitPrice: Joi.number().positive().precision(2).required()
      .messages({
        'number.positive': 'Unit price must be greater than 0'
      }),
    reorderLevel: Joi.number().integer().min(0).required()
      .messages({
        'number.min': 'Reorder level cannot be negative',
        'number.integer': 'Reorder level must be a whole number'
      }),
    description: Joi.string().trim().max(500).optional().allow('')
      .messages({
        'string.max': 'Description cannot exceed 500 characters'
      })
  }),

  // Update product schema (all fields optional except those that should remain required)
  update: Joi.object({
    name: Joi.string().trim().min(2).max(100).optional(),
    sku: Joi.string().trim().max(50).optional(),
    genericName: Joi.string().trim().min(2).max(100).optional(),
    category: Joi.string().trim().min(2).max(50).optional(),
    manufacturer: Joi.string().trim().min(2).max(100).optional(),
    batchNumber: Joi.string().trim().min(1).max(50).optional(),
    expiryDate: Joi.date().greater('now').optional(),
    stockQuantity: Joi.number().integer().min(0).optional(),
    unitPrice: Joi.number().positive().precision(2).optional(),
    reorderLevel: Joi.number().integer().min(0).optional(),
    description: Joi.string().trim().max(500).optional().allow('')
  }).min(1), // At least one field must be provided

  // Stock adjustment schema
  stockAdjustment: Joi.object({
    adjustment: Joi.number().integer().not(0).required()
      .messages({
        'number.integer': 'Adjustment must be a whole number',
        'any.invalid': 'Adjustment cannot be zero'
      }),
    reason: Joi.string().trim().min(5).max(200).required()
      .messages({
        'string.min': 'Reason must be at least 5 characters long',
        'string.max': 'Reason cannot exceed 200 characters'
      })
  })
};

/**
 * Supplier validation schemas
 */
const supplierSchemas = {
  // Create supplier schema
  create: Joi.object({
    name: Joi.string().trim().min(2).max(100).required()
      .messages({
        'string.min': 'Supplier name must be at least 2 characters long',
        'string.max': 'Supplier name cannot exceed 100 characters'
      }),
    contactPerson: Joi.string().trim().min(2).max(50).optional().allow('')
      .messages({
        'string.min': 'Contact person name must be at least 2 characters long',
        'string.max': 'Contact person name cannot exceed 50 characters'
      }),
    email: commonSchemas.email.optional().allow(''),
    phone: commonSchemas.phone.optional().allow(''),
    address: Joi.object({
      street: Joi.string().trim().max(100).optional().allow(''),
      city: Joi.string().trim().max(50).optional().allow(''),
      state: Joi.string().trim().max(50).optional().allow(''),
      zipCode: Joi.string().trim().max(20).optional().allow(''),
      country: Joi.string().trim().max(50).optional().allow('')
    }).optional(),
    taxId: Joi.string().trim().max(50).optional().allow('')
      .messages({
        'string.max': 'Tax ID cannot exceed 50 characters'
      }),
    isJanAushadhi: Joi.boolean().optional().default(false),
    paymentTerms: Joi.string().trim().max(100).optional().allow('')
      .messages({
        'string.max': 'Payment terms cannot exceed 100 characters'
      }),
    rating: Joi.number().integer().min(1).max(5).optional().default(3)
      .messages({
        'number.min': 'Rating must be between 1 and 5',
        'number.max': 'Rating must be between 1 and 5'
      }),
    status: Joi.string().valid('active', 'inactive').optional().default('active')
      .messages({
        'any.only': 'Status must be either active or inactive'
      })
  }),

  // Update supplier schema
  update: Joi.object({
    name: Joi.string().trim().min(2).max(100).optional(),
    contactPerson: Joi.string().trim().min(2).max(50).optional().allow(''),
    email: commonSchemas.email.optional().allow(''),
    phone: commonSchemas.phone.optional().allow(''),
    address: Joi.object({
      street: Joi.string().trim().max(100).optional().allow(''),
      city: Joi.string().trim().max(50).optional().allow(''),
      state: Joi.string().trim().max(50).optional().allow(''),
      zipCode: Joi.string().trim().max(20).optional().allow(''),
      country: Joi.string().trim().max(50).optional().allow('')
    }).optional(),
    taxId: Joi.string().trim().max(50).optional().allow(''),
    isJanAushadhi: Joi.boolean().optional(),
    paymentTerms: Joi.string().trim().max(100).optional().allow(''),
    rating: Joi.number().integer().min(1).max(5).optional(),
    status: Joi.string().valid('active', 'inactive').optional()
  }).min(1) // At least one field must be provided
};

/**
 * Purchase Order validation schemas
 */
const purchaseOrderSchemas = {
  create: Joi.object({
    supplierId: commonSchemas.mongoId,
    items: Joi.array().items(
      Joi.object({
        productId: commonSchemas.mongoId,
        quantity: Joi.number().integer().min(1).required(),
        unitPrice: Joi.number().positive().precision(2).required()
      })
    ).min(1).required(),
    expectedDeliveryDate: Joi.date().greater('now').optional(),
    notes: Joi.string().trim().max(500).optional().allow('')
  }),

  update: Joi.object({
    status: Joi.string().valid('pending', 'approved', 'ordered', 'delivered', 'cancelled').optional(),
    expectedDeliveryDate: Joi.date().greater('now').optional(),
    notes: Joi.string().trim().max(500).optional().allow(''),
    items: Joi.array().items(
      Joi.object({
        productId: commonSchemas.mongoId,
        quantity: Joi.number().integer().min(1).required(),
        unitPrice: Joi.number().positive().precision(2).required()
      })
    ).min(1).optional()
  }).min(1)
};

/**
 * Stock Movement validation schemas
 */
const stockMovementSchemas = {
  create: Joi.object({
    productId: commonSchemas.mongoId,
    type: Joi.string().valid('in', 'out', 'adjustment').required(),
    quantity: Joi.number().integer().min(1).required(),
    reason: Joi.string().trim().min(5).max(200).required(),
    reference: Joi.string().trim().max(100).optional().allow(''),
    notes: Joi.string().trim().max(500).optional().allow('')
  })
};

/**
 * Common parameter validation schemas
 */
const paramSchemas = {
  // MongoDB ObjectId parameter
  id: Joi.object({
    id: commonSchemas.mongoId
  }),

  // Pagination and search query parameters (general list schema)
  list: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    sort: Joi.string().valid(
      // Common product/item sorting fields
      'name', 'createdAt', 'updatedAt', 'unitPrice', 'category', 'manufacturer',
      'stockQuantity', 'reorderLevel', 'expiryDate',
      // Descending variants
      '-name', '-createdAt', '-updatedAt', '-unitPrice', '-category', '-manufacturer',
      '-stockQuantity', '-reorderLevel', '-expiryDate'
    ).default('createdAt').optional(),
    search: Joi.string().trim().min(1).max(100).optional(),
    category: Joi.string().trim().max(50).optional(),
    status: Joi.string().optional()
  }),

  // Product-specific query parameters with product-relevant sort fields
  productList: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    sort: Joi.string().valid(
      // Product-specific sort fields
      'name', 'genericName', 'category', 'manufacturer', 'unitPrice', 'stockQuantity',
      'reorderLevel', 'expiryDate', 'createdAt', 'updatedAt',
      // Descending variants
      '-name', '-genericName', '-category', '-manufacturer', '-unitPrice', '-stockQuantity',
      '-reorderLevel', '-expiryDate', '-createdAt', '-updatedAt'
    ).default('name').optional(),
    search: Joi.string().trim().min(1).max(100).optional(),
    category: Joi.string().trim().max(50).optional(),
    status: Joi.string().optional()
  }),

  // Supplier-specific query parameters with restricted values
  supplierList: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    sort: Joi.string().valid(
      'name', 'contactPerson', 'email', 'status', 'createdAt', 'updatedAt',
      '-name', '-contactPerson', '-email', '-status', '-createdAt', '-updatedAt'
    ).default('name').optional(),
    search: Joi.string().trim().min(1).max(100).optional(),
    status: Joi.string().valid('active', 'inactive').optional()
  }),

  // Date range query parameters
  dateRange: Joi.object({
    startDate: Joi.date().iso().optional(),
    endDate: Joi.date().iso().greater(Joi.ref('startDate')).optional(),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10)
  })
};

module.exports = {
  userSchemas,
  productSchemas,
  supplierSchemas,
  purchaseOrderSchemas,
  stockMovementSchemas,
  paramSchemas
};
