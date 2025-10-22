require('dotenv').config();

module.exports = {
  secret: process.env.JWT_SECRET || 'your_jwt_secret_here_change_in_production',
  refreshSecret: process.env.JWT_REFRESH_SECRET || 'your_jwt_refresh_secret_here_change_in_production',
  expiresIn: process.env.JWT_EXPIRES_IN || '15m',
  refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d'
};
