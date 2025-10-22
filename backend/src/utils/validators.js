const Joi = require('joi');

// Auth validation schemas
const authSchemas = {
  login: {
    body: Joi.object({
      email: Joi.string().email().required().messages({
        'string.email': 'Please provide a valid email address',
        'any.required': 'Email is required'
      }),
      password: Joi.string().min(6).required().messages({
        'string.min': 'Password must be at least 6 characters long',
        'any.required': 'Password is required'
      })
    })
  },

  refresh: {
    body: Joi.object({
      refreshToken: Joi.string().required().messages({
        'any.required': 'Refresh token is required'
      })
    })
  },

  changePassword: {
    body: Joi.object({
      currentPassword: Joi.string().required().messages({
        'any.required': 'Current password is required'
      }),
      newPassword: Joi.string().min(6).required().messages({
        'string.min': 'New password must be at least 6 characters long',
        'any.required': 'New password is required'
      }),
      confirmPassword: Joi.string().valid(Joi.ref('newPassword')).required().messages({
        'any.only': 'Passwords must match',
        'any.required': 'Password confirmation is required'
      })
    })
  }
};

// User validation schemas
const userSchemas = {
  create: {
    body: Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string().min(6).required(),
      role: Joi.string().valid('admin', 'entertainer').default('entertainer'),
      first_name: Joi.string().min(1).max(100).required(),
      last_name: Joi.string().min(1).max(100).required(),
      phone: Joi.string().pattern(/^[0-9\s\-\+\(\)]+$/).optional().allow(null, '')
    })
  },

  update: {
    params: Joi.object({
      id: Joi.string().uuid().required()
    }),
    body: Joi.object({
      email: Joi.string().email().optional(),
      role: Joi.string().valid('admin', 'entertainer').optional(),
      first_name: Joi.string().min(1).max(100).optional(),
      last_name: Joi.string().min(1).max(100).optional(),
      phone: Joi.string().pattern(/^[0-9\s\-\+\(\)]+$/).optional().allow(null, ''),
      is_active: Joi.boolean().optional()
    }).min(1)
  },

  getById: {
    params: Joi.object({
      id: Joi.string().uuid().required()
    })
  }
};

// UUID parameter validation
const uuidParam = {
  params: Joi.object({
    id: Joi.string().uuid().required().messages({
      'string.guid': 'Invalid ID format'
    })
  })
};

module.exports = {
  authSchemas,
  userSchemas,
  uuidParam
};
