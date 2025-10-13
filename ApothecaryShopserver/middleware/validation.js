const Joi = require('joi');

/**
 * Validation middleware factory
 * @param {Object} schema - Object containing validation schemas
 * @param {Joi.Schema} schema.body - Schema for request body validation
 * @param {Joi.Schema} schema.params - Schema for URL parameters validation
 * @param {Joi.Schema} schema.query - Schema for query parameters validation
 * @returns {Function} Express middleware function
 */
const validate = (schema) => {
  return (req, res, next) => {
    const errors = [];

    // Validate request body
    if (schema.body && req.body) {
      const { error } = schema.body.validate(req.body, { 
        abortEarly: false,
        stripUnknown: true // Remove unknown properties
      });
      if (error) {
        errors.push({
          location: 'body',
          details: error.details.map(detail => ({
            field: detail.path.join('.'),
            message: detail.message,
            value: detail.context?.value
          }))
        });
      }
    }

    // Validate URL parameters
    if (schema.params && req.params) {
      const { error } = schema.params.validate(req.params, { 
        abortEarly: false 
      });
      if (error) {
        errors.push({
          location: 'params',
          details: error.details.map(detail => ({
            field: detail.path.join('.'),
            message: detail.message,
            value: detail.context?.value
          }))
        });
      }
    }

    // Validate query parameters
    if (schema.query && req.query) {
      const { error } = schema.query.validate(req.query, { 
        abortEarly: false,
        stripUnknown: true
      });
      if (error) {
        errors.push({
          location: 'query',
          details: error.details.map(detail => ({
            field: detail.path.join('.'),
            message: detail.message,
            value: detail.context?.value
          }))
        });
      }
    }

    // If validation errors exist, return standardized error response
    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors,
        timestamp: new Date().toISOString()
      });
    }

    // If validation passes, continue to next middleware
    next();
  };
};

/**
 * Common validation schemas for reuse
 */
const commonSchemas = {
  // MongoDB ObjectId validation
  mongoId: Joi.string().hex().length(24).required(),
  
  // Pagination parameters
  pagination: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    sort: Joi.string().valid('name', 'createdAt', 'updatedAt', '-name', '-createdAt', '-updatedAt'),
    search: Joi.string().trim().min(1).max(100)
  }),

  // Common date validation
  dateRange: Joi.object({
    startDate: Joi.date().iso(),
    endDate: Joi.date().iso().greater(Joi.ref('startDate'))
  }),

  // Email validation
  email: Joi.string().email().lowercase().trim(),

  // Phone validation (international format)
  phone: Joi.string().pattern(/^[\+]?[1-9][\d]{0,15}$/).message('Phone number must be in valid international format'),

  // Password validation
  password: Joi.string().min(8).max(128)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .message('Password must contain at least 8 characters with uppercase, lowercase, number and special character')
};

/**
 * Error handling middleware for validation errors
 */
const handleValidationError = (error, req, res, next) => {
  if (error.isJoi) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: [{
        location: 'unknown',
        details: error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message,
          value: detail.context?.value
        }))
      }],
      timestamp: new Date().toISOString()
    });
  }
  next(error);
};

module.exports = {
  validate,
  commonSchemas,
  handleValidationError
};
