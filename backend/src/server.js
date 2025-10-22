require('dotenv').config();
const app = require('./app');
const logger = require('./utils/logger');
const { sequelize } = require('./models');

const PORT = process.env.PORT || 3000;

// Test database connection
async function startServer() {
  try {
    await sequelize.authenticate();
    logger.info('Database connection established successfully');

    const server = app.listen(PORT, '0.0.0.0', () => {
      logger.info(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
    });

    return server;
  } catch (error) {
    logger.error('Unable to connect to the database:', error);
    process.exit(1);
  }
}

// Start server and handle graceful shutdown
startServer().then(server => {
  // Graceful shutdown
  const shutdown = async (signal) => {
    logger.info(`${signal} signal received: closing HTTP server`);
    server.close(async () => {
      logger.info('HTTP server closed');
      try {
        await sequelize.close();
        logger.info('Database connection closed');
        process.exit(0);
      } catch (error) {
        logger.error('Error closing database connection:', error);
        process.exit(1);
      }
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
});

module.exports = { app, startServer };
