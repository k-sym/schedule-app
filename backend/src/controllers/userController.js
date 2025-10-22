const userService = require('../services/userService');
const logger = require('../utils/logger');

class UserController {
  /**
   * Get all users
   * GET /api/users
   */
  async getAllUsers(req, res, next) {
    try {
      const includeInactive = req.query.includeInactive === 'true';
      const role = req.query.role;

      const users = await userService.getAllUsers({ includeInactive, role });

      res.json({
        success: true,
        data: users
      });
    } catch (error) {
      logger.error('Error getting users:', error);
      next(error);
    }
  }

  /**
   * Get user by ID
   * GET /api/users/:id
   */
  async getUserById(req, res, next) {
    try {
      const user = await userService.getUserById(req.params.id);

      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      if (error.message === 'User not found') {
        return res.status(404).json({
          success: false,
          error: error.message
        });
      }

      logger.error('Error getting user by ID:', error);
      next(error);
    }
  }

  /**
   * Get current user profile
   * GET /api/users/me
   */
  async getCurrentUser(req, res, next) {
    try {
      const user = await userService.getUserById(req.user.id);

      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      logger.error('Error getting current user:', error);
      next(error);
    }
  }

  /**
   * Create a new user
   * POST /api/users
   */
  async createUser(req, res, next) {
    try {
      const user = await userService.createUser(req.body);

      res.status(201).json({
        success: true,
        data: user
      });
    } catch (error) {
      if (error.message === 'User with this email already exists') {
        return res.status(400).json({
          success: false,
          error: error.message
        });
      }

      logger.error('Error creating user:', error);
      next(error);
    }
  }

  /**
   * Update a user
   * PUT /api/users/:id
   */
  async updateUser(req, res, next) {
    try {
      const user = await userService.updateUser(req.params.id, req.body);

      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      if (error.message === 'User not found') {
        return res.status(404).json({
          success: false,
          error: error.message
        });
      }

      if (error.message === 'User with this email already exists') {
        return res.status(400).json({
          success: false,
          error: error.message
        });
      }

      logger.error('Error updating user:', error);
      next(error);
    }
  }

  /**
   * Deactivate a user
   * DELETE /api/users/:id
   */
  async deactivateUser(req, res, next) {
    try {
      // Prevent users from deactivating themselves
      if (req.params.id === req.user.id) {
        return res.status(400).json({
          success: false,
          error: 'You cannot deactivate your own account'
        });
      }

      await userService.deactivateUser(req.params.id);

      res.json({
        success: true,
        message: 'User deactivated successfully'
      });
    } catch (error) {
      if (error.message === 'User not found') {
        return res.status(404).json({
          success: false,
          error: error.message
        });
      }

      logger.error('Error deactivating user:', error);
      next(error);
    }
  }

  /**
   * Reactivate a user
   * PUT /api/users/:id/reactivate
   */
  async reactivateUser(req, res, next) {
    try {
      await userService.reactivateUser(req.params.id);

      res.json({
        success: true,
        message: 'User reactivated successfully'
      });
    } catch (error) {
      if (error.message === 'User not found') {
        return res.status(404).json({
          success: false,
          error: error.message
        });
      }

      logger.error('Error reactivating user:', error);
      next(error);
    }
  }

  /**
   * Get entertainers only
   * GET /api/users/entertainers
   */
  async getEntertainers(req, res, next) {
    try {
      const includeInactive = req.query.includeInactive === 'true';
      const entertainers = await userService.getEntertainers(includeInactive);

      res.json({
        success: true,
        data: entertainers
      });
    } catch (error) {
      logger.error('Error getting entertainers:', error);
      next(error);
    }
  }
}

module.exports = new UserController();
