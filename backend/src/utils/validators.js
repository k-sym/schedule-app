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
      name: Joi.string().min(1).max(200).required(),
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
      name: Joi.string().min(1).max(200).optional(),
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

// Area validation schemas
const areaSchemas = {
  create: {
    body: Joi.object({
      name: Joi.string().min(1).max(100).required().messages({
        'string.empty': 'Area name cannot be empty',
        'string.max': 'Area name must not exceed 100 characters',
        'any.required': 'Area name is required'
      }),
      display_order: Joi.number().integer().min(0).default(0),
      operating_hours: Joi.object().optional().allow(null),
      capacity: Joi.number().integer().min(1).optional().allow(null),
      notes: Joi.string().optional().allow(null, ''),
      abbreviation: Joi.string().min(1).max(3).optional().allow(null, '').messages({
        'string.max': 'Abbreviation must not exceed 3 characters',
        'string.min': 'Abbreviation must be at least 1 character'
      }),
      is_active: Joi.boolean().default(true)
    })
  },

  update: {
    params: Joi.object({
      id: Joi.string().uuid().required()
    }),
    body: Joi.object({
      name: Joi.string().min(1).max(100).optional(),
      display_order: Joi.number().integer().min(0).optional(),
      operating_hours: Joi.object().optional().allow(null),
      capacity: Joi.number().integer().min(1).optional().allow(null),
      notes: Joi.string().optional().allow(null, ''),
      abbreviation: Joi.string().min(1).max(3).optional().allow(null, '').messages({
        'string.max': 'Abbreviation must not exceed 3 characters',
        'string.min': 'Abbreviation must be at least 1 character'
      }),
      is_active: Joi.boolean().optional()
    }).min(1)
  },

  reorder: {
    body: Joi.object({
      areas: Joi.array().items(
        Joi.object({
          id: Joi.string().uuid().required(),
          display_order: Joi.number().integer().min(0).required()
        })
      ).min(1).required()
    })
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
  areaSchemas,
  uuidParam
};
