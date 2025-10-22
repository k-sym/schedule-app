const authService = require('../services/authService');
const logger = require('../utils/logger');

class AuthController {
  /**
   * Login endpoint
   * POST /api/auth/login
   */
  async login(req, res) {
    try {
      const { email, password } = req.body;

      const result = await authService.login(email, password);

      logger.info(`User logged in: ${email}`);

      res.json({
        message: 'Login successful',
        user: result.user,
        accessToken: result.accessToken,
        refreshToken: result.refreshToken
      });
    } catch (error) {
      logger.error('Login error:', error);
      res.status(401).json({ error: error.message });
    }
  }

  /**
   * Refresh token endpoint
   * POST /api/auth/refresh
   */
  async refresh(req, res) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(400).json({ error: 'Refresh token is required' });
      }

      const accessToken = await authService.refreshAccessToken(refreshToken);

      res.json({
        message: 'Token refreshed successfully',
        accessToken
      });
    } catch (error) {
      logger.error('Token refresh error:', error);
      res.status(401).json({ error: error.message });
    }
  }

  /**
   * Logout endpoint
   * POST /api/auth/logout
   */
  async logout(req, res) {
    try {
      // In a stateless JWT system, logout is handled client-side by removing tokens
      // In future, we could implement token blacklisting if needed
      logger.info(`User logged out: ${req.user?.email || 'unknown'}`);

      res.json({ message: 'Logout successful' });
    } catch (error) {
      logger.error('Logout error:', error);
      res.status(500).json({ error: 'Logout failed' });
    }
  }

  /**
   * Change password endpoint
   * POST /api/auth/change-password
   */
  async changePassword(req, res) {
    try {
      const { currentPassword, newPassword } = req.body;
      const userId = req.user.id;

      await authService.changePassword(userId, currentPassword, newPassword);

      logger.info(`Password changed for user: ${req.user.email}`);

      res.json({ message: 'Password changed successfully' });
    } catch (error) {
      logger.error('Change password error:', error);
      res.status(400).json({ error: error.message });
    }
  }
}

module.exports = new AuthController();
