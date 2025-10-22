const jwt = require('jsonwebtoken');
const jwtConfig = require('../config/jwt');
const { User } = require('../models');

class AuthService {
  /**
   * Generate access token
   */
  generateAccessToken(user) {
    const payload = {
      id: user.id,
      email: user.email,
      role: user.role
    };

    return jwt.sign(payload, jwtConfig.secret, {
      expiresIn: jwtConfig.expiresIn
    });
  }

  /**
   * Generate refresh token
   */
  generateRefreshToken(user) {
    const payload = {
      id: user.id,
      email: user.email
    };

    return jwt.sign(payload, jwtConfig.refreshSecret, {
      expiresIn: jwtConfig.refreshExpiresIn
    });
  }

  /**
   * Generate both tokens
   */
  generateTokens(user) {
    return {
      accessToken: this.generateAccessToken(user),
      refreshToken: this.generateRefreshToken(user)
    };
  }

  /**
   * Verify access token
   */
  verifyAccessToken(token) {
    try {
      return jwt.verify(token, jwtConfig.secret);
    } catch (error) {
      throw new Error('Invalid or expired access token');
    }
  }

  /**
   * Verify refresh token
   */
  verifyRefreshToken(token) {
    try {
      return jwt.verify(token, jwtConfig.refreshSecret);
    } catch (error) {
      throw new Error('Invalid or expired refresh token');
    }
  }

  /**
   * Login user
   */
  async login(email, password) {
    // Find user with password
    const user = await User.scope('withPassword').findOne({
      where: { email, is_active: true }
    });

    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Validate password
    const isPasswordValid = await user.validatePassword(password);
    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    // Generate tokens
    const tokens = this.generateTokens(user);

    // Return user without password and tokens
    return {
      user: user.toJSON(),
      ...tokens
    };
  }

  /**
   * Refresh access token
   */
  async refreshAccessToken(refreshToken) {
    // Verify refresh token
    const payload = this.verifyRefreshToken(refreshToken);

    // Get user
    const user = await User.findByPk(payload.id);
    if (!user || !user.is_active) {
      throw new Error('User not found or inactive');
    }

    // Generate new access token
    return this.generateAccessToken(user);
  }

  /**
   * Change password
   */
  async changePassword(userId, currentPassword, newPassword) {
    // Find user with password
    const user = await User.scope('withPassword').findByPk(userId);

    if (!user) {
      throw new Error('User not found');
    }

    // Validate current password
    const isPasswordValid = await user.validatePassword(currentPassword);
    if (!isPasswordValid) {
      throw new Error('Current password is incorrect');
    }

    // Update password
    user.password_hash = newPassword;
    await user.save();

    return true;
  }
}

module.exports = new AuthService();
