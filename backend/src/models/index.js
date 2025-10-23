const { Sequelize } = require('sequelize');
const config = require('../config/database');

const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: dbConfig.dialect,
    logging: dbConfig.logging,
    pool: dbConfig.pool,
    dialectOptions: dbConfig.dialectOptions
  }
);

// Import models
const User = require('./User')(sequelize);
const Area = require('./Area')(sequelize);
const Availability = require('./Availability')(sequelize);

// Define associations
if (Availability.associate) {
  Availability.associate({ User, Area, Availability });
}

const db = {
  sequelize,
  Sequelize,
  User,
  Area,
  Availability
};

module.exports = db;
