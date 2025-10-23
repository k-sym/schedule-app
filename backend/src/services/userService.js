const { User } = require('../models');

class UserService {
  /**
   * Get all users
   * @param {Object} options - Query options
   * @param {Boolean} options.includeInactive - Include inactive users
   * @param {String} options.role - Filter by role
   * @returns {Promise<Array>}
   */
  async getAllUsers(options = {}) {
    const { includeInactive = false, role = null } = options;

    const where = {};
    if (!includeInactive) {
      where.is_active = true;
    }
    if (role) {
      where.role = role;
    }

    const users = await User.findAll({
      where,
      order: [['name', 'ASC']]
    });

    return users;
  }

  /**
   * Get user by ID
   * @param {String} userId - User UUID
   * @returns {Promise<Object>}
   */
  async getUserById(userId) {
    const user = await User.findByPk(userId);

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }

  /**
   * Create a new user
   * @param {Object} userData - User data
   * @returns {Promise<Object>}
   */
  async createUser(userData) {
    // Check if user with same email already exists
    const existingUser = await User.findOne({
      where: { email: userData.email }
    });

    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Convert password to password_hash for the model
    if (userData.password) {
      userData.password_hash = userData.password;
      delete userData.password;
    }

    // Hash password before creating user (handled by User model hook)
    const user = await User.create(userData);

    return user;
  }

  /**
   * Update a user
   * @param {String} userId - User UUID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>}
   */
  async updateUser(userId, updateData) {
    const user = await this.getUserById(userId);

    // Check if email is being changed and already exists
    if (updateData.email && updateData.email !== user.email) {
      const existingUser = await User.findOne({
        where: { email: updateData.email }
      });

      if (existingUser) {
        throw new Error('User with this email already exists');
      }
    }

    // If password is being updated, it will be hashed by User model hook
    await user.update(updateData);
    return user;
  }

  /**
   * Deactivate a user (soft delete)
   * @param {String} userId - User UUID
   * @returns {Promise<void>}
   */
  async deactivateUser(userId) {
    const user = await this.getUserById(userId);

    // Soft delete by setting is_active to false
    await user.update({ is_active: false });
  }

  /**
   * Reactivate a user
   * @param {String} userId - User UUID
   * @returns {Promise<void>}
   */
  async reactivateUser(userId) {
    const user = await User.findByPk(userId);

    if (!user) {
      throw new Error('User not found');
    }

    await user.update({ is_active: true });
  }

  /**
   * Get entertainers only
   * @param {Boolean} includeInactive - Include inactive users
   * @returns {Promise<Array>}
   */
  async getEntertainers(includeInactive = false) {
    return this.getAllUsers({ includeInactive, role: 'entertainer' });
  }
}

module.exports = new UserService();
