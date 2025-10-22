const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate } = require('../middleware/auth');
const { isAdmin, isAdminOrOwner } = require('../middleware/authorize');
const { validate } = require('../middleware/validate');
const { userSchemas } = require('../utils/validators');

// All routes require authentication
router.use(authenticate);

// GET /api/users/me - Get current user profile (must come before /:id)
router.get('/me', userController.getCurrentUser);

// GET /api/users/entertainers - Get entertainers (all authenticated users)
router.get('/entertainers', userController.getEntertainers);

// GET /api/users - Get all users (admin only)
router.get('/', isAdmin, userController.getAllUsers);

// GET /api/users/:id - Get user by ID (admin or owner)
router.get(
  '/:id',
  validate(userSchemas.getById),
  isAdminOrOwner((req) => req.params.id),
  userController.getUserById
);

// POST /api/users - Create new user (admin only)
router.post(
  '/',
  isAdmin,
  validate(userSchemas.create),
  userController.createUser
);

// PUT /api/users/:id - Update user (admin or owner)
router.put(
  '/:id',
  validate(userSchemas.update),
  isAdminOrOwner((req) => req.params.id),
  userController.updateUser
);

// PUT /api/users/:id/reactivate - Reactivate user (admin only)
router.put(
  '/:id/reactivate',
  isAdmin,
  validate(userSchemas.getById),
  userController.reactivateUser
);

// DELETE /api/users/:id - Deactivate user (admin only)
router.delete(
  '/:id',
  isAdmin,
  validate(userSchemas.getById),
  userController.deactivateUser
);

module.exports = router;
