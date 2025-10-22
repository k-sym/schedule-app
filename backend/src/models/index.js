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

// Define associations here when needed
// User.hasMany(Booking);
// Area.hasMany(Booking);
// etc...

const db = {
  sequelize,
  Sequelize,
  User,
  Area
};

module.exports = db;
