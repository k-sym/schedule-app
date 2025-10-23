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
const Booking = require('./Booking')(sequelize);
const AreaRule = require('./areaRule')(sequelize);

// Define associations
const models = { User, Area, Availability, Booking, AreaRule };

if (Availability.associate) {
  Availability.associate(models);
}
if (Booking.associate) {
  Booking.associate(models);
}
if (Area.associate) {
  Area.associate(models);
}
if (AreaRule.associate) {
  AreaRule.associate(models);
}

const db = {
  sequelize,
  Sequelize,
  User,
  Area,
  Availability,
  Booking,
  AreaRule
};

module.exports = db;
