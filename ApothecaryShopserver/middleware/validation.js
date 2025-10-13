const Joi = require('joi');

/**
 * Redacts sensitive values from validation error responses
 * @param {string} fieldPath - The field path (e.g., 'password', 'user.token')
 * @param {any} value - The original value
 * @returns {string|undefined} Redacted value or undefined for non-sensitive fields
 */
const redactSensitiveValue = (fieldPath, value) => {
  const sensitiveFieldPattern = /password|token|authorization|secret|key|pin|ssn|credit|card/i;
  
  if (sensitiveFieldPattern.test(fieldPath)) {
    // Log the actual value server-side for debugging (consider using a proper logger)
    console.error(`[VALIDATION_ERROR] Sensitive field '${fieldPath}' validation failed:`, value);
    return '[REDACTED]';
  }
  
  // For non-sensitive fields, omit the value entirely
  return undefined;
};

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
      const { value, error } = schema.body.validate(req.body, { 
        abortEarly: false,
        stripUnknown: true, // Remove unknown properties
        convert: true // Enable type coercion
      });
      if (error) {
        errors.push({
          location: 'body',
          details: error.details.map(detail => {
            const fieldPath = detail.path.join('.');
            const redactedValue = redactSensitiveValue(fieldPath, detail.context?.value);
            
            const errorDetail = {
              field: fieldPath,
              message: detail.message
            };
            
            // Only include value if it's not undefined (i.e., redacted or omitted)
            if (redactedValue !== undefined) {
              errorDetail.value = redactedValue;
            }
            
            return errorDetail;
          })
        });
      } else {
        // Apply sanitized/coerced value back to request body
        req.body = value;
      }
    }

    // Validate URL parameters
    if (schema.params && req.params) {
      const { value, error } = schema.params.validate(req.params, { 
        abortEarly: false,
        stripUnknown: true,
        convert: true // Enable type coercion
      });
      if (error) {
        errors.push({
          location: 'params',
          details: error.details.map(detail => {
            const fieldPath = detail.path.join('.');
            const redactedValue = redactSensitiveValue(fieldPath, detail.context?.value);
            
            const errorDetail = {
              field: fieldPath,
              message: detail.message
            };
            
            // Only include value if it's not undefined (i.e., redacted or omitted)
            if (redactedValue !== undefined) {
              errorDetail.value = redactedValue;
            }
            
            return errorDetail;
          })
        });
      } else {
        // Apply sanitized/coerced value back to request params
        req.params = value;
      }
    }

    // Validate query parameters
    if (schema.query && req.query) {
      const { value, error } = schema.query.validate(req.query, { 
        abortEarly: false,
        stripUnknown: true,
        convert: true // Enable type coercion
      });
      if (error) {
        errors.push({
          location: 'query',
          details: error.details.map(detail => {
            const fieldPath = detail.path.join('.');
            const redactedValue = redactSensitiveValue(fieldPath, detail.context?.value);
            
            const errorDetail = {
              field: fieldPath,
              message: detail.message
            };
            
            // Only include value if it's not undefined (i.e., redacted or omitted)
            if (redactedValue !== undefined) {
              errorDetail.value = redactedValue;
            }
            
            return errorDetail;
          })
        });
      } else {
        // Apply sanitized/coerced value back to request query
        req.query = value;
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
  phone: Joi.string().pattern(/^[\+]?[1-9][\d]{1,14}$/).message('Phone number must be in valid international format'),

  // Password validation
  password: Joi.string().min(8).max(128)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/)
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
        details: error.details.map(detail => {
          const fieldPath = detail.path.join('.');
          const redactedValue = redactSensitiveValue(fieldPath, detail.context?.value);
          
          const errorDetail = {
            field: fieldPath,
            message: detail.message
          };
          
          // Only include value if it's not undefined (i.e., redacted or omitted)
          if (redactedValue !== undefined) {
            errorDetail.value = redactedValue;
          }
          
          return errorDetail;
        })
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
