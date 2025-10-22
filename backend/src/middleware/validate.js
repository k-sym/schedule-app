const Joi = require('joi');
const logger = require('../utils/logger');

/**
 * Middleware factory for validating request data
 * @param {Object} schema - Joi schema object with body, params, query keys
 */
const validate = (schema) => {
  return (req, res, next) => {
    const validationOptions = {
      abortEarly: false, // Return all errors, not just the first one
      allowUnknown: true, // Allow unknown keys that will be ignored
      stripUnknown: true // Remove unknown keys from validated data
    };

    const toValidate = {};

    if (schema.body) {
      toValidate.body = req.body;
    }

    if (schema.params) {
      toValidate.params = req.params;
    }

    if (schema.query) {
      toValidate.query = req.query;
    }

    const validationSchema = Joi.object(toValidate);
    const { error, value } = validationSchema.validate(toValidate, validationOptions);

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      logger.warn('Validation error:', errors);

      return res.status(400).json({
        error: 'Validation error',
        details: errors
      });
    }

    // Replace request data with validated data
    if (value.body) req.body = value.body;
    if (value.params) req.params = value.params;
    if (value.query) req.query = value.query;

    next();
  };
};

module.exports = validate;
