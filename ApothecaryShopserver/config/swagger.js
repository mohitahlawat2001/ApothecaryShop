const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Apothecary Shop API',
      version: '4.0.0',
      description: `
        A comprehensive backend application for managing an apothecary/pharmacy shop inventory system.
        
        ## Features
        - User Authentication: JWT-based authentication with role-based access control
        - Product Management: Complete CRUD operations for pharmaceutical products
        - Inventory Management: Stock tracking with automated reorder alerts
        - Supplier Management: Manage supplier relationships and information
        - Purchase Orders: Create and track purchase orders with suppliers
        - Purchase Receipts: Record and process incoming inventory
        - Distribution Management: Track product distribution and deliveries
        - AI Integration: MaoMao AI pharmaceutical assistant
        - Image Analysis: AI-powered product recognition and text extraction
        
        ## Authentication
        Most endpoints require authentication via Bearer token in the Authorization header.
        
        ## Input Validation
        All API endpoints implement comprehensive validation using Joi:
        - Request Body Validation: POST/PUT/PATCH endpoints validate all input data
        - URL Parameter Validation: MongoDB ObjectId validation for route parameters  
        - Query Parameter Validation: Search, pagination, and filtering parameters
        - Business Rule Enforcement: Unique constraints, date validation, stock levels
        - Standardized Errors: Consistent error format with detailed field-level messages
        
        ## Error Handling
        The API uses conventional HTTP response codes:
        - 200: Success
        - 201: Created successfully
        - 400: Bad request (validation failed or invalid data)
        - 401: Unauthorized (authentication required)
        - 403: Forbidden (insufficient permissions)
        - 404: Resource not found
        - 500: Internal server error
      `,
      contact: {
        name: 'API Support',
        email: 'support@apothecaryshop.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Development server'
      },
      {
        url: 'https://your-deployed-api-url.com',
        description: 'Production server (replace with actual URL)'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        Product: {
          type: 'object',
          required: ['name', 'genericName', 'category', 'manufacturer', 'batchNumber', 'expiryDate', 'unitPrice', 'reorderLevel'],
          properties: {
            _id: {
              type: 'string',
              description: 'Auto-generated MongoDB ObjectId',
              example: '60d21b4667d0d8992e610c85'
            },
            name: {
              type: 'string',
              description: 'Product name',
              example: 'Paracetamol 500mg'
            },
            sku: {
              type: 'string',
              description: 'Stock Keeping Unit - auto-generated if not provided',
              example: 'AP-PAI-123456'
            },
            genericName: {
              type: 'string',
              description: 'Generic name of the product',
              example: 'Paracetamol'
            },
            category: {
              type: 'string',
              description: 'Product category',
              example: 'Pain Relief'
            },
            manufacturer: {
              type: 'string',
              description: 'Manufacturer name',
              example: 'PharmaCorp Ltd'
            },
            batchNumber: {
              type: 'string',
              description: 'Batch number from manufacturer',
              example: 'PCM20230615'
            },
            expiryDate: {
              type: 'string',
              format: 'date',
              description: 'Product expiry date',
              example: '2025-06-15'
            },
            stockQuantity: {
              type: 'integer',
              minimum: 0,
              description: 'Current stock quantity',
              example: 200,
              default: 0
            },
            unitPrice: {
              type: 'number',
              format: 'float',
              minimum: 0,
              description: 'Unit price in currency',
              example: 5.99
            },
            reorderLevel: {
              type: 'integer',
              minimum: 0,
              description: 'Stock level at which to reorder',
              example: 50
            },
            description: {
              type: 'string',
              description: 'Optional product description',
              example: 'Over-the-counter pain reliever'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Record creation timestamp'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Record last update timestamp'
            }
          }
        },
        ProductInput: {
          type: 'object',
          required: ['name', 'genericName', 'category', 'manufacturer', 'batchNumber', 'expiryDate', 'unitPrice', 'reorderLevel'],
          properties: {
            name: {
              type: 'string',
              description: 'Product name',
              example: 'Paracetamol 500mg'
            },
            genericName: {
              type: 'string',
              description: 'Generic name of the product',
              example: 'Paracetamol'
            },
            category: {
              type: 'string',
              description: 'Product category',
              example: 'Pain Relief'
            },
            manufacturer: {
              type: 'string',
              description: 'Manufacturer name',
              example: 'PharmaCorp Ltd'
            },
            batchNumber: {
              type: 'string',
              description: 'Batch number from manufacturer',
              example: 'PCM20230615'
            },
            expiryDate: {
              type: 'string',
              format: 'date',
              description: 'Product expiry date',
              example: '2025-06-15'
            },
            stockQuantity: {
              type: 'integer',
              minimum: 0,
              description: 'Initial stock quantity',
              example: 200,
              default: 0
            },
            unitPrice: {
              type: 'number',
              format: 'float',
              minimum: 0,
              description: 'Unit price in currency',
              example: 5.99
            },
            reorderLevel: {
              type: 'integer',
              minimum: 0,
              description: 'Stock level at which to reorder',
              example: 50
            },
            description: {
              type: 'string',
              description: 'Optional product description',
              example: 'Over-the-counter pain reliever'
            }
          }
        },
        StockAdjustment: {
          type: 'object',
          required: ['adjustment'],
          properties: {
            adjustment: {
              type: 'integer',
              description: 'Positive to increase stock, negative to decrease',
              example: 50
            },
            reason: {
              type: 'string',
              description: 'Reason for stock adjustment',
              example: 'New shipment received'
            }
          }
        },
        Supplier: {
          type: 'object',
          required: ['name'],
          properties: {
            _id: {
              type: 'string',
              description: 'Auto-generated MongoDB ObjectId',
              example: '60d21b4667d0d8992e610c86'
            },
            name: {
              type: 'string',
              description: 'Supplier company name',
              example: 'ABC Pharmaceuticals'
            },
            contactPerson: {
              type: 'string',
              description: 'Primary contact person name',
              example: 'John Doe'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Contact email address',
              example: 'john@abcpharma.com'
            },
            phone: {
              type: 'string',
              description: 'Contact phone number',
              example: '123-456-7890'
            },
            address: {
              type: 'object',
              properties: {
                street: {
                  type: 'string',
                  example: '123 Main St'
                },
                city: {
                  type: 'string',
                  example: 'Mumbai'
                },
                state: {
                  type: 'string',
                  example: 'Maharashtra'
                },
                zipCode: {
                  type: 'string',
                  example: '400001'
                },
                country: {
                  type: 'string',
                  example: 'India'
                }
              }
            },
            taxId: {
              type: 'string',
              description: 'Tax identification number',
              example: 'ABCDE1234F'
            },
            isJanAushadhi: {
              type: 'boolean',
              description: 'Whether supplier is a Jan Aushadhi partner',
              example: false,
              default: false
            },
            paymentTerms: {
              type: 'string',
              description: 'Payment terms agreement',
              example: 'Net 30'
            },
            rating: {
              type: 'integer',
              minimum: 1,
              maximum: 5,
              description: 'Supplier rating (1-5)',
              example: 4,
              default: 3
            },
            status: {
              type: 'string',
              enum: ['active', 'inactive'],
              description: 'Supplier status',
              example: 'active',
              default: 'active'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Record creation timestamp'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Record last update timestamp'
            }
          }
        },
        User: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              description: 'User ID',
              example: '60d21b4667d0d8992e610c87'
            },
            name: {
              type: 'string',
              description: 'User full name',
              example: 'John Smith'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'User email address',
              example: 'john@example.com'
            },
            role: {
              type: 'string',
              enum: ['admin', 'staff'],
              description: 'User role',
              example: 'staff'
            },
            provider: {
              type: 'string',
              description: 'Authentication provider (local, google, facebook)',
              example: 'local'
            },
            avatar: {
              type: 'string',
              description: 'User avatar URL',
              example: 'https://example.com/avatar.jpg'
            }
          }
        },
        UserRegistration: {
          type: 'object',
          required: ['name', 'email', 'password', 'role'],
          properties: {
            name: {
              type: 'string',
              minLength: 2,
              maxLength: 50,
              description: 'User full name (2-50 characters, trimmed)',
              example: 'John Smith'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Valid email address (lowercase, trimmed)',
              example: 'john@example.com'
            },
            password: {
              type: 'string',
              format: 'password',
              minLength: 8,
              maxLength: 128,
              pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]',
              description: 'Password (min 8 chars, must contain uppercase, lowercase, number, special char)',
              example: 'SecurePass123!'
            },
            role: {
              type: 'string',
              enum: ['admin', 'staff', 'customer'],
              description: 'User role (defaults to staff)',
              example: 'staff',
              default: 'staff'
            }
          }
        },
        UserLogin: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: {
              type: 'string',
              format: 'email',
              description: 'User email address',
              example: 'john@example.com'
            },
            password: {
              type: 'string',
              format: 'password',
              description: 'User password',
              example: 'securepassword123'
            }
          }
        },
        AuthResponse: {
          type: 'object',
          properties: {
            token: {
              type: 'string',
              description: 'JWT authentication token',
              example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
            },
            user: {
              $ref: '#/components/schemas/User'
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              description: 'Error message',
              example: 'Resource not found'
            },
            error: {
              type: 'string',
              description: 'Detailed error information',
              example: 'Product with id 123 does not exist'
            }
          }
        },
        Success: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              description: 'Success message',
              example: 'Operation completed successfully'
            }
          }
        },
        ValidationError: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            message: {
              type: 'string',
              example: 'Validation failed'
            },
            errors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  location: {
                    type: 'string',
                    enum: ['body', 'params', 'query'],
                    example: 'body'
                  },
                  details: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        field: {
                          type: 'string',
                          example: 'email'
                        },
                        message: {
                          type: 'string',
                          example: 'Email must be a valid email address'
                        },
                        value: {
                          type: 'string',
                          example: 'invalid-email'
                        }
                      }
                    }
                  }
                }
              }
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
              example: '2024-01-15T10:30:00.000Z'
            }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ],
    tags: [
      {
        name: 'Authentication',
        description: 'User authentication and registration endpoints'
      },
      {
        name: 'Products',
        description: 'Product management operations'
      },
      {
        name: 'Suppliers',
        description: 'Supplier management operations'
      },
      {
        name: 'Purchase Orders',
        description: 'Purchase order management'
      },
      {
        name: 'Purchase Receipts',
        description: 'Purchase receipt processing'
      },
      {
        name: 'Distributions',
        description: 'Distribution and delivery management'
      },
      {
        name: 'Stock Movement',
        description: 'Inventory movement tracking'
      },
      {
        name: 'External Products',
        description: 'External product integration'
      },
      {
        name: 'AI Assistant',
        description: 'MaoMao AI pharmaceutical assistant'
      },
      {
        name: 'Vision',
        description: 'Image analysis and recognition'
      }
    ]
  },
  apis: [
    './routes/*.js',
    './server.js'
  ]
};

const specs = swaggerJsdoc(options);

module.exports = {
  specs,
  swaggerUi,
  swaggerOptions: {
    explorer: true,
    swaggerOptions: {
      validatorUrl: null,
      docExpansion: 'list',
      defaultModelsExpandDepth: 2,
      defaultModelExpandDepth: 2
    }
  }
};
